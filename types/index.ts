export type PassCategory =
  | "GROCERIES"
  | "FOOD"
  | "TRANSPORT"
  | "EDUCATION"
  | "HEALTHCARE"
  | "WORK"
  | "TRAVEL"
  | "UTILITIES"
  | "ENTERTAINMENT"
  | "CUSTOM";

export const ALL_CATEGORIES: PassCategory[] = [
  "GROCERIES",
  "FOOD",
  "TRANSPORT",
  "EDUCATION",
  "HEALTHCARE",
  "WORK",
  "TRAVEL",
  "UTILITIES",
  "ENTERTAINMENT",
  "CUSTOM",
];

export type PassStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "DEPLETED";

export interface PassRecord {
  id: string;
  onchainPassAddress: string;
  ownerWallet: string;
  recipientWallet: string;
  amount: number;
  spent: number;
  remaining: number;
  purpose: string;
  category: PassCategory;
  maxPerTransaction: number;
  expiresAt: string;
  status: PassStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentEvaluationResult {
  allowed: boolean;
  reasons: string[];
  remaining: number;
  code?: "EXPIRED" | "INACTIVE" | "EXCEEDS_MAX_TX" | "EXCEEDS_REMAINING" | "CATEGORY_MISMATCH" | "WRONG_RECIPIENT" | "INVALID_AMOUNT";
}

export interface AIParsedIntent {
  amount: number;
  currency: string;
  recipient: string;
  purpose: string;
  category: PassCategory;
  maxPerTransaction: number;
  expiresAt: string;
  allowedMerchantCategories: PassCategory[];
  confidence?: number;
  explanation?: string;
  missingFields?: string[];
}

export interface MerchantInfo {
  id: string;
  name: string;
  category: PassCategory;
  walletAddress: string;
  description?: string;
}

export interface PaymentRequest {
  id: string;
  merchantName: string;
  merchantWallet: string;
  category: PassCategory;
  amount: number;
  description: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
}

export interface ReceiptAnalysisResult {
  status: "MATCH" | "MISMATCH" | "REVIEW";
  extractedMerchant: string;
  extractedCategory: PassCategory;
  extractedTotal: number;
  items: string[];
  confidence: number;
  reason: string;
}
