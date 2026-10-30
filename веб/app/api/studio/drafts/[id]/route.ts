/**
 * C-s8-02 — GET/PATCH/DELETE /api/studio/drafts/[id]
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  deleteDraft,
  draftOwnedByOther,
  getDraft,
  patchDraft,
} from "@/lib/db/drafts-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(
  req: Request,
  ctx: Ctx,
): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await draftOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const draft = await getDraft({ userId: actor.userId, id });
    if (!draft) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/drafts/[id]] GET", message);
    return NextResponse.json({ error: "get_failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: Ctx,
): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await draftOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const draft = await patchDraft({
      userId: actor.userId,
      id,
      patch: {
        moduleId: typeof body.moduleId === "string" ? body.moduleId : undefined,
        title: typeof body.title === "string" ? body.title : undefined,
        slides: body.slides,
        scenario:
          typeof body.scenario === "string" || body.scenario === null
            ? (body.scenario as string | null)
            : undefined,
        status: body.status,
        sourceCompetitorId: body.sourceCompetitorId,
        competitorId: body.competitorId,
        brand: body.brand,
        payload: body.payload,
        contentJobId:
          typeof body.contentJobId === "string" || body.contentJobId === null
            ? (body.contentJobId as string | null)
            : undefined,
      },
    });
    if (!draft) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ draft, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "patch_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/drafts/[id]] PATCH", message);
    return NextResponse.json({ error: "patch_failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: Ctx,
): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    if (await draftOwnedByOther({ userId: actor.userId, id })) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const ok = await deleteDraft({ userId: actor.userId, id });
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/drafts/[id]] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
