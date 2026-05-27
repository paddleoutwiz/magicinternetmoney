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
          <span className="inline-block -rotate-2">Magic</span>{' '}
          <span className="inline-block rotate-1 text-bitcoin-orange drop-shadow-[2px_2px_0_#040104]">
            Internet
          </span>{' '}
          <span className="inline-block -rotate-1">Money</span>
        </h1>
        <h2 className="mt-2 text-3xl md:text-5xl font-derp text-wizard-blue drop-shadow-[2px_2px_0_#040104] rotate-1">
          ✨ Runes Bridge ✨
        </h2>

        {/* Subtitle */}
        <p className="mt-8 text-xl md:text-2xl font-caveat text-wizard-text max-w-3xl mx-auto leading-snug">
          An <strong>autonomous wizard</strong> bridging <strong>$MIM</strong>{' '}
          and <strong>$DOG</strong> liquidity between{' '}
          <span className="text-bitcoin-orange font-bold">Kraken</span> and{' '}
          <span className="text-wizard-blue font-bold">DotSwap</span>. When the
          two venues disagree on price, the wizard{' '}
          <em className="text-wizard-highlight">casts a spell</em> across them
          — tightening the spread for everyone in the ecosystem.{' '}
          <strong>On real Bitcoin. On real money.</strong>
        </p>

        {/* Headline numbers — these measure ecosystem service, not operator P&L. */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Stat label="Treasury" value={fmtUsd(state.inventory.totalUsd)} rotate="-rotate-2" />
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
          <a
            href={state.agent.githubRepo}
            target="_blank"
            rel="noreferrer noopener"
            className="px-8 py-4 bg-white text-wizard-black border-4 border-wizard-black rounded-[5px_20px_5px_20px] text-2xl font-derp rotate-1 hover:-rotate-1 hover:scale-110 hover:bg-wizard-cyan transition-all shadow-[4px_4px_0_#040104]"
          >
            Run Your Own 🧙
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
          <span title="How far past break-even the wizard requires before firing. Negative means it's willing to subsidize spread convergence.">
            <strong>Convergence floor</strong>:{' '}
            {fmtPct(state.config.edgeThresholdPct)}
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
        The bridge's job is to make these two venues agree on price. Smaller
        numbers mean tighter spreads — better for everyone trading these
        runes.
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
        <p className="text-center font-caveat text-xl text-wizard-text mb-12 max-w-3xl mx-auto">
          24h trading activity across venues, and how much of it the wizard
          contributed. The bridge is one participant in a bigger ecosystem —
          but a measurable one.
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
  const krakenDeltas = state.inventoryDeltas?.kraken ?? [];
  const walletDeltas = state.inventoryDeltas?.wallet ?? [];
  return (
    <section className="relative px-4 py-16 bg-white/90">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          The Wizard's Vault
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          Real capital deployed across both venues. Read it on chain. The
          interesting bit isn't the size — it's how much has moved.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <VaultCard
            title="On Kraken"
            subtitle="centralized exchange"
            color="bitcoin-orange"
            rotate="-rotate-1"
            balances={state.inventory.kraken}
            deltas={krakenDeltas}
          />
          <VaultCard
            title="In the Wallet"
            subtitle={shortenAddr(state.agent.address)}
            color="wizard-blue"
            rotate="rotate-1"
            balances={state.inventory.wallet}
            deltas={walletDeltas}
            href={`https://mempool.space/address/${state.agent.address}`}
          />
        </div>

        <div className="mt-8 text-center font-derp text-3xl text-wizard-black">
          Total magic ={' '}
          <span className="text-bitcoin-orange drop-shadow-[2px_2px_0_#040104]">
            {fmtUsd(state.inventory.totalUsd)}
          </span>
        </div>
        {state.inventoryDeltas && (
          <p className="mt-4 text-center font-caveat text-base text-wizard-beard">
            tracking deltas since{' '}
            {new Date(state.inventoryDeltas.recordedAt).toLocaleString()}
          </p>
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
  deltas,
  href,
}: {
  title: string;
  subtitle: string;
  color: string;
  rotate: string;
  balances: { asset: string; amount: number; usdValue: number }[];
  deltas?: { asset: string; amountDelta: number; usdDelta: number }[];
  href?: string;
}) {
  const sorted = [...balances].sort((a, b) => b.usdValue - a.usdValue);
  const total = sorted.reduce((s, b) => s + b.usdValue, 0);
  const deltaByAsset = new Map(
    (deltas ?? []).map((d) => [d.asset, d] as const),
  );
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
          const d = deltaByAsset.get(b.asset);
          const compact = b.amount > 100_000;
          const showDelta = d && Math.abs(d.amountDelta) > 0.0000001;
          const positive = d ? d.amountDelta > 0 : false;
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
              {showDelta && (
                <div className="text-right font-caveat text-xs">
                  <span
                    className={
                      positive
                        ? 'text-wizard-highlight'
                        : 'text-glitch-magenta'
                    }
                  >
                    {positive ? '+' : ''}
                    {fmtNumber(d!.amountDelta, { compact })} since launch
                  </span>
                </div>
              )}
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
            No cycles yet. The wizard is waiting for the cross-venue spread to
            cross the convergence threshold.
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
          Every cross-venue cycle the wizard has executed. Each one moved real
          tokens, paid real fees, and tightened the spread a little. Click a
          row for details, or click the transaction id to verify on
          mempool.space.
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

// ---- How it works ----------------------------------------------------------

function HowItWorksSection() {
  const steps = [
    {
      n: '1',
      title: 'Watch both venues',
      body: 'The wizard polls Kraken and DotSwap every 30 seconds. It compares the live bid/ask on Kraken against the AMM mid-price on DotSwap, then walks the Kraken order book to compute the *honest* executable price for the size it wants to trade.',
      color: 'bitcoin-orange',
    },
    {
      n: '2',
      title: 'Measure the gap',
      body: "Break-even spread = 2% DotSwap (0.4% platform + 1.6% LP) + 0.26% Kraken taker + slippage budget + the BTC L1 fee. If the gross spread is wide enough to clear break-even (give or take a small convergence subsidy), the wizard prepares both legs. The goal isn't operator profit — it's tightening the spread.",
      color: 'wizard-blue',
    },
    {
      n: '3',
      title: 'Cast both legs at once',
      body: 'Kraken side: a real IOC limit order via the Kraken CLI. DotSwap side: build a PSBT, sign it with the in-process hot signer (BIP-86 Taproot, your warm wallet), broadcast to Bitcoin L1.',
      color: 'wizard-highlight',
    },
    {
      n: '4',
      title: 'Settle on Bitcoin',
      body: "The Kraken leg fills in under a second. The L1 leg confirms in the next block or two. The wizard's L1 watcher advances the leg state when the transaction lands and updates the inventory snapshot.",
      color: 'magic-yellow',
    },
  ];

  return (
    <section className="relative px-4 py-16 bg-white/90">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          How the Magic Works
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12 max-w-2xl mx-auto">
          A peek inside the spellbook. Built with Kraken CLI for the Agent Zero
          promotion.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 ${
                i % 2 === 0 ? '-rotate-1' : 'rotate-1'
              } hover:rotate-0 transition-all`}
            >
              <div
                className={`inline-block w-10 h-10 bg-${s.color} border-2 border-wizard-black rounded-full text-center font-derp text-2xl leading-9 mb-3 shadow-[2px_2px_0_#040104]`}
              >
                {s.n}
              </div>
              <h3 className="font-derp text-xl text-wizard-black mb-2">
                {s.title}
              </h3>
              <p className="font-caveat text-base text-wizard-text leading-snug">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Note about non-pooled */}
        <div className="mt-12 max-w-3xl mx-auto bg-magic-yellow/40 border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-5 text-center">
          <p className="font-caveat text-lg text-wizard-text">
            <strong>Important:</strong> right now this wizard trades only its
            own capital. There's no pooled fund and no way for others to
            contribute. The whole thing is{' '}
            <strong className="text-bitcoin-orange">open source</strong>: fork
            the repo, point it at your own Xverse wallet and Kraken account,
            run your own copy. The magic is the code, and the code is yours.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---- Run your own ----------------------------------------------------------

function RunYourOwnSection({ state }: { state: DashboardState }) {
  return (
    <section className="relative px-4 py-16 bg-gradient-to-b from-white/90 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black mb-4 -rotate-1">
          Run Your Own Wizard
        </h2>
        <p className="font-caveat text-xl text-wizard-text mb-8 max-w-2xl mx-auto">
          MIT licensed. TypeScript. Single repo. Uses the official{' '}
          <strong>Kraken CLI</strong> on the CEX side and DotSwap's V3 PSBT
          flow on the L1 side. Bring your own keys.
        </p>

        <div className="bg-wizard-black text-wizard-highlight font-mono text-sm md:text-base p-6 rounded-[14px_4px_14px_4px] border-3 border-wizard-black shadow-[4px_4px_0_#040104] text-left max-w-2xl mx-auto -rotate-[0.3deg]">
          <div className="text-wizard-beard mb-2"># install Kraken CLI</div>
          <div className="break-all">
            curl --proto '=https' --tlsv1.2 -LsSf
            https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh
            | sh
          </div>
          <div className="text-wizard-beard mt-4 mb-2">
            # clone + run runes-bridge
          </div>
          <div>git clone {state.agent.githubRepo}</div>
          <div>cd runes-bridge && pnpm install</div>
          <div>pnpm dev preflight</div>
          <div>pnpm dev daemon --tokens MIM,DOG --auto-sign</div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={state.agent.githubRepo}
            target="_blank"
            rel="noreferrer noopener"
            className="px-8 py-4 bg-bitcoin-orange text-wizard-black border-4 border-wizard-black rounded-[20px_5px_20px_5px] text-2xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-magic-yellow transition-all shadow-[4px_4px_0_#040104]"
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/krakenfx/kraken-cli"
            target="_blank"
            rel="noreferrer noopener"
            className="px-8 py-4 bg-white text-wizard-black border-4 border-wizard-black rounded-[5px_20px_5px_20px] text-2xl font-derp rotate-1 hover:-rotate-1 hover:scale-110 hover:bg-wizard-cyan transition-all shadow-[4px_4px_0_#040104]"
          >
            Get Kraken CLI
          </a>
        </div>

        <p className="mt-8 font-caveat text-base text-wizard-beard max-w-xl mx-auto">
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
      <p className="font-derp text-2xl">✨ Magic Internet Money Runes Bridge ✨</p>
      <p className="font-caveat text-base text-wizard-beard mt-2">
        Built for the $MIM and $DOG armies. No utility. No pooled funds. Maximum whimsy.
      </p>
      <div className="mt-4 flex justify-center gap-4 font-caveat text-base">
        <a className="hover:text-bitcoin-orange" href="https://magicinternetmoney.party">
          ← magicinternetmoney.party
        </a>
        <span className="text-wizard-beard">·</span>
        <a
          className="hover:text-bitcoin-orange"
          href="https://github.com/paddleoutwiz/runes-bridge"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
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
      <BridgeHero state={state} />
      <LiveEdgeSection state={state} />
      {state.markets && state.markets.length > 0 && (
        <MarketsSection state={state} />
      )}
      <TreasurySection state={state} />
      <FiresSection state={state} />
      <HowItWorksSection />
      <RunYourOwnSection state={state} />
      <BridgeFooter />
    </main>
  );
}
