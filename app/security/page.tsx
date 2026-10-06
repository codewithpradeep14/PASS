"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ShieldCheck, Lock, AlertTriangle, Key, FileCode, CheckCircle2 } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            Trust & Safety
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-3">
            Security & Intent Model
          </h1>
          <p className="mt-4 text-gray-400 text-base max-w-2xl mx-auto">
            How PASS enforces safety: cryptographic owner control, non-custodial escrow, and strict boundaries preventing AI from executing arbitrary transactions.
          </p>
        </div>

        <div className="space-y-8">
          {/* Card 1: AI Guardrail */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Strict AI Separation of Powers</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              AI models are inherently probabilistic and can hallucinate. In PASS, <span className="text-white font-semibold">AI NEVER signs transactions or directly controls money</span>. The AI serves exclusively as a parser to convert unstructured intent into structured parameters, which the user must review and approve. Final enforcement is purely deterministic and executed on-chain via Anchor smart contracts.
            </p>
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              Rule: AI Interprets Intent → Schema Validates → Owner Approves → Smart Contract Enforces.
            </div>
          </div>

          {/* Card 2: Non-Custodial Architecture */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Non-Custodial PDA Architecture</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              PASS does not hold user private keys, seed phrases, or custodial databases of user funds. Tokens are locked in isolated Program Derived Address (PDA) vaults on Solana Devnet derived from the creator’s wallet and pass ID. Only authorized recipient payments or the owner's revocation can trigger token withdrawals.
            </p>
          </div>

          {/* Card 3: Revocation & Rent Reclamation */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Owner Revocation Rights</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              If a recipient attempts unauthorized spending or a business arrangement ends early, the creator can revoke the PASS at any second. Any remaining unspent balance is returned immediately to the owner's token account.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/demo/simulation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
          >
            Experience Security in 1-Click Demo
          </Link>
        </div>
      </main>
    </div>
  );
}
