# PASS — Hackathon Demo Script & Judge Presentation Guide

## Product Pitch (30 Seconds)
"Hello judges, we built **PASS: Money with instructions.**
Today, spending permissions are binary: you either give someone unrestricted money, or you don't.
PASS adds an **intent-aware policy and proof layer** on top of Solana programmable payments.
A parent can say: *'Give my brother $100 for groceries until Sunday, max $50 per transaction.'*
PASS translates that human intent into smart contract parameters, enforces categories at checkout, verifies receipts, and allows instant revocation."

---

## 2-Minute Live Demo Walkthrough

### Step 1: Show the Landing Page
- Open `http://localhost:3000`
- Point to tagline: *"Money with instructions."*
- Highlight the real-time Policy Simulator card showing `$100 USDC` for Groceries with Allowed ($32.40 at FreshMart) vs Blocked ($75 at Gaming Store).

### Step 2: Open 1-Click Simulation (`/demo/simulation`)
- Click **"1-Click Demo"** in the top navigation.
- Click **"1. Create PASS on Solana"**:
  - Alice funds Bob with $100 USDC for GROCERIES (max $50 per transaction).
  - Note: Anchor PDA accounts initialized.
- Click **"2. Execute $32.50 Grocery Payment"**:
  - Bob purchases milk, sourdough, and spinach at FreshMart.
  - Policy Engine verifies: Recipient valid, category GROCERIES matches, amount <= $50.
  - Result: **Payment APPROVED**, Remaining balance updates to **$67.50**, AI receipt verified at 98% confidence.
- Click **"3. Attempt $60 Gaming Payment (Watch Block)"**:
  - Bob attempts to buy a game at Apex Gaming Store ($60, ENTERTAINMENT).
  - Policy Engine triggers: **PAYMENT BLOCKED**.
  - Highlight to judges: Zero funds move on-chain, transaction fails deterministically.
- Click **"4. Revoke PASS & Refund Balance"**:
  - Alice revokes the PASS with one click. Status changes to **REVOKED**.
  - All unspent tokens refund to Alice.
- Click **"5. Attempt Payment on Revoked PASS"**:
  - Bob attempts checkout again. Rejected by contract.

### Step 3: Show the Natural Language AI Intent Parser
- Go to `/app/create`.
- In the top AI box, type:
  `"Give my sister $80 for transportation until Friday max $25"`
- Click **"Auto-Fill Policy"**.
- Show how the AI extracted:
  - Amount: `80`
  - Category: `TRANSPORT`
  - Max per tx: `25`
  - Expiry: `Friday`
- Emphasize safety: *"The AI only proposes the policy; deterministic smart contracts and the user enforce it."*

### Step 4: Show Analytics & Merchant Network
- Visit `/app/analytics`: Show spending by category and volume of blocked policy violations ($60 saved).
- Visit `/merchant`: Show POS checkout terminals.
