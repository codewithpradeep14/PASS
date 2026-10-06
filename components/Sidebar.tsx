"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  const navItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Create a PASS", href: "/app/create", icon: PlusCircle },
    { name: "My PASSes", href: "/app/passes", icon: FileCheck },
    { name: "Pay with PASS", href: "/app/pay", icon: CreditCard },
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
              <div className="text-[10px] text-emerald-400 font-mono">Solana Devnet</div>
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
            <span className="font-mono text-[11px]">Devnet Connected</span>
          </div>
          <a
            href="https://explorer.solana.com/?cluster=devnet"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 hover:text-gray-300"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <WalletMultiButton className="!w-full !justify-center !bg-white/10 hover:!bg-white/15 !text-white !font-medium !h-9 !rounded-lg !text-xs" />
      </div>
    </aside>
  );
}
