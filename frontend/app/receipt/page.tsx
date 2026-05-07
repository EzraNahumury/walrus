"use client";

import { CheckCircle2, FileSearch, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BlobLink } from "@/components/receipt/BlobLink";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { getReceipt, listReceipts } from "@/lib/demo-store";
import { shortAddr } from "@/lib/sui";
import type { FeedbackReceipt } from "@/types/signalvault";

const DEMO_RECEIPT: FeedbackReceipt = {
  receiptId: "rcp_demo_preview",
  formId: "frm_demo_bug_intake",
  formName: "Mainnet bug intake",
  responseBlobId: "demo_blob_response_bug_001",
  responseHash: "f1c2b9aabbccddee1122334455667788aabbccddeeff00112233445566778899",
  timestamp: Date.now() - 1000 * 60 * 60 * 5,
  submitterWallet: "0xc0ffee0000000000000000000000000000000000000000000000000000c0ffee",
  publicSummary: { "Short title": "Order book stuck on EUR/BTC after deposit" },
};

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[color:var(--color-ink-500)]">Loading…</div>}>
      <ReceiptInner />
    </Suspense>
  );
}

function ReceiptInner() {
  const search = useSearchParams();
  const id = search.get("id");
  const [receipt, setReceipt] = useState<FeedbackReceipt | null>(null);

  useEffect(() => {
    if (!id) return;
    if (id === "demo") {
      setReceipt(DEMO_RECEIPT);
      return;
    }
    const r = getReceipt(id) ?? listReceipts()[0] ?? null;
    setReceipt(r ?? DEMO_RECEIPT);
  }, [id]);

  if (!id) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<FileSearch className="h-4 w-4" />}
          title="No receipt ID"
          body="Open a receipt link to view its content-addressed proof of submission."
          action={
            <PillButton href="/receipt?id=demo" size="md">
              See demo receipt
            </PillButton>
          }
        />
      </Container>
    );
  }

  if (!receipt) {
    return (
      <Container className="py-16">
        <EmptyState title="Loading receipt…" />
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-14">
      <Reveal>
        <div className="text-center mb-8">
          <Badge tone="ok" className="mb-3">
            <CheckCircle2 className="h-3 w-3" />
            Proof-of-Feedback
          </Badge>
          <h1 className="text-[36px] md:text-[44px] leading-[1.06] tracking-tighter2 font-semibold text-[color:var(--color-ink-900)]">
            Submission anchored on <span className="serif-em">Walrus</span>
          </h1>
          <p className="mt-3 text-[14px] text-[color:var(--color-ink-600)] max-w-md mx-auto">
            This receipt is a public, content-addressed artifact. The private body remains
            Seal-encrypted on Walrus and is not visible here.
          </p>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[color:var(--color-accent)]" />
              <span className="text-sm font-semibold text-[color:var(--color-ink-900)]">
                {receipt.formName}
              </span>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Form ID" value={receipt.formId} mono />
            <Field
              label="Submitted at"
              value={new Date(receipt.timestamp).toLocaleString()}
            />
            {receipt.submitterWallet ? (
              <Field
                label="Submitter wallet"
                value={shortAddr(receipt.submitterWallet)}
                mono
              />
            ) : null}
            <Field
              label="Content hash (sha-256)"
              value={receipt.responseHash}
              mono
              wrap
            />
            <BlobLink blobId={receipt.responseBlobId} label="Response blob" />

            {receipt.publicSummary &&
              Object.keys(receipt.publicSummary).length > 0 && (
                <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-4 py-3">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)] mb-2">
                    Public summary
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries(receipt.publicSummary).map(([k, v]) => (
                      <li key={k} className="flex justify-between gap-3">
                        <span className="text-[color:var(--color-ink-500)]">{k}</span>
                        <span className="text-[color:var(--color-ink-900)] text-right break-words">
                          {String(v)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/5 px-3 py-2.5">
              <Lock className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
              <span className="text-xs text-[color:var(--color-ink-700)]">
                The full response body remains Seal-encrypted. Only the form creator and approved
                admins can decrypt it.
              </span>
            </div>
          </CardBody>
        </Card>
      </Reveal>

      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
        >
          ← Back to home
        </Link>
        <PillButton href={`/form?id=${receipt.formId}`} size="sm">
          Submit another
        </PillButton>
      </div>
    </Container>
  );
}

function Field({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-[color:var(--color-line)] pb-3 last:border-0">
      <span className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
        {label}
      </span>
      <span
        className={`text-sm text-[color:var(--color-ink-900)] ${mono ? "font-mono" : ""} ${
          wrap ? "break-all max-w-[60%] text-right" : "text-right"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
