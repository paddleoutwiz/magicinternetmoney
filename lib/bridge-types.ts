/**
 * Dashboard state types — the JSON shape the agent emits.
 *
 * Mirrors src/dashboard/state.ts on the agent side. Kept here as a separate
 * source of truth for the website since the website doesn't depend on the
 * runes-bridge package directly.
 */

export interface DashboardState {
  capturedAt: string;
  agent: {
    address: string;
    githubRepo: string;
    githubBranch?: string;
    version: string;
  };
  market: {
    btcUsd: number;
    btcFeeRate?: {
      fastestFee: number;
      hourFee: number;
      economyFee: number;
    };
  };
  edges: TokenEdge[];
  inventory: {
    totalUsd: number;
    kraken: BalanceLine[];
    wallet: BalanceLine[];
  };
  recentFires: Fire[];
  totals: {
    firesAttempted: number;
    firesComplete: number;
    firesFailed: number;
    realizedPnlUsd: number;
    /** USD notional flowed through the bridge (sum of every non-failed leg's requestedUsd). */
    bridgedVolumeUsd: number;
    /** Cumulative whole-token MIM burned (lifetime). */
    mimBurned?: number;
    /** Number of completed burn transactions. */
    burnCount?: number;
    /** Current burn-reserve in sats (BTC accumulated for the next burn). */
    burnReserveSats?: number;
    /**
     * BTC-denominated lifetime P&L. The honest scoreboard: positive means
     * the bridge has captured net BTC since launch; negative means it's
     * net-bleeding BTC. Not contaminated by BTC/USD drift.
     */
    btcPnl?: {
      inflowSats: number;
      outflowSats: number;
      netSats: number;
      inflowCycles: number;
      outflowCycles: number;
      burnsCounted: number;
      pendingSwapSats: number;
    };
    uptimeSec: number;
  };
  /** Recent burn events (newest first). */
  recentBurns?: Array<{
    at: string;
    txid: string;
    mimBurned: number;
    feeSats: number;
    mode: string;
  }>;
  /**
   * Live state of the burn loop's pipeline. Drives the "Next Burn"
   * panel — how close to the threshold, what's in flight, what's
   * waiting on confirmation.
   */
  burnPipeline?: {
    thresholdSats: number;
    reserveSats: number;
    /** 0..1. */
    progress: number;
    pendingSwap: {
      startedAt: string;
      swapTxId: string;
      btcSpentSats: number;
      expectedMimReceived: number;
    } | null;
  };
  /** Kill-switch state. When active, irreversible actions are paused. */
  killSwitch?: {
    active: boolean;
    reason?: string;
    path: string;
  };
  /**
   * Open hedge-failed legs (partial arbs). Each entry is a leg where the
   * Kraken side filled but the DotSwap side did not — operator carries
   * naked exposure until the position is closed manually.
   */
  hedgeFailures?: Array<{
    legId: string;
    token: string;
    direction: string;
    asset: string;
    amount: number;
    side: 'long' | 'short';
    at: string;
    reason: string;
  }>;
  config: {
    edgeThresholdPct: number;
    maxTradeUsd: number;
    cooldownSec: number;
    pollSec: number;
    autoSign: boolean;
    live: boolean;
  };
  /** Asset deltas since the bridge first started writing state. */
  inventoryDeltas?: {
    recordedAt: string;
    totalUsdDelta: number;
    kraken: AssetDelta[];
    wallet: AssetDelta[];
  };
  /** Rolling spread history + convergence summary. */
  spreadHistory?: {
    buckets: SpreadBucket[];
    summary: {
      /** Avg gross spread (bps) over the last ~1h, per token. */
      recentBps: Record<string, number>;
      /** Avg gross spread (bps) over the full retained window (~24h), per token. */
      baselineBps: Record<string, number>;
      /** recentBps - baselineBps. Negative means the spread has tightened. */
      deltaBps: Record<string, number>;
      /** Sample stddev of |gross spread| over retention window, per token, in bps. */
      stdBps?: Record<string, number>;
      /** Minutes within the retained window the spread was wider than breakeven. */
      minutesAboveBreakeven?: Record<string, number>;
      /** Breakeven threshold (bps) used for minutesAboveBreakeven. */
      breakevenBps?: number;
    };
  };
  /**
   * 24h market context: per-venue token volume + bridge's contribution.
   */
  markets?: TokenMarket[];
}

