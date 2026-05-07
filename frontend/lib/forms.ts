// Form schema authoring + validation helpers.

import { nanoid } from "nanoid";

import type {
  FieldType,
  FormCategory,
  FormField,
  FormResponse,
  FormSchema,
} from "@/types/signalvault";

const DEFAULT_FIELD_LABEL: Record<FieldType, string> = {
  rich_text: "Tell us more",
  short_text: "Your answer",
  dropdown: "Pick one",
  checkbox: "Select all that apply",
  star_rating: "How would you rate this?",
  screenshot: "Attach a screenshot",
  video: "Attach a short video",
  url: "Link",
  confirmation: "I confirm the above is accurate",
};

export function newField(type: FieldType): FormField {
  const id = nanoid(8);
  const base: FormField = {
    id,
    type,
    label: DEFAULT_FIELD_LABEL[type],
    required: false,
    sensitive: false,
    publicOnReceipt: false,
  };
  if (type === "dropdown") {
    base.options = [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ];
  }
  if (type === "checkbox") {
    base.options = [
      { value: "opt1", label: "Option 1" },
      { value: "opt2", label: "Option 2" },
    ];
  }
  if (type === "star_rating") base.maxRating = 5;
  if (type === "screenshot") base.maxFileSizeMB = 10;
  if (type === "video") base.maxFileSizeMB = 50;
  return base;
}

export function newSchema(creatorWallet: string): FormSchema {
  const now = Date.now();
  return {
    formId: `frm_${nanoid(10)}`,
    version: 1,
    name: "Untitled form",
    description: "",
    category: "feedback",
    creatorWallet,
    adminWallets: [],
    fields: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  rich_text: "Long answer",
  short_text: "Short answer",
  dropdown: "Dropdown",
  checkbox: "Checkboxes",
  star_rating: "Star rating",
  screenshot: "Screenshot upload",
  video: "Video upload",
  url: "URL",
  confirmation: "Confirmation",
};

export const CATEGORY_LABEL: Record<FormCategory, string> = {
  bug: "Bug report",
  feature: "Feature request",
  feedback: "Product feedback",
  survey: "Survey",
  application: "Application",
  other: "Other",
};

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
}

export function validateResponse(
  schema: FormSchema,
  values: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const field of schema.fields) {
    const v = values[field.id];
    if (field.required) {
      const empty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0) ||
        (field.type === "confirmation" && v !== true);
      if (empty) errors[field.id] = "Required";
    }
    if (field.type === "url" && typeof v === "string" && v.length > 0) {
      try {
        new URL(v);
      } catch {
        errors[field.id] = "Must be a valid URL";
      }
    }
    if (
      field.type === "star_rating" &&
      typeof v === "number" &&
      field.maxRating !== undefined &&
      (v < 0 || v > field.maxRating)
    ) {
      errors[field.id] = "Out of range";
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/** Split form values into the public + sensitive halves before encryption. */
export function splitResponse(
  schema: FormSchema,
  values: Record<string, unknown>,
): { publicFields: Record<string, unknown>; sensitiveFields: Record<string, unknown> } {
  const publicFields: Record<string, unknown> = {};
  const sensitiveFields: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const v = values[field.id];
    if (v === undefined || v === null) continue;
    // Files (screenshot/video) are uploaded separately and live as MediaRefs.
    if (field.type === "screenshot" || field.type === "video") continue;
    if (field.sensitive) sensitiveFields[field.id] = v;
    else publicFields[field.id] = v;
  }
  return { publicFields, sensitiveFields };
}

export function fieldLabelFor(schema: FormSchema, fieldId: string): string {
  return schema.fields.find((f) => f.id === fieldId)?.label ?? fieldId;
}

/** Build a content-hash placeholder for a response envelope. */
export async function hashResponse(response: FormResponse): Promise<string> {
  const json = JSON.stringify({
    formId: response.formId,
    submittedAt: response.submittedAt,
    publicFields: response.publicFields,
    sensitive: response.sensitive,
    media: response.media,
  });
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(json),
    );
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "0".repeat(64);
}
