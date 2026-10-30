/**
 * GET/PUT /api/settings/publicist — auto|manual schedule prefs.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  getPublicistSettings,
  putPublicistSettings,
} from "@/lib/settings/publicist-settings-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const settings = await getPublicistSettings(actor.userId);
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "publicist_get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/publicist] GET", message);
    return NextResponse.json(
      { error: "publicist_get_failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const settings = await putPublicistSettings(actor.userId, {
      mode:
        body.mode === "auto" || body.mode === "manual" ? body.mode : undefined,
      defaultPublishHour:
        typeof body.defaultPublishHour === "number"
          ? body.defaultPublishHour
          : undefined,
      defaultPublishMinute:
        typeof body.defaultPublishMinute === "number"
          ? body.defaultPublishMinute
          : undefined,
      daysAhead:
        typeof body.daysAhead === "number" ? body.daysAhead : undefined,
      platformId:
        typeof body.platformId === "string" || body.platformId === null
          ? (body.platformId as string | null)
          : undefined,
    });

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "publicist_put_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/publicist] PUT", message);
    return NextResponse.json(
      { error: "publicist_put_failed" },
      { status: 500 },
    );
  }
}