export interface TokenMarket {
  token: string;
  venues: Array<{
    venue: 'Kraken' | 'DotSwap';
    tokenVolume24h: number;
    usdVolume24h: number;
  }>;
  totalUsd24h: number;
  bridgeUsd24h: number;
  bridgeSharePct: number;
}

export interface AssetDelta {
  asset: string;
  amountDelta: number;
  usdDelta: number;
  current: number;
  baseline: number;
}

export interface SpreadBucket {
  at: string;
  perToken: Record<string, number>;
  n: number;
}

export interface TokenEdge {
  token: string;
  kraken: { bid: number; ask: number; mid: number };
  dotswap: {
    btcPerToken: number;
    usdPerToken: number;
    reserves: { token: number; btc: number };
  };
  grossSpreadPct: number;
  sized: SizedEdge[];
}

export interface SizedEdge {
  sizeUsd: number;
  direction: 'buy_dotswap_sell_kraken' | 'buy_kraken_sell_dotswap';
  netUsd: number;
  netPct: number;
}

export interface BalanceLine {
  asset: string;
  amount: number;
  usdValue: number;
}

export interface Fire {
  legId: string;
  token: string;
  direction: string;
  sizeUsd: number;
  /** Token units moved in this cycle (e.g., 1,189,296 MIM). */
  tokenVolume?: number;
  status: string;
  createdAt: string;
  krakenOrderId?: string;
  krakenPrice?: number;
  dotswapTxId?: string;
  dotswapConfirmedAt?: string;
  realizedUsd?: number;
}

/**
 * Mock state for design iteration. Mirrors a realistic snapshot of the
 * agent right after the first successful mainnet arb on 2026-05-25.
 */
