/**
 * C-s8-04 — GET/POST /api/schedule/slots
 * No social publish.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  listScheduleSlots,
  upsertScheduleSlot,
} from "@/lib/db/schedule-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const url = new URL(req.url);
    const slots = await listScheduleSlots({
      userId: actor.userId,
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });
    return NextResponse.json({ slots, userId: actor.userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots] GET", message);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    if (typeof body.postId !== "string" || !body.postId.trim()) {
      return NextResponse.json({ error: "postId_required" }, { status: 400 });
    }
    if (typeof body.startsAt !== "string") {
      return NextResponse.json({ error: "startsAt_required" }, { status: 400 });
    }

    const slot = await upsertScheduleSlot(actor.userId, {
      id: typeof body.id === "string" ? body.id : undefined,
      postId: body.postId,
      moduleId: typeof body.moduleId === "string" ? body.moduleId : undefined,
      startsAt: body.startsAt,
      platformId:
        typeof body.platformId === "string" || body.platformId === null
          ? (body.platformId as string | null)
          : undefined,
      draftId:
        typeof body.draftId === "string" || body.draftId === null
          ? (body.draftId as string | null)
          : undefined,
      contentJobId:
        typeof body.contentJobId === "string" || body.contentJobId === null
          ? (body.contentJobId as string | null)
          : undefined,
      status: body.status,
    });

    return NextResponse.json({ slot, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "invalid_startsAt") {
      return NextResponse.json({ error: "invalid_startsAt" }, { status: 400 });
    }
    if (code === "postId_required") {
      return NextResponse.json({ error: "postId_required" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "upsert_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots] POST", message);
    return NextResponse.json({ error: "upsert_failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ error: "postId_required" }, { status: 400 });
    }
    const { deleteScheduleSlot } = await import("@/lib/db/schedule-repository");
    const ok = await deleteScheduleSlot({
      userId: actor.userId,
      postId,
    });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deletedPostId: postId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
