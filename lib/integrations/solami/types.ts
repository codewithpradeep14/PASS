export type SolamiConnectionState =
  | "Connected"
  | "Not configured"
  | "Demo mode"
  | "Temporarily unavailable"
  | "Partially integrated";

export interface SolamiConfig {
  apiKey?: string;
  rpcUrl?: string;
  streamUrl?: string;
  isDemoMode?: boolean;
}

export interface SolamiTransactionEvent {
  signature: string;
  slot: number;
  timestamp: number;
  status: "finalized" | "confirmed" | "processed" | "failed";
  programId?: string;
  feeLamports: number;
  decodedAction: string;
  passId?: string;
  senderWallet: string;
  recipientWallet?: string;
  amount?: number;
  category?: string;
  landingStatus: "landed" | "pending" | "dropped";
  source: "live_solami" | "demo_solami";
}

export interface SolamiConnectionStatus {
  state: SolamiConnectionState;
  endpoint: string;
  latencyMs?: number;
  lastChecked: string;
  slot?: number;
  features: {
    rpc: boolean;
    mirageStream: boolean;
    blurDecoded: boolean;
    beamLanding: boolean;
  };
  errorMessage?: string;
}
