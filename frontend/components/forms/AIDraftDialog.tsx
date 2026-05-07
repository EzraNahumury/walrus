"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { AIDraftError, draftFormFromBrief, type AIFormDraft } from "@/lib/chaingpt";
import { toast } from "@/lib/toast";

interface AIDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (draft: AIFormDraft) => void;
}

const EXAMPLES = [
  "Collect mainnet bug reports for a v2 trading client. Sensitive details encrypted.",
  "Q3 ecosystem grants application for early-stage Web3 teams.",
  "Quick post-event NPS survey with optional written feedback.",
  "Confidential security disclosure intake from independent researchers.",
];

export function AIDraftDialog({ open, onClose, onApply }: AIDraftDialogProps) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<AIFormDraft | null>(null);

  useEffect(() => {
    if (!open) {
      setBrief("");
      setDraft(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const generate = async () => {
    if (brief.trim().length < 4) {
      toast.warn("Add a short brief", "Tell the AI what kind of form you need.");
      return;
    }
    setLoading(true);
    setDraft(null);
    try {
      const d = await draftFormFromBrief(brief.trim());
      setDraft(d);
      toast.success("Draft ready", "Review the suggested fields then apply.");
    } catch (e) {
      const err = e as AIDraftError;
      toast.error("AI draft failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-[color:var(--color-line)] bg-white shadow-[0_24px_60px_-20px_rgba(10,10,10,0.35)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)]">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold tracking-tightish text-[color:var(--color-ink-900)]">
                Draft a form with AI
              </div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
                Powered by ChainGPT
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[color:var(--color-ink-400)] hover:text-[color:var(--color-ink-900)] p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <label className="block">
            <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">
              Describe the form you want
            </span>
            <Textarea
              rows={3}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g. Q3 ecosystem grants application — encrypted answers, public proof of submission"
              maxLength={600}
            />
            <div className="mt-1 text-[10.5px] text-[color:var(--color-ink-400)] flex justify-between">
              <span>{brief.length}/600</span>
              <span>Be specific — mention the audience and what you'll do with the answers.</span>
            </div>
          </label>

          <div>
            <div className="text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] mb-2">
              Try an example
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setBrief(ex)}
                  className="text-[11.5px] text-left rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-3 py-1.5 hover:bg-[color:var(--color-bg-2)] hover:border-[color:var(--color-ink-400)] text-[color:var(--color-ink-700)]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {draft ? <DraftPreview draft={draft} /> : null}
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--color-line)] px-6 py-3 bg-[color:var(--color-bg-soft)]">
          <span className="text-[11px] text-[color:var(--color-ink-500)]">
            AI suggestions are a starting point. Edit fields before publishing.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {draft ? (
              <Button
                size="sm"
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
              >
                Apply to builder
              </Button>
            ) : (
              <Button size="sm" onClick={generate} loading={loading}>
                {loading ? "Generating…" : "Generate"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftPreview({ draft }: { draft: AIFormDraft }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
          Suggested form
        </div>
        <span className="text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)]">
          {draft.fields.length} field{draft.fields.length === 1 ? "" : "s"}
        </span>
      </div>
      <div>
        <div className="text-[14px] font-semibold text-[color:var(--color-ink-900)] tracking-tightish">
          {draft.name}
        </div>
        {draft.description ? (
          <p className="mt-1 text-[12.5px] text-[color:var(--color-ink-600)] leading-relaxed">
            {draft.description}
          </p>
        ) : null}
      </div>
      <ul className="space-y-1.5">
        {draft.fields.map((f, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 border-t border-[color:var(--color-line)] pt-2 first:border-0 first:pt-0"
          >
            <div className="min-w-0">
              <div className="text-[12.5px] text-[color:var(--color-ink-900)] truncate">
                {f.label}
              </div>
              <div className="text-[10.5px] text-[color:var(--color-ink-500)] tracking-[0.16em] uppercase mt-0.5">
                {f.type.replace("_", " ")}
                {f.required ? " · required" : ""}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {f.sensitive ? <Pill tone="accent">Encrypted</Pill> : null}
              {f.publicOnReceipt ? <Pill tone="ok">Receipt</Pill> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: "accent" | "ok";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-[9.5px] tracking-[0.16em] uppercase",
        tone === "accent"
          ? "bg-[color:var(--color-accent)]/10 border-[color:var(--color-accent)]/30 text-[color:var(--color-accent)]"
          : "bg-[color:var(--color-signal-ok)]/10 border-[color:var(--color-signal-ok)]/30 text-[color:var(--color-signal-ok)]",
      )}
    >
      {children}
    </span>
  );
}
