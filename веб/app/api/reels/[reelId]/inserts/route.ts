import { NextResponse } from "next/server";
import { findAndOptionallyApplyInserts } from "@/lib/studio/reels-framework/agents/insert-finder";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { applyAuto?: boolean };
  const result = await findAndOptionallyApplyInserts({
    reelId,
    applyAuto: body.applyAuto === true,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
