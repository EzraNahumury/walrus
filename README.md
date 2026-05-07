# SignalVault — Encrypted Feedback OS on Walrus

> A Walrus-native feedback and form operating system for Web3 teams. Build forms in minutes, collect community feedback, encrypt private responses with Seal, and turn raw signal into shipped product decisions — all stored on decentralized Walrus blobs that teams actually own.

---

## 1. One-Line Pitch

**SignalVault is the encrypted, content-addressed feedback OS that lets Web3 teams collect, verify, and act on community signal — with cryptographic Proof-of-Feedback receipts and Seal-gated private responses, all natively stored on Walrus.**

---

## 2. The Problem

Web3 teams today collect community feedback across a fragmented stack:

- Bug reports live in **Discord threads** that scroll into oblivion.
- Feature requests are buried in **Notion docs** nobody opens.
- Surveys go through **Google Forms / Typeform** — centralized, opaque, and owned by the vendor.
- Grant applications get emailed, DM'd, or pasted into **Telegram**.
- Sentiment lives in **X replies** with zero structure.
- Sensitive feedback (security disclosures, candid reviews, applications) is leaked through plaintext channels with no access control.

This creates four hard failures:

1. **Fragmentation.** Teams cannot see all feedback in one place.
2. **No ownership.** When a vendor goes down, raises prices, or changes ToS, your community signal evaporates.
3. **No privacy guarantees.** Sensitive submissions sit in plaintext on someone else's servers.
4. **No verifiability.** Contributors cannot prove they submitted feedback. Teams cannot prove the dataset is untampered.

In short: **Web2 form tools were never designed for sovereign, verifiable, encrypted community feedback.**

---

## 3. The Solution

**SignalVault** is a feedback platform built natively on Walrus, designed from day one around content-addressed storage, encrypted access control, and portable team-owned archives.

- Anyone can spin up a custom form (bug report, feature request, survey, grant application, retro, NPS) in under 90 seconds.
- Every form schema is published as a **public Walrus blob** with a verifiable blob ID.
- Every response is stored on Walrus, organized by form.
- Sensitive fields are **encrypted client-side using Seal** before upload — only the form creator and approved admins can decrypt.
- Public, non-sensitive metadata (form ID, response blob ID, timestamp) generates a **Feedback Receipt** the contributor can show off, link to, or use as Proof-of-Feedback.
- A polished **admin dashboard** lets teams triage, filter, annotate, prioritize, export, and convert raw responses into actionable insights.

The full archive is portable: at any moment, a team can hand off the list of blob IDs and walk away with their entire feedback history.

---

## 4. Why Walrus

SignalVault is not a Web2 product with a "blockchain sticker" pasted on. It is fundamentally only possible because of Walrus.

| Property | What Walrus Gives Us | Why It Matters for Feedback |
|---|---|---|
| **Content-addressed storage** | Every form / response / media file is a verifiable blob ID | A response's blob ID *is* its receipt. No DB rows to forge. |
| **Decentralized availability** | Blobs replicated across Walrus nodes | A team's archive survives any single vendor going dark. |
| **Verifiable data** | Anyone can fetch a blob and check its hash | Communities can audit form questions and submission counts. |
| **Public/private separation** | Blob access is layered with Seal access policies | Public schemas remain open; private bodies remain encrypted. |
| **Encrypted access control (Seal)** | Decrypt only with on-chain authorization | Granular, revocable admin access without central key servers. |
| **Composable feedback datasets** | Any other dApp can read public form schemas | Form templates become public goods. |
| **Tamper-evident history** | Blob IDs are immutable | Receipts are forever provable. |
| **Portable archives** | Teams own their blob ID list | Migrate, fork, or sell archives without vendor lock-in. |

Walrus turns feedback from a vendor-dependent service into **infrastructure-level community signal**.

---

## 5. Core Features

### 5.1 Form Creation
- Drag-and-drop **form builder** with live preview.
- Field types: rich text, single-line text, dropdown, multi-select, checkbox group, **star rating**, **screenshot upload**, **video upload**, URL link, confirmation checkbox, signature/wallet attestation, date.
- Per-field flags: required/optional, sensitive (Seal-encrypted), public-receipt-visible.
- Form-level settings: name, description, cover image, category, allowed wallet domains, open/close window, submission limits.
- One-click **shareable form link** (`/form/[formId]`).

