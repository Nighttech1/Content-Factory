/**
 * GET/DELETE /api/settings/landscapes/:number
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import {
  deleteLandscape,
  getLandscape,
} from "@/lib/settings/landscapes-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ number: string }> };

export async function GET(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { number: raw } = await ctx.params;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      return NextResponse.json({ error: "invalid_number" }, { status: 400 });
    }
    const character = await getLandscape(actor.userId, n);
    if (!character) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, character });
  } catch (err) {
    const message = err instanceof Error ? err.message : "get_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/landscapes/n] GET", message);
    return NextResponse.json({ error: "get_failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { number: raw } = await ctx.params;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) {
      return NextResponse.json({ error: "invalid_number" }, { status: 400 });
    }
    const ok = await deleteLandscape(actor.userId, n);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: n });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delete_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/landscapes/n] DELETE", message);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
