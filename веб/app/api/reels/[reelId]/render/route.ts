import { NextResponse } from "next/server";
import {
  buildAndSaveSimplePlan,
  renderReel,
} from "@/lib/studio/reels-framework/manager";
import { runCreativeDirector } from "@/lib/studio/reels-framework/agents/creative-director";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    useCreativeDirector?: boolean;
  };

  if (body.useCreativeDirector) {
    const cd = runCreativeDirector({ reelId });
    if (!cd.ok) {
      return NextResponse.json(cd, { status: 400 });
    }
  } else {
    const plan = buildAndSaveSimplePlan(reelId);
    if (!plan.ok) {
      return NextResponse.json(plan, { status: 400 });
    }
  }

  const result = await renderReel(reelId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
