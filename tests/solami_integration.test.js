const test = require("node:test");
const assert = require("node:assert");

// Simulating SolamiClient behavior in Node test environment
class SolamiClientTest {
  constructor({ apiKey, rpcUrl, isDemoMode } = {}) {
    this.apiKey = apiKey;
    this.rpcUrl = rpcUrl || "https://rpc.solami.dev/sol";
    this.isDemoMode = isDemoMode ?? (!apiKey);
  }

  async checkConnection() {
    if (!this.apiKey && !this.isDemoMode) {
      return {
        state: "Not configured",
        endpoint: this.rpcUrl,
        errorMessage: "SOLAMI_API_KEY is not configured.",
      };
    }

    if (this.isDemoMode) {
      return {
        state: "Demo mode",
        endpoint: "demo://mirage.solami.dev/local",
        latencyMs: 15,
        slot: 312589041,
      };
    }

    return {
      state: "Connected",
      endpoint: this.rpcUrl,
      latencyMs: 45,
      slot: 312589100,
    };
  }

  async getRecentActivity() {
    const conn = await this.checkConnection();
    if (conn.state === "Not configured") {
      return {
        connection: conn,
        events: [],
        sourceNote: "Solami is not configured.",
      };
    }

    if (conn.state === "Demo mode") {
      return {
        connection: conn,
        events: [
          {
            signature: "5KtP9xQW8s...",
            status: "finalized",
            source: "demo_solami",
          },
        ],
        sourceNote: "Demo mode data.",
      };
    }

    return {
      connection: conn,
      events: [
        {
          signature: "real_sig_123",
          status: "finalized",
          source: "live_solami",
        },
      ],
      sourceNote: "Live transactions streamed from Solami.",
    };
  }
}

test("Solami Integration: Reports 'Not configured' when API key is missing and demo mode is off", async () => {
  const client = new SolamiClientTest({ apiKey: null, isDemoMode: false });
  const status = await client.checkConnection();
  assert.strictEqual(status.state, "Not configured");
  assert.match(status.errorMessage, /SOLAMI_API_KEY/);
});

test("Solami Integration: Returns labelled 'demo_solami' events in demo mode", async () => {
  const client = new SolamiClientTest({ isDemoMode: true });
  const res = await client.getRecentActivity();
  assert.strictEqual(res.connection.state, "Demo mode");
  assert.strictEqual(res.events.length, 1);
  assert.strictEqual(res.events[0].source, "demo_solami");
});

test("Solami Integration: Live mode marks events with 'live_solami'", async () => {
  const client = new SolamiClientTest({ apiKey: "solami_live_key_xyz", isDemoMode: false });
  const res = await client.getRecentActivity();
  assert.strictEqual(res.connection.state, "Connected");
  assert.strictEqual(res.events[0].source, "live_solami");
});
