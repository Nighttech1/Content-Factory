import { NextResponse } from "next/server";
import { applyNaturalLanguageRevision } from "@/lib/studio/reels-framework/agents/revision-manager";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const body = (await req.json()) as {
    feedback?: string;
    render?: boolean;
  };
  if (!body.feedback?.trim()) {
    return NextResponse.json({ ok: false, error: "feedback_required" }, { status: 400 });
  }
  const result = await applyNaturalLanguageRevision({
    reelId,
    feedback: body.feedback.trim(),
    render: body.render === true,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
