"use client";

import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-line)] mt-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 flex items-center gap-2">
            <Logo size={20} />
            <span className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[color:var(--color-ink-900)]">
              SignalVault
            </span>
          </div>
          <FooterCol
            title=""
            items={[
              { href: "/", label: "Home" },
              { href: "/welcome", label: "Welcome" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/create", label: "Create form" },
            ]}
          />
          <FooterCol
            title=""
            items={[
              { href: "https://docs.wal.app", label: "Walrus", external: true },
              { href: "https://sui.io", label: "Sui", external: true },
              { href: "https://discord.com/invite/walrusprotocol", label: "Discord", external: true },
              { href: "/IMPLEMENTATION_NOTES.md", label: "Implementation" },
            ]}
          />
          <div className="md:col-span-2 md:text-right">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[12px] tracking-wide text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
            >
              Back to top ↑
            </button>
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-400)]">
          Built for Walrus Sessions · Tools Builder Activation · 2026
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div className="md:col-span-3">
      {title ? (
        <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink-400)] mb-3">
          {title}
        </div>
      ) : null}
      <ul className="space-y-2.5">
        {items.map((it) =>
          it.external ? (
            <li key={it.href}>
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
              >
                {it.label}
              </a>
            </li>
          ) : (
            <li key={it.href}>
              <Link
                href={it.href}
                className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
              >
                {it.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
