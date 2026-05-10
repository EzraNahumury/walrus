// AI form drafting endpoint backed by the ChainGPT Web3 LLM.
//
// Server route used when only CHAINGPT_API_KEY (server-only) is present.
// On static Walrus Sites deploys this route is omitted from the build; the
// client falls back to NEXT_PUBLIC_CHAINGPT_API_KEY and calls ChainGPT
// directly via lib/ai-parser.ts (CORS is permitted by the upstream).

import { NextResponse } from "next/server";

import { callChainGPT } from "@/lib/ai-parser";

export async function POST(req: Request) {
  const apiKey =
    process.env.CHAINGPT_API_KEY ?? process.env.NEXT_PUBLIC_CHAINGPT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing CHAINGPT_API_KEY." },
      { status: 503 },
    );
  }

  let body: { brief?: string };
  try {
    body = (await req.json()) as { brief?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim();
  try {
    const draft = await callChainGPT(apiKey, brief);
    return NextResponse.json({ draft });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI draft failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
