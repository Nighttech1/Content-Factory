/**
 * C-s8-03 — GET/POST /api/studio/boards
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { listBoards, upsertBoard } from "@/lib/db/boards-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const boards = await listBoards(actor.userId);
    return NextResponse.json({ boards, userId: actor.userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "list_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards] GET", message);
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

    const board = await upsertBoard(actor.userId, {
      id: typeof body.id === "string" ? body.id : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      slideUrls: body.slideUrls,
      createdAt:
        typeof body.createdAt === "number" || typeof body.createdAt === "string"
          ? (body.createdAt as number | string)
          : undefined,
    });

    return NextResponse.json({ board, ok: true });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "create_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards] POST", message);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
