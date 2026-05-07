"use client";

import {
  FileText,
  Image as ImageIcon,
  Lock,
  Network,
  Receipt,
} from "lucide-react";
import type { ReactNode } from "react";

/* ========================================================================== */
/* Shared frame — dark card with badge icon + filler viz                      */
/* ========================================================================== */

function Frame({ Icon, children }: { Icon: typeof FileText; children: ReactNode }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-[color:var(--color-ink-950)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 25%, rgba(40,40,55,0.50), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(20,20,28,0.40), transparent 65%), #050507",
        }}
      />
      <div className="absolute inset-0">{children}</div>
      <div className="absolute top-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.08] border border-white/15 backdrop-blur-sm">
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 1. Schema blob — JSON-style lines typing in then resetting                */
/* ========================================================================== */

export function SchemaBlobViz() {
  return (
    <Frame Icon={FileText}>
      <div className="absolute inset-x-5 top-14 bottom-5 flex flex-col gap-1.5 font-mono text-[10.5px] leading-tight text-white/75">
        <div className="schema-line schema-line-1">
          <span className="text-white/40">{`{`}</span>
        </div>
        <div className="schema-line schema-line-2 pl-3">
          <span className="text-[color:var(--color-accent-glow)]">&quot;name&quot;</span>
          <span className="text-white/40">: </span>
          <span className="text-white/85">&quot;Mainnet bug intake&quot;</span>
        </div>
        <div className="schema-line schema-line-3 pl-3">
          <span className="text-[color:var(--color-accent-glow)]">&quot;fields&quot;</span>
          <span className="text-white/40">: [</span>
        </div>
        <div className="schema-line schema-line-4 pl-6">
          <span className="text-white/40">{`{ `}</span>
          <span className="text-[color:var(--color-accent-glow)]">type</span>
          <span className="text-white/40">: </span>
          <span className="text-white/85">&quot;rich_text&quot;</span>
          <span className="text-white/40">,</span>
        </div>
        <div className="schema-line schema-line-5 pl-9">
          <span className="text-[color:var(--color-accent-glow)]">sensitive</span>
          <span className="text-white/40">: </span>
          <span className="text-[color:var(--color-signal-ok)]">true</span>
          <span className="text-white/40">{` }`}</span>
        </div>
        <div className="schema-line schema-line-6 pl-3">
          <span className="text-white/40">]</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-3 right-3 text-[9px] tracking-[0.18em] uppercase text-white/45 font-mono">
        blob_84a3…f1b9
      </div>
    </Frame>
  );
}

/* ========================================================================== */
/* 2. Encrypted envelope — hex characters cycling behind a lock pulse        */
/* ========================================================================== */

export function EncryptedEnvelopeViz() {
  return (
    <Frame Icon={Lock}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="enc-ring-1 absolute inset-[-22px] rounded-full border border-[color:var(--color-accent)]/35" />
          <div className="enc-ring-2 absolute inset-[-44px] rounded-full border border-[color:var(--color-accent)]/15" />
          <div className="relative h-12 w-12 rounded-full bg-[color:var(--color-accent)]/15 border border-[color:var(--color-accent)]/40 flex items-center justify-center">
            <Lock className="h-5 w-5 text-[color:var(--color-accent-glow)]" />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-3 grid grid-cols-8 gap-x-1 gap-y-0.5 font-mono text-[9.5px] text-white/55">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="enc-cell"
            style={{ animationDelay: `${(i * 80) % 1200}ms` }}
          >
            {hexAt(i)}
          </span>
        ))}
      </div>
    </Frame>
  );
}

function hexAt(i: number): string {
  // Stable per-position pseudo-hex characters; the CSS animation cycles content.
  const pool = "0123456789abcdef";
  return `${pool[(i * 7 + 3) % 16]}${pool[(i * 13 + 11) % 16]}`;
}

/* ========================================================================== */
/* 3. Media blob — upload progress bar + thumbnail mock                       */
/* ========================================================================== */

export function MediaBlobViz() {
  return (
    <Frame Icon={ImageIcon}>
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
        <div className="media-thumb relative h-16 w-24 rounded-md border border-white/15 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(122,167,255,0.45), rgba(200,74,44,0.35) 50%, rgba(255,255,255,0.10))",
            }}
          />
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px opacity-60">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="block bg-white/10"
                style={{ opacity: 0.05 + ((i * 9) % 11) / 30 }}
              />
            ))}
          </div>
          <div className="media-scan absolute inset-x-0 h-[1px] bg-white/70" />
        </div>
        <div className="w-full max-w-[160px] space-y-1.5">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="media-bar h-full rounded-full bg-white" />
          </div>
          <div className="flex items-center justify-between text-[9px] tracking-[0.16em] uppercase text-white/55 font-mono">
            <span className="media-pct">0%</span>
            <span>Walrus</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ========================================================================== */
