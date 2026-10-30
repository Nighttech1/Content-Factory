import { NextResponse } from "next/server";

import {
  ModuleNotFoundError,
  runRegenerateElement,
} from "@/lib/modules/run-module";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ moduleId: string }> };

/**
 * POST /api/modules/[moduleId]/regenerate
 * Body: { draftId: string, elementIndex: number }
 * Rerolls one element only (process-local draft store).
 */
export async function POST(
  req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;

  let body: { draftId?: unknown; elementIndex?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const draftId = typeof body.draftId === "string" ? body.draftId.trim() : "";
  const elementIndex =
    typeof body.elementIndex === "number"
      ? body.elementIndex
      : Number(body.elementIndex);

  if (!draftId) {
    return NextResponse.json(
      { ok: false, error: "draftId_required" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(elementIndex) || elementIndex < 0) {
    return NextResponse.json(
      { ok: false, error: "elementIndex_invalid" },
      { status: 400 },
    );
  }

  try {
    const element = await runRegenerateElement(
      moduleId,
      draftId,
      elementIndex,
    );
    return NextResponse.json({ ok: true, moduleId, element });
  } catch (err) {
    if (err instanceof ModuleNotFoundError) {
      return NextResponse.json(
        { ok: false, error: "module_not_found", moduleId: err.moduleId },
        { status: 404 },
      );
    }
    const message = err instanceof Error ? err.message : "regenerate_failed";
    if (message.startsWith("DraftNotFound:")) {
      return NextResponse.json(
        { ok: false, error: "draft_not_found", draftId },
        { status: 404 },
      );
    }
    if (message.startsWith("ElementNotFound:")) {
      return NextResponse.json(
        { ok: false, error: "element_not_found", elementIndex },
        { status: 404 },
      );
    }
    // eslint-disable-next-line no-console
    console.error(`[api/modules/${moduleId}/regenerate]`, message);
    return NextResponse.json(
      { ok: false, error: "regenerate_failed" },
      { status: 500 },
    );
  }
}

export async function GET(
  _req: Request,
  ctx: RouteCtx,
): Promise<Response> {
  const { moduleId } = await ctx.params;
  return NextResponse.json({
    ok: true,
    moduleId,
    hint: "POST { draftId, elementIndex } — reroll one element.",
  });
}
