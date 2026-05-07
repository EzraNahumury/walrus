"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className, invalid, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-lg bg-white border border-[color:var(--color-ink-300)] px-3 py-2 text-sm text-[color:var(--color-ink-900)] placeholder:text-[color:var(--color-ink-400)] transition resize-y focus:outline-none focus:border-[color:var(--color-ink-700)] focus:ring-2 focus:ring-[color:var(--color-ink-200)] focus:ring-offset-1 focus:ring-offset-white",
        invalid &&
          "border-[color:var(--color-signal-danger)] focus:border-[color:var(--color-signal-danger)] focus:ring-[color:var(--color-signal-danger)]/20",
        className,
      )}
      {...rest}
    />
  );
});
