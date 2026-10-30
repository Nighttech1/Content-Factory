/**
 * C-s8-06 — POST /api/studio/migrate-local
 * One-shot idempotent import of legacy localStorage payloads.
 * Frontend-minimal wire is a separate step — this route is API only.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { migrateLocalPayload } from "@/lib/db/migrate-local";
import { resolveSprint8Db } from "@/lib/db/sprint8-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { mode } = await resolveSprint8Db();
    const result = await migrateLocalPayload(actor.userId, {
      drafts: body.drafts,
      boards: body.boards,
      schedule: body.schedule,
      designLibrary: body.designLibrary,
      designActiveId: body.designActiveId,
    });

    return NextResponse.json({
      ...result,
      userId: actor.userId,
      storeMode: mode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "migrate_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/migrate-local]", message);
    return NextResponse.json({ error: "migrate_failed" }, { status: 500 });
  }
}
