import { NextResponse } from "next/server";

import {
  getRazborWelcome,
  runRazborAnalysis,
  runRazborCascade,
  startRazbor,
} from "@/lib/studio/razbor-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  competitorId?: string;
  /** welcome | analyze (start) | script — C-51 script-only cascade */
  action?: "welcome" | "analyze" | "script";
};

/**
 * POST /api/studio/carousel-engine/razbor
 * Thin mock API for smoke / optional SSR — primary UX uses client lib.
 * Body: { competitorId, action?: "welcome" | "analyze" | "script" }
 * C-51: script returns scriptwriterMessages + script (no designerMessages / draft).
 * No Prisma.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const competitorId =
    typeof body.competitorId === "string" ? body.competitorId.trim() : "";
  if (!competitorId) {
    return NextResponse.json(
      { ok: false, error: "competitorId_required" },
      { status: 400 },
    );
  }

  const action =
    body.action === "script"
      ? "script"
      : body.action === "welcome"
        ? "welcome"
        : "analyze";

  if (action === "welcome") {
    const payload = getRazborWelcome(competitorId);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "competitor_not_found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, action, ...payload });
  }

  if (action === "analyze") {
    const payload = startRazbor(competitorId) ?? runRazborAnalysis(competitorId);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "competitor_not_found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, action, ...payload });
  }

  const cascade = runRazborCascade(competitorId);
  if (!cascade) {
    return NextResponse.json(
      { ok: false, error: "competitor_not_found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, action, ...cascade });
}
