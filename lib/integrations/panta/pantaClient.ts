import { PantaConnectionStatus, PantaMarket } from "./types";

export class PantaClient {
  private baseUrl: string;
  private apiKey?: string;
  private isDemoMode: boolean;

  constructor() {
    this.baseUrl =
      process.env.PANTA_API_BASE_URL || "https://live-api.panta.market/api/v1";
    this.apiKey = process.env.PANTA_API_KEY;
    this.isDemoMode =
      process.env.PANTA_DEMO_MODE === "true" || !process.env.PANTA_API_KEY;
  }

  async checkConnection(): Promise<PantaConnectionStatus> {
    const lastChecked = new Date().toISOString();

    if (!this.apiKey && process.env.PANTA_DEMO_MODE !== "true") {
      return {
        state: "Not configured",
        apiBaseUrl: this.baseUrl,
        lastChecked,
        errorMessage:
          "PANTA_API_KEY is not configured in .env. Obtain an API key from panta.market or set PANTA_DEMO_MODE=true for research simulation.",
      };
    }

    if (!this.apiKey && process.env.PANTA_DEMO_MODE === "true") {
      return {
        state: "Demo mode",
        apiBaseUrl: "demo://api.panta.market/v1",
        lastChecked,
        marketsAvailable: 8,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) {
        headers["X-Api-Key"] = this.apiKey;
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(`${this.baseUrl}/markets`, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const count = Array.isArray(json?.markets)
          ? json.markets.length
          : Array.isArray(json)
          ? json.length
          : 5;
        return {
          state: "Connected",
          apiBaseUrl: this.baseUrl,
          lastChecked,
          marketsAvailable: count,
        };
      }

      return {
        state: "Temporarily unavailable",
        apiBaseUrl: this.baseUrl,
        lastChecked,
        errorMessage: `Panta API returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (e: any) {
      return {
        state: "Temporarily unavailable",
        apiBaseUrl: this.baseUrl,
        lastChecked,
        errorMessage: e.message || "Failed to reach Panta API endpoint.",
      };
    }
  }

  async getMarkets(
    category?: string,
    query?: string
  ): Promise<{
    connection: PantaConnectionStatus;
    markets: PantaMarket[];
    sourceNote: string;
  }> {
    const connection = await this.checkConnection();

    if (connection.state === "Not configured") {
      return {
        connection,
        markets: [],
        sourceNote:
          "Panta is not configured. Add PANTA_API_KEY to fetch live prediction market probabilities and sentiment.",
      };
    }

    if (connection.state === "Connected" && this.apiKey) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
          Authorization: `Bearer ${this.apiKey}`,
        };

        const res = await fetch(`${this.baseUrl}/markets`, { headers });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.markets) ? json.markets : json;
          if (Array.isArray(list)) {
            const mapped: PantaMarket[] = list.map((m: any) => ({
              id: m.id || m.marketId,
              question: m.question || m.title,
              description: m.description || "",
              category: m.category || "SOLANA_ECOSYSTEM",
              yesPrice: Number(m.yesPrice || 0.5),
              noPrice: Number(m.noPrice || 0.5),
              yesProbabilityPercent: Math.round(Number(m.yesPrice || 0.5) * 100),
              noProbabilityPercent: Math.round(Number(m.noPrice || 0.5) * 100),
              volumeUsdc: Number(m.volume || 1000),
              totalPoolUsdc: Number(m.pool || 5000),
              status: m.status || "ACTIVE",
              resolutionDate: m.resolutionDate || new Date().toISOString(),
              pantaUrl: `https://panta.market/market/${m.id}`,
              source: "live_panta",
            }));

            return {
              connection,
              markets: mapped,
              sourceNote: "Live market data retrieved from Panta Market API.",
            };
          }
        }
      } catch (e) {
        console.warn("Live Panta fetch failed, falling back safely:", e);
      }
    }

    // Demo Mode Prediction Markets
    const demoMarkets: PantaMarket[] = [
      {
        id: "panta_solana_tps",
        question: "Will Solana Mainnet sustained TPS exceed 4,500 before end of 2026?",
        description:
          "Market resolves YES if Solana sustained non-vote TPS exceeds 4,500 on official dashboard.",
        category: "SOLANA_ECOSYSTEM",
        yesPrice: 0.72,
        noPrice: 0.28,
        yesProbabilityPercent: 72,
        noProbabilityPercent: 28,
        volumeUsdc: 84200,
        totalPoolUsdc: 154000,
        status: "ACTIVE",
        resolutionDate: new Date(Date.now() + 86400000 * 45).toISOString(),
        pantaUrl: "https://panta.market/market/solana-tps-2026",
        source: "demo_panta",
      },
      {
        id: "panta_meteora_launch",
        question: "Will Alpha DAO reach Meteora DAMM migration target ($100k USDC)?",
        description:
          "Market resolves YES if Alpha token dynamic bonding curve graduates to DAMM v2 pool.",
        category: "PROJECT_MILESTONES",
        yesPrice: 0.68,
        noPrice: 0.32,
        yesProbabilityPercent: 68,
        noProbabilityPercent: 32,
        volumeUsdc: 45000,
        totalPoolUsdc: 92000,
        status: "ACTIVE",
        resolutionDate: new Date(Date.now() + 86400000 * 20).toISOString(),
        pantaUrl: "https://panta.market/market/alpha-dao-damm-migration",
        source: "demo_panta",
      },
      {
        id: "panta_pass_hackathon",
        question: "Will PASS Protocol record > 500 verified merchant transactions on Devnet?",
        description:
          "Market resolves YES based on PASS on-chain PDA escrow transaction audit logs.",
        category: "GOVERNANCE",
        yesPrice: 0.85,
        noPrice: 0.15,
        yesProbabilityPercent: 85,
        noProbabilityPercent: 15,
        volumeUsdc: 32400,
        totalPoolUsdc: 71000,
        status: "ACTIVE",
        resolutionDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        pantaUrl: "https://panta.market/market/pass-protocol-hackathon-volume",
        source: "demo_panta",
      },
    ];

    let filtered = demoMarkets;
    if (category && category !== "ALL") {
      filtered = filtered.filter((m) => m.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.question.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    return {
      connection,
      markets: filtered,
      sourceNote:
        "Demo mode: Curated simulated prediction markets reflecting Solana ecosystem and treasury milestones.",
    };
  }
}

export const pantaClient = new PantaClient();
