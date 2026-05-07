"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { CheckCircle2, Plus, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/layout/Container";
import { AIDraftDialog } from "@/components/forms/AIDraftDialog";
import { FieldEditor } from "@/components/forms/FieldEditor";
import { FieldRenderer } from "@/components/forms/FieldRenderer";
import { FieldTypePicker } from "@/components/forms/FieldTypePicker";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { AIFormDraft } from "@/lib/chaingpt";
import { saveForm } from "@/lib/demo-store";
import { CATEGORY_LABEL, newField, newSchema } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { nanoid } from "nanoid";
import { buildCreateFormTx, findFormPolicyId } from "@/lib/ptb";
import {
  shortAddr,
  SIGNALVAULT_PACKAGE_ID,
  suiObjectUrl,
  suiMode,
} from "@/lib/sui";
import { putJson, walrusMode } from "@/lib/walrus";
import type { FieldType, FormCategory, FormSchema } from "@/types/signalvault";

const DEFAULT_WALLET = "0xdemo000000000000000000000000000000000000000000000000000000000000";

export default function CreateFormPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const wallet = account?.address ?? DEFAULT_WALLET;
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [schema, setSchema] = useState<FormSchema>(() => newSchema(wallet));
  const [showAddPanel, setShowAddPanel] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<string>("");
  const [published, setPublished] = useState<{
    formId: string;
    blobId: string;
    policyObjectId?: string;
    txDigest?: string;
  } | null>(null);

  const applyAIDraft = (draft: AIFormDraft) => {
    setSchema((s) => ({
      ...s,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      fields: draft.fields.map((f) => ({
        id: nanoid(8),
        type: f.type,
        label: f.label,
        description: f.description,
        required: f.required,
        sensitive: f.sensitive,
        publicOnReceipt: f.publicOnReceipt,
        options: f.options,
        maxRating: f.maxRating,
      })),
      updatedAt: Date.now(),
    }));
    setShowAddPanel(false);
  };

  useEffect(() => {
    setSchema((s) => ({ ...s, creatorWallet: wallet }));
  }, [wallet]);

  const sensitiveCount = useMemo(
    () => schema.fields.filter((f) => f.sensitive).length,
    [schema.fields],
  );

  const update = (patch: Partial<FormSchema>) =>
    setSchema((s) => ({ ...s, ...patch, updatedAt: Date.now() }));

  const addField = (type: FieldType) => {
    update({ fields: [...schema.fields, newField(type)] });
  };

  const replaceField = (idx: number, next: typeof schema.fields[number]) => {
    const arr = [...schema.fields];
    arr[idx] = next;
    update({ fields: arr });
  };

  const removeField = (idx: number) => {
    update({ fields: schema.fields.filter((_, i) => i !== idx) });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= schema.fields.length) return;
    const arr = [...schema.fields];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    update({ fields: arr });
  };

  const onPublish = async () => {
    if (schema.name.trim().length === 0) {
      toast.warn("Form needs a name", "Give your form a name before publishing.");
      return;
    }
    if (schema.fields.length === 0) {
      toast.warn("No fields yet", "Add at least one field before publishing.");
      return;
    }
    setPublishing(true);
    setPublishStep("Uploading schema to Walrus…");
    try {
      const uploadResult = await putJson(schema);

      let policyObjectId: string | undefined =
        schema.policyObjectId ?? undefined;
      let txDigest: string | undefined;

      const canAnchor =
        suiMode === "live" && SIGNALVAULT_PACKAGE_ID && account?.address;

      if (canAnchor) {
        setPublishStep("Anchoring FormPolicy on Sui…");
        const tx = buildCreateFormTx({
          formUid: schema.formId,
          schemaBlobId: uploadResult.blobId,
        });
        const exec = await signAndExecute({ transaction: tx });
        txDigest = exec.digest;
        // Wait for finality with objectChanges so we can grab the new policy id.
        const final = await suiClient.waitForTransaction({
          digest: exec.digest,
          options: { showObjectChanges: true, showEffects: true },
        });
        if (final.effects?.status?.status !== "success") {
          throw new Error(
            `Sui tx failed: ${final.effects?.status?.error ?? "unknown"}`,
          );
        }
        policyObjectId =
          findFormPolicyId(final.objectChanges ?? undefined, SIGNALVAULT_PACKAGE_ID) ??
          policyObjectId;
      } else {
        // Demo / no-wallet fallback so the rest of the app still flows.
        policyObjectId =
          policyObjectId ?? `0xpolicy_${uploadResult.blobId.slice(0, 16)}`;
      }

      const finalSchema: FormSchema = {
        ...schema,
        schemaBlobId: uploadResult.blobId,
        policyObjectId,
        creatorWallet: account?.address ?? schema.creatorWallet,
        updatedAt: Date.now(),
      };
      saveForm(finalSchema);
      setPublished({
        formId: finalSchema.formId,
        blobId: uploadResult.blobId,
        policyObjectId,
        txDigest,
      });
      setSchema(finalSchema);
    } catch (e) {
      console.error(e);
      toast.error(
        "Publish failed",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setPublishing(false);
      setPublishStep("");
    }
  };

  return (
    <Container className="py-12">
      <Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <div className="eyebrow">Form builder</div>
            <h1 className="mt-3 text-[40px] md:text-[48px] leading-[1.04] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
              Design a <span className="serif-em">Walrus-native</span> form
            </h1>
            <p className="mt-2 text-sm text-[color:var(--color-ink-600)]">
              Authoring as <span className="font-mono">{shortAddr(wallet)}</span> · Storage:&nbsp;Walrus {walrusMode}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setAiOpen(true)}>
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
              Draft with AI
            </Button>
            <Button variant="outline" onClick={() => setSchema(newSchema(wallet))}>
              Reset
            </Button>
            <PillButton onClick={onPublish} size="md">
              {publishing ? publishStep || "Publishing…" : "Publish form"}
            </PillButton>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <Reveal>
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">Details</span>
              </CardHeader>
              <CardBody className="space-y-4">
                <label className="block">
                  <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Name</span>
                  <Input
                    value={schema.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="e.g. Mainnet bug intake"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">
                    Description <span className="text-[color:var(--color-ink-400)]">(optional)</span>
                  </span>
                  <Textarea
                    rows={2}
                    value={schema.description ?? ""}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="A short note shown above the form"
                  />
                </label>
                <label className="block max-w-xs">
                  <span className="text-xs text-[color:var(--color-ink-500)] mb-1.5 block">Category</span>
                  <Select
                    value={schema.category}
                    onChange={(e) => update({ category: e.target.value as FormCategory })}
                  >
                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </label>
              </CardBody>
            </Card>
          </Reveal>

          <Reveal delay={80}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">Fields</span>
                  <span className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
                    {schema.fields.length} field{schema.fields.length === 1 ? "" : "s"}
                    {sensitiveCount > 0 ? ` · ${sensitiveCount} sensitive` : ""}
                  </span>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {schema.fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[color:var(--color-ink-300)] px-6 py-10 text-center">
                    <p className="text-sm text-[color:var(--color-ink-500)]">
                      Start by adding a field below.
                    </p>
                  </div>
                ) : (
                  schema.fields.map((field, idx) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      onChange={(next) => replaceField(idx, next)}
                      onRemove={() => removeField(idx)}
                      onMoveUp={() => moveField(idx, -1)}
                      onMoveDown={() => moveField(idx, 1)}
                      isFirst={idx === 0}
                      isLast={idx === schema.fields.length - 1}
                    />
                  ))
                )}

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddPanel((v) => !v)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {showAddPanel ? "Hide field types" : "Add a field"}
                  </Button>
                  {showAddPanel ? (
                    <div className="mt-3">
                      <FieldTypePicker onPick={(t) => addField(t)} />
                    </div>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </Reveal>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Reveal delay={120}>
            <Card>
              <CardHeader>
                <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">Live preview</span>
              </CardHeader>
              <CardBody className="space-y-5">
                <div>
                  <div className="eyebrow">{CATEGORY_LABEL[schema.category]}</div>
                  <h2 className="mt-2 text-lg font-semibold text-[color:var(--color-ink-900)]">
                    {schema.name || "Untitled form"}
                  </h2>
                  {schema.description ? (
                    <p className="text-sm text-[color:var(--color-ink-600)] mt-1">{schema.description}</p>
                  ) : null}
                </div>
                {schema.fields.length === 0 ? (
                  <p className="text-sm text-[color:var(--color-ink-500)]">
                    Your fields will render here as you add them.
                  </p>
                ) : (
                  schema.fields.map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      value={undefined}
                      onChange={() => {}}
                    />
                  ))
                )}
              </CardBody>
            </Card>
          </Reveal>

          {published ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--color-signal-ok)]" />
                    <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">
                      Published
                    </span>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-[color:var(--color-ink-600)]">
                    Schema uploaded to Walrus ({walrusMode}).
                    {published.txDigest
                      ? " FormPolicy anchored on Sui."
                      : " (Connect wallet to anchor on Sui mainnet.)"}
                  </p>
                  <ShareLink formId={published.formId} />
                  <div className="text-xs text-[color:var(--color-ink-500)] font-mono break-all">
                    schema blob → {published.blobId}
                  </div>
                  {published.policyObjectId ? (
                    <div className="text-xs text-[color:var(--color-ink-500)] font-mono break-all">
                      policy →{" "}
                      {suiMode === "live" ? (
                        <a
                          href={suiObjectUrl(published.policyObjectId)}
                          target="_blank"
                          rel="noreferrer"
                          className="underline-offset-2 hover:underline text-[color:var(--color-ink-900)]"
                        >
                          {published.policyObjectId}
                        </a>
                      ) : (
                        published.policyObjectId
                      )}
                    </div>
                  ) : null}
                  {published.txDigest ? (
                    <div className="text-xs text-[color:var(--color-ink-500)] font-mono break-all">
                      tx →{" "}
                      <a
                        href={`https://suiscan.xyz/mainnet/tx/${published.txDigest}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline text-[color:var(--color-ink-900)]"
                      >
                        {published.txDigest.slice(0, 16)}…
                      </a>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href={`/form?id=${published.formId}`}>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-3.5 w-3.5" />
                        Open public form
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/form?id=${published.formId}`)}
                    >
                      Go to dashboard
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Reveal>
          ) : null}
        </div>
      </div>

      <AIDraftDialog
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onApply={applyAIDraft}
      />
    </Container>
  );
}

function ShareLink({ formId }: { formId: string }) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/form?id=${formId}`;
  }, [formId]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-3 py-2.5 text-xs">
      <span className="font-mono truncate flex-1 text-[color:var(--color-ink-900)]">{url}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
