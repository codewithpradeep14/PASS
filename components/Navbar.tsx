"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, Sparkles, ArrowRight, Zap } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080c14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg text-white">
              PASS
            </span>
            <span className="text-[10px] text-emerald-400 font-mono -mt-1 tracking-wider uppercase">
              Solana Devnet
            </span>
          </div>
        </Link>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link
            href="/how-it-works"
            className={`transition hover:text-white ${
              pathname === "/how-it-works" ? "text-emerald-400" : ""
            }`}
          >
            How It Works
          </Link>
          <Link
            href="/security"
            className={`transition hover:text-white ${
              pathname === "/security" ? "text-emerald-400" : ""
            }`}
          >
            Security & Intent
          </Link>
          <Link
            href="/demo/simulation"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Demo
          </Link>
        </nav>

        {/* Action & Wallet */}
        <div className="flex items-center gap-3">
          <Link
            href="/app/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </Link>
          <WalletMultiButton className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-semibold !h-9 !rounded-lg !text-xs !px-3" />
        </div>
      </div>
    </header>
  );
}