### 5.2 Walrus-Backed Storage
- Every form schema → published as a public Walrus blob.
- Every response → published as a Walrus blob, indexed by form ID.
- Media uploads (screenshots / videos) → stored as separate Walrus blobs and referenced from the response envelope.
- Metadata index → maintained as a small Walrus/Sui-anchored object mapping `formId → response blob IDs`.

### 5.3 Seal-Encrypted Sensitive Responses
- Fields flagged `sensitive: true` are encrypted **client-side** before the response blob ever leaves the browser.
- Decryption keys are gated by a Seal access policy: form creator + explicitly approved admin wallets.
- Public envelope metadata (form ID, timestamp, blob ID, optional wallet attestation) remains visible.

### 5.4 Admin Dashboard (`/dashboard`)
- Inbox view of every response across all forms owned by the connected wallet.
- **Filter** by form, status, priority, has-attachment, contains-text, time window.
- **Internal notes** (also stored on Walrus, encrypted) attached to any response.
- **Priority/ranking** — drag responses into P0/P1/P2/P3 lanes or assign numeric scores.
- **Status tags** — New / Reviewing / Triaged / Shipped / Won't Fix.
- **Bulk export** — JSON, CSV, Markdown digest, or signed Walrus archive.
- **Insight generation** — auto-cluster responses by tag, summarize starred fields, render rating histograms.

### 5.5 Feedback Receipt (the unique primitive)
- After submission, the contributor receives a **shareable receipt URL** (`/receipt/[receiptId]`) containing:
  - form ID & form name
  - response blob ID & content hash
  - timestamp
  - optional contributor wallet address
  - public, non-sensitive fields (if the form allows)
- The private body remains Seal-encrypted on Walrus. The contributor can **prove they submitted feedback** without revealing the content. A grants applicant can prove they applied. A bug reporter can prove disclosure date. A survey participant can prove participation.

This primitive is **impossible cleanly in Web2** — it requires verifiable, content-addressed storage and on-chain-anchored attestations.

---

## 6. Winning Differentiator — "Proof-of-Feedback"

Five things SignalVault does that no Typeform/Airtable/Tally clone can:

1. **Proof-of-Feedback receipts.** Contributors hold cryptographic proof of submission without leaking content.
2. **Portable archives.** A team's entire feedback history is a list of blob IDs. They own it. Forever.
3. **Selective decryption.** Admins can grant or revoke decrypt access per-wallet via Seal — no key rotation drama.
4. **Composable form templates.** A "Web3 grants application" form is a public Walrus blob that any DAO can fork, version, and reuse. Forms become public goods.
5. **Tamper-evident triage.** Internal notes and priority changes can be optionally anchored on Sui/Walrus so the audit trail of *how a team handled feedback* is itself verifiable.

---

## 7. User Personas

| Persona | Use Case |
|---|---|
| **Web3 project founder** | Collect product feedback and bug reports from token holders. |
| **Ecosystem / community manager** | Run NPS surveys, collect AMA questions, gather event feedback. |
| **Protocol grants reviewer** | Receive grant applications with encrypted PII. |
| **Product manager** | Triage feature requests and prioritize roadmap. |
| **Hackathon organizer** | Collect submissions, judge feedback, post-event surveys. |
| **DAO contributor** | Submit retro feedback or governance proposals with proof-of-submission. |

---

## 8. User Flows

### 8.1 Create Form Flow
1. Connect Sui wallet on `/`.
2. Click **New Form** → `/create`.
3. Set name, description, category.
4. Add fields via builder; toggle required + sensitive flags.
5. Click **Publish**.
6. Frontend serializes schema → uploads to Walrus → receives blob ID.
7. Frontend updates the creator's form index (Sui object or Walrus blob).
8. Returns shareable link `/form/[formId]`.

