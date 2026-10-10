"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  TrendingUp,
  Cpu,
  Scale,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { SolamiPanel } from "@/components/integrations/SolamiPanel";
import { MeteoraPanel } from "@/components/integrations/MeteoraPanel";
import { PantaPanel } from "@/components/integrations/PantaPanel";
import { useUnifiedWallet } from "@/lib/wallet/UnifiedWalletContext";

export default function TreasuryPage() {
  const { address } = useUnifiedWallet();
  const [activeTab, setActiveTab] = useState<"ALL" | "SOLAMI" | "METEORA" | "PANTA">("ALL");
  const [stats, setStats] = useState({
    activePassesCount: 0,
    totalTreasuryBudget: 0,
    totalSpent: 0,
    remainingTreasury: 0,
  });
  const [integrationSummary, setIntegrationSummary] = useState<any>(null);

  useEffect(() => {
    // Fetch PASS budgets
    fetch("/api/passes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.passes)) {
          const passes = data.passes;
          const totalBudget = passes.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
          const totalSpent = passes.reduce((acc: number, p: any) => acc + (p.spent || 0), 0);
          setStats({
            activePassesCount: passes.filter((p: any) => p.status === "ACTIVE").length,
            totalTreasuryBudget: totalBudget,
            totalSpent,
            remainingTreasury: Math.max(0, totalBudget - totalSpent),
          });
        }
      })
      .catch(() => {});

    // Fetch integration health
    fetch("/api/integrations/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setIntegrationSummary(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono mb-2">
            <Coins className="w-3.5 h-3.5" />
            Project Treasury & Multi-Module Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Project Treasury
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Correlate PASS purpose-aware spending budgets with Solami on-chain monitoring, Meteora launch curves, and Panta prediction sentiment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app/create"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Allocate PASS Budget
          </Link>
          <Link
            href="/app/integrations"
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs border border-white/10 transition"
          >
            Module Settings
          </Link>
        </div>
      </div>

      {/* Top Treasury Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Total Treasury Budgets</span>
          <div className="text-2xl font-black font-mono text-white">
            ${stats.totalTreasuryBudget.toFixed(2)} USDC
          </div>
          <span className="text-[11px] text-gray-500 block">
            {stats.activePassesCount} Active PASS Escrow{stats.activePassesCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Remaining Spending Power</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${stats.remainingTreasury.toFixed(2)} USDC
          </div>
          <span className="text-[11px] text-emerald-500/80 block">
            Controlled by deterministic policy
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Total Spent / Settled</span>
          <div className="text-2xl font-black font-mono text-gray-200">
            ${stats.totalSpent.toFixed(2)} USDC
          </div>
          <span className="text-[11px] text-gray-500 block">
            Verified on Solana Devnet
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Active Integrations</span>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {integrationSummary?.summary?.connectedCount || 0} / 3 Connected
          </div>
          <span className="text-[11px] text-gray-500 block">
            {integrationSummary?.summary?.demoCount || 0} in Demo Mode
          </span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "ALL", label: "All Modules", icon: Coins },
          { id: "SOLAMI", label: "Solami Infrastructure", icon: Cpu },
          { id: "METEORA", label: "Meteora Launch Insights", icon: TrendingUp },
          { id: "PANTA", label: "Panta Market Insights", icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-white/10 text-white border border-white/20 shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Module Content Panels */}
      <div className="space-y-6">
        {(activeTab === "ALL" || activeTab === "SOLAMI") && (
          <SolamiPanel address={address || undefined} />
        )}

        {(activeTab === "ALL" || activeTab === "METEORA") && (
          <MeteoraPanel />
        )}

        {(activeTab === "ALL" || activeTab === "PANTA") && (
          <PantaPanel />
        )}
      </div>
    </div>
  );
}
