# Deployment Runbook — SignalVault

End-to-end deploy from clean clone to live `signalvault.ezidentity.wal.app`. Follow the steps in order; you can stop after Phase 2 and still demo, but Phase 3 + 4 are required for the hackathon submission.

## Status snapshot (autonomous portion)

- ✅ Move package written & tests written → `sc_signalvault/`
- ✅ Frontend implemented end-to-end → `frontend/`
- ✅ `npm install` completed (468 packages)
- ✅ `npm run build` succeeds → `frontend/out/` (2.8 MB, 7 static routes)
- ✅ `npm run dev` boots cleanly on `localhost:3000`
- ⏸ Move build / test / publish → requires Sui CLI (you run locally)
- ⏸ Walrus Sites deploy → requires your wallet + WAL token
- ⏸ SuiNS subname bind → requires your wallet
- ⏸ Env-var swap from demo → live → after Phase 1 & 3 give you IDs

---

## Phase 1 — Publish the Move package

Requires the Sui CLI. Install if missing: <https://docs.sui.io/build/install>.

```powershell
# Switch to mainnet and confirm your active address holds enough SUI for gas (~0.5 SUI is plenty)
sui client switch --env mainnet
sui client active-address
sui client gas

# Build & test
cd C:\walrus\sc_signalvault
sui move build
sui move test

# Publish
sui client publish --gas-budget 200000000
```

After publish, the CLI prints a `packageId`. Copy it.

```text
Created Objects:
   ┌──
   │ ObjectID: 0xabc...                <-- this is the package ID
   │ Sender: 0xyou
   │ Owner: Immutable
   │ ObjectType: 0x2::package::UpgradeCap
   └──
```

→ Save as `NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID` (Phase 4).

---

## Phase 2 — Configure env for live mainnet

```powershell
cd C:\walrus\frontend
copy .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUI_NETWORK=mainnet

# Pick public Walrus mainnet endpoints. Examples (verify in Walrus docs):
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus.space

NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID=0x<from Phase 1>

# Leave blank until Seal SDK is wired (lib/seal.ts has TODO marker).
NEXT_PUBLIC_SEAL_PACKAGE_ID=

# Final canonical URL (set after Phase 3.3)
NEXT_PUBLIC_APP_URL=https://signalvault.ezidentity.wal.app
```

> Without these env vars, the app stays in demo adapter mode — every flow still works, the AdapterBanner just announces it.

---

## Phase 3 — Walrus Sites mainnet deploy

### 3.1 — Build static bundle

```powershell
cd C:\walrus\frontend
npm run build
# → ./out  (2.8 MB)
```

### 3.2 — Publish to Walrus Sites

**Option A — walgo.xyz (browser, recommended for hackathon speed):**

1. Open <https://web.walgo.xyz>.
2. Connect the **dedicated Walrus Sessions wallet**.
3. Click **Create new site**.
4. Drag the **contents** of `frontend/out/` (not the folder itself) into the upload area.
5. Sign the transaction. Wait for confirmation.
6. Copy the resulting **Site Object ID**.

**Option B — `site-builder` CLI:**

```powershell
# Install site-builder per Walrus docs.
site-builder publish ./frontend/out --epochs 30
# Copy the Site Object ID from output.
```

### 3.3 — Bind SuiNS subname

You already own `@ezidentity` (expires 2027-04-19). Create the subname:

1. Open the SuiNS app (or your existing SuiNS dashboard).
2. Open `@ezidentity` → **New Subname** → name: `signalvault`.
3. In the subname record, set the **Walrus Site Object ID** field to the value from 3.2.
4. Save / sign.
5. Wait ~30 seconds for the resolver, then visit:

```
https://signalvault.ezidentity.wal.app
```

That URL is your **canonical demo link** for the submission.

### 3.4 — Final rebuild + republish (only if you changed `NEXT_PUBLIC_APP_URL`)

```powershell
npm run build
# Re-upload the new ./out via walgo.xyz (or site-builder update <siteObjectId>).
```

---

## Phase 4 — Wire real Seal + on-chain anchoring

Both items live behind clearly-marked adapter boundaries. Each is a small, isolated change.

### 4.1 — Real Seal encryption (`frontend/lib/seal.ts`)

1. Set `NEXT_PUBLIC_SEAL_PACKAGE_ID` in `.env.local` (from Seal docs).
2. `npm install @mysten/seal` (or whichever Seal SDK package the docs name).
3. Replace the marked `TODO` branch in `encryptSensitive` with the SDK call. Use `policyObjectId` as the access anchor.
4. Add a matching branch in `decryptSensitive` for `scheme === "seal-v1"`.

The envelope shape (`policyObjectId` + `ciphertext` + `nonce` + `scheme`) is already wire-compatible.

### 4.2 — Real `record_response` PTB (`frontend/app/form/page.tsx`)

Replace the `setStep({ kind: "anchoring" }); await new Promise(...)` block with:

```ts
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { recordResponseTarget, SIGNALVAULT_PACKAGE_ID } from "@/lib/sui";

const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

// inside onSubmit, after envelope upload:
if (SIGNALVAULT_PACKAGE_ID && schema.policyObjectId) {
  const tx = new Transaction();
  tx.moveCall({
    target: recordResponseTarget(),
    arguments: [
      tx.object(schema.policyObjectId),
      tx.pure.vector("u8", new TextEncoder().encode(upload.blobId)),
      tx.pure.vector("u8", hexToBytes(response.responseHash!)),
      tx.object("0x6"), // Clock
    ],
  });
  await signAndExecute({ transaction: tx });
}
```

Same pattern works for `create_form` (in `app/create/page.tsx`) and `add_admin` / `remove_admin` (admin management UI — nice-to-have).

---

## Phase 5 — Submission deliverables

- [ ] Register on **DeepSurge**.
- [ ] Submit Airtable: <https://airtable.com/appoDAKpC74UOqoDa/shrN8UbJRdbkd5Lso>.
- [ ] Project name: **SignalVault**.
- [ ] Logo: drop a `logo.svg` into `frontend/public/`, redeploy.
- [ ] Description: copy the One-Pager from root `README.md` §20.
- [ ] Project website: `https://signalvault.ezidentity.wal.app`.
- [ ] Primary contact: your email.
- [ ] GitHub repo: push this folder, paste the URL.
- [ ] Demo video: ≤ 3 min, follow script in root `README.md` §19.
- [ ] One-pager PDF: export §20 to a single page.
- [ ] Dedicated Walrus Sessions wallet address.
- [ ] Walrus Discord joined: <https://discord.com/invite/walrusprotocol>.
- [ ] X post with `#Walrus`.

---

## Quick health-check commands

```powershell
# Frontend dev
cd C:\walrus\frontend
npm run dev          # http://localhost:3000

# Frontend build
npm run build        # → out/

# Move
cd C:\walrus\sc_signalvault
sui move build
sui move test
```

---

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run build` fails on a `Uint8Array<ArrayBufferLike>` error | TS lib types tightened | Already patched. If reappears, copy with `tightCopy` helper. |
| Walrus upload returns 4xx | Publisher URL wrong / out of WAL | Switch publisher in `.env.local`, top up WAL. |
| `record_response` fails with `EFormInactive` | Form was archived | Owner calls `reactivate_form`. |
| Seal decrypt fails for an admin | Admin not yet added on-chain | Owner calls `add_admin(policy, address)`. |
| SuiNS subname doesn't resolve | Resolver caching | Wait 1–2 min, hard refresh. |
| Adapter banner still says "demo" after env change | Build-time env, needs rebuild | `npm run build`, redeploy. |
