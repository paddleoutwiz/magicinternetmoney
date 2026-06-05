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
  /**
   * v2 only: Nexus Bitcoin Channel (Fast Execution Account) balances.
   * When non-empty, the daemon has pre-funded one or more channels and
   * will route compatible arbs off-chain (sub-block settlement) instead
   * of broadcasting an L1 PSBT each time.
   */
  nexusChannels?: Array<{
    btcAddress: string;
    tick: string;
    availableSats: number;
    cumulativeDepositedSats: number;
    cumulativeSpentSats: number;
    lastReconciledAtUnix: number;
  }>;
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
  /**
   * v2 only: which settlement path the DotSwap leg used.
   *   'channel' — Nexus Bitcoin Channel (off-chain, sub-block);
   *   'l1'      — on-chain PSBT broadcast.
   * Absent on v1 fires.
   */
  settlementPath?: 'channel' | 'l1';
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
    btcUsd: 72174.7,
    btcFeeRate: {
      fastestFee: 4,
      hourFee: 3,
      economyFee: 2,
    },
  },
  edges: [
    {
      token: 'MIM',
      kraken: { bid: 0.0002263, ask: 0.0002323, mid: 0.0002293 },
      dotswap: {
        btcPerToken: 3.18e-9,
        usdPerToken: 0.0002295,
        reserves: { token: 84_500_000, btc: 2.545 },
      },
      grossSpreadPct: -0.09,
      sized: [
        { sizeUsd: 100, direction: 'buy_dotswap_sell_kraken', netUsd: -1.26, netPct: -1.26 },
        { sizeUsd: 200, direction: 'buy_dotswap_sell_kraken', netUsd: -1.52, netPct: -0.76 },
        { sizeUsd: 100, direction: 'buy_kraken_sell_dotswap', netUsd: -1.34, netPct: -1.34 },
        { sizeUsd: 200, direction: 'buy_kraken_sell_dotswap', netUsd: -1.66, netPct: -0.83 },
      ],
    },
    {
      token: 'DOG',
      kraken: { bid: 0.000659, ask: 0.00066, mid: 0.0006595 },
      dotswap: {
        btcPerToken: 9.16e-9,
        usdPerToken: 0.0006611,
        reserves: { token: 70_700_000, btc: 0.754 },
      },
      grossSpreadPct: -0.24,
      sized: [
        { sizeUsd: 100, direction: 'buy_dotswap_sell_kraken', netUsd: -1.26, netPct: -1.26 },
        { sizeUsd: 200, direction: 'buy_dotswap_sell_kraken', netUsd: -1.52, netPct: -0.76 },
        { sizeUsd: 100, direction: 'buy_kraken_sell_dotswap', netUsd: -2.99, netPct: -2.99 },
        { sizeUsd: 200, direction: 'buy_kraken_sell_dotswap', netUsd: -4.21, netPct: -2.10 },
      ],
    },
  ],
  inventory: {
    totalUsd: 6515.07,
    kraken: [
      { asset: 'DOG', amount: 1_155_788, usdValue: 744.33 },
      { asset: 'MIM', amount: 6_830_722, usdValue: 1563.55 },
      { asset: 'USDC', amount: 0.01, usdValue: 0.01 },
      { asset: 'BTC', amount: 0.01741344, usdValue: 1255.77 },
      { asset: 'USD', amount: 325.53, usdValue: 325.53 },
    ],
    wallet: [
      { asset: 'BTC', amount: 0.02061136, usdValue: 1486.39 },
      { asset: 'DOG', amount: 302_092, usdValue: 194.55 },
      { asset: 'MIM', amount: 4_128_223, usdValue: 944.95 },
    ],
  },
  recentFires: [
    {
      legId: 'leg_mpu0ptye_ffjj',
      token: 'DOG',
      direction: 'buy_kraken_sell_dotswap',
      sizeUsd: 200,
      tokenVolume: 298507,
      status: 'complete',
      createdAt: '2026-05-31T16:52:39.014Z',
      krakenOrderId: 'OEZHKN-UKX3C-6G4PPX',
      krakenPrice: 0.000673,
      dotswapTxId:
        '3909b861bb183629f7bb3d122369160d56af781f62a10e3bf464acadc2fd9fa2',
      dotswapConfirmedAt: '2026-05-31T17:02:58.310Z',
      realizedUsd: -2.1,
    },
  ],
  totals: {
    firesAttempted: 6,
    firesComplete: 6,
    firesFailed: 0,
    realizedPnlUsd: -21.24,
    bridgedVolumeUsd: 1350,
    mimBurned: 10,
    burnCount: 1,
    burnReserveSats: 0,
    uptimeSec: 369,
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
    reserveSats: 0,
    progress: 0,
    pendingSwap: null,
  },
  inventoryDeltas: {
    recordedAt: '2026-05-27T14:47:27.757Z',
    totalUsdDelta: -941,
    kraken: [
      { asset: 'DOG', amountDelta: 597_908, usdDelta: 374.17, current: 1_155_788, baseline: 557_880 },
      { asset: 'MIM', amountDelta: -1_175_905, usdDelta: -810.81, current: 6_830_722, baseline: 8_006_627 },
      { asset: 'USDC', amountDelta: -199.18, usdDelta: -199.18, current: 0.01, baseline: 199.19 },
      { asset: 'BTC', amountDelta: 0.005399, usdDelta: 354.58, current: 0.017413, baseline: 0.012014 },
      { asset: 'USD', amountDelta: 81.59, usdDelta: 81.59, current: 325.53, baseline: 243.94 },
    ],
    wallet: [
      { asset: 'BTC', amountDelta: 0.0000028, usdDelta: -59.46, current: 0.020611, baseline: 0.020609 },
      { asset: 'DOG', amountDelta: -597_908, usdDelta: -402.60, current: 302_092, baseline: 900_000 },
      { asset: 'MIM', amountDelta: -10, usdDelta: -279.28, current: 4_128_223, baseline: 4_128_233 },
    ],
  },
  spreadHistory: {
    buckets: [],
    summary: {
      recentBps: { MIM: -142, DOG: 236 },
      baselineBps: { MIM: -166, DOG: -10 },
      deltaBps: { MIM: 23, DOG: 246 },
      stdBps: { MIM: 153, DOG: 96 },
      minutesAboveBreakeven: { MIM: 1075, DOG: 174 },
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
    edgeThresholdPct: -0.2,
    maxTradeUsd: 400,
    cooldownSec: 300,
    pollSec: 30,
    autoSign: true,
    live: true,
  },
};
