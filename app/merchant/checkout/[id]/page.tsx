"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  CreditCard,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Sparkles,
} from "lucide-react";
import { PassCategory } from "@/types";

export default function MerchantCheckoutPage() {
  const params = useParams();
  const id = params?.id as string;

  const [passes, setPasses] = useState<any[]>([]);
  const [selectedPassId, setSelectedPassId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [receiptResult, setReceiptResult] = useState<any>(null);

  // Cart configurations depending on checkout id
  const isGamingStore = id === "4" || id === "m_4" || id?.includes("game");

  const merchantData = isGamingStore
    ? {
        name: "Apex Gaming & VR Zone",
        category: "ENTERTAINMENT" as PassCategory,
        items: [
          { name: "CyberStrike VR Game", price: 49.99 },
          { name: "Arcade Season Pass", price: 10.01 },
        ],
        total: 60.0,
      }
    : {
        name: "FreshMart Supermarket",
        category: "GROCERIES" as PassCategory,
        items: [
          { name: "Organic Whole Milk (1 Gal)", price: 4.5 },
          { name: "Artisan Sourdough Loaf", price: 5.0 },
          { name: "Fresh Seasonal Produce & Veggies", price: 23.0 },
        ],
        total: 32.5,
      };

  useEffect(() => {
    fetch("/api/passes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.passes?.length > 0) {
          setPasses(d.passes);
          setSelectedPassId(d.passes[0].id);
        } else {
          // Default demo pass
          const sample = {
            id: "grocery_pass_01",
            category: "GROCERIES",
            purpose: "Groceries and household items",
            amount: 100.0,
            remaining: 100.0,
            maxPerTransaction: 50.0,
            status: "ACTIVE",
          };
          setPasses([sample]);
          setSelectedPassId(sample.id);
        }
      });
  }, []);

  const selectedPass = passes.find((p) => p.id === selectedPassId) || passes[0];

  const handlePayWithPass = async () => {
    setIsProcessing(true);
    setCheckoutResult(null);
    setReceiptResult(null);

    try {
      const res = await fetch("/api/payment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: selectedPass?.id,
          merchantName: merchantData.name,
          merchantCategory: merchantData.category,
          amount: merchantData.total,
          recipient: selectedPass?.recipientWallet || "Recipient",
          description: `Checkout at ${merchantData.name}`,
          receiptItems: merchantData.items.map((i) => i.name),
        }),
      });

      const data = await res.json();
      setCheckoutResult(data);
      if (data.receiptAnalysis) {
        setReceiptResult(data.receiptAnalysis);
      }
    } catch (e: any) {
      setCheckoutResult({ success: false, error: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/merchant"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Merchants
          </Link>

          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {merchantData.category} TERMINAL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Details */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div>
              <div className="text-xs text-emerald-400 font-mono font-bold uppercase">Store Checkout</div>
              <h1 className="text-2xl font-extrabold text-white mt-1">{merchantData.name}</h1>
              <p className="text-xs text-gray-400 mt-1">Order #883921 • Verified Point of Sale</p>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 pt-2">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                Shopping Cart Line Items
              </span>
              <div className="divide-y divide-white/5 bg-[#090d16] rounded-xl p-4 border border-white/5">
                {merchantData.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs">
                    <span className="text-gray-200">{item.name}</span>
                    <span className="font-mono font-medium text-white">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-3 px-1 text-sm">
                <span className="font-bold text-gray-300">Total Due</span>
                <span className="text-2xl font-black font-mono text-white">
                  ${merchantData.total.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-gray-400">USDC</span>
                </span>
              </div>
            </div>

            {/* PASS Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-400">Select PASS to Fund This Payment</label>
              <select
                value={selectedPassId}
                onChange={(e) => {
                  setSelectedPassId(e.target.value);
                  setCheckoutResult(null);
                }}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {passes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.category} PASS — ${p.remaining?.toFixed(2)} available (Max/tx: ${p.maxPerTransaction})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePayWithPass}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {isProcessing ? "Evaluating Policy & Transacting..." : "Pay with PASS"}
            </button>
          </div>

          {/* Right Column: Live Policy Verification Result */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Policy Verification
              </h3>

              {!checkoutResult ? (
                <div className="py-8 text-center text-xs text-gray-500 leading-relaxed">
                  Click <span className="text-emerald-400 font-semibold">"Pay with PASS"</span> to trigger real-time policy evaluation.
                </div>
              ) : checkoutResult.success ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Payment Approved & Confirmed!
                    </div>
                    <p className="text-emerald-200 text-[11px] leading-relaxed">
                      Merchant category <span className="font-bold">{merchantData.category}</span> matches authorized PASS policy.
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-gray-400 break-all">
                      Tx: {checkoutResult.payment?.txSignature}
                    </div>
                  </div>

                  {receiptResult && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        AI Advisory Receipt Match
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        {receiptResult.reason}
                      </p>
                    </div>
                  )}

                  <a
                    href="https://explorer.solana.com/?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline pt-1 font-mono"
                  >
                    View On Solana Devnet Explorer
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                    <div className="font-bold text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      PAYMENT BLOCKED BY POLICY
                    </div>
                    <p className="text-rose-200 text-[11px] leading-relaxed">
                      This PASS is restricted to <span className="font-bold">{selectedPass?.category}</span>. Checkout category is <span className="font-bold">{merchantData.category}</span>.
                    </p>
                    {checkoutResult.reasons && (
                      <div className="text-[11px] text-gray-300 font-mono">
                        {checkoutResult.reasons.join("; ")}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400">
                    <span className="font-semibold text-white block mb-0.5">Safety Guarantee:</span>
                    Zero funds were deducted from your wallet. The smart contract blocked the transaction before settlement.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
