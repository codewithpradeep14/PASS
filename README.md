# PASS — Money with instructions

> **Colosseum Hackathon Project**  
> Intent-aware programmable payments and policy enforcement on **Solana Devnet**.

---

## 1. Executive Summary

Standard spending permissions say:  
> *"You may spend up to $100."*

**PASS** says:  
> *"You may spend up to $100, for groceries, at approved merchants, until Sunday, with a maximum of $50 per transaction."*

Existing blockchain primitives provide spending permissions. **PASS adds an intent-aware policy, cryptographic escrow, and proof verification layer around those permissions.**

---

## 2. The Core Problem & Differentiating Layer

Sending money gives away control. Once tokens leave an owner's wallet into an unconstrained account or allowance, they can be spent on anything without guardrails or recourse.

PASS introduces **Intent-Aware Payments**:
```
Human Intent ("Give my brother $100 for groceries until Sunday")
      ↓
AI Intent Parsing (Structured rule extraction)
      ↓
Strict Schema Validation (Deterministic Zod enforcement)
      ↓
Solana Devnet Anchor Escrow (PassAccount PDA + Vault PDA)
      ↓
Point-of-Sale Deterministic Policy Check (Allowed / Blocked)
      ↓
Proof & Advisory Receipt Verification (Line item categorization)
      ↓
Real-Time Budget Reconciliation & Instant Owner Revocation
```

---

## 3. High-Level Architecture

```
                 ┌─────────────────────────────┐
                 │        PASS FRONTEND        │
                 │   Next.js 14 App Router     │
                 │   React 18 + Tailwind CSS   │
                 └──────────────┬──────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │      Wallet Connection      │
                 │   Solana Wallet Standard    │
                 │  (Phantom, Solflare, etc.)  │
                 └──────────────┬──────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │     DETERMINISTIC POLICY    │
                 │   Category • Limits • Expiry│
                 │   Recipient Authorization   │
                 └──────────────┬──────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │    Anchor Smart Contract    │
                 │        pass_protocol        │
                 │   PassAccount PDA & Vault   │
                 └──────────────┬──────────────┘
                                │
           ┌────────────────────┴────────────────────┐
           ▼                                         ▼
   [Payment Approved]                        [Payment Blocked]
   - Category matches                        - Category mismatch (e.g. Gaming)
   - Amount <= maxPerTx                      - Over budget / expired
   - Transacts on Devnet                     - Funds preserved in vault
```

---

## 4. Key Features

1. **Natural Language Intent Engine (`/api/intent/parse`)**:  
   Translate conversational instructions into strict, deterministic JSON parameters. AI never controls private keys or signs transactions.
2. **Deterministic Policy Evaluator (`lib/policy/policyEngine.ts`)**:  
   Mathematically validates amounts, canonical categories (`GROCERIES`, `FOOD`, `TRANSPORT`, `EDUCATION`, `WORK`, `ENTERTAINMENT`), per-transaction ceilings, and expiration timestamps.
3. **Anchor On-Chain Program (`programs/pass_protocol`)**:  
   Full Solana Rust smart contract using PDAs (`b"pass"` and `b"pass_vault"`). Emits `PassCreated`, `PaymentExecuted`, and `PassRevoked` events.
4. **100% Non-Custodial Owner Revocation**:  
   The creator can revoke permissions at any point with one click. Unspent vault funds are immediately refunded to the owner's token account.
5. **AI Advisory Receipt Analysis (`/api/receipt/analyze`)**:  
   Cross-checks checkout line items and merchant names against authorized categories for compliance scoring.
6. **Simulated Merchant Network (`/merchant`)**:  
   Pre-built POS terminals including **FreshMart Supermarket** (Groceries) and **Apex Gaming Store** (Entertainment) to demonstrate instant policy approval versus deterministic blocking.
7. **Interactive 1-Click Judging Simulation (`/demo/simulation`)**:  
   Follows the complete Alice funding Bob story for hackathon evaluators.

---

## 5. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Blockchain**: Solana Devnet, `@solana/web3.js`, `@solana/wallet-adapter-react`, `@coral-xyz/anchor`.
- **Smart Contract**: Rust, Anchor Framework 0.30.1.
- **Database / Backend**: Prisma ORM, SQLite (`dev.db`), Next.js Route Handlers.
- **Validation & AI**: Zod, Gemini / LLM intent extraction with deterministic fallback.

