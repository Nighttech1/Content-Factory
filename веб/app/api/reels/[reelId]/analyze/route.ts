import { NextResponse } from "next/server";
import { analyzeFootage } from "@/lib/studio/reels-framework/agents/footage-analyzer";
import { runCreativeDirector } from "@/lib/studio/reels-framework/agents/creative-director";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    thenDirector?: boolean;
  };
  const analysis = await analyzeFootage(reelId);
  if (!analysis.ok) {
    return NextResponse.json(analysis, { status: 400 });
  }
  if (body.thenDirector) {
    const cd = runCreativeDirector({
      reelId,
      analysis: analysis.report,
    });
    return NextResponse.json({ ok: true, analysis: analysis.report, director: cd });
  }
  return NextResponse.json({ ok: true, reel: analysis.reel, report: analysis.report });
}
