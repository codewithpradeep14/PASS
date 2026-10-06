"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, Receipt, Filter } from "lucide-react";

export default function HistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.payments?.length > 0) {
          setPayments(data.payments);
        } else {
          // Default history sample
          setPayments([
            {
              id: "pmt_001",
              amount: 32.5,
              category: "GROCERIES",
              description: "FreshMart Supermarket • Vegetables & Bread",
              status: "SUCCESS",
              txSignature: "5KtP...Wv8s",
              createdAt: new Date().toISOString(),
              receipts: [
                {
                  status: "MATCH",
                  confidence: 0.98,
                  analysis: "Items match authorized GROCERIES category.",
                },
              ],
            },
            {
              id: "pmt_002",
              amount: 60.0,
              category: "ENTERTAINMENT",
              description: "Apex Gaming & VR Zone",
              status: "BLOCKED",
              blockReason: "POLICY VIOLATION: PASS is restricted to GROCERIES.",
              txSignature: null,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "pmt_003",
              amount: 9.5,
              category: "GROCERIES",
              description: "Corner Market • Dairy",
              status: "SUCCESS",
              txSignature: "2M7x...Lp4a",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        }
      })
      .catch((e) => console.error(e))
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
            Complete cryptographic audit trail of approved payments and blocked violations.
          </p>
        </div>

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
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No transactions found matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