### 8.2 Submit Response Flow
1. Visitor opens `/form/[formId]`.
2. Frontend fetches form schema from Walrus by blob ID.
3. Visitor fills fields, attaches screenshot/video.
4. Frontend separates public vs sensitive fields.
5. Sensitive fields → encrypted with Seal under the form's access policy.
6. Media uploads → Walrus, returns media blob IDs.
7. Final response envelope (public metadata + ciphertext + media refs) → Walrus.
8. Receipt object generated → contributor gets `/receipt/[receiptId]`.

### 8.3 Admin Review Flow
1. Form owner opens `/dashboard`.
2. Frontend reads creator's form index → fetches each form's response index.
3. Public envelope metadata renders immediately.
4. For sensitive content, frontend invokes Seal to request decryption keys.
5. On authorization, frontend decrypts client-side and renders.
6. Admin can filter, tag, prioritize, add notes.

### 8.4 Seal Admin Access Flow
1. Form creator opens form settings → **Manage Admins**.
2. Adds a wallet address as an admin.
3. Seal access policy is updated on-chain to include the new wallet.
4. New admin connects, sees the form in their dashboard, can decrypt going forward.
5. Revocation removes the wallet from the policy; future decryption requests fail.

### 8.5 Export / Insight Flow
1. Admin selects a form + filter set on `/dashboard/forms/[formId]`.
2. Picks export format (JSON / CSV / Markdown digest / signed Walrus archive).
3. Sensitive fields are included only if the requester holds decryption rights.
4. Insight panel renders auto-summary: rating distribution, top tags, response volume over time, top contributors by wallet.

---

## 9. Architecture

```
                          ┌────────────────────────────────────────┐
                          │           User Browser                  │
                          │   (Static React/Next.js bundle)         │
                          └───────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │   Static Frontend hosted on Walrus Sites      │
                  │   (wal.app / SuiNS domain — primary deploy)   │
                  └───────────────┬───────────────────────────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐
     │  Sui Wallet    │  │  Walrus SDK    │  │   Seal SDK      │
     │  (auth + sig)  │  │  publisher /   │  │  (encrypt /     │
     │                │  │  aggregator    │  │   decrypt /     │
     │                │  │  HTTP API)     │  │   policy mgmt)  │
     └────────┬───────┘  └────────┬───────┘  └────────┬────────┘
              │                   │                    │
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐
     │  Sui Mainnet   │  │   Walrus Mainnet │  │  Seal Policy    │
     │  (form index   │  │   (schemas,      │  │  Object on Sui  │
     │   object,      │  │    responses,    │  │  (creator +     │
     │   admin list)  │  │    media blobs)  │  │   admin allow)  │
     └────────────────┘  └──────────────────┘  └─────────────────┘
```

**Flow summary**

```
User Browser
  └─> Static frontend hosted on Walrus Sites
        └─> Sui wallet auth (zkLogin / wallet adapter)
              └─> Form schema stored on Walrus (public blob)
                    └─> Response encrypted with Seal when sensitive
                          └─> Response blob stored on Walrus
                                └─> Metadata/index updated on Walrus/Sui
                                      └─> Admin dashboard fetches index
                                            └─> Decrypts authorized blobs via Seal
```

No centralized backend. No Postgres. No vendor database. The browser is the runtime; Walrus + Sui + Seal are the substrate.

---

## 10. Data Model

