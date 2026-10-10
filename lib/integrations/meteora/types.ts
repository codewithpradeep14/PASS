export type MeteoraConnectionState =
  | "Connected"
  | "Not configured"
  | "Demo mode"
  | "Temporarily unavailable";

export interface MeteoraPoolMetric {
  poolAddress: string;
  name: string;
  mintA: string;
  mintB: string;
  reserveA: string;
  reserveB: string;
  liquidityUsd: number;
  apr24h: number;
  tradeVolume24h: number;
}

export interface MeteoraLaunchInsights {
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  poolAddress: string;
  bondingCurveProgressPercent: number; // 0 - 100%
  currentPriceUsdc: number;
  marketCapUsdc: number;
  totalLiquidityUsdc: number;
  volume24hUsdc: number;
  migrationStatus: "BondingCurveActive" | "MigratedToDAMM" | "PendingMigration";
  dammPoolAddress?: string;
  dammFeeTier?: string;
  targetMigrationLiquidityUsdc: number;
  associatedPassId?: string;
  associatedPassBudget?: {
    purpose: string;
    allocatedUsdc: number;
    spentUsdc: number;
    remainingUsdc: number;
  };
  lastUpdated: string;
  source: "live_meteora" | "demo_meteora";
}

export interface MeteoraConnectionStatus {
  state: MeteoraConnectionState;
  endpoint: string;
  programId: string;
  lastChecked: string;
  poolsIndexed?: number;
  errorMessage?: string;
}
