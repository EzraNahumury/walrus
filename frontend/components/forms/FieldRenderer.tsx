"use client";

import { ImagePlus, Lock, Video } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StarRating } from "@/components/forms/StarRating";
import type { FormField } from "@/types/signalvault";

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (next: unknown) => void;
  onFile?: (file: File) => void;
  attached?: { name: string; sizeBytes: number; mime: string };
  invalid?: boolean;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  onFile,
  attached,
  invalid,
}: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[color:var(--color-ink-900)]">
          {field.label}
          {field.required ? (
            <span className="text-[color:var(--color-signal-danger)] ml-0.5">*</span>
          ) : null}
        </label>
        {field.sensitive ? (
          <span className="inline-flex items-center gap-1 text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-accent)]">
            <Lock className="h-3 w-3" /> Encrypted
          </span>
        ) : null}
      </div>
      {field.description ? (
        <p className="text-xs text-[color:var(--color-ink-500)]">{field.description}</p>
      ) : null}
      {renderControl(field, value, onChange, onFile, attached, invalid)}
    </div>
  );
}

function renderControl(
  field: FormField,
  value: unknown,
  onChange: (v: unknown) => void,
  onFile?: (file: File) => void,
  attached?: { name: string; sizeBytes: number; mime: string },
  invalid?: boolean,
) {
  switch (field.type) {
    case "short_text":
    case "url":
      return (
        <Input
          type={field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          invalid={invalid}
        />
      );
    case "rich_text":
      return (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={field.placeholder}
          invalid={invalid}
        />
      );
    case "dropdown":
      return (
        <Select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          {(field.options ?? []).map((opt) => {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            const checked = arr.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-3 text-sm text-[color:var(--color-ink-900)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(arr);
                    if (e.target.checked) next.add(opt.value);
                    else next.delete(opt.value);
                    onChange([...next]);
                  }}
                  className="h-4 w-4 rounded border-[color:var(--color-ink-300)] text-[color:var(--color-ink-900)] focus:ring-[color:var(--color-ink-200)]"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    case "star_rating":
      return (
        <StarRating
          value={typeof value === "number" ? value : 0}
          onChange={(v) => onChange(v)}
          max={field.maxRating ?? 5}
        />
      );
    case "confirmation":
      return (
        <label className="flex items-center gap-3 text-sm text-[color:var(--color-ink-900)] cursor-pointer">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-[color:var(--color-ink-300)] text-[color:var(--color-ink-900)] focus:ring-[color:var(--color-ink-200)]"
          />
          <span>I confirm</span>
        </label>
      );
    case "screenshot":
    case "video":
      return (
        <FileDrop
          field={field}
          onFile={onFile}
          attached={attached}
          invalid={invalid}
        />
      );
  }
}

function FileDrop({
  field,
  onFile,
  attached,
  invalid,
}: {
  field: FormField;
  onFile?: (file: File) => void;
  attached?: { name: string; sizeBytes: number; mime: string };
  invalid?: boolean;
}) {
  const accept = field.type === "screenshot" ? "image/*" : "video/*";
  const Icon = field.type === "screenshot" ? ImagePlus : Video;
  return (
    <label
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-7 px-4 text-center cursor-pointer transition ${
        invalid
          ? "border-[color:var(--color-signal-danger)] bg-[color:var(--color-signal-danger)]/5"
          : "border-[color:var(--color-ink-300)] bg-[color:var(--color-bg-soft)] hover:border-[color:var(--color-ink-500)] hover:bg-[color:var(--color-bg-2)]"
      }`}
    >
      <Icon className="h-5 w-5 text-[color:var(--color-ink-500)]" />
      {attached ? (
        <div className="text-sm text-[color:var(--color-ink-900)]">
          {attached.name}{" "}
          <span className="text-[color:var(--color-ink-500)]">
            ({Math.round(attached.sizeBytes / 1024)} KB)
          </span>
        </div>
      ) : (
        <div className="text-sm text-[color:var(--color-ink-600)]">
          Click to attach{" "}
          <span className="text-[color:var(--color-ink-900)]">
            {field.type === "screenshot" ? "an image" : "a video"}
          </span>{" "}
          (max {field.maxFileSizeMB ?? 10}MB)
        </div>
      )}
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onFile) onFile(f);
        }}
      />
    </label>
  );
}
