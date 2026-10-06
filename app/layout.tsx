import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";

export const metadata: Metadata = {
  title: "PASS — Money with instructions",
  description:
    "Intent-aware programmable payments on Solana. Give someone money without giving them unrestricted spending power.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-gray-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
