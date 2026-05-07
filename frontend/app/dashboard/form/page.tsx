"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Download,
  FileSearch,
  Filter,
  Lock,
  MessageSquarePlus,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { InsightPanel } from "@/components/dashboard/InsightPanel";
import { PriorityBadge } from "@/components/dashboard/PriorityBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { BlobLink } from "@/components/receipt/BlobLink";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  addNote,
  addTag,
  getForm,
  getTriage,
  listResponses,
  listTriages,
  removeTag,
  saveForm,
  saveResponse,
  setPriority,
  setStatus,
} from "@/lib/demo-store";
import {
  useOnChainForms,
  useOnChainResponses,
} from "@/lib/hooks/useOnChainForms";
import { buildCsv, downloadCsv } from "@/lib/export";
import { CATEGORY_LABEL, fieldLabelFor } from "@/lib/forms";
import { generateInsight } from "@/lib/insights";
import { decryptSensitive } from "@/lib/seal";
import { shortAddr } from "@/lib/sui";
import { toast } from "@/lib/toast";
import type {
  FormResponse,
  FormSchema,
  ResponsePriority,
  ResponseStatus,
} from "@/types/signalvault";

const PRIORITY_ORDER: ResponsePriority[] = ["p0", "p1", "p2", "p3", "unranked"];
const STATUS_ORDER: ResponseStatus[] = ["new", "reviewing", "triaged", "shipped", "wontfix"];

export default function FormDashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[color:var(--color-ink-500)]">Loading…</div>}>
      <FormDashboardInner />
    </Suspense>
  );
}

