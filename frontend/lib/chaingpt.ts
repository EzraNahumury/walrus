// Client-side adapter for the AI form drafting flow.
//
// Two paths:
//   1. NEXT_PUBLIC_CHAINGPT_API_KEY set → call ChainGPT directly from the
//      browser. ChainGPT permits CORS so this works without a proxy.
//      Used on static Walrus Sites builds.
//   2. Otherwise → POST /api/ai/draft-form (Next.js route handler running
//      with the server-only CHAINGPT_API_KEY). Used during local dev.

import { callChainGPT, type SanitizedDraft } from "@/lib/ai-parser";
import type { FieldType, FormCategory } from "@/types/signalvault";

export type AIFormDraftField = SanitizedDraft["fields"][number] & {
  type: FieldType;
};
export type AIFormDraft = Omit<SanitizedDraft, "category" | "fields"> & {
  category: FormCategory;
  fields: AIFormDraftField[];
};

export class AIDraftError extends Error {
  detail?: string;
  status?: number;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_CHAINGPT_API_KEY ?? "";

export async function draftFormFromBrief(brief: string): Promise<AIFormDraft> {
  if (PUBLIC_KEY) {
    try {
      const draft = await callChainGPT(PUBLIC_KEY, brief);
      return draft as AIFormDraft;
    } catch (e) {
      throw new AIDraftError(
        e instanceof Error ? e.message : "AI draft failed",
        0,
      );
    }
  }

  let res: Response;
  try {
    res = await fetch("/api/ai/draft-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief }),
    });
  } catch (e) {
    throw new AIDraftError(
      "AI service unreachable",
      0,
      e instanceof Error ? e.message : "network error",
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AIDraftError(
      "AI draft is not available on this deployment",
      res.status,
      "Set NEXT_PUBLIC_CHAINGPT_API_KEY in .env.local before building, or run locally with `npm run dev`.",
    );
  }

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
