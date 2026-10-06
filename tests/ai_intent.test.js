const test = require("node:test");
const assert = require("node:assert");

// Test intent extraction logic
function parseIntentDeterministically(instruction) {
  const text = instruction.trim();
  const lower = text.toLowerCase();

  const amountMatch = text.match(/\$?(\d+(\.\d+)?)\s*(usdc|usd|\$)?/i);
  if (!amountMatch || parseFloat(amountMatch[1]) <= 0) {
    return {
      success: false,
      clarification: "How much money would you like to allocate for this PASS (e.g. $100 USDC)?",
    };
  }
  const amount = parseFloat(amountMatch[1]);

  let category = "CUSTOM";
  let purpose = "General Expenses";

  if (lower.includes("grocer")) {
    category = "GROCERIES";
    purpose = "Groceries and household essentials";
  } else if (lower.includes("food") || lower.includes("lunch")) {
    category = "FOOD";
    purpose = "Food and dining";
  }

  const maxTxMatch = text.match(/max(?:imum)?\s*(?:of)?\s*\$?(\d+(\.\d+)?)/i);
  const maxPerTransaction = maxTxMatch
    ? Math.min(amount, parseFloat(maxTxMatch[1]))
    : Math.max(10, Math.min(amount, Math.round(amount * 0.5)));

  return {
    success: true,
    data: {
      amount,
      currency: "USDC",
      category,
      purpose,
      maxPerTransaction,
    },
  };
}

test("1. Natural language parse extracts amount, groceries, and max per transaction", () => {
  const res = parseIntentDeterministically("Give my brother $100 for groceries until Sunday with max $50");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.amount, 100);
  assert.strictEqual(res.data.category, "GROCERIES");
  assert.strictEqual(res.data.maxPerTransaction, 50);
});

test("2. Ambiguous missing amount asks for clarification", () => {
  const res = parseIntentDeterministically("Give my brother some money for groceries");
  assert.strictEqual(res.success, false);
  assert.match(res.clarification, /How much money/);
});
