'use client';

/**
 * The Wizard v2 — Phase 2 SEALED status page.
 *
 * v1 (/wizard) shows live arb decisions. v2 (/wizard-v2) shows
 * the trust-root posture: registries loaded, audit chain
 * intact, daemon up. Shadow-mode for now; no live trading
 * decisions surfaced.
 *
 * Backed by the daemon's StatusWriter publishing
 * /api/wizard-v2/state every 10 seconds.
 */

import { useEffect, useState } from 'react';
import { fmtUptime } from '@/lib/bridge-format';

interface RegistryStatus {
  entry_count: number;
  hmac_prefix: string;
}

interface DashboardSnapshot {
  mode: 'init' | 'ready';
  schema_version: 1;
  updated_at_unix: number;
  daemon: {
    host: string;
    pid: number;
    started_at_unix: number;
    uptime_seconds: number;
    version: string;
  };
  registries: {
    dotswap_pools: RegistryStatus | null;
    kraken_deposit_addresses: RegistryStatus | null;
    channels: RegistryStatus | null;
  };
  audit_log: {
    total_entries: number;
  };
  module_tokens: ReadonlyArray<string>;
  phase_2_seal: {
    rounds: number;
    findings: number;
    last_review_commit: string;
  };
  shadow_validations?: ShadowValidationsSummary;
}

interface ShadowValidationsSummary {
  total: number;
  last_24h: number;
  by_status: {
    ok: number;
    refused: number;
    wire_error: number;
  };
  avg_latency_ms_24h: number | null;
  unique_clause_ids_24h: ReadonlyArray<string>;
  latest_at_unix: number | null;
  latest_status: 'ok' | 'refused' | 'wire_error' | null;
  latest_clause_id: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_WIZARD_V2_API_URL ||
  'https://bridge-api.magicinternetmoney.party/api/wizard-v2/state';

export default function WizardV2Page() {
  const [snap, setSnap] = useState<DashboardSnapshot | null>(null);
  const [lastFetchOk, setLastFetchOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSnap = async () => {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) {
          if (active) {
            setLastFetchOk(false);
            setError(`HTTP ${res.status}`);
          }
          return;
        }
        const json = (await res.json()) as DashboardSnapshot;
        if (active) {
          setSnap(json);
          setLastFetchOk(true);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setLastFetchOk(false);
          setError((e as Error).message);
        }
      }
    };
    void fetchSnap();
    const handle = setInterval(fetchSnap, 10_000);
    return () => {
      active = false;
      clearInterval(handle);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-wizard-cyan/20 via-white to-bitcoin-orange/10">
      <Hero snap={snap} lastFetchOk={lastFetchOk} error={error} />
      {snap !== null && (
        <>
          <ShadowValidationsSection snap={snap} />
          <RegistriesSection snap={snap} />
          <DaemonSection snap={snap} />
          <AuditSection snap={snap} />
          <SealSection snap={snap} />
          <FooterNote snap={snap} />
        </>
      )}
    </main>
  );
}

// ---- Hero ------------------------------------------------------------------

