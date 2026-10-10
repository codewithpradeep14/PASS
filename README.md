# PASS — Money with Instructions

> **Solana Hackathon Project**  
> Purpose-aware programmable payments, deterministic policy enforcement on **Solana Devnet**, and optional modular integrations for **Solami**, **Meteora**, and **Panta**.

---

## 1. Executive Summary & Problem Statement

Standard crypto wallets and allowances grant binary permissions:
> *"You may spend up to $100."*

Once tokens leave an owner's account or are delegated, they can be spent anywhere, on anything, without purpose constraints.

**PASS** transforms binary spending into **Purpose-Aware Payments**:
> *"You may spend up to $100, for groceries only, with a maximum of $40 per transaction, valid for 1 hour, through verified checkouts."*

### What is Enforced vs. What is Advisory
- **Enforced Deterministically (Anchor Contract & Policy Engine)**:
  - Recipient wallet authorization.
  - Total budget allowance.
  - Maximum amount per transaction.
  - Expiration timestamp with live countdown timers (`hh:mm:ss`).
  - Owner instant revocation and vault refund.
  - Declared category compliance (e.g. `GROCERIES` allowed, `ENTERTAINMENT` blocked).
- **Advisory (AI & External Feeds)**:
  - AI natural-language intent parsing extracts human instructions into structured rules (validated with strict Zod schemas). AI **never** holds keys, authorizes payments, or bypasses deterministic rules.
  - Receipt line-item analysis provides advisory post-payment categorization.
  - A merchant or checkout integration provides the declared purchase context.

---

## 2. Integrated Application Architecture

PASS operates as one coherent application with four distinct areas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              PASS CORE                                 │
│    Purpose-Aware Budgets • Deterministic Policy Engine • PDA Escrow   │
│    Expiration Timers • Non-Custodial Revocation • Cryptographic Audit  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  SOLAMI MODULE   │      │  METEORA MODULE  │      │   PANTA MODULE   │
│  Infrastructure  │      │  Launch Insights │      │  Market Insights │
│  • Private RPC   │      │  • Dynamic Curve │      │  • Prediction Mkts│
│  • gRPC Stream   │      │  • DAMM v2 Pools │      │  • YES/NO Probs  │
│  • Blur Decoder  │      │  • Treasury Link │      │  • Sentiment     │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

1. **PASS Core**: The foundation of purpose-aware budgets, spending caps, deterministic policy checks, point-of-sale verification, and owner revocation.
2. **Solami Integration**: Optional Solana infrastructure module. Connects to Solami private RPC, Mirage WebSocket/Yellowstone streaming, and Blur decoded on-chain activity to monitor PASS escrow transactions and SWQoS landing.
3. **Meteora Integration**: Optional project treasury module. Connects to Meteora Dynamic Bonding Curves (DBC) and DAMM v2 pools to correlate PASS operational budgets with token launch progress and liquidity depth.
4. **Panta Integration**: Optional prediction market module. Connects to the Panta API to discover prediction markets and monitor ecosystem sentiment and milestone resolution signals.

> **Modularity Guarantee**: PASS Core operates completely independently. If any or all external integrations are not configured, all PASS budget creation, policy enforcement, point-of-sale terminals, and wallet payments continue to function without disruption.

---

## 3. Modular Integrations in Detail

### A. Solami Infrastructure (`solami.dev`)
- **Features Used**:
  - Private RPC (`https://rpc.solami.dev/sol`): High-throughput stake-weighted RPC.
  - Mirage WebSocket: Real-time streaming of on-chain account updates without local gRPC tooling.
  - Blur Decoded Activity: Typed event stream decoding PASS escrow creation, spend execution, and policy blocks.
  - Beam Landing Status: Transaction submission monitoring (SWQoS).
- **Policy Isolation**: Solami data monitors on-chain events; the PASS policy engine remains exclusively responsible for enforcing spending rules.

### B. Meteora Launch Insights (`meteora.ag`)
- **Features Used**:
  - Dynamic Bonding Curve (DBC) Program (`dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`): Tracks token launch bonding curve progress toward DAMM v2 pool graduation.
  - DAMM v2 / DLMM Public API: Live pool reserves, 24h trading volume, and liquidity depth.
  - Treasury Budget Correlation: Links a specific PASS budget (e.g., *"Seed Liquidity & Marketing"*) to the on-chain bonding curve state.
- **Safety**: 100% read-only monitoring. Does not perform automated token creation, swaps, or liquidity migrations without explicit user wallet signing.

### C. Panta Market Insights (`panta.market`)
- **Features Used**:
  - Panta REST API (`https://live-api.panta.market/api/v1`): Discovers prediction markets across Solana ecosystem topics, project milestones, and governance.
  - Outcome Probabilities: Formats YES/NO share prices and real-time community sentiment bars.
- **Policy Isolation**: Prediction market outcomes provide research context for budget planning; they can never authorize an unapproved payment or bypass PASS deterministic checks.

---

## 4. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/pass-protocol.git
cd pass-protocol

