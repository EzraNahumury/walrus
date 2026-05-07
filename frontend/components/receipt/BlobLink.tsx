"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { aggregatorUrl, walrusMode } from "@/lib/walrus";

interface BlobLinkProps {
  blobId: string;
  label?: string;
}

export function BlobLink({ blobId, label = "Walrus blob" }: BlobLinkProps) {
  const [copied, setCopied] = useState(false);
  const url = aggregatorUrl(blobId);

  return (
    <div className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-soft)] px-3 py-2.5 flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
          {label}
        </div>
        <div className="font-mono text-[12.5px] text-[color:var(--color-ink-900)] truncate">
          {blobId}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(blobId);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
        aria-label="Copy blob ID"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      {walrusMode === "live" ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[color:var(--color-ink-500)] hover:text-[color:var(--color-ink-900)]"
          aria-label="Open blob"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
      {copied ? (
        <span className="text-[11px] text-[color:var(--color-signal-ok)]">Copied</span>
      ) : null}
    </div>
  );
}
