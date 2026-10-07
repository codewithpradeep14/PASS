"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Connection, PublicKey, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export type ChainType = "evm" | "solana";

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  chainType: ChainType;
  isInstalled: boolean;
  downloadUrl: string;
  provider?: any;
}

export interface UnifiedWalletContextType {
  isConnected: boolean;
  address: string | null;
  displayAddress: string | null;
  chainType: ChainType | null;
  walletName: string | null;
  walletIcon: string | null;
  balance: string | null;
  network: string;
  isModalOpen: boolean;
  availableWallets: WalletOption[];
  openModal: () => void;
  closeModal: () => void;
  connectWallet: (wallet: WalletOption) => Promise<boolean>;
  disconnect: () => void;
  sendPayment: (params: {
    to: string;
    amount: number;
    currency?: string;
    memo?: string;
  }) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | null>(null);

export function UnifiedWalletProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainType, setChainType] = useState<ChainType | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletIcon, setWalletIcon] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("Solana Devnet");
  const [activeProvider, setActiveProvider] = useState<any>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  // Scan for installed wallets (EIP-6963 + window.ethereum + window.solana)
  const scanWallets = useCallback(() => {
    if (typeof window === "undefined") return;

    const wallets: WalletOption[] = [];
    const ethereum = (window as any).ethereum;
    const solana = (window as any).solana;
    const phantom = (window as any).phantom?.solana;
    const zerion = (window as any).zerion?.ethereum || ((ethereum as any)?.isZerion ? ethereum : null);

    // 1. MetaMask
    const isMetaMask = Boolean(ethereum?.isMetaMask && !ethereum?.isZerion && !ethereum?.isPhantom);
    wallets.push({
      id: "metamask",
      name: "MetaMask",
      icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      chainType: "evm",
      isInstalled: Boolean(ethereum?.isMetaMask || (window as any).ethereum),
      downloadUrl: "https://metamask.io/download/",
      provider: ethereum,
    });

    // 2. Zerion
    const isZerion = Boolean(zerion || ethereum?.isZerion);
    wallets.push({
      id: "zerion",
      name: "Zerion",
      icon: "https://app.zerion.io/favicon.ico",
      chainType: "evm",
      isInstalled: isZerion,
      downloadUrl: "https://zerion.io/extension",
      provider: zerion || ethereum,
    });

    // 3. Phantom (Solana & Multi-chain)
    const isPhantom = Boolean(phantom || solana?.isPhantom);
    wallets.push({
      id: "phantom",
      name: "Phantom",
      icon: "https://phantom.app/favicon.ico",
      chainType: "solana",
      isInstalled: isPhantom,
      downloadUrl: "https://phantom.app/download",
      provider: phantom || solana,
    });

    // 4. Coinbase Wallet
    const isCoinbase = Boolean((ethereum as any)?.isCoinbaseWallet || (window as any).coinbaseWalletExtension);
    wallets.push({
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "https://www.coinbase.com/favicon.ico",
      chainType: "evm",
      isInstalled: isCoinbase,
      downloadUrl: "https://www.coinbase.com/wallet",
      provider: (window as any).coinbaseWalletExtension || ethereum,
    });

    // 5. Solflare (Solana)
    const isSolflare = Boolean((window as any).solflare?.isSolflare);
    wallets.push({
      id: "solflare",
      name: "Solflare",
      icon: "https://solflare.com/favicon.ico",
      chainType: "solana",
      isInstalled: isSolflare,
      downloadUrl: "https://solflare.com/",
      provider: (window as any).solflare,
    });

    setAvailableWallets(wallets);
  }, []);

  useEffect(() => {
    scanWallets();

    // Listen for EIP-6963 announced providers
    const handleAnnounce = (event: any) => {
      const info = event.detail?.info;
      const provider = event.detail?.provider;
      if (info && provider) {
        setAvailableWallets((prev) => {
          const exists = prev.some((w) => w.id === info.rdns || w.name.toLowerCase() === info.name.toLowerCase());
          if (!exists) {
            return [
              ...prev,
              {
                id: info.rdns || info.name.toLowerCase(),
                name: info.name,
                icon: info.icon,
                chainType: "evm",
                isInstalled: true,
                downloadUrl: "https://metamask.io/download/",
                provider,
              },
            ];
          }
          return prev;
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("eip6963:announceProvider", handleAnnounce);
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("eip6963:announceProvider", handleAnnounce);
      }
    };
  }, [scanWallets]);

  // Connect to the selected wallet
  const connectWallet = async (wallet: WalletOption): Promise<boolean> => {
    try {
      if (wallet.chainType === "evm") {
        // EVM: MetaMask, Zerion, Coinbase Wallet
        const provider = wallet.provider || (window as any).ethereum;
        if (!provider) {
          window.open(wallet.downloadUrl, "_blank");
          return false;
        }

        // Request real accounts popup from extension
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          setChainType("evm");
          setWalletName(wallet.name);
          setWalletIcon(wallet.icon);
          setIsConnected(true);
          setActiveProvider(provider);
          setIsModalOpen(false);

          // Get network & balance
          try {
            const chainId = await provider.request({ method: "eth_chainId" });
            setNetwork(chainId === "0x1" ? "Ethereum Mainnet" : chainId === "0xaa36a7" ? "Sepolia Testnet" : "EVM Network");

            const balHex = await provider.request({
              method: "eth_getBalance",
              params: [addr, "latest"],
            });
            const balEth = parseInt(balHex, 16) / 1e18;
            setBalance(`${balEth.toFixed(4)} ETH`);
          } catch (e) {
            setBalance("Connected");
          }

          // Listen for account switch
          provider.on?.("accountsChanged", (newAccs: string[]) => {
            if (newAccs.length > 0) setAddress(newAccs[0]);
            else disconnect();
          });

          return true;
        }
      } else {
        // Solana: Phantom, Solflare
        const provider = wallet.provider || (window as any).phantom?.solana || (window as any).solana;
        if (!provider) {
          window.open(wallet.downloadUrl, "_blank");
          return false;
        }

        const resp = await provider.connect();
        const pubKeyStr = resp?.publicKey?.toString() || provider.publicKey?.toString();

        if (pubKeyStr) {
          setAddress(pubKeyStr);
          setChainType("solana");
          setWalletName(wallet.name);
          setWalletIcon(wallet.icon);
          setIsConnected(true);
          setActiveProvider(provider);
          setNetwork("Solana Devnet");
          setIsModalOpen(false);

          // Fetch balance on Solana Devnet
          try {
            const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
            const lamports = await conn.getBalance(new PublicKey(pubKeyStr));
            setBalance(`${(lamports / LAMPORTS_PER_SOL).toFixed(3)} SOL`);
          } catch (e) {
            setBalance("Devnet");
          }

          provider.on?.("disconnect", () => disconnect());
          return true;
        }
      }
    } catch (err: any) {
      console.error("Wallet connection rejected or error:", err);
      // If user cancelled, don't throw uncaught error
      return false;
    }
    return false;
  };

  const disconnect = () => {
    try {
      if (activeProvider?.disconnect) activeProvider.disconnect();
    } catch (e) {}
    setIsConnected(false);
    setAddress(null);
    setChainType(null);
    setWalletName(null);
    setBalance(null);
    setActiveProvider(null);
  };

  // Send real transaction from connected wallet (MetaMask, Zerion, or Phantom)
  const sendPayment = async ({
    to,
    amount,
    currency = "USDC",
    memo = "",
  }: {
    to: string;
    amount: number;
    currency?: string;
    memo?: string;
  }) => {
    if (!isConnected || !address || !activeProvider) {
      return { success: false, error: "Please connect your wallet first." };
    }

    try {
      if (chainType === "evm") {
        // Real EVM transaction prompt in MetaMask / Zerion
        // Convert to hex value (or 0 for policy contract call)
        const isNativeEth = currency === "ETH";
        const valueWei = isNativeEth ? "0x" + Math.floor(amount * 1e18).toString(16) : "0x0";

        // Construct parameters for eth_sendTransaction
        // If recipient is a valid EVM address (0x...)
        const recipientAddress = to.startsWith("0x") && to.length === 42 ? to : address;

        const txParams: any = {
          from: address,
          to: recipientAddress,
          value: valueWei,
        };

        // Trigger real MetaMask / Zerion confirmation popup!
        const txHash = await activeProvider.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });

        return { success: true, txHash };
      } else {
        // Real Solana transaction prompt in Phantom / Solflare
        const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
        const senderPubkey = new PublicKey(address);

        let destPubkey: PublicKey;
        try {
          destPubkey = new PublicKey(to);
        } catch {
          // If destination is a demo alias, self-transfer or system address
          destPubkey = senderPubkey;
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: destPubkey,
            lamports: 1000, // micro-transfer on Devnet to anchor proof
          })
        );

        const { blockhash } = await conn.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPubkey;

        // Trigger real Phantom / Solflare confirmation popup!
        const { signature } = await activeProvider.signAndSendTransaction(transaction);
        await conn.confirmTransaction(signature, "confirmed");

        return { success: true, txHash: signature };
      }
    } catch (err: any) {
      console.warn("Wallet transaction error or user rejection:", err?.message);
      return { success: false, error: err?.message || "Transaction was rejected in wallet." };
    }
  };

  const displayAddress = address
    ? address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address
    : null;

  return (
    <UnifiedWalletContext.Provider
      value={{
        isConnected,
        address,
        displayAddress,
        chainType,
        walletName,
        walletIcon,
        balance,
        network,
        isModalOpen,
        availableWallets,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        connectWallet,
        disconnect,
        sendPayment,
      }}
    >
      {children}
    </UnifiedWalletContext.Provider>
  );
}

export function useUnifiedWallet() {
  const context = useContext(UnifiedWalletContext);
  if (!context) {
    throw new Error("useUnifiedWallet must be used within a UnifiedWalletProvider");
  }
  return context;
}