# 2. Install dependencies
npm install

# 3. Initialize Prisma SQLite database
npm run prisma:push

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
# Solana Devnet Configuration
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_PROGRAM_ID="Pass111111111111111111111111111111111111111"
NEXT_PUBLIC_TOKEN_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

# Database
DATABASE_URL="file:./dev.db"

# Optional AI API Key (Gemini, Claude, or OpenAI)
AI_API_KEY=""

# ==========================================
# OPTIONAL INTEGRATION MODULES
# ==========================================

# 1. Solami Infrastructure (solami.dev)
SOLAMI_API_KEY=""
SOLAMI_RPC_URL="https://rpc.solami.dev/sol"
SOLAMI_STREAM_URL="wss://mirage.solami.dev"
SOLAMI_DEMO_MODE="true"

# 2. Meteora Launch Insights (meteora.ag)
METEORA_RPC_URL=""
METEORA_DBC_PROGRAM_ID="dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
METEORA_DEMO_MODE="true"

# 3. Panta Market Insights (panta.market)
PANTA_API_KEY=""
PANTA_API_BASE_URL="https://live-api.panta.market/api/v1"
PANTA_DEMO_MODE="true"
```

### Module Status States
Each module in `/app/integrations` and `/app/treasury` reports one of five verified states:
- `Connected`: Validated via a live HTTP/JSON-RPC test request.
- `Not configured`: API credentials are missing; module gracefully disables without crashing.
- `Demo mode`: Enabled via `*_DEMO_MODE="true"`; presents clearly labelled simulated telemetry.
- `Temporarily unavailable`: Endpoint timed out or returned non-200.
- `Partially integrated`: Read-only queries supported; transaction capabilities unconfigured.

---

## 6. Running Tests

The test suite validates PASS Core policy isolation, Anchor IDL derivations, and all three integration adapters:

```bash
# Run all automated tests
npm test
```

### Verified Test Suites (23 Tests Passing):
- `tests/policy_engine.test.js`: Deterministic category checks, transaction caps, expiration, and remaining balance checks.
- `tests/pass_core_isolation.test.js`: Verifies external module signals (Solami/Meteora/Panta) cannot bypass category checks or expired statuses.
- `tests/ai_intent.test.js`: Natural-language parsing, Zod schema validation, and hour/minute timer calculations.
- `tests/pass_protocol.test.js`: Anchor contract IDL structure and PDA seed derivations (`b"pass"`, `b"pass_vault"`).
- `tests/solami_integration.test.js`: Solami RPC health check, unconfigured state handling, and `live_solami` vs `demo_solami` labeling.
- `tests/meteora_integration.test.js`: Dynamic bonding curve state parsing, DAMM migration metrics, and PASS budget correlation.
- `tests/panta_integration.test.js`: Panta market discovery, YES/NO probability calculation, and category filtering.

---

## 7. Working Demo Walkthrough

### 1. Create a Purpose-Aware Budget (`/app/create`)
- Enter natural-language instruction:
  > *"Give my friend $25 for groceries for 1 hour with max $15 per transaction"*
- Click **Auto-Fill Policy**: The AI extracts category `GROCERIES`, sets the 1-hour expiration timestamp, and starts a live ticking countdown timer (`00h:59m:59s`).
- Review and sign the PASS initialization.

### 2. Test Policy Enforcement (`/app/pay`)
- Select the active grocery PASS.
- Test against **FreshMart Supermarket** (Category: `GROCERIES`, Amount: `$12.00`): Policy evaluates **PAYMENT ALLOWED**.
- Test against **Apex Gaming Store** (Category: `ENTERTAINMENT`, Amount: `$25.00`): Policy evaluates **PAYMENT BLOCKED** with deterministic violation reasoning.

### 3. Review Project Treasury (`/app/treasury`)
- View the **Project Treasury** hub correlating PASS active escrows with:
  - **Solami Stream**: Recent transactions with slot heights and Solana explorer links.
  - **Meteora Launch Insights**: Dynamic Bonding Curve launch progress (e.g. 68.4% to DAMM migration).
  - **Panta Market Insights**: Prediction market probabilities (e.g., Solana TPS, milestone targets).

### 4. Check Module Diagnostics (`/app/integrations`)
- Open the **Integrations Hub** to view live connection badges, copy environment variables, and run one-click diagnostic health checks.

---

## 8. Security & Limitations

- **Non-Custodial Design**: Funds reside in Solana Anchor Program Derived Addresses (`b"pass_vault"`). Neither PASS servers nor AI assistants possess private keys.
- **Fail-Safe Policy Evaluation**: Missing merchant metadata or unverified categories default to strict blocking.
- **Devnet Focus**: Designed and tested on Solana Devnet. Mainnet deployment requires separate security audits and funded accounts.
- **Real-World Category Verification**: On-chain transfers alone do not prove real-world purchase contents. Verification relies on trusted merchant Point-of-Sale checkouts, cryptographically signed receipts, or verified payment terminals.
