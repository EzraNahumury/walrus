"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { dismiss, subscribe, type ToastItem, type ToastVariant } from "@/lib/toast";
import { cn } from "@/lib/cn";

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof Info; iconColor: string; bar: string; border: string }
> = {
  info: {
    icon: Info,
    iconColor: "text-[color:var(--color-ink-700)]",
    bar: "bg-[color:var(--color-ink-700)]",
    border: "border-[color:var(--color-line)]",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-[color:var(--color-signal-ok)]",
    bar: "bg-[color:var(--color-signal-ok)]",
    border: "border-[color:var(--color-signal-ok)]/30",
  },
  warn: {
    icon: AlertTriangle,
    iconColor: "text-[color:var(--color-signal-warn)]",
    bar: "bg-[color:var(--color-signal-warn)]",
    border: "border-[color:var(--color-signal-warn)]/35",
  },
  error: {
    icon: XCircle,
    iconColor: "text-[color:var(--color-signal-danger)]",
    bar: "bg-[color:var(--color-signal-danger)]",
    border: "border-[color:var(--color-signal-danger)]/35",
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return subscribe(setToasts);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {toasts.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>,
    document.body,
  );
}

function ToastCard({ t }: { t: ToastItem }) {
  const [leaving, setLeaving] = useState(false);
  const v = VARIANT_STYLES[t.variant];
  const Icon = v.icon;

  const onDismiss = () => {
    setLeaving(true);
    setTimeout(() => dismiss(t.id), 220);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto relative w-[min(92vw,400px)] overflow-hidden rounded-xl border bg-white/95 backdrop-blur shadow-[0_8px_30px_-8px_rgba(10,10,10,0.18),0_2px_8px_-4px_rgba(10,10,10,0.10)] transition-all",
        v.border,
        leaving ? "toast-leave" : "toast-enter",
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5 pr-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", v.iconColor)} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold tracking-tightish text-[color:var(--color-ink-900)] leading-snug">
            {t.title}
          </div>
          {t.description ? (
            <div className="mt-0.5 text-[12px] text-[color:var(--color-ink-600)] leading-relaxed">
              {t.description}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-[color:var(--color-ink-400)] hover:text-[color:var(--color-ink-900)] -mr-1 p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {t.durationMs > 0 ? (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[color:var(--color-ink-100)]">
          <div
            className={cn("h-full origin-left", v.bar)}
            style={{
              animation: `toast-bar ${t.durationMs}ms linear forwards`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
