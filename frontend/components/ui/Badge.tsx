import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "ok" | "warn" | "danger" | "muted" | "dark";

const TONE: Record<Tone, string> = {
  neutral: "bg-[color:var(--color-bg-soft)] text-[color:var(--color-ink-700)] border-[color:var(--color-line)]",
  accent:
    "bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] border-[color:var(--color-accent)]/30",
  ok: "bg-[color:var(--color-signal-ok)]/10 text-[color:var(--color-signal-ok)] border-[color:var(--color-signal-ok)]/30",
  warn: "bg-[color:var(--color-signal-warn)]/10 text-[color:var(--color-signal-warn)] border-[color:var(--color-signal-warn)]/30",
  danger:
    "bg-[color:var(--color-signal-danger)]/10 text-[color:var(--color-signal-danger)] border-[color:var(--color-signal-danger)]/30",
  muted:
    "bg-white text-[color:var(--color-ink-500)] border-[color:var(--color-line)]",
  dark:
    "bg-[color:var(--color-ink-900)] text-white border-[color:var(--color-ink-900)]",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] uppercase",
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
