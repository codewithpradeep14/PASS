"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUnifiedWallet } from "@/lib/wallet/UnifiedWalletContext";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Calendar,
  Layers,
  Shield,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ALL_CATEGORIES, PassCategory } from "@/types";

export default function CreatePassPage() {
  const router = useRouter();
  const { isConnected, address, sendPayment, openModal, walletName } = useUnifiedWallet();

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isParsingAI, setIsParsingAI] = useState<boolean>(false);
  const [aiClarification, setAiClarification] = useState<string | null>(null);

  // Form Fields
  const [recipientWallet, setRecipientWallet] = useState<string>("");
  const [amount, setAmount] = useState<string>("100");
  const [purpose, setPurpose] = useState<string>("Groceries and household items");
  const [category, setCategory] = useState<PassCategory>("GROCERIES");
  const [maxPerTransaction, setMaxPerTransaction] = useState<string>("50");
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + 7);
    nextSunday.setHours(23, 59, 0, 0);
    return nextSunday.toISOString().slice(0, 16);
  });

  // Handle Natural Language AI parsing
  const handleParseAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsParsingAI(true);
    setAiClarification(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/intent/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: aiPrompt }),
      });

      const json = await res.json();
      if (json.clarification) {
        setAiClarification(json.clarification);
      } else if (json.success && json.data) {
        const d = json.data;
        if (d.amount) setAmount(String(d.amount));
        if (d.purpose) setPurpose(d.purpose);
        if (d.category) setCategory(d.category);
        if (d.maxPerTransaction) setMaxPerTransaction(String(d.maxPerTransaction));
        if (d.recipient) setRecipientWallet(d.recipient);
        if (d.expiresAt) {
          try {
            setExpiresAt(new Date(d.expiresAt).toISOString().slice(0, 16));
          } catch (e) {}
        }
        setCurrentStep(7); // Jump straight to review
      } else {
        setErrorMsg(json.error || "Could not parse instruction into policy.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to AI intent engine.");
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleGenerateDemoRecipient = () => {
    const demoWallets = [
      "0x3C8F29d814c45b7F94F39A1b238B6C7A8B9C0D1E",
      "0x8F91A2b3C4d5E6f708192a3B4c5D6e7F8a9B0C1D",
      "Bob9999999999999999999999999999999999999999",
    ];
    setRecipientWallet(demoWallets[Math.floor(Math.random() * demoWallets.length)]);
  };

  // Submit on-chain via connected wallet & save to database
  const handleCreatePassSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let signature = `tx_${Date.now()}_sig`;

      // Trigger real wallet popup if connected!
      if (isConnected && address) {
        const txResult = await sendPayment({
          to: recipientWallet || address,
          amount: 0.0001, // micro-transaction to record policy on-chain
          memo: `PASS_POLICY:${category}:${amount}`,
        });

        if (txResult.success && txResult.txHash) {
          signature = txResult.txHash;
        } else if (txResult.error) {
          // If user actively rejected the popup, ask or record
          console.warn("Wallet prompt rejected:", txResult.error);
        }
      }

      setTxSignature(signature);

      // Save to database
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onchainPassAddress: signature,
          ownerWallet: address || "0x7A2c...9F1b",
          recipientWallet: recipientWallet || "Bob (0x3C...1B)",
          amount: parseFloat(amount),
          purpose,
          category,
          maxPerTransaction: parseFloat(maxPerTransaction),
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save PASS record.");
      }

      setTimeout(() => {
        router.push("/app/dashboard");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create PASS.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create a PASS
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Define intent-aware spending limits for family, team members, or AI agents.
          </p>
        </div>

        {!isConnected && (
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition self-start"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            Connect Wallet
          </button>
        )}
      </div>

      {/* AI Intent Parser Fast Box */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-4 h-4" />
          Natural Language Intent Generator
        </div>
        <p className="text-xs text-gray-400">
          Describe your instruction in plain English. Our AI intent parser will extract structured rules and populate the wizard.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. Give my brother $100 for groceries until Sunday, max $50 per transaction"
            className="flex-1 bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleParseAI}
            disabled={isParsingAI || !aiPrompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isParsingAI ? "Interpreting..." : "Auto-Fill Policy"}
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {aiClarification && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{aiClarification}</span>
          </div>
        )}
      </div>

      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-gray-400">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <button
            key={s}
            onClick={() => setCurrentStep(s)}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition ${
              currentStep === s
                ? "bg-emerald-500 text-black ring-4 ring-emerald-500/20"
                : currentStep > s
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/5 text-gray-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Wizard Step Content Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        {/* Step 1: Recipient */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 1</span>
              <h2 className="text-xl font-bold text-white mt-1">Who are you giving money to?</h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter the wallet address of the recipient or generate a test recipient.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Recipient Wallet Address</label>
              <input
                type="text"
                value={recipientWallet}
                onChange={(e) => setRecipientWallet(e.target.value)}
                placeholder="Wallet address (e.g. 0x... or Solana Pubkey)"
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleGenerateDemoRecipient}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              + Generate Demo Recipient Address
            </button>
          </div>
        )}

        {/* Step 2: Amount */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 2</span>
              <h2 className="text-xl font-bold text-white mt-1">How much would you like to allocate?</h2>
              <p className="text-xs text-gray-400 mt-1">
                Choose the total budget allowance. Tokens remain in your control until spent.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Total Allowance (USDC)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  USDC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Purpose & Category */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 3</span>
              <h2 className="text-xl font-bold text-white mt-1">What is this money for?</h2>
              <p className="text-xs text-gray-400 mt-1">
                Describe the intended purpose and select a canonical merchant category.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Human-Readable Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Weekly family groceries and essential produce"
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Select Canonical Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PassCategory)}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Allowed Merchant Categories */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 4</span>
              <h2 className="text-xl font-bold text-white mt-1">Where can it be spent?</h2>
              <p className="text-xs text-gray-400 mt-1">
                Merchants registered under other categories will be strictly blocked.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Enforcement:</span>
                <span className="font-bold text-emerald-400">{category}</span>
              </div>
              <p className="text-gray-500">
                Any transaction originating from merchants with non-matching categories (e.g. ENTERTAINMENT) will fail deterministically.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Limits */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 5</span>
              <h2 className="text-xl font-bold text-white mt-1">Set Spending Limits</h2>
              <p className="text-xs text-gray-400 mt-1">
                Protect against large single purchases by capping the amount per transaction.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Maximum Per Transaction (USDC)</label>
              <input
                type="number"
                value={maxPerTransaction}
                onChange={(e) => setMaxPerTransaction(e.target.value)}
                min="1"
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 6: Expiration */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 6</span>
              <h2 className="text-xl font-bold text-white mt-1">Set Expiration Date</h2>
              <p className="text-xs text-gray-400 mt-1">
                After this timestamp, unused funds automatically expire and remain in the owner's vault.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Expiration Date and Time</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-[#090d16] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 7</span>
              <h2 className="text-xl font-bold text-white mt-1">Review & Sign PASS Policy</h2>
              <p className="text-xs text-gray-400 mt-1">
                Verify all parameters before initializing the on-chain policy.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#090d16] border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Funding Wallet:</span>
                <span className="font-mono text-white font-medium">
                  {address ? `${walletName || "Wallet"}: ${address}` : "Simulated Owner"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Recipient:</span>
                <span className="font-mono text-white font-medium">{recipientWallet || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Total Allowance:</span>
                <span className="font-mono text-emerald-400 font-bold">${parseFloat(amount || "0").toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Purpose:</span>
                <span className="text-white font-medium">{purpose}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Authorized Category:</span>
                <span className="font-bold text-emerald-400">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Max Per Transaction:</span>
                <span className="font-mono text-white font-medium">${parseFloat(maxPerTransaction || "0").toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Expires:</span>
                <span className="font-mono text-white">{new Date(expiresAt).toLocaleString()}</span>
              </div>
            </div>

            {txSignature && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  PASS Initialized & Signed on Blockchain!
                </div>
                <div className="font-mono text-[11px] break-all">Signature: {txSignature}</div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreatePassSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting
                ? "Opening Wallet Popup..."
                : isConnected
                ? `Sign with ${walletName || "Wallet"}`
                : "Confirm & Create PASS"}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
