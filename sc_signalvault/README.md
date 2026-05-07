# sc_signalvault — On-chain Anchor for SignalVault

A small, deliberate Sui Move package that anchors **form ownership**, **admin authorization**, and **submission audit events** on-chain for [SignalVault](../README.md). All form schemas, response envelopes, and media live on **Walrus**; only access control and audit trail live on Sui.

## What This Contract Does

| Concern | Where It Lives |
|---|---|
| Form schema (questions, fields) | Walrus blob |
| Response payload (public + Seal-encrypted body) | Walrus blob |
| Media uploads (screenshot/video) | Walrus blob |
| **Ownership of a form** | **Sui — `FormPolicy` object** |
| **Admin allowlist for Seal decryption** | **Sui — `FormPolicy.admins`** |
| **Tamper-evident submission events** | **Sui — `ResponseRecorded` events** |

The contract is intentionally minimal. It claims no cryptography of its own. Seal handles encryption off-chain; this module is the canonical authorization source Seal policies (and any future indexer) reference.

## Module: `sc_signalvault::signalvault`

### Object

- **`FormPolicy`** *(shared)* — anchors a single form. Holds:
  - `form_uid: vector<u8>` — caller-supplied UID
  - `owner: address` — wallet that created the form
  - `schema_blob_id: String` — Walrus blob ID of the canonical schema
  - `admins: vector<address>` — wallets allowed to decrypt sensitive responses
  - `created_at_ms`, `updated_at_ms`, `active`, `response_count`

### Entry Functions

| Function | Caller | Purpose |
|---|---|---|
| `create_form(form_uid, schema_blob_id, clock, ctx)` | anyone | Mints a new shared `FormPolicy`. Emits `FormCreated`. |
| `update_schema(policy, new_blob_id, clock, ctx)` | owner | Replace schema blob ID after editing form. Emits `FormUpdated`. |
| `archive_form(policy, ctx)` | owner | Mark form inactive (rejects future responses). Emits `FormArchived`. |
| `reactivate_form(policy, ctx)` | owner | Re-enable an archived form. |
| `add_admin(policy, admin, ctx)` | owner | Add wallet to decrypt allowlist. Emits `AdminAdded`. |
| `remove_admin(policy, admin, ctx)` | owner | Remove wallet. Emits `AdminRemoved`. |
| `record_response(policy, response_blob_id, response_hash, clock, ctx)` | anyone | Anchor a submission. Emits `ResponseRecorded` with sequence number. |

### View Functions

- `owner(policy)`
- `is_active(policy)`
- `schema_blob_id(policy)`
- `admins(policy)`
- `response_count(policy)`
- `form_uid(policy)`
- **`is_authorized(policy, addr)`** — used by the Seal layer to gate decryption keys.

### Events

`FormCreated`, `FormUpdated`, `FormArchived`, `AdminAdded`, `AdminRemoved`, `ResponseRecorded`.

## How SignalVault Frontend Uses This

1. **Create form.** Client uploads schema JSON to Walrus → gets a blob ID → calls `create_form` with that blob ID. The returned `FormPolicy` object ID becomes the canonical `formId`.
2. **Submit response.** Client encrypts sensitive fields (Seal, anchored to the `FormPolicy` object ID), uploads the response envelope to Walrus, then calls `record_response`.
3. **Manage admins.** Form owner calls `add_admin` / `remove_admin`. The Seal access check reads `is_authorized` to decide whether to release decryption keys.
4. **Verify a receipt.** Anyone can read the `ResponseRecorded` event log for a given `policy_id` to verify a contributor's claim of submission — without ever seeing the encrypted body.

## How This Supports Seal

This module **does not** perform cryptography. It is the **authorization anchor** Seal references:

- The `FormPolicy` object ID is used as the policy identity in Seal envelopes.
- Seal's off-chain key release path queries `is_authorized(policy, requesting_wallet)` (or the `admins` view directly) before issuing decryption keys.
- Adding/removing an admin via `add_admin`/`remove_admin` updates the on-chain source of truth; subsequent Seal requests honor the new state.
- The contract emits explicit `AdminAdded`/`AdminRemoved` events so revocations are auditable.

This gives SignalVault a clean separation: cryptography in Seal, authorization in Sui, payloads in Walrus.

## Build & Test

Requires the [Sui CLI](https://docs.sui.io/build/install) (recent stable release).

```bash
# From C:\walrus\sc_signalvault
sui move build
sui move test
```

## Publish to Mainnet

```bash
# Make sure your active environment is mainnet and your active address holds SUI for gas:
sui client switch --env mainnet
sui client active-address

# Publish:
sui client publish --gas-budget 200000000

# After publish, copy the package ID into the frontend env:
#   VITE_SIGNALVAULT_PACKAGE_ID=0x<package-id>
```

The published package ID is what `frontend/src/lib/sui.ts` reads to build PTBs for `create_form`, `add_admin`, `record_response`, etc.

## Design Notes / Honesty

- **No on-chain cryptography.** Sensitive data is never passed into Move. Anything posted to Sui (UIDs, schema blob IDs, response blob IDs, hashes) is intentionally public.
- **Shared form objects.** Forms are shared so anyone can submit. Decrypt access is gated off-chain by Seal using the on-chain admin list.
- **No prevention of replays.** Submission anti-spam (CAPTCHA, wallet-gating, rate limits) is a frontend / off-chain concern. The contract only certifies *that* a response was anchored at a given time.
- **No upgrade module yet.** A package upgrade flow can be added later if the schema of `FormPolicy` evolves.
