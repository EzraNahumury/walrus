// AI form drafting endpoint backed by the ChainGPT Web3 LLM.
//
// The ChainGPT API key lives only on the server. The client posts a one-line
// brief, this route formats a structured prompt, streams the reply, and
// returns a parsed FormSchema-shaped JSON object the form builder can drop in.
//
// Note: this route handler is incompatible with `output: "export"` at build
// time. It works under `next dev` for local hackathon demos and on any
// non-static deploy (e.g. a Vercel preview mirror). Walrus Sites deploys
// should call this same endpoint via a small Cloudflare/Vercel proxy that
// forwards to ChainGPT.

import { NextResponse } from "next/server";

const CHAINGPT_URL = "https://api.chaingpt.org/chat/stream";
const MODEL = "general_assistant";

const FIELD_TYPES = [
  "rich_text",
  "short_text",
  "dropdown",
  "checkbox",
  "star_rating",
  "screenshot",
  "video",
  "url",
  "confirmation",
] as const;

const CATEGORIES = [
  "bug",
  "feature",
  "feedback",
  "survey",
  "application",
  "other",
] as const;

interface DraftRequest {
  brief?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.CHAINGPT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing CHAINGPT_API_KEY." },
      { status: 503 },
    );
  }

  let body: DraftRequest;
  try {
    body = (await req.json()) as DraftRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim();
  if (brief.length < 4) {
    return NextResponse.json(
      { error: "Brief must be at least 4 characters." },
      { status: 400 },
    );
  }
  if (brief.length > 600) {
    return NextResponse.json(
      { error: "Brief must be under 600 characters." },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(brief);

  let upstream: Response;
  try {
    upstream = await fetch(CHAINGPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        question: prompt,
        chatHistory: "off",
      }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Failed to reach ChainGPT.",
        detail: e instanceof Error ? e.message : "unknown",
      },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `ChainGPT returned ${upstream.status}.`, detail: text.slice(0, 400) },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const draft = extractFormDraft(text);

  if (!draft) {
    return NextResponse.json(
      {
        error: "Could not parse a form schema from the AI response.",
        raw: text.slice(0, 1200),
      },
      { status: 502 },
    );
  }

  const sanitized = sanitizeDraft(draft);
  return NextResponse.json({ draft: sanitized });
}

/* -------------------------------------------------------------------------- */
/* Prompt + parsing                                                           */
/* -------------------------------------------------------------------------- */

function buildPrompt(brief: string): string {
  // Tight prompt. NO JSON-Schema talk. Show the exact target shape inline.
  // Model is the conversational `general_assistant`, so we keep it short and
  // hammer JSON-only twice. Avoid the word "schema" so it does not return
  // JSON Schema syntax.
  return [
    "Return one JSON object. No prose. No markdown. No code fences.",
    "Begin with { and end with }.",
    "",
    "Required shape:",
    '{ "name": "...", "description": "...", "category": "...", "fields": [ ... ] }',
    "",
    `category must be one of: ${CATEGORIES.join(", ")}.`,
    "",
    "Each item in fields must look like:",
    '{ "type": "...", "label": "...", "required": true|false, "sensitive": true|false, "publicOnReceipt": true|false }',
    "",
    `type must be one of: ${FIELD_TYPES.join(", ")}.`,
    "",
    "Rules:",
    "- 3 to 7 fields.",
    "- Last field: type=confirmation, required=true.",
    "- Long answers (descriptions, narratives, contact info) → sensitive=true.",
    "- Short labels or dropdowns → sensitive=false.",
    "- publicOnReceipt=true only for short non-sensitive labels (titles, severity tier).",
    "- For dropdown or checkbox add options array with at least 2 items: each item is { \"value\": \"...\", \"label\": \"...\" }.",
    "- For star_rating add maxRating: 5.",
    "- Do not use screenshot or video unless the brief explicitly mentions images or videos.",
    "",
    `Brief: ${brief}`,
    "",
    "Output JSON object now.",
  ].join("\n");
}

interface RawDraft {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  fields?: unknown;
}

function extractFormDraft(text: string): RawDraft | null {
  // ChainGPT streaming responses are concatenated text chunks. The model
  // occasionally wraps in code fences or trailing tokens — be lenient.
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try direct parse first.
  const direct = safeJson(cleaned);
  if (direct) return direct;

  // Otherwise pull the first {...} block.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = cleaned.slice(start, end + 1);
    const parsed = safeJson(slice);
    if (parsed) return parsed;
  }
  return null;
}

