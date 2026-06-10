'use client';

import { MOCK_STATE, type DashboardState, type SizedEdge, type TokenEdge, type TokenMarket } from '@/lib/bridge-types';
import {
  fmtUsd,
  fmtPct,
  fmtNumber,
  shortenAddr,
  shortenTxid,
  timeAgo,
  fmtUptime,
  directionLabel,
} from '@/lib/bridge-format';
import { useEffect, useState } from 'react';

// ---- Hero ------------------------------------------------------------------

function BridgeHero({ state }: { state: DashboardState }) {
  const live = state.config.live && state.config.autoSign;
  // Convergence headline: average across tokens of how much the recent (~1h)
  // spread is tighter than the longer-window (~24h) baseline. Negative values
  // are good — they mean the spread shrank.
  const summary = state.spreadHistory?.summary;
  const deltaBps = summary ? Object.values(summary.deltaBps) : [];
  const avgDeltaBps =
    deltaBps.length > 0
      ? deltaBps.reduce((s, x) => s + x, 0) / deltaBps.length
      : null;
  const convergenceLabel =
    avgDeltaBps === null
      ? 'gathering data…'
      : avgDeltaBps <= -1
        ? `${Math.abs(avgDeltaBps).toFixed(0)} bps tighter`
        : avgDeltaBps >= 1
          ? `${avgDeltaBps.toFixed(0)} bps wider`
          : 'holding steady';
  const convergenceColor: 'positive' | 'negative' | undefined =
    avgDeltaBps === null
      ? undefined
      : avgDeltaBps <= -1
        ? 'positive'
        : avgDeltaBps >= 1
          ? 'negative'
          : undefined;
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/100 z-0" />
      <div className="relative z-content w-full max-w-5xl text-center">
        {/* Status badge */}
        <div className="inline-block mb-8">
          <span
            className={`inline-flex items-center gap-2 px-5 py-2 border-3 border-wizard-black rounded-[18px_5px_18px_5px] font-derp text-lg -rotate-2 shadow-[3px_3px_0_#040104] ${
              live ? 'bg-wizard-highlight' : 'bg-bitcoin-orange'
            }`}
          >
            <span className="animate-pulse">🧙</span>
            <span>{live ? 'WIZARD ON DUTY' : 'WIZARD RESTING'}</span>
            <span className="text-sm">·</span>
            <span className="text-base">
              uptime {fmtUptime(state.totals.uptimeSec)}
            </span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-derp text-wizard-black leading-tight">
          <span className="inline-block -rotate-2">The</span>{' '}
          <span className="inline-block rotate-1 text-bitcoin-orange drop-shadow-[2px_2px_0_#040104]">
            Wizard
          </span>
        </h1>
        <h2 className="mt-2 text-2xl md:text-3xl font-derp text-wizard-blue drop-shadow-[2px_2px_0_#040104] rotate-1">
          ✨ a Magic Internet Money creation ✨
        </h2>

        {/* Subtitle */}
        <p className="mt-8 text-xl md:text-2xl font-caveat text-wizard-text max-w-2xl mx-auto leading-snug">
          Autonomous market-keeper for{' '}
          <strong>$MIM</strong> and <strong>$DOG</strong>. Captures
          cross-venue spread, turns it into{' '}
          <strong className="text-glitch-magenta">burned $MIM</strong>. On chain.
        </p>

        {/* Headline numbers — these measure ecosystem service, not operator P&L. */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Stat
            label="$MIM Burned 🔥"
            value={(state.totals.mimBurned ?? 0).toLocaleString()}
            rotate="-rotate-2"
            color="positive"
          />
          <Stat
            label="Cycles Closed"
            value={`${state.totals.firesComplete}`}
            rotate="rotate-1"
          />
          <Stat
            label="Bridged Volume"
            value={fmtUsd(state.totals.bridgedVolumeUsd ?? 0)}
            rotate="-rotate-1"
          />
          <Stat
            label="Spread (1h vs 24h)"
            value={convergenceLabel}
            rotate="rotate-2"
            color={convergenceColor}
          />
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#live"
            className="px-8 py-4 bg-bitcoin-orange text-wizard-black border-4 border-wizard-black rounded-[20px_5px_20px_5px] text-2xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-magic-yellow transition-all shadow-[4px_4px_0_#040104]"
          >
            Watch The Magic
          </a>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  rotate,
  color,
}: {
  label: string;
  value: string;
  rotate: string;
  color?: 'positive' | 'negative';
}) {
  const colorClass =
    color === 'positive'
      ? 'text-wizard-highlight'
      : color === 'negative'
        ? 'text-glitch-magenta'
        : 'text-wizard-black';
  return (
    <div
      className={`bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-4 ${rotate} hover:rotate-0 hover:scale-105 transition-all`}
    >
      <div className="font-caveat text-base text-wizard-text">{label}</div>
      <div className={`font-derp text-2xl md:text-3xl ${colorClass}`}>
        {value}
      </div>
    </div>
  );
}

// ---- SpreadVsThresholdChart -----------------------------------------------
//
// Ported verbatim from /wizard-v2 page. Visualizes WHEN and WHERE prices need
// to be for the wizard to fire.
//
// X axis: time (last ~6h of bucketed spread data, 5-min buckets).
// Y axis: |gross spread| in basis points (positive only; the daemon fires
//         on EITHER direction so we plot the absolute gap).
//
// Two horizontal reference lines:
//   - Fire threshold (orange dashed): the wizard fires when |spread| > this.
//                                     = breakevenBps + edgeThresholdPct*100
//   - Breakeven (gray dotted, lighter): where fees equal the spread.
//
// Two animated polylines (one per token: MIM in cyan, DOG in blue) plot the
// recent gross spreads at each 5-min bucket.
//
// Markers: dots on the line at the precise (time, spread) point for each
// fire. The viewer sees "the line crossed above the orange dashed line and
// the wizard fired at that exact moment."

