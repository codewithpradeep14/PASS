export type PantaConnectionState =
  | "Connected"
  | "Not configured"
  | "Demo mode"
  | "Temporarily unavailable";

export interface PantaMarket {
  id: string;
  question: string;
  description: string;
  category: "SOLANA_ECOSYSTEM" | "PROJECT_MILESTONES" | "CRYPTO" | "GOVERNANCE";
  yesPrice: number;
  noPrice: number;
  yesProbabilityPercent: number; // e.g. 74 (%)
  noProbabilityPercent: number;  // e.g. 26 (%)
  volumeUsdc: number;
  totalPoolUsdc: number;
  status: "ACTIVE" | "RESOLVED" | "CANCELLED";
  resolutionDate: string;
  pantaUrl: string;
  source: "live_panta" | "demo_panta";
}

export interface PantaConnectionStatus {
  state: PantaConnectionState;
  apiBaseUrl: string;
  lastChecked: string;
  marketsAvailable?: number;
  errorMessage?: string;
}
