// Realistic seed data so the dashboard and demos do not show empty states
// during first-load. Loaded lazily by the dashboard if no real forms exist.

import type {
  FormResponse,
  FormSchema,
  ResponseTriage,
} from "@/types/signalvault";

export const DEMO_OWNER = "0xa11ce0000000000000000000000000000000000000000000000000000000a11c";

export const DEMO_FORMS: FormSchema[] = [
  {
    formId: "frm_demo_bug_intake",
    version: 1,
    name: "Mainnet bug intake",
    description:
      "Confidential bug reports for the v2 trading client. Sensitive fields are encrypted; only core engineers can decrypt.",
    category: "bug",
    creatorWallet: DEMO_OWNER,
    adminWallets: ["0xb0b00000000000000000000000000000000000000000000000000000000000b0b"],
    fields: [
      {
        id: "title",
        type: "short_text",
        label: "Short title",
        required: true,
        sensitive: false,
        publicOnReceipt: true,
        placeholder: "Order book stuck on EUR/BTC",
      },
      {
        id: "severity",
        type: "dropdown",
        label: "Severity",
        required: true,
        sensitive: false,
        publicOnReceipt: false,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ],
      },
      {
        id: "details",
        type: "rich_text",
        label: "Steps to reproduce + impact",
        required: true,
        sensitive: true,
        publicOnReceipt: false,
      },
      {
        id: "rating",
        type: "star_rating",
        label: "Severity confidence",
        required: false,
        sensitive: false,
        publicOnReceipt: false,
        maxRating: 5,
      },
      {
        id: "consent",
        type: "confirmation",
        label: "I confirm this report is accurate to the best of my knowledge",
        required: true,
        sensitive: false,
        publicOnReceipt: false,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    policyObjectId:
      "0xpolicy0000000000000000000000000000000000000000000000000000bug01",
    schemaBlobId: "demo_schema_bug_intake_blob_id",
  },
  {
    formId: "frm_demo_grants_app",
    version: 1,
    name: "Q3 ecosystem grants application",
    description:
      "Apply for Q3 ecosystem grants. Treasury reads encrypted answers; public proof of submission is generated for every applicant.",
    category: "application",
    creatorWallet: DEMO_OWNER,
    adminWallets: [],
    fields: [
      {
        id: "team",
        type: "short_text",
        label: "Team / project name",
        required: true,
        sensitive: false,
        publicOnReceipt: true,
      },
      {
        id: "url",
        type: "url",
        label: "Project URL",
        required: false,
        sensitive: false,
        publicOnReceipt: true,
      },
      {
        id: "ask",
        type: "rich_text",
        label: "Funding ask + milestones",
        required: true,
        sensitive: true,
        publicOnReceipt: false,
      },
      {
        id: "consent",
        type: "confirmation",
        label: "I agree to the grant program terms",
        required: true,
        sensitive: false,
        publicOnReceipt: false,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    policyObjectId:
      "0xpolicy0000000000000000000000000000000000000000000000000gra01",
    schemaBlobId: "demo_schema_grants_blob_id",
  },
];

export const DEMO_RESPONSES: FormResponse[] = [
  {
    responseId: "rsp_demo_bug_001",
    formId: "frm_demo_bug_intake",
    submittedAt: Date.now() - 1000 * 60 * 60 * 5,
    submitterWallet: "0xc0ffee0000000000000000000000000000000000000000000000000000c0ffee",
    publicFields: {
      title: "Order book stuck on EUR/BTC after deposit",
      severity: "high",
      rating: 4,
      consent: true,
    },
    sensitive: undefined,
    media: [],
    responseBlobId: "demo_blob_response_bug_001",
    responseHash: "f1c2b9aabbccddee1122334455667788aabbccddeeff00112233445566778899",
  },
  {
    responseId: "rsp_demo_bug_002",
    formId: "frm_demo_bug_intake",
    submittedAt: Date.now() - 1000 * 60 * 60 * 28,
    submitterWallet: "0xfeed00000000000000000000000000000000000000000000000000000000feed",
    publicFields: {
      title: "Wallet adapter loses session on Safari",
      severity: "medium",
      rating: 3,
      consent: true,
    },
    media: [],
    responseBlobId: "demo_blob_response_bug_002",
    responseHash: "112233445566778899aabbccddeeff00f1c2b9aabbccddee1122334455667788",
  },
  {
    responseId: "rsp_demo_bug_003",
    formId: "frm_demo_bug_intake",
    submittedAt: Date.now() - 1000 * 60 * 60 * 50,
    publicFields: {
      title: "Charts flicker on slow connections",
      severity: "low",
      rating: 2,
      consent: true,
    },
    media: [],
    responseBlobId: "demo_blob_response_bug_003",
    responseHash: "aaaa3344bbbb778899aabbccddeeff00f1c2b9aabbccddee1122334455667788",
  },
  {
    responseId: "rsp_demo_grant_001",
    formId: "frm_demo_grants_app",
    submittedAt: Date.now() - 1000 * 60 * 60 * 12,
    submitterWallet: "0xd00d0000000000000000000000000000000000000000000000000000000d00d0",
    publicFields: {
      team: "Marlin Labs",
      url: "https://marlin.example",
      consent: true,
    },
    media: [],
    responseBlobId: "demo_blob_response_grant_001",
    responseHash: "9988776655443322110099aabbccddeeff00f1c2b9aabbccddee1122334455ff",
  },
];

export const DEMO_TRIAGES: ResponseTriage[] = [
  {
    responseId: "rsp_demo_bug_001",
    status: "reviewing",
    priority: "p1",
    tags: ["order-book", "deposit"],
    notes: [
      {
        noteId: "note_seed_001",
        responseId: "rsp_demo_bug_001",
        authorWallet: DEMO_OWNER,
        body: "Reproduced on staging. Likely a stale websocket subscription.",
        createdAt: Date.now() - 1000 * 60 * 60 * 4,
      },
    ],
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    responseId: "rsp_demo_bug_002",
    status: "triaged",
    priority: "p2",
    tags: ["safari", "wallet"],
    notes: [],
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];