/* 4. Index — fan-out tree (form root → response leaves) + ledger ticker     */
/* ========================================================================== */

export function IndexViz() {
  return (
    <Frame Icon={Network}>
      <svg
        viewBox="0 0 200 100"
        className="absolute inset-x-0 top-12 h-[58%] w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <radialGradient id="idx-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges from root to leaves */}
        {LEAVES.map((l, i) => (
          <line
            key={`e-${i}`}
            x1={100}
            y1={20}
            x2={l.x}
            y2={l.y}
            stroke="#FFFFFF"
            strokeOpacity="0.45"
            strokeWidth={0.7}
            strokeDasharray="3 3"
            className="idx-edge"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}

        {/* Leaves */}
        {LEAVES.map((l, i) => (
          <g key={`leaf-${i}`}>
            <circle
              cx={l.x}
              cy={l.y}
              r={6}
              fill="url(#idx-glow)"
              className="idx-leaf-glow"
              style={{ animationDelay: `${i * 0.18 + 0.1}s` }}
            />
            <circle
              cx={l.x}
              cy={l.y}
              r={1.6}
              fill="#FFFFFF"
              className="idx-leaf"
              style={{ animationDelay: `${i * 0.18 + 0.1}s` }}
            />
          </g>
        ))}

        {/* Root */}
        <circle cx={100} cy={20} r={9} fill="url(#idx-glow)" />
        <circle
          cx={100}
          cy={20}
          r={3}
          fill="#FFFFFF"
          className="idx-root"
        />
      </svg>

      {/* Ledger ticker */}
      <div className="absolute inset-x-5 bottom-12 h-[34%] overflow-hidden">
        <div className="idx-stream font-mono text-[9.5px] leading-snug text-white/70 space-y-1">
          {INDEX_ROWS.concat(INDEX_ROWS).map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 border-b border-white/5 pb-0.5"
            >
              <span className="text-white/40">{r.id}</span>
              <span className="text-white/35">→</span>
              <span className="text-white/85 truncate">{r.blob}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[color:var(--color-ink-950)] via-transparent to-[color:var(--color-ink-950)]" />
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] tracking-[0.18em] uppercase text-white/55 font-mono">
        <span>Form response index</span>
        <span className="idx-counter text-white/85" />
      </div>
    </Frame>
  );
}

const LEAVES: { x: number; y: number }[] = [
  { x: 24,  y: 60 },
  { x: 50,  y: 80 },
  { x: 80,  y: 75 },
  { x: 120, y: 80 },
  { x: 150, y: 70 },
  { x: 178, y: 62 },
];

const INDEX_ROWS = [
  { id: "rsp_a1c8b9", blob: "blob_84a3…f1b9" },
  { id: "rsp_b3f2ee", blob: "blob_19c8…2a44" },
  { id: "rsp_c0ffee", blob: "blob_72d1…9c5e" },
  { id: "rsp_feed01", blob: "blob_3b6f…a012" },
];

/* ========================================================================== */
/* 5. Receipt — printer-style hash lines scrolling                            */
/* ========================================================================== */

export function ReceiptViz() {
  return (
    <Frame Icon={Receipt}>
      <div className="absolute inset-x-5 top-14 bottom-12 overflow-hidden">
        <div className="receipt-stream font-mono text-[9.5px] leading-snug text-white/60 space-y-1">
          {RECEIPT_LINES.concat(RECEIPT_LINES).map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-white/35 uppercase tracking-[0.18em] text-[8.5px]">
                {l.k}
              </span>
              <span className="text-white/85 truncate">{l.v}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[color:var(--color-ink-950)] via-transparent to-[color:var(--color-ink-950)]" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] tracking-[0.18em] uppercase text-white/55 font-mono">
        <span>Proof-of-Feedback</span>
        <span className="receipt-hash text-white/85">a1c8b9…f1b9</span>
      </div>
    </Frame>
  );
}

const RECEIPT_LINES = [
  { k: "Form", v: "frm_a1c8b9" },
  { k: "Blob", v: "demo_b1f2…a93" },
  { k: "Hash", v: "f1c2b9aa…99" },
  { k: "Time", v: "2026-05-07 03:14" },
  { k: "Wallet", v: "0xc0ffee…ee" },
];
