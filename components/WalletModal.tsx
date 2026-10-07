"use client";

import React from "react";
import { useUnifiedWallet, WalletOption } from "@/lib/wallet/UnifiedWalletContext";
import { X, ExternalLink, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export function WalletModal() {
  const { isModalOpen, closeModal, availableWallets, connectWallet, isConnected, address, disconnect } = useUnifiedWallet();

  if (!isModalOpen) return null;

  const handleWalletClick = async (wallet: WalletOption) => {
    await connectWallet(wallet);
  };

  const handleDemoConnect = async () => {
    // Connect a test address if user doesn't have an extension installed yet
    const demoWallet: WalletOption = {
      id: "demo",
      name: "Demo Test Wallet",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d131f] border border-white/10 shadow-2xl p-6 space-y-5 text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Connect Wallet
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select your real browser wallet to open and pay.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Options List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletClick(wallet)}
              className="w-full p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/30 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-full h-full object-contain"
                    onError={(e: any) => {
                      // Fallback icon text
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    {wallet.name}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {wallet.chainType === "evm" ? "Ethereum & EVM Chains" : "Solana Devnet & Mainnet"}
                  </div>
                </div>
              </div>

              <div>
                {wallet.isInstalled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 text-[10px] group-hover:text-white transition">
                    Install <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Demo Fast Connect Option */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Testing without an extension?</span>
            <button
              onClick={handleDemoConnect}
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Use Simulated Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
