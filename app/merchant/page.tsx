"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Store,
  QrCode,
  ArrowRight,
} from "lucide-react";

export default function MerchantDashboardPage() {
  const [merchants, setMerchants] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/merchants")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.merchants) setMerchants(d.merchants);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase font-mono mb-2">
              <Store className="w-3.5 h-3.5" />
              Merchant Terminal
            </div>
            <h1 className="text-3xl font-extrabold text-white">Simulated Merchant Network</h1>
            <p className="text-sm text-gray-400 mt-1">
              Test real point-of-sale checkouts with pre-built grocery, cafe, transit, and gaming merchants.
            </p>
          </div>

          <Link
            href="/demo/simulation"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition self-start"
          >
            Launch 1-Click Story
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Today's PASS Volume</div>
            <div className="text-3xl font-black font-mono text-emerald-400">$143.50</div>
            <div className="text-[11px] text-gray-500 mt-1">Instant settlement on Solana</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Total PASS Transactions</div>
            <div className="text-3xl font-black font-mono text-white">5</div>
            <div className="text-[11px] text-emerald-400 mt-1">100% policy compliance</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Registered Terminals</div>
            <div className="text-3xl font-black font-mono text-white">{merchants.length || 5}</div>
            <div className="text-[11px] text-gray-500 mt-1">Category-tagged POS checkouts</div>
          </div>
        </div>

        {/* Merchant Cards Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Available Merchant Checkout Terminals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchants.map((m, idx) => (
              <div
                key={m.id || idx}
                className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      POS #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      {m.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3">{m.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {m.description || `Approved terminal for ${m.category} purchases.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={`/merchant/checkout/${m.id || idx}`}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Open Checkout Terminal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
