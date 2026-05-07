// Programmable Transaction Block builders for the published sc_signalvault
// package. These functions return ready-to-sign `Transaction` objects.

import { Transaction } from "@mysten/sui/transactions";

import {
  addAdminTarget,
  createFormTarget,
  recordResponseTarget,
  removeAdminTarget,
} from "@/lib/sui";

const CLOCK_ID = "0x6";

export function strToBytes(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

export function hexToBytes(hex: string): number[] {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out: number[] = [];
  for (let i = 0; i + 1 < clean.length; i += 2) {
    out.push(parseInt(clean.substr(i, 2), 16));
  }
  return out;
}

export function buildCreateFormTx(args: {
  formUid: string;
  schemaBlobId: string;
}): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: createFormTarget(),
    arguments: [
      tx.pure.vector("u8", strToBytes(args.formUid)),
      tx.pure.vector("u8", strToBytes(args.schemaBlobId)),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
}

export function buildRecordResponseTx(args: {
  policyObjectId: string;
  responseBlobId: string;
  responseHashHex: string;
}): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: recordResponseTarget(),
    arguments: [
      tx.object(args.policyObjectId),
      tx.pure.vector("u8", strToBytes(args.responseBlobId)),
      tx.pure.vector("u8", hexToBytes(args.responseHashHex)),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
}

export function buildAddAdminTx(args: {
  policyObjectId: string;
  admin: string;
}): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: addAdminTarget(),
    arguments: [tx.object(args.policyObjectId), tx.pure.address(args.admin)],
  });
  return tx;
}

export function buildRemoveAdminTx(args: {
  policyObjectId: string;
  admin: string;
}): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: removeAdminTarget(),
    arguments: [tx.object(args.policyObjectId), tx.pure.address(args.admin)],
  });
  return tx;
}

/** Best-effort extract: from a finalized tx response (with objectChanges),
 * find the newly-created FormPolicy object ID. */
export function findFormPolicyId(
  objectChanges: unknown[] | undefined,
  packageId: string,
): string | undefined {
  if (!objectChanges) return undefined;
  for (const c of objectChanges as { type?: string; objectType?: string; objectId?: string }[]) {
    if (
      c?.type === "created" &&
      typeof c.objectType === "string" &&
      c.objectType.includes(`${packageId}::signalvault::FormPolicy`)
    ) {
      return c.objectId;
    }
  }
  return undefined;
}
