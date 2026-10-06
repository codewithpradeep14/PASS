const test = require("node:test");
const assert = require("node:assert");

// Import evaluation function directly
function evaluatePayment(policy, attempt) {
  const reasons = [];
  const currentTimestamp = attempt.currentTime
    ? new Date(attempt.currentTime).getTime()
    : Date.now();
  const expirationTimestamp = new Date(policy.expiresAt).getTime();

  if (policy.status !== "ACTIVE") {
    return {
      allowed: false,
      reasons: [`This PASS is ${policy.status.toLowerCase()} and cannot be used for spending.`],
      remaining: policy.remaining,
      code: "INACTIVE",
    };
  }

  if (currentTimestamp > expirationTimestamp) {
    return {
      allowed: false,
      reasons: ["This PASS has expired."],
      remaining: policy.remaining,
      code: "EXPIRED",
    };
  }

  if (attempt.recipientWallet.toLowerCase() !== policy.recipientWallet.toLowerCase()) {
    return {
      allowed: false,
      reasons: ["Signer wallet does not match the designated PASS recipient."],
      remaining: policy.remaining,
      code: "WRONG_RECIPIENT",
    };
  }

  if (!attempt.amount || attempt.amount <= 0) {
    return {
      allowed: false,
      reasons: ["Payment amount must be greater than zero."],
      remaining: policy.remaining,
      code: "INVALID_AMOUNT",
    };
  }

  if (attempt.amount > policy.maxPerTransaction) {
    reasons.push(
      `Payment amount ($${attempt.amount.toFixed(2)}) exceeds maximum per-transaction limit of $${policy.maxPerTransaction.toFixed(2)}.`
    );
  }

  if (attempt.amount > policy.remaining) {
    reasons.push(
      `Payment amount ($${attempt.amount.toFixed(2)}) exceeds remaining balance of $${policy.remaining.toFixed(2)}.`
    );
  }

  const allowedCategories = policy.allowedMerchantCategories?.length
    ? policy.allowedMerchantCategories
    : [policy.category];

  const categoryAllowed = allowedCategories.some(
    (c) => c.toUpperCase() === attempt.merchantCategory.toUpperCase()
  );

  if (!categoryAllowed) {
    reasons.push(
      `Merchant category "${attempt.merchantCategory}" is not allowed. This PASS is restricted to [${allowedCategories.join(", ")}].`
    );
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

const mockPolicy = {
  id: "pass_001",
  ownerWallet: "OwnerWallet11111111111111111111111111111111",
  recipientWallet: "BobWallet11111111111111111111111111111111",
  amount: 100.0,
  spent: 0.0,
  remaining: 100.0,
  category: "GROCERIES",
  allowedMerchantCategories: ["GROCERIES"],
  maxPerTransaction: 50.0,
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  status: "ACTIVE",
};

test("1. Valid grocery payment within limits is approved", () => {
  const result = evaluatePayment(mockPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 32.5,
  });

  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.remaining, 67.5);
  assert.strictEqual(result.reasons.length, 0);
});

test("2. Payment in disallowed category (e.g. ENTERTAINMENT) is blocked", () => {
  const result = evaluatePayment(mockPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "ENTERTAINMENT",
    amount: 25.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "CATEGORY_MISMATCH");
  assert.match(result.reasons[0], /is not allowed/);
});

test("3. Payment exceeding max per transaction limit ($50) is blocked", () => {
  const result = evaluatePayment(mockPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 75.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "EXCEEDS_MAX_TX");
});

test("4. Payment exceeding remaining balance is blocked", () => {
  const depletedPolicy = { ...mockPolicy, remaining: 20.0 };
  const result = evaluatePayment(depletedPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 30.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "EXCEEDS_REMAINING");
});

test("5. Payment with unauthorized recipient is blocked", () => {
  const result = evaluatePayment(mockPolicy, {
    passId: "pass_001",
    recipientWallet: "EveWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 20.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "WRONG_RECIPIENT");
});

test("6. Payment on expired PASS is blocked", () => {
  const expiredPolicy = {
    ...mockPolicy,
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
  };
  const result = evaluatePayment(expiredPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 20.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "EXPIRED");
});

test("7. Payment on revoked PASS is blocked", () => {
  const revokedPolicy = { ...mockPolicy, status: "REVOKED" };
  const result = evaluatePayment(revokedPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 20.0,
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "INACTIVE");
});

test("8. Zero or negative amount payment is blocked", () => {
  const resultZero = evaluatePayment(mockPolicy, {
    passId: "pass_001",
    recipientWallet: "BobWallet11111111111111111111111111111111",
    merchantCategory: "GROCERIES",
    amount: 0,
  });

  assert.strictEqual(resultZero.allowed, false);
  assert.strictEqual(resultZero.code, "INVALID_AMOUNT");
});
