# SignalVault — Frontend

The browser-side runtime for [SignalVault](../README.md): a Walrus-native, encrypted feedback OS for Web3 teams.

This is a **Next.js 16 (App Router) static-export** frontend. The build target is **Walrus Sites mainnet**. Vercel may be used as an optional preview mirror; it is not the hackathon submission target.

## What this app does

- Build forms with rich text, dropdown, checkbox, star rating, screenshot, video, URL, and confirmation fields.
- Mark fields as *sensitive*; those values are encrypted client-side before upload.
- Publish form schemas as Walrus blobs.
- Anchor each form on Sui as a `FormPolicy` object (creator + admin allowlist).
- Collect submissions: encrypt, upload media, upload envelope, generate a content-addressed Feedback Receipt.
- Triage in a private admin dashboard: filter, prioritize, status-tag, internal notes, decrypt, export CSV, generate insights.

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**.
- **Tailwind CSS v4** with `@theme` tokens — no Tailwind config file needed.
- **lucide-react** icons. **clsx + tailwind-merge** for class composition.
- **@mysten/dapp-kit + @mysten/sui** for wallet and on-chain calls.
- **@tanstack/react-query** for query state.
- Static export via `output: "export"` in `next.config.ts`.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in (or leave blank for demo mode)
npm run dev
```

Open <http://localhost:3000>. The app boots in **demo adapter mode** if Walrus / Seal / Sui env vars are blank — every flow still works end to end.

## Build a static bundle

```bash
npm run build
# → ./out  (HTML/CSS/JS suitable for Walrus Sites)
```

## Configure for live mainnet

Edit `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUI_NETWORK` | `mainnet` / `testnet` / `devnet` |
| `NEXT_PUBLIC_WALRUS_PUBLISHER_URL` | Walrus publisher HTTP endpoint |
| `NEXT_PUBLIC_WALRUS_AGGREGATOR_URL` | Walrus aggregator HTTP endpoint |
| `NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID` | Sui package ID of the published `sc_signalvault` Move package |
| `NEXT_PUBLIC_SEAL_PACKAGE_ID` | Seal package ID (when wiring real Seal SDK) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL — used for shareable form / receipt links |

Adapters in `lib/walrus.ts`, `lib/seal.ts`, `lib/sui.ts` flip from demo to live automatically when the matching env vars are set. The UI surfaces a banner whenever any adapter is in demo mode so nothing is hidden.

## Deploy to Walrus Sites

```bash
# 1. Build
npm run build

# 2. Publish the static `out/` folder via the Walrus site-builder CLI:
site-builder publish ./out --epochs 30

# Or via web UI: open https://web.walgo.xyz, "Create new site",
# upload the contents of ./out, sign with your wallet.
```

After publishing, bind a SuiNS subname (e.g. `signalvault.<your-name>`) to the resulting `siteObjectId` so the canonical demo URL is `https://signalvault.<your-name>.wal.app`.

> **Vercel is optional preview only.** The hackathon submission must point to the Walrus Sites mainnet URL.

## Project layout

```
frontend/
├── app/                       # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx               # /
│   ├── create/page.tsx        # /create
│   ├── form/page.tsx          # /form?id=…
│   ├── dashboard/page.tsx     # /dashboard
│   ├── dashboard/form/page.tsx# /dashboard/form?id=…
│   ├── receipt/page.tsx       # /receipt?id=…
│   └── globals.css
├── components/
│   ├── layout/                # Header, Footer, Providers, Container, AdapterBanner
│   ├── ui/                    # Button, Card, Input, Textarea, Badge, Select, Toggle
│   ├── forms/                 # FieldEditor, FieldRenderer, StarRating, FieldTypePicker
│   ├── dashboard/             # StatCard, PriorityBadge, StatusBadge, InsightPanel, EmptyState
│   └── receipt/               # BlobLink
├── lib/
│   ├── walrus.ts              # Walrus put/get adapter (live or demo)
│   ├── seal.ts                # Seal encrypt/decrypt adapter (live or demo)
│   ├── sui.ts                 # Sui network + package ID helpers
│   ├── forms.ts               # Schema authoring + validation
│   ├── export.ts              # CSV export
│   ├── insights.ts            # Local insight generation (no external AI)
│   ├── demo-store.ts          # localStorage-backed demo persistence
│   ├── demo-data.ts           # Realistic seed data
│   ├── storage.ts             # Typed localStorage wrapper
│   └── cn.ts                  # className composition helper
├── types/
│   └── signalvault.ts         # FormSchema, FormResponse, FeedbackReceipt, …
├── next.config.ts             # output: "export"
└── package.json
```

## Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Landing | Hero, dashboard preview, why-Walrus, how-it-works, receipt callout, CTA. |
| `/create` | Form builder | Schema authoring + Walrus publish. |
| `/form?id=…` | Public form | Validation, encrypt sensitive fields, upload media + envelope, receipt generation. |
| `/dashboard` | Overview | Form list, stat cards, recent submissions. |
| `/dashboard/form?id=…` | Form dashboard | Filters, decrypt, notes, priority, status, CSV export, insights. |
| `/receipt?id=…` | Receipt | Public Proof-of-Feedback artifact. |

(Static export does not allow dynamic path params without `generateStaticParams`. We use query-string IDs so the app stays a clean SPA after build.)

## Adapter honesty

The UI shows the live/demo state of every adapter at the top of the page when any are in demo mode. Demo Seal uses AES-GCM-256 keyed off `policyObjectId`; that boundary is clearly labeled and isolated to `lib/seal.ts`. When `NEXT_PUBLIC_SEAL_PACKAGE_ID` is set, replace the marked `TODO` branch with the Seal SDK call — the envelope shape is already aligned.