```ts
// types/forms.ts

export type FieldType =
  | "rich_text"
  | "short_text"
  | "dropdown"
  | "multi_select"
  | "checkbox_group"
  | "star_rating"
  | "screenshot"
  | "video"
  | "url"
  | "confirmation"
  | "wallet_attestation"
  | "date";

export interface FormField {
  id: string;                  // local UUID within the form
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  sensitive: boolean;          // if true → encrypted via Seal
  publicOnReceipt: boolean;    // if true → safe to show on receipt page
  options?: string[];          // for dropdown / multi_select / checkbox_group
  maxRating?: number;          // for star_rating (default 5)
  maxFileSizeMB?: number;      // for screenshot / video
  placeholder?: string;
  validationRegex?: string;
}

export interface FormSchema {
  formId: string;              // deterministic ID (hash of creator + nonce)
  version: number;
  name: string;
  description?: string;
  category: "bug" | "feature" | "survey" | "application" | "other";
  coverImageBlobId?: string;
  creatorWallet: string;
  adminWallets: string[];
  fields: FormField[];
  opensAt?: number;            // unix ms
  closesAt?: number;
  submissionLimit?: number;
  createdAt: number;
  schemaBlobId?: string;       // assigned post-publish
}

export interface FormResponse {
  responseId: string;
  formId: string;
  submittedAt: number;
  submitterWallet?: string;    // optional
  publicFields: Record<string, unknown>;     // values for non-sensitive fields
  sensitiveCiphertext?: string;              // base64 Seal envelope
  mediaBlobIds: { fieldId: string; blobId: string; mime: string }[];
}

export interface EncryptedResponseEnvelope {
  formId: string;
  schemaBlobId: string;
  publicFields: Record<string, unknown>;
  sealEnvelope: {
    policyObjectId: string;
    ciphertext: string;        // base64
    nonce: string;
    keyVersion: number;
  };
  mediaBlobIds: { fieldId: string; blobId: string; mime: string }[];
  createdAt: number;
}

export interface FeedbackReceipt {
  receiptId: string;
  formId: string;
  formName: string;
  responseBlobId: string;      // Walrus blob ID of the response envelope
  responseHash: string;        // sha256 of the envelope bytes
  timestamp: number;
  submitterWallet?: string;
  publicSummary?: Record<string, unknown>;
}

export interface AdminNote {
  noteId: string;
  responseId: string;
  authorWallet: string;
  body: string;                // encrypted same as response if sensitive
  createdAt: number;
  blobId?: string;
}

export interface FeedbackInsight {
  insightId: string;
  formId: string;
  generatedAt: number;
  topTags: { tag: string; count: number }[];
  ratingHistogram?: Record<number, number>;
  responseVolume: { day: string; count: number }[];
  topContributors?: { wallet: string; count: number }[];
  summaryMarkdown: string;
}
```

---

## 11. Suggested Routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing page, recent public form templates, connect wallet | Public |
| `/create` | Form builder | Wallet required |
| `/form/[formId]` | Public submission page | Public (wallet optional) |
| `/dashboard` | Admin inbox across all owned forms | Wallet + ownership |
| `/dashboard/forms/[formId]` | Per-form responses, filters, notes, priority, export | Wallet + admin role |
| `/dashboard/forms/[formId]/admins` | Manage Seal admin policy | Wallet + creator only |
| `/receipt/[receiptId]` | Public proof-of-feedback receipt | Public |
| `/templates` | Browse/fork public form templates | Public |

---

## 12. Storage Strategy

| Artifact | Where | Encryption | Why |
|---|---|---|---|
| **Form schema** | Walrus blob (public) | None | Composable, forkable, verifiable. |
| **Public response fields** | Walrus blob (envelope) | None | Receipt-ready, indexable. |
| **Sensitive response fields** | Walrus blob (within envelope) | Seal | Only creator/admins can read. |
| **Media (screenshot/video)** | Walrus blob (per file) | Seal optional | Large; referenced by ID. |
| **Form response index** | Sui object + Walrus blob mirror | None | Fast list of `formId → blob IDs`. |
| **Receipt metadata** | Walrus blob | None | Public proof artifact. |
| **Admin notes** | Walrus blob | Seal | Internal-only, encrypted. |

**Organization by form:**
- Each form owns a deterministic prefix derived from `formId`.
- A `FormResponseIndex` blob/object lists every response blob ID for that form.
- Admin dashboard hydrates by reading the index, then fetching individual envelopes lazily.

**Public vs Private split:**
- Per-field `sensitive` flag determines split at submit time.
- Two payloads are produced from one form: `publicFields` (cleartext, on envelope) and `sensitiveCiphertext` (Seal-encrypted, on envelope).

---

## 13. Seal Encryption Strategy

