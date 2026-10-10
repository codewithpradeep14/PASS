const test = require("node:test");
const assert = require("node:assert");

// Policy Evaluator logic isolation test
function evaluatePayment(policy, attempt) {
  const currentTimestamp = attempt.currentTime
    ? new Date(attempt.currentTime).getTime()
    : Date.now();
  const expirationTimestamp = new Date(policy.expiresAt).getTime();

  if (policy.status !== "ACTIVE") {
    return {
      allowed: false,
      reasons: [`This PASS is ${policy.status.toLowerCase()} and cannot be used for spending.`],
      code: "INACTIVE",
    };
  }

  if (currentTimestamp > expirationTimestamp) {
    return {
      allowed: false,
      reasons: ["This PASS has expired."],
      code: "EXPIRED",
    };
  }

  if (attempt.amount <= 0) {
    return {
      allowed: false,
      reasons: ["Payment amount must be greater than zero."],
      code: "INVALID_AMOUNT",
    };
  }

  if (attempt.amount > policy.maxPerTransaction) {
    return {
      allowed: false,
      reasons: [`Payment amount exceeds maximum per-transaction limit of $${policy.maxPerTransaction}.`],
      code: "EXCEEDS_MAX_TX",
    };
  }

  if (attempt.amount > policy.remaining) {
    return {
      allowed: false,
      reasons: ["Payment amount exceeds remaining balance."],
      code: "EXCEEDS_REMAINING",
    };
  }

  if (policy.category !== attempt.merchantCategory) {
    return {
      allowed: false,
      reasons: [`Merchant category "${attempt.merchantCategory}" is not allowed. Restricted to [${policy.category}].`],
      code: "CATEGORY_MISMATCH",
    };
  }

  return { allowed: true, reasons: [] };
}

test("PASS Core Isolation: External integration advice cannot override category violation", () => {
  const policy = {
    category: "GROCERIES",
    status: "ACTIVE",
    remaining: 100,
    maxPerTransaction: 50,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };

  const attempt = {
    merchantCategory: "ENTERTAINMENT",
    amount: 30,
    // External metadata or AI recommendation asserting approval
    aiApproved: true,
    solamiVerified: true,
  };

  const result = evaluatePayment(policy, attempt);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "CATEGORY_MISMATCH");
});

test("PASS Core Isolation: Expired PASS cannot authorize payment regardless of treasury liquidity", () => {
  const policy = {
    category: "GROCERIES",
    status: "ACTIVE",
    remaining: 100,
    maxPerTransaction: 50,
    expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
  };

  const attempt = {
    merchantCategory: "GROCERIES",
    amount: 20,
    meteoraPoolLiquidity: 1000000, // External signal
  };

  const result = evaluatePayment(policy, attempt);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.code, "EXPIRED");
});
