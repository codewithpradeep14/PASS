"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CreditCard, CheckCircle2, XCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { ALL_CATEGORIES, PassCategory } from "@/types";
import { ExpirationTimer } from "@/components/ExpirationTimer";

export default function RecipientPassCheckoutPage() {
  const params = useParams();
  const id = params?.id as string;

  const [pass, setPass] = useState<any>(null);
  const [merchantName, setMerchantName] = useState<string>("FreshMart Supermarket");
  const [category, setCategory] = useState<PassCategory>("GROCERIES");
  const [amount, setAmount] = useState<string>("32.50");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/passes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.pass) setPass(d.pass);
      })
      .catch((e) => console.error(e));
  }, [id]);

  const handlePay = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/payment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: id,
          merchantName,
          merchantCategory: category,
          amount: parseFloat(amount),
          recipient: pass?.recipientWallet || "Recipient",
          description: `Checkout at ${merchantName}`,
        }),
      });

      const data = await res.json();
      setResult(data);
      if (data.pass) setPass(data.pass);
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full space-y-6">
        <Link
          href="/recipient"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Recipient Portal
        </Link>

        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white">Recipient Checkout Terminal</h1>
            <p className="text-xs text-gray-400 mt-1">
              Authorized Category: <span className="text-emerald-400 font-bold">{pass?.category || "GROCERIES"}</span> • Remaining: ${pass?.remaining?.toFixed(2) || "100.00"}
            </p>
          </div>

          {pass?.expiresAt && (
            <ExpirationTimer expiresAt={pass.expiresAt} variant="banner" />
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Merchant Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Merchant Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PassCategory)}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Amount (USDC)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
            >
              {loading ? "Verifying Policy & Paying..." : "Pay with Authorized PASS"}
            </button>
          </div>

          {result && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 ${
                result.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {result.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Payment Approved on Solana Devnet!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Payment Blocked by Policy Engine!
                  </>
                )}
              </div>
              {result.reasons && (
                <div className="text-gray-300 text-[11px]">{result.reasons.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
