"use client";

import {
  ArrowRight,
  FilePlus2,
  Heart,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/Container";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type Mode = "submit" | "create" | "dashboard";

const MODES: { id: Mode; label: string; tags: string[]; title: string; body: string; bullets: string[]; cta: { href: string; label: string }; Icon: typeof Heart }[] = [
  {
    id: "submit",
    label: "Submit",
    tags: ["Public form", "Seal-encrypted", "Receipt"],
    title: "Browse forms & contribute privately",
    body:
      "Open a shareable form link, fill it out, and receive a content-addressed receipt. Sensitive fields encrypted in your browser before they touch Walrus.",
    bullets: [
      "Encrypted client-side via Seal",
      "Walrus-stored response envelope",
      "Public Proof-of-Feedback receipt",
      "Wallet optional for the demo",
    ],
    cta: { href: "/dashboard", label: "Browse active forms" },
    Icon: Heart,
  },
  {
    id: "create",
    label: "Create",
    tags: ["Form builder", "Walrus schema", "Sui policy"],
    title: "Design a Walrus-native form",
    body:
      "Drag in fields, mark sensitive ones, publish. Schema becomes a public Walrus blob; ownership and admins live as a Sui FormPolicy object.",
    bullets: [
      "Nine field types — required + sensitive flags",
      "Schema published to Walrus on publish",
      "Sui anchors ownership + admin allowlist",
      "Shareable link generated instantly",
    ],
    cta: { href: "/create", label: "Open the builder" },
    Icon: FilePlus2,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    tags: ["Triage", "Decrypt", "Export"],
    title: "Triage feedback into product decisions",
    body:
      "Filter, prioritize, annotate, decrypt, and export. Insights generate from response data — no external AI calls, all deterministic.",
    bullets: [
      "Filter by priority, status, search",
      "Decrypt only what you're authorized for",
      "Internal notes + priority lanes (P0–P3)",
      "CSV export + local insight panel",
    ],
    cta: { href: "/dashboard", label: "Open dashboard" },
    Icon: LayoutDashboard,
  },
];

export default function WelcomePage() {
  const [active, setActive] = useState<Mode>("submit");
  const mode = MODES.find((m) => m.id === active)!;

  return (
    <Container size="md" className="pt-16 pb-24 md:pt-24">
      <Reveal>
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)]">
            <Logo size={24} />
          </div>
          <h1 className="mt-6 text-[40px] md:text-[52px] leading-[1.05] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
            Welcome to <span className="serif-em">SignalVault</span>
          </h1>
          <p className="mt-3 text-[15px] text-[color:var(--color-ink-600)]">
            Choose how you want to continue.
          </p>
          <Link
            href="/"
            className="mt-2 inline-block text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] underline underline-offset-4 hover:text-[color:var(--color-ink-900)]"
          >
            Back to homepage
          </Link>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-12 rounded-3xl border border-[color:var(--color-line)] bg-white shadow-card overflow-hidden">
          <div className="relative aspect-[16/7] bg-black overflow-hidden">
            <DottedSurface
              className="absolute inset-0"
              variant="dark"
              amountX={36}
              amountY={48}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-6">
              {MODES.map((m) => {
                const isActive = m.id === active;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActive(m.id)}
                    aria-label={m.label}
                    className={cn(
                      "relative inline-flex h-14 w-14 items-center justify-center rounded-full border transition-all",
                      isActive
                        ? "bg-white text-[color:var(--color-ink-900)] border-white scale-110 shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
                        : "bg-white/[0.04] text-white/85 border-white/15 hover:bg-white/[0.10]",
                    )}
                  >
                    <m.Icon
                      className={cn(
                        "h-5 w-5",
                        isActive && "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]",
                      )}
                    />
                    {isActive ? (
                      <span className="absolute -inset-2 rounded-full border border-white/20 ring-dot text-white/60" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-7 md:px-10 md:py-9">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {mode.tags.map((t, i) => (
                <span
                  key={t}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] tracking-[0.14em] uppercase border",
                    i === 0
                      ? "bg-[color:var(--color-ink-900)] text-white border-[color:var(--color-ink-900)]"
                      : "bg-white text-[color:var(--color-ink-700)] border-[color:var(--color-line)]",
                  )}
                >
                  {t}
                </span>
              ))}
            </div>

            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tightish text-[color:var(--color-ink-900)]">
              {mode.title}
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--color-ink-600)] max-w-xl">
              {mode.body}
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              {mode.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[color:var(--color-ink-700)]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)] shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <Link
              href={mode.cta.href}
              className="mt-7 group flex items-center justify-between gap-2 rounded-2xl border border-[color:var(--color-line)] bg-white px-6 py-4 text-[color:var(--color-ink-900)] hover:bg-[color:var(--color-bg-soft)] transition"
            >
              <span className="text-[13.5px] font-semibold tracking-tightish">{mode.cta.label}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <p className="mt-6 text-center text-[12px] text-[color:var(--color-ink-500)]">
          All flows run on Walrus mainnet.{" "}
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3 w-3 text-[color:var(--color-accent)]" /> Sensitive fields are
            Seal-encrypted client-side.
          </span>
        </p>
      </Reveal>

      <Reveal delay={260}>
        <div className="mt-10 flex justify-center">
          <Link
            href={mode.cta.href}
            className="group inline-flex items-center gap-3 rounded-full bg-[color:var(--color-ink-900)] px-7 h-12 text-white transition hover:bg-[color:var(--color-ink-800)]"
          >
            <mode.Icon className="h-4 w-4" />
            <span className="text-[12px] tracking-[0.18em] uppercase font-semibold">
              {mode.cta.label}
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/15 transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </Reveal>
    </Container>
  );
}
