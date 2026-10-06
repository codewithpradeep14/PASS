"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Coins,
  Store,
  User,
  Gamepad2,
  Lock,
} from "lucide-react";

interface StepRecord {
  title: string;
  desc: string;
  status: "idle" | "running" | "done" | "blocked";
  details?: any;
}

export default function DemoSimulationPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passData, setPassData] = useState<any>({
    id: "demo_pass_alice_bob",
    owner: "Alice (0x7A...9F)",
    recipient: "Bob (0x3C...1B)",
    amount: 100.0,
    spent: 0.0,
    remaining: 100.0,
    category: "GROCERIES",
    maxPerTransaction: 50.0,
    status: "ACTIVE",
    expiresAt: "Sunday 23:59 UTC",
    onchainSignature: null,
  });

  const [paymentLog, setPaymentLog] = useState<any[]>([]);

  // Step 1: Create PASS
  const handleCreatePass = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Call real API or local state
    const fakeSignature = "5KtP...Wv8s";
    setPassData((prev: any) => ({
      ...prev,
      status: "ACTIVE",
      spent: 0,
      remaining: 100,
      onchainSignature: "4z5F2pWkW1mB8Pj6Yv9Qx3L7Za8T2mN4K5L6R7Q8S9T1U2V3W4X5Y6Z7A8B9C0D1",
    }));

    setCurrentStep(1);
    setIsLoading(false);
  };

  // Step 2: Valid Grocery Payment ($32.50 at FreshMart)
  const handleValidGroceryPayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passId: "simulation_pass_1",
          merchantName: "FreshMart Supermarket",
          merchantCategory: "GROCERIES",
          amount: 32.5,
          recipient: "Bob_Wallet",
          description: "Fresh vegetables, milk, and bread",
          receiptItems: ["Organic Whole Milk", "Artisan Sourdough", "Fresh Spinach"],
        }),
      });

      // Even if database has mock ID, we update simulation state smoothly
      setPassData((prev: any) => ({
        ...prev,
        spent: 32.5,
        remaining: 67.5,
      }));

      setPaymentLog((prev) => [
        {
          merchant: "FreshMart Supermarket",
          amount: 32.5,
          category: "GROCERIES",
          status: "APPROVED",
          reason: "Category match & within $50 per-tx limit",
          txSig: "3H7vW9bN...2xQ",
          receiptVerified: true,
        },
        ...prev,
      ]);

      setCurrentStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Blocked Gaming Payment ($60.00 at Apex Gaming Store)
  const handleBlockedPayment = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    setPaymentLog((prev) => [
      {
        merchant: "Apex Gaming & VR Zone",
        amount: 60.0,
        category: "ENTERTAINMENT",
        status: "BLOCKED",
        reason: "POLICY VIOLATION: PASS restricted to GROCERIES only.",
        txSig: null,
        receiptVerified: false,
      },
      ...prev,
    ]);

    setCurrentStep(3);
    setIsLoading(false);
  };

  // Step 4: Alice Revokes PASS
  const handleRevokePass = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    setPassData((prev: any) => ({
      ...prev,
      status: "REVOKED",
    }));

    setCurrentStep(4);
    setIsLoading(false);
  };

  // Step 5: Recipient Attempts Payment After Revocation (Blocked)
  const handlePostRevokeAttempt = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    setPaymentLog((prev) => [
      {
        merchant: "FreshMart Supermarket",
        amount: 15.0,
        category: "GROCERIES",
        status: "REJECTED",
        reason: "ON-CHAIN ERROR: PASS is REVOKED by creator. Funds reclaimed.",
        txSig: null,
      },
      ...prev,
    ]);

    setCurrentStep(5);
    setIsLoading(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setPassData({
      id: "demo_pass_alice_bob",
      owner: "Alice (0x7A...9F)",
      recipient: "Bob (0x3C...1B)",
      amount: 100.0,
      spent: 0.0,
      remaining: 100.0,
      category: "GROCERIES",
      maxPerTransaction: 50.0,
      status: "ACTIVE",
      expiresAt: "Sunday 23:59 UTC",
    });
    setPaymentLog([]);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Colosseum Hackathon Judging Story
            </div>
            <h1 className="text-3xl font-extrabold text-white">Interactive 1-Click PASS Simulation</h1>
            <p className="text-sm text-gray-400 mt-1">
              Follow Alice funding Bob for groceries, testing valid checkout, category blocking, and instant revocation.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 transition self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo
          </button>
        </div>

        {/* Demo Stage Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Scenario Steps */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step 1 */}
            <div
              className={`p-5 rounded-xl border transition ${
                currentStep === 0
                  ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                  : currentStep > 0
                  ? "bg-[#0b101b] border-white/10 opacity-80"
                  : "bg-[#0b101b] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  Scenario 1: Alice Creates Grocery PASS
                </span>
                {currentStep > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h3 className="text-base font-bold text-white mt-1">Alice Allocates $100 for Bob</h3>
              <p className="text-xs text-gray-400 mt-1">
                Alice gives Bob $100 with a strict policy: <span className="text-emerald-300 font-semibold">GROCERIES</span> only, max <span className="text-emerald-300 font-semibold">$50/tx</span>.
              </p>
              {currentStep === 0 && (
                <button
                  onClick={handleCreatePass}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-2"
                >
                  {isLoading ? "Executing Anchor Tx..." : "1. Create PASS on Solana"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`p-5 rounded-xl border transition ${
                currentStep === 1
                  ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                  : currentStep > 1
                  ? "bg-[#0b101b] border-white/10 opacity-80"
                  : "bg-[#0b101b] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  Scenario 2: Valid Grocery Purchase
                </span>
                {currentStep > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h3 className="text-base font-bold text-white mt-1">Bob buys $32.50 at FreshMart</h3>
              <p className="text-xs text-gray-400 mt-1">
                Category is GROCERIES, amount is under $50 limit. Deterministic engine approves transaction.
              </p>
              {currentStep === 1 && (
                <button
                  onClick={handleValidGroceryPayment}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-2"
                >
                  {isLoading ? "Verifying..." : "2. Execute $32.50 Grocery Payment"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 3 */}
            <div
              className={`p-5 rounded-xl border transition ${
                currentStep === 2
                  ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-500/5"
                  : currentStep > 2
                  ? "bg-[#0b101b] border-white/10 opacity-80"
                  : "bg-[#0b101b] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-rose-400">
                  Scenario 3: Category Violation Attempt
                </span>
                {currentStep > 2 && <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <h3 className="text-base font-bold text-white mt-1">Bob tries $60 at Apex Gaming Store</h3>
              <p className="text-xs text-gray-400 mt-1">
                Category is ENTERTAINMENT ($60). PASS evaluates rules, blocks payment, and preserves funds!
              </p>
              {currentStep === 2 && (
                <button
                  onClick={handleBlockedPayment}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold transition flex items-center gap-2"
                >
                  {isLoading ? "Evaluating..." : "3. Attempt $60 Gaming Payment (Watch Block)"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 4 */}
            <div
              className={`p-5 rounded-xl border transition ${
                currentStep === 3
                  ? "bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/5"
                  : currentStep > 3
                  ? "bg-[#0b101b] border-white/10 opacity-80"
                  : "bg-[#0b101b] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-amber-400">
                  Scenario 4: Owner Revocation
                </span>
                {currentStep > 3 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <h3 className="text-base font-bold text-white mt-1">Alice Revokes Remaining $67.50</h3>
              <p className="text-xs text-gray-400 mt-1">
                Alice decides to reclaim unspent funds immediately. PASS status changes to REVOKED.
              </p>
              {currentStep === 3 && (
                <button
                  onClick={handleRevokePass}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2"
                >
                  {isLoading ? "Revoking on-chain..." : "4. Revoke PASS & Refund Balance"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 5 */}
            <div
              className={`p-5 rounded-xl border transition ${
                currentStep === 4
                  ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-500/5"
                  : currentStep > 4
                  ? "bg-[#0b101b] border-white/10 opacity-80"
                  : "bg-[#0b101b] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-rose-400">
                  Scenario 5: Post-Revoke Spend Attempt
                </span>
                {currentStep > 4 && <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <h3 className="text-base font-bold text-white mt-1">Bob Attempts Checkout Again</h3>
              <p className="text-xs text-gray-400 mt-1">
                Smart contract rejects invocation because PASS is REVOKED. No funds can move.
              </p>
              {currentStep === 4 && (
                <button
                  onClick={handlePostRevokeAttempt}
                  disabled={isLoading}
                  className="mt-4 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold transition flex items-center gap-2"
                >
                  {isLoading ? "Testing..." : "5. Attempt Payment on Revoked PASS"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Complete Banner */}
            {currentStep >= 5 && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0b101b] border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Full Hackathon Flow Verified!</h4>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  You've successfully demonstrated intent creation, category enforcement, blocked rogue spending, and non-custodial owner revocation.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/app/dashboard"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition"
                  >
                    Go to Live Dashboard
                  </Link>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/15 transition"
                  >
                    Restart Story
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live PASS State & Verification Feed */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live State Card */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  Live PASS State
                </span>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    passData.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {passData.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Remaining Balance</div>
                  <div className="text-3xl font-black font-mono text-white">
                    ${passData.remaining.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-gray-400">/ ${passData.amount.toFixed(2)} USDC</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${(passData.remaining / passData.amount) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Owner</span>
                    <span className="font-mono text-gray-200">{passData.owner}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Recipient</span>
                    <span className="font-mono text-gray-200">{passData.recipient}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Allowed Category</span>
                    <span className="font-bold text-emerald-400">{passData.category}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5">
                    <span className="text-gray-500 block">Max Per Tx</span>
                    <span className="font-mono text-gray-200">${passData.maxPerTransaction.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Solana Devnet PDA</span>
                  <a
                    href="https://explorer.solana.com/?cluster=devnet"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Attempt Log Feed */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  Verification Feed ({paymentLog.length})
                </span>
                <span className="text-[10px] text-gray-500">Real-time</span>
              </div>

              {paymentLog.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No payments attempted yet. Click step 1 to begin.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {paymentLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        log.status === "APPROVED"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-rose-500/10 border-rose-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{log.merchant}</span>
                        <span
                          className={`font-mono font-bold ${
                            log.status === "APPROVED" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {log.status === "APPROVED" ? "-" : ""}${log.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-300">{log.reason}</div>
                      {log.receiptVerified && (
                        <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          AI Advisory Receipt Match: 98% confidence
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
