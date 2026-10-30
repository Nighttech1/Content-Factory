/**
 * POST /api/intake/sheet/generate
 * Body: { mode?, sheetRowKey, scheduleAt?, publishMode?, slides?, force? }
 * Default mode = useful. Optional slides overrides sheet row for Scriptwriter.
 * → correct pipeline → Draft unpublished + flags
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { runCorrectPipelineGenerate } from "@/lib/intake/correct-pipeline-job";
import { parseSheetModeOrDefault } from "@/lib/intake/sheet-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const mode = parseSheetModeOrDefault(body.mode);
    const sheetRowKey =
      typeof body.sheetRowKey === "string" ? body.sheetRowKey.trim() : "";
    if (!sheetRowKey) {
      return NextResponse.json(
        { error: "sheetRowKey_required" },
        { status: 400 },
      );
    }

    const scheduleAt =
      typeof body.scheduleAt === "string" ? body.scheduleAt : null;
    const publishMode =
      body.publishMode === "auto" || body.publishMode === "manual"
        ? body.publishMode
        : null;
    const slidesRaw =
      typeof body.slides === "number"
        ? body.slides
        : typeof body.slides === "string"
          ? Number.parseInt(body.slides, 10)
          : undefined;
    const slides =
      typeof slidesRaw === "number" &&
      Number.isFinite(slidesRaw) &&
      slidesRaw >= 3 &&
      slidesRaw <= 10
        ? slidesRaw
        : undefined;
    const force = body.force === true || body.force === 1 || body.force === "1";

    const result = await runCorrectPipelineGenerate({
      userId: actor.userId,
      mode,
      sheetRowKey,
      scheduleAt,
      publishMode,
      slides,
      force,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          needs_input: result.needs_input ?? false,
          sheetRowKey: result.sheetRowKey,
          mode: result.mode,
        },
        { status: result.needs_input ? 422 : 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      draftId: result.draftId,
      needs_review: result.needs_review,
      needs_input: result.needs_input,
      sheetRowKey: result.sheetRowKey,
      mode: result.mode,
      slotId: result.slotId,
      pipeline: "layered_html",
      writeSkipped: result.writeSkipped,
      writeSkippedReason: result.writeSkippedReason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generate_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/generate]", message);
    return NextResponse.json(
      { error: "generate_failed", message },
      { status: 500 },
    );
  }
}
