/**
 * C-s8-04 — PATCH/DELETE /api/schedule/slots/[id]
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  deleteScheduleSlot,
  getScheduleSlot,
  patchScheduleSlot,
} from "@/lib/db/schedule-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const slot = await getScheduleSlot({ userId: actor.userId, id });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ slot });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots/[id]] GET", message);
    return NextResponse.json({ error: "get_failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const slot = await patchScheduleSlot({
      userId: actor.userId,
      id,
      patch: {
        postId: typeof body.postId === "string" ? body.postId : undefined,
        moduleId: typeof body.moduleId === "string" ? body.moduleId : undefined,
        startsAt: typeof body.startsAt === "string" ? body.startsAt : undefined,
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
      },
    });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ slot, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "invalid_startsAt") {
      return NextResponse.json({ error: "invalid_startsAt" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "patch_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots/[id]] PATCH", message);
    return NextResponse.json({ error: "patch_failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const ok = await deleteScheduleSlot({ userId: actor.userId, id });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/schedule/slots/[id]] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
