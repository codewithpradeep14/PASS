"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { PantaConnectionStatus, PantaMarket } from "@/lib/integrations/panta/types";

export function PantaPanel() {
  const [connection, setConnection] = useState<PantaConnectionStatus | null>(null);
  const [markets, setMarkets] = useState<PantaMarket[]>([]);
  const [sourceNote, setSourceNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.set("category", category);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/integrations/panta?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setConnection(data.connection);
        setMarkets(data.markets || []);
        setSourceNote(data.sourceNote || "");
      }
    } catch (e) {
      console.error("PantaPanel fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const getStatusBadge = (state?: string) => {
    switch (state) {
      case "Connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        );
      case "Demo mode":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Demo Mode
          </span>
        );
      case "Temporarily unavailable":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/30 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Panta Market Insights</h3>
              {getStatusBadge(connection?.state)}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Decentralized prediction markets, ecosystem sentiment & treasury research signals.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Markets
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prediction markets (e.g. Solana, TPS, Milestones)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "SOLANA_ECOSYSTEM", label: "Solana" },
            { id: "PROJECT_MILESTONES", label: "Milestones" },
            { id: "GOVERNANCE", label: "Governance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === tab.id
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Markets List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 font-mono">
          Connecting to Panta Prediction Market API...
        </div>
      ) : markets.length === 0 ? (
        <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
          <p className="text-xs text-gray-400">
            No prediction markets found matching this criteria.
          </p>
          {connection?.state === "Not configured" && (
            <p className="text-[11px] text-gray-500">
              Set <code className="text-purple-400">PANTA_API_KEY</code> in <code className="text-gray-400">.env</code> or enable <code className="text-amber-300">PANTA_DEMO_MODE=true</code> to discover prediction markets.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {markets.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-purple-500/20 text-purple-300">
                      {m.category.replace("_", " ")}
                    </span>
                    {m.source === "demo_panta" && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                        Demo
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {m.question}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <a
                  href={m.pantaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1 text-[11px] font-mono self-start"
                  title="View on Panta Market"
                >
                  Panta <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Outcome Probability Bars */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    YES: {m.yesProbabilityPercent}% (${m.yesPrice.toFixed(2)})
                  </span>
                  <span className="text-rose-400 font-bold">
                    NO: {m.noProbabilityPercent}% (${m.noPrice.toFixed(2)})
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${m.yesProbabilityPercent}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${m.noProbabilityPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-1 border-t border-white/5">
                <span>Total Pool: ${m.totalPoolUsdc.toLocaleString()} USDC</span>
                <span>24h Vol: ${m.volumeUsdc.toLocaleString()} USDC</span>
                <span>Resolves: {new Date(m.resolutionDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-2">
        <span>{sourceNote}</span>
        <span className="text-gray-400 italic">
          *Panta insights provide sentiment research; payments require PASS deterministic rule checks.
        </span>
      </div>
    </div>
  );
}
