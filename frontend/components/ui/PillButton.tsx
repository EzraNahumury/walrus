"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "dark" | "light" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  showArrow?: boolean;
}

const SIZE: Record<Size, string> = {
  sm: "h-9 pl-4 pr-1 text-[11px] tracking-[0.16em]",
  md: "h-11 pl-5 pr-1.5 text-[12px] tracking-[0.18em]",
  lg: "h-12 pl-6 pr-2 text-[12.5px] tracking-[0.18em]",
};

const ARROW_SIZE: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-9 w-9",
};

const VARIANT_OUTER: Record<Variant, string> = {
  dark: "bg-[color:var(--color-ink-900)] text-white border border-[color:var(--color-ink-900)] hover:bg-[color:var(--color-ink-800)]",
  light:
    "bg-white text-[color:var(--color-ink-900)] border border-[color:var(--color-ink-300)] hover:bg-[color:var(--color-bg-soft)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink-900)] border border-transparent hover:bg-[color:var(--color-bg-soft)]",
};

const VARIANT_ARROW: Record<Variant, string> = {
  dark: "bg-white/10 text-white border border-white/15",
  light: "bg-[color:var(--color-ink-900)] text-white border border-[color:var(--color-ink-900)]",
  ghost:
    "bg-[color:var(--color-ink-900)] text-white border border-[color:var(--color-ink-900)]",
};

interface AsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: undefined;
}
interface AsLink extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

type Props = AsButton | AsLink;

export function PillButton(props: Props) {
  const {
    children,
    variant = "dark",
    size = "md",
    className,
    showArrow = true,
  } = props;

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-3 rounded-full font-semibold uppercase select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        VARIANT_OUTER[variant],
        SIZE[size],
        !showArrow && "pr-5",
        className,
      )}
    >
      <span className="leading-none">{children}</span>
      {showArrow ? (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5",
            ARROW_SIZE[size],
            VARIANT_ARROW[variant],
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </span>
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        className="group inline-block"
      >
        {inner}
      </Link>
    );
  }

  const { href: _h, showArrow: _s, variant: _v, size: _z, className: _c, children: _ch, ...rest } = props as AsButton;
  return (
    <button {...rest} className="group inline-block">
      {inner}
    </button>
  );
}
