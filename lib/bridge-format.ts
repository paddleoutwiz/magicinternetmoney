/**
 * Display formatters for the bridge dashboard.
 *
 * Keep these dumb-pure and well-tested manually — they're used across many
 * components for consistent number/date rendering.
 */
export function fmtUsd(n: number, decimals = 2): string {
  if (!isFinite(n)) return '$—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}$${(abs / 1000).toFixed(2)}k`;
  }
  return `${sign}$${abs.toFixed(decimals)}`;
}

export function fmtPct(n: number, decimals = 2): string {
  if (!isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

export function fmtNumber(n: number, opts: { decimals?: number; compact?: boolean } = {}): string {
  if (!isFinite(n)) return '—';
  if (opts.compact) {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1_000_000_000) return `${sign}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(2)}k`;
  }
  return n.toLocaleString('en-US', {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 6,
  });
}

export function fmtBtc(sats: number, opts: { decimals?: number } = {}): string {
  return `${(sats / 1e8).toFixed(opts.decimals ?? 8)} BTC`;
}

export function shortenAddr(addr: string, head = 8, tail = 6): string {
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function shortenTxid(txid: string, head = 10, tail = 6): string {
  return shortenAddr(txid, head, tail);
}

/** Format a relative time like "3m ago", "2h ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.max(0, Math.round((now - then) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

/** Format an uptime in seconds as a compact "5h 23m" string. */
export function fmtUptime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h < 24) return `${h}h ${remM}m`;
  const d = Math.floor(h / 24);
  const remH = h % 24;
  return `${d}d ${remH}h`;
}

/** Pretty direction labels for the UI. */
export function directionLabel(direction: string): string {
  if (direction === 'buy_dotswap_sell_kraken') return 'DotSwap → Kraken';
  if (direction === 'buy_kraken_sell_dotswap') return 'Kraken → DotSwap';
  return direction;
}
