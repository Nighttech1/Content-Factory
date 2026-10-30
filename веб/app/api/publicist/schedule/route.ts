/**
 * POST /api/publicist/schedule
 * Body: { draftId, publishAt?, mode?: auto|manual, platformId? }
 * Wires ScheduleSlot DRAFT (HITL approve → SCHEDULED). No social publish.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { scheduleDraftForPublish } from "@/lib/intake/correct-pipeline-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Explicit ban — Tester can assert no social clients imported here. */
const SOCIAL_PUBLISH_DISABLED = true;

export async function POST(req: Request): Promise<Response> {
  try {
    if (!SOCIAL_PUBLISH_DISABLED) {
      return NextResponse.json({ error: "publish_forbidden" }, { status: 500 });
    }

    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const draftId =
      typeof body.draftId === "string" ? body.draftId.trim() : "";
    if (!draftId) {
      return NextResponse.json({ error: "draftId_required" }, { status: 400 });
    }

    const result = await scheduleDraftForPublish({
      userId: actor.userId,
      draftId,
      publishAt:
        typeof body.publishAt === "string" ? body.publishAt : null,
      mode:
        body.mode === "auto" || body.mode === "manual" ? body.mode : undefined,
      platformId:
        typeof body.platformId === "string" || body.platformId === null
          ? (body.platformId as string | null)
          : undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      slotId: result.slotId,
      startsAt: result.startsAt,
      publishMode: result.publishMode,
      socialPublish: false,
      queue: "draft" as const,
      hint: "HITL approve via POST /api/schedule/slots/approve → SCHEDULED",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "schedule_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/publicist/schedule]", message);
    return NextResponse.json(
      { error: "schedule_failed", message },
      { status: 500 },
    );
  }
}
