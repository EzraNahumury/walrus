// CSV export of triaged responses.
//
// CSV improvements over a naive write:
//   - UTF-8 BOM so Excel reads diacritics correctly.
//   - `sep=,` directive on the first line so Excel auto-splits regardless of
//     the user's regional list-separator setting (Indonesian, Italian, etc).
//   - CRLF line endings so Excel and Windows handle line breaks correctly.
//   - Cleaner field column names (snake_case label, no nanoid prefix).
//   - Companion *_short columns for blob ID, hash, and submitter wallet so
//     the wide columns are easier to scan; the full values are kept too.

import type {
  FormResponse,
  FormSchema,
  ResponseTriage,
} from "@/types/signalvault";

function csvEscape(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (/[",\n;\t]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function snakeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function uniqueLabels(labels: string[]): string[] {
  const counts: Record<string, number> = {};
  return labels.map((l) => {
    counts[l] = (counts[l] ?? 0) + 1;
    return counts[l] > 1 ? `${l}_${counts[l]}` : l;
  });
}

function shortHash(h: string | undefined, n = 8): string {
  if (!h) return "";
  if (h.length <= n * 2 + 1) return h;
  return `${h.slice(0, n)}…${h.slice(-4)}`;
}

export function buildCsv(
  schema: FormSchema,
  responses: FormResponse[],
  triages: Record<string, ResponseTriage | undefined>,
): string {
  const visibleFields = schema.fields.filter(
    (f) => f.type !== "screenshot" && f.type !== "video",
  );
  const fieldLabels = uniqueLabels(
    visibleFields.map((f) => snakeLabel(f.label) || "field"),
  );

  const headers = [
    "response_id",
    "submitted_at",
    "submitter_wallet",
    "submitter_short",
    "response_blob_id",
    "blob_short",
    "response_hash",
    "hash_short",
    "status",
    "priority",
    "tags",
    "note_count",
    "encrypted",
    ...fieldLabels,
    "media_blob_ids",
  ];

  const rows = responses.map((r) => {
    const triage = triages[r.responseId];
    const baseRow = [
      r.responseId,
      new Date(r.submittedAt).toISOString().replace("T", " ").slice(0, 19),
      r.submitterWallet ?? "",
      r.submitterWallet
        ? `${r.submitterWallet.slice(0, 6)}…${r.submitterWallet.slice(-4)}`
        : "",
      r.responseBlobId ?? "",
      shortHash(r.responseBlobId, 8),
      r.responseHash ?? "",
      shortHash(r.responseHash, 8),
      triage?.status ?? "new",
      (triage?.priority ?? "unranked").toUpperCase(),
      (triage?.tags ?? []).join("|"),
      String(triage?.notes.length ?? 0),
      r.sensitive ? "yes" : "no",
    ];

    const fieldRow = visibleFields.map((f) => {
      const v = r.publicFields[f.id];
      if (v === undefined || v === null || v === "") {
        return f.sensitive ? "[encrypted]" : "";
      }
      if (typeof v === "boolean") return v ? "true" : "false";
      if (Array.isArray(v)) return v.join("|");
      return String(v);
    });

    const media = r.media.map((m) => `${m.fieldId}:${m.blobId}`).join("|");
    return [...baseRow, ...fieldRow, media].map(csvEscape).join(",");
  });

  const lines = ["sep=,", headers.map(csvEscape).join(","), ...rows];
  // U+FEFF BOM tells Excel "this is UTF-8".
  return "﻿" + lines.join("\r\n");
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

/* -------------------------------------------------------------------------- */
/* XLSX export — styled headers, frozen top row, auto column widths, banded  */
/* rows. Powered by exceljs (dynamic import so it does not bloat the rest    */
/* of the bundle).                                                           */
/* -------------------------------------------------------------------------- */

export async function downloadXlsx(
  filename: string,
  schema: FormSchema,
  responses: FormResponse[],
  triages: Record<string, ResponseTriage | undefined>,
): Promise<void> {
  const { default: ExcelJS } = await import("exceljs");

  const visibleFields = schema.fields.filter(
    (f) => f.type !== "screenshot" && f.type !== "video",
  );
  const fieldLabels = uniqueLabels(
    visibleFields.map((f) => snakeLabel(f.label) || "field"),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "SignalVault";
  wb.created = new Date();

  const ws = wb.addWorksheet("Responses", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const columns = [
    { header: "Response ID", key: "response_id", width: 22 },
    { header: "Submitted at", key: "submitted_at", width: 20 },
    { header: "Submitter wallet", key: "submitter_wallet", width: 18 },
    { header: "Wallet (short)", key: "submitter_short", width: 16 },
    { header: "Response blob ID", key: "response_blob_id", width: 30 },
    { header: "Blob (short)", key: "blob_short", width: 16 },
    { header: "Response hash", key: "response_hash", width: 30 },
    { header: "Hash (short)", key: "hash_short", width: 16 },
    { header: "Status", key: "status", width: 12 },
    { header: "Priority", key: "priority", width: 10 },
    { header: "Tags", key: "tags", width: 16 },
    { header: "Notes", key: "note_count", width: 8 },
    { header: "Encrypted", key: "encrypted", width: 11 },
    ...fieldLabels.map((l, i) => ({
      header: visibleFields[i].label,
      key: `field_${i}`,
      width: Math.min(40, Math.max(14, visibleFields[i].label.length + 4)),
    })),
    { header: "Media blobs", key: "media_blob_ids", width: 24 },
  ];
  ws.columns = columns;

  // Header style — dark ink fill, white bold text, centered
  const header = ws.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0A0A0A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // Data rows
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    const triage = triages[r.responseId];

    const row: Record<string, unknown> = {
      response_id: r.responseId,
      submitted_at: new Date(r.submittedAt),
      submitter_wallet: r.submitterWallet ?? "",
      submitter_short: r.submitterWallet
        ? `${r.submitterWallet.slice(0, 6)}…${r.submitterWallet.slice(-4)}`
        : "",
      response_blob_id: r.responseBlobId ?? "",
      blob_short: shortHash(r.responseBlobId, 8),
      response_hash: r.responseHash ?? "",
      hash_short: shortHash(r.responseHash, 8),
      status: triage?.status ?? "new",
      priority: (triage?.priority ?? "unranked").toUpperCase(),
      tags: (triage?.tags ?? []).join(", "),
      note_count: triage?.notes.length ?? 0,
      encrypted: r.sensitive ? "yes" : "no",
      media_blob_ids: r.media.map((m) => `${m.fieldId}:${m.blobId}`).join(", "),
    };

    visibleFields.forEach((f, fi) => {
      const v = r.publicFields[f.id];
      let display: unknown = "";
      if (v === undefined || v === null || v === "") {
        display = f.sensitive ? "[encrypted]" : "";
      } else if (typeof v === "boolean") {
        display = v ? "true" : "false";
      } else if (Array.isArray(v)) {
        display = v.join(", ");
      } else {
        display = String(v);
      }
      row[`field_${fi}`] = display;
    });

    const added = ws.addRow(row);
    added.height = 18;

    // Banded rows + cell styling
    const banded = i % 2 === 1;
    added.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.alignment = { vertical: "middle", horizontal: "left", indent: 1, wrapText: false };
      cell.font = { name: "Calibri", size: 10.5 };
      if (banded) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF7F7F7" },
        };
      }
      const colKey = columns[colNumber - 1]?.key;
      if (colKey === "priority") {
        const p = String(row.priority);
        const color =
          p === "P0"
            ? "FFC53030"
            : p === "P1"
              ? "FFB7791F"
              : p === "P2"
                ? "FF5B8DEF"
                : p === "P3"
                  ? "FF6D6D6D"
                  : "FF9C9C9C";
        cell.font = { ...cell.font, bold: true, color: { argb: color } };
      }
      if (colKey === "encrypted" && row.encrypted === "yes") {
        cell.font = { ...cell.font, color: { argb: "FFC84A2C" }, bold: true };
      }
      if (colKey === "submitted_at") {
        cell.numFmt = "yyyy-mm-dd hh:mm";
      }
      if (
        colKey === "response_blob_id" ||
        colKey === "response_hash" ||
        colKey === "submitter_wallet"
      ) {
        cell.font = { ...cell.font, name: "Consolas", size: 10 };
      }
    });
  }

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
