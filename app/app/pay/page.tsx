"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Store,
  ShieldCheck,
} from "lucide-react";
import { PassCategory, ALL_CATEGORIES } from "@/types";

export default function PayTerminalPage() {
  const { publicKey } = useWallet();
  const [passes, setPasses] = useState<any[]>([]);
  const [selectedPassId, setSelectedPassId] = useState<string>("");
  const [merchantName, setMerchantName] = useState<string>("FreshMart Supermarket");
  const [merchantCategory, setMerchantCategory] = useState<PassCategory>("GROCERIES");
  const [amount, setAmount] = useState<string>("32.50");
  const [description, setDescription] = useState<string>("Weekly groceries");

  const [checkResult, setCheckResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/passes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.passes?.length > 0) {
          setPasses(data.passes);
          setSelectedPassId(data.passes[0].id);
        } else {
          // Default mock pass
          const sample = {
            id: "sample_grocery_pass",
            purpose: "Groceries & daily food",
            category: "GROCERIES",
            remaining: 100.0,
            amount: 100.0,
            maxPerTransaction: 50.0,
            recipientWallet: publicKey?.toBase58() || "Bob (0x3C...1B)",
            status: "ACTIVE",
          };
          setPasses([sample]);
          setSelectedPassId(sample.id);
        }
      });
  }, [publicKey]);

  const selectedPass = passes.find((p) => p.id === selectedPassId) || passes[0];

  // Run policy evaluation check
  const handleCheckPolicy = async () => {
    setIsChecking(true);
    setCheckResult(null);
    setPaymentSuccess(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: selectedPass?.id,
          merchantCategory,
          amount: parseFloat(amount),
          recipient: selectedPass?.recipientWallet || "Bob",
        }),
      });

      const data = await res.json();
      setCheckResult(data);
    } catch (e: any) {
      setErrorMsg("Failed to run policy check.");
    } finally {
      setIsChecking(false);
    }
  };

  // Execute payment
  const handleExecutePayment = async () => {
    setIsPaying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/payment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: selectedPass?.id,
          merchantName,
          merchantCategory,
          amount: parseFloat(amount),
          recipient: selectedPass?.recipientWallet || "Bob",
          description,
          receiptItems: ["Item 1", "Item 2"],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(data);
        // Update local remaining balance
        if (data.pass) {
          setPasses((prev) =>
            prev.map((p) => (p.id === data.pass.id ? { ...p, ...data.pass } : p))
          );
        }
      } else if (data.blocked) {
        setCheckResult({ allowed: false, reasons: data.reasons });
      } else {
        throw new Error(data.error || "Payment execution failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Payment execution failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pay with PASS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Simulate a point-of-sale terminal payment to test policy approval or blocking rules.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        {/* Pass Selector */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400">Select Active PASS</label>
          <select
            value={selectedPassId}
            onChange={(e) => {
              setSelectedPassId(e.target.value);
              setCheckResult(null);
              setPaymentSuccess(null);
            }}
            className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            {passes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.category} — ${p.remaining?.toFixed(2)} remaining (Max/tx: ${p.maxPerTransaction})
              </option>
            ))}
          </select>
        </div>

        {/* Merchant preset quick pills */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400">Quick Merchant Presets</label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "FreshMart Supermarket", cat: "GROCERIES", amt: "32.50", desc: "Vegetables & milk" },
              { name: "Urban Cafe", cat: "FOOD", amt: "14.00", desc: "Coffee and sandwich" },
              { name: "Metro Transit", cat: "TRANSPORT", amt: "4.50", desc: "Subway pass" },
              { name: "Apex Gaming Store", cat: "ENTERTAINMENT", amt: "60.00", desc: "VR game title" },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMerchantName(preset.name);
                  setMerchantCategory(preset.cat as PassCategory);
                  setAmount(preset.amt);
                  setDescription(preset.desc);
                  setCheckResult(null);
                  setPaymentSuccess(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  merchantCategory === preset.cat
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/5 text-gray-400 hover:text-white border-white/5"
                }`}
              >
                {preset.name} ({preset.cat})
              </button>
            ))}
          </div>
        </div>

        {/* Merchant Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              value={merchantCategory}
              onChange={(e) => setMerchantCategory(e.target.value as PassCategory)}
              className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Payment Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-400">Description / Memo</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Policy Check Feedback */}
        {checkResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              checkResult.allowed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="font-bold flex items-center gap-2">
              {checkResult.allowed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  PASS Policy Evaluated: PAYMENT ALLOWED
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  PASS Policy Evaluated: PAYMENT BLOCKED
                </>
              )}
            </div>
            {checkResult.reasons?.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {checkResult.reasons.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Payment Success Result */}
        {paymentSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Solana Devnet Payment Confirmed!
            </div>
            <div className="text-[11px] font-mono break-all text-gray-300">
              Tx Signature: {paymentSuccess.payment?.txSignature}
            </div>
            <div className="text-[11px] text-emerald-400">
              New Remaining Balance: ${paymentSuccess.pass?.remaining?.toFixed(2)} USDC
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCheckPolicy}
            disabled={isChecking}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition"
          >
            {isChecking ? "Checking Policy..." : "1. Test Policy Rule"}
          </button>
          <button
            type="button"
            onClick={handleExecutePayment}
            disabled={isPaying}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {isPaying ? "Transacting on Devnet..." : "2. Execute Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
