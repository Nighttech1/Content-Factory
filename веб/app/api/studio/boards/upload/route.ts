/**
 * C-s8-03 — POST /api/studio/boards/upload
 * Accepts multipart file(s) or JSON { dataUrl | dataUrls | base64 }.
 * Writes under generatedMedia/boards/{userId}/ — never deletes unrelated media.
 */

import { NextResponse } from "next/server";

import { resolveActor } from "@/lib/db/actor";
import { uploadBoardMedia } from "@/lib/db/boards-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  try {
    const actor = await resolveActor(req);
    const contentType = req.headers.get("content-type") ?? "";
    const urls: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("file").concat(form.getAll("files"));
      for (const entry of files) {
        if (!(entry instanceof File)) continue;
        const buf = Buffer.from(await entry.arrayBuffer());
        const mime = entry.type || "application/octet-stream";
        const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
        const uploaded = await uploadBoardMedia({
          userId: actor.userId,
          dataUrlOrBase64: dataUrl,
          filenameHint: entry.name,
        });
        urls.push(uploaded.url);
      }
      const dataUrlField = form.get("dataUrl");
      if (typeof dataUrlField === "string" && dataUrlField) {
        const uploaded = await uploadBoardMedia({
          userId: actor.userId,
          dataUrlOrBase64: dataUrlField,
        });
        urls.push(uploaded.url);
      }
    } else {
      let body: Record<string, unknown>;
      try {
        body = (await req.json()) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: "invalid_json" }, { status: 400 });
      }

      const list: string[] = [];
      if (typeof body.dataUrl === "string") list.push(body.dataUrl);
      if (typeof body.base64 === "string") list.push(body.base64);
      if (Array.isArray(body.dataUrls)) {
        for (const u of body.dataUrls) {
          if (typeof u === "string") list.push(u);
        }
      }
      if (list.length === 0) {
        return NextResponse.json({ error: "no_files" }, { status: 400 });
      }
      for (const item of list) {
        const uploaded = await uploadBoardMedia({
          userId: actor.userId,
          dataUrlOrBase64: item,
          filenameHint:
            typeof body.filename === "string" ? body.filename : undefined,
        });
        urls.push(uploaded.url);
      }
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: "no_files" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      urls,
      url: urls[0],
    });
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "empty_upload") {
      return NextResponse.json({ error: "empty_upload" }, { status: 400 });
    }
    if (code === "upload_too_large") {
      return NextResponse.json({ error: "upload_too_large" }, { status: 413 });
    }
    const message = err instanceof Error ? err.message : "upload_failed";
    // eslint-disable-next-line no-console -- operational; no secrets
    console.error("[api/studio/boards/upload]", message);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
