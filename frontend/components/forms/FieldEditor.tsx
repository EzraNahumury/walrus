"use client";

import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { FIELD_TYPE_LABEL } from "@/lib/forms";
import type { FormField, FormFieldOption } from "@/types/signalvault";

interface FieldEditorProps {
  field: FormField;
  onChange: (next: FormField) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function FieldEditor({
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: FieldEditorProps) {
  const update = (patch: Partial<FormField>) => onChange({ ...field, ...patch });

  const updateOption = (idx: number, patch: Partial<FormFieldOption>) => {
    const opts = [...(field.options ?? [])];
    opts[idx] = { ...opts[idx], ...patch };
    update({ options: opts });
  };

  const addOption = () => {
    const opts = [...(field.options ?? [])];
    const n = opts.length + 1;
    opts.push({ value: `opt${n}`, label: `Option ${n}` });
    update({ options: opts });
  };

  const removeOption = (idx: number) => {
    const opts = [...(field.options ?? [])];
    opts.splice(idx, 1);
    update({ options: opts });
  };

  return (
    <div className="rounded-xl border border-[color:var(--color-line)] bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1.5 text-[color:var(--color-ink-400)]">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="hover:text-[color:var(--color-ink-900)] disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <GripVertical className="h-4 w-4" />
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="hover:text-[color:var(--color-ink-900)] disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <Badge tone="muted">{FIELD_TYPE_LABEL[field.type]}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label="Remove field"
              className="text-[color:var(--color-ink-500)] hover:text-[color:var(--color-signal-danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Label</span>
              <Input
                value={field.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="What should we ask?"
              />
            </label>
            <label className="block">
              <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">
                Helper text <span className="text-[color:var(--color-ink-400)]">(optional)</span>
              </span>
              <Input
                value={field.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Shown below the field"
              />
            </label>
          </div>

          {(field.type === "dropdown" || field.type === "checkbox") && (
            <div className="space-y-2">
              <span className="text-xs text-[color:var(--color-ink-500)]">Options</span>
              {(field.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt.label}
                    onChange={(e) =>
                      updateOption(idx, {
                        label: e.target.value,
                        value: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/[^a-z0-9_]/g, ""),
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(idx)}
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                Add option
              </Button>
            </div>
          )}

          {field.type === "star_rating" && (
            <label className="block max-w-[160px]">
              <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Max stars</span>
              <Input
                type="number"
                min={3}
                max={10}
                value={field.maxRating ?? 5}
                onChange={(e) =>
                  update({ maxRating: Number(e.target.value) || 5 })
                }
              />
            </label>
          )}

          {(field.type === "screenshot" || field.type === "video") && (
            <label className="block max-w-[200px]">
              <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">
                Max file size (MB)
              </span>
              <Input
                type="number"
                min={1}
                max={500}
                value={field.maxFileSizeMB ?? 10}
                onChange={(e) =>
                  update({ maxFileSizeMB: Number(e.target.value) || 10 })
                }
              />
            </label>
          )}

          <div className="grid gap-3 md:grid-cols-3 pt-1">
            <Toggle
              checked={field.required}
              onChange={(v) => update({ required: v })}
              label="Required"
              description="Block submit if empty"
            />
            <Toggle
              checked={field.sensitive}
              onChange={(v) => update({ sensitive: v })}
              label="Sensitive (Seal)"
              description="Encrypt this value before upload"
            />
            <Toggle
              checked={field.publicOnReceipt}
              onChange={(v) => update({ publicOnReceipt: v })}
              label="Show on receipt"
              description="Visible on the public proof page"
              disabled={field.sensitive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
