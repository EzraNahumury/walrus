"use client";

import {
  CheckSquare,
  CircleCheck,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ListChecks,
  Star,
  Type,
  Video,
} from "lucide-react";

import { FIELD_TYPE_LABEL } from "@/lib/forms";
import type { FieldType } from "@/types/signalvault";

const ICONS: Record<FieldType, typeof Type> = {
  short_text: Type,
  rich_text: FileText,
  dropdown: ListChecks,
  checkbox: CheckSquare,
  star_rating: Star,
  screenshot: ImageIcon,
  video: Video,
  url: LinkIcon,
  confirmation: CircleCheck,
};

const ORDER: FieldType[] = [
  "short_text",
  "rich_text",
  "dropdown",
  "checkbox",
  "star_rating",
  "url",
  "screenshot",
  "video",
  "confirmation",
];

const DESCRIPTIONS: Record<FieldType, string> = {
  short_text: "Single line",
  rich_text: "Multi-line / paragraph",
  dropdown: "One choice from a list",
  checkbox: "Multiple choices",
  star_rating: "1–N stars",
  screenshot: "Image upload",
  video: "Short video upload",
  url: "Link with validation",
  confirmation: "Yes / agree checkbox",
};

export function FieldTypePicker({ onPick }: { onPick: (type: FieldType) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ORDER.map((type) => {
        const Icon = ICONS[type];
        return (
          <button
            type="button"
            key={type}
            onClick={() => onPick(type)}
            className="flex items-center gap-3 rounded-lg border border-[color:var(--color-line)] bg-white px-3 py-2.5 text-sm text-[color:var(--color-ink-900)] transition hover:border-[color:var(--color-ink-400)] hover:bg-[color:var(--color-bg-soft)]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--color-bg-soft)] text-[color:var(--color-ink-700)] border border-[color:var(--color-line)]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex flex-col items-start text-left">
              <span className="leading-none">{FIELD_TYPE_LABEL[type]}</span>
              <span className="text-[11px] text-[color:var(--color-ink-500)] mt-0.5">
                {DESCRIPTIONS[type]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
