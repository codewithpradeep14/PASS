"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Brain, Code2, Cpu } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            System Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-3">
            How Intent-Aware Payments Work
          </h1>
          <p className="mt-4 text-gray-400 text-base">
            Existing blockchain primitives offer raw spending approvals. PASS wraps those approvals in a verifiable policy and proof layer.
          </p>
        </div>

        {/* 6-Phase Pipeline */}
        <div className="space-y-8">
          {[
            {
              phase: "Phase 1: Human Intent",
              icon: Brain,
              title: "Natural Language Specification",
              description:
                "The owner expresses their objective naturally in plain English, such as: 'Give my brother $100 for groceries until Sunday, max $50 per transaction.'",
              badge: "Human Input",
            },
            {
              phase: "Phase 2: AI Intent Parsing",
              icon: Cpu,
              title: "Deterministic Rule Extraction",
              description:
                "A server-side AI model translates the text into an immutable JSON specification (amount, recipient, canonical category, tx limit, expiration). All outputs are strictly validated against a Zod schema.",
              badge: "Server-side Validation",
            },
            {
              phase: "Phase 3: Smart Contract Enforcement",
              icon: Code2,
              title: "Anchor Program & PDA Escrow",
              description:
                "The owner signs an on-chain transaction. An Anchor program on Solana Devnet initializes a PassAccount PDA and deposits funds into a dedicated Vault PDA. The human-readable purpose hash is anchored on-chain.",
              badge: "Solana Devnet",
            },
            {
              phase: "Phase 4: Point-of-Sale Evaluation",
              icon: Shield,
              title: "Deterministic Policy Verification",
              description:
                "When the recipient spends at checkout, the policy engine verifies the merchant category, remaining allowance, per-transaction ceiling, and expiration before initiating transfer.",
              badge: "Zero Hallucination",
            },
            {
              phase: "Phase 5: Instant On-Chain Revocation",
              icon: CheckCircle2,
              title: "Owner Retains Complete Control",
              description:
                "Unused funds are never locked forever. The owner can revoke permissions at any point with one click, refunding remaining vault tokens immediately back to their wallet.",
              badge: "100% Non-Custodial",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      {item.phase}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/app/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition"
          >
            Create Your First PASS
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
