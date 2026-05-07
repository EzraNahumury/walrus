"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg bg-white border border-[color:var(--color-ink-300)] px-3 h-10 text-sm text-[color:var(--color-ink-900)] placeholder:text-[color:var(--color-ink-400)] transition focus:outline-none focus:border-[color:var(--color-ink-700)] focus:ring-2 focus:ring-[color:var(--color-ink-200)] focus:ring-offset-1 focus:ring-offset-white",
        invalid &&
          "border-[color:var(--color-signal-danger)] focus:border-[color:var(--color-signal-danger)] focus:ring-[color:var(--color-signal-danger)]/20",
        className,
      )}
      {...rest}
    />
  );
});
