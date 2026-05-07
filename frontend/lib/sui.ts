// Sui adapter — wallet identity + (eventually) calls into the published
// sc_signalvault package.
//
// This module is deliberately small. The dapp-kit provider is configured
// in components/layout/Providers.tsx; this file holds helpers that don't
// require React context.

import type { AdapterMode } from "@/types/signalvault";

export const SIGNALVAULT_PACKAGE_ID =
  process.env.NEXT_PUBLIC_SIGNALVAULT_PACKAGE_ID ?? "";

export const SUI_NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as
    | "mainnet"
    | "testnet"
    | "devnet"
    | undefined) ?? "mainnet";

export const suiMode: AdapterMode = SIGNALVAULT_PACKAGE_ID ? "live" : "demo";

/** Truncate a Sui address for display: 0xABCD…1234. */
export function shortAddr(addr: string | null | undefined): string {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Build the explorer URL for an object on the active network. */
export function suiObjectUrl(objectId: string): string {
  const base =
    SUI_NETWORK === "mainnet"
      ? "https://suiscan.xyz/mainnet/object"
      : SUI_NETWORK === "testnet"
        ? "https://suiscan.xyz/testnet/object"
        : "https://suiscan.xyz/devnet/object";
  return `${base}/${objectId}`;
}

/**
 * Build a Programmable Transaction Block for `create_form` on the published
 * package. Exposed as a string-only helper so this file stays free of the
 * heavy SDK; the actual `signAndExecuteTransactionBlock` call is wired in
 * the page that needs it.
 *
 * TODO: import { Transaction } from "@mysten/sui/transactions" inside the
 *       page that submits, then call:
 *       tx.moveCall({
 *         target: `${SIGNALVAULT_PACKAGE_ID}::signalvault::create_form`,
 *         arguments: [tx.pure.vector("u8", uid), tx.pure.vector("u8", blobId), tx.object("0x6")],
 *       });
 */
export function createFormTarget(): string {
  return `${SIGNALVAULT_PACKAGE_ID}::signalvault::create_form`;
}

export function recordResponseTarget(): string {
  return `${SIGNALVAULT_PACKAGE_ID}::signalvault::record_response`;
}

export function addAdminTarget(): string {
  return `${SIGNALVAULT_PACKAGE_ID}::signalvault::add_admin`;
}

export function removeAdminTarget(): string {
  return `${SIGNALVAULT_PACKAGE_ID}::signalvault::remove_admin`;
}
