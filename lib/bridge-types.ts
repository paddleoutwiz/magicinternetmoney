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
    uptimeSec: number;
  };
  config: {
    edgeThresholdPct: number;
    maxTradeUsd: number;
    cooldownSec: number;
    pollSec: number;
    autoSign: boolean;
    live: boolean;
  };
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
    uptimeSec: 17_900,
  },
  config: {
    edgeThresholdPct: 0.5,
    maxTradeUsd: 100,
    cooldownSec: 300,
    pollSec: 30,
    autoSign: true,
    live: true,
  },
};
