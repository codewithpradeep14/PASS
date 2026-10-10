"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { SolamiConnectionStatus, SolamiTransactionEvent } from "@/lib/integrations/solami/types";

export function SolamiPanel({ address }: { address?: string }) {
  const [connection, setConnection] = useState<SolamiConnectionStatus | null>(null);
  const [events, setEvents] = useState<SolamiTransactionEvent[]>([]);
  const [sourceNote, setSourceNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const url = address
        ? `/api/integrations/solami?address=${encodeURIComponent(address)}`
        : "/api/integrations/solami";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setConnection(data.connection);
        setEvents(data.events || []);
        setSourceNote(data.sourceNote || "");
      }
    } catch (e) {
      console.error("SolamiPanel fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  const getStatusBadge = (state?: string) => {
    switch (state) {
      case "Connected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        );
      case "Demo mode":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Demo Mode
          </span>
        );
      case "Temporarily unavailable":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Unavailable
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Solami Infrastructure</h3>
              {getStatusBadge(connection?.state)}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Private RPC, Yellowstone gRPC streaming & decoded Blur on-chain monitor.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Connection Diagnostics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-gray-500 block text-[10px] uppercase">Endpoint</span>
          <span className="text-gray-200 truncate block mt-0.5" title={connection?.endpoint}>
            {connection?.endpoint ? connection.endpoint.replace("https://", "") : "Not set"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-gray-500 block text-[10px] uppercase">Latency</span>
          <span className="text-emerald-400 font-bold block mt-0.5">
            {connection?.latencyMs ? `${connection.latencyMs} ms` : "—"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-gray-500 block text-[10px] uppercase">Current Slot</span>
          <span className="text-gray-200 block mt-0.5">
            {connection?.slot ? `#${connection.slot.toLocaleString()}` : "—"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-gray-500 block text-[10px] uppercase">SWQoS Beam Landing</span>
          <span className="text-cyan-400 font-bold block mt-0.5">
            {connection?.features?.beamLanding ? "Supported" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Streaming Events List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Live / Monitored On-Chain Activity
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500 font-mono">
            Connecting to Solami data layer...
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
            <p className="text-xs text-gray-400">
              No on-chain transactions currently detected for this filter.
            </p>
            {connection?.state === "Not configured" && (
              <p className="text-[11px] text-gray-500">
                To connect live Solami infrastructure, set <code className="text-emerald-400">SOLAMI_API_KEY</code> in <code className="text-gray-400">.env</code>.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {events.map((ev, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">
                      {ev.decodedAction}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        ev.status === "finalized"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : ev.status === "failed"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-cyan-500/20 text-cyan-300"
                      }`}
                    >
                      {ev.status}
                    </span>
                    {ev.source === "demo_solami" && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                        Demo
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>Sender: <span className="text-gray-300 font-mono">{ev.senderWallet.slice(0, 10)}...</span></span>
                    {ev.amount && (
                      <span>• Amount: <span className="text-emerald-400 font-mono font-bold">${ev.amount.toFixed(2)} USDC</span></span>
                    )}
                    {ev.category && <span>• {ev.category}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] text-gray-500 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${ev.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1 font-mono text-[11px]"
                  >
                    {ev.signature.slice(0, 8)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Source & Policy Reminder */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 gap-2">
        <span>{sourceNote}</span>
        <span className="text-gray-400 italic">
          *Solami monitors on-chain events; PASS policy engine enforces spending rules.
        </span>
      </div>
    </div>
  );
}
