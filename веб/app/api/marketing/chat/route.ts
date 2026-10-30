/**
 * POST /api/marketing/chat — Marketing Director (Haiku + tools).
 * C-155 parity: user = raw only; system = Marketing Director prompt (server).
 * No mock strategy replies — error object when aggregator missing/fails.
 */

import { NextResponse } from "next/server";
import { runMarketingDirectorChat } from "@/lib/marketing/chat";
import { MARKETING_DIRECTOR_MODEL } from "@/lib/marketing/prompt";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type Body = {
  message?: string;
  user?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
  thinking?: boolean;
};

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_json", source: "error" },
      { status: 400 },
    );
  }

  const user =
    (typeof body.user === "string" && body.user.trim()) ||
    (typeof body.message === "string" && body.message.trim()) ||
    "";

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "empty_user", source: "error" },
      { status: 400 },
    );
  }

  if (!resolveAggregatorEnv()) {
    return NextResponse.json(
      {
        ok: false,
        error: "aggregator_key_missing",
        source: "error",
        reply: null,
        model: MARKETING_DIRECTOR_MODEL,
      },
      { status: 503 },
    );
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const result = await runMarketingDirectorChat({
    user,
    history,
    model: body.model?.trim() || MARKETING_DIRECTOR_MODEL,
    thinking: body.thinking !== false,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        source: "error",
        reply: null,
        model: MARKETING_DIRECTOR_MODEL,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    reply: result.reply,
    model: result.model,
    source: result.source,
    toolsUsed: result.toolsUsed,
  });
}
