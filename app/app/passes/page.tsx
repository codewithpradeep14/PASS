"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Filter, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { PassRecord } from "@/types";
import { ExpirationTimer } from "@/components/ExpirationTimer";

export default function PassesListPage() {
  const [passes, setPasses] = useState<PassRecord[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/passes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.passes?.length > 0) {
          setPasses(data.passes);
        } else {
          // Default samples
          setPasses([
            {
              id: "sample_1",
              onchainPassAddress: "Pass111111111111111111111111111111111111111",
              ownerWallet: "7A2c...9F1b",
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
              ownerWallet: "7A2c...9F1b",
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
          ]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredPasses = passes.filter((p) => {
    if (filter !== "ALL" && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.recipientWallet.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My PASSes
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage all active, revoked, and expired spending permissions you have issued.
          </p>
        </div>

        <Link
          href="/app/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Create New PASS
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, purpose, or category..."
            className="w-full bg-[#0c121e] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "ACTIVE", "REVOKED", "DEPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
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

      {/* Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPasses.map((p, idx) => (
          <div
            key={p.id || idx}
            className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4"
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
                  Category: <span className="text-emerald-300 font-semibold">{p.category}</span>
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

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${(p.remaining / p.amount) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Max/tx: ${p.maxPerTransaction.toFixed(2)}</span>
                  <ExpirationTimer expiresAt={p.expiresAt} variant="compact" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <Link
                href={`/app/passes/${p.id}`}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold block text-center border border-white/10 transition"
              >
                View Policy & Audit Log
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
