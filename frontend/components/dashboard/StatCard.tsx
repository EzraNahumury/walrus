import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "neutral" | "accent" | "warn";
}

export function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-white px-5 py-4 shadow-card">
      <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-[34px] leading-none font-serif italic tracking-tightish",
          tone === "accent" && "text-[color:var(--color-accent)]",
          tone === "warn" && "text-[color:var(--color-signal-warn)]",
          tone === "neutral" && "text-[color:var(--color-ink-900)]",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-[color:var(--color-ink-500)]">{hint}</div>
      ) : null}
    </div>
  );
}
