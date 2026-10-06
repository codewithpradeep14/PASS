const test = require("node:test");
const assert = require("node:assert");
const { PublicKey } = require("@solana/web3.js");
const idl = require("../lib/solana/idl.json");

test("Anchor IDL Structure & Accounts Verification", () => {
  assert.strictEqual(idl.metadata.name, "pass_protocol");
  assert.strictEqual(idl.instructions.length, 4);

  const createPassIx = idl.instructions.find((ix) => ix.name === "create_pass");
  assert.ok(createPassIx, "create_pass instruction must exist");
  assert.strictEqual(createPassIx.accounts.some((a) => a.name === "pass_account"), true);
  assert.strictEqual(createPassIx.accounts.some((a) => a.name === "vault_account"), true);

  const executePaymentIx = idl.instructions.find((ix) => ix.name === "execute_payment");
  assert.ok(executePaymentIx, "execute_payment instruction must exist");

  const revokePassIx = idl.instructions.find((ix) => ix.name === "revoke_pass");
  assert.ok(revokePassIx, "revoke_pass instruction must exist");
});

test("PDA Derivation Consistency", () => {
  const PASS_SEED = Buffer.from("pass");
  const VAULT_SEED = Buffer.from("pass_vault");
  const programId = new PublicKey("Pass111111111111111111111111111111111111111");
  const owner = new PublicKey("11111111111111111111111111111111");
  const passIdBuf = Buffer.alloc(16);
  passIdBuf.write("demo_pass_123456");

  const [passPda, passBump] = PublicKey.findProgramAddressSync(
    [PASS_SEED, owner.toBuffer(), passIdBuf],
    programId
  );
  assert.ok(passPda instanceof PublicKey);
  assert.ok(typeof passBump === "number");

  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
    [VAULT_SEED, owner.toBuffer(), passIdBuf],
    programId
  );
  assert.ok(vaultPda instanceof PublicKey);
  assert.ok(typeof vaultBump === "number");
  assert.notStrictEqual(passPda.toBase58(), vaultPda.toBase58());
});
