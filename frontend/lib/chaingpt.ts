// Client-side adapter for the AI form drafting endpoint.
//
// Calls our own /api/ai/draft-form route (which forwards to ChainGPT with the
// server-only key). The shape returned is already sanitized to our supported
// FieldType set so the form builder can consume it directly.

import type { FieldType, FormCategory } from "@/types/signalvault";

export interface AIFormDraftField {
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  sensitive: boolean;
  publicOnReceipt: boolean;
  options?: { value: string; label: string }[];
  maxRating?: number;
}

export interface AIFormDraft {
  name: string;
  description: string;
  category: FormCategory;
  fields: AIFormDraftField[];
}

export class AIDraftError extends Error {
  detail?: string;
  status?: number;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export async function draftFormFromBrief(brief: string): Promise<AIFormDraft> {
  const res = await fetch("/api/ai/draft-form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief }),
  });

  let data: { draft?: AIFormDraft; error?: string; detail?: string } | null = null;
  try {
    data = await res.json();
  } catch {
    /* fall through */
  }

  if (!res.ok || !data?.draft) {
    throw new AIDraftError(
      data?.error ?? `AI draft failed (${res.status})`,
      res.status,
      data?.detail,
    );
  }
  return data.draft;
}
