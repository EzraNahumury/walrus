// CSV export of triaged responses.

import type {
  FormResponse,
  FormSchema,
  ResponseTriage,
} from "@/types/signalvault";

function csvEscape(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsv(
  schema: FormSchema,
  responses: FormResponse[],
  triages: Record<string, ResponseTriage | undefined>,
): string {
  const baseHeaders = [
    "response_id",
    "submitted_at_iso",
    "submitter_wallet",
    "response_blob_id",
    "response_hash",
    "status",
    "priority",
    "tags",
    "note_count",
  ];
  const fieldHeaders = schema.fields
    .filter((f) => f.type !== "screenshot" && f.type !== "video")
    .map((f) => `${f.id}__${f.label.replace(/\s+/g, "_").toLowerCase()}`);
  const headers = [...baseHeaders, ...fieldHeaders, "media_blob_ids"];

  const rows = responses.map((r) => {
    const triage = triages[r.responseId];
    const baseRow = [
      r.responseId,
      new Date(r.submittedAt).toISOString(),
      r.submitterWallet ?? "",
      r.responseBlobId ?? "",
      r.responseHash ?? "",
      triage?.status ?? "new",
      triage?.priority ?? "unranked",
      (triage?.tags ?? []).join("|"),
      String(triage?.notes.length ?? 0),
    ];
    const fieldRow = schema.fields
      .filter((f) => f.type !== "screenshot" && f.type !== "video")
      .map((f) => {
        if (f.sensitive) {
          // Sensitive values are only present after admin decryption.
          // Caller should hydrate `r.publicFields` with the decrypted values
          // before calling buildCsv if export should include them.
          return r.publicFields[f.id] ?? "[encrypted]";
        }
        return r.publicFields[f.id] ?? "";
      });
    const media = r.media.map((m) => `${m.fieldId}:${m.blobId}`).join("|");
    return [...baseRow, ...fieldRow, media].map(csvEscape).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
