"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnifiedWallet } from "@/lib/wallet/UnifiedWalletContext";
import {
  LayoutDashboard,
  PlusCircle,
  FileCheck,
  CreditCard,
  History,
  BarChart3,
  Settings,
  Sparkles,
  ShoppingBag,
  UserCheck,
  ExternalLink,
  Wallet,
  LogOut,
  Coins,
  Layers,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, displayAddress, walletName, walletIcon, balance, network, openModal, disconnect } = useUnifiedWallet();

  const navItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Create a PASS", href: "/app/create", icon: PlusCircle },
    { name: "My PASSes", href: "/app/passes", icon: FileCheck },
    { name: "Pay with PASS", href: "/app/pay", icon: CreditCard },
    { name: "Project Treasury", href: "/app/treasury", icon: Coins },
    { name: "Integrations", href: "/app/integrations", icon: Layers },
    { name: "Recipient View", href: "/recipient", icon: UserCheck },
    { name: "Merchant Terminal", href: "/merchant", icon: ShoppingBag },
    { name: "Payment History", href: "/app/history", icon: History },
    { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
    { name: "1-Click Demo", href: "/demo/simulation", icon: Sparkles, highlight: true },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0c121e] flex flex-col justify-between min-h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-black shadow-md shadow-emerald-500/20">
              P
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight">PASS</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {network || "Solana Devnet"}
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : item.highlight
                    ? "text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : ""}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Wallet & Status */}
      <div className="p-4 border-t border-white/10 bg-[#090d16]/60">
        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">{walletName ? `${walletName} Active` : "Ready to Connect"}</span>
          </div>
        </div>

        {isConnected ? (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {walletIcon && <img src={walletIcon} alt="" className="w-4 h-4 object-contain" />}
                <span className="font-mono text-xs font-bold text-white">{displayAddress}</span>
              </div>
              <button
                onClick={disconnect}
                className="text-gray-400 hover:text-rose-400 transition"
                title="Disconnect"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            {balance && (
              <div className="text-[11px] font-mono text-emerald-400">{balance}</div>
            )}
          </div>
        ) : (
          <button
            onClick={openModal}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  );
}