1. **Encrypt before upload.** The browser builds the sensitive payload, generates an ephemeral content key, encrypts the payload with that key, and wraps the key under the form's Seal policy. The plaintext **never** leaves the browser.
2. **Access policy.** The Seal policy object lives on Sui. It lists `creatorWallet` and `adminWallets` as authorized decryptors. Updates to the admin list update the policy on-chain.
3. **Public metadata stays visible.** The envelope's `formId`, `schemaBlobId`, `publicFields`, `mediaBlobIds`, `createdAt` are stored in cleartext so public dashboards and receipts work without authorization.
4. **Decryption is on-demand.** When an authorized admin opens a response, the browser asks Seal for the unwrapping keys; on success, it decrypts the ciphertext locally.
5. **Revocation.** Removing a wallet from `adminWallets` updates the policy. Future decrypt requests from that wallet fail. (Note: standard caveat — anything already decrypted and copied is out of band.)
6. **No plaintext on Walrus.** Hard rule: the publisher path for any `sensitive: true` field is never invoked with cleartext.

---

## 14. Walrus Mainnet Deployment Plan

**Primary target: Walrus Sites mainnet.** Vercel may be used as an optional preview mirror during development, but is **not** the hackathon submission target.

Steps:

1. Build the static frontend (`next build && next export` or `vite build`) into `out/` or `dist/`.
2. Verify all asset paths are relative; no server-only routes; no SSR.
3. Install the Walrus `site-builder` CLI.
4. Configure `sites-config.yaml` with mainnet endpoints and the dedicated Walrus Sessions wallet.
5. Run `site-builder publish ./out --epochs <N>` to publish to Walrus Sites.
6. Receive a `siteObjectId` and a `wal.app` URL.
7. (Optional) Bind a SuiNS name → friendly URL like `signalvault.wal.app`.
8. Update env / docs with the canonical mainnet URL.
9. Use that URL as the demo link in submission.

> **Vercel is optional preview only.** The hackathon submission must point to the Walrus Sites mainnet URL.

---

## 15. MVP Scope

### Must-Have (submission blockers)
- Wallet connect (Sui)
- Form builder with all required field types: rich text, dropdown, checkbox, star rating, screenshot, video, URL, confirmation
- Required/optional toggle, sensitive toggle
- Shareable form link
- Walrus upload of form schema
- Walrus upload of response envelope
- Seal-encrypted sensitive fields
- Receipt page with blob ID + hash + timestamp
- Admin dashboard: list, filter, view decrypted response
- Internal notes
- Priority lanes (P0–P3)
- CSV/JSON export
- Walrus Sites mainnet deployment

### Should-Have
- Media (screenshot/video) upload to Walrus
- Per-form admin management UI (Seal policy edits)
- Insight panel (rating histogram, response volume)
- Public templates gallery
- Receipt sharing card with OG image

### Nice-to-Have (post-hackathon)
- Webhook on new submission
- AI auto-tagging of free-text responses
- DAO-gated forms (token / NFT hold required to submit)
- Anchor priority changes on Sui for tamper-evident triage history
- Mobile PWA polish
- i18n

---

## 16. Implementation Milestones

A 7-day sprint plan within the May 5 – May 18 hackathon window.

- **Day 1 — Foundation.** Repo scaffolding (Next.js + TS + Tailwind + shadcn/ui). Sui wallet adapter wired. Static export verified. Empty routes shipped.
- **Day 2 — Form builder.** Field components, drag-reorder, required/sensitive toggles, schema serialization, local persistence.
- **Day 3 — Walrus integration.** Publisher/aggregator HTTP wrappers in `lib/walrus/`. Upload form schema. Fetch by blob ID. Submission persistence path.
- **Day 4 — Seal encryption.** `lib/seal/` wrappers. Encrypt sensitive fields client-side. Policy object creation per form. Decrypt-on-demand path tested round-trip.
- **Day 5 — Dashboard.** Inbox, filters, response detail, internal notes, priority lanes, status tags.
- **Day 6 — Export & insights.** CSV/JSON/Markdown export. Rating histogram and volume chart. Receipt page polish. End-to-end QA.
- **Day 7 — Ship.** Walrus Sites mainnet deploy via `site-builder`. SuiNS bind if available. 3-minute demo recording. One-pager finalized. Submit.

---

## 17. Repository Structure

