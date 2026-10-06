import { PassCategory, PaymentEvaluationResult, PassStatus } from "@/types";

export interface PolicyState {
  id: string;
  ownerWallet: string;
  recipientWallet: string;
  amount: number;
  spent: number;
  remaining: number;
  category: PassCategory;
  allowedMerchantCategories?: PassCategory[];
  allowedMerchants?: string[]; // Allowed merchant wallet addresses or IDs if restricted
  maxPerTransaction: number;
  expiresAt: string | Date | number;
  status: PassStatus;
}

export interface PaymentAttempt {
  passId: string;
  recipientWallet: string;
  merchantWallet?: string;
  merchantCategory: PassCategory;
  amount: number;
  currentTime?: string | Date | number;
}

/**
 * Deterministic policy evaluator for PASS Protocol.
 * Enforces spending caps, categories, expiration, recipient identity, and merchant restrictions.
 */
export function evaluatePayment(
  policy: PolicyState,
  attempt: PaymentAttempt
): PaymentEvaluationResult {
  const reasons: string[] = [];
  const currentTimestamp = attempt.currentTime
    ? new Date(attempt.currentTime).getTime()
    : Date.now();
  const expirationTimestamp = new Date(policy.expiresAt).getTime();

  // 1. Status Check
  if (policy.status !== "ACTIVE") {
    return {
      allowed: false,
      reasons: [`This PASS is ${policy.status.toLowerCase()} and cannot be used for spending.`],
      remaining: policy.remaining,
      code: "INACTIVE",
    };
  }

  // 2. Expiration Check
  if (currentTimestamp > expirationTimestamp) {
    return {
      allowed: false,
      reasons: ["This PASS has expired."],
      remaining: policy.remaining,
      code: "EXPIRED",
    };
  }

  // 3. Recipient Authority Check
  if (
    attempt.recipientWallet.toLowerCase() !==
    policy.recipientWallet.toLowerCase()
  ) {
    return {
      allowed: false,
      reasons: ["Signer wallet does not match the designated PASS recipient."],
      remaining: policy.remaining,
      code: "WRONG_RECIPIENT",
    };
  }

  // 4. Amount Positive Check
  if (!attempt.amount || attempt.amount <= 0) {
    return {
      allowed: false,
      reasons: ["Payment amount must be greater than zero."],
      remaining: policy.remaining,
      code: "INVALID_AMOUNT",
    };
  }

  // 5. Per-Transaction Limit Check
  if (attempt.amount > policy.maxPerTransaction) {
    reasons.push(
      `Payment amount ($${attempt.amount.toFixed(2)}) exceeds maximum per-transaction limit of $${policy.maxPerTransaction.toFixed(2)}.`
    );
  }

  // 6. Remaining Allowance Check
  if (attempt.amount > policy.remaining) {
    reasons.push(
      `Payment amount ($${attempt.amount.toFixed(2)}) exceeds remaining balance of $${policy.remaining.toFixed(2)}.`
    );
  }

  // 7. Merchant Category Check
  const allowedCategories = policy.allowedMerchantCategories?.length
    ? policy.allowedMerchantCategories
    : [policy.category];

  const normalizedMerchantCat = attempt.merchantCategory.toUpperCase();
  const categoryAllowed = allowedCategories.some(
    (c) => c.toUpperCase() === normalizedMerchantCat
  );

  if (!categoryAllowed) {
    reasons.push(
      `Merchant category "${attempt.merchantCategory}" is not allowed. This PASS is restricted to [${allowedCategories.join(", ")}].`
    );
  }

  // 8. Specific Merchant Address Check (if defined)
  if (
    policy.allowedMerchants &&
    policy.allowedMerchants.length > 0 &&
    attempt.merchantWallet
  ) {
    const merchantAllowed = policy.allowedMerchants.some(
      (m) => m.toLowerCase() === attempt.merchantWallet!.toLowerCase()
    );
    if (!merchantAllowed) {
      reasons.push(
        `Merchant wallet "${attempt.merchantWallet}" is not in the approved merchant list.`
      );
    }
  }

  const isAllowed = reasons.length === 0;

  return {
    allowed: isAllowed,
    reasons,
    remaining: isAllowed
      ? Math.max(0, policy.remaining - attempt.amount)
      : policy.remaining,
    code: isAllowed
      ? undefined
      : reasons[0]?.includes("per-transaction")
      ? "EXCEEDS_MAX_TX"
      : reasons[0]?.includes("remaining")
      ? "EXCEEDS_REMAINING"
      : "CATEGORY_MISMATCH",
  };
}
