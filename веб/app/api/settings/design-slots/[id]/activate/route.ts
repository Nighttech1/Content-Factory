/**
 * C-s8-05 — POST /api/settings/design-slots/[id]/activate
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { activateDesignSlot } from "@/lib/db/design-slots-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const { id } = await ctx.params;
    const slot = await activateDesignSlot({ userId: actor.userId, id });
    if (!slot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      slot,
      activeId: slot.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "activate_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/settings/design-slots/activate]", message);
    return NextResponse.json({ error: "activate_failed" }, { status: 500 });
  }
}
