/**
 * GET/PUT/POST /api/settings/landscapes — character catalog CRUD.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  listLandscapes,
  putLandscapes,
  upsertLandscape,
} from "@/lib/settings/landscapes-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const characters = await listLandscapes(actor.userId);
    return NextResponse.json({ ok: true, characters });
  } catch (err) {
    const message = err instanceof Error ? err.message : "landscapes_get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/landscapes] GET", message);
    return NextResponse.json(
      { error: "landscapes_get_failed" },
      { status: 500 },
    );
  }
}

/** Full replace catalog. */
export async function PUT(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const raw = Array.isArray(body.characters) ? body.characters : body;
    const list = Array.isArray(raw) ? raw : [];
    const characters = await putLandscapes(
      actor.userId,
      list.map((c) => {
        const row = c as Record<string, unknown>;
        return {
          number: typeof row.number === "number" ? row.number : undefined,
          name: typeof row.name === "string" ? row.name : "",
          photoUrls: Array.isArray(row.photoUrls)
            ? (row.photoUrls as string[])
            : [],
        };
      }),
    );
    return NextResponse.json({ ok: true, characters });
  } catch (err) {
    const message = err instanceof Error ? err.message : "landscapes_put_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/landscapes] PUT", message);
    return NextResponse.json(
      { error: "landscapes_put_failed" },
      { status: 500 },
    );
  }
}

/** Upsert one character. */
export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }

    const character = await upsertLandscape(actor.userId, {
      number: typeof body.number === "number" ? body.number : undefined,
      name: body.name,
      photoUrls: Array.isArray(body.photoUrls)
        ? (body.photoUrls as string[])
        : undefined,
    });
    return NextResponse.json({ ok: true, character });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "name_required") {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "landscapes_post_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/landscapes] POST", message);
    return NextResponse.json(
      { error: "landscapes_post_failed" },
      { status: 500 },
    );
  }
}