```
signalvault/
├── app/                          # Next.js app router (or src/ for Vite)
│   ├── page.tsx                  # /
│   ├── create/page.tsx           # /create
│   ├── form/[formId]/page.tsx    # /form/[formId]
│   ├── dashboard/page.tsx        # /dashboard
│   ├── dashboard/forms/[formId]/page.tsx
│   └── receipt/[receiptId]/page.tsx
├── components/
│   ├── form-builder/             # field cards, builder canvas, preview
│   ├── form-renderer/            # public submission UI
│   ├── dashboard/                # inbox, filters, priority lanes, notes
│   ├── receipts/                 # receipt card, share modal
│   └── ui/                       # shadcn primitives
├── lib/
│   ├── walrus/                   # publisher + aggregator HTTP clients
│   │   ├── publisher.ts
│   │   ├── aggregator.ts
│   │   └── index-store.ts
│   ├── seal/                     # encrypt, decrypt, policy mgmt
│   │   ├── encrypt.ts
│   │   ├── decrypt.ts
│   │   └── policy.ts
│   ├── sui/                      # wallet adapter, signing, object reads
│   │   ├── wallet.ts
│   │   └── objects.ts
│   ├── forms/                    # schema validation, field type registry
│   │   ├── field-registry.ts
│   │   └── validate.ts
│   └── insights/                 # aggregation + summary helpers
│       ├── histogram.ts
│       └── summarize.ts
├── types/
│   ├── forms.ts
│   ├── responses.ts
│   └── seal.ts
├── public/                       # logos, OG images, static assets
├── docs/
│   ├── ARCHITECTURE.md
│   ├── WALRUS-DEPLOY.md
│   └── SEAL-POLICY.md
├── .env.example
├── next.config.js                # output: 'export'
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 18. Environment Variables

```bash
# .env.example  — fill in before running locally or building for Walrus Sites

# Sui network
NEXT_PUBLIC_SUI_NETWORK=mainnet

# Walrus mainnet endpoints (publisher writes blobs, aggregator reads them)
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=

# Seal package / policy template
NEXT_PUBLIC_SEAL_PACKAGE_ID=

# Canonical app URL (Walrus Sites / SuiNS)
NEXT_PUBLIC_APP_URL=
```

> Do not commit secrets. The `NEXT_PUBLIC_` prefix means these are baked into the static bundle and visible to anyone — only put non-secret endpoint URLs and package IDs here.

---

## 19. Demo Script (≤ 3 minutes)

| Time | Beat | What's on screen |
|---|---|---|
| **0:00 – 0:20** | Problem | Quick montage: Discord scrollback, Google Form vendor lock screen, "we lost our feedback" tweet. Voiceover: Web3 teams collect feedback in fragmented, vendor-owned tools and contributors can't even prove they submitted. |
| **0:20 – 0:50** | Create form | Open `/create`. Drag in fields: rich text, star rating, screenshot, confirmation. Toggle "sensitive" on a free-text field. Click Publish. Watch toast: "Schema uploaded — blob ID `0x...`". |
| **0:50 – 1:20** | Submit response | Open shareable link. Fill out fields, drop a screenshot, hit 4 stars, type sensitive feedback. Submit. |
| **1:20 – 1:50** | Walrus + Receipt | Show the Receipt page: form ID, response blob ID, hash, timestamp, wallet. Click the blob ID — opens raw envelope on a Walrus aggregator. Public fields visible, sensitive payload is ciphertext. |
| **1:50 – 2:30** | Admin dashboard | Switch to creator wallet. Open `/dashboard`. Inbox shows the new submission. Click → Seal decrypts client-side → sensitive content renders. Filter by 4+ stars. Add an internal note. Drag to P1. Export CSV. |
| **2:30 – 3:00** | Why Walrus + close | Cut to architecture frame. Voiceover: form schemas, responses, notes — all on Walrus. Encrypted via Seal. Receipts are content-addressed proofs. Teams own the archive. SignalVault is the encrypted feedback OS Web3 has been missing. CTA: try it at `signalvault.wal.app`. |

---

## 20. One-Pager Pitch

> **SignalVault — Encrypted Feedback OS on Walrus**
>
> *Tagline:* The feedback OS Web3 teams own — content-addressed, Seal-encrypted, and built natively on Walrus.
>
> **Problem.** Web3 teams collect critical community feedback through Discord threads, Typeform, Google Forms, Notion, and Telegram. The result: fragmented signal, plaintext sensitive data, vendor lock-in, and zero way for contributors to prove they submitted.
>
> **Solution.** SignalVault is a Walrus-native form and feedback platform. Anyone can build a form in 90 seconds. Schemas and responses are stored as verifiable Walrus blobs. Sensitive fields are encrypted client-side with Seal so only the creator and approved admins can decrypt. Every submission generates a Proof-of-Feedback receipt — a public, content-addressed artifact contributors can share without revealing private content.
>
> **Why now.** Walrus mainnet + Seal access control + Sui wallets finally make trust-minimized, encrypted, portable feedback infrastructure possible.
>
> **Why Walrus.** Content-addressed blobs make every response inherently verifiable. Decentralized availability means archives outlive any vendor. Seal-encrypted access control replaces fragile vendor permissions. Form templates become composable public goods.
>
> **Target users.** Web3 founders, community managers, grants reviewers, product managers, hackathon organizers, DAO contributors.
>
> **Differentiator.** Proof-of-Feedback. Portable archives. Selective decryption. Composable templates. Tamper-evident triage.
>
> **Demo:** `https://signalvault.wal.app` *(placeholder)*
>
> **Repo:** `https://github.com/<org>/signalvault` *(placeholder)*
>
> **Video (≤ 3 min):** `<video link placeholder>`

