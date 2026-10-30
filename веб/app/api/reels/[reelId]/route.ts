import { NextResponse } from "next/server";
import { getReel, upsertReel } from "@/lib/studio/reels-framework/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const reel = getReel(reelId);
  if (!reel) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, reel });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const reel = getReel(reelId);
  if (!reel) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const body = (await req.json()) as {
    topic?: string;
    styleProfileId?: string;
    settingsOverride?: Record<string, unknown>;
    status?: string;
  };
  const next = upsertReel({
    ...reel,
    topic: body.topic?.trim() || reel.topic,
    styleProfileId: body.styleProfileId || reel.styleProfileId,
    settingsOverride: body.settingsOverride ?? reel.settingsOverride,
  });
  return NextResponse.json({ ok: true, reel: next });
}
