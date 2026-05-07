"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-lg bg-white border border-[color:var(--color-ink-300)] h-10 px-3 text-sm text-[color:var(--color-ink-900)] focus:outline-none focus:border-[color:var(--color-ink-700)] focus:ring-2 focus:ring-[color:var(--color-ink-200)] focus:ring-offset-1 focus:ring-offset-white",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
