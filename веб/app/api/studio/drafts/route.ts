/**
 * C-s8-02 — GET/POST /api/studio/drafts
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { listDrafts, upsertDraft } from "@/lib/db/drafts-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const url = new URL(req.url);
    const moduleId = url.searchParams.get("moduleId");
    const drafts = await listDrafts({
      userId: actor.userId,
      moduleId: moduleId?.trim() || null,
    });
    return NextResponse.json({
      drafts,
      userId: actor.userId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/drafts] GET", message);
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

    const draft = await upsertDraft(actor.userId, {
      id: typeof body.id === "string" ? body.id : undefined,
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
      createdAt: typeof body.createdAt === "string" ? body.createdAt : undefined,
      updatedAt: typeof body.updatedAt === "string" ? body.updatedAt : undefined,
    });

    return NextResponse.json({ draft, ok: true }, { status: 200 });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "upsert_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/drafts] POST", message);
    return NextResponse.json({ error: "upsert_failed" }, { status: 500 });
  }
}
