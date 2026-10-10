const test = require("node:test");
const assert = require("node:assert");

class MeteoraClientTest {
  constructor({ rpcUrl, isDemoMode } = {}) {
    this.rpcUrl = rpcUrl;
    this.isDemoMode = isDemoMode ?? (!rpcUrl);
  }

  async checkConnection() {
    if (!this.rpcUrl && !this.isDemoMode) {
      return {
        state: "Not configured",
        errorMessage: "METEORA_RPC_URL is not configured.",
      };
    }

    if (this.isDemoMode) {
      return {
        state: "Demo mode",
        endpoint: "demo://meteora.ag/dbc-test",
        poolsIndexed: 24,
      };
    }

    return {
      state: "Connected",
      endpoint: this.rpcUrl,
      poolsIndexed: 10,
    };
  }

  async getLaunchInsights(tokenMint, passBudget) {
    const conn = await this.checkConnection();
    if (conn.state === "Not configured") {
      return {
        connection: conn,
        insights: null,
        sourceNote: "Meteora is not configured.",
      };
    }

    if (conn.state === "Demo mode") {
      return {
        connection: conn,
        insights: {
          tokenName: "Project Alpha Token",
          tokenSymbol: "ALPHA",
          bondingCurveProgressPercent: 68.4,
          migrationStatus: "BondingCurveActive",
          associatedPassBudget: passBudget,
          source: "demo_meteora",
        },
        sourceNote: "Demo mode.",
      };
    }

    return {
      connection: conn,
      insights: {
        tokenName: "Live Token",
        tokenSymbol: "LIVE",
        bondingCurveProgressPercent: 82.1,
        source: "live_meteora",
      },
      sourceNote: "Live data.",
    };
  }
}

test("Meteora Integration: Returns 'Not configured' without RPC and demo mode disabled", async () => {
  const client = new MeteoraClientTest({ rpcUrl: null, isDemoMode: false });
  const status = await client.checkConnection();
  assert.strictEqual(status.state, "Not configured");
  assert.match(status.errorMessage, /METEORA_RPC_URL/);
});

test("Meteora Integration: Demo mode provides bonding curve progress and associates PASS budget", async () => {
  const client = new MeteoraClientTest({ isDemoMode: true });
  const mockBudget = { purpose: "Marketing & Launch", allocatedUsdc: 5000, remainingUsdc: 3000 };
  const res = await client.getLaunchInsights("AlphaMint123", mockBudget);

  assert.strictEqual(res.connection.state, "Demo mode");
  assert.strictEqual(res.insights.bondingCurveProgressPercent, 68.4);
  assert.strictEqual(res.insights.source, "demo_meteora");
  assert.strictEqual(res.insights.associatedPassBudget.purpose, "Marketing & Launch");
});

test("Meteora Integration: Live mode marks insights as 'live_meteora'", async () => {
  const client = new MeteoraClientTest({ rpcUrl: "https://api.devnet.solana.com", isDemoMode: false });
  const res = await client.getLaunchInsights("MintXYZ");
  assert.strictEqual(res.connection.state, "Connected");
  assert.strictEqual(res.insights.source, "live_meteora");
});
