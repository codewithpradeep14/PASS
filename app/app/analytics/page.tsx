"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PieChart,
  Wallet,
} from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({
    totalAllocated: 500.0,
    totalSpent: 143.5,
    totalRemaining: 356.5,
    approvedPaymentsCount: 5,
    blockedPaymentsCount: 1,
    categorySpending: {
      GROCERIES: 82.0,
      TRANSPORT: 40.0,
      FOOD: 21.5,
      ENTERTAINMENT: 0.0,
    },
    blockedByCategory: {
      ENTERTAINMENT: { count: 1, volume: 60.0 },
    },
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analytics & Policy Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Deep breakdown of authorized spending, categorized usage, and prevented policy violations.
        </p>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Approved Payment Volume</div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            ${analytics.totalSpent?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {analytics.approvedPaymentsCount} verified transactions
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Prevented Unauthorized Spending</div>
          <div className="text-3xl font-black font-mono text-rose-400">
            $60.00
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {analytics.blockedPaymentsCount || 1} violations stopped at point-of-sale
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Active Vault Reserve</div>
          <div className="text-3xl font-black font-mono text-white">
            ${analytics.totalRemaining?.toFixed(2)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Protected across Solana PDAs
          </div>
        </div>
      </div>

      {/* Spending Breakdown by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Approved Spending by Category
            </h3>
            <span className="text-xs text-gray-400">USDC Volume</span>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.categorySpending || {}).map(([cat, amount]: [string, any]) => {
              const pct = (amount / (analytics.totalSpent || 1)) * 100;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{cat}</span>
                    <span className="font-mono text-gray-300">
                      ${amount.toFixed(2)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prevented Violations by Category */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Blocked Policy Violations
            </h3>
            <span className="text-xs text-rose-400 font-mono font-semibold">Protected</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">ENTERTAINMENT (e.g. Apex Gaming Store)</span>
                <span className="font-mono text-rose-400 font-bold">$60.00 Saved</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Attempted purchase blocked because recipient's PASS is restricted to GROCERIES only. Zero lamports transferred.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="font-semibold text-gray-300">Total Policy Enforcement Rate</div>
              <div className="text-emerald-400 font-mono font-bold text-sm">
                100% Deterministic Smart Contract Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
