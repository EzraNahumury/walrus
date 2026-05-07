// Lightweight global toast bus — no React context, no provider needed.
// Components subscribe via `subscribe()`, callers fire via `toast.x(...)`.

export type ToastVariant = "info" | "success" | "warn" | "error";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs: number;
  createdAt: number;
}

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

function emit() {
  for (const l of listeners) l(toasts);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

function makeId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function push(
  variant: ToastVariant,
  title: string,
  description?: string,
  durationMs = 4500,
): string {
  const id = makeId();
  const item: ToastItem = {
    id,
    variant,
    title,
    description,
    durationMs,
    createdAt: Date.now(),
  };
  toasts = [...toasts, item];
  emit();
  if (durationMs > 0) {
    setTimeout(() => dismiss(id), durationMs);
  }
  return id;
}

export function dismiss(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function dismissAll(): void {
  toasts = [];
  emit();
}

export const toast = {
  info: (title: string, description?: string, durationMs?: number) =>
    push("info", title, description, durationMs),
  success: (title: string, description?: string, durationMs?: number) =>
    push("success", title, description, durationMs),
  warn: (title: string, description?: string, durationMs?: number) =>
    push("warn", title, description, durationMs),
  error: (title: string, description?: string, durationMs?: number) =>
    push("error", title, description, durationMs ?? 6000),
  dismiss,
  dismissAll,
};
