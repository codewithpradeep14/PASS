"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Cpu,
  TrendingUp,
  Scale,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Copy,
  Sparkles,
} from "lucide-react";

export default function IntegrationsHubPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/integrations/status");
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getBadge = (state?: string) => {
    switch (state) {
      case "Connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        );
      case "Demo mode":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Demo Mode
          </span>
        );
      case "Temporarily unavailable":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Temporarily Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/40">
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono mb-2">
            <Layers className="w-3.5 h-3.5" />
            Modular Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Integrations & Module Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            PASS Core functions independently. Solami, Meteora, and Panta are optional modular extensions that enhance infrastructure, treasury launch oversight, and prediction insights.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Run Health Diagnostics
        </button>
      </div>

      {/* Core Principle Callout */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3.5 text-xs text-gray-300">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm">Policy Isolation Guarantee</span>
          <p className="leading-relaxed">
            External modules provide monitoring, launch telemetry, and research sentiment. They can never authorize transactions or bypass PASS deterministic spending caps, category rules, or owner revocations.
          </p>
        </div>
      </div>

      {/* Module 1: Solami */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">Solami Integration</h3>
                {getBadge(status?.solami?.state)}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Solana infrastructure, private RPC, Yellowstone gRPC streaming, and Blur decoded on-chain monitor.
              </p>
            </div>
          </div>

          <a
            href="https://solami.dev/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            solami.dev <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-gray-400">
            <span>Environment Variable:</span>
            <span className="text-white font-bold flex items-center gap-2">
              SOLAMI_API_KEY
              <button
                onClick={() => copyToClipboard("SOLAMI_API_KEY", "solami")}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Active Endpoint:</span>
            <span className="text-cyan-400 truncate max-w-xs">{status?.solami?.endpoint || "https://rpc.solami.dev/sol"}</span>
          </div>
          {status?.solami?.errorMessage && (
            <div className="pt-2 border-t border-white/5 text-amber-300/90 text-[11px] leading-relaxed">
              Note: {status.solami.errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Module 2: Meteora */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">Meteora Launch Insights</h3>
                {getBadge(status?.meteora?.state)}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Dynamic Bonding Curve (DBC) analytics, token launch progress, and DAMM v2 pool status for project treasuries.
              </p>
            </div>
          </div>

          <a
            href="https://www.meteora.ag/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            meteora.ag <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-gray-400">
            <span>Environment Variable:</span>
            <span className="text-white font-bold flex items-center gap-2">
              METEORA_RPC_URL
              <button
                onClick={() => copyToClipboard("METEORA_RPC_URL", "meteora")}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>DBC Program ID:</span>
            <span className="text-amber-400 truncate max-w-xs">{status?.meteora?.programId || "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"}</span>
          </div>
          {status?.meteora?.errorMessage && (
            <div className="pt-2 border-t border-white/5 text-amber-300/90 text-[11px] leading-relaxed">
              Note: {status.meteora.errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Module 3: Panta */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white">Panta Market Insights</h3>
                {getBadge(status?.panta?.state)}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Decentralized prediction markets discovery, YES/NO outcome probabilities, and ecosystem sentiment research.
              </p>
            </div>
          </div>

          <a
            href="https://www.panta.market/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            panta.market <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16] border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-gray-400">
            <span>Environment Variable:</span>
            <span className="text-white font-bold flex items-center gap-2">
              PANTA_API_KEY
              <button
                onClick={() => copyToClipboard("PANTA_API_KEY", "panta")}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>API Base URL:</span>
            <span className="text-purple-400 truncate max-w-xs">{status?.panta?.apiBaseUrl || "https://live-api.panta.market/api/v1"}</span>
          </div>
          {status?.panta?.errorMessage && (
            <div className="pt-2 border-t border-white/5 text-amber-300/90 text-[11px] leading-relaxed">
              Note: {status.panta.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
