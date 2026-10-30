/**
 * C-s8-04 — POST /api/schedule/slots/approve
 * HITL → SCHEDULED queue only. No Instagram / Telegram / Meta publish.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { approveScheduleSlot } from "@/lib/db/schedule-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Explicit ban list — Tester can assert this module never imports social clients. */
const SOCIAL_PUBLISH_DISABLED = true;

export async function POST(req: Request): Promise<Response> {
  try {
    if (!SOCIAL_PUBLISH_DISABLED) {
      return NextResponse.json({ error: "publish_forbidden" }, { status: 500 });
    }

    const actor = await resolveActor(req);
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const id = typeof body.id === "string" ? body.id : null;
    const postId = typeof body.postId === "string" ? body.postId : null;
    if (!id && !postId) {
      return NextResponse.json(
        { error: "id_or_postId_required" },
        { status: 400 },
      );
    }

    const slot = await approveScheduleSlot({
      userId: actor.userId,
      id,
      postId,
    });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      slot,
      published: false,
      socialPublish: false,
      queue: "scheduled" as const,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "approve_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots/approve]", message);
    return NextResponse.json({ error: "approve_failed" }, { status: 500 });
  }
}
