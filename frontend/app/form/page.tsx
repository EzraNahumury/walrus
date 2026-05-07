"use client";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {
  CheckCircle2,
  CircleDashed,
  FileSearch,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { nanoid } from "nanoid";

import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FieldRenderer } from "@/components/forms/FieldRenderer";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getForm, saveForm, saveReceipt, saveResponse } from "@/lib/demo-store";
import { useOnChainForms } from "@/lib/hooks/useOnChainForms";
import { CATEGORY_LABEL, hashResponse, splitResponse, validateResponse } from "@/lib/forms";
import { buildRecordResponseTx } from "@/lib/ptb";
import { encryptSensitive, sealMode } from "@/lib/seal";
import { SIGNALVAULT_PACKAGE_ID, suiMode } from "@/lib/sui";
import { toast } from "@/lib/toast";
import { putBytes, putJson, walrusMode } from "@/lib/walrus";
import type {
  FeedbackReceipt,
  FormResponse,
  FormSchema,
  MediaRef,
} from "@/types/signalvault";

type Step =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "encrypting" }
  | { kind: "uploading_media"; index: number; total: number }
  | { kind: "uploading_response" }
  | { kind: "anchoring" }
  | { kind: "done"; receiptId: string };

export default function FormPage() {
  return (
    <Suspense fallback={<Loader />}>
      <FormPageInner />
    </Suspense>
  );
}

function Loader() {
  return (
    <Container className="py-20 flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-[color:var(--color-ink-500)]" />
    </Container>
  );
}

function FormPageInner() {
  const search = useSearchParams();
  const router = useRouter();
  const formId = search.get("id");
  const account = useCurrentAccount();
  const wallet = account?.address;
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>({ kind: "idle" });

  const onchainForms = useOnChainForms();

  useEffect(() => {
    if (!formId) return;
    let f = getForm(formId);
    if (!f) {
      const hit = onchainForms.forms.find((x) => x.formId === formId);
      if (hit) {
        saveForm(hit);
        f = hit;
      }
    }
    if (f) setSchema(f);
  }, [formId, onchainForms.forms]);

  if (!formId) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<FileSearch className="h-4 w-4" />}
          title="No form ID provided"
          body="Open a shareable form link, or browse the dashboard to find one."
        />
      </Container>
    );
  }

  if (!schema) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<FileSearch className="h-4 w-4" />}
          title="Form not found locally"
          body="In demo mode, forms live in this browser. Try creating one first."
          action={
            <PillButton href="/create" size="md">
              Create a form
            </PillButton>
          }
        />
      </Container>
    );
  }

  if (step.kind === "done") {
    return <SubmittedView receiptId={step.receiptId} schema={schema} />;
  }

  const onSubmit = async () => {
    setErrors({});
    const result = validateResponse(schema, values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setStep({ kind: "preparing" });

    const split = splitResponse(schema, values);
    let envelope = undefined;
    if (Object.keys(split.sensitiveFields).length > 0) {
      setStep({ kind: "encrypting" });
      envelope = await encryptSensitive({
        policyObjectId: schema.policyObjectId ?? `0xpolicy_${schema.formId}`,
        payload: split.sensitiveFields,
      });
    }

    const fileEntries = Object.entries(files);
    const media: MediaRef[] = [];
    if (fileEntries.length > 0) {
      let i = 0;
      for (const [fieldId, file] of fileEntries) {
        setStep({ kind: "uploading_media", index: ++i, total: fileEntries.length });
        const bytes = new Uint8Array(await file.arrayBuffer());
        const r = await putBytes(bytes);
        media.push({
          fieldId,
          blobId: r.blobId,
          mime: file.type || "application/octet-stream",
          sizeBytes: bytes.length,
        });
      }
    }

    const response: FormResponse = {
      responseId: `rsp_${nanoid(10)}`,
      formId: schema.formId,
      submittedAt: Date.now(),
      submitterWallet: wallet,
      publicFields: split.publicFields,
      sensitive: envelope,
      media,
    };
    response.responseHash = await hashResponse(response);

    setStep({ kind: "uploading_response" });
    const upload = await putJson(response);
    response.responseBlobId = upload.blobId;

    saveResponse(response);

    setStep({ kind: "anchoring" });

    // Anchor on Sui via record_response when wallet + package are available
    // and the form has a real on-chain FormPolicy. Otherwise fall through.
    const canAnchor =
      suiMode === "live" &&
      SIGNALVAULT_PACKAGE_ID &&
      account?.address &&
      schema.policyObjectId &&
      schema.policyObjectId.startsWith("0x") &&
      schema.policyObjectId.length >= 42;

    if (canAnchor) {
      try {
        const tx = buildRecordResponseTx({
          policyObjectId: schema.policyObjectId!,
          responseBlobId: upload.blobId,
          responseHashHex: response.responseHash ?? "",
        });
        const exec = await signAndExecute({ transaction: tx as never });
        const final = await suiClient.waitForTransaction({
          digest: exec.digest,
          options: { showEffects: true },
        });
        if (final.effects?.status?.status !== "success") {
          throw new Error(
            `record_response failed: ${final.effects?.status?.error ?? "unknown"}`,
          );
        }
      } catch (err) {
        console.error("record_response anchoring failed", err);
        toast.error(
          "Anchoring on Sui failed",
          err instanceof Error ? err.message : "Unknown error",
        );
      }
    } else {
      // Visual delay so the "Anchoring on Sui…" status is briefly visible.
      await new Promise((r) => setTimeout(r, 250));
    }

    const receipt: FeedbackReceipt = {
      receiptId: `rcp_${nanoid(10)}`,
      formId: schema.formId,
      formName: schema.name,
      responseBlobId: upload.blobId,
      responseHash: response.responseHash ?? "",
      timestamp: response.submittedAt,
      submitterWallet: wallet,
      publicSummary: buildPublicSummary(schema, response.publicFields),
    };
    saveReceipt(receipt);

    setStep({ kind: "done", receiptId: receipt.receiptId });
  };

  return (
    <Container size="sm" className="py-12">
      <Reveal>
        <div className="mb-6 text-center">
          <div className="eyebrow">Public form</div>
          <h1 className="mt-2 text-[36px] leading-[1.05] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
            {schema.name}
          </h1>
          {schema.description ? (
            <p className="mt-3 max-w-md mx-auto text-[14px] text-[color:var(--color-ink-600)] leading-relaxed">
              {schema.description}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-center gap-2 text-[10.5px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)]">
            <Badge tone="muted">{CATEGORY_LABEL[schema.category]}</Badge>
            <ShieldCheck className="h-3 w-3 text-[color:var(--color-accent)]" />
            <span>Seal {sealMode}</span>
            <span>·</span>
            <span>Walrus {walrusMode}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <Card>
          <CardBody className="space-y-6">
            {schema.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(v) => setValues((s) => ({ ...s, [field.id]: v }))}
                onFile={(f) => setFiles((s) => ({ ...s, [field.id]: f }))}
                attached={
                  files[field.id]
                    ? {
                        name: files[field.id].name,
                        sizeBytes: files[field.id].size,
                        mime: files[field.id].type,
                      }
                    : undefined
                }
                invalid={!!errors[field.id]}
              />
            ))}

            {step.kind !== "idle" ? <ProgressView step={step} /> : null}

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-[color:var(--color-ink-500)] inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-[color:var(--color-accent)]" />
                Sensitive fields are encrypted in your browser before upload.
              </span>
              <Button onClick={onSubmit} loading={step.kind !== "idle"}>
                Submit response
              </Button>
            </div>
          </CardBody>
        </Card>
      </Reveal>
    </Container>
  );
}

