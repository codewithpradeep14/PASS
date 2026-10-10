"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Receipt,
  Filter,
  History,
  CreditCard,
  PlusCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function HistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      })
      .catch((e) => {
        console.error("Failed to load payments:", e);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payment History
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time cryptographic audit trail of approved payments, on-chain signatures, and blocked violations.
          </p>
        </div>

        {payments.length > 0 && (
          <div className="flex items-center gap-2">
            {["ALL", "SUCCESS", "BLOCKED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === f
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono">
            Loading cryptographic audit logs...
          </div>
        ) : payments.length === 0 ? (
          /* Clean New User Empty State */
          <div className="p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <History className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">No Payments Executed Yet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                As a new user, your audit trail starts fresh. When you or your recipient make a payment using a PASS, every transaction, category rule evaluation, and Solana Devnet signature will be immutably recorded here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/app/create"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Create a PASS
              </Link>
              <Link
                href="/app/pay"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition"
              >
                <CreditCard className="w-4 h-4" />
                Pay with PASS
              </Link>
              <Link
                href="/demo/simulation"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs border border-emerald-500/20 flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Demo
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No transactions found matching the &quot;{filter}&quot; filter.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {item.status === "SUCCESS" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.description}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      Category: <span className="text-gray-300 font-medium">{item.category}</span> •{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>

                    {item.blockReason && (
                      <div className="text-xs text-rose-400 font-medium pt-1">
                        Reason: {item.blockReason}
                      </div>
                    )}

                    {item.receipts?.[0] && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-0.5">
                        <Receipt className="w-3 h-3" />
                        AI Verified: {item.receipts[0].analysis}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div
                    className={`font-mono text-base font-bold ${
                      item.status === "SUCCESS" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.status === "SUCCESS" ? "-" : ""}${item.amount.toFixed(2)} USDC
                  </div>

                  {item.txSignature && (
                    <a
                      href="https://explorer.solana.com/?cluster=devnet"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gray-400 hover:text-emerald-400 font-mono inline-flex items-center gap-1 mt-0.5"
                    >
                      {item.txSignature.slice(0, 10)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
