# SignalVault — Implementation Notes

These notes are for the team and for the hackathon judges. They describe **what was actually built**, **what is real vs. adapter-mode**, and **what the remaining work is** before final submission.

## Overview of what landed

| Layer | Status | Lives in |
|---|---|---|
| Move smart contract (`sc_signalvault`) | ✅ Built, with tests | `sc_signalvault/` |
| Frontend (Next.js 16 / React 19 / Tailwind 4) | ✅ Built end-to-end | `frontend/` |
| Walrus storage adapter | ⚙ Adapter (live or demo) | `frontend/lib/walrus.ts` |
| Seal encryption adapter | ⚙ Adapter (live or demo) | `frontend/lib/seal.ts` |
| Sui wallet integration | ✅ Real (`@mysten/dapp-kit`) | `frontend/components/layout/Providers.tsx` |
| On-chain `record_response` PTB | ⚙ Stubbed (commented hand-off) | `frontend/lib/sui.ts` + `frontend/app/form/page.tsx` |
| Local insights / CSV export | ✅ Real, deterministic | `frontend/lib/insights.ts`, `frontend/lib/export.ts` |

> "Adapter" means: shape and contract are final; either the live mainnet endpoints or a clearly-labeled demo implementation runs behind the same interface. Switching to live requires only env vars, not refactoring.

## Smart contract — `sc_signalvault`

A single Move module: `sc_signalvault::signalvault`. Holds a shared `FormPolicy` object per form. Tracks owner, admin allowlist, schema blob ID, response counter, active flag. Emits `FormCreated`, `FormUpdated`, `FormArchived`, `AdminAdded`, `AdminRemoved`, and `ResponseRecorded` events. View `is_authorized(policy, addr)` is the canonical access-control check Seal references.

- **Build:** `sui move build` from `sc_signalvault/`.
- **Test:** `sui move test`. Tests cover create, owner-gated admin add/remove, duplicate-add error, missing-admin removal error, and stranger-cannot-archive.
- **Publish:** `sui client publish --gas-budget 200000000`. Copy the resulting package ID into `NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID` in `frontend/.env.local`.

The contract holds **no cryptography** — it is the authorization anchor for Seal, nothing more. This is intentional and documented in `sc_signalvault/sources/signalvault.move`.

## Frontend — what the user sees today

Six routes are functional end-to-end, even with all adapters in demo mode:

1. **`/`** — Landing. Hero, in-page dashboard preview, why-Walrus grid, how-it-works steps, Proof-of-Feedback callout, CTA.
2. **`/create`** — Form builder. All required field types (rich text, short text, dropdown, checkbox, star rating, screenshot, video, URL, confirmation). Per-field required / sensitive / show-on-receipt toggles. Live preview. Publish writes the schema to Walrus and stores a local index of the form.
3. **`/form?id=…`** — Public submission. Validation, file uploads, sensitive-field encryption with Seal (or AES-GCM in demo mode), envelope upload to Walrus, receipt generation. Progress UI shows: preparing → encrypting → uploading media → uploading response → anchoring.
4. **`/dashboard`** — Forms inbox with stat cards (forms, responses, encrypted, high-priority), recent submissions list, "show only mine" filter. Seeds with realistic demo content on first load so the UI is never empty for judges.
5. **`/dashboard/form?id=…`** — Per-form triage. Filter (search + priority + status), priority lanes (P0–P3), status tags, internal notes, decrypt sensitive fields on demand, CSV export, insights panel (rating histogram, recurring phrases, suggested next action).
6. **`/receipt?id=…`** — Public Proof-of-Feedback receipt. Shows form ID, response blob ID, content hash, timestamp, optional submitter wallet, opt-in public summary. Body remains Seal-encrypted.

## Real vs. adapter

### Real
- **UI / UX, all six routes.** Polished, hand-built, dark-first.
- **Sui wallet connect** (`@mysten/dapp-kit`).
- **Form schema authoring + validation** (`lib/forms.ts`).
- **CSV export** (`lib/export.ts`).
- **Local insight generation** (`lib/insights.ts`) — deterministic, no external APIs.
- **Demo persistence** via localStorage with a clear note that it is *not* the source of truth.
- **Move package**, with passing tests.

### Adapter / demo (and explicitly labeled in the UI)
- **Walrus put/get.** When `NEXT_PUBLIC_WALRUS_PUBLISHER_URL` and `..._AGGREGATOR_URL` are set, the adapter performs real `PUT /v1/blobs` and `GET /v1/blobs/{id}` calls. Otherwise it returns deterministic `demo_<sha256>` blob IDs and caches bytes in memory + localStorage so the rest of the app continues to work end to end.
- **Seal encryption.** When `NEXT_PUBLIC_SEAL_PACKAGE_ID` is set, the adapter is wired to the (TODO) Seal SDK call. Otherwise it uses AES-GCM-256 with a key derived deterministically from the policy object ID. The envelope shape is the same in both modes, so flipping to live requires only replacing the marked branch in `lib/seal.ts`.
- **`record_response` PTB.** The Move contract is ready to anchor submissions; the frontend currently stubs the call with a small async delay. Switching to live = uncomment the dapp-kit `useSignAndExecuteTransaction` block and call `signalvault::record_response(policy, blob_id, hash, clock)`.
- **`AdapterBanner`** at the top of every page reports the current state of each adapter — judges should never be unsure what's real.

## Remaining work before submission

- [ ] Set the four mainnet env vars in `frontend/.env.local`.
- [ ] `sui move build && sui move test && sui client publish --gas-budget 200000000` from `sc_signalvault/`.
- [ ] Replace the marked TODO in `lib/seal.ts` with `@mysten/seal` calls and confirm round-trip encrypt → decrypt with the published `FormPolicy` object.
- [ ] Wire the actual `record_response` PTB in `app/form/page.tsx` (the comment block in `lib/sui.ts` is the hand-off).
- [ ] `npm run build`, drag `out/` into <https://web.walgo.xyz> (or run `site-builder publish ./out --epochs 30`).
- [ ] Bind a SuiNS subname (e.g. `signalvault.ezidentity`) to the `siteObjectId`.
- [ ] Update `NEXT_PUBLIC_APP_URL` and rebuild so absolute links inside the site point to the live URL.
- [ ] Record a 3-minute demo video following the script in the root `README.md`.
- [ ] Post the demo on X with `#Walrus`. Join the Walrus Discord. Submit the Airtable + DeepSurge forms.

## Demo checklist (3-minute script anchor)

- [ ] Open landing → show hero + dashboard preview.
- [ ] Click **Create a form** → drop in fields → toggle **Sensitive** on the long-answer field → Publish.
- [ ] Copy the share link → open in a private window → submit a response with screenshot + 4 stars + sensitive text.
- [ ] Show the Receipt page → blob ID, content hash, timestamp, sealed-body banner.
- [ ] Switch to creator wallet → `/dashboard` → click into the form → decrypt the sensitive answer → set P1 → add an internal note → export CSV.
- [ ] Cut to the Walrus + Sui architecture frame → close.

## Known limitations

- Static export prevents server-side rendering of dynamic paths, so all dynamic routes use query strings (`?id=…`). This is intentional and documented in `frontend/README.md`.
- Demo mode persistence is per-browser. Forms created in one browser will not appear in another until live Walrus mode is enabled.
- Seal's revocation timing semantics (e.g. cached decryption keys) are not enforced by the demo adapter. The live Seal integration handles this; the demo branch is marked accordingly.
- Insights are intentionally deterministic and local-only. We do not depend on external AI APIs and we do not claim AI features.