function Hero({
  snap,
  lastFetchOk,
  error,
}: {
  snap: DashboardSnapshot | null;
  lastFetchOk: boolean;
  error: string | null;
}) {
  const mode = snap?.mode;
  const badgeColor =
    mode === 'ready'
      ? 'bg-wizard-highlight text-wizard-black'
      : mode === 'init'
        ? 'bg-fire-yellow text-wizard-black'
        : 'bg-glitch-magenta text-white';
  const badgeLabel =
    mode === 'ready'
      ? '● READY (shadow mode)'
      : mode === 'init'
        ? '● INIT MODE (awaiting registries)'
        : lastFetchOk
          ? 'no snapshot yet'
          : 'offline';
  return (
    <section className="relative min-h-[55vh] flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-5xl text-center">
        <div className="inline-block mb-6">
          <div
            className={`inline-block px-6 py-3 border-4 border-wizard-black rounded-[20px_5px_20px_5px] shadow-[4px_4px_0_#040104] font-derp text-2xl ${badgeColor} -rotate-2`}
          >
            {badgeLabel}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-derp text-wizard-black mb-4 leading-tight">
          The Wizard{' '}
          <span className="text-bitcoin-orange">v2</span>
        </h1>
        <p className="font-caveat text-2xl md:text-3xl text-wizard-text mb-8">
          Phase&nbsp;2 sealed IPC signer for Kraken Agent Zero &middot;{' '}
          shadow-mode live alongside{' '}
          <a
            href="/wizard"
            className="underline decoration-wizard-blue decoration-2 underline-offset-4 hover:text-wizard-blue"
          >
            v1
          </a>
        </p>

        {snap !== null && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Stat
              label="Daemon uptime"
              value={fmtUptime(snap.daemon.uptime_seconds)}
              rotate="-rotate-1"
            />
            <Stat
              label="Shadow validations (24h)"
              value={`${snap.shadow_validations?.last_24h ?? 0}`}
              rotate="rotate-2"
              color={
                snap.shadow_validations?.last_24h ? 'positive' : undefined
              }
            />
            <Stat
              label="Registries loaded"
              value={`${countLoadedRegistries(snap)} / 3`}
              rotate="rotate-1"
              color={
                countLoadedRegistries(snap) === 3 ? 'positive' : undefined
              }
            />
            <Stat
              label="Audit chain"
              value={`${snap.audit_log.total_entries} entries`}
              rotate="-rotate-2"
            />
          </div>
        )}

        {error !== null && snap === null && (
          <div className="mt-8 inline-block px-4 py-2 bg-glitch-magenta/20 border-2 border-glitch-magenta text-wizard-black font-caveat text-lg rounded-md">
            could not reach the daemon: {error}
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#registries"
            className="px-8 py-4 bg-bitcoin-orange text-wizard-black border-4 border-wizard-black rounded-[20px_5px_20px_5px] text-2xl font-derp -rotate-2 hover:rotate-2 hover:scale-110 hover:bg-magic-yellow transition-all shadow-[4px_4px_0_#040104]"
          >
            See The Seal
          </a>
          <a
            href="https://github.com/paddleoutwiz/wizard-v2"
            target="_blank"
            rel="noreferrer noopener"
            className="px-8 py-4 bg-white text-wizard-black border-4 border-wizard-black rounded-[5px_20px_5px_20px] text-2xl font-derp rotate-1 hover:-rotate-1 hover:scale-110 hover:bg-wizard-cyan transition-all shadow-[4px_4px_0_#040104]"
          >
            View Source
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

// ---- Registries ------------------------------------------------------------

function RegistriesSection({ snap }: { snap: DashboardSnapshot }) {
  const entries: Array<{
    kind: string;
    short: string;
    status: RegistryStatus | null;
  }> = [
    { kind: 'dotswap_pools', short: 'pools', status: snap.registries.dotswap_pools },
    {
      kind: 'kraken_deposit_addresses',
      short: 'kraken deposits',
      status: snap.registries.kraken_deposit_addresses,
    },
    { kind: 'channels', short: 'channels', status: snap.registries.channels },
  ];
  return (
    <section id="registries" className="px-4 py-12 bg-white/80">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          §2.13 Signed Registries
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-10">
          HMAC-verified on load, cross-checked against the audit chain
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {entries.map(({ kind, short, status }) => (
            <RegistryCard key={kind} kind={kind} short={short} status={status} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RegistryCard({
  kind,
  short,
  status,
}: {
  kind: string;
  short: string;
  status: RegistryStatus | null;
}) {
  const loaded = status !== null;
  return (
    <div
      className={`bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-6 ${loaded ? 'hover:scale-105' : 'opacity-60'} transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-caveat text-base text-wizard-text">{short}</span>
        <span
          className={`text-xs font-mono px-2 py-1 rounded ${loaded ? 'bg-wizard-highlight/30 text-wizard-black' : 'bg-glitch-magenta/30 text-wizard-black'}`}
        >
          {loaded ? 'loaded' : 'not loaded'}
        </span>
      </div>
      <div className="font-derp text-xl text-wizard-black mb-3 break-all">{kind}</div>
      {status !== null && (
        <>
          <div className="text-sm font-caveat text-wizard-text">entries</div>
          <div className="font-derp text-3xl text-wizard-black mb-2">
            {status.entry_count}
          </div>
          <div className="text-sm font-caveat text-wizard-text">HMAC (16-char prefix)</div>
          <div className="font-mono text-xs text-wizard-black bg-wizard-cyan/20 px-2 py-1 rounded break-all">
            {status.hmac_prefix}…
          </div>
        </>
      )}
    </div>
  );
}

function countLoadedRegistries(snap: DashboardSnapshot): number {
  let n = 0;
  if (snap.registries.dotswap_pools !== null) n++;
  if (snap.registries.kraken_deposit_addresses !== null) n++;
  if (snap.registries.channels !== null) n++;
  return n;
}

// ---- Shadow validations -----------------------------------------------------

function ShadowValidationsSection({ snap }: { snap: DashboardSnapshot }) {
  const sv = snap.shadow_validations;
  return (
    <section className="px-4 py-12 bg-gradient-to-b from-magic-yellow/10 to-white/80">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black text-center mb-2 -rotate-1">
          Shadow validations
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-2">
          v2's safety layer running on v1's real arb-fire traffic
        </p>
        <p className="text-center font-caveat text-base text-wizard-text mb-10 max-w-2xl mx-auto">
          v1 broadcasts; v2 validates the same PSBT against §2.11 and §4 in
          parallel. v2 never signs; every validation outcome is logged with
          its typed clause ID.
        </p>

        {sv === undefined || sv.total === 0 ? (
          <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-8 text-center">
            <div className="font-derp text-3xl text-wizard-black mb-2">
              waiting for first arb…
            </div>
            <div className="font-caveat text-lg text-wizard-text">
              v1's executor fires roughly 2–5 arbs/day. The next fire will
              show up here within seconds.
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KvCard label="Total (all-time)" value={`${sv.total}`} />
              <KvCard label="Last 24h" value={`${sv.last_24h}`} />
              <KvCard
                label="Avg latency"
                value={
                  sv.avg_latency_ms_24h === null
                    ? '—'
                    : `${sv.avg_latency_ms_24h} ms`
                }
              />
              <KvCard
                label="Latest status"
                value={sv.latest_status ?? '—'}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <StatusCard
                label="ok"
                count={sv.by_status.ok}
                color="positive"
              />
              <StatusCard
                label="refused"
                count={sv.by_status.refused}
                color="negative"
              />
              <StatusCard
                label="wire error"
                count={sv.by_status.wire_error}
                color="neutral"
              />
            </div>

            {sv.unique_clause_ids_24h.length > 0 && (
              <>
                <h3 className="text-2xl font-derp text-wizard-black text-center -rotate-1 mt-8 mb-4">
                  Active safety clauses (24h)
                </h3>
                <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
                  {sv.unique_clause_ids_24h.map((id) => (
                    <span
                      key={id}
                      className="px-3 py-1 bg-wizard-cyan/30 border-2 border-wizard-black rounded-full font-mono text-xs text-wizard-black shadow-[2px_2px_0_#040104]"
                    >
                      {id}
                    </span>
                  ))}
                </div>
                <p className="text-center font-caveat text-sm text-wizard-text mt-4 max-w-2xl mx-auto">
                  Each ID is a contract clause from{' '}
                  <code className="font-mono text-xs bg-wizard-cyan/20 px-1 py-0.5 rounded">
                    contracts/clauses.json
                  </code>
                  . The validator rejected a real PSBT because that specific
                  invariant didn&apos;t hold.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function StatusCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: 'positive' | 'negative' | 'neutral';
}) {
  const colorClass =
    color === 'positive'
      ? 'text-wizard-highlight'
      : color === 'negative'
        ? 'text-glitch-magenta'
        : 'text-wizard-black';
  return (
    <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-6 text-center hover:scale-105 transition-all">
      <div className="font-caveat text-lg text-wizard-text">{label}</div>
      <div className={`font-derp text-5xl ${colorClass}`}>{count}</div>
    </div>
  );
}

// ---- Daemon ----------------------------------------------------------------

function DaemonSection({ snap }: { snap: DashboardSnapshot }) {
  return (
    <section className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black text-center mb-2 rotate-1">
          Daemon
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-10">
          The IPC signer process itself
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <KvCard label="Host" value={snap.daemon.host} />
          <KvCard label="PID" value={`${snap.daemon.pid}`} />
          <KvCard label="Version" value={snap.daemon.version} />
          <KvCard
            label="Uptime"
            value={fmtUptime(snap.daemon.uptime_seconds)}
          />
        </div>

        <h3 className="mt-10 mb-4 text-2xl font-derp text-wizard-black text-center -rotate-1">
          Module tokens ({snap.module_tokens.length})
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {snap.module_tokens.map((m) => (
            <span
              key={m}
              className="px-3 py-1 bg-magic-yellow/40 border-2 border-wizard-black rounded-full font-mono text-sm text-wizard-black shadow-[2px_2px_0_#040104]"
            >
              {m}
            </span>
          ))}
        </div>
        <p className="text-center font-caveat text-sm text-wizard-text mt-4">
          (names only — the token bytes never leave the daemon)
        </p>
      </div>
    </section>
  );
}

function KvCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] p-4">
      <div className="font-caveat text-base text-wizard-text">{label}</div>
      <div className="font-derp text-xl md:text-2xl text-wizard-black break-all">
        {value}
      </div>
    </div>
  );
}

// ---- Audit -----------------------------------------------------------------

function AuditSection({ snap }: { snap: DashboardSnapshot }) {
  return (
    <section className="px-4 py-12 bg-white/80">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black mb-2 -rotate-1">
          §10.2 Audit Log
        </h2>
        <p className="font-caveat text-xl text-wizard-text mb-8">
          HMAC-chained from GENESIS_LINK; tampered tails refuse on next start
        </p>
        <div className="inline-block px-12 py-8 bg-bitcoin-orange/20 border-3 border-wizard-black rounded-[14px_4px_14px_4px] shadow-[3px_3px_0_#040104] rotate-1">
          <div className="font-derp text-7xl md:text-8xl text-wizard-black">
            {snap.audit_log.total_entries}
          </div>
          <div className="font-caveat text-xl text-wizard-text mt-2">
            entries committed
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Seal narrative --------------------------------------------------------

function SealSection({ snap }: { snap: DashboardSnapshot }) {
  return (
    <section className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-derp text-wizard-black text-center mb-2 rotate-1">
          Phase 2 Seal
        </h2>
        <p className="text-center font-caveat text-xl text-wizard-text mb-10">
          Codex adversarial review converged at round{' '}
          <span className="font-derp text-2xl text-bitcoin-orange">
            {snap.phase_2_seal.rounds}
          </span>{' '}
          GO
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <KvCard
            label="Review rounds"
            value={`${snap.phase_2_seal.rounds}`}
          />
          <KvCard
            label="Findings closed"
            value={`${snap.phase_2_seal.findings}`}
          />
          <KvCard
            label="Seal commit"
            value={snap.phase_2_seal.last_review_commit}
          />
        </div>
        <p className="text-center font-caveat text-base text-wizard-text mt-8 max-w-2xl mx-auto">
          Trust chain: registry FILE → HMAC verify → CONTENT cross-checked
          with chain-verified AUDIT EVENT → audit anchored by HMAC-key
          knowledge + operator TTY-confirmed CLI invocation. Round-by-round
          findings live in{' '}
          <code className="font-mono text-sm bg-wizard-cyan/20 px-2 py-0.5 rounded">
            reviews/DAEMON_PHASE_2_REVIEW_ROUND_*
          </code>
          .
        </p>
      </div>
    </section>
  );
}

// ---- Footer ----------------------------------------------------------------

function FooterNote({ snap }: { snap: DashboardSnapshot }) {
  const ageSeconds = Math.max(
    0,
    Math.floor(Date.now() / 1000) - snap.updated_at_unix,
  );
  return (
    <section className="px-4 py-8 text-center">
      <p className="font-caveat text-base text-wizard-text">
        snapshot {ageSeconds}s old · refreshes every 10s · schema v
        {snap.schema_version}
      </p>
    </section>
  );
}
