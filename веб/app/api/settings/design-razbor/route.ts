/**
 * C-settings-design-md-carousel + C-visual-style-deconstructor —
 * POST image → DESIGN.md + HTML + DesignPresetFile (compat path).
 *
 * Settings Design CTA «Добавить новый дизайн» (not RazborModal).
 * Prefer `/api/settings/design-deconstruct` for typed deconstruct;
 * this route stays for existing FE callers and now returns presetFile too.
 *
 * Soft-fail without AGGREGATOR_API_KEY → source:"mock" (never wipe client library).
 * Never log API keys or full base64 blobs.
 */

import { NextResponse } from "next/server";

import type { DesignFromImageResponse } from "@/lib/settings/design-library";
import { deconstructStyle } from "@/lib/studio/deconstruct-style";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ApiResponse = DesignFromImageResponse & {
  ok: boolean;
  title?: string;
  error?: string;
};

async function fileToDataUrl(
  file: File,
): Promise<{ dataUrl: string } | { error: string }> {
  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!ALLOWED.has(mime)) {
    return { error: "unsupported_image_type" };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { error: "image_too_large" };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return { dataUrl: `data:${mime};base64,${buf.toString("base64")}` };
}

/**
 * POST /api/settings/design-razbor
 * multipart/form-data: `image` | `file` (+ optional `title`)
 * JSON: { imageBase64, mimeType?, fileName?, title? }
 */
export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";
  let dataUrl: string | null = null;
  let fileName: string | undefined;
  let requestedTitle: string | undefined;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file =
        (form.get("image") as File | null) ||
        (form.get("file") as File | null);
      const titleField = form.get("title");
      if (typeof titleField === "string" && titleField.trim()) {
        requestedTitle = titleField.trim();
      }
      if (!file || typeof file === "string" || !file.size) {
        return NextResponse.json(
          {
            ok: false,
            markdown: "",
            source: "mock",
            error: "image_required",
          } satisfies ApiResponse,
          { status: 400 },
        );
      }
      fileName = typeof file.name === "string" ? file.name : undefined;
      const converted = await fileToDataUrl(file);
      if ("error" in converted) {
        return NextResponse.json(
          {
            ok: false,
            markdown: "",
            source: "mock",
            error: converted.error,
          } satisfies ApiResponse,
          { status: 400 },
        );
      }
      dataUrl = converted.dataUrl;
    } else {
      const body = (await req.json()) as {
        imageBase64?: string;
        mimeType?: string;
        fileName?: string;
        title?: string;
      };
      if (typeof body.title === "string" && body.title.trim()) {
        requestedTitle = body.title.trim();
      }
      if (typeof body.fileName === "string" && body.fileName.trim()) {
        fileName = body.fileName.trim();
      }
      const raw =
        typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
      if (!raw) {
        return NextResponse.json(
          {
            ok: false,
            markdown: "",
            source: "mock",
            error: "image_required",
          } satisfies ApiResponse,
          { status: 400 },
        );
      }
      if (raw.startsWith("data:")) {
        dataUrl = raw;
      } else {
        const mime =
          typeof body.mimeType === "string" && body.mimeType.trim()
            ? body.mimeType.trim().toLowerCase()
            : "image/jpeg";
        if (!ALLOWED.has(mime)) {
          return NextResponse.json(
            {
              ok: false,
              markdown: "",
              source: "mock",
              error: "unsupported_image_type",
            } satisfies ApiResponse,
            { status: 400 },
          );
        }
        dataUrl = `data:${mime};base64,${raw.replace(/^base64,/, "")}`;
      }
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        markdown: "",
        source: "mock",
        error: "invalid_body",
      } satisfies ApiResponse,
      { status: 400 },
    );
  }

  if (!dataUrl) {
    return NextResponse.json(
      {
        ok: false,
        markdown: "",
        source: "mock",
        error: "image_required",
      } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const nameHint =
    requestedTitle ||
    fileName?.replace(/\.[^.]+$/, "").trim() ||
    "DESIGN.md";

  const result = await deconstructStyle({
    imageDataUrl: dataUrl,
    nameHint,
  });

  return NextResponse.json({
    ok: true,
    markdown: result.markdown,
    html: result.html,
    source: result.source,
    name: result.presetFile.name,
    title: result.presetFile.name,
    presetFile: result.presetFile,
    ...(result.error ? { error: result.error } : {}),
  } satisfies ApiResponse);
}
