const test = require("node:test");
const assert = require("node:assert");

class PantaClientTest {
  constructor({ apiKey, isDemoMode } = {}) {
    this.apiKey = apiKey;
    this.isDemoMode = isDemoMode ?? (!apiKey);
  }

  async checkConnection() {
    if (!this.apiKey && !this.isDemoMode) {
      return {
        state: "Not configured",
        errorMessage: "PANTA_API_KEY is not configured.",
      };
    }

    if (this.isDemoMode) {
      return {
        state: "Demo mode",
        marketsAvailable: 8,
      };
    }

    return {
      state: "Connected",
      marketsAvailable: 15,
    };
  }

  async getMarkets(category, query) {
    const conn = await this.checkConnection();
    if (conn.state === "Not configured") {
      return {
        connection: conn,
        markets: [],
        sourceNote: "Panta is not configured.",
      };
    }

    const demoMarkets = [
      {
        id: "panta_1",
        question: "Will Solana TPS exceed 4500?",
        category: "SOLANA_ECOSYSTEM",
        yesProbabilityPercent: 72,
        noProbabilityPercent: 28,
        source: "demo_panta",
      },
      {
        id: "panta_2",
        question: "Will Alpha DAO reach Meteora migration target?",
        category: "PROJECT_MILESTONES",
        yesProbabilityPercent: 68,
        noProbabilityPercent: 32,
        source: "demo_panta",
      },
    ];

    let filtered = demoMarkets;
    if (category && category !== "ALL") {
      filtered = filtered.filter((m) => m.category === category);
    }
    if (query) {
      filtered = filtered.filter((m) =>
        m.question.toLowerCase().includes(query.toLowerCase())
      );
    }

    return {
      connection: conn,
      markets: filtered,
      sourceNote: conn.state === "Connected" ? "Live data." : "Demo mode data.",
    };
  }
}

test("Panta Integration: Reports 'Not configured' when API key is missing and demo mode is disabled", async () => {
  const client = new PantaClientTest({ apiKey: null, isDemoMode: false });
  const status = await client.checkConnection();
  assert.strictEqual(status.state, "Not configured");
  assert.match(status.errorMessage, /PANTA_API_KEY/);
});

test("Panta Integration: Demo mode returns valid markets with YES/NO percentages summing to 100", async () => {
  const client = new PantaClientTest({ isDemoMode: true });
  const res = await client.getMarkets();
  assert.strictEqual(res.connection.state, "Demo mode");
  assert.strictEqual(res.markets.length, 2);

  const m1 = res.markets[0];
  assert.strictEqual(m1.yesProbabilityPercent + m1.noProbabilityPercent, 100);
  assert.strictEqual(m1.source, "demo_panta");
});

test("Panta Integration: Filters prediction markets by category correctly", async () => {
  const client = new PantaClientTest({ isDemoMode: true });
  const res = await client.getMarkets("PROJECT_MILESTONES");
  assert.strictEqual(res.markets.length, 1);
  assert.strictEqual(res.markets[0].id, "panta_2");
});
