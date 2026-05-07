// Single source of demo persistence: forms, responses, triages, receipts.
// All operations remain pure-client so the static export stays static.
// In production these reads would resolve to Walrus blob fetches keyed off
// FormPolicy object IDs.

import { nanoid } from "nanoid";

import * as storage from "@/lib/storage";
import type {
  AdminNote,
  FeedbackReceipt,
  FormResponse,
  FormSchema,
  ResponsePriority,
  ResponseStatus,
  ResponseTriage,
} from "@/types/signalvault";

const KEY_FORMS = "forms";
const KEY_RESPONSES = "responses";
const KEY_TRIAGES = "triages";
const KEY_RECEIPTS = "receipts";

export function listForms(): FormSchema[] {
  return storage.read<FormSchema[]>(KEY_FORMS, []);
}

export function getForm(formId: string): FormSchema | undefined {
  return listForms().find((f) => f.formId === formId);
}

export function saveForm(schema: FormSchema): void {
  const all = listForms();
  const idx = all.findIndex((f) => f.formId === schema.formId);
  if (idx >= 0) all[idx] = schema;
  else all.unshift(schema);
  storage.write(KEY_FORMS, all);
}

export function deleteForm(formId: string): void {
  storage.write(
    KEY_FORMS,
    listForms().filter((f) => f.formId !== formId),
  );
}

export function listResponses(formId?: string): FormResponse[] {
  const all = storage.read<FormResponse[]>(KEY_RESPONSES, []);
  return formId ? all.filter((r) => r.formId === formId) : all;
}

export function getResponse(responseId: string): FormResponse | undefined {
  return listResponses().find((r) => r.responseId === responseId);
}

export function saveResponse(response: FormResponse): void {
  const all = storage.read<FormResponse[]>(KEY_RESPONSES, []);
  const idx = all.findIndex((r) => r.responseId === response.responseId);
  if (idx >= 0) all[idx] = response;
  else all.unshift(response);
  storage.write(KEY_RESPONSES, all);
}

export function listTriages(): Record<string, ResponseTriage> {
  const arr = storage.read<ResponseTriage[]>(KEY_TRIAGES, []);
  const map: Record<string, ResponseTriage> = {};
  for (const t of arr) map[t.responseId] = t;
  return map;
}

export function getTriage(responseId: string): ResponseTriage {
  const map = listTriages();
  return (
    map[responseId] ?? {
      responseId,
      status: "new",
      priority: "unranked",
      tags: [],
      notes: [],
      updatedAt: Date.now(),
    }
  );
}

export function saveTriage(triage: ResponseTriage): void {
  const arr = storage.read<ResponseTriage[]>(KEY_TRIAGES, []);
  const idx = arr.findIndex((t) => t.responseId === triage.responseId);
  const updated = { ...triage, updatedAt: Date.now() };
  if (idx >= 0) arr[idx] = updated;
  else arr.unshift(updated);
  storage.write(KEY_TRIAGES, arr);
}

export function setPriority(responseId: string, priority: ResponsePriority): ResponseTriage {
  const t = getTriage(responseId);
  const next = { ...t, priority };
  saveTriage(next);
  return next;
}

export function setStatus(responseId: string, status: ResponseStatus): ResponseTriage {
  const t = getTriage(responseId);
  const next = { ...t, status };
  saveTriage(next);
  return next;
}

export function addTag(responseId: string, tag: string): ResponseTriage {
  const t = getTriage(responseId);
  if (t.tags.includes(tag)) return t;
  const next = { ...t, tags: [...t.tags, tag] };
  saveTriage(next);
  return next;
}

export function removeTag(responseId: string, tag: string): ResponseTriage {
  const t = getTriage(responseId);
  const next = { ...t, tags: t.tags.filter((x) => x !== tag) };
  saveTriage(next);
  return next;
}

export function addNote(
  responseId: string,
  authorWallet: string,
  body: string,
): ResponseTriage {
  const t = getTriage(responseId);
  const note: AdminNote = {
    noteId: `note_${nanoid(8)}`,
    responseId,
    authorWallet,
    body,
    createdAt: Date.now(),
  };
  const next = { ...t, notes: [...t.notes, note] };
  saveTriage(next);
  return next;
}

export function listReceipts(): FeedbackReceipt[] {
  return storage.read<FeedbackReceipt[]>(KEY_RECEIPTS, []);
}

export function getReceipt(receiptId: string): FeedbackReceipt | undefined {
  return listReceipts().find((r) => r.receiptId === receiptId);
}

export function saveReceipt(receipt: FeedbackReceipt): void {
  const all = listReceipts();
  const idx = all.findIndex((r) => r.receiptId === receipt.receiptId);
  if (idx >= 0) all[idx] = receipt;
  else all.unshift(receipt);
  storage.write(KEY_RECEIPTS, all);
}