function FormDashboardInner() {
  const search = useSearchParams();
  const router = useRouter();
  const formId = search.get("id");
  const account = useCurrentAccount();
  const wallet =
    account?.address ?? "0xdemo000000000000000000000000000000000000000000000000000000000000";

  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [tick, setTick] = useState(0);
  const [search_, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<ResponsePriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ResponseStatus | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, Record<string, unknown>>>({});

  const onchainForms = useOnChainForms();

  useEffect(() => {
    if (!formId) return;
    let s = getForm(formId);
    if (!s) {
      // Fallback: try resolving from on-chain hydration when arriving directly.
      const hit = onchainForms.forms.find((f) => f.formId === formId);
      if (hit) {
        saveForm(hit);
        s = hit;
      }
    }
    if (s) {
      setSchema(s);
      setResponses(listResponses(formId));
    }
  }, [formId, tick, onchainForms.forms]);

  const onchainRes = useOnChainResponses(schema?.policyObjectId, schema?.formId);

  // Persist hydrated on-chain responses to the local store so the rest of the
  // page (triage, decrypt, export) keeps working uniformly.
  useEffect(() => {
    if (!schema || onchainRes.responses.length === 0) return;
    let added = false;
    for (const r of onchainRes.responses) {
      const existing = listResponses(schema.formId).find(
        (x) => x.responseBlobId === r.responseBlobId,
      );
      if (!existing) {
        saveResponse(r);
        added = true;
      }
    }
    if (added) {
      setResponses(listResponses(schema.formId));
    }
  }, [schema, onchainRes.responses]);

  const triages = useMemo(() => listTriages(), [tick]);

  const filtered = useMemo(() => {
    let arr = [...responses];
    if (filterPriority !== "all") {
      arr = arr.filter(
        (r) => (triages[r.responseId]?.priority ?? "unranked") === filterPriority,
      );
    }
    if (filterStatus !== "all") {
      arr = arr.filter(
        (r) => (triages[r.responseId]?.status ?? "new") === filterStatus,
      );
    }
    if (search_.trim().length > 0) {
      const needle = search_.toLowerCase();
      arr = arr.filter((r) => {
        const text = JSON.stringify(r.publicFields).toLowerCase();
        return text.includes(needle);
      });
    }
    arr.sort((a, b) => b.submittedAt - a.submittedAt);
    return arr;
  }, [responses, triages, filterPriority, filterStatus, search_]);

  const insight = useMemo(() => {
    if (!schema) return null;
    return generateInsight(schema, responses, triages);
  }, [schema, responses, triages]);

  const active = filtered.find((r) => r.responseId === activeId) ?? filtered[0];

  if (!formId) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<FileSearch className="h-4 w-4" />}
          title="No form selected"
          body="Pick a form from the dashboard to view its responses."
          action={
            <PillButton href="/dashboard" size="md">Open dashboard</PillButton>
          }
        />
      </Container>
    );
  }

  if (!schema) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<FileSearch className="h-4 w-4" />}
          title="Form not found"
          body="In demo mode, forms live in this browser. Try creating one or opening the dashboard."
        />
      </Container>
    );
  }

  const onDecrypt = async (r: FormResponse) => {
    if (!r.sensitive) return;
    try {
      const plain = await decryptSensitive(r.sensitive);
      setDecrypted((d) => ({ ...d, [r.responseId]: plain }));
      toast.success("Sensitive fields decrypted");
    } catch (e) {
      toast.error(
        "Decrypt failed",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  };

  const onExport = () => {
    const enriched = filtered.map((r) => {
      if (!r.sensitive) return r;
      const plain = decrypted[r.responseId];
      if (!plain) return r;
      return { ...r, publicFields: { ...r.publicFields, ...plain } };
    });
    const csv = buildCsv(schema, enriched, triages);
    const safe = schema.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    downloadCsv(`${safe}_${Date.now()}.csv`, csv);
  };

  return (
    <Container className="py-12">
      <Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)] inline-flex items-center gap-1"
            >
              ← Back to dashboard
            </Link>
            <h1 className="mt-3 text-[36px] md:text-[44px] leading-[1.05] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              {schema.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge tone="muted">{CATEGORY_LABEL[schema.category]}</Badge>
              {schema.policyObjectId ? (
                <span className="text-[11px] text-[color:var(--color-ink-500)] font-mono truncate">
                  policy {schema.policyObjectId.slice(0, 22)}…
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <PillButton href={`/form?id=${schema.formId}`} size="sm">
              Open public form
            </PillButton>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <Reveal>
            <FilterBar
              search={search_}
              onSearch={setSearch}
              priority={filterPriority}
              onPriority={setFilterPriority}
              status={filterStatus}
              onStatus={setFilterStatus}
            />
          </Reveal>
          {filtered.length === 0 ? (
            <EmptyState
              title="No responses match your filters"
              body="Loosen the filters to see more, or share the form link with your community."
            />
          ) : (
            <Reveal delay={80}>
              <div className="rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] bg-[color:var(--color-bg-soft)] border-b border-[color:var(--color-line)]">
                  <div className="col-span-5">Summary</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-3">Submitted</div>
                </div>
                <ul>
                  {filtered.map((r) => {
                    const t = triages[r.responseId] ?? {
                      priority: "unranked" as ResponsePriority,
                      status: "new" as ResponseStatus,
                    };
                    const isActive = (active?.responseId ?? null) === r.responseId;
                    return (
                      <li
                        key={r.responseId}
                        onClick={() => setActiveId(r.responseId)}
                        className={`grid grid-cols-12 px-4 py-3 cursor-pointer border-b border-[color:var(--color-line)] last:border-0 transition ${
                          isActive ? "bg-[color:var(--color-bg-soft)]" : "hover:bg-[color:var(--color-bg-soft)]/60"
                        }`}
                      >
                        <div className="col-span-5 min-w-0">
                          <div className="text-sm text-[color:var(--color-ink-900)] truncate">
                            {summarizeResponse(schema, r)}
                          </div>
                          <div className="text-[11px] text-[color:var(--color-ink-500)] mt-0.5 inline-flex items-center gap-2">
                            {r.sensitive ? (
                              <span className="inline-flex items-center gap-1 text-[color:var(--color-accent)]">
                                <Lock className="h-3 w-3" /> Sealed
                              </span>
                            ) : (
                              <span>Public</span>
                            )}
                            {r.responseBlobId ? (
                              <span className="font-mono truncate max-w-[160px]">
                                {r.responseBlobId.slice(0, 24)}…
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="col-span-2 self-center">
                          <StatusBadge value={t.status} />
                        </div>
                        <div className="col-span-2 self-center">
                          <PriorityBadge value={t.priority} />
                        </div>
                        <div className="col-span-3 self-center text-[12px] text-[color:var(--color-ink-500)]">
                          {new Date(r.submittedAt).toLocaleString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          )}

          {insight ? (
            <Reveal delay={120}>
              <InsightPanel insight={insight} />
            </Reveal>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          {active ? (
            <Reveal delay={140}>
              <ResponseDetail
                schema={schema}
                response={active}
                decrypted={decrypted[active.responseId]}
                onDecrypt={() => onDecrypt(active)}
                wallet={wallet}
                onMutate={() => setTick((t) => t + 1)}
              />
            </Reveal>
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-[color:var(--color-ink-500)]">
                  Select a response to view, decrypt, annotate, and prioritize it.
                </p>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </Container>
  );
}

function FilterBar({
  search,
  onSearch,
  priority,
  onPriority,
  status,
  onStatus,
}: {
  search: string;
  onSearch: (s: string) => void;
  priority: ResponsePriority | "all";
  onPriority: (p: ResponsePriority | "all") => void;
  status: ResponseStatus | "all";
  onStatus: (s: ResponseStatus | "all") => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] items-center">
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--color-ink-400)]" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search public fields…"
          className="pl-9"
        />
      </div>
      <Select value={priority} onChange={(e) => onPriority(e.target.value as ResponsePriority | "all")}>
        <option value="all">All priorities</option>
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>
            {p.toUpperCase()}
          </option>
        ))}
      </Select>
      <Select value={status} onChange={(e) => onStatus(e.target.value as ResponseStatus | "all")}>
        <option value="all">All statuses</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
    </div>
  );
}

function ResponseDetail({
  schema,
  response,
  decrypted,
  onDecrypt,
  wallet,
  onMutate,
}: {
  schema: FormSchema;
  response: FormResponse;
  decrypted?: Record<string, unknown>;
  onDecrypt: () => void;
  wallet: string;
  onMutate: () => void;
}) {
  const triage = getTriage(response.responseId);
  const [tagDraft, setTagDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
              Response {response.responseId.slice(0, 16)}
            </div>
            <div className="mt-0.5 text-[12px] text-[color:var(--color-ink-500)]">
              {new Date(response.submittedAt).toLocaleString()} ·{" "}
              {response.submitterWallet ? shortAddr(response.submitterWallet) : "anonymous"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <PriorityBadge value={triage.priority} />
            <StatusBadge value={triage.status} />
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="space-y-3">
          {schema.fields
            .filter((f) => f.type !== "screenshot" && f.type !== "video")
            .map((f) => {
              const v = f.sensitive ? decrypted?.[f.id] : response.publicFields[f.id];
              const sealed = f.sensitive && !decrypted;
              return (
                <div
                  key={f.id}
                  className="border-b border-[color:var(--color-line)] pb-2 last:border-0"
                >
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
                    {f.label}
                    {f.sensitive ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-[color:var(--color-accent)] normal-case tracking-normal">
                        <Lock className="h-3 w-3" /> sealed
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-[color:var(--color-ink-900)] mt-1 break-words">
                    {sealed ? (
                      <span className="text-[color:var(--color-ink-400)] italic">[encrypted]</span>
                    ) : v === undefined || v === null || v === "" ? (
                      <span className="text-[color:var(--color-ink-400)]">—</span>
                    ) : typeof v === "boolean" ? (
                      v ? "Confirmed" : "Not confirmed"
                    ) : Array.isArray(v) ? (
                      v.join(", ")
                    ) : (
                      String(v)
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {response.sensitive ? (
          <Button variant={decrypted ? "outline" : "primary"} size="sm" onClick={onDecrypt}>
            {decrypted ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Re-decrypt
              </>
            ) : (
              <>
                <Unlock className="h-3.5 w-3.5" />
                Decrypt sensitive fields
              </>
            )}
          </Button>
        ) : null}

        {response.responseBlobId ? (
          <BlobLink blobId={response.responseBlobId} label="Response blob" />
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Status</span>
            <Select
              value={triage.status}
              onChange={(e) => {
                setStatus(response.responseId, e.target.value as ResponseStatus);
                onMutate();
              }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Priority</span>
            <Select
              value={triage.priority}
              onChange={(e) => {
                setPriority(response.responseId, e.target.value as ResponsePriority);
                onMutate();
              }}
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div>
          <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Tags</span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {triage.tags.length === 0 ? (
              <span className="text-xs text-[color:var(--color-ink-400)]">No tags yet.</span>
            ) : (
              triage.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-white px-2.5 py-0.5 text-xs text-[color:var(--color-ink-700)]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => {
                      removeTag(response.responseId, t);
                      onMutate();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="Add a tag…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagDraft.trim()) {
                  addTag(response.responseId, tagDraft.trim());
                  setTagDraft("");
                  onMutate();
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!tagDraft.trim()) return;
                addTag(response.responseId, tagDraft.trim());
                setTagDraft("");
                onMutate();
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div>
          <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Internal notes</span>
          {triage.notes.length === 0 ? (
            <p className="text-xs text-[color:var(--color-ink-400)] mb-3">
              Notes are visible only to the form&rsquo;s admins.
            </p>
          ) : (
            <ul className="space-y-2 mb-3">
              {triage.notes.map((n) => (
                <li
                  key={n.noteId}
                  className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-3 py-2"
                >
                  <div className="text-[11px] text-[color:var(--color-ink-500)]">
                    {shortAddr(n.authorWallet)} · {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <p className="text-sm text-[color:var(--color-ink-900)] mt-1 whitespace-pre-wrap">
                    {n.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Textarea
            rows={2}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add an internal note…"
          />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                if (!noteDraft.trim()) return;
                addNote(response.responseId, wallet, noteDraft.trim());
                setNoteDraft("");
                onMutate();
              }}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Post note
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function summarizeResponse(schema: FormSchema, r: FormResponse): string {
  for (const f of schema.fields) {
    if ((f.type === "short_text" || f.type === "rich_text") && !f.sensitive) {
      const v = r.publicFields[f.id];
      if (typeof v === "string" && v.length > 0) return v.slice(0, 110);
    }
  }
  for (const [k, v] of Object.entries(r.publicFields)) {
    if (v !== undefined && v !== null && v !== "") {
      return `${fieldLabelFor(schema, k)}: ${String(v).slice(0, 80)}`;
    }
  }
  return "(empty submission)";
}
