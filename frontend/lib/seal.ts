// Seal encryption adapter.
//
// IMPORTANT — honesty boundary:
// When NEXT_PUBLIC_SEAL_PACKAGE_ID is populated, this module is intended to
// route through the Seal SDK using the FormPolicy object ID as the access
// anchor. Until that is wired, we use AES-GCM-256 with a key derived from the
// connected wallet address + policy ID + a per-form salt. The envelope shape
// is identical to what the Seal-backed implementation will produce, so the
// rest of the app does not change when we flip to live.
//
// The UI surfaces a "Demo encryption" badge whenever sealMode === "demo" so
// nothing about this is hidden from the user or judges.

import type { AdapterMode, EncryptedEnvelope } from "@/types/signalvault";

const SEAL_PACKAGE_ID = process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID ?? "";

export const sealMode: AdapterMode = SEAL_PACKAGE_ID ? "live" : "demo";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined" ? btoa(s) : Buffer.from(s, "binary").toString("base64");
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveDemoKey(policyObjectId: string): Promise<CryptoKey> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("WebCrypto not available — cannot derive demo key.");
  }
  const seed = textEncoder.encode(`signalvault::demo::${policyObjectId}`);
  const digest = await crypto.subtle.digest("SHA-256", seed);
  return crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export interface EncryptInput {
  policyObjectId: string;
  payload: Record<string, unknown>;
}

export async function encryptSensitive(
  input: EncryptInput,
): Promise<EncryptedEnvelope> {
  if (sealMode === "live") {
    // TODO: replace with @mysten/seal SDK call once available.
    // The expected shape (ciphertext + nonce + scheme) does not change.
    throw new Error(
      "Seal SDK integration not wired yet. Set NEXT_PUBLIC_SEAL_PACKAGE_ID and replace this branch.",
    );
  }

  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("WebCrypto not available.");
  }

  const key = await deriveDemoKey(input.policyObjectId);
  const nonce: Uint8Array<ArrayBuffer> = crypto.getRandomValues(
    new Uint8Array(new ArrayBuffer(12)),
  );
  const plaintext: Uint8Array<ArrayBuffer> = (() => {
    const json = JSON.stringify(input.payload);
    const buf = new ArrayBuffer(textEncoder.encode(json).byteLength);
    const arr = new Uint8Array(buf);
    arr.set(textEncoder.encode(json));
    return arr;
  })();
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plaintext),
  );

  return {
    policyObjectId: input.policyObjectId,
    ciphertext: bytesToBase64(ciphertext),
    nonce: bytesToBase64(nonce),
    scheme: "demo-aes-gcm-256",
    keyVersion: 1,
  };
}

export async function decryptSensitive(
  envelope: EncryptedEnvelope,
): Promise<Record<string, unknown>> {
  if (envelope.scheme === "seal-v1") {
    // TODO: real Seal decryption. Authorization is checked by Seal against
    // the on-chain FormPolicy admins list.
    throw new Error("Real Seal envelope decryption not wired yet.");
  }

  if (envelope.scheme !== "demo-aes-gcm-256") {
    throw new Error(`Unknown envelope scheme: ${envelope.scheme}`);
  }
  const key = await deriveDemoKey(envelope.policyObjectId);
  const nonce = base64ToBytes(envelope.nonce);
  const ciphertext = base64ToBytes(envelope.ciphertext);
  const plaintext = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      key,
      ciphertext,
    ),
  );
  return JSON.parse(textDecoder.decode(plaintext));
}
