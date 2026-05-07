"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-ink-900)] text-white border border-[color:var(--color-ink-900)] hover:bg-[color:var(--color-ink-800)] disabled:bg-[color:var(--color-ink-300)] disabled:border-[color:var(--color-ink-300)] disabled:text-white",
  secondary:
    "bg-[color:var(--color-bg-soft)] text-[color:var(--color-ink-900)] border border-[color:var(--color-line)] hover:bg-[color:var(--color-bg-2)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink-700)] hover:bg-[color:var(--color-bg-soft)] border border-transparent",
  outline:
    "bg-white text-[color:var(--color-ink-900)] border border-[color:var(--color-ink-300)] hover:border-[color:var(--color-ink-500)] hover:bg-[color:var(--color-bg-soft)]",
  danger:
    "bg-[color:var(--color-signal-danger)] text-white border border-[color:var(--color-signal-danger)] hover:opacity-90",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
});
