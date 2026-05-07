"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  ArrowUpRight,
  Clock,
  Inbox,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { useOnChainForms } from "@/lib/hooks/useOnChainForms";
import {
  deleteForm,
  getForm,
  listForms,
  listResponses,
  listTriages,
  saveForm,
} from "@/lib/demo-store";
import * as storage from "@/lib/storage";
import { CATEGORY_LABEL } from "@/lib/forms";

const FALLBACK_OWNER = "0xdemo000000000000000000000000000000000000000000000000000000000000";
import { shortAddr, suiObjectUrl } from "@/lib/sui";
import type { FormResponse, FormSchema } from "@/types/signalvault";

export default function DashboardPage() {
  const account = useCurrentAccount();
  const wallet = account?.address ?? FALLBACK_OWNER;

  const [localForms, setLocalForms] = useState<FormSchema[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const onchain = useOnChainForms();

  // Persist hydrated on-chain forms to local store so /dashboard/form?id=… and
  // /form?id=… can resolve them via getForm().
  useEffect(() => {
    if (onchain.forms.length === 0) return;
    let added = false;
    for (const f of onchain.forms) {
      const existing = getForm(f.formId);
      if (!existing || existing.policyObjectId !== f.policyObjectId) {
        saveForm(f);
        added = true;
      }
    }
    if (added) setLocalForms(listForms());
  }, [onchain.forms]);

  // One-time cleanup: drop any leftover demo seed data from prior sessions.
  useEffect(() => {
    const all = listForms();
    for (const f of all) {
      if (f.formId.startsWith("frm_demo_")) {
        deleteForm(f.formId);
      }
    }
    const responses = storage
      .read<{ responseId: string }[]>("responses", [])
      .filter((r) => !r.responseId.startsWith("rsp_demo_"));
    storage.write("responses", responses);
    const triages = storage
      .read<{ responseId: string }[]>("triages", [])
      .filter((t) => !t.responseId.startsWith("rsp_demo_"));
    storage.write("triages", triages);

    setLocalForms(listForms());
    setResponses(listResponses());
  }, []);

  // Combined forms — on-chain takes precedence (dedup by policyObjectId).
  const forms: (FormSchema & { source: "onchain" | "local" })[] = useMemo(() => {
    const byPolicy = new Map<string, FormSchema & { source: "onchain" | "local" }>();
    for (const f of onchain.forms) {
      if (f.policyObjectId) byPolicy.set(f.policyObjectId, { ...f, source: "onchain" });
    }
    for (const f of localForms) {
      const key = f.policyObjectId ?? f.formId;
      if (!byPolicy.has(key)) byPolicy.set(key, { ...f, source: "local" });
    }
    return [...byPolicy.values()].sort((a, b) => b.createdAt - a.createdAt);
  }, [onchain.forms, localForms]);

  const visibleForms = useMemo(
    () => (showOnlyMine ? forms.filter((f) => f.creatorWallet === wallet) : forms),
    [forms, wallet, showOnlyMine],
  );

  const triages = useMemo(() => listTriages(), [responses]);

  const totals = useMemo(() => {
    const responsesAcrossVisible = responses.filter((r) =>
      visibleForms.some((f) => f.formId === r.formId),
    );
    let encrypted = 0;
    let highPriority = 0;
    for (const r of responsesAcrossVisible) {
      if (r.sensitive) encrypted++;
      const t = triages[r.responseId];
      if (t && (t.priority === "p0" || t.priority === "p1")) highPriority++;
    }
    return {
      forms: visibleForms.length,
      responses: responsesAcrossVisible.length,
      encrypted,
      highPriority,
    };
  }, [visibleForms, responses, triages]);

  const onchainCount = onchain.forms.length;

  return (
    <Container className="py-12 md:py-16">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">
              {onchain.enabled
                ? `On-chain · Sui mainnet · ${onchainCount} form${onchainCount === 1 ? "" : "s"} indexed`
                : "Demo mode · Sui package not configured"}
            </div>
            <h1 className="mt-3 text-[42px] md:text-[52px] leading-[1.04] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              Active <span className="serif-em">forms</span>
            </h1>
            <p className="mt-3 max-w-md text-[14.5px] text-[color:var(--color-ink-600)]">
              {totals.forms} form{totals.forms === 1 ? "" : "s"} ·{" "}
              {totals.responses} response{totals.responses === 1 ? "" : "s"} ·{" "}
              {totals.encrypted} encrypted under Seal · connected as{" "}
              {shortAddr(wallet)}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {onchain.enabled ? (
              <button
                type="button"
                onClick={() => onchain.refetch()}
                disabled={onchain.isFetching}
                className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)] disabled:opacity-50"
              >
                <RefreshCcw
                  className={`h-3 w-3 ${onchain.isFetching ? "animate-spin" : ""}`}
                />
                {onchain.isFetching ? "Refreshing" : "Refresh chain"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowOnlyMine((v) => !v)}
              className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
            >
              {showOnlyMine ? "Show all forms" : "Show only mine"}
            </button>
            <PillButton href="/create" size="md">
              + Start a form
            </PillButton>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Forms" value={totals.forms} />
          <StatCard label="Responses" value={totals.responses} />
          <StatCard
            label="Encrypted"
            value={totals.encrypted}
            tone="accent"
            hint="Sealed payloads"
          />
          <StatCard
            label="High priority"
            value={totals.highPriority}
            tone="warn"
            hint="P0 + P1 to triage"
          />
        </div>
      </Reveal>

      {onchain.enabled && onchain.isLoading ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[color:var(--color-line)] bg-white px-6 py-8 text-center text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
          Querying Sui events…
        </div>
      ) : null}

      {visibleForms.length === 0 && !onchain.isLoading ? (
        <div className="mt-10">
          <EmptyState
            icon={<Inbox className="h-4 w-4" />}
            title="No forms yet"
            body="Create your first form to start collecting Walrus-native, encrypted feedback."
            action={
              <PillButton href="/create" size="md">
                + New form
              </PillButton>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleForms.map((f, i) => {
            const fr = responses.filter((r) => r.formId === f.formId);
            const enc = fr.filter((r) => r.sensitive).length;
            const lastTs = fr[0]?.submittedAt;
            const isOnchain = f.source === "onchain";
            return (
              <Reveal key={f.policyObjectId ?? f.formId} delay={i * 60}>
                <Link
                  href={`/dashboard/form?id=${f.formId}`}
                  className="block rounded-2xl border border-[color:var(--color-line)] bg-white shadow-card hover:shadow-card-hover transition overflow-hidden h-full group"
                >
                  <FormCardCover form={f} isOnchain={isOnchain} />
                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold tracking-tightish text-[color:var(--color-ink-900)] leading-snug">
                        {f.name}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 text-[color:var(--color-ink-500)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    {f.description ? (
                      <p className="mt-2 text-[12.5px] text-[color:var(--color-ink-600)] line-clamp-2">
                        {f.description}
                      </p>
                    ) : null}

                    <div className="mt-4 h-px bg-[color:var(--color-line)]" />

                    <div className="mt-3 flex items-center justify-between text-[11.5px] text-[color:var(--color-ink-500)]">
                      <span>
                        Responses{" "}
                        <span className="text-[color:var(--color-ink-900)] font-medium">
                          {fr.length}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3 text-[color:var(--color-accent)]" />
                        <span className="text-[color:var(--color-ink-900)] font-medium">
                          {enc}
                        </span>{" "}
                        encrypted
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[color:var(--color-ink-500)]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lastTs ? `Last ${timeAgo(lastTs)}` : "No submissions yet"}
                      </span>
                      {isOnchain && f.policyObjectId ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(
                              suiObjectUrl(f.policyObjectId!),
                              "_blank",
                              "noreferrer",
                            );
                          }}
                          className="font-mono text-[10.5px] truncate max-w-[160px] hover:text-[color:var(--color-ink-900)] underline-offset-2 hover:underline"
                        >
                          {f.policyObjectId.slice(0, 14)}…
                        </button>
                      ) : (
                        <span className="font-mono text-[10.5px] truncate max-w-[140px]">
                          {f.schemaBlobId ? `${f.schemaBlobId.slice(0, 18)}…` : "—"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </Container>
  );
}

function FormCardCover({
  form,
  isOnchain,
}: {
  form: FormSchema;
  isOnchain: boolean;
}) {
  return (
    <div className="relative h-32 starfield border-b border-[color:var(--color-line)] overflow-hidden">
      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute inset-0 gridlines" />
      </div>
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <Badge tone="dark">{CATEGORY_LABEL[form.category]}</Badge>
        <Badge tone={isOnchain ? "ok" : "muted"}>
          {isOnchain ? "On-chain" : "Demo"}
        </Badge>
      </div>
      <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2 py-1 text-[10px] tracking-[0.16em] uppercase text-white">
        <Sparkles className="h-2.5 w-2.5" />
        Active
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] tracking-[0.18em] uppercase text-white/70 font-mono">
        {form.policyObjectId ? `${form.policyObjectId.slice(0, 14)}…` : "policy pending"}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
