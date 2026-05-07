"use client";

import { Lock } from "lucide-react";

import { sealMode } from "@/lib/seal";
import { suiMode } from "@/lib/sui";
import { walrusMode } from "@/lib/walrus";

export function AdapterBanner() {
  const allLive = walrusMode === "live" && sealMode === "live" && suiMode === "live";
  if (allLive) return null;

  return (
    <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)]">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase text-[color:var(--color-ink-500)]">
        <Lock className="h-3 w-3 text-[color:var(--color-accent)]" />
        <span>
          Adapter — Walrus <Strong v={walrusMode} /> · Seal <Strong v={sealMode} /> · Sui <Strong v={suiMode} />
        </span>
        <span className="text-[color:var(--color-ink-400)] hidden md:inline">
          — set env vars to switch each to live
        </span>
      </div>
    </div>
  );
}

function Strong({ v }: { v: "live" | "demo" }) {
  return (
    <span className={v === "live" ? "text-[color:var(--color-signal-ok)]" : "text-[color:var(--color-ink-900)]"}>
      {v}
    </span>
  );
}
