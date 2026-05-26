'use client';

import { MOCK_STATE, type DashboardState, type TokenEdge } from '@/lib/bridge-types';
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
  const mim = state.edges.find((e) => e.token === 'MIM');
  const live = state.config.live && state.config.autoSign;
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
          An <strong>autonomous wizard</strong> watching <strong>$MIM</strong>{' '}
          and <strong>$DOG</strong> prices on{' '}
          <span className="text-bitcoin-orange font-bold">Kraken</span> and{' '}
          <span className="text-wizard-blue font-bold">DotSwap</span> at the same
          time. When the spread opens up, it{' '}
          <em className="text-wizard-highlight">casts a spell</em>: buys cheap on
          one side, sells dear on the other.{' '}
          <strong>On real Bitcoin. On real money.</strong>
        </p>

        {/* Headline numbers */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Stat label="Treasury" value={fmtUsd(state.inventory.totalUsd)} rotate="-rotate-2" />
          <Stat
            label="Spells Cast"
            value={`${state.totals.firesComplete}`}
            rotate="rotate-1"
          />
          <Stat
            label="Realized P&L"
            value={fmtUsd(state.totals.realizedPnlUsd)}
            rotate="-rotate-1"
            color={state.totals.realizedPnlUsd >= 0 ? 'positive' : 'negative'}
          />
          <Stat
            label={mim ? `${mim.token} spread` : 'MIM spread'}
            value={mim ? fmtPct(mim.grossSpreadPct) : '—'}
            rotate="rotate-2"
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
          <span>
            <strong>Threshold</strong>: {fmtPct(state.config.edgeThresholdPct)}
          </span>
          <span className="text-wizard-beard">·</span>
          <span>
            <strong>Max trade</strong>: ${state.config.maxTradeUsd}
          </span>
        </div>
      </div>
    </section>
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
        <div className="font-caveat text-lg text-wizard-text mb-2">
          gross spread <strong>{fmtPct(edge.grossSpreadPct)}</strong>{' '}
          <span className="text-wizard-beard">— but at execution sizes:</span>
        </div>
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-wizard-text border-b border-wizard-beard">
              <th className="text-left py-1 font-caveat text-base">size</th>
              <th className="text-left py-1 font-caveat text-base">direction</th>
              <th className="text-right py-1 font-caveat text-base">net P&L</th>
            </tr>
          </thead>
          <tbody>
            {edge.sized.map((s) => {
              const profitable = s.netUsd > 0;
              return (
                <tr key={s.sizeUsd} className="border-b border-wizard-beard/30 last:border-0">
                  <td className="py-1">${s.sizeUsd}</td>
                  <td className="py-1 text-xs">{directionLabel(s.direction)}</td>
                  <td
                    className={`py-1 text-right font-bold ${
                      profitable ? 'text-wizard-highlight' : 'text-wizard-text'
                    }`}
                  >
                    {fmtUsd(s.netUsd)} ({fmtPct(s.netPct)})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

// ---- Treasury --------------------------------------------------------------

function TreasurySection({ state }: { state: DashboardState }) {
  return (
    <section className="relative px-4 py-16 bg-white/90">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 rotate-1">
          The Wizard's Vault
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-12">
          Real capital deployed across both venues. Read it on chain.
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
        {sorted.map((b) => (
          <li
            key={b.asset}
            className="flex items-baseline justify-between border-b border-wizard-beard/40 pb-1 last:border-0"
          >
            <span className="font-derp text-xl text-wizard-black">{b.asset}</span>
            <span className="font-caveat text-lg text-wizard-text">
              {fmtNumber(b.amount, { compact: b.amount > 100_000 })}
            </span>
            <span className="font-mono text-sm text-wizard-black w-24 text-right">
              {fmtUsd(b.usdValue)}
            </span>
          </li>
        ))}
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
            Spells Cast
          </h2>
          <p className="font-caveat text-xl text-wizard-text">
            The wizard hasn't cast any spells yet. Watching, waiting, conjuring.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-4 py-16 bg-white/85">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          Spells Cast
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-8">
          Every cross-venue arb the wizard has executed. Click a row to see
          details. Click the transaction id to verify on mempool.space.
        </p>

        {/* Table header (desktop only) */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 pb-2 mb-1 font-caveat text-sm text-wizard-text border-b-2 border-wizard-black/30">
          <div>token</div>
          <div>direction</div>
          <div className="text-right">size</div>
          <div className="text-right">P&L</div>
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
  const realized = fire.realizedUsd;
  const realizedColor =
    realized === undefined
      ? 'text-wizard-beard'
      : realized > 0
        ? 'text-wizard-highlight'
        : realized < 0
          ? 'text-glitch-magenta'
          : 'text-wizard-text';
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

        {/* Desktop: size + P&L + status + when as separate columns */}
        <span className="hidden md:inline font-mono text-sm text-wizard-text text-right">
          ${fire.sizeUsd}
        </span>
        <span
          className={`hidden md:inline font-derp text-base text-right ${realizedColor}`}
        >
          {realized === undefined ? '—' : fmtUsd(realized)}
        </span>
        <span
          className={`hidden md:inline-flex justify-self-end px-2 py-0.5 border-2 border-wizard-black rounded-[6px_2px_6px_2px] font-derp text-xs ${statusColor}`}
        >
          {compactStatus(fire.status)}
        </span>
        <span className="hidden md:inline font-caveat text-sm text-wizard-text text-right whitespace-nowrap">
          {timeAgo(fire.createdAt)}
        </span>

        {/* Mobile: stack status/P&L/time into the right column */}
        <span className="md:hidden flex flex-col items-end gap-0.5 text-right">
          <span
            className={`px-2 py-0.5 border-2 border-wizard-black rounded-[6px_2px_6px_2px] font-derp text-xs ${statusColor}`}
          >
            {compactStatus(fire.status)}
          </span>
          <span className={`font-derp text-sm ${realizedColor}`}>
            {realized === undefined ? '—' : fmtUsd(realized)}
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
      title: 'Compute the magic',
      body: 'Edge = spread minus fees: 2% DotSwap (0.4% platform + 1.6% LP) + 0.26% Kraken taker + slippage budget + the BTC L1 transaction fee. If net edge clears the threshold, the wizard prepares both legs of the trade.',
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
      body: "The Kraken leg locks P&L in under a second. The L1 leg confirms in the next block or two. The wizard's L1 watcher updates the leg state when the transaction lands and adjusts the inventory snapshot.",
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

export default function BridgePage() {
  // Phase 1 placeholder: we render mock state. Once the agent writes
  // /api/bridge/state, we'll fetch it on the client and refresh every 10s.
  const [state, setState] = useState<DashboardState>(MOCK_STATE);
  const [usingLive, setUsingLive] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchState = async () => {
      try {
        const res = await fetch('/api/bridge/state', { cache: 'no-store' });
        if (!res.ok) return;
        const json: DashboardState = await res.json();
        if (active) {
          setState(json);
          setUsingLive(true);
        }
      } catch {
        // stick with mock
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
      <TreasurySection state={state} />
      <FiresSection state={state} />
      <HowItWorksSection />
      <RunYourOwnSection state={state} />
      <BridgeFooter />
    </main>
  );
}
