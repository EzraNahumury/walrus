import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, body, action, icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--color-ink-300)] bg-white px-8 py-14 text-center shadow-card">
      {icon ? (
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-ink-500)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[color:var(--color-ink-900)]">{title}</h3>
      {body ? (
        <p className="mt-2 text-sm text-[color:var(--color-ink-500)] max-w-md mx-auto">
          {body}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
