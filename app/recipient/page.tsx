"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { PassRecord } from "@/types";

export default function RecipientDashboardPage() {
  const { publicKey } = useWallet();
  const [recipientPasses, setRecipientPasses] = useState<PassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/passes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.passes?.length > 0) {
          setRecipientPasses(data.passes);
        } else {
          // Sample recipient pass for demo
          setRecipientPasses([
            {
              id: "pass_rahul_001",
              onchainPassAddress: "Pass111111111111111111111111111111111111111",
              ownerWallet: "Alice (0x7A...9F)",
              recipientWallet: publicKey?.toBase58() || "Rahul (0x8F...3A)",
              amount: 100.0,
              spent: 32.5,
              remaining: 67.5,
              purpose: "Groceries and household essentials",
              category: "GROCERIES",
              maxPerTransaction: 50.0,
              expiresAt: new Date(Date.now() + 172800000).toISOString(),
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recipient Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">Your Authorized PASSes</h1>
          <p className="text-sm text-gray-400 mt-1">
            View allocated spending allowances, allowed categories, and use your PASS at checkouts.
          </p>
        </div>

        {recipientPasses.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-white/10 text-center space-y-3">
            <CreditCard className="w-8 h-8 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No active PASS found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Ask the funding wallet owner to grant you a PASS with specific merchant category instructions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recipientPasses.map((pass, idx) => (
              <div
                key={pass.id || idx}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-xl shadow-emerald-500/5 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                      Authorized PASS #{String(idx + 1).padStart(3, "0")}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {pass.category} Allowance
                    </h2>
                    <p className="text-xs text-gray-400 italic mt-0.5">"{pass.purpose}"</p>
                  </div>

                  <span
                    className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase self-start ${
                      pass.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {pass.status}
                  </span>
                </div>

                {/* Balance display */}
                <div className="p-6 rounded-xl bg-[#090d16] border border-white/5 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-400">Available Spending Power</span>
                    <span className="text-xs text-gray-500">Original: ${pass.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-4xl font-black font-mono text-emerald-400 tracking-tight">
                    ${pass.remaining.toFixed(2)}{" "}
                    <span className="text-base font-normal text-gray-400">USDC</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${(pass.remaining / pass.amount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rules Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Allowed Category</span>
                    <span className="font-bold text-emerald-300">{pass.category}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Max Per Transaction</span>
                    <span className="font-mono text-gray-200">${pass.maxPerTransaction.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 col-span-2 sm:col-span-1">
                    <span className="text-gray-500 block">Valid Until</span>
                    <span className="text-gray-200">{new Date(pass.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/merchant"
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Spend at Simulated Merchant
                  </Link>

                  <Link
                    href={`/recipient/pass/${pass.id}`}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition"
                  >
                    Direct Checkout
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
