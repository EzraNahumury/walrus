// Walrus storage adapter.
//
// Live mode: uses the configured Walrus publisher / aggregator HTTP endpoints.
// Demo mode: deterministically derives a blob ID from the payload so the rest
//            of the app behaves identically while we wait for credentials.
//
// The boundary is intentionally narrow:
//   - putBlob(bytes)         → { blobId, size }
//   - getBlob(blobId)        → bytes
//   - aggregatorUrl(blobId)  → string for "open in new tab" demos
//
// TODO: when NEXT_PUBLIC_WALRUS_PUBLISHER_URL / AGGREGATOR_URL are populated,
//       this module switches to live without any UI changes.

import type { AdapterMode } from "@/types/signalvault";

const PUBLISHER = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL ?? "";
const AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ?? "";

export const walrusMode: AdapterMode =
  PUBLISHER && AGGREGATOR ? "live" : "demo";

export interface WalrusPutResult {
  blobId: string;
  size: number;
  mode: AdapterMode;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function tightCopy(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(bytes.byteLength);
  const out = new Uint8Array(buf);
  out.set(bytes);
  return out;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", tightCopy(bytes));
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback: cheap non-cryptographic hash for SSR build phase.
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8).repeat(8);
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa !== "undefined") {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  // Node fallback (build-time)
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  if (typeof atob !== "undefined") {
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const out = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const node = Buffer.from(b64, "base64");
  const buf = new ArrayBuffer(node.length);
  const out = new Uint8Array(buf);
  out.set(node);
  return out;
}

export async function putJson(value: unknown): Promise<WalrusPutResult> {
  const bytes = textEncoder.encode(JSON.stringify(value));
  return putBytes(bytes);
}

export async function putBytes(bytes: Uint8Array): Promise<WalrusPutResult> {
  if (walrusMode === "live") {
    const url = `${PUBLISHER.replace(/\/$/, "")}/v1/blobs?epochs=5`;
    const res = await fetch(url, { method: "PUT", body: tightCopy(bytes) });
    if (!res.ok) {
      throw new Error(`Walrus put failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as {
      newlyCreated?: { blobObject?: { blobId: string; size: number } };
      alreadyCertified?: { blobId: string; size?: number };
    };
    const blobId =
      data.newlyCreated?.blobObject?.blobId ??
      data.alreadyCertified?.blobId ??
      "";
    if (!blobId) throw new Error("Walrus response missing blobId");
    return { blobId, size: bytes.length, mode: "live" };
  }

  // Demo mode: deterministic content-addressed pseudo blob ID.
  const hash = await sha256Hex(bytes);
  const blobId = `demo_${hash.slice(0, 32)}`;
  const cache = (globalThis as DemoCacheCarrier).__walrus_demo_cache__ ?? {};
  cache[blobId] = bytesToBase64(bytes);
  (globalThis as DemoCacheCarrier).__walrus_demo_cache__ = cache;
  if (typeof window !== "undefined") {
    try {
      const ls = window.localStorage;
      const existing = JSON.parse(
        ls.getItem("signalvault:v1:walrus-demo-blobs") ?? "{}",
      ) as Record<string, string>;
      existing[blobId] = bytesToBase64(bytes);
      ls.setItem("signalvault:v1:walrus-demo-blobs", JSON.stringify(existing));
    } catch {
      // ignore quota errors — demo only
    }
  }
  return { blobId, size: bytes.length, mode: "demo" };
}

export async function getBytes(blobId: string): Promise<Uint8Array> {
  if (walrusMode === "live") {
    const url = `${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${blobId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Walrus get failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  const cache = (globalThis as DemoCacheCarrier).__walrus_demo_cache__ ?? {};
  let b64 = cache[blobId];
  if (!b64 && typeof window !== "undefined") {
    try {
      const ls = window.localStorage;
      const existing = JSON.parse(
        ls.getItem("signalvault:v1:walrus-demo-blobs") ?? "{}",
      ) as Record<string, string>;
      b64 = existing[blobId];
    } catch {
      // ignore
    }
  }
  if (!b64) throw new Error(`Demo blob not found: ${blobId}`);
  return base64ToBytes(b64);
}

export async function getJson<T>(blobId: string): Promise<T> {
  const bytes = await getBytes(blobId);
  return JSON.parse(textDecoder.decode(bytes)) as T;
}

export function aggregatorUrl(blobId: string): string {
  if (walrusMode === "live") {
    return `${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${blobId}`;
  }
  return `#demo-blob/${blobId}`;
}

interface DemoCacheCarrier {
  __walrus_demo_cache__?: Record<string, string>;
}