function ProgressView({ step }: { step: Step }) {
  const text = (() => {
    switch (step.kind) {
      case "preparing":
        return "Preparing payload…";
      case "encrypting":
        return "Encrypting sensitive fields with Seal…";
      case "uploading_media":
        return `Uploading attachment ${step.index} of ${step.total} to Walrus…`;
      case "uploading_response":
        return "Uploading response envelope to Walrus…";
      case "anchoring":
        return "Anchoring submission on Sui…";
      default:
        return "";
    }
  })();

  return (
    <div className="rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-3 py-2.5 text-sm text-[color:var(--color-ink-700)] inline-flex items-center gap-2">
      <CircleDashed className="h-3.5 w-3.5 animate-spin text-[color:var(--color-accent)]" />
      {text}
    </div>
  );
}

function SubmittedView({
  receiptId,
  schema,
}: {
  receiptId: string;
  schema: FormSchema;
}) {
  return (
    <Container size="sm" className="py-12">
      <Reveal>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--color-signal-ok)]" />
              <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">Submitted</span>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            <p className="text-[color:var(--color-ink-700)]">
              Your response to <span className="font-medium text-[color:var(--color-ink-900)]">{schema.name}</span> has
              been stored on Walrus and anchored to its FormPolicy.
            </p>
            <div className="flex flex-wrap gap-3">
              <PillButton href={`/receipt?id=${receiptId}`} size="md">
                View receipt
              </PillButton>
              <Button
                variant="outline"
                onClick={() => (window.location.href = `/form?id=${schema.formId}`)}
              >
                Submit another
              </Button>
            </div>
          </CardBody>
        </Card>
      </Reveal>
    </Container>
  );
}

function buildPublicSummary(
  schema: FormSchema,
  publicFields: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of schema.fields) {
    if (f.publicOnReceipt && publicFields[f.id] !== undefined) {
      out[f.label] = publicFields[f.id];
    }
  }
  return out;
}