export const MOCK_STATE: DashboardState = {
  capturedAt: new Date().toISOString(),
  agent: {
    address: 'bc1pvg2dgnn2t9k20g65mxeyzul8ts6z4lskttgdgx5jxnn3f58nlm3svdj2h9',
    githubRepo: 'https://github.com/paddleoutwiz/runes-bridge',
    version: '0.1.0',
  },
  market: {
    btcUsd: 77384.85,
    btcFeeRate: {
      fastestFee: 2,
      hourFee: 1,
      economyFee: 1,
    },
  },
  edges: [
    {
      token: 'MIM',
      kraken: { bid: 0.0002581, ask: 0.0002666, mid: 0.0002624 },
      dotswap: {
        btcPerToken: 3.378e-9,
        usdPerToken: 0.0002614,
        reserves: { token: 84_500_000, btc: 2.545 },
      },
      grossSpreadPct: 0.38,
      sized: [
        { sizeUsd: 50, direction: 'buy_dotswap_sell_kraken', netUsd: -10.3, netPct: -20.6 },
        { sizeUsd: 100, direction: 'buy_dotswap_sell_kraken', netUsd: -5.3, netPct: -5.3 },
        { sizeUsd: 500, direction: 'buy_dotswap_sell_kraken', netUsd: -6.3, netPct: -1.26 },
        { sizeUsd: 1000, direction: 'buy_dotswap_sell_kraken', netUsd: -7.6, netPct: -0.76 },
      ],
    },
    {
      token: 'DOG',
      kraken: { bid: 0.0007062, ask: 0.0007118, mid: 0.000709 },
      dotswap: {
        btcPerToken: 9.16e-9,
        usdPerToken: 0.0007088,
        reserves: { token: 70_700_000, btc: 0.754 },
      },
      grossSpreadPct: 0.03,
      sized: [
        { sizeUsd: 50, direction: 'buy_dotswap_sell_kraken', netUsd: -10.4, netPct: -20.8 },
        { sizeUsd: 100, direction: 'buy_dotswap_sell_kraken', netUsd: -5.3, netPct: -5.26 },
        { sizeUsd: 500, direction: 'buy_dotswap_sell_kraken', netUsd: -6.3, netPct: -1.26 },
        { sizeUsd: 1000, direction: 'buy_dotswap_sell_kraken', netUsd: -7.6, netPct: -0.76 },
      ],
    },
  ],
  inventory: {
    totalUsd: 7166.14,
    kraken: [
      { asset: 'DOG', amount: 557880, usdValue: 394.98 },
      { asset: 'MIM', amount: 4328958.96, usdValue: 1133.11 },
      { asset: 'USDC', amount: 199.17, usdValue: 199.17 },
      { asset: 'USD', amount: 1160.75, usdValue: 1160.75 },
    ],
    wallet: [
      { asset: 'BTC', amount: 0.02065210, usdValue: 1597.74 },
      { asset: 'DOG', amount: 900000, usdValue: 637.2 },
      { asset: 'MIM', amount: 7805901, usdValue: 2043.19 },
    ],
  },
  recentFires: [
    {
      legId: 'leg_mpljnuy5_jupf',
      token: 'MIM',
      direction: 'buy_kraken_sell_dotswap',
      sizeUsd: 50,
      status: 'complete',
      createdAt: '2026-05-25T18:33:04.110Z',
      krakenOrderId: 'OUUOUB-LOKEB-PCW5IO',
      krakenPrice: 0.0002617,
      dotswapTxId:
        '3d374bf7c8b18a2dc1f12ebfd62678921590cc48ed757f6f151a662b0f86b288',
      dotswapConfirmedAt: '2026-05-25T18:34:38.000Z',
      realizedUsd: -1.4,
    },
  ],
  totals: {
    firesAttempted: 1,
    firesComplete: 1,
    firesFailed: 0,
    realizedPnlUsd: -1.4,
    bridgedVolumeUsd: 50,
    mimBurned: 10,
    burnCount: 1,
    burnReserveSats: 0,
    btcPnl: {
      inflowSats: 0,
      outflowSats: 1167,
      netSats: -1167,
      inflowCycles: 0,
      outflowCycles: 0,
      burnsCounted: 1,
      pendingSwapSats: 0,
    },
    uptimeSec: 17_900,
  },
  recentBurns: [
    {
      at: '2026-05-27T18:38:00Z',
      txid: '511b20a1e3f7bd77aa11fc841ad198a4f9b6b67bd1cc1d0115a944f24506682d',
      mimBurned: 10,
      feeSats: 567,
      mode: 'protocol',
    },
  ],
  burnPipeline: {
    thresholdSats: 100_000,
    reserveSats: 24_500,
    progress: 0.245,
    pendingSwap: null,
  },
  inventoryDeltas: {
    recordedAt: '2026-05-25T18:00:00.000Z',
    totalUsdDelta: -1.4,
    kraken: [
      { asset: 'MIM', amountDelta: 195_000, usdDelta: 50.4, current: 4_328_958, baseline: 4_133_958 },
      { asset: 'USD', amountDelta: -51.4, usdDelta: -51.4, current: 1160.75, baseline: 1212.15 },
    ],
    wallet: [
      { asset: 'MIM', amountDelta: -195_000, usdDelta: -51.0, current: 7_805_901, baseline: 8_000_901 },
      { asset: 'BTC', amountDelta: 0.0006, usdDelta: 46.4, current: 0.0207, baseline: 0.0201 },
    ],
  },
  spreadHistory: {
    buckets: [],
    summary: {
      recentBps: { MIM: 215, DOG: -88 },
      baselineBps: { MIM: 380, DOG: 120 },
      deltaBps: { MIM: -165, DOG: -208 },
      stdBps: { MIM: 32, DOG: 41 },
      minutesAboveBreakeven: { MIM: 42, DOG: 18 },
      breakevenBps: 330,
    },
  },
  markets: [
    {
      token: 'MIM',
      venues: [
        { venue: 'Kraken', tokenVolume24h: 37_760_620, usdVolume24h: 10_494 },
        { venue: 'DotSwap', tokenVolume24h: 44_560_841, usdVolume24h: 11_577 },
      ],
      totalUsd24h: 22_071,
      bridgeUsd24h: 300,
      bridgeSharePct: 1.36,
    },
    {
      token: 'DOG',
      venues: [
        { venue: 'Kraken', tokenVolume24h: 232_593_560, usdVolume24h: 156_237 },
        { venue: 'DotSwap', tokenVolume24h: 10_758_644, usdVolume24h: 7_158 },
      ],
      totalUsd24h: 163_395,
      bridgeUsd24h: 0,
      bridgeSharePct: 0,
    },
  ],
  config: {
    edgeThresholdPct: 0.5,
    maxTradeUsd: 100,
    cooldownSec: 300,
    pollSec: 30,
    autoSign: true,
    live: true,
  },
};