---

## 6. Project Structure

```
PASS/
├── app/
│   ├── api/                 # REST API endpoints (intent, passes, payment, receipt)
│   ├── app/                 # Owner App (dashboard, create wizard, passes, pay, analytics, settings)
│   ├── demo/simulation/     # 1-Click interactive hackathon story
│   ├── how-it-works/        # Architecture walkthrough
│   ├── merchant/            # Merchant POS terminals & checkout
│   ├── recipient/           # Recipient portal & direct payment
│   ├── security/            # Trust & non-custodial security model
│   ├── globals.css          # Design system & dark mode tokens
│   └── layout.tsx           # Root layout with Solana wallet provider
├── components/              # Navbar, Sidebar, WalletContextProvider
├── lib/
│   ├── ai/                  # Intent parser & receipt analyzer
│   ├── database/            # Prisma singleton client
│   ├── policy/              # Deterministic policy engine
│   └── solana/              # Anchor IDL, client helpers, PDA seeds
├── programs/pass_protocol/  # Anchor Rust smart contract
├── prisma/                  # Prisma schema & SQLite dev.db
├── tests/                   # Policy engine, AI intent, Anchor IDL unit tests
└── Anchor.toml              # Anchor configuration
```

---

## 7. Quickstart & Local Installation

### Prerequisites
- Node.js 18+ or 20+ installed
- npm / npx

### 1. Clone & Install Dependencies
```bash
cd "d:\hackathon projects\PASS"
npm install --ignore-scripts
```

### 2. Configure Environment
A default `.env` and `.env.local` are already pre-configured for local testing:
```bash
# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_PROGRAM_ID="Pass111111111111111111111111111111111111111"
NEXT_PUBLIC_TOKEN_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

# Database (SQLite zero-configuration)
DATABASE_URL="file:./dev.db"

# Optional Server-Side LLM API Key (Falls back to deterministic NLP parser if empty)
AI_API_KEY=""
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Unit Tests
```bash
npm test
```
All 12 unit tests will execute and pass:
- Policy engine category enforcement
- Per-transaction limit checks
- Over-spending protection
- Recipient identity validation
- Expiration and revocation checks
- Anchor IDL structure and PDA derivation consistency

### 5. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 8. Hackathon Judging Demo Walkthrough

To review the complete user story in under 2 minutes:

1. Navigate to **[http://localhost:3000/demo/simulation](http://localhost:3000/demo/simulation)**.
2. **Scenario 1 (Create PASS)**: Click *"1. Create PASS on Solana"*. Alice funds Bob with $100 for `GROCERIES` (max $50/tx).
3. **Scenario 2 (Valid Grocery Purchase)**: Click *"2. Execute $32.50 Grocery Payment"*. Bob buys vegetables at FreshMart. Status displays **APPROVED**, remaining balance updates to **$67.50**, and receipt is verified.
4. **Scenario 3 (Category Violation Attempt)**: Click *"3. Attempt $60 Gaming Payment"*. Bob attempts to spend $60 at Apex Gaming Store. Status displays **BLOCKED** (`Category mismatch: PASS restricted to GROCERIES`). Zero funds move.
5. **Scenario 4 (Owner Revocation)**: Click *"4. Revoke PASS & Refund Balance"*. Alice reclaims unspent funds. PASS status updates to **REVOKED**.
6. **Scenario 5 (Post-Revoke Attempt)**: Click *"5. Attempt Payment on Revoked PASS"*. Payment is deterministically rejected.

---

## 9. Security & Trust Boundaries

- **No AI Control of Funds**: The AI only drafts policies. The user approves them, and deterministic code/contracts enforce them.
- **Non-Custodial**: Neither seed phrases nor private keys are stored on server or database.
- **Owner Control**: The funding party retains full unilateral revocation power.

---

## 10. Future Roadmap

- **Autonomous AI Shopping Agents**: Allow autonomous AI agents to spend up to a hard budget on approved items without risk of prompt injection draining user wallets.
- **ZK Proof of Purchase**: Zero-knowledge verification of receipt line items without revealing user identity or merchant transaction details.
- **Multi-Chain Policy Adapters**: Abstracted `PaymentPolicyAdapter` interface for future Solana, Monad, and L2 integrations.
- **Merchant SDK**: Point-of-sale checkout plugins for Shopify, Stripe, and Solana Pay.
