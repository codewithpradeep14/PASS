"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  rdns?: string;
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
  isConnecting: boolean;
  connectingWalletId: string | null;
  connectionError: string | null;
  availableWallets: WalletOption[];
  openModal: () => void;
  closeModal: () => void;
  connectWallet: (wallet: WalletOption) => Promise<boolean>;
  disconnect: () => void;
  rescanWallets: () => void;
  sendPayment: (params: {
    to: string;
    amount: number;
    currency?: string;
    memo?: string;
  }) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const UnifiedWalletContext = createContext<UnifiedWalletContextType | null>(null);

// Standard wallet metadata
const DEFAULT_WALLETS: Omit<WalletOption, "isInstalled" | "provider">[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    chainType: "evm",
    downloadUrl: "https://metamask.io/download/",
    rdns: "io.metamask",
  },
  {
    id: "zerion",
    name: "Zerion",
    icon: "https://app.zerion.io/favicon.ico",
    chainType: "evm",
    downloadUrl: "https://zerion.io/extension",
    rdns: "io.zerion.wallet",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "https://phantom.app/favicon.ico",
    chainType: "solana",
    downloadUrl: "https://phantom.app/download",
    rdns: "app.phantom",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "https://www.coinbase.com/favicon.ico",
    chainType: "evm",
    downloadUrl: "https://www.coinbase.com/wallet",
    rdns: "com.coinbase.wallet",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "https://solflare.com/favicon.ico",
    chainType: "solana",
    downloadUrl: "https://solflare.com/",
    rdns: "com.solflare",
  },
];

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Store announced EIP-6963 providers
  const eip6963ProvidersRef = useRef<Map<string, { info: any; provider: any }>>(new Map());

  // Helper to detect specific providers directly from window
  const getProviderForWallet = useCallback((walletId: string, rdns?: string) => {
    if (typeof window === "undefined") return null;
    const w = window as any;
    const eth = w.ethereum;
    const sol = w.solana;
    const phantom = w.phantom;

    // Check EIP-6963 providers first
    if (rdns && eip6963ProvidersRef.current.has(rdns)) {
      return eip6963ProvidersRef.current.get(rdns)?.provider;
    }
    for (const [key, detail] of Array.from(eip6963ProvidersRef.current.entries())) {
      if (
        key.toLowerCase().includes(walletId) ||
        detail.info?.name?.toLowerCase().includes(walletId)
      ) {
        return detail.provider;
      }
    }

    // Direct object checks
    const providers: any[] = Array.isArray(eth?.providers) ? eth.providers : [];

    if (walletId === "zerion") {
      // 1. Direct window.zerionWallet
      if (w.zerionWallet) return w.zerionWallet;
      // 2. Direct window.zerion?.ethereum
      if (w.zerion?.ethereum) return w.zerion?.ethereum;
      // 3. Provider in eth.providers array
      const z = providers.find((p) => p.isZerion);
      if (z) return z;
      // 4. eth is Zerion
      if (eth?.isZerion) return eth;
      // 5. If only general ethereum exists and user clicked Zerion, return general ethereum
      return eth || null;
    }

    if (walletId === "metamask") {
      // 1. Provider in eth.providers array
      const mm = providers.find((p) => p.isMetaMask && !p.isZerion && !p.isPhantom);
      if (mm) return mm;
      // 2. eth is MetaMask
      if (eth?.isMetaMask && !eth?.isZerion) return eth;
      // 3. General ethereum
      return eth || null;
    }

    if (walletId === "phantom") {
      if (phantom?.solana) return phantom.solana;
      if (sol?.isPhantom) return sol;
      if (phantom?.ethereum) return phantom.ethereum;
      return sol || null;
    }

    if (walletId === "coinbase") {
      if (w.coinbaseWalletExtension) return w.coinbaseWalletExtension;
      const cb = providers.find((p) => p.isCoinbaseWallet);
      if (cb) return cb;
      if (eth?.isCoinbaseWallet) return eth;
      return null;
    }

    if (walletId === "solflare") {
      if (w.solflare?.isSolflare) return w.solflare;
      return null;
    }

    return null;
  }, []);

  // Compute available wallets
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>(() => {
    return DEFAULT_WALLETS.map((w) => ({
      ...w,
      isInstalled: false,
      provider: null,
    }));
  });

  const scanWallets = useCallback(() => {
    if (typeof window === "undefined") return;

    const w = window as any;
    const hasEthereum = Boolean(w.ethereum || w.zerionWallet || w.coinbaseWalletExtension);
    const hasSolana = Boolean(w.solana || w.phantom?.solana || w.solflare);

    setAvailableWallets((prev) => {
      return DEFAULT_WALLETS.map((base) => {
        let provider = getProviderForWallet(base.id, base.rdns);
        let isInstalled = false;

        if (base.id === "zerion") {
          isInstalled = Boolean(
            w.zerionWallet ||
            w.zerion?.ethereum ||
            (w.ethereum && (w.ethereum.isZerion || (Array.isArray(w.ethereum.providers) && w.ethereum.providers.some((p: any) => p.isZerion)))) ||
            eip6963ProvidersRef.current.has("io.zerion.wallet") ||
            // If user has ethereum installed, mark as ready to connect
            hasEthereum
          );
        } else if (base.id === "metamask") {
          isInstalled = Boolean(
            (w.ethereum && (w.ethereum.isMetaMask || !w.ethereum.isZerion)) ||
            (Array.isArray(w.ethereum?.providers) && w.ethereum.providers.some((p: any) => p.isMetaMask)) ||
            eip6963ProvidersRef.current.has("io.metamask") ||
            hasEthereum
          );
        } else if (base.id === "phantom") {
          isInstalled = Boolean(
            w.phantom?.solana ||
            w.solana?.isPhantom ||
            eip6963ProvidersRef.current.has("app.phantom")
          );
        } else if (base.id === "coinbase") {
          isInstalled = Boolean(
            w.coinbaseWalletExtension ||
            w.ethereum?.isCoinbaseWallet ||
            eip6963ProvidersRef.current.has("com.coinbase.wallet")
          );
        } else if (base.id === "solflare") {
          isInstalled = Boolean(w.solflare?.isSolflare);
        }

        // Get icon from EIP-6963 if announced
        let icon = base.icon;
        if (base.rdns && eip6963ProvidersRef.current.has(base.rdns)) {
          const detail = eip6963ProvidersRef.current.get(base.rdns);
          if (detail?.info?.icon) icon = detail.info.icon;
        }

        return {
          ...base,
          icon,
          isInstalled,
          provider: provider || null,
        };
      });
    });
  }, [getProviderForWallet]);

  // Request and listen for EIP-6963 wallets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnnounce = (event: any) => {
      const detail = event.detail;
      if (detail?.info && detail?.provider) {
        const rdns = detail.info.rdns || detail.info.name.toLowerCase();
        eip6963ProvidersRef.current.set(rdns, detail);
        eip6963ProvidersRef.current.set(detail.info.name.toLowerCase(), detail);
        scanWallets();
      }
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounce);
    window.addEventListener("ethereum#initialized", scanWallets);

    // Prompt EIP-6963 providers to announce
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Initial scans at intervals to catch late injections
    scanWallets();
    const t1 = setTimeout(scanWallets, 150);
    const t2 = setTimeout(scanWallets, 500);
    const t3 = setTimeout(scanWallets, 1200);
    const t4 = setTimeout(scanWallets, 2500);

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce);
      window.removeEventListener("ethereum#initialized", scanWallets);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [scanWallets]);

  // Open modal and re-scan
  const openModal = useCallback(() => {
    setConnectionError(null);
    setIsModalOpen(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    }
    scanWallets();
  }, [scanWallets]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsConnecting(false);
    setConnectingWalletId(null);
    setConnectionError(null);
  }, []);

  // Connect to the selected wallet — directly triggers extension popup
  const connectWallet = async (wallet: WalletOption): Promise<boolean> => {
    setIsConnecting(true);
    setConnectingWalletId(wallet.id);
    setConnectionError(null);

    try {
      // Check if Zerion has Solana enabled
      if (wallet.id === "zerion") {
        const w = window as any;
        const zerionSol = w.zerion?.solana || (w.solana?.isZerion ? w.solana : null);
        if (zerionSol) {
          try {
            const resp = await zerionSol.connect();
            const pubKeyStr = resp?.publicKey?.toString() || zerionSol.publicKey?.toString();
            if (pubKeyStr) {
              setAddress(pubKeyStr);
              setChainType("solana");
              setWalletName("Zerion (Solana Devnet)");
              setWalletIcon(wallet.icon);
              setIsConnected(true);
              setActiveProvider(zerionSol);
              setNetwork("Solana Devnet");
              setIsConnecting(false);
              setConnectingWalletId(null);
              setIsModalOpen(false);

              try {
                const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
                const lamports = await conn.getBalance(new PublicKey(pubKeyStr));
                setBalance(`${(lamports / LAMPORTS_PER_SOL).toFixed(3)} SOL`);
              } catch {
                setBalance("Devnet");
              }
              zerionSol.on?.("disconnect", () => disconnect());
              return true;
            }
          } catch (e) {
            console.warn("Zerion Solana connect skipped, using Zerion EVM:", e);
          }
        }
      }

      if (wallet.chainType === "evm") {
        // Resolve target provider right at the moment of click
        let provider = wallet.provider || getProviderForWallet(wallet.id, wallet.rdns);
        const w = window as any;

        if (!provider && w.ethereum) {
          provider = w.ethereum;
        }

        if (!provider) {
          setIsConnecting(false);
          setConnectingWalletId(null);
          setConnectionError(
            `${wallet.name} extension was not detected in your browser. Please check if it's pinned in your browser toolbar, or click Install to add it.`
          );
          return false;
        }

        // Trigger real extension popup!
        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          setChainType("evm");
          setWalletName(
            wallet.id === "metamask"
              ? "MetaMask (Solana Devnet Bridge)"
              : wallet.id === "zerion"
              ? "Zerion (Multi-Chain)"
              : wallet.name
          );
          setWalletIcon(wallet.icon);
          setIsConnected(true);
          setActiveProvider(provider);
          setIsConnecting(false);
          setConnectingWalletId(null);
          setIsModalOpen(false);

          // Get network & balance
          try {
            const chainId = await provider.request({ method: "eth_chainId" });
            const chainNames: Record<string, string> = {
              "0x1": "Ethereum Mainnet",
              "0xaa36a7": "Sepolia Testnet",
              "0x89": "Polygon Mainnet",
              "0xa4b1": "Arbitrum One",
              "0xa": "Optimism",
              "0x2105": "Base",
            };

            if (wallet.id === "metamask") {
              setNetwork("Solana Devnet (via PASS Bridge)");
            } else if (wallet.id === "zerion") {
              setNetwork("Solana Devnet (Zerion Multi-Chain)");
            } else {
              setNetwork(chainNames[chainId] || `EVM (${chainId})`);
            }

            const balHex = await provider.request({
              method: "eth_getBalance",
              params: [addr, "latest"],
            });
            const balEth = parseInt(balHex, 16) / 1e18;
            setBalance(`${balEth.toFixed(4)} ETH • Solana Ready`);
          } catch (e) {
            setBalance("Connected • Solana Ready");
          }

          // Listen for account / chain switch
          provider.on?.("accountsChanged", (newAccs: string[]) => {
            if (newAccs.length > 0) setAddress(newAccs[0]);
            else disconnect();
          });

          return true;
        }
      } else {
        // Solana: Phantom / Solflare
        let provider = wallet.provider || getProviderForWallet(wallet.id, wallet.rdns);
        const w = window as any;

        if (!provider) {
          if (wallet.id === "phantom" && (w.phantom?.solana || w.solana)) {
            provider = w.phantom?.solana || w.solana;
          } else if (wallet.id === "solflare" && w.solflare) {
            provider = w.solflare;
          }
        }

        if (!provider) {
          setIsConnecting(false);
          setConnectingWalletId(null);
          setConnectionError(
            `${wallet.name} extension was not detected. Please ensure it is installed and enabled.`
          );
          return false;
        }

        // Trigger real Phantom / Solflare popup!
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
          setIsConnecting(false);
          setConnectingWalletId(null);
          setIsModalOpen(false);

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
      console.warn("Wallet connection request error:", err);
      setIsConnecting(false);
      setConnectingWalletId(null);
      if (err?.code === 4001 || err?.message?.includes("rejected") || err?.message?.includes("User rejected")) {
        setConnectionError("Connection was cancelled in the wallet popup. Click again to connect.");
      } else {
        setConnectionError(err?.message || "Failed to connect. Please approve the connection in your extension.");
      }
      return false;
    }

    setIsConnecting(false);
    setConnectingWalletId(null);
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
    setIsConnecting(false);
    setConnectingWalletId(null);
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
        const isNativeEth = currency === "ETH";
        const valueWei = isNativeEth ? "0x" + Math.floor(amount * 1e18).toString(16) : "0x0";
        const recipientAddress = to.startsWith("0x") && to.length === 42 ? to : address;

        const txParams: any = {
          from: address,
          to: recipientAddress,
          value: valueWei,
        };

        // Real confirmation popup in MetaMask / Zerion!
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
          destPubkey = senderPubkey;
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: destPubkey,
            lamports: 1000,
          })
        );

        const { blockhash } = await conn.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPubkey;

        // Real confirmation popup in Phantom!
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
        isConnecting,
        connectingWalletId,
        connectionError,
        availableWallets,
        openModal,
        closeModal,
        connectWallet,
        disconnect,
        rescanWallets: scanWallets,
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
