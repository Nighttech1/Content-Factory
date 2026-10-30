/**
 * C-s8-03 — PATCH/DELETE /api/studio/boards/[id]
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  boardOwnedByOther,
  deleteBoard,
  getBoard,
  patchBoard,
} from "@/lib/db/boards-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await boardOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const board = await getBoard({ userId: actor.userId, id });
    if (!board) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ board });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards/[id]] GET", message);
    return NextResponse.json({ error: "get_failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await boardOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const board = await patchBoard({
      userId: actor.userId,
      id,
      patch: {
        title: typeof body.title === "string" ? body.title : undefined,
        slideUrls: body.slideUrls,
      },
    });
    if (!board) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ board, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "patch_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards/[id]] PATCH", message);
    return NextResponse.json({ error: "patch_failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await boardOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const ok = await deleteBoard({ userId: actor.userId, id });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards/[id]] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
