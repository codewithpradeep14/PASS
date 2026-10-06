"use client";

import { useState } from "react";
import { Settings, Shield, Cpu, Database, CheckCircle2, Copy } from "lucide-react";

export default function SettingsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Settings & Devnet Info
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Network endpoints, Anchor smart contract configuration, and test token parameters.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Solana Network Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Network Cluster</span>
                <span className="font-mono text-emerald-400 font-bold">Solana Devnet</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Devnet RPC Endpoint</span>
                <span className="font-mono text-gray-200">https://api.devnet.solana.com</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Anchor Program ID</span>
                <span className="font-mono text-gray-200">Pass111111111111111111111111111111111111111</span>
              </div>
              <button
                onClick={() => copyToClipboard("Pass111111111111111111111111111111111111111", "prog")}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-gray-400 block text-[11px]">Test Token Mint (USDC / pUSDC)</span>
                <span className="font-mono text-gray-200">4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU</span>
              </div>
              <button
                onClick={() => copyToClipboard("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", "mint")}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Backend & Persistence
          </h3>

          <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Database Engine:</span>
              <span className="font-mono text-white">Prisma + SQLite (Local zero-config)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Intent Engine:</span>
              <span className="text-emerald-400 font-medium">Deterministic Rule Parser + LLM Fallback</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Security Architecture:</span>
              <span className="text-gray-200">Non-Custodial PDA Escrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
