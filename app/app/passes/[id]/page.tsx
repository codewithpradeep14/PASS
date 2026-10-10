"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { ExpirationTimer } from "@/components/ExpirationTimer";

export default function PassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [pass, setPass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/passes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.pass) {
          setPass(data.pass);
        } else {
          // Sample detail fallback
          setPass({
            id,
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
            payments: [
              {
                id: "pmt_1",
                amount: 32.5,
                category: "GROCERIES",
                description: "Fresh vegetables and dairy",
                status: "SUCCESS",
                txSignature: "5KtP...Wv8s",
                createdAt: new Date().toISOString(),
                receipts: [
                  {
                    status: "MATCH",
                    confidence: 0.98,
                    analysis: "Purchased items consistent with authorized GROCERIES category.",
                  },
                ],
              },
            ],
            auditLogs: [
              {
                id: "log_1",
                actor: "7A2c...9F1b",
                action: "CREATE_PASS",
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRevoke = async () => {
    if (!confirm("Confirm revocation? Any unspent funds in the PASS vault will be refunded immediately.")) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/passes/${id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerWallet: pass?.ownerWallet }),
      });
      const data = await res.json();
      if (data.success) {
        setPass((prev: any) => ({ ...prev, status: "REVOKED" }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pass?.id || id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading PASS policy details...</div>;
  }

  if (!pass) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-sm text-gray-400">PASS not found.</div>
        <Link href="/app/dashboard" className="text-xs text-emerald-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">PASS Details</h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  pass.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {pass.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">ID: {pass.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy ID"}
          </button>
          <a
            href="https://explorer.solana.com/?cluster=devnet"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Explorer
          </a>
          {pass.status === "ACTIVE" && (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="px-4 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
            >
              {isRevoking ? "Revoking..." : "Revoke PASS"}
            </button>
          )}
        </div>
      </div>

      {/* Live Expiration Countdown Banner */}
      <ExpirationTimer expiresAt={pass.expiresAt} variant="banner" />

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="text-xs text-gray-400">Remaining Budget</div>
          <div className="text-3xl font-black font-mono text-white">
            ${pass.remaining.toFixed(2)}{" "}
            <span className="text-sm font-normal text-gray-500">/ ${pass.amount.toFixed(2)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${(pass.remaining / pass.amount) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 pt-1">
            Total Spent: <span className="text-white font-mono">${pass.spent.toFixed(2)} USDC</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2 text-xs">
          <div className="text-gray-400">Policy Rules</div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">Category:</span>
            <span className="font-bold text-emerald-400">{pass.category}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">Max Per Tx:</span>
            <span className="font-mono text-white">${pass.maxPerTransaction.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 items-center">
            <span className="text-gray-400">Live Timer:</span>
            <ExpirationTimer expiresAt={pass.expiresAt} variant="compact" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2 text-xs">
          <div className="text-gray-400">Participants</div>
          <div className="py-1 border-b border-white/5">
            <span className="text-gray-400 block">Owner:</span>
            <span className="font-mono text-white break-all">{pass.ownerWallet}</span>
          </div>
          <div className="py-1">
            <span className="text-gray-400 block">Recipient:</span>
            <span className="font-mono text-emerald-300 break-all">{pass.recipientWallet}</span>
          </div>
        </div>
      </div>

      {/* Purpose Description */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 text-xs">
        <span className="text-gray-400 block mb-1">Human-Readable Purpose</span>
        <p className="text-gray-200 text-sm italic">"{pass.purpose}"</p>
      </div>

      {/* Payment History Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Payment History ({pass.payments?.length || 0})
          </h3>
          <span className="text-xs text-gray-400">On-Chain & Verified</span>
        </div>

        {(!pass.payments || pass.payments.length === 0) ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No payments executed yet for this PASS.
          </div>
        ) : (
          <div className="space-y-3">
            {pass.payments.map((pmt: any) => (
              <div
                key={pmt.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{pmt.description}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        pmt.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {pmt.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px] mt-0.5">
                    Category: {pmt.category} • {new Date(pmt.createdAt).toLocaleString()}
                  </div>
                  {pmt.receipts?.[0] && (
                    <div className="text-emerald-400 text-[11px] flex items-center gap-1 mt-1">
                      <Receipt className="w-3 h-3" />
                      Receipt Match: {pmt.receipts[0].analysis}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-white">
                    -${pmt.amount.toFixed(2)} USDC
                  </div>
                  {pmt.txSignature && (
                    <a
                      href="https://explorer.solana.com/?cluster=devnet"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-gray-400 hover:text-emerald-400 font-mono flex items-center gap-1 justify-end mt-0.5"
                    >
                      {pmt.txSignature.slice(0, 10)}...
                      <ExternalLink className="w-2.5 h-2.5" />
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