function safeJson(s: string): RawDraft | null {
  try {
    const v = JSON.parse(s);
    if (v && typeof v === "object") return v as RawDraft;
  } catch {
    /* fallthrough */
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Sanitization — clamp to our supported shape                                */
/* -------------------------------------------------------------------------- */

interface SanitizedField {
  type: (typeof FIELD_TYPES)[number];
  label: string;
  description?: string;
  required: boolean;
  sensitive: boolean;
  publicOnReceipt: boolean;
  options?: { value: string; label: string }[];
  maxRating?: number;
}

interface SanitizedDraft {
  name: string;
  description: string;
  category: (typeof CATEGORIES)[number];
  fields: SanitizedField[];
}

function sanitizeDraft(d: RawDraft): SanitizedDraft {
  let dd = d as Record<string, unknown>;

  // ChainGPT sometimes returns a JSON-Schema (`{ type: "object",
  // properties: {...} }`). Convert to our { fields: [...] } shape.
  if (
    !Array.isArray(dd.fields) &&
    dd.type === "object" &&
    dd.properties &&
    typeof dd.properties === "object"
  ) {
    const props = dd.properties as Record<string, Record<string, unknown>>;
    const required = Array.isArray(dd.required) ? (dd.required as string[]) : [];
    const fields = Object.entries(props).map(([key, val]) => ({
      type: val.type ?? "short_text",
      label: typeof val.title === "string" ? val.title : prettyKey(key),
      description: typeof val.description === "string" ? val.description : undefined,
      required: required.includes(key) || val.required === true,
      sensitive:
        val.sensitive === true || /sensitive|private|secret/i.test(key),
      publicOnReceipt: false,
      options: Array.isArray(val.enum)
        ? (val.enum as unknown[])
            .filter((x): x is string => typeof x === "string")
            .map((s) => ({ value: s, label: s }))
        : undefined,
    }));
    dd = {
      name: dd.name ?? dd.title ?? "Untitled form",
      description: dd.description ?? "",
      category: dd.category,
      fields,
    };
  }

  // ChainGPT often uses `formTitle`, `title`, `formName`, etc.
  const nameRaw = pickString(dd.name, dd.formTitle, dd.formName, dd.title);
  const name = nameRaw && nameRaw.length > 0 ? nameRaw.slice(0, 80) : "Untitled form";

  const descriptionRaw = pickString(
    dd.description,
    dd.formDescription,
    dd.subtitle,
    dd.summary,
  );
  const description = descriptionRaw ? descriptionRaw.slice(0, 400) : "";

  const category =
    typeof dd.category === "string" &&
    (CATEGORIES as readonly string[]).includes(dd.category)
      ? (dd.category as (typeof CATEGORIES)[number])
      : guessCategory(name + " " + description);

  const rawFields = Array.isArray(dd.fields) ? dd.fields : [];
  const fields: SanitizedField[] = [];
  for (const f of rawFields.slice(0, 8)) {
    const sf = sanitizeField(f);
    if (sf) fields.push(sf);
  }
  // Ensure last field is a confirmation.
  if (
    fields.length > 0 &&
    fields[fields.length - 1].type !== "confirmation"
  ) {
    fields.push({
      type: "confirmation",
      label: "I confirm this submission is accurate",
      required: true,
      sensitive: false,
      publicOnReceipt: false,
    });
  }
  if (fields.length === 0) {
    fields.push(
      {
        type: "rich_text",
        label: "Tell us more",
        required: true,
        sensitive: true,
        publicOnReceipt: false,
      },
      {
        type: "confirmation",
        label: "I confirm this submission is accurate",
        required: true,
        sensitive: false,
        publicOnReceipt: false,
      },
    );
  }
  return { name, description, category, fields };
}

function pickString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

function prettyKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function guessCategory(text: string): (typeof CATEGORIES)[number] {
  const t = text.toLowerCase();
  if (/bug|defect|crash|incident|issue|error/.test(t)) return "bug";
  if (/feature|request|idea|wish/.test(t)) return "feature";
  if (/grant|application|apply|funding|proposal/.test(t)) return "application";
  if (/survey|poll|nps|csat/.test(t)) return "survey";
  if (/feedback|review|opinion|rating/.test(t)) return "feedback";
  return "other";
}

const TYPE_ALIASES: Record<string, (typeof FIELD_TYPES)[number]> = {
  text: "short_text",
  string: "short_text",
  short_text: "short_text",
  short: "short_text",
  email: "short_text",
  phone: "short_text",
  number: "short_text",
  numeric: "short_text",
  integer: "short_text",
  textarea: "rich_text",
  paragraph: "rich_text",
  long_text: "rich_text",
  rich_text: "rich_text",
  description: "rich_text",
  dropdown: "dropdown",
  select: "dropdown",
  radio: "dropdown",
  multiselect: "checkbox",
  multi_select: "checkbox",
  checkbox: "checkbox",
  checkboxes: "checkbox",
  checklist: "checkbox",
  star: "star_rating",
  star_rating: "star_rating",
  rating: "star_rating",
  stars: "star_rating",
  url: "url",
  link: "url",
  website: "url",
  image: "screenshot",
  screenshot: "screenshot",
  file: "screenshot",
  upload: "screenshot",
  video: "video",
  confirm: "confirmation",
  confirmation: "confirmation",
  agreement: "confirmation",
  consent: "confirmation",
  terms: "confirmation",
};

function resolveType(input: unknown): (typeof FIELD_TYPES)[number] | null {
  if (typeof input !== "string") return null;
  const key = input.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if ((FIELD_TYPES as readonly string[]).includes(key)) {
    return key as (typeof FIELD_TYPES)[number];
  }
  return TYPE_ALIASES[key] ?? null;
}

function sanitizeField(raw: unknown): SanitizedField | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;

  let type =
    resolveType(f.type) ?? resolveType(f.fieldType) ?? resolveType(f.kind);

  // Heuristic: if label hints at a confirmation, force confirmation.
  const labelRaw = pickString(f.label, f.title, f.name, f.question, f.text);
  const lowerLabel = (labelRaw ?? "").toLowerCase();
  if (
    !type &&
    /(\bi confirm\b|i agree|i accept|consent|terms)/.test(lowerLabel)
  ) {
    type = "confirmation";
  }
  if (!type) return null;

  const label = labelRaw ? labelRaw.slice(0, 120) : "Untitled field";
  const description = pickString(f.description, f.helpText, f.placeholder)?.slice(
    0,
    200,
  );
  const required = f.required === true || f.required === "true";

  // Be lenient on the privacy fields. ChainGPT often uses "sensitivity":
  // "low" / "medium" / "high", or omits the field entirely. Treat any
  // medium/high or `private`/`pii` hint as sensitive.
  let sensitive = f.sensitive === true || f.sensitive === "true";
  const sensVal = (f.sensitivity ?? f.privacy ?? "") as unknown;
  if (typeof sensVal === "string") {
    const s = sensVal.toLowerCase();
    if (s === "high" || s === "medium" || s === "private" || s === "pii") {
      sensitive = true;
    }
  }
  // Free-text answers default to sensitive when unspecified.
  if (!("sensitive" in f) && (type === "rich_text" || type === "short_text")) {
    if (/(detail|describe|explain|story|why|how|reason|notes?|impact|use of)/i.test(label)) {
      sensitive = true;
    }
  }

  const publicOnReceipt =
    (f.publicOnReceipt === true || f.publicOnReceipt === "true") && !sensitive;

  const out: SanitizedField = {
    type,
    label,
    description,
    required,
    sensitive,
    publicOnReceipt,
  };

  if (type === "dropdown" || type === "checkbox") {
    const opts = Array.isArray(f.options) ? f.options : [];
    const cleaned: { value: string; label: string }[] = [];
    for (const o of opts.slice(0, 8)) {
      // Accept either string options ("Yes") or object options.
      let lbl: string | null = null;
      let val: string | null = null;
      if (typeof o === "string" && o.trim().length > 0) {
        lbl = o.trim().slice(0, 60);
      } else if (o && typeof o === "object") {
        const oo = o as Record<string, unknown>;
        lbl = typeof oo.label === "string" && oo.label.trim().length > 0
          ? oo.label.trim().slice(0, 60)
          : typeof oo.value === "string" && oo.value.trim().length > 0
            ? oo.value.trim().slice(0, 60)
            : null;
        val = typeof oo.value === "string" && oo.value.trim().length > 0
          ? oo.value.trim()
          : null;
      }
      if (!lbl) continue;
      if (!val) {
        val = lbl.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      }
      if (val.length === 0) val = `opt_${cleaned.length + 1}`;
      cleaned.push({ value: val, label: lbl });
    }
    if (cleaned.length === 0) {
      cleaned.push(
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      );
    }
    out.options = cleaned;
  }

  if (type === "star_rating") {
    const r = Number(f.maxRating ?? f.scale ?? f.max);
    out.maxRating = Number.isFinite(r) && r >= 3 && r <= 10 ? Math.round(r) : 5;
  }

  return out;
}
