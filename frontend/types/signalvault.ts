// Canonical SignalVault data model. Everything stored on Walrus is
// serialized from these shapes; everything anchored on Sui references
// the same IDs. Keep this file dependency-free so it can be reused by
// any future indexer or SDK.

export type FieldType =
  | "rich_text"
  | "short_text"
  | "dropdown"
  | "checkbox"
  | "star_rating"
  | "screenshot"
  | "video"
  | "url"
  | "confirmation";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  /** When true, the field's value is encrypted via Seal before upload. */
  sensitive: boolean;
  /** When true, the field appears (in cleartext) on the public receipt page. */
  publicOnReceipt: boolean;
  options?: FormFieldOption[];
  maxRating?: number;
  maxFileSizeMB?: number;
  placeholder?: string;
}

export type FormCategory =
  | "bug"
  | "feature"
  | "feedback"
  | "survey"
  | "application"
  | "other";

export interface FormSchema {
  formId: string;
  version: number;
  name: string;
  description?: string;
  category: FormCategory;
  creatorWallet: string;
  adminWallets: string[];
  fields: FormField[];
  createdAt: number;
  updatedAt: number;
  /** Sui object ID of the FormPolicy anchoring this form (when published). */
  policyObjectId?: string;
  /** Walrus blob ID of the canonical schema (when published). */
  schemaBlobId?: string;
}

export interface MediaRef {
  fieldId: string;
  blobId: string;
  mime: string;
  sizeBytes: number;
}

export interface FormResponse {
  responseId: string;
  formId: string;
  submittedAt: number;
  submitterWallet?: string;
  /** Cleartext values for non-sensitive fields. */
  publicFields: Record<string, unknown>;
  /** Seal-style envelope for sensitive fields, or undefined if none. */
  sensitive?: EncryptedEnvelope;
  media: MediaRef[];
  /** Walrus blob ID of the response envelope (set after upload). */
  responseBlobId?: string;
  /** Hex SHA-256 of the response envelope bytes. */
  responseHash?: string;
}

export interface EncryptedEnvelope {
  /** Sui object ID of the FormPolicy used as the access anchor. */
  policyObjectId: string;
  /** Base64 ciphertext. */
  ciphertext: string;
  /** Base64 nonce / IV. */
  nonce: string;
  /** Adapter or scheme tag, e.g. "seal-v1" or "demo-aes-gcm-256". */
  scheme: string;
  /** Optional fingerprint of the wrapping policy / key version. */
  keyVersion?: number;
}

export interface FeedbackReceipt {
  receiptId: string;
  formId: string;
  formName: string;
  responseBlobId: string;
  responseHash: string;
  timestamp: number;
  submitterWallet?: string;
  /** Public summary fields the contributor opted to display on the receipt. */
  publicSummary?: Record<string, unknown>;
}

export type ResponseStatus = "new" | "reviewing" | "triaged" | "shipped" | "wontfix";
export type ResponsePriority = "p0" | "p1" | "p2" | "p3" | "unranked";

export interface AdminNote {
  noteId: string;
  responseId: string;
  authorWallet: string;
  body: string;
  createdAt: number;
}

export interface ResponseTriage {
  responseId: string;
  status: ResponseStatus;
  priority: ResponsePriority;
  tags: string[];
  notes: AdminNote[];
  updatedAt: number;
}

export interface FeedbackInsight {
  formId: string;
  generatedAt: number;
  totalResponses: number;
  averageRating?: number;
  ratingHistogram?: Record<number, number>;
  topTags: { tag: string; count: number }[];
  recurringPhrases: { phrase: string; count: number }[];
  highPriorityCount: number;
  suggestedNextAction: string;
}

/** Adapter mode reported by the lib/* services so the UI can be honest. */
export type AdapterMode = "live" | "demo";

export interface AdapterStatus {
  walrus: AdapterMode;
  seal: AdapterMode;
  sui: AdapterMode;
}