---

## 21. Submission Checklist

### Hackathon Deliverables
- [ ] Registered on the **DeepSurge** platform
- [ ] Submitted the **Airtable submission form** (https://airtable.com/appoDAKpC74UOqoDa/shrN8UbJRdbkd5Lso)
- [ ] Project name: **SignalVault**
- [ ] Project logo (uploaded to `/public/logo.svg`)
- [ ] Project description (this README + one-pager)
- [ ] Project website / demo link: `https://<placeholder>.wal.app`
- [ ] Primary contact email and handle filled in
- [ ] **GitHub repo** public: `https://github.com/<placeholder>/signalvault`
- [ ] App store link: N/A (web-native)
- [ ] **Demo video** ≤ 3 minutes recorded and uploaded: `<placeholder>`
- [ ] **One-pager** prepared (see §20) and exported as PDF/PNG: `<placeholder>`
- [ ] **Dedicated Walrus Sessions wallet** created: `0x<placeholder>`
- [ ] Joined the **Walrus Discord**: https://discord.com/invite/walrusprotocol
- [ ] **X / Twitter post** with `#Walrus`: `<placeholder>`
- [ ] **Walrus mainnet deployment** live (Walrus Sites)

### Functional Requirements (from requirement.md)
- [ ] Anyone can create custom forms (bug, feature, feedback, survey, application, other)
- [ ] Form creator can name forms
- [ ] Form creator can add/remove fields
- [ ] Form creator can choose required/optional inputs
- [ ] Form creator can generate a shareable form link
- [ ] Field type: rich text
- [ ] Field type: dropdown
- [ ] Field type: checkboxes
- [ ] Field type: star rating
- [ ] Field type: screenshots
- [ ] Field type: video uploads
- [ ] Field type: URL links
- [ ] Field type: confirmation checkbox
- [ ] Submissions stored on Walrus, organized by form
- [ ] Sensitive data encrypted using Seal
- [ ] Only form creator and approved admins can access private responses
- [ ] Private admin dashboard exists
- [ ] Admin can review incoming submissions
- [ ] Admin can filter responses
- [ ] Admin can add internal notes
- [ ] Admin can rank/prioritize feedback
- [ ] Admin can export data
- [ ] Admin can turn raw feedback into actionable insights
- [ ] Deployed on Walrus Network mainnet (primary target — *Vercel is optional preview only*)

### Differentiator (judged: Onchain Innovation)
- [ ] Feedback Receipt / Proof-of-Feedback primitive shipped
- [ ] Composable form templates (public Walrus blobs anyone can fork)
- [ ] Portable archive export (signed Walrus archive of all blob IDs)

---

## 22. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Seal SDK integration complexity** | High | Blocks core requirement | Start Seal flow Day 1 in a spike branch; build a minimal encrypt → store → decrypt round-trip before any UI work. Keep policy logic isolated in `lib/seal/`. |
| **Walrus upload latency on large media** | Medium | Slows demo | Stream uploads with progress UI; cap video at 50 MB; allow async upload with optimistic UI; pre-upload media before final submit. |
| **Walrus Sites static-only constraints** | Medium | Forces architecture | Architecture is already fully static. No SSR. All dynamic work happens in the browser. Verify with `next export` early. |
| **Indexing responses without a backend** | Medium | Dashboard could feel slow | Maintain a small `FormResponseIndex` (Sui object or Walrus blob) updated on submit; read it once per dashboard load and cache in IndexedDB. |
| **Demo network reliability during recording** | Medium | Bad demo | Pre-record successful submit + decrypt steps; have a second device on a different network ready; fallback recording done a day before submission. |
| **Seal policy edge cases (revocation timing)** | Low | Subtle bugs | Document expected behavior in `docs/SEAL-POLICY.md`; test add + remove admin paths explicitly; surface clear errors when decrypt is denied. |
| **Walrus epoch / blob expiry** | Low | Long-term archive risk | Publish with a high enough `--epochs` value for the hackathon; document how teams can re-pin / extend in `docs/WALRUS-DEPLOY.md`. |
| **Wallet UX friction** | Medium | Drop-off on submit | Allow anonymous submissions (no wallet) where the form permits; only require wallet for receipt-anchoring and admin access. |
| **Fallback strategy** | — | — | If a non-essential subsystem (e.g., insights panel) breaks, ship without it. **Never** fall back to a centralized DB — that violates the hackathon's core "stored on Walrus" requirement. |

---

## 23. Tech Stack (at a glance)

- **Frontend:** Next.js 14+ (static export) or Vite + React 18, TypeScript everywhere.
- **Styling:** Tailwind CSS.
- **UI:** shadcn/ui primitives, lucide-react icons.
- **Wallet:** `@mysten/dapp-kit` / `@mysten/wallet-standard`.
- **Storage:** Walrus TypeScript SDK + Walrus HTTP publisher/aggregator.
- **Encryption:** Seal SDK for client-side encrypt/decrypt + on-chain policy management.
- **State:** Zustand for client store; IndexedDB for offline draft cache.
- **Deployment:** **Walrus Sites mainnet (primary)** via `site-builder`. Vercel optional preview only.

---

## 24. Final Judge-Facing Summary

SignalVault is the rare hackathon entry that hits all three judging criteria simultaneously, **and** ships a primitive that simply cannot exist cleanly on Web2.

On **Product Utility & UX**, it solves a problem every Web3 team has, with a builder and dashboard that judges can compare directly to Typeform, Airtable, Notion, and Linear — and find sharper. Form creation is under 90 seconds. The dashboard is a real triage tool, not a list view.

On **Onchain Innovation & Use of Walrus**, it goes far past "store JSON on a blob." Every form schema is a forkable public blob. Every response is a content-addressed envelope. Sensitive fields ride encrypted under Seal with on-chain access policies. Contributors hold Proof-of-Feedback receipts they can share publicly without leaking private content. Teams own portable archives that survive any vendor. Forms become public goods.

On **Technical Execution & Completeness**, the architecture is honest, fully static, free of centralized dependencies, and scoped tightly into a 7-day plan with an MVP that satisfies every must-have requirement and a clear should-have / nice-to-have ladder.

SignalVault is what happens when you stop trying to bolt blockchain onto a form vendor and instead **redesign feedback infrastructure for the verifiable, encrypted, sovereign internet**. That is exactly what the Walrus Tools Builder Activation hackathon was created to surface — and exactly why SignalVault is built to win it.

---

*Built for the Walrus Sessions: Tools Builder Activation Hackathon (May 5 – May 18, 2026).*
*Primary deployment target: Walrus Sites mainnet. Vercel is optional preview only.*