function SpreadVsThresholdChart({ state }: { state: DashboardState }) {
  const sh = state.spreadHistory;
  if (!sh || sh.buckets.length < 2) {
    return null;
  }

  // Filter to the last 6 hours so the chart shows recent action.
  const cutoffMs = Date.now() - 6 * 60 * 60 * 1000;
  const buckets = sh.buckets.filter(
    (b) => new Date(b.at).getTime() >= cutoffMs,
  );
  if (buckets.length < 2) return null;

  const tokens = Array.from(
    new Set(buckets.flatMap((b) => Object.keys(b.perToken))),
  );
  const TOKEN_COLORS: Record<string, string> = {
    MIM: '#00d4d4', // wizard-cyan-ish
    DOG: '#0066cc', // wizard-blue-ish
  };

  // Compute Y-axis range. Floor at 0 (we plot |spread|); ceiling = max of
  // (max observed, threshold, breakeven) plus 20% headroom so the lines
  // never get cropped.
  const breakevenBps = sh.summary.breakevenBps ?? 330;
  const fireThresholdBps =
    breakevenBps + (state.config.edgeThresholdPct ?? 0) * 100;
  const allValues = buckets.flatMap((b) =>
    Object.values(b.perToken).map((v) => Math.abs(v)),
  );
  const yMax =
    Math.ceil(
      Math.max(...allValues, breakevenBps, fireThresholdBps) * 1.2 / 50,
    ) * 50;
  const yMin = 0;
  const yRange = yMax - yMin || 1;

  // Chart dimensions.
  const width = 760;
  const height = 320;
  const padTop = 16;
  const padBottom = 36;
  const padLeft = 56;
  const padRight = 80;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const xForIndex = (i: number) =>
    padLeft + (i / (buckets.length - 1)) * plotWidth;
  const yForBps = (bps: number) =>
    padTop + plotHeight - ((bps - yMin) / yRange) * plotHeight;

  // Build polylines per token.
  const lines: Array<{ token: string; color: string; points: string }> =
    tokens.map((token) => {
      const points = buckets
        .map((b, i) => {
          const raw = b.perToken[token];
          if (typeof raw !== 'number') return null;
          return `${xForIndex(i).toFixed(1)},${yForBps(
            Math.abs(raw),
          ).toFixed(1)}`;
        })
        .filter((p): p is string => p !== null)
        .join(' ');
      return { token, color: TOKEN_COLORS[token] ?? '#444444', points };
    });

  // Locate fires inside the visible window. Match token + nearest bucket by
  // time so we can draw a dot at (time, observed spread).
  const fires = (state.recentFires ?? []).filter((f) => {
    const t = new Date(f.createdAt).getTime();
    return (
      t >= cutoffMs &&
      (f.status === 'complete' ||
        f.status === 'pending_kraken_deposit' ||
        f.status === 'pending_dotswap')
    );
  });
  const fireMarkers: Array<{
    x: number;
    y: number;
    token: string;
    color: string;
  }> = [];
  for (const f of fires) {
    const t = new Date(f.createdAt).getTime();
    // Nearest bucket index by time.
    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < buckets.length; i++) {
      const d = Math.abs(new Date(buckets[i]!.at).getTime() - t);
      if (d < bestDelta) {
        bestDelta = d;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) continue;
    const raw = buckets[bestIdx]!.perToken[f.token];
    if (typeof raw !== 'number') continue;
    fireMarkers.push({
      x: xForIndex(bestIdx),
      y: yForBps(Math.abs(raw)),
      token: f.token,
      color: TOKEN_COLORS[f.token] ?? '#000',
    });
  }

  // Y-axis ticks (every 50bps).
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += 50) ticks.push(v);

  // X-axis time labels (first, midpoint, last).
  const labelTimes = [
    0,
    Math.floor(buckets.length / 2),
    buckets.length - 1,
  ].map((i) => buckets[i]!.at);
  const labelHours = labelTimes.map((ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  });

  return (
    <section className="relative px-4 py-12 bg-white/85">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          The Fire Line
        </h2>
        <p className="text-center font-caveat text-lg md:text-xl text-wizard-text mb-2 max-w-2xl mx-auto">
          The wizard fires when the price gap between Kraken and DotSwap
          gets big enough to clear fees.
        </p>
        <p className="text-center font-caveat text-base text-wizard-beard mb-8 max-w-2xl mx-auto">
          Above the{' '}
          <span className="text-bitcoin-orange font-bold">
            orange dashed line
          </span>{' '}
          = wizard wants to fire. The dots mark the moments it actually
          did.
        </p>

        <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-4 md:p-6">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Y-axis ticks + grid lines */}
            {ticks.map((bps) => (
              <g key={bps}>
                <line
                  x1={padLeft}
                  y1={yForBps(bps)}
                  x2={width - padRight}
                  y2={yForBps(bps)}
                  stroke="#e8e3d5"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={yForBps(bps) + 4}
                  textAnchor="end"
                  className="fill-wizard-beard"
                  style={{ font: '12px Caveat, cursive' }}
                >
                  {bps} bps
                </text>
              </g>
            ))}

            {/* Breakeven line */}
            <line
              x1={padLeft}
              y1={yForBps(breakevenBps)}
              x2={width - padRight}
              y2={yForBps(breakevenBps)}
              stroke="#888"
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
            <text
              x={width - padRight + 6}
              y={yForBps(breakevenBps) + 4}
              className="fill-wizard-beard"
              style={{ font: '13px Caveat, cursive' }}
            >
              breakeven
            </text>

            {/* Fire-threshold line */}
            <line
              x1={padLeft}
              y1={yForBps(fireThresholdBps)}
              x2={width - padRight}
              y2={yForBps(fireThresholdBps)}
              stroke="#f7931a"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text
              x={width - padRight + 6}
              y={yForBps(fireThresholdBps) + 4}
              className="fill-bitcoin-orange"
              style={{
                font: '14px Caveat, cursive',
                fontWeight: 700,
              }}
            >
              fire threshold
            </text>

            {/* Token lines */}
            {lines.map(({ token, color, points }) => (
              <polyline
                key={token}
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            ))}

            {/* Fire markers */}
            {fireMarkers.map((m, i) => (
              <g key={i}>
                <circle
                  cx={m.x}
                  cy={m.y}
                  r="7"
                  fill="#ffffff"
                  stroke={m.color}
                  strokeWidth="3"
                />
                <circle cx={m.x} cy={m.y} r="3" fill={m.color} />
              </g>
            ))}

            {/* X-axis time labels */}
            {labelHours.map((h, i) => {
              const idx = [
                0,
                Math.floor(buckets.length / 2),
                buckets.length - 1,
              ][i]!;
              const x = xForIndex(idx);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 12}
                  textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
                  className="fill-wizard-beard"
                  style={{ font: '12px Caveat, cursive' }}
                >
                  {h}
                </text>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center items-center font-caveat text-base">
            {lines.map(({ token, color }) => (
              <span key={token} className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-1"
                  style={{ backgroundColor: color }}
                />
                <strong>${token}</strong>
              </span>
            ))}
            <span className="flex items-center gap-2 text-wizard-beard">
              <span className="inline-block w-6 h-1 border-t-2 border-dashed border-bitcoin-orange" />
              fire threshold
            </span>
            <span className="flex items-center gap-2 text-wizard-beard">
              <span className="inline-block w-6 h-1 border-t-2 border-dotted border-gray-500" />
              breakeven
            </span>
            <span className="flex items-center gap-2 text-wizard-beard">
              <span className="inline-block w-3 h-3 rounded-full bg-white border-2 border-wizard-black" />
              fired
            </span>
          </div>
        </div>

        <p className="text-center font-caveat text-sm text-wizard-beard mt-4 max-w-2xl mx-auto">
          Last 6 hours, updated every 30 seconds. Fire threshold =
          breakeven minus the operator&apos;s convergence subsidy
          (currently{' '}
          {Math.abs((state.config.edgeThresholdPct ?? 0) * 100).toFixed(0)}{' '}
          bps).
        </p>
      </div>
    </section>
  );
}

// ---- Live edge cards -------------------------------------------------------

function LiveEdgeSection({ state }: { state: DashboardState }) {
  return (
    <section
      id="live"
      className="relative px-4 py-16 bg-gradient-to-b from-white/95 to-white/85"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          What the Wizard Sees
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          Live cross-venue prices. Snapshot {timeAgo(state.capturedAt)}.
        </p>

        {/* Agent-state banner: explains why the bot is/isn't firing right now */}
        <AgentStateBanner state={state} />

        <div className="grid md:grid-cols-2 gap-6">
          {state.edges.map((edge) => (
            <EdgeCard key={edge.token} edge={edge} threshold={state.config.edgeThresholdPct} />
          ))}
        </div>

        {/* Market context strip */}
        <div className="mt-10 bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-caveat text-lg text-wizard-text">
          <span>
            <strong>BTC</strong>: ${fmtNumber(state.market.btcUsd, { decimals: 2 })}
          </span>
          <span className="text-wizard-beard">·</span>
          <span>
            <strong>L1 fee</strong>: {state.market.btcFeeRate?.fastestFee ?? '?'} sat/vB
          </span>
          <span className="text-wizard-beard">·</span>
          <span>
            <strong>Max trade</strong>: ${state.config.maxTradeUsd}
          </span>
        </div>

        {/* Spread convergence panel — the ecosystem-health view */}
        {state.spreadHistory && (
          <SpreadConvergencePanel
            summary={state.spreadHistory.summary}
            buckets={state.spreadHistory.buckets}
          />
        )}
      </div>
    </section>
  );
}

// ---- Agent state banner ----------------------------------------------------
//
// Surfaces an interpretive headline above the live edge cards so a casual
// viewer doesn't have to decode bps math to understand why the bot is or
// isn't firing. Four states, in priority order:
//
//   HUNTING           — at least one current sized edge has net P&L above
//                       the configured threshold. The wizard wants to fire.
//   INVENTORY_STARVED — the wizard sees positive net edge but can't deploy
//                       because the relevant inventory side (most commonly
//                       USD on Kraken) is below the minimum trade size.
//                       This is REAL — easily 30%+ of cycles in tight
//                       markets land here, and viewers deserve honesty
//                       about it rather than a "we're just patient" story.
//   CONVERGED         — recent (1h) gross spreads have narrowed materially
//                       from the 24h baseline AND we're not inventory-
//                       starved AND no edge is currently available. The
//                       bot participated in closing the gap.
//   WAITING           — net edge below threshold, inventory is healthy,
//                       the market is quiet. Skipping is correct.
//
// Earlier versions of this banner trumpeted "edge available 14h 58m" based
// on the gross-spread minutesAboveBreakeven stat. That number was wrong as
// a fire-availability indicator because (a) it's gross, not net, and (b)
// it ignored inventory constraints. We replaced it with honest signals.

function AgentStateBanner({ state }: { state: DashboardState }) {
  const summary = state.spreadHistory?.summary;
  // No history yet (fresh daemon): show a minimal placeholder, no claims.
  if (!summary) {
    return (
      <div className="mb-10 bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 -rotate-[0.3deg]">
        <div className="font-derp text-2xl text-wizard-black">
          Warming up…
        </div>
        <p className="font-caveat text-base text-wizard-text mt-1">
          Building spread history. Decisions will surface here once the
          wizard has watched the market for a bit.
        </p>
      </div>
    );
  }

  // ---- Step 1: detect live net-edge hunting state -------------------------
  //
  // A sized edge with netPct >= edgeThreshold means the current snapshot
  // has profitable cross-venue spread NET of all fees. This is more honest
  // than the gross-spread-based summary.recentBps for "would the bot fire
  // right now."
  //
  // IMPORTANT: both netPct and edgeThresholdPct are already in PERCENT
  // units (e.g. -0.76 means -0.76%, not -76%). Compare them directly;
  // do NOT multiply by 100. (The EdgeCard component below uses the same
  // convention.)
  const edgeThresholdPct = state.config.edgeThresholdPct;
  const tokensWithEdge: string[] = [];
  for (const edge of state.edges) {
    const bestSized = edge.sized.reduce<typeof edge.sized[number] | null>(
      (best, s) => (best === null || s.netPct > best.netPct ? s : best),
      null,
    );
    if (bestSized && bestSized.netPct >= edgeThresholdPct) {
      tokensWithEdge.push(edge.token);
    }
  }
  const hunting = tokensWithEdge.length > 0;

  // ---- Step 2: detect inventory starvation --------------------------------
  //
  // The most common starvation pattern: USD on Kraken drops below the
  // smallest probe size, blocking every buy_kraken_sell_dotswap cycle even
  // when edge exists. We flag it whenever USD < $100 (the smallest ladder
  // rung) AND we have meaningful inventory elsewhere on Kraken (so it's a
  // distribution problem, not a "the bot is broke" problem).
  const krakenUsdRow = state.inventory.kraken.find((r) => r.asset === 'USD');
  const krakenUsdValue = krakenUsdRow?.usdValue ?? 0;
  const krakenNonUsdValue = state.inventory.kraken
    .filter((r) => r.asset !== 'USD' && r.asset !== 'USDC')
    .reduce((s, r) => s + r.usdValue, 0);
  const inventoryStarved =
    !hunting &&
    krakenUsdValue < 100 &&
    krakenNonUsdValue >= 200;

  // ---- Step 3: convergence vs baseline (only meaningful if not starved) ---
  const tokens = Object.keys(summary.recentBps);
  const convergedDelta =
    tokens.reduce((sum, t) => {
      const r = Math.abs(summary.recentBps[t] ?? 0);
      const b = Math.abs(summary.baselineBps[t] ?? 0);
      return sum + (b - r);
    }, 0) / Math.max(1, tokens.length);

  const converged = !hunting && !inventoryStarved && convergedDelta >= 50;

  // ---- Step 4: last fire timestamp ----------------------------------------
  const lastFire =
    state.recentFires.length > 0
      ? state.recentFires.reduce((latest, f) =>
          new Date(f.createdAt).getTime() > new Date(latest.createdAt).getTime()
            ? f
            : latest,
        )
      : null;
  const sinceLastFire = lastFire ? humanizeSince(lastFire.createdAt) : null;

  // ---- Step 5: pick state-specific copy -----------------------------------
  let label: string;
  let labelClass: string;
  let headline: string;
  let body: string;
  if (hunting) {
    label = 'HUNTING';
    labelClass = 'bg-wizard-highlight text-wizard-black';
    headline = `Edge spotted on ${tokensWithEdge.join(' & ')}.`;
    body =
      'At least one venue pair currently has net edge above threshold. ' +
      'The wizard is probing sizes for the next arb.';
  } else if (inventoryStarved) {
    label = 'INVENTORY-STARVED';
    labelClass = 'bg-magic-yellow text-wizard-black';
    headline = `Edge appears, but USD on Kraken is low ($${krakenUsdValue.toFixed(0)}).`;
    body =
      'Working capital is stuck in the wrong format on the wrong side. ' +
      'The wizard sees positive net edge in some cycles but can\u2019t fire ' +
      'because the buy-Kraken direction needs at least $100 of USD on Kraken. ' +
      'Auto-rebalance currently only handles BTC; converting other holdings ' +
      'back to USD is a manual step (and a known improvement on the roadmap).';
  } else if (converged) {
    label = 'CONVERGED';
    labelClass = 'bg-wizard-blue text-white';
    headline = `Spreads tightened ~${Math.round(convergedDelta)} bps from baseline.`;
    body =
      'Recent spreads have narrowed materially from the 24-hour baseline. ' +
      'The wizard participated in closing the gap; the market is now ' +
      'efficient enough that further trades would be unprofitable.';
  } else {
    label = 'WAITING';
    labelClass = 'bg-magic-yellow text-wizard-black';
    headline = 'No net edge right now. The wizard is waiting.';
    body =
      'After fees, every venue pair is currently below the firing threshold. ' +
      'Firing into a tight spread would bleed fees. The wizard does nothing ' +
      'until the spread widens.';
  }

  return (
    <div className="mb-10 bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 -rotate-[0.3deg]">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-[6px_2px_6px_2px] border-2 border-wizard-black font-derp text-sm tracking-wider ${labelClass}`}
          >
            {label}
          </span>
          <div className="font-derp text-2xl md:text-3xl text-wizard-black">
            {headline}
          </div>
        </div>
        {sinceLastFire && (
          <div className="font-caveat text-sm text-wizard-beard whitespace-nowrap">
            last fire {sinceLastFire} ago
          </div>
        )}
      </div>
      <p className="font-caveat text-base md:text-lg text-wizard-text">
        {body}
      </p>

      {/* Supporting stats — shown for all non-HUNTING states so viewers can
          see the supporting evidence for whatever state we're in. */}
      {!hunting && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-caveat text-wizard-text">
          <div className="border-2 border-wizard-black rounded-[8px_3px_8px_3px] p-3 bg-[#fbfbf5]">
            <div className="text-wizard-beard">USD on Kraken</div>
            <div
              className={`font-mono text-base ${
                inventoryStarved ? 'text-glitch-magenta' : 'text-wizard-black'
              }`}
            >
              ${krakenUsdValue.toFixed(2)}
            </div>
            <div className="text-xs text-wizard-beard mt-0.5">
              needed for buy-Kraken arbs (min ladder rung is $100)
            </div>
          </div>
          <div className="border-2 border-wizard-black rounded-[8px_3px_8px_3px] p-3 bg-[#fbfbf5]">
            <div className="text-wizard-beard">net edge right now</div>
            <div className="font-mono text-wizard-black text-base">
              {state.edges
                .map((e) => {
                  // netPct is already in percent units (e.g. -0.76 = -0.76%).
                  const best = e.sized.reduce<typeof e.sized[number] | null>(
                    (b, s) => (b === null || s.netPct > b.netPct ? s : b),
                    null,
                  );
                  return best
                    ? `${e.token}: ${best.netPct.toFixed(2)}%`
                    : `${e.token}: —`;
                })
                .join('  ·  ')}
            </div>
            <div className="text-xs text-wizard-beard mt-0.5">
              best sized direction, net of all fees
            </div>
          </div>
          <div className="border-2 border-wizard-black rounded-[8px_3px_8px_3px] p-3 bg-[#fbfbf5]">
            <div className="text-wizard-beard">spread vs baseline (24h)</div>
            <div
              className={`font-mono text-base ${
                convergedDelta >= 50
                  ? 'text-wizard-highlight'
                  : convergedDelta <= -50
                    ? 'text-glitch-magenta'
                    : 'text-wizard-black'
              }`}
            >
              {convergedDelta >= 0 ? '−' : '+'}
              {Math.round(Math.abs(convergedDelta))} bps
            </div>
            <div className="text-xs text-wizard-beard mt-0.5">
              avg change in spread magnitude (negative = tightened)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Humanize "time since" — short form for header use.
function humanizeSince(iso: string): string {
  const then = new Date(iso).getTime();
  const ms = Date.now() - then;
  const min = Math.floor(ms / 60000);
  if (min < 1) return '< 1m';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

// ---- Spread convergence panel ----------------------------------------------

function SpreadConvergencePanel({
  summary,
  buckets,
}: {
  summary: DashboardState['spreadHistory'] extends infer T
    ? T extends { summary: infer S }
      ? S
      : never
    : never;
  buckets: DashboardState['spreadHistory'] extends infer T
    ? T extends { buckets: infer B }
      ? B
      : never
    : never;
}) {
  const tokens = Object.keys(summary.recentBps);
  return (
    <div className="mt-6 bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5">
      <div className="font-derp text-xl text-wizard-black mb-1 -rotate-[0.5deg]">
        Spread Convergence
      </div>
      <p className="font-caveat text-base text-wizard-text mb-4">
        The wizard&apos;s job is to make these two venues agree on price.
        Smaller numbers mean tighter spreads.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {tokens.map((tok) => {
          const recent = summary.recentBps[tok] ?? 0;
          const baseline = summary.baselineBps[tok] ?? 0;
          const delta = summary.deltaBps[tok] ?? 0;
          const series = buckets
            .map((b) => b.perToken[tok])
            .filter((v): v is number => typeof v === 'number');
          return (
            <div
              key={tok}
              className="border-2 border-wizard-black rounded-[10px_3px_10px_3px] p-4 bg-[#fbfbf5]"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-derp text-2xl text-wizard-black">
                  ${tok}
                </span>
                <span
                  className={`font-derp text-base ${
                    delta <= -1
                      ? 'text-wizard-highlight'
                      : delta >= 1
                        ? 'text-glitch-magenta'
                        : 'text-wizard-text'
                  }`}
                >
                  {delta <= -1
                    ? `↓ ${Math.abs(delta).toFixed(0)} bps`
                    : delta >= 1
                      ? `↑ ${delta.toFixed(0)} bps`
                      : 'steady'}
                </span>
              </div>
              <Sparkline values={series} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-caveat text-wizard-text">
                <div>
                  <div className="text-wizard-beard">last ~1h</div>
                  <div className="font-mono text-wizard-black text-base">
                    {formatBps(recent)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-wizard-beard">last ~24h</div>
                  <div className="font-mono text-wizard-black text-base">
                    {formatBps(baseline)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatBps(bps: number): string {
  const abs = Math.abs(bps);
  if (abs < 1) return `${bps.toFixed(2)} bps`;
  return `${Math.round(bps)} bps`;
}

/**
 * Tiny inline sparkline. Renders an SVG polyline of the values; auto-scales
 * vertically. Returns null if there aren't enough points to draw something
 * meaningful (< 2).
 */
function Sparkline({
  values,
  width = 240,
  height = 36,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return (
      <div className="text-xs font-caveat text-wizard-beard italic h-9 flex items-center">
        building history…
      </div>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pts = values
    .map((v, i) => {
      const x = (i * stepX).toFixed(1);
      const y = (height - ((v - min) / range) * height).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
  // Zero line for visual reference (only if 0 is inside the range).
  const zeroLineY =
    min <= 0 && max >= 0 ? (height - ((0 - min) / range) * height).toFixed(1) : null;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full"
      preserveAspectRatio="none"
    >
      {zeroLineY !== null && (
        <line
          x1="0"
          y1={zeroLineY}
          x2={width}
          y2={zeroLineY}
          stroke="#cdc7b5"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
      <polyline
        fill="none"
        stroke="#040104"
        strokeWidth="1.5"
        points={pts}
      />
    </svg>
  );
}

/**
 * One-line plain-English summary of which venue is richer and which direction
 * the wizard would therefore trade. The grossSpreadPct on the edge is signed
 * relative to (kraken - dotswap) / dotswap, so:
 *   positive  -> Kraken richer, wizard buys DotSwap & sells Kraken
 *   negative  -> DotSwap richer, wizard buys Kraken & sells DotSwap
 */
function SpreadExplainer({
  edge,
  bestDirection,
}: {
  edge: TokenEdge;
  bestDirection: SizedEdge['direction'];
}) {
  const gross = edge.grossSpreadPct;
  const abs = Math.abs(gross);
  const krakenRicher = gross > 0;
  // Match the rich/cheap framing to the wizard's chosen direction, so a user
  // can read these two lines together and they always agree.
  const wizardLine =
    bestDirection === 'buy_dotswap_sell_kraken'
      ? 'wizard buys DotSwap, sells Kraken'
      : 'wizard buys Kraken, sells DotSwap';
  return (
    <div className="font-caveat text-base text-wizard-text leading-snug">
      <div>
        gross spread{' '}
        <strong className="font-mono">{fmtPct(abs)}</strong>{' '}
        <span className="text-wizard-beard">·</span>{' '}
        <span>
          <strong
            className={
              krakenRicher ? 'text-bitcoin-orange' : 'text-wizard-blue'
            }
          >
            {krakenRicher ? 'Kraken' : 'DotSwap'}
          </strong>{' '}
          is richer than{' '}
          <strong
            className={
              krakenRicher ? 'text-wizard-blue' : 'text-bitcoin-orange'
            }
          >
            {krakenRicher ? 'DotSwap' : 'Kraken'}
          </strong>
        </span>
      </div>
      <div className="text-wizard-beard text-sm">
        → {wizardLine}. Net of fees at execution size:
      </div>
    </div>
  );
}

function EdgeCard({ edge, threshold }: { edge: TokenEdge; threshold: number }) {
  // Find the best (max-net-USD) sized edge to highlight
  const best = edge.sized.reduce((a, b) => (b.netUsd > a.netUsd ? b : a), edge.sized[0]!);
  const canFire = best.netPct >= threshold;

  return (
    <div
      className={`bg-white border-3 border-wizard-black rounded-[18px_5px_18px_5px] shadow-[4px_4px_0_#040104] p-6 -rotate-[0.5deg] hover:rotate-0 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-derp text-4xl text-wizard-black">${edge.token}</h3>
        <span
          className={`px-3 py-1 border-2 border-wizard-black rounded-[10px_3px_10px_3px] font-derp text-sm rotate-2 ${
            canFire
              ? 'bg-wizard-highlight text-wizard-black animate-pulse'
              : 'bg-wizard-beard text-wizard-black'
          }`}
        >
          {canFire ? '✨ CAST SPELL' : '😴 HOLD'}
        </span>
      </div>

      {/* Venue prices grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <VenueBox
          venue="Kraken"
          venueColor="bitcoin-orange"
          rows={[
            { label: 'bid', value: fmtNumber(edge.kraken.bid, { decimals: 7 }) },
            { label: 'ask', value: fmtNumber(edge.kraken.ask, { decimals: 7 }) },
          ]}
        />
        <VenueBox
          venue="DotSwap"
          venueColor="wizard-blue"
          rows={[
            {
              label: 'price (USD)',
              value: fmtNumber(edge.dotswap.usdPerToken, { decimals: 7 }),
            },
            {
              label: 'pool',
              value: `${fmtNumber(edge.dotswap.reserves.token, { compact: true })} / ${edge.dotswap.reserves.btc.toFixed(3)} ₿`,
            },
          ]}
        />
      </div>

      {/* Gross + sized table */}
      <div className="bg-[#f5f5f0] border-2 border-wizard-black rounded-[10px_3px_10px_3px] p-3">
        <SpreadExplainer edge={edge} bestDirection={best.direction} />
        <table className="w-full font-mono text-sm mt-2">
          <thead>
            <tr className="text-wizard-text border-b border-wizard-beard">
              <th className="text-left py-1 font-caveat text-base">size</th>
              <th className="text-left py-1 font-caveat text-base">direction</th>
              <th
                className="text-right py-1 font-caveat text-base"
                title="Fees + slippage as a fraction of trade size. Positive means the cycle clears break-even."
              >
                edge vs fees
              </th>
            </tr>
          </thead>
          <tbody>
            {edge.sized.map((s) => {
              const isPicked = s.direction === best.direction;
              const clearsBreakeven = s.netPct >= 0;
              return (
                <tr
                  key={s.sizeUsd + s.direction}
                  className={`border-b border-wizard-beard/30 last:border-0 ${
                    isPicked
                      ? 'bg-wizard-highlight/15'
                      : 'opacity-40'
                  }`}
                  title={
                    isPicked
                      ? 'The wizard would pick this direction'
                      : 'Wrong direction — buying rich, selling cheap. Ignored.'
                  }
                >
                  <td className="py-1 pl-1">
                    {isPicked ? (
                      <span className="text-wizard-highlight mr-1">▶</span>
                    ) : (
                      <span className="text-wizard-beard mr-1">·</span>
                    )}
                    ${s.sizeUsd}
                  </td>
                  <td className="py-1 text-xs">{directionLabel(s.direction)}</td>
                  <td
                    className={`py-1 text-right font-bold ${
                      clearsBreakeven
                        ? 'text-wizard-highlight'
                        : isPicked
                          ? 'text-wizard-black'
                          : 'text-wizard-text'
                    }`}
                  >
                    {fmtPct(s.netPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 font-caveat text-xs text-wizard-beard">
          "Edge vs fees" is the gross cross-venue spread net of all costs —
          DotSwap fee, Kraken taker, L1 fee, slippage. Positive = the cycle
          clears break-even.
        </p>
      </div>
    </div>
  );
}

function VenueBox({
  venue,
  venueColor,
  rows,
}: {
  venue: string;
  venueColor: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div
      className={`bg-${venueColor}/10 border-2 border-wizard-black rounded-[10px_3px_10px_3px] p-3`}
    >
      <div className={`font-derp text-xl text-${venueColor}`}>{venue}</div>
      <div className="mt-1 space-y-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between font-caveat text-base">
            <span className="text-wizard-text">{r.label}</span>
            <span className="font-mono text-sm text-wizard-black">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Markets ---------------------------------------------------------------

function MarketsSection({ state }: { state: DashboardState }) {
  const markets = state.markets ?? [];
  const summary = state.spreadHistory?.summary;
  return (
    <section className="relative px-4 py-16 bg-white/85">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          Markets at a Glance
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          24h volume by venue. The wizard&apos;s contribution, in real numbers.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {markets.map((m) => (
            <MarketCard
              key={m.token}
              market={m}
              stdBps={summary?.stdBps?.[m.token]}
              minutesWide={summary?.minutesAboveBreakeven?.[m.token]}
              breakevenBps={summary?.breakevenBps}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketCard({
  market,
  stdBps,
  minutesWide,
  breakevenBps,
}: {
  market: TokenMarket;
  stdBps?: number;
  minutesWide?: number;
  breakevenBps?: number;
}) {
  const maxUsd = Math.max(
    1,
    ...market.venues.map((v) => v.usdVolume24h),
  );
  return (
    <div className="bg-white border-3 border-wizard-black rounded-[18px_5px_18px_5px] shadow-[4px_4px_0_#040104] p-6 -rotate-[0.3deg] hover:rotate-0 transition-all">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-derp text-3xl text-wizard-black">${market.token}</h3>
        <span className="font-derp text-2xl text-bitcoin-orange">
          {fmtUsd(market.totalUsd24h)}
        </span>
      </div>
      <p className="font-caveat text-sm text-wizard-text mb-4">
        24h volume across known venues
      </p>

      {/* Per-venue bars */}
      <div className="space-y-3">
        {market.venues.map((v) => {
          const widthPct = (v.usdVolume24h / maxUsd) * 100;
          const colorClass =
            v.venue === 'Kraken' ? 'bg-bitcoin-orange' : 'bg-wizard-blue';
          return (
            <div key={v.venue}>
              <div className="flex items-baseline justify-between text-sm font-caveat text-wizard-text mb-1">
                <span>
                  <strong className="font-derp text-base text-wizard-black">
                    {v.venue}
                  </strong>{' '}
                  · {fmtNumber(v.tokenVolume24h, { compact: true })} tokens
                </span>
                <span className="font-mono text-wizard-black">
                  {fmtUsd(v.usdVolume24h)}
                </span>
              </div>
              <div className="h-3 bg-[#f5f5f0] border-2 border-wizard-black rounded-[6px_2px_6px_2px] overflow-hidden">
                <div
                  className={`h-full ${colorClass}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bridge contribution */}
      <div className="mt-5 pt-4 border-t-2 border-wizard-black/20 grid grid-cols-2 gap-2">
        <div>
          <div className="font-caveat text-sm text-wizard-text">
            wizard contributed
          </div>
          <div className="font-derp text-2xl text-wizard-highlight">
            {fmtUsd(market.bridgeUsd24h)}
          </div>
          <div className="font-caveat text-xs text-wizard-beard">
            {market.bridgeSharePct.toFixed(2)}% of 24h volume
          </div>
        </div>
        <div className="text-right">
          {stdBps !== undefined && (
            <div>
              <div className="font-caveat text-sm text-wizard-text">
                spread stddev
              </div>
              <div className="font-mono text-base text-wizard-black">
                {Math.round(stdBps)} bps
              </div>
            </div>
          )}
          {minutesWide !== undefined && breakevenBps !== undefined && (
            <div className="mt-1">
              <div className="font-caveat text-xs text-wizard-text">
                wide of {breakevenBps} bps for
              </div>
              <div className="font-mono text-sm text-wizard-black">
                {fmtMinutes(minutesWide)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtMinutes(min: number): string {
  if (min < 1) return '< 1 min';
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ---- Treasury --------------------------------------------------------------

function TreasurySection({ state }: { state: DashboardState }) {
  // Combine per-asset deltas across both venues — the treasury is ONE
  // pool; routing inventory between Kraken and the wallet is execution
  // plumbing, not a P&L event. So we sum kraken + wallet deltas per
  // asset and show the unified net change since launch.
  const krakenDeltas = state.inventoryDeltas?.kraken ?? [];
  const walletDeltas = state.inventoryDeltas?.wallet ?? [];
  const combinedByAsset = new Map<
    string,
    { asset: string; amountDelta: number; usdDelta: number; current: number }
  >();
  for (const d of [...krakenDeltas, ...walletDeltas]) {
    const prev = combinedByAsset.get(d.asset);
    if (prev) {
      prev.amountDelta += d.amountDelta;
      prev.usdDelta += d.usdDelta;
      prev.current += d.current;
    } else {
      combinedByAsset.set(d.asset, {
        asset: d.asset,
        amountDelta: d.amountDelta,
        usdDelta: d.usdDelta,
        current: d.current,
      });
    }
  }
  // Sort by absolute amount delta normalized by current balance so the
  // most-impactful changes surface first regardless of asset units
  // (10 MIM out of 12M vs 0.00268 BTC out of 0.035 aren't comparable in
  // raw magnitude). Falls back to absolute delta for assets at 0.
  const combined = [...combinedByAsset.values()].sort((a, b) => {
    const aRel = a.current > 0 ? Math.abs(a.amountDelta) / a.current : Math.abs(a.amountDelta);
    const bRel = b.current > 0 ? Math.abs(b.amountDelta) / b.current : Math.abs(b.amountDelta);
    return bRel - aRel;
  });

  return (
    <section className="relative px-4 py-16 bg-white/90">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          The Wizard's Vault
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          One treasury, two locations. The interesting bit is how much has moved.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <VaultCard
            title="On Kraken"
            subtitle="centralized exchange"
            color="bitcoin-orange"
            rotate="-rotate-1"
            balances={state.inventory.kraken}
          />
          <VaultCard
            title="In the Wallet"
            subtitle={shortenAddr(state.agent.address)}
            color="wizard-blue"
            rotate="rotate-1"
            balances={state.inventory.wallet}
            href={`https://mempool.space/address/${state.agent.address}`}
          />
        </div>

        <div className="mt-8 text-center font-derp text-3xl text-wizard-black">
          Total magic ={' '}
          <span className="text-bitcoin-orange drop-shadow-[2px_2px_0_#040104]">
            {fmtUsd(state.inventory.totalUsd)}
          </span>
        </div>

        {state.inventoryDeltas && combined.length > 0 && (
          <div className="mt-10 max-w-3xl mx-auto bg-white border-3 border-wizard-black rounded-[18px_5px_18px_5px] shadow-[4px_4px_0_#040104] p-6 -rotate-[0.5deg]">
            <h3 className="font-derp text-2xl md:text-3xl text-wizard-black">
              Net change since launch
            </h3>
            <p className="font-caveat text-sm text-wizard-text mb-4">
              kraken + wallet, summed per asset. USD valuations move with
              the market — the asset balances are the honest signal.
            </p>
            <ul className="space-y-2">
              {combined.map((c) => {
                const compact = Math.abs(c.amountDelta) > 100_000;
                const positive = c.amountDelta > 0;
                const zero = Math.abs(c.amountDelta) < 0.0000001;
                return (
                  <li
                    key={c.asset}
                    className="border-b border-wizard-beard/40 pb-1 last:border-0 flex items-baseline justify-between gap-4"
                  >
                    <span className="font-derp text-xl text-wizard-black w-16">
                      {c.asset}
                    </span>
                    <span className="font-caveat text-sm text-wizard-beard flex-1 text-right">
                      now {fmtNumber(c.current, { compact: c.current > 100_000 })}
                    </span>
                    <span
                      className={`font-derp text-xl w-40 text-right ${
                        zero
                          ? 'text-wizard-beard'
                          : positive
                            ? 'text-wizard-highlight'
                            : 'text-glitch-magenta'
                      }`}
                    >
                      {zero ? '±0' : (positive ? '+' : '') + fmtNumber(c.amountDelta, { compact })}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-right font-caveat text-xs text-wizard-beard">
              tracking since{' '}
              {new Date(state.inventoryDeltas.recordedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function VaultCard({
  title,
  subtitle,
  color,
  rotate,
  balances,
  href,
}: {
  title: string;
  subtitle: string;
  color: string;
  rotate: string;
  balances: { asset: string; amount: number; usdValue: number }[];
  href?: string;
}) {
  const sorted = [...balances].sort((a, b) => b.usdValue - a.usdValue);
  const total = sorted.reduce((s, b) => s + b.usdValue, 0);
  const wrapped = (
    <div
      className={`bg-white border-3 border-wizard-black rounded-[18px_5px_18px_5px] shadow-[4px_4px_0_#040104] p-6 ${rotate} hover:rotate-0 transition-all`}
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className={`font-derp text-3xl text-${color}`}>{title}</h3>
        <span className="font-derp text-2xl text-wizard-black">{fmtUsd(total)}</span>
      </div>
      <p className="font-caveat text-sm text-wizard-text mb-4">{subtitle}</p>
      <ul className="space-y-2">
        {sorted.map((b) => {
          const compact = b.amount > 100_000;
          return (
            <li
              key={b.asset}
              className="border-b border-wizard-beard/40 pb-1 last:border-0"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-derp text-xl text-wizard-black">
                  {b.asset}
                </span>
                <span className="font-caveat text-lg text-wizard-text">
                  {fmtNumber(b.amount, { compact })}
                </span>
                <span className="font-mono text-sm text-wizard-black w-24 text-right">
                  {fmtUsd(b.usdValue)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer noopener" className="block">
      {wrapped}
    </a>
  ) : (
    wrapped
  );
}

// ---- Recent fires ----------------------------------------------------------

const FIRES_PAGE_SIZE = 5;

function FiresSection({ state }: { state: DashboardState }) {
  const [showFailed, setShowFailed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(FIRES_PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort newest-first; the daemon already sorts but we don't trust order here.
  const allFires = [...state.recentFires].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Hide debug-failed fires by default; surface them via toggle.
  const successFires = allFires.filter((f) => !isFailed(f.status));
  const failedFires = allFires.filter((f) => isFailed(f.status));
  const shown = (showFailed ? allFires : successFires).slice(0, visibleCount);
  const totalShownableCount = showFailed ? allFires.length : successFires.length;
  const hasMore = visibleCount < totalShownableCount;

  if (allFires.length === 0) {
    return (
      <section className="relative px-4 py-16 bg-white/85">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-derp text-wizard-black mb-2 -rotate-1">
            Cycles Closed
          </h2>
          <p className="font-caveat text-xl text-wizard-text">
            No cycles yet. The wizard is watching the spread.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-16 bg-white/85">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          Cycles Closed
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-8">
          Every cycle the wizard has run. Verifiable on chain.
        </p>

        {/* Table header (desktop only) */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 pb-2 mb-1 font-caveat text-sm text-wizard-text border-b-2 border-wizard-black/30">
          <div>token</div>
          <div>direction</div>
          <div className="text-right">size</div>
          <div className="text-right">moved</div>
          <div className="text-right">status</div>
          <div className="text-right">when</div>
        </div>

        <div className="space-y-2">
          {shown.map((fire) => (
            <FireRow
              key={fire.legId}
              fire={fire}
              expanded={expandedId === fire.legId}
              onToggle={() =>
                setExpandedId(expandedId === fire.legId ? null : fire.legId)
              }
            />
          ))}
        </div>

        {/* Pagination + failed toggle */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {hasMore && (
            <button
              onClick={() =>
                setVisibleCount((c) =>
                  Math.min(c + 10, totalShownableCount),
                )
              }
              className="px-5 py-2 bg-white border-3 border-wizard-black rounded-[12px_4px_12px_4px] font-derp text-base hover:bg-wizard-cyan hover:scale-105 transition-all shadow-[2px_2px_0_#040104] -rotate-1"
            >
              Show more ({totalShownableCount - visibleCount} hidden)
            </button>
          )}
          {failedFires.length > 0 && (
            <button
              onClick={() => {
                setShowFailed((s) => !s);
                setVisibleCount(FIRES_PAGE_SIZE);
              }}
              className={`px-5 py-2 border-3 border-wizard-black rounded-[4px_12px_4px_12px] font-derp text-base hover:scale-105 transition-all shadow-[2px_2px_0_#040104] rotate-1 ${
                showFailed
                  ? 'bg-glitch-magenta text-white'
                  : 'bg-white'
              }`}
            >
              {showFailed
                ? `Hide ${failedFires.length} failed`
                : `Show ${failedFires.length} failed`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function isFailed(status: string): boolean {
  return status === 'failed';
}

function FireRow({
  fire,
  expanded,
  onToggle,
}: {
  fire: DashboardState['recentFires'][number];
  expanded: boolean;
  onToggle: () => void;
}) {
  // "Moved" cell: token volume bridged in this cycle. This is the honest
  // measure of what the cycle did for the ecosystem — USD P&L is mostly a
  // function of BTC drift during the ~24h settlement window and doesn't
  // measure bridge performance.
  const movedLabel =
    fire.tokenVolume !== undefined && fire.tokenVolume > 0
      ? `${fmtNumber(fire.tokenVolume, { compact: fire.tokenVolume > 100_000 })} ${fire.token}`
      : '—';
  const statusColor =
    fire.status === 'complete'
      ? 'bg-wizard-highlight'
      : fire.status === 'pending_kraken_deposit'
        ? 'bg-wizard-cyan'
        : fire.status === 'failed'
          ? 'bg-glitch-magenta text-white'
          : 'bg-bitcoin-orange';

  return (
    <div
      className={`bg-white border-2 border-wizard-black rounded-[10px_3px_10px_3px] shadow-[2px_2px_0_#040104] transition-all hover:shadow-[3px_3px_0_#040104] ${
        expanded ? '' : 'hover:scale-[1.005]'
      }`}
    >
      {/* Row trigger */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center"
      >
        <span className="font-derp text-xl text-wizard-black">${fire.token}</span>

        <span className="font-caveat text-base text-wizard-text truncate">
          {directionLabel(fire.direction)}
        </span>

        {/* Desktop: size + moved + status + when as separate columns */}
        <span className="hidden md:inline font-mono text-sm text-wizard-text text-right">
          ${fire.sizeUsd}
        </span>
        <span
          className="hidden md:inline font-mono text-sm text-wizard-black text-right whitespace-nowrap"
          title="Token volume bridged in this cycle"
        >
          {movedLabel}
        </span>
        <span
          className={`hidden md:inline-flex justify-self-end px-2 py-0.5 border-2 border-wizard-black rounded-[6px_2px_6px_2px] font-derp text-xs ${statusColor}`}
        >
          {compactStatus(fire.status)}
        </span>
        <span className="hidden md:inline font-caveat text-sm text-wizard-text text-right whitespace-nowrap">
          {timeAgo(fire.createdAt)}
        </span>

        {/* Mobile: stack status/moved/time into the right column */}
        <span className="md:hidden flex flex-col items-end gap-0.5 text-right">
          <span
            className={`px-2 py-0.5 border-2 border-wizard-black rounded-[6px_2px_6px_2px] font-derp text-xs ${statusColor}`}
          >
            {compactStatus(fire.status)}
          </span>
          <span className="font-mono text-xs text-wizard-text">
            {movedLabel}
          </span>
          <span className="font-caveat text-xs text-wizard-text">
            {timeAgo(fire.createdAt)}
          </span>
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-wizard-black/20 grid sm:grid-cols-2 gap-3 text-sm font-caveat">
          <div className="bg-bitcoin-orange/10 border border-wizard-black/40 rounded-[8px_3px_8px_3px] p-3">
            <div className="font-derp text-base text-bitcoin-orange mb-1">
              Kraken leg
            </div>
            {fire.krakenOrderId ? (
              <>
                <div className="font-mono text-xs text-wizard-text break-all">
                  {fire.krakenOrderId}
                </div>
                {fire.krakenPrice !== undefined && (
                  <div className="text-wizard-text mt-1">
                    @ {fmtNumber(fire.krakenPrice, { decimals: 7 })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-wizard-beard italic">no Kraken trade</div>
            )}
          </div>

          <div className="bg-wizard-blue/10 border border-wizard-black/40 rounded-[8px_3px_8px_3px] p-3">
            <div className="font-derp text-base text-wizard-blue mb-1">
              DotSwap leg
            </div>
            {fire.dotswapTxId ? (
              <>
                <a
                  href={`https://mempool.space/tx/${fire.dotswapTxId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-xs text-wizard-text hover:text-wizard-highlight break-all underline-offset-2 hover:underline"
                >
                  {shortenTxid(fire.dotswapTxId, 16, 8)} ↗
                </a>
                {fire.dotswapConfirmedAt && (
                  <div className="text-xs text-wizard-text mt-1">
                    confirmed {timeAgo(fire.dotswapConfirmedAt)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-wizard-beard italic">no L1 tx</div>
            )}
          </div>

          <div className="sm:col-span-2 flex items-center justify-between font-caveat text-sm text-wizard-text pt-1">
            <span>
              leg id: <span className="font-mono text-xs">{fire.legId}</span>
            </span>
            <span>{new Date(fire.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Friendlier short labels for status badges. */
function compactStatus(status: string): string {
  switch (status) {
    case 'complete':
      return 'done';
    case 'pending_kraken':
      return 'pending K';
    case 'pending_dotswap':
      return 'pending L1';
    case 'pending_kraken_deposit':
      return 'awaiting deposit';
    case 'failed':
      return 'failed';
    default:
      return status.replace(/_/g, ' ');
  }
}

// ---- BTC P&L ---------------------------------------------------------------

function BtcPnlSection({ state }: { state: DashboardState }) {
  const p = state.totals.btcPnl!;
  const netBtc = p.netSats / 1e8;
  const isPositive = p.netSats >= 0;
  const formatBtc = (sats: number) => {
    const btc = sats / 1e8;
    if (Math.abs(btc) >= 0.001) return `${btc.toFixed(6)} BTC`;
    return `${sats.toLocaleString()} sats`;
  };
  return (
    <section className="relative px-4 py-12 bg-white/90">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          ₿ The Honest Scoreboard
        </h2>
        <p className="text-center font-caveat text-lg text-wizard-text mb-8 max-w-2xl mx-auto">
          The wizard&apos;s lifetime BTC P&amp;L. Portfolio is denominated in
          BTC + tokens; a USD score just measures BTC drift.
        </p>
        <div className="bg-white border-3 border-wizard-black rounded-[18px_5px_18px_5px] shadow-[4px_4px_0_#040104] p-6">
          <div className="text-center mb-6">
            <div className="font-caveat text-base text-wizard-text mb-1">
              net BTC since launch
            </div>
            <div
              className={`font-derp text-5xl md:text-6xl ${
                isPositive ? 'text-wizard-highlight' : 'text-glitch-magenta'
              }`}
            >
              {isPositive ? '+' : ''}
              {netBtc >= 0.001 || netBtc <= -0.001
                ? `${netBtc.toFixed(8)} BTC`
                : `${p.netSats.toLocaleString()} sats`}
            </div>
            <div className="font-caveat text-sm text-wizard-beard mt-2">
              {isPositive
                ? 'the wizard is net-capturing BTC'
                : 'the wizard is net-bleeding BTC (fees + outflows exceed inflows so far)'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center border-r border-wizard-beard/40 last:border-0">
              <div className="font-caveat text-sm text-wizard-text">inflow</div>
              <div className="font-mono text-base text-wizard-black">
                {formatBtc(p.inflowSats)}
              </div>
              <div className="font-caveat text-xs text-wizard-beard">
                from {p.inflowCycles} cycle{p.inflowCycles === 1 ? '' : 's'}
              </div>
            </div>
            <div className="text-center border-r border-wizard-beard/40 last:border-0">
              <div className="font-caveat text-sm text-wizard-text">outflow</div>
              <div className="font-mono text-base text-wizard-black">
                {formatBtc(p.outflowSats)}
              </div>
              <div className="font-caveat text-xs text-wizard-beard">
                {p.outflowCycles} cycle{p.outflowCycles === 1 ? '' : 's'} + fees
              </div>
            </div>
            <div className="text-center border-r border-wizard-beard/40 last:border-0">
              <div className="font-caveat text-sm text-wizard-text">burns</div>
              <div className="font-mono text-base text-wizard-black">
                {p.burnsCounted}
              </div>
              <div className="font-caveat text-xs text-wizard-beard">
                committed
              </div>
            </div>
            <div className="text-center">
              <div className="font-caveat text-sm text-wizard-text">
                in flight
              </div>
              <div className="font-mono text-base text-wizard-black">
                {p.pendingSwapSats > 0 ? formatBtc(p.pendingSwapSats) : '—'}
              </div>
              <div className="font-caveat text-xs text-wizard-beard">
                {p.pendingSwapSats > 0 ? 'swap pending' : 'idle'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Next Burn panel -------------------------------------------------------

function NextBurnPanel({
  pipeline,
}: {
  pipeline: NonNullable<DashboardState['burnPipeline']>;
}) {
  const { thresholdSats, reserveSats, progress, pendingSwap } = pipeline;
  const pct = Math.min(100, Math.max(0, progress * 100));
  const fmtSats = (s: number) => s.toLocaleString();

  // State machine: pendingSwap -> phase 2; else if reserve >= threshold ->
  // phase 1 about to fire; else -> idle/building.
  if (pendingSwap) {
    const elapsedMs = Math.max(
      0,
      Date.now() - new Date(pendingSwap.startedAt).getTime(),
    );
    const elapsedMin = Math.round(elapsedMs / 60_000);
    const expectedMim = pendingSwap.expectedMimReceived;
    return (
      <div className="bg-glitch-magenta/10 border-2 border-glitch-magenta rounded-[10px_3px_10px_3px] shadow-[2px_2px_0_#040104] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2 h-2 bg-glitch-magenta rounded-full animate-pulse" />
          <span className="font-derp text-base text-glitch-magenta">
            burn in flight · phase 2/2
          </span>
        </div>
        <p className="font-caveat text-base text-wizard-text leading-snug mb-2">
          The wizard bought{' '}
          <strong>{expectedMim.toLocaleString()} $MIM</strong> on DotSwap
          with {fmtSats(pendingSwap.btcSpentSats)} sats of captured BTC.
          Waiting for the swap to confirm on chain ({elapsedMin}{' '}
          minute{elapsedMin === 1 ? '' : 's'} ago). As soon as it does,
          that $MIM gets burned automatically.
        </p>
        <a
          href={`https://mempool.space/tx/${pendingSwap.swapTxId}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-block font-mono text-xs text-wizard-text hover:text-glitch-magenta underline-offset-2 hover:underline"
        >
          swap tx: {pendingSwap.swapTxId.slice(0, 16)}…{' '}
          {pendingSwap.swapTxId.slice(-8)} ↗
        </a>
      </div>
    );
  }

  const aboveThreshold = reserveSats >= thresholdSats;
  return (
    <div className="bg-white border-2 border-wizard-black rounded-[10px_3px_10px_3px] shadow-[2px_2px_0_#040104] p-4">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <span className="font-derp text-base text-wizard-black">
          🪄 next burn
        </span>
        <span className="font-caveat text-sm text-wizard-text">
          <strong className="font-mono text-base text-wizard-black">
            {fmtSats(reserveSats)}
          </strong>
          <span className="text-wizard-beard">
            {' '}
            / {fmtSats(thresholdSats)} sats
          </span>
          <span className="text-wizard-beard ml-2">
            ({pct.toFixed(0)}%)
          </span>
        </span>
      </div>
      <div
        className="h-3 bg-[#f5f5f0] border-2 border-wizard-black rounded-[6px_2px_6px_2px] overflow-hidden mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="h-full bg-glitch-magenta transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="font-caveat text-sm text-wizard-text leading-snug">
        {aboveThreshold ? (
          <>
            Reserve is past the threshold — the wizard will broadcast
            a BTC → $MIM swap on the next 30-minute burn-loop tick.
          </>
        ) : (
          <>
            Every profitable arb cycle adds its <strong>net gain</strong>{' '}
            (in BTC-equivalent sats) to the reserve — both directions
            count. Losing cycles don't. Once the reserve crosses{' '}
            <strong>{fmtSats(thresholdSats)} sats</strong> (≈ $75 at
            current BTC), the wizard automatically buys $MIM with the
            entire reserve and burns it.
          </>
        )}
      </p>
    </div>
  );
}

// ---- Cumulative burn chart -------------------------------------------------

function CumulativeBurnChart({
  burns,
}: {
  burns: DashboardState['recentBurns'] extends infer T
    ? T extends Array<infer U>
      ? U[]
      : never
    : never;
}) {
  // Order by time ascending; produce cumulative running total.
  const sorted = [...burns].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
  if (sorted.length === 0) return null;
  let running = 0;
  const points = sorted.map((b) => {
    running += b.mimBurned;
    return { t: new Date(b.at).getTime(), v: running };
  });
  // Prepend a (t0, 0) point at the first burn's time minus 1 hour for
  // a visible step into the chart.
  const t0 = points[0]!.t - 60 * 60 * 1000;
  points.unshift({ t: t0, v: 0 });
  // Append a "now" point at the same running total so the chart shows
  // a plateau through to the present.
  const nowT = Date.now();
  if (nowT > points[points.length - 1]!.t) {
    points.push({ t: nowT, v: running });
  }

  const tMin = points[0]!.t;
  const tMax = points[points.length - 1]!.t;
  const vMax = Math.max(running, 1);
  const W = 720;
  const H = 90;
  const pad = 8;
  const x = (t: number) =>
    pad + ((t - tMin) / (tMax - tMin || 1)) * (W - 2 * pad);
  const y = (v: number) => H - pad - (v / vMax) * (H - 2 * pad);

  // Step polyline: for each pair of points, draw horizontal to next time,
  // then vertical to next value (so the chart looks like a staircase of
  // discrete burns rather than a sloped line).
  const segments: string[] = [`M ${x(points[0]!.t).toFixed(1)} ${y(points[0]!.v).toFixed(1)}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    segments.push(`L ${x(curr.t).toFixed(1)} ${y(prev.v).toFixed(1)}`);
    segments.push(`L ${x(curr.t).toFixed(1)} ${y(curr.v).toFixed(1)}`);
  }
  const path = segments.join(' ');
  // Area path for the fill.
  const areaPath =
    `${path} L ${x(points[points.length - 1]!.t).toFixed(1)} ${H - pad}` +
    ` L ${x(points[0]!.t).toFixed(1)} ${H - pad} Z`;

  const fmtDate = (t: number): string =>
    new Date(t).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-white border-2 border-wizard-black rounded-[10px_3px_10px_3px] shadow-[2px_2px_0_#040104] p-4">
      <div className="font-caveat text-base text-wizard-text mb-2 text-center">
        cumulative $MIM destroyed
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        preserveAspectRatio="none"
      >
        <path d={areaPath} fill="#ff007f" fillOpacity="0.15" />
        <path d={path} fill="none" stroke="#ff007f" strokeWidth="2" />
      </svg>
      <div className="flex justify-between font-caveat text-xs text-wizard-beard mt-1">
        <span>{fmtDate(tMin)}</span>
        <span>{fmtDate(tMax)}</span>
      </div>
    </div>
  );
}

// ---- Burns -----------------------------------------------------------------

function BurnsSection({ state }: { state: DashboardState }) {
  const burns = state.recentBurns ?? [];
  const totalBurned = state.totals.mimBurned ?? 0;
  return (
    <section className="relative px-4 py-16 bg-gradient-to-b from-white/95 to-white/85">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          🔥 $MIM Burned
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-2 max-w-xl mx-auto">
          Captured BTC → burned $MIM. Every holder benefits in proportion.
        </p>
        {totalBurned > 0 ? (
          <p className="text-center font-derp text-3xl md:text-4xl text-glitch-magenta mt-6 mb-4">
            {totalBurned.toLocaleString()} $MIM forever destroyed
          </p>
        ) : (
          <p className="text-center font-caveat text-lg text-wizard-beard mt-6 mb-4">
            no burns yet — the wizard is building up the burn reserve
          </p>
        )}

        {state.burnPipeline && (
          <div className="mb-6">
            <NextBurnPanel pipeline={state.burnPipeline} />
          </div>
        )}

        {burns.length >= 1 && (
          <div className="mb-6">
            <CumulativeBurnChart burns={burns} />
          </div>
        )}

        <div className="space-y-2">
          {burns.map((b) => (
            <a
              key={b.txid}
              href={`https://mempool.space/tx/${b.txid}`}
              target="_blank"
              rel="noreferrer noopener"
              className="block bg-white border-2 border-wizard-black rounded-[10px_3px_10px_3px] shadow-[2px_2px_0_#040104] hover:shadow-[3px_3px_0_#040104] transition-all hover:scale-[1.005]"
            >
              <div className="px-4 py-3 grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-3 items-center">
                <span className="text-2xl">🔥</span>
                <span className="font-caveat text-base text-wizard-text">
                  <strong className="text-glitch-magenta font-derp text-lg">
                    {b.mimBurned.toLocaleString()} $MIM
                  </strong>{' '}
                  burned via {b.mode === 'protocol' ? 'protocol-native burn' : `transfer to ${b.txid.slice(0, 8)}…`}
                </span>
                <span className="hidden md:inline font-mono text-xs text-wizard-text">
                  {shortenTxid(b.txid, 12, 8)} ↗
                </span>
                <span className="font-caveat text-sm text-wizard-text text-right whitespace-nowrap">
                  {timeAgo(b.at)}
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-center font-caveat text-base text-wizard-beard">
          Click any row to verify on mempool.space.
        </p>
      </div>
    </section>
  );
}


// ---- How it works ----------------------------------------------------------

/**
 * Three-band vertical layout for the "how it works" section.
 *
 * Why this design exists: an earlier attempt embedded the whole flow as a
 * single big SVG with hand-placed coordinates. Every change of one
 * element risked overlap with another, and three rounds of iteration
 * never landed clean. The fundamental problem was that we were using
 * SVG for things HTML+CSS already does well (text alignment, spacing,
 * responsive wrap, font inheritance). This rewrite stops fighting
 * coordinates.
 *
 * The bands:
 *   1. A small topology illustration (just Kraken ↔ DotSwap with a
 *      single small SVG — the only piece that truly needs to be drawn)
 *   2. Steps 1-4 as a 2×2 grid of normal HTML cards on md+ viewports;
 *      single column stacked on mobile.
 *   3. Step 5 ("swap, then burn") as a wide, visually distinct card
 *      with a magenta accent, signaling it's the *outcome*, not a
 *      peer of steps 1-4.
 *
 * Native CSS handles all spacing/sizing. No coordinate math anywhere
 * except the band-1 SVG, which is small enough (and simple enough)
 * that it's stable.
 */
function HowItWorksDiagram({
  steps,
}: {
  steps: Array<{ n: string; title: string; body: string; color: string }>;
}) {
  // Step 5 lives in its own band. Steps 1-4 fill band 2.
  const tradeSteps = steps.filter((s) => s.n !== '5');
  const burnStep = steps.find((s) => s.n === '5');

  return (
    <div className="space-y-6">
      {/* ─── Band 1 — topology overview ─── */}
      <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 -rotate-[0.3deg]">
        <VenueTopologySvg />
        <p className="mt-3 text-center font-caveat text-base md:text-lg text-wizard-text">
          the wizard watches both venues every 30 seconds
        </p>
      </div>

      {/* ─── Band 2 — steps 1-4 as a 2×2 grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tradeSteps.map((s, i) => (
          <div
            key={s.n}
            className={`bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 ${
              i % 2 === 0 ? '-rotate-[0.3deg]' : 'rotate-[0.3deg]'
            } hover:rotate-0 transition-all`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex-none w-10 h-10 bg-${s.color} border-2 border-wizard-black rounded-full text-center font-derp text-2xl leading-9 shadow-[2px_2px_0_#040104]`}
              >
                {s.n}
              </div>
              <h3 className="font-derp text-xl md:text-2xl text-wizard-black">
                {s.title}
              </h3>
            </div>
            <p className="font-caveat text-base md:text-lg text-wizard-text leading-snug">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Band 3 — burn step, full width, visually distinct ─── */}
      {burnStep && (
        <div className="bg-white border-3 border-glitch-magenta rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 -rotate-[0.2deg]">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`flex-none w-12 h-12 bg-glitch-magenta border-2 border-wizard-black rounded-full text-center font-derp text-3xl leading-[44px] shadow-[2px_2px_0_#040104] text-white`}
            >
              {burnStep.n}
            </div>
            <h3 className="font-derp text-2xl md:text-3xl text-wizard-black">
              {burnStep.title}
            </h3>
          </div>
          <p className="font-caveat text-base md:text-xl text-wizard-text leading-snug">
            {burnStep.body}
          </p>
          <p className="mt-3 font-derp text-base md:text-lg text-glitch-magenta">
            captured BTC → burned $MIM
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Small topology SVG: just shows Kraken ⇄ DotSwap so viewers see "two
 * venues, bidirectional flow" at a glance. Intentionally minimal —
 * everything text-heavy goes in the HTML cards below.
 */
function VenueTopologySvg() {
  return (
    <svg
      viewBox="0 0 600 120"
      className="block mx-auto w-full max-w-2xl h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Kraken and DotSwap, the two venues the wizard watches"
    >
      <defs>
        <marker
          id="topo-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#040104" />
        </marker>
      </defs>

      {/* Kraken (left) */}
      <rect
        x="40"
        y="30"
        width="180"
        height="60"
        rx="14"
        ry="14"
        fill="#f09f00"
        stroke="#040104"
        strokeWidth="3"
      />
      <text
        x="130"
        y="69"
        textAnchor="middle"
        fontFamily="'Derp', 'Permanent Marker', cursive"
        fontSize="26"
        fontWeight="700"
        fill="#040104"
      >
        Kraken
      </text>

      {/* DotSwap (right) */}
      <rect
        x="380"
        y="30"
        width="180"
        height="60"
        rx="14"
        ry="14"
        fill="#2f53fe"
        stroke="#040104"
        strokeWidth="3"
      />
      <text
        x="470"
        y="69"
        textAnchor="middle"
        fontFamily="'Derp', 'Permanent Marker', cursive"
        fontSize="26"
        fontWeight="700"
        fill="#ffffff"
      >
        DotSwap
      </text>

      {/* Bidirectional arrows in the middle */}
      <line
        x1="240"
        y1="50"
        x2="360"
        y2="50"
        stroke="#040104"
        strokeWidth="2.5"
        markerEnd="url(#topo-arrow)"
      />
      <line
        x1="360"
        y1="70"
        x2="240"
        y2="70"
        stroke="#040104"
        strokeWidth="2.5"
        markerEnd="url(#topo-arrow)"
      />
    </svg>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      n: '1',
      title: 'Watch',
      body: 'Poll Kraken + DotSwap every 30s. Walk the order book for an honest executable price.',
      color: 'bitcoin-orange',
    },
    {
      n: '2',
      title: 'Measure',
      body: 'Compute round-trip break-even (pool fee + taker + slippage + L1). Fire only if spread clears it.',
      color: 'wizard-blue',
    },
    {
      n: '3',
      title: 'Fire both legs',
      body: 'Kraken IOC limit order + DotSwap signed PSBT, broadcast at once. BIP-86 Taproot signer with hot guardrails.',
      color: 'wizard-highlight',
    },
    {
      n: '4',
      title: 'Settle',
      body: 'Kraken fills in under a second. L1 confirms in a block or two. Inventory auto-updates.',
      color: 'magic-yellow',
    },
    {
      n: '5',
      title: 'Burn 🔥',
      body: 'Net BTC captured accumulates in a reserve. At threshold: swap to fresh $MIM, then burn via protocol-native runestone edict.',
      color: 'glitch-magenta',
    },
  ];

  return (
    <section className="relative px-4 py-16 bg-white/90">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          How the Magic Works
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          A peek inside the spellbook.
        </p>

        <HowItWorksDiagram steps={steps} />

        {/* Note about non-pooled */}
        <div className="mt-12 max-w-2xl mx-auto bg-magic-yellow/40 border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-4 text-center">
          <p className="font-caveat text-lg text-wizard-text">
            The wizard trades its own capital.{' '}
            <strong className="text-bitcoin-orange">
              v2 will be open-sourced
            </strong>{' '}
            alongside the Nexus channel-mode launch.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---- What's next (Phase 2 teaser) -----------------------------------------

function RunYourOwnSection({ state: _state }: { state: DashboardState }) {
  return (
    <section className="relative px-4 py-16 bg-gradient-to-b from-white/90 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black mb-4 -rotate-1">
          What's Next
        </h2>
        <p className="font-caveat text-xl text-wizard-text mb-10 max-w-2xl mx-auto">
          Phase Two: the Nexus protocol. Bitcoin state channels that
          compress round-trip fees from <strong>200 basis points</strong>{' '}
          to about <strong>one</strong>. Same arb logic, fifty times more
          burns per dollar of capital.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-6 -rotate-1">
            <div className="text-4xl mb-2">🔥</div>
            <h3 className="font-derp text-xl mb-2">More burns</h3>
            <p className="font-caveat text-base text-wizard-text">
              Sub-cent settlement means every cycle's profit becomes a
              burn. Visible on chain, every time.
            </p>
          </div>
          <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-6 rotate-1">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-derp text-xl mb-2">Channel-fast</h3>
            <p className="font-caveat text-base text-wizard-text">
              Off-chain commitments settle in milliseconds. Tighter
              quotes, smaller capital, more turns per day.
            </p>
          </div>
          <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-6 -rotate-1">
            <div className="text-4xl mb-2">🛠️</div>
            <h3 className="font-derp text-xl mb-2">Open source</h3>
            <p className="font-caveat text-base text-wizard-text">
              v2 will be released open-source when channel-mode goes
              live. Fork it. Run your own wizard.
            </p>
          </div>
        </div>

        <p className="mt-10 font-caveat text-base text-wizard-beard max-w-xl mx-auto">
          Built with Kraken CLI for the{' '}
          <a
            className="underline hover:text-bitcoin-orange"
            href="https://support.kraken.com/articles/agent-zero-promotion"
            target="_blank"
            rel="noreferrer noopener"
          >
            Agent Zero promotion
          </a>
          . Not financial advice. Not investment solicitation. The wizard
          trades its own capital only.
        </p>
      </div>
    </section>
  );
}

// ---- Mini footer -----------------------------------------------------------

function BridgeFooter() {
  return (
    <footer className="bg-wizard-black text-white px-4 py-10 text-center">
      <p className="font-derp text-2xl">✨ The Wizard ✨</p>
      <p className="font-caveat text-base text-wizard-beard mt-2">
        a Magic Internet Money creation · for the $MIM and $DOG armies
      </p>
      <div className="mt-4 flex justify-center gap-4 font-caveat text-base">
        <a className="hover:text-bitcoin-orange" href="https://magicinternetmoney.party">
          ← magicinternetmoney.party
        </a>
        <span className="text-wizard-beard">·</span>
        <a
          className="hover:text-bitcoin-orange"
          href="https://github.com/krakenfx/kraken-cli"
          target="_blank"
          rel="noreferrer noopener"
        >
          Kraken CLI
        </a>
      </div>
    </footer>
  );
}

// ---- Page ------------------------------------------------------------------

/**
 * Where the runes-bridge agent publishes its live state JSON. The agent
 * runs on a separate origin so the URL is absolute. CORS is configured on
 * the agent side to allow magicinternetmoney.party and *.vercel.app.
 *
 * Override with NEXT_PUBLIC_BRIDGE_API_URL for local development or to
 * point at a different deployment.
 */
const BRIDGE_API_URL =
  process.env.NEXT_PUBLIC_BRIDGE_API_URL ||
  'https://bridge-api.magicinternetmoney.party/api/state';

export default function BridgePage() {
  const [state, setState] = useState<DashboardState>(MOCK_STATE);
  const [usingLive, setUsingLive] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchState = async () => {
      try {
        const res = await fetch(BRIDGE_API_URL, { cache: 'no-store' });
        if (!res.ok) return;
        const json: DashboardState = await res.json();
        if (active) {
          setState(json);
          setUsingLive(true);
        }
      } catch {
        // stick with mock — usually transient network or CORS noise
      }
    };
    void fetchState();
    const handle = setInterval(fetchState, 10_000);
    return () => {
      active = false;
      clearInterval(handle);
    };
  }, []);

  return (
    <main className="relative min-h-screen">
      {!usingLive && (
        <div className="fixed top-4 left-4 z-50 bg-magic-yellow border-2 border-wizard-black rounded-[8px_3px_8px_3px] px-3 py-1 font-caveat text-sm shadow-[2px_2px_0_#040104] rotate-[-2deg]">
          🪄 design preview · mock data
        </div>
      )}
      {state.killSwitch?.active && (
        <div className="sticky top-0 z-50 bg-glitch-magenta text-white border-b-4 border-wizard-black px-4 py-3 text-center font-derp text-base md:text-lg shadow-[0_4px_0_#040104]">
          ⏸ THE WIZARD IS RESTING ·{' '}
          <span className="font-caveat font-normal">
            {state.killSwitch.reason ?? 'manual halt'}
          </span>
        </div>
      )}
      {(state.hedgeFailures?.length ?? 0) > 0 && (
        <div className="sticky top-0 z-40 bg-magic-yellow text-wizard-black border-b-4 border-wizard-black px-4 py-3 text-center font-derp text-base md:text-lg shadow-[0_4px_0_#040104]">
          ⚠ {state.hedgeFailures!.length} OPEN HEDGE
          {state.hedgeFailures!.length === 1 ? '' : 'S'} ·{' '}
          <span className="font-caveat font-normal">
            {state.hedgeFailures!.map((h, i) => (
              <span key={h.legId}>
                {i > 0 ? ' · ' : ''}
                {h.side} {h.amount.toLocaleString()} {h.asset}
              </span>
            ))}
          </span>
        </div>
      )}
      <BridgeHero state={state} />
      <LiveEdgeSection state={state} />
      <SpreadVsThresholdChart state={state} />
      {state.markets && state.markets.length > 0 && (
        <MarketsSection state={state} />
      )}
      <TreasurySection state={state} />
      <FiresSection state={state} />
      {/*
        Show BurnsSection whenever we have burn pipeline state OR a past
        burn. The Next Burn panel surfaces what's coming even before the
        first burn fires — important context for viewers who'd otherwise
        wonder why the burn count is low.
      */}
      {((state.recentBurns?.length ?? 0) > 0 ||
        state.burnPipeline !== undefined) && <BurnsSection state={state} />}
      <HowItWorksSection />
      <RunYourOwnSection state={state} />
      <BridgeFooter />
    </main>
  );
}
