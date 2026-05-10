"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WalletButton } from "@/components/layout/WalletButton";
import { Logo } from "@/components/ui/Logo";
import { PillButton } from "@/components/ui/PillButton";
import { cn } from "@/lib/cn";

const PUBLIC_NAV = [
  { href: "/#why", label: "Why" },
  { href: "/#how", label: "How it works" },
  { href: "/#receipt", label: "Receipt" },
];

const APP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create", label: "Create" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const isApp =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/form") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/receipt");

  const nav = isApp ? APP_NAV : PUBLIC_NAV;

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-[15px] font-semibold tracking-tightish text-[color:var(--color-ink-900)]">
            SignalVault
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9 text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-ink-500)]">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-[color:var(--color-ink-900)]",
                  active && "text-[color:var(--color-ink-900)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {isApp ? (
            <WalletButton />
          ) : (
            <PillButton href="/welcome" size="sm">
              Launch app
            </PillButton>
          )}
        </div>
      </div>
    </header>
  );
}
