"use client";

import React from "react";
import { useUnifiedWallet, WalletOption } from "@/lib/wallet/UnifiedWalletContext";
import {
  X,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

// Crisp inline SVG icons for all supported wallets
function WalletLogo({ id, className = "w-7 h-7" }: { id: string; className?: string }) {
  if (id === "metamask") {
    return (
      <svg className={className} viewBox="0 0 318.6 318.6" fill="none">
        <path d="M274.1 35.5L174.6 109.4 193 65.8z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44.5 35.5l98.5 74.3-18.4-44z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M238.3 206.8l-26.4 40.7 54.3 14.9 15.6-54.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36.7 207.6l15.6 54.8 54.3-14.9-26.4-40.7z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M102.5 130.2l-18.7 28.2 66.8 2.2-2.3-72.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M216.1 130.2l-46.3-41.8-1.8 72.2 66.8-2.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M106.6 247.5l34.8-17-30.2-23.4z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M177.2 230.5l34.8 17-4.6-40.4z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M212 247.5l-34.8-17 3.3 23.4 31.5-6.4z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M106.6 247.5l31.5 6.4 3.3-23.4-34.8 17z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M141.4 230.5l-3.3 23.4 4.8 3.3 16.4 11.4 16.4-11.4 4.8-3.3-3.3-23.4z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M179.3 160.6l-20-6-20 6 2.3 23.9 17.7 5.2 17.7-5.2z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === "zerion") {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="22" fill="#2962FF" />
        <path d="M26 30h48v8L38 64h36v8H26v-8l36-26H26v-6z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (id === "phantom") {
    return (
      <svg className={className} viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="28" fill="#AB9FF2" />
        <path d="M104.7 66.8c-2.3-15.6-15.8-27.4-32.2-27.4-18.1 0-32.8 14.7-32.8 32.8 0 7.3 2.4 14.1 6.4 19.5 2.1 2.8 5.7 4.2 9.2 3.6l10.9-1.9c3.2-.6 6.3 1.2 7.3 4.2l2.3 6.9c1.6 4.7 7.7 5.9 10.9 2.2l13.8-15.8c2.8-3.2 4.1-7.4 4.2-11.7v-12.4z" fill="#FFFFFF" />
        <circle cx="56.5" cy="58.5" r="4.5" fill="#4C4480" />
        <circle cx="75.5" cy="58.5" r="4.5" fill="#4C4480" />
      </svg>
    );
  }

  if (id === "coinbase") {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="22" fill="#0052FF" />
        <path d="M50 24C35.6 24 24 35.6 24 50s11.6 26 26 26 26-11.6 26-26-11.6-26-26-26zm-7 18h14a8 8 0 018 8 8 8 0 01-8 8H43a8 8 0 01-8-8 8 8 0 018-8z" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#FC6E14" />
      <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="12" fill="#FC6E14" />
    </svg>
  );
}

export function WalletModal() {
  const {
    isModalOpen,
    closeModal,
    availableWallets,
    connectWallet,
    isConnecting,
    connectingWalletId,
    connectionError,
    rescanWallets,
  } = useUnifiedWallet();

  if (!isModalOpen) return null;

  const handleWalletSelect = async (wallet: WalletOption) => {
    await connectWallet(wallet);
  };

  const handleDemoConnect = async () => {
    const demoWallet: WalletOption = {
      id: "demo",
      name: "Demo Devnet Wallet",
      icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      chainType: "evm",
      isInstalled: true,
      downloadUrl: "#",
      provider: {
        request: async ({ method }: any) => {
          if (method === "eth_requestAccounts") return ["0x7A2c8104E4f45610e25B6C3F34B49f1b9F39A1b2"];
          if (method === "eth_chainId") return "0x1";
          if (method === "eth_getBalance") return "0x1bc16d674ec80000"; // 2 ETH
          if (method === "eth_sendTransaction") return "0x" + Math.random().toString(36).substring(2) + Date.now().toString(16);
          return null;
        },
      },
    };
    await connectWallet(demoWallet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b101b] border border-white/10 shadow-2xl p-6 space-y-4 text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Connect Wallet
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Click your wallet below to open its extension popup directly.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={rescanWallets}
              title="Re-scan for extensions"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Connecting Banner */}
        {isConnecting && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-emerald-400" />
            <div>
              <span className="font-bold">Opening Extension Popup...</span>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                Please check your browser extension window or top toolbar to approve the connection.
              </p>
            </div>
          </div>
        )}

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-200">Connection Notice</span>
              <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">
                {connectionError}
              </p>
            </div>
          </div>
        )}

        {/* Wallets List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {availableWallets.map((wallet) => {
            const isThisConnecting = isConnecting && connectingWalletId === wallet.id;

            return (
              <div
                key={wallet.id}
                className={`group rounded-xl border transition-all p-3 flex items-center justify-between ${
                  wallet.isInstalled
                    ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-emerald-500/40"
                    : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/20"
                }`}
              >
                {/* Main click button to connect */}
                <button
                  type="button"
                  onClick={() => handleWalletSelect(wallet)}
                  disabled={isConnecting}
                  className="flex items-center gap-3.5 flex-1 text-left disabled:opacity-60 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <WalletLogo id={wallet.id} className="w-7 h-7" />
                  </div>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {wallet.name}
                      {wallet.isInstalled && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {wallet.id === "metamask"
                        ? "Solana Devnet Bridge • EVM & Multi-chain"
                        : wallet.id === "zerion"
                        ? "Solana & EVM Multi-Chain"
                        : wallet.chainType === "evm"
                        ? "Ethereum & EVM Chains"
                        : "Solana Devnet & Mainnet"}
                    </div>
                  </div>
                </button>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWalletSelect(wallet)}
                    disabled={isConnecting}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isThisConnecting
                        ? "bg-emerald-500 text-black"
                        : wallet.isInstalled
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30"
                        : "bg-white/10 text-gray-200 hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    {isThisConnecting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        Connect
                        <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </button>

                  {!wallet.isInstalled && (
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Install ${wallet.name} extension`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Fast Connect Option */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>Need to test without wallet gas?</span>
          <button
            onClick={handleDemoConnect}
            className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Use 1-Click Test Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
