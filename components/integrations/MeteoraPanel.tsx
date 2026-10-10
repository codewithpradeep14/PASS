"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { MeteoraConnectionStatus, MeteoraLaunchInsights } from "@/lib/integrations/meteora/types";

export function MeteoraPanel({ passId }: { passId?: string }) {
  const [connection, setConnection] = useState<MeteoraConnectionStatus | null>(null);
  const [insights, setInsights] = useState<MeteoraLaunchInsights | null>(null);
  const [sourceNote, setSourceNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const url = passId
        ? `/api/integrations/meteora?passId=${encodeURIComponent(passId)}`
        : "/api/integrations/meteora";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setConnection(data.connection);
        setInsights(data.insights);
        setSourceNote(data.sourceNote || "");
      }
    } catch (e) {
      console.error("MeteoraPanel fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [passId]);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/30 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Meteora Launch Insights</h3>
              {getStatusBadge(connection?.state)}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Dynamic Bonding Curves (DBC), token launch treasury progress, and DAMM v2 pool status.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 font-mono">
          Querying Meteora Dynamic Bonding Curves...
        </div>
      ) : !insights ? (
        <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
          <p className="text-xs text-gray-400">
            Meteora launch metrics are currently unconfigured or unavailable.
          </p>
          <p className="text-[11px] text-gray-500">
            Set <code className="text-emerald-400">METEORA_RPC_URL</code> or enable <code className="text-amber-300">METEORA_DEMO_MODE=true</code> to preview token launch treasury analytics.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Launch Card */}
          <div className="p-5 rounded-xl bg-[#090d16] border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">{insights.tokenName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    ${insights.tokenSymbol}
                  </span>
                  {insights.source === "demo_meteora" && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                      Demo
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Mint: {insights.tokenMint.slice(0, 16)}...
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-300">
                  Price: <span className="text-emerald-400">${insights.currentPriceUsdc.toFixed(4)} USDC</span>
                </span>
                <a
                  href={`https://app.meteora.ag`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                  title="Open Meteora App"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Bonding Curve Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span>Dynamic Bonding Curve Progress:</span>
                  <span className="text-white font-bold">{insights.bondingCurveProgressPercent}%</span>
                </span>
                <span className="text-gray-400">
                  Target DAMM Graduation: ${insights.targetMigrationLiquidityUsdc.toLocaleString()} USDC
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${insights.bondingCurveProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase">Market Cap</span>
                <span className="text-white font-bold block mt-0.5">
                  ${insights.marketCapUsdc.toLocaleString()} USDC
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase">Total Liquidity</span>
                <span className="text-emerald-400 font-bold block mt-0.5">
                  ${insights.totalLiquidityUsdc.toLocaleString()} USDC
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase">24h Volume</span>
                <span className="text-gray-200 block mt-0.5">
                  ${insights.volume24hUsdc.toLocaleString()} USDC
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-gray-500 block text-[10px] uppercase">Migration State</span>
                <span className="text-amber-300 font-bold block mt-0.5">
                  {insights.migrationStatus === "BondingCurveActive" ? "DBC Active" : "Graduated"}
                </span>
              </div>
            </div>
          </div>

          {/* Associated PASS Budget Link */}
          {insights.associatedPassBudget && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Correlated PASS Treasury Budget
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  Remaining: ${insights.associatedPassBudget.remainingUsdc.toFixed(2)} USDC
                </span>
              </div>
              <p className="text-gray-300 text-[11px]">
                {insights.associatedPassBudget.purpose}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 pt-1 border-t border-white/5">
                <span>Total Allocated: ${insights.associatedPassBudget.allocatedUsdc.toFixed(2)} USDC</span>
                <span>• Spent on Launch: ${insights.associatedPassBudget.spentUsdc.toFixed(2)} USDC</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-2">
        <span>{sourceNote}</span>
        <span className="text-gray-400 italic">
          *Meteora Launch Insights is read-only information for treasury oversight.
        </span>
      </div>
    </div>
  );
}
