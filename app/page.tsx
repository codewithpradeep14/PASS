"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Lock,
  Cpu,
  Coins,
  ChevronRight,
  Wallet,
  Store,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Solana Devnet Ready • Hackathon Edition
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Money with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  instructions.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed">
                Give someone money without giving them unrestricted spending power. PASS adds an intent-aware policy layer on top of Solana programmable payments.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/app/create"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  Create a PASS
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/demo/simulation"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Try 1-Click Demo
                </Link>
              </div>

              {/* Quick stats / trust points */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-2xl font-black text-white font-mono">100%</div>
                  <div className="text-xs text-gray-400">Owner-Revocable</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">0.4s</div>
                  <div className="text-xs text-gray-400">Solana Settlement</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-300 font-mono">Zod + AI</div>
                  <div className="text-xs text-gray-400">Deterministic Policy</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Hero Visual */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-2xl p-6 shadow-2xl relative border border-white/10">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Active PASS #001
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    NON-CUSTODIAL
                  </span>
                </div>

                {/* PASS Details */}
                <div className="space-y-4">
                  <div className="bg-[#0b101b] rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-gray-400">Total Allowance</div>
                    <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      $100.00 <span className="text-sm font-normal text-gray-400">USDC</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Recipient:</span>{" "}
                        <span className="font-mono text-gray-300">Rahul (0x8F...3A)</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>{" "}
                        <span className="font-semibold text-emerald-400">GROCERIES</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Per Tx:</span>{" "}
                        <span className="font-mono text-gray-300">$50.00</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expires:</span>{" "}
                        <span className="text-gray-300">Sunday 23:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment examples comparison */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Policy Verification Simulator
                    </div>

                    {/* Allowed payment */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-white">FreshMart Supermarket</div>
                          <div className="text-emerald-300 text-[11px]">Category: GROCERIES • $32.40</div>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
                        ✓ Allowed
                      </span>
                    </div>

                    {/* Blocked payment */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-white">Apex Gaming Store</div>
                          <div className="text-rose-300 text-[11px]">Category: ENTERTAINMENT • $75.00</div>
                        </div>
                      </div>
                      <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px] bg-rose-500/20 px-2 py-0.5 rounded">
                        ✕ Blocked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 border-t border-white/5 bg-[#090e18]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              The Paradigm Shift
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Sending money gives away control.
            </p>
            <p className="mt-4 text-gray-400 text-base leading-relaxed">
              Standard wallets grant unrestricted permissions: once tokens leave your account, they can be spent anywhere. PASS introduces <span className="text-white font-semibold">Intent-Aware Payments</span> so funds only move when verified against your exact rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-red-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold mb-5">
                ✕
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Traditional Spending Permission</h3>
              <p className="text-gray-400 text-sm mb-4">
                "You may spend up to $100."
              </p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  No merchant category constraints
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  No proof-of-purchase verification
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  Risk of rogue spending and misuse
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-5">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white mb-2">PASS Intent-Aware Policy</h3>
              <p className="text-emerald-300 text-sm mb-4 font-mono">
                "Spend up to $100, for groceries, max $50/tx, until Sunday."
              </p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Deterministic category & merchant limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Anchor on-chain escrow & instant owner revocation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  AI advisory receipt cross-checking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              Architecture
            </h2>
            <p className="text-3xl font-extrabold text-white">How PASS Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              { step: "01", title: "Human Intent", desc: "Speak or type natural instruction ('Give brother $100 for groceries')." },
              { step: "02", title: "AI Interpreter", desc: "Server-side LLM extracts structured policy, validated strictly via Zod." },
              { step: "03", title: "On-Chain Escrow", desc: "Owner signs Anchor transaction. Funds placed in PASS PDA vault." },
              { step: "04", title: "Deterministic Check", desc: "Recipient spends at checkout. Smart contract rejects non-grocery txs." },
              { step: "05", title: "Proof & Balance", desc: "Receipt verified, budget reconciles on-chain. Owner can revoke anytime." },
            ].map((s, idx) => (
              <div key={idx} className="glass-card p-5 rounded-xl border border-white/10 relative">
                <span className="text-2xl font-mono font-black text-emerald-400/40">{s.step}</span>
                <h4 className="text-base font-bold text-white mt-2 mb-1">{s.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section className="py-20 border-t border-white/5 bg-[#090e18]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              Use Cases
            </h2>
            <p className="text-3xl font-extrabold text-white">Built for People, Teams, & Autonomous Agents</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Family Allowance", desc: "Give teenagers lunch & textbook money that cannot be spent on gaming or entertainment.", icon: Wallet },
              { title: "Corporate Expenses", desc: "Provide employees travel or software budgets with automated merchant category limits.", icon: Layers },
              { title: "AI Agent Wallets", desc: "Give autonomous shopping agents $50 to buy office supplies without runaway spending risk.", icon: Bot },
              { title: "Delivery & Contractors", desc: "Fund gig workers for specific fuel and materials with strict time-boxed limits.", icon: Store },
              { title: "Student Budgets", desc: "Parents allocate tuition and dining funds with guaranteed transparent accounting.", icon: Coins },
              { title: "Emergency Relief", desc: "Distribute emergency aid strictly redeemable for healthcare, groceries, and shelter.", icon: ShieldCheck },
            ].map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div key={i} className="glass-card p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 transition">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{uc.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to give money with instructions?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create your first intent-aware PASS on Solana Devnet today in less than 60 seconds.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/app/create"
              className="px-8 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 transition"
            >
              Create a PASS
            </Link>
            <Link
              href="/demo/simulation"
              className="px-8 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
            >
              Launch Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 bg-[#060910] text-xs text-gray-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PASS Protocol</span>
            <span>• Money with instructions</span>
          </div>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="hover:text-gray-300">How It Works</Link>
            <Link href="/security" className="hover:text-gray-300">Security Model</Link>
            <Link href="/demo/simulation" className="hover:text-gray-300">Hackathon Simulation</Link>
          </div>
          <div>Solana Devnet • Built for Colosseum Hackathon</div>
        </div>
      </footer>
    </div>
  );
}
