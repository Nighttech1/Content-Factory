import { NextResponse } from "next/server";
import { generateScriptAndStoryboard } from "@/lib/studio/reels-framework/agents/script-storyboard";
import { getReel, upsertReel } from "@/lib/studio/reels-framework/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const result = generateScriptAndStoryboard(reelId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const reel = getReel(reelId);
  if (!reel) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const body = (await req.json()) as { script?: Record<string, unknown> };
  if (!body.script) {
    return NextResponse.json({ ok: false, error: "script_required" }, { status: 400 });
  }
  const version = (reel.script?.version ?? 0) + 1;
  const next = upsertReel({
    ...reel,
    script: {
      version,
      createdAt: new Date().toISOString(),
      script: body.script,
      storyboard: reel.script?.storyboard,
    },
    status: "SCRIPT_READY",
  });
  return NextResponse.json({ ok: true, reel: next });
}
