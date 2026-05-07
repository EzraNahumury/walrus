// On-chain queries against the published sc_signalvault package.
//
// Reads `FormCreated` and `ResponseRecorded` events from Sui mainnet, then
// hydrates schemas + responses by fetching the referenced Walrus blobs.

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import { SIGNALVAULT_PACKAGE_ID, SUI_NETWORK } from "@/lib/sui";
import { getJson, walrusMode } from "@/lib/walrus";
import type {
  FormResponse,
  FormSchema,
} from "@/types/signalvault";

let _client: SuiClient | null = null;
function client(): SuiClient {
  if (_client) return _client;
  _client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });
  return _client;
}

const MOD = "signalvault";

export interface FormCreatedEvent {
  policy_id: string;
  form_uid: number[] | string;
  owner: string;
  schema_blob_id: string;
  created_at_ms: string | number;
}

export interface ResponseRecordedEvent {
  policy_id: string;
  response_blob_id: string;
  response_hash: number[] | string;
  submitter: string;
  timestamp_ms: string | number;
  sequence: string | number;
}

export interface OnChainForm {
  policyId: string;
  schemaBlobId: string;
  owner: string;
  formUid: string;
  createdAtMs: number;
  /** Hydrated FormSchema from Walrus, or undefined if blob fetch failed. */
  schema?: FormSchema;
}

export interface OnChainResponse {
  policyId: string;
  responseBlobId: string;
  responseHash: string;
  submitter: string;
  timestampMs: number;
  sequence: number;
  /** Hydrated FormResponse from Walrus, or undefined if fetch failed. */
  response?: FormResponse;
}

export function isOnChainEnabled(): boolean {
  return Boolean(SIGNALVAULT_PACKAGE_ID && SIGNALVAULT_PACKAGE_ID.length > 0);
}

function bytesArrayToString(v: number[] | string): string {
  if (typeof v === "string") return v;
  return String.fromCharCode(...v);
}

function bytesArrayToHex(v: number[] | string): string {
  if (typeof v === "string") {
    // Already hex / base-encoded. Best-effort passthrough.
    return v;
  }
  return v.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* -------------------------------------------------------------------------- */
/* Event queries                                                              */
/* -------------------------------------------------------------------------- */

async function queryAllEvents<T>(eventType: string): Promise<T[]> {
  if (!isOnChainEnabled()) return [];
  const out: T[] = [];
  let cursor:
    | { eventSeq: string; txDigest: string }
    | null
    | undefined = null;
  for (let i = 0; i < 20; i++) {
    const res = await client().queryEvents({
      query: { MoveEventType: eventType },
      cursor,
      limit: 50,
      order: "descending",
    });
    for (const e of res.data) {
      if (e.parsedJson) out.push(e.parsedJson as T);
    }
    if (!res.hasNextPage || !res.nextCursor) break;
    cursor = res.nextCursor;
  }
  return out;
}

export async function queryFormCreated(): Promise<FormCreatedEvent[]> {
  return queryAllEvents<FormCreatedEvent>(
    `${SIGNALVAULT_PACKAGE_ID}::${MOD}::FormCreated`,
  );
}

export async function queryResponseRecorded(
  policyIdFilter?: string,
): Promise<ResponseRecordedEvent[]> {
  const all = await queryAllEvents<ResponseRecordedEvent>(
    `${SIGNALVAULT_PACKAGE_ID}::${MOD}::ResponseRecorded`,
  );
  if (!policyIdFilter) return all;
  return all.filter((e) => e.policy_id === policyIdFilter);
}

/* -------------------------------------------------------------------------- */
/* Hydration — pair events with their Walrus blobs                            */
/* -------------------------------------------------------------------------- */

export async function fetchOnChainForms(): Promise<OnChainForm[]> {
  const events = await queryFormCreated();
  // Hydrate schema blobs in parallel; tolerate per-blob failures.
  const out: OnChainForm[] = await Promise.all(
    events.map(async (e) => {
      const formUid = bytesArrayToString(e.form_uid);
      const createdAtMs = Number(e.created_at_ms);
      let schema: FormSchema | undefined;
      try {
        // Only attempt fetch when Walrus is live OR when blob ID looks like a
        // demo deterministic ID we have cached locally.
        if (walrusMode === "live" || e.schema_blob_id.startsWith("demo_")) {
          const fetched = await getJson<FormSchema>(e.schema_blob_id);
          schema = {
            ...fetched,
            policyObjectId: e.policy_id,
            schemaBlobId: e.schema_blob_id,
            creatorWallet: e.owner,
          };
        }
      } catch {
        // ignore — leave schema undefined; UI will render a stub
      }
      return {
        policyId: e.policy_id,
        schemaBlobId: e.schema_blob_id,
        owner: e.owner,
        formUid,
        createdAtMs,
        schema,
      };
    }),
  );
  // Newest first
  out.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return out;
}

export async function fetchOnChainResponses(
  policyId: string,
): Promise<OnChainResponse[]> {
  const events = await queryResponseRecorded(policyId);
  const out: OnChainResponse[] = await Promise.all(
    events.map(async (e) => {
      const timestampMs = Number(e.timestamp_ms);
      const sequence = Number(e.sequence);
      const responseHash = bytesArrayToHex(e.response_hash);
      let response: FormResponse | undefined;
      try {
        if (walrusMode === "live" || e.response_blob_id.startsWith("demo_")) {
          response = await getJson<FormResponse>(e.response_blob_id);
        }
      } catch {
        // ignore
      }
      return {
        policyId: e.policy_id,
        responseBlobId: e.response_blob_id,
        responseHash,
        submitter: e.submitter,
        timestampMs,
        sequence,
        response,
      };
    }),
  );
  out.sort((a, b) => b.timestampMs - a.timestampMs);
  return out;
}

/** Build a stub FormSchema from event metadata when blob fetch fails. */
export function stubSchemaFromEvent(f: OnChainForm): FormSchema {
  return {
    formId: `frm_${f.policyId.slice(2, 14)}`,
    version: 1,
    name: f.formUid || "On-chain form",
    description: "Schema blob is referenced on Sui but not fetchable from the configured Walrus aggregator. Set NEXT_PUBLIC_WALRUS_AGGREGATOR_URL to hydrate.",
    category: "other",
    creatorWallet: f.owner,
    adminWallets: [],
    fields: [],
    createdAt: f.createdAtMs,
    updatedAt: f.createdAtMs,
    policyObjectId: f.policyId,
    schemaBlobId: f.schemaBlobId,
  };
}

/** Build a stub FormResponse from event metadata when blob fetch fails. */
export function stubResponseFromEvent(
  e: OnChainResponse,
  formId: string,
): FormResponse {
  return {
    responseId: `rsp_seq_${e.sequence}`,
    formId,
    submittedAt: e.timestampMs,
    submitterWallet: e.submitter,
    publicFields: {},
    media: [],
    responseBlobId: e.responseBlobId,
    responseHash: e.responseHash,
  };
}
