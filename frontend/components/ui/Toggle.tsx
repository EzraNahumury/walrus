"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition",
          checked
            ? "bg-[color:var(--color-ink-900)] border-[color:var(--color-ink-900)]"
            : "bg-white border-[color:var(--color-ink-300)]",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full transition shadow-card",
            checked
              ? "bg-white translate-x-[18px]"
              : "bg-[color:var(--color-ink-400)] translate-x-[2px]",
          )}
        />
      </button>
      {(label || description) && (
        <span className="flex flex-col">
          {label ? <span className="text-sm text-[color:var(--color-ink-900)]">{label}</span> : null}
          {description ? (
            <span className="text-xs text-[color:var(--color-ink-500)] mt-0.5 leading-snug">
              {description}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );
}
