/**
 * POST /api/intake/sheet/cron-tick — auto-gen due pickable rows → drafts.
 * Idempotent by sheet status (generating / ready not re-picked).
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { runSheetCronTick } from "@/lib/intake/correct-pipeline-job";
import type { SheetMode } from "@/lib/intake/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    // Unset → useful-only (DEFAULT_SHEET_INTAKE_MODE). Explicit meetings OK.
    const mode =
      body.mode === "meetings" || body.mode === "useful"
        ? (body.mode as SheetMode)
        : undefined;
    const limit =
      typeof body.limit === "number" && Number.isFinite(body.limit)
        ? body.limit
        : 1;

    const result = await runSheetCronTick({
      userId: actor.userId,
      mode,
      limit,
    });

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      skipped: result.skipped,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "cron_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/intake/sheet/cron-tick]", message);
    return NextResponse.json({ error: "cron_failed", message }, { status: 500 });
  }
}
