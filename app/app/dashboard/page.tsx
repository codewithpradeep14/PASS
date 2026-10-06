"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PlusCircle,
  TrendingUp,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Ban,
  Layers,
  Sparkles,
} from "lucide-react";
import { PassRecord } from "@/types";

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [passes, setPasses] = useState<PassRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalAllocated: 500.0,
    totalSpent: 143.5,
    totalRemaining: 356.5,
    activePassesCount: 3,
    approvedPaymentsCount: 5,
    blockedPaymentsCount: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [resPasses, resAnalytics] = await Promise.all([
        fetch("/api/passes"),
        fetch("/api/analytics"),
      ]);

      const dataPasses = await resPasses.json();
      const dataAnalytics = await resAnalytics.json();

      if (dataPasses.success && dataPasses.passes?.length > 0) {
        setPasses(dataPasses.passes);
      } else {
        // Fallback default sample data if no passes created yet
        setPasses([
          {
            id: "sample_1",
            onchainPassAddress: "Pass111111111111111111111111111111111111111",
            ownerWallet: publicKey?.toBase58() || "7A2c...9F1b",
            recipientWallet: "Rahul (0x8F...3A)",
            amount: 100.0,
            spent: 42.0,
            remaining: 58.0,
            purpose: "Groceries and household essentials",
            category: "GROCERIES",
            maxPerTransaction: 50.0,
            expiresAt: new Date(Date.now() + 172800000).toISOString(),
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          {
            id: "sample_2",
            onchainPassAddress: "Pass222222222222222222222222222222222222222",
            ownerWallet: publicKey?.toBase58() || "7A2c...9F1b",
            recipientWallet: "Sarah (0x5E...8D)",
            amount: 150.0,
            spent: 60.0,
            remaining: 90.0,
            purpose: "Office commute & transit passes",
            category: "TRANSPORT",
            maxPerTransaction: 30.0,
            expiresAt: new Date(Date.now() + 432000000).toISOString(),
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          {
            id: "sample_3",
            onchainPassAddress: "Pass333333333333333333333333333333333333333",
            ownerWallet: publicKey?.toBase58() || "7A2c...9F1b",
            recipientWallet: "Dev Team (0x2C...4A)",
            amount: 250.0,
            spent: 41.5,
            remaining: 208.5,
            purpose: "Cloud hosting and developer tooling",
            category: "WORK",
            maxPerTransaction: 100.0,
            expiresAt: new Date(Date.now() + 864000000).toISOString(),
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      if (dataAnalytics.success && dataAnalytics.analytics) {
        setAnalytics(dataAnalytics.analytics);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [publicKey]);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this PASS? Any remaining balance will be refunded.")) return;
    setRevokingId(id);
    try {
      const res = await fetch(`/api/passes/${id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerWallet: publicKey?.toBase58() }),
      });
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Monitor allocated budgets, active policies, and real-time Solana spending permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demo/simulation"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Demo
          </Link>
          <Link
            href="/app/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            Create a PASS
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Allocated</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${analytics.totalAllocated?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Across all PASS accounts</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Spent</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${analytics.totalSpent?.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {((analytics.totalSpent / (analytics.totalAllocated || 1)) * 100).toFixed(0)}% budget utilized
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Remaining Reserve</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${analytics.totalRemaining?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Safe & unspent in vaults</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Active PASSes</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {analytics.activePassesCount}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enforcing on Solana Devnet
          </div>
        </div>
      </div>

      {/* Active PASS Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Active PASS Allocations
          </h2>
          <Link href="/app/passes" className="text-xs text-emerald-400 hover:underline">
            View All ({passes.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {passes.map((p, idx) => (
            <div
              key={p.id || idx}
              className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    PASS #{String(idx + 1).padStart(3, "0")}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="text-xs text-gray-400">
                    Recipient: <span className="text-white font-medium">{p.recipientWallet}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Purpose: <span className="text-emerald-300 font-semibold">{p.category}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 line-clamp-1 italic">
                    "{p.purpose}"
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-gray-400">Spent: ${p.spent.toFixed(2)}</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ${p.remaining.toFixed(2)}{" "}
                      <span className="text-xs text-gray-500">/ ${p.amount.toFixed(2)}</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${(p.remaining / p.amount) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Max/tx: ${p.maxPerTransaction.toFixed(2)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(p.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <Link
                  href={`/app/passes/${p.id}`}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center border border-white/10 transition"
                >
                  View Details
                </Link>
                {p.status === "ACTIVE" && (
                  <button
                    onClick={() => handleRevoke(p.id)}
                    disabled={revokingId === p.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
                  >
                    {revokingId === p.id ? "Revoking..." : "Revoke"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged and Policy Violations Highlight */}
      <div className="glass-card p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Live Policy Enforcement Log</h3>
          </div>
          <span className="text-xs text-gray-400">Automated Protection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Allowed Groceries Payment</div>
              <div className="text-emerald-300 mt-0.5">
                $32.50 to FreshMart Supermarket was approved. Purpose: GROCERIES.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Blocked Entertainment Violation</div>
              <div className="text-rose-300 mt-0.5">
                $60.00 to Apex Gaming Store was denied. Policy requires GROCERIES. Funds preserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
