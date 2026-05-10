<div align="center">

<img src="frontend/public/logo.png" alt="SignalVault" width="120" />

# SignalVault

**Encrypted feedback OS on Walrus**
*Private feedback. Public proof.*

[![Live Demo](https://img.shields.io/badge/demo-ezidentity.wal.app-1f6feb?style=for-the-badge)](https://ezidentity.wal.app)
[![Walrus Mainnet](https://img.shields.io/badge/Walrus-mainnet-2F855A?style=for-the-badge)](https://docs.wal.app)
[![Sui](https://img.shields.io/badge/Sui-testnet%20%2B%20mainnet-3B6BD3?style=for-the-badge)](https://sui.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-0A0A0A?style=for-the-badge)](#license)

A Walrus-native feedback and form platform.<br/>
Build forms, collect Seal-encrypted responses, and give every contributor a content-addressed Proof-of-Feedback receipt — all without a centralized backend.

</div>

---

## Table of contents

1. [Live submission links](#live-submission-links)
2. [What it is](#what-it-is)
3. [The problem](#the-problem)
4. [The solution](#the-solution)
5. [Why Walrus](#why-walrus)
6. [Core features](#core-features)
7. [Differentiator — Proof-of-Feedback](#differentiator--proof-of-feedback)
8. [Architecture](#architecture)
9. [Tech stack](#tech-stack)
10. [Repository layout](#repository-layout)
11. [On-chain addresses](#on-chain-addresses)
12. [Data model](#data-model)
13. [Routes](#routes)
14. [AI form generator (ChainGPT)](#ai-form-generator-chaingpt)
15. [Local development](#local-development)
16. [Production deployment](#production-deployment)
17. [Environment variables](#environment-variables)
18. [Demo script (3 min)](#demo-script-3-min)
19. [One-pager pitch](#one-pager-pitch)
20. [Hackathon submission checklist](#hackathon-submission-checklist)
21. [Risks & mitigations](#risks--mitigations)
22. [Roadmap](#roadmap)
23. [License](#license)

---

## Live submission links

| Item | Link |
|---|---|
| **Live demo** | https://ezidentity.wal.app |
| **GitHub** | https://github.com/EzraNahumury/walrus |
| **Walrus Site object** | [`0x096b2385…344e`](https://suiscan.xyz/mainnet/object/0x096b2385c1bbc45fc300742f5942948f53297db3f3863852d94e9d663e28344e) |
| **SignalVault Move package (testnet)** | [`0x3723d96b…4c50`](https://suiscan.xyz/testnet/object/0x3723d96b66a75a5229db751bd712f5253a9960738931bbcef2b7217014864c50) |
| **SignalVault Move package (mainnet)** | [`0x59fc6603…9d50`](https://suiscan.xyz/mainnet/object/0x59fc66036b7148c57cee70920faeb66353891ea15d66abe34f72469a69b89d50) |
| **Dedicated Walrus Sessions wallet** | `0xe7d9532d086478c1e1cc6914e74929814118e4de35ffd8b9a326a0bd8ef91d11` |
| **Demo video** | _3-min screencast — see [`/docs/video/`](#demo-script-3-min)_ |
| **One-pager** | [§19 below](#one-pager-pitch) |

---

## What it is

SignalVault is a feedback platform with two simple promises:

1. **Sensitive answers stay private** — every field marked sensitive is encrypted in the contributor's browser before it touches Walrus.
2. **Every submission is provable** — each response becomes a content-addressed Walrus blob and emits a tamper-evident `ResponseRecorded` event on Sui. Contributors get a public Proof-of-Feedback receipt without leaking the body.

It is *not* a Typeform clone with a blockchain sticker. It is feedback **infrastructure** rebuilt around content-addressed storage, on-chain access control, and portable team-owned archives.

---

## The problem

Web3 teams currently collect community feedback through a fragmented stack:

- Bug reports vanish in **Discord** scrollback
- Feature requests rot in **Notion** docs
- Surveys live in **Google Forms / Typeform** — centralized, opaque, vendor-owned
- Grant applications get DM'd
- Sensitive disclosures sit plaintext in inboxes

Four hard failures result:

1. **Fragmentation.** Teams can't see all feedback in one place.
2. **No ownership.** When a vendor goes down, raises prices, or changes ToS, your community signal evaporates.
3. **No privacy guarantees.** Sensitive submissions sit in plaintext on someone else's servers.
4. **No verifiability.** Contributors can't prove they submitted. Teams can't prove the dataset is untampered.

Web2 form tools were never designed for sovereign, verifiable, encrypted community feedback.

---

## The solution

A platform built natively on Walrus, designed from day one around content-addressed storage, encrypted access control, and portable team-owned archives.

- Anyone can spin up a custom form (bug report, feature request, survey, grant application, retro, NPS) in under 90 seconds.
- Form schemas are **public Walrus blobs** with verifiable blob IDs.
- Responses are stored on Walrus, organized by form.
- Sensitive fields are **encrypted client-side using Seal-style envelopes** before upload — only the form creator and approved admins can decrypt.
- Every submission produces a public, content-addressed **Feedback Receipt** the contributor can show off, link to, or use as proof.
- A polished **admin dashboard** lets teams triage, filter, annotate, prioritize, export, and convert raw responses into actionable insights.

The full archive is portable: at any moment a team can hand off the list of blob IDs and walk away with their entire feedback history.

---

## Why Walrus

| Property | What Walrus gives | Why it matters for feedback |
|---|---|---|
| Content-addressed storage | Every form / response / media is a verifiable blob ID | A response's blob ID *is* its receipt |
| Decentralized availability | Replicated across Walrus storage nodes | Archives outlive any single vendor |
| Verifiable data | Anyone can fetch a blob and check its hash | Communities can audit form questions and submission counts |
| Public/private separation | Blob bytes layered with Seal access policies | Public schemas open; private bodies sealed |
| Encrypted access control | Decrypt only with on-chain authorization | Granular, revocable admin access without central key servers |
| Composable datasets | Other dApps can read public form schemas | Form templates become public goods |
| Tamper-evident history | Blob IDs are immutable | Receipts are forever provable |
| Portable archives | Teams own their blob ID list | Migrate, fork, or sell archives without lock-in |

Walrus turns feedback from a vendor-dependent service into **infrastructure-level community signal**.

---

## Core features

### 1. Form builder (`/create`)
- Drag-and-drop builder with live preview
- 9 field types: rich text, short text, dropdown, checkbox, **star rating**, **screenshot**, **video**, URL, confirmation
- Per-field flags: required / sensitive (Seal-encrypted) / show on receipt
- Form-level: name, description, category (`bug | feature | feedback | survey | application | other`)
- One-click shareable link `/form?id=…`
- **AI Draft** — describe the form in one line, ChainGPT generates the schema (see [§14](#ai-form-generator-chaingpt))

### 2. Walrus-backed storage
- Form schema → public Walrus blob
- Response envelope → Walrus blob, indexed by form ID
- Media uploads (screenshot / video) → separate Walrus blobs referenced from the envelope
- Form response index maintained as `FormPolicy.response_count` on Sui + `ResponseRecorded` events

### 3. Seal-style encrypted responses
- Sensitive fields encrypted **client-side** before the response blob ever leaves the browser
- Decryption gated by an on-chain `FormPolicy.admins` allowlist
- Public envelope metadata (form ID, timestamp, blob ID, optional wallet attestation) remains visible
- *Currently AES-GCM-256 demo adapter; swap to `@mysten/seal` is a one-file change in `lib/seal.ts`*

### 4. Admin dashboard (`/dashboard`)
- Inbox view across all forms owned by the connected wallet
- **Filter** by priority, status, search text
- **Internal notes** attached to any response
- **Priority lanes** (P0 / P1 / P2 / P3 / unranked) with conditional row coloring
- **Status tags** (New / Reviewing / Triaged / Shipped / Won't Fix)
- **Bulk export** — CSV with `sep=,` BOM Excel-friendly + native styled XLSX (frozen header, banded rows, conditional fonts)
- **Insight panel** — auto-generated rating histogram, recurring phrases, suggested next action

### 5. Feedback Receipt (`/receipt?id=…`)
The unique primitive — see [§7](#differentiator--proof-of-feedback).

### 6. Modern UX touches
- Custom wallet button with avatar (deterministic gradient blob from address), live SUI balance, copy/disconnect popover, Suiscan deep-link
- Modern toast system (slide-in, progress bar, variants) replacing native `alert()`
- Hero with floating walrus mascot, particle field, animated network, dotted-surface 3D wave grid (Three.js)
- 5 animated touchpoint cards (schema typing, encrypted hex flicker, media upload progress, index fan-out, receipt ticker)

---

## Differentiator — Proof-of-Feedback

Five things SignalVault does that no Typeform / Airtable / Tally clone can:

1. **Proof-of-Feedback receipts.** Contributors hold cryptographic proof of submission without leaking content.
2. **Portable archives.** A team's entire feedback history is a list of blob IDs. They own it. Forever.
3. **Selective decryption.** Admins can grant or revoke decrypt access per-wallet via the on-chain `add_admin` / `remove_admin` flow — no key rotation drama.
4. **Composable form templates.** A "Web3 grants application" form is a public Walrus blob any DAO can fork.
5. **Tamper-evident triage.** Internal notes and priority changes can optionally be anchored on Sui so the audit trail of *how* a team handled feedback is itself verifiable.

This combination is **impossible cleanly in Web2** — it requires verifiable, content-addressed storage and on-chain-anchored attestations.

---

## Architecture

```
                          ┌────────────────────────────────────────┐
                          │          User Browser                   │
                          │   (static Next.js bundle on Walrus)     │
                          └───────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │  Static frontend served from Walrus Sites     │
                  │  Live at https://ezidentity.wal.app           │
                  └───────────────┬───────────────────────────────┘
                                  │
              ┌───────────────────┼────────────────────┐
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐
     │   Sui wallet   │  │  Walrus SDK    │  │  Seal adapter   │
     │  (dapp-kit)    │  │  publisher /   │  │  (encrypt /     │
     │                │  │  aggregator    │  │   decrypt)      │
     └────────┬───────┘  └────────┬───────┘  └────────┬────────┘
              │                   │                    │
              ▼                   ▼                    ▼
     ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐
     │  Sui Testnet   │  │  Walrus Mainnet  │  │  FormPolicy     │
     │ sc_signalvault │  │   (schemas,      │  │  authorization  │
     │  Move package  │  │    responses,    │  │  anchor on Sui  │
     │  + events      │  │    media blobs)  │  │  (creator +     │
     └────────────────┘  └──────────────────┘  │   admin allow)  │
                                               └─────────────────┘
```

**Network split** (compliant with `requirement.md` line 30 — *"the Network's mainnet"* = Walrus mainnet):

| Layer | Network |
|---|---|
| Walrus storage | **mainnet** ✓ |
| Walrus Sites deploy | **mainnet** ✓ (`ezidentity.wal.app`) |
| Sui Move package | testnet (signing free for demo) |
| Sui events query | testnet |
| Wallet sign tx | testnet |

The mainnet copy of `sc_signalvault` is also live at `0x59fc6603…9d50` for reference.

---

## Tech stack

**Frontend**
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 with `@theme` tokens
- `@mysten/dapp-kit` + `@mysten/sui` for wallet + PTBs
- `@tanstack/react-query` for query state
- Three.js for the welcome wave grid + mascot orbits
- ExcelJS (dynamic import) for styled XLSX export
- ChainGPT Web3 LLM for AI form generator
- Static export via `output: "export"` (toggleable via `STATIC_EXPORT=1`)
- lucide-react icons, clsx + tailwind-merge

**Smart contract**
- Sui Move 2024 edition
- Single module `sc_signalvault::signalvault`
- Built and tested with Sui CLI 1.70.2

**Storage**
- Walrus mainnet via tududes operator (`publisher.walrus-01.tududes.com`, `aggregator.walrus-01.tududes.com`)
- 5-epoch storage windows (~10 weeks)

---

## Repository layout

```
walrus/
├── README.md                          ← you are here
├── DEPLOY.md                          ← phase-by-phase deploy runbook
├── IMPLEMENTATION_NOTES.md            ← real vs adapter breakdown
├── requirement.md                     ← original hackathon brief
├── sc_signalvault/                    ← Move package
│   ├── Move.toml
│   ├── Published.toml                 ← committed mainnet/testnet IDs
│   ├── sources/signalvault.move       ← FormPolicy + 7 entry fns + 6 events
│   ├── tests/signalvault_tests.move   ← 6 passing tests
│   └── README.md
└── frontend/                          ← Next.js app
    ├── app/                           ← App Router routes
    │   ├── layout.tsx
    │   ├── page.tsx                   ← /  landing
    │   ├── create/page.tsx            ← /create
    │   ├── form/page.tsx              ← /form?id=…
    │   ├── dashboard/page.tsx
    │   ├── dashboard/form/page.tsx    ← /dashboard/form?id=…
    │   ├── receipt/page.tsx
    │   ├── welcome/page.tsx
    │   ├── api/ai/draft-form/route.ts ← server route (dev only)
    │   └── globals.css                ← @theme tokens + animations
    ├── components/
    │   ├── layout/                    ← Header, Footer, Providers, WalletButton, …
    │   ├── ui/                        ← Button, Card, Input, …, Toaster, entropy, dotted-surface
    │   ├── forms/                     ← FieldEditor, FieldRenderer, AIDraftDialog
    │   ├── dashboard/                 ← StatCard, InsightPanel, PriorityBadge, …
    │   ├── marketing/                 ← AnimatedNetwork, ParticleField, GuaranteeVisuals, TouchpointVisuals
    │   └── receipt/BlobLink.tsx
    ├── lib/
    │   ├── walrus.ts                  ← put/get adapter (live/demo)
    │   ├── seal.ts                    ← encrypt/decrypt adapter (live/demo)
    │   ├── sui.ts                     ← network + package ID helpers
    │   ├── ptb.ts                     ← Programmable Transaction Block builders
    │   ├── sui-query.ts               ← FormCreated / ResponseRecorded queries
    │   ├── chaingpt.ts                ← AI client adapter
    │   ├── ai-parser.ts               ← shared prompt + sanitizer (lenient)
    │   ├── forms.ts                   ← schema authoring + validation
    │   ├── export.ts                  ← CSV + styled XLSX
    │   ├── insights.ts                ← deterministic local insights
    │   ├── toast.ts                   ← global toast bus
    │   ├── demo-store.ts              ← localStorage persistence
    │   └── hooks/useOnChainForms.ts   ← react-query wrappers
    ├── types/signalvault.ts           ← FormSchema / FormResponse / FeedbackReceipt / …
    ├── public/
    │   ├── logo.svg                   ← vector
    │   ├── logo.png                   ← 512×512
    │   └── logo-{128,256,512,1024}.png
    ├── next.config.ts
    ├── package.json
    └── README.md
```

---

## On-chain addresses

| Object | Network | Address |
|---|---|---|
| `sc_signalvault` package | Sui mainnet | `0x59fc66036b7148c57cee70920faeb66353891ea15d66abe34f72469a69b89d50` |
| `sc_signalvault` package | Sui testnet | `0x3723d96b66a75a5229db751bd712f5253a9960738931bbcef2b7217014864c50` |
| Walrus Sites object | Sui mainnet | `0x096b2385c1bbc45fc300742f5942948f53297db3f3863852d94e9d663e28344e` |
| Dedicated wallet | Sui mainnet + testnet | `0xe7d9532d086478c1e1cc6914e74929814118e4de35ffd8b9a326a0bd8ef91d11` |

---

## Data model

```ts
// Per-form on-chain anchor.
struct FormPolicy has key, store {
  id: UID,
  form_uid: vector<u8>,
  owner: address,
  schema_blob_id: String,        // Walrus blob ID of the schema JSON
  admins: vector<address>,       // wallets allowed to decrypt
  created_at_ms: u64,
  updated_at_ms: u64,
  active: bool,
  response_count: u64,
}

// Emitted on submit. Off-chain index reads these.
struct ResponseRecorded has copy, drop {
  policy_id: ID,
  response_blob_id: String,      // Walrus blob ID of the envelope
  response_hash: vector<u8>,     // sha-256 of the envelope bytes
  submitter: address,
  timestamp_ms: u64,
  sequence: u64,
}
```

```ts
// types/signalvault.ts (frontend)

export interface FormSchema {
  formId: string;
  version: number;
  name: string;
  description?: string;
  category: "bug" | "feature" | "feedback" | "survey" | "application" | "other";
  creatorWallet: string;
  adminWallets: string[];
  fields: FormField[];
  createdAt: number;
  updatedAt: number;
  policyObjectId?: string;
  schemaBlobId?: string;
}

export interface FormField {
  id: string;
  type:
    | "rich_text" | "short_text" | "dropdown" | "checkbox"
    | "star_rating" | "screenshot" | "video" | "url" | "confirmation";
  label: string;
  description?: string;
  required: boolean;
  sensitive: boolean;          // Seal-encrypt before upload
  publicOnReceipt: boolean;    // safe to show on the public receipt
  options?: { value: string; label: string }[];
  maxRating?: number;
}

export interface EncryptedEnvelope {
  policyObjectId: string;
  ciphertext: string;          // base64
  nonce: string;               // base64
  scheme: "seal-v1" | "demo-aes-gcm-256";
  keyVersion?: number;
}

export interface FormResponse {
  responseId: string;
  formId: string;
  submittedAt: number;
  submitterWallet?: string;
  publicFields: Record<string, unknown>;
  sensitive?: EncryptedEnvelope;
  media: { fieldId: string; blobId: string; mime: string; sizeBytes: number }[];
  responseBlobId?: string;
  responseHash?: string;
}

export interface FeedbackReceipt {
  receiptId: string;
  formId: string;
  formName: string;
  responseBlobId: string;
  responseHash: string;
  timestamp: number;
  submitterWallet?: string;
  publicSummary?: Record<string, unknown>;
}
```

---

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Landing | Hero with Walrus mascot, dashboard preview, why-Walrus, how-it-works, Proof-of-Feedback callout, 5 touchpoint cards, CTA |
| `/welcome` | Welcome | Three-mode picker (Submit / Create / Dashboard) over 3D dotted-surface wave grid |
| `/create` | Form builder | Live preview, AI Draft modal, publish via wallet sign |
| `/form?id=…` | Public form | Validation, encrypt sensitive fields, upload media + envelope, generate receipt |
| `/dashboard` | Inbox | On-chain hydrated form cards with badges, stat cards, recent submissions |
| `/dashboard/form?id=…` | Triage | Filter, priority lanes, internal notes, decrypt, CSV + Excel export, insights |
| `/receipt?id=…` | Proof | Public artifact: form ID, response blob, content hash, timestamp, optional wallet |

Static export uses query-string IDs (`?id=…`) instead of dynamic path segments because Next.js `output: "export"` forbids `dynamicParams` without `generateStaticParams`.

---

## AI form generator (ChainGPT)

`/create` ships a **"Draft with AI"** button that turns a one-line brief into a full form schema.

```
User brief → ChainGPT Web3 LLM → JSON draft → sanitizer → builder state
```

**`lib/ai-parser.ts`** is a deliberately *lenient* sanitizer because the conversational `general_assistant` model deviates from strict prompts. It handles:

- Type aliases: `text`/`textarea`/`number`/`email` → mapped to our supported types
- Name fallbacks: `name | formTitle | formName | title`
- JSON-Schema → form-shape conversion when the model returns `{ type: "object", properties: {…} }`
- Sensitivity inference: high/medium → sensitive, free-text label heuristics
- String-or-object option arrays (`["Yes","No"]` → `[{value,label}]`)
- Auto-append confirmation field if missing
- Auto-guess category from name + description regex

### Two paths, one adapter

- **`NEXT_PUBLIC_CHAINGPT_API_KEY`** set → browser calls ChainGPT directly (CORS is permitted upstream). Used in static Walrus Sites builds.
- Otherwise → POST `/api/ai/draft-form` (Next.js route handler with server-only `CHAINGPT_API_KEY`). Used during local dev.

Trade-off: the public key is visible in the JS bundle. For the hackathon judging window this is acceptable; rotate after submission, or front the call with a Cloudflare Worker proxy.

---

## Local development

```bash
# 1. Install
cd frontend
npm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local — see §17 for all variables

# 3. Run
npm run dev
# → http://localhost:3000

# 4. Type-check
npm run typecheck
```

### Move package

```bash
cd sc_signalvault
sui move build
sui move test          # 6 tests should pass
```

---

## Production deployment

> Full phase-by-phase guide lives in [`DEPLOY.md`](DEPLOY.md).

### Frontend → Walrus Sites

```bash
cd frontend

# Build static bundle
STATIC_EXPORT=1 npm run build
# → ./out  (≈ 5 MB, 9 HTML routes, no API route)

# Publish to Walrus Sites mainnet (requires walrus + site-builder CLI)
~/walrus-bin/site-builder \
  --config ~/walrus-bin/sites-config.yaml \
  publish ./out --epochs 5

# Output: Site Object ID
# Bind a SuiNS name to it via the SuiNS app's "Link to Walrus Site" option.
```

### Move package → Sui

```bash
cd sc_signalvault

# Mainnet
sui client switch --env mainnet
sui client publish --gas-budget 200000000

# Testnet (cheap demo signing)
sui client switch --env testnet
sui client faucet                        # web faucet works too
sui client publish --gas-budget 200000000
```

Copy the printed `packageId` into `frontend/.env.local`.

---

## Environment variables

```bash
# .env.example  — fill in before running locally or building for prod

# Sui network
NEXT_PUBLIC_SUI_NETWORK=testnet         # or mainnet

# Walrus mainnet endpoints
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-01.tududes.com
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-01.tududes.com

# Move package — testnet active for demo
NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID=0x3723d96b66a75a5229db751bd712f5253a9960738931bbcef2b7217014864c50

# Seal package (set when wiring real Seal SDK)
NEXT_PUBLIC_SEAL_PACKAGE_ID=

# Canonical app URL
NEXT_PUBLIC_APP_URL=https://ezidentity.wal.app

# ChainGPT — server-only is preferred; client-public required for static deploys
CHAINGPT_API_KEY=
NEXT_PUBLIC_CHAINGPT_API_KEY=
```

Adapters in `lib/walrus.ts`, `lib/seal.ts`, `lib/sui.ts`, `lib/chaingpt.ts` flip from demo to live automatically when their env vars are present. The UI surfaces a banner whenever any adapter is in demo mode.

---

## Demo script (3 min)

| Time | Beat | What's on screen |
|---|---|---|
| 0:00–0:20 | Problem | Discord scrollback / Google Form vendor lock screen montage. *"Web3 teams collect feedback in fragmented, vendor-owned tools. Contributors can't even prove they submitted."* |
| 0:20–0:50 | AI form draft | `/create` → Draft with AI → "Q3 ecosystem grants application" → Apply to builder → 7 fields populate. *"Your AI co-author drafted a Walrus-native grants form."* |
| 0:50–1:20 | Publish | Click Publish form → wallet popup → sign `create_form` → Sui Suiscan link + Walrus blob ID appear. *"Schema on Walrus, ownership on Sui."* |
| 1:20–1:50 | Submit | Open the share link in another tab → fill the form → submit → loading bar walks "Encrypting → Uploading → Anchoring". |
| 1:50–2:30 | Receipt + dashboard | Land on Receipt page (form ID, blob, hash, sealed banner). Switch to dashboard → click form → click response → Decrypt sensitive fields → Excel export. |
| 2:30–3:00 | Why Walrus | Cut to architecture frame. *"Schemas, responses, notes — all on Walrus. Encrypted via Seal-style envelopes. Receipts are content-addressed proofs. Teams own the archive. SignalVault is the encrypted feedback OS Web3 has been missing."* CTA: `signalvault.wal.app`. |

---

## One-pager pitch

> ### SignalVault — Encrypted Feedback OS on Walrus
>
> *The feedback OS Web3 teams own — content-addressed, Seal-encrypted, native to Walrus.*
>
> **Problem.** Web3 teams collect critical community feedback through Discord threads, Typeform, Google Forms, Notion, and Telegram. The result: fragmented signal, plaintext sensitive data, vendor lock-in, and zero way for contributors to prove they submitted.
>
> **Solution.** SignalVault is a Walrus-native form and feedback platform. Anyone can build a form in 90 seconds. Schemas and responses are stored as verifiable Walrus blobs. Sensitive fields are encrypted client-side so only the creator and approved admins can decrypt. Every submission generates a Proof-of-Feedback receipt — a public, content-addressed artifact contributors can share without revealing private content.
>
> **Why now.** Walrus mainnet + Sui access control + ChainGPT Web3 LLM finally make trust-minimized, encrypted, AI-assisted feedback infrastructure possible.
>
> **Why Walrus.** Content-addressed blobs make every response inherently verifiable. Decentralized availability means archives outlive any vendor. On-chain access control replaces fragile vendor permissions. Form templates become composable public goods.
>
> **Target users.** Web3 founders, community managers, grants reviewers, product managers, hackathon organizers, DAO contributors.
>
> **Differentiator.** Proof-of-Feedback. Portable archives. Selective decryption. Composable templates. Tamper-evident triage.
>
> **Demo:** https://ezidentity.wal.app
> **Repo:** https://github.com/EzraNahumury/walrus

---

## Hackathon submission checklist

### Required deliverables
- [x] Project name + logo (`frontend/public/logo.png`)
- [x] Project description (this README)
- [x] Project website (`https://ezidentity.wal.app`)
- [x] GitHub repo public (`https://github.com/EzraNahumury/walrus`)
- [x] Anyone can create custom forms (bug / feature / feedback / survey / application / other)
- [x] Form creator can name forms, add/remove fields, choose required/optional inputs
- [x] Generate shareable form link
- [x] Field types: rich text · dropdown · checkbox · star rating · screenshot · video · URL · confirmation (9/8 — exceeds requirement)
- [x] Submissions stored on Walrus, organized by form
- [x] Sensitive data encryption pipeline (Seal-shaped envelope; SDK swap is one branch)
- [x] Private admin dashboard — review · filter · internal notes · rank/prioritize · export · insights
- [x] Deployed on Walrus mainnet
- [x] Demo link live (`https://ezidentity.wal.app`)
- [x] Dedicated Walrus Sessions wallet
- [ ] Demo video ≤ 3 min
- [ ] One-pager (PDF export of §19 above)
- [ ] DeepSurge registration
- [ ] Airtable submission form (https://airtable.com/appoDAKpC74UOqoDa/shrN8UbJRdbkd5Lso)
- [ ] Walrus Discord joined
- [ ] X post with `#Walrus`

### Differentiator (judged: Onchain Innovation)
- [x] Proof-of-Feedback receipts shipped
- [x] On-chain `add_admin` / `remove_admin` access control
- [x] Composable form templates (every schema is a public Walrus blob)
- [x] Portable archive export (CSV / styled XLSX of all blob IDs)

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Real Seal SDK not yet wired | `lib/seal.ts` ships an AES-GCM-256 demo with the same envelope shape; UI banner makes the mode explicit. SDK swap is one branch. |
| Walrus blob occasional 404 from one publisher | Multi-publisher fallback documented; user can swap to any community publisher. |
| Static export drops API routes | AI route runs only in dev; production calls ChainGPT directly via the public env path (CORS verified). |
| ChainGPT key visible in bundle | Acceptable for hackathon judging window; rotate after, or front with a Cloudflare Worker proxy. |
| RPC version-mismatch during Walrus Sites publish | Multi-RPC failover in `client_config.yaml`; retry once. |
| `dapp-kit` ships its own `@mysten/sui` copy → Transaction class mismatch | `tx as never` cast at the two sign sites; structurally identical at runtime. |

---

## Roadmap

- [ ] Real Seal SDK integration
- [ ] Cloudflare Worker proxy for the AI endpoint (move key off the client)
- [ ] Per-form analytics blob (response throughput over time)
- [ ] Native mobile-first form-fill experience
- [ ] Form template marketplace — fork a public Walrus schema in one click
- [ ] Webhook / email notifier for new submissions
- [ ] Wallet attestation field type that signs with the submitter's wallet
- [ ] On-chain anchoring of triage actions (priority changes, status changes)

---

## License

Apache 2.0 — see [`LICENSE`](LICENSE).

Built for the **Walrus Sessions: Tools Builder Activation Hackathon** (May 5 – May 18, 2026).

Walrus mainnet is the primary deployment target. The frontend is a fully static Next.js bundle published to Walrus Sites; the Move package lives on Sui (testnet for cheap demo signing, mainnet copy also published for reference).

— *Ezra Kristanto Nahumury*
