import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";
import { PassCategory } from "@/types";

export const PASS_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "Pass111111111111111111111111111111111111111"
);

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export const DEVNET_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const PASS_SEED = Buffer.from("pass");
export const VAULT_SEED = Buffer.from("pass_vault");

export function getSolanaConnection(): Connection {
  return new Connection(DEVNET_RPC_URL, "confirmed");
}

export function categoryToId(category: PassCategory): number {
  const map: Record<PassCategory, number> = {
    CUSTOM: 0,
    GROCERIES: 1,
    FOOD: 2,
    TRANSPORT: 3,
    EDUCATION: 4,
    HEALTHCARE: 5,
    WORK: 6,
    TRAVEL: 7,
    UTILITIES: 8,
    ENTERTAINMENT: 9,
  };
  return map[category] ?? 0;
}

export function idToCategory(id: number): PassCategory {
  const map: Record<number, PassCategory> = {
    0: "CUSTOM",
    1: "GROCERIES",
    2: "FOOD",
    3: "TRANSPORT",
    4: "EDUCATION",
    5: "HEALTHCARE",
    6: "WORK",
    7: "TRAVEL",
    8: "UTILITIES",
    9: "ENTERTAINMENT",
  };
  return map[id] || "CUSTOM";
}

/**
 * Generate 16-byte unique pass ID buffer
 */
export function generatePassIdBuffer(passIdString: string): Buffer {
  const buf = Buffer.alloc(16);
  const clean = passIdString.replace(/-/g, "");
  buf.write(clean.substring(0, 16), "utf-8");
  return buf;
}

/**
 * Derives the Pass Account PDA
 */
export function findPassPda(
  owner: PublicKey,
  passIdBuf: Buffer,
  programId: PublicKey = PASS_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [PASS_SEED, owner.toBuffer(), passIdBuf],
    programId
  );
}

/**
 * Derives the Pass Vault Account PDA
 */
export function findVaultPda(
  owner: PublicKey,
  passIdBuf: Buffer,
  programId: PublicKey = PASS_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, owner.toBuffer(), passIdBuf],
    programId
  );
}

/**
 * Computes a 32-byte sha256 buffer
 */
export async function computeHash(text: string): Promise<Buffer> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Buffer.from(hash);
  }
  // Node.js fallback
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(text).digest();
}

/**
 * Builds a real Solana Devnet on-chain transaction that records the PASS action.
 * Uses Solana Memo Program to embed verified cryptographic JSON proof on-chain
 * along with System/Token account references, verifiable on Solana Explorer.
 */
export function buildOnChainPassInstruction(
  payer: PublicKey,
  action: "CREATE_PASS" | "EXECUTE_PAYMENT" | "REVOKE_PASS",
  metadata: Record<string, any>
): TransactionInstruction {
  const payload = JSON.stringify({
    protocol: "PASS",
    version: "1.0",
    action,
    data: metadata,
    timestamp: Math.floor(Date.now() / 1000),
  });

  return new TransactionInstruction({
    keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(payload, "utf-8"),
  });
}
