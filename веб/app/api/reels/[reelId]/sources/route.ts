import { NextResponse } from "next/server";
import { addSourceFile, removeSource } from "@/lib/studio/reels-framework/manager";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ reelId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await addSourceFile({
    reelId,
    fileName: file.name || "upload.mp4",
    mime: file.type || "video/mp4",
    buffer,
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { reelId } = await ctx.params;
  const url = new URL(req.url);
  const assetId = url.searchParams.get("assetId");
  if (!assetId) {
    return NextResponse.json({ ok: false, error: "assetId_required" }, { status: 400 });
  }
  const result = removeSource(reelId, assetId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
