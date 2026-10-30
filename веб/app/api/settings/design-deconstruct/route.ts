/**
 * C-visual-style-deconstructor — POST image(s) → DesignPresetFile + DESIGN.md + HTML kit.
 *
 * Settings «Создать из референса» / «Добавить новый дизайн».
 * Wave layout-copy: 4-up grid (cover·midA·midB·cta) → layoutMap persist.
 * Soft-fail without AGGREGATOR_API_KEY → source:"mock" (never wipe client library).
 * Never log API keys or full base64 blobs.
 */

import { NextResponse } from "next/server";

import { deconstructStyle } from "@/lib/studio/deconstruct-style";
import type { DeconstructStyleResponse } from "@/lib/settings/design-preset";

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

type ApiResponse = DeconstructStyleResponse & {
  ok: boolean;
  title?: string;
  name?: string;
  error?: string;
  gridMode?: boolean;
  referenceCount?: number;
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

function rawToDataUrl(
  raw: string,
  mimeType?: string,
): { dataUrl: string } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "image_required" };
  if (trimmed.startsWith("data:")) return { dataUrl: trimmed };
  const mime =
    typeof mimeType === "string" && mimeType.trim()
      ? mimeType.trim().toLowerCase()
      : "image/jpeg";
  if (!ALLOWED.has(mime)) return { error: "unsupported_image_type" };
  return { dataUrl: `data:${mime};base64,${trimmed.replace(/^base64,/, "")}` };
}

/**
 * POST /api/settings/design-deconstruct
 * multipart: `image` | `file` | `images` (repeat) | `cover`/`midA`/`midB`/`cta`
 * JSON: { imageBase64 } | { imagesBase64: string[], gridMode?, title? }
 */
export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";
  const dataUrls: string[] = [];
  let fileName: string | undefined;
  let requestedTitle: string | undefined;
  let gridMode = false;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const titleField = form.get("title");
      if (typeof titleField === "string" && titleField.trim()) {
        requestedTitle = titleField.trim();
      }
      const gridField = form.get("gridMode");
      if (
        gridField === "1" ||
        gridField === "true" ||
        gridField === "yes"
      ) {
        gridMode = true;
      }

      const namedKeys = ["cover", "midA", "midB", "cta"] as const;
      for (const key of namedKeys) {
        const f = form.get(key);
        if (f && typeof f !== "string" && f.size) {
          const converted = await fileToDataUrl(f);
          if ("error" in converted) {
            return NextResponse.json(
              {
                ok: false,
                markdown: "",
                source: "mock",
                error: converted.error,
              },
              { status: 400 },
            );
          }
          dataUrls.push(converted.dataUrl);
          if (!fileName && typeof f.name === "string") fileName = f.name;
        }
      }

      const multi = form.getAll("images");
      for (const f of multi) {
        if (f && typeof f !== "string" && f.size) {
          const converted = await fileToDataUrl(f);
          if ("error" in converted) {
            return NextResponse.json(
              {
                ok: false,
                markdown: "",
                source: "mock",
                error: converted.error,
              },
              { status: 400 },
            );
          }
          dataUrls.push(converted.dataUrl);
          if (!fileName && typeof f.name === "string") fileName = f.name;
        }
      }

      if (!dataUrls.length) {
        const file =
          (form.get("image") as File | null) ||
          (form.get("file") as File | null);
        if (!file || typeof file === "string" || !file.size) {
          return NextResponse.json(
            {
              ok: false,
              markdown: "",
              source: "mock",
              error: "image_required",
            },
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
            },
            { status: 400 },
          );
        }
        dataUrls.push(converted.dataUrl);
      }
    } else {
      const body = (await req.json()) as {
        imageBase64?: string;
        imagesBase64?: string[];
        mimeType?: string;
        fileName?: string;
        title?: string;
        gridMode?: boolean;
      };
      if (typeof body.title === "string" && body.title.trim()) {
        requestedTitle = body.title.trim();
      }
      if (typeof body.fileName === "string" && body.fileName.trim()) {
        fileName = body.fileName.trim();
      }
      if (body.gridMode === true) gridMode = true;

      if (Array.isArray(body.imagesBase64) && body.imagesBase64.length) {
        for (const raw of body.imagesBase64) {
          if (typeof raw !== "string") continue;
          const converted = rawToDataUrl(raw, body.mimeType);
          if ("error" in converted) {
            return NextResponse.json(
              {
                ok: false,
                markdown: "",
                source: "mock",
                error: converted.error,
              },
              { status: 400 },
            );
          }
          dataUrls.push(converted.dataUrl);
        }
      } else {
        const raw =
          typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
        if (!raw) {
          return NextResponse.json(
            {
              ok: false,
              markdown: "",
              source: "mock",
              error: "image_required",
            },
            { status: 400 },
          );
        }
        const converted = rawToDataUrl(raw, body.mimeType);
        if ("error" in converted) {
          return NextResponse.json(
            {
              ok: false,
              markdown: "",
              source: "mock",
              error: converted.error,
            },
            { status: 400 },
          );
        }
        dataUrls.push(converted.dataUrl);
      }
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        markdown: "",
        source: "mock",
        error: "invalid_body",
      },
      { status: 400 },
    );
  }

  if (!dataUrls.length) {
    return NextResponse.json(
      {
        ok: false,
        markdown: "",
        source: "mock",
        error: "image_required",
      },
      { status: 400 },
    );
  }

  if (dataUrls.length >= 4) gridMode = true;

  const nameHint =
    requestedTitle ||
    fileName?.replace(/\.[^.]+$/, "").trim() ||
    "DESIGN.md";

  const result = await deconstructStyle({
    imageDataUrls: dataUrls,
    imageDataUrl: dataUrls[0],
    nameHint,
    gridMode,
  });

  return NextResponse.json({
    ok: true,
    presetFile: result.presetFile,
    markdown: result.markdown,
    html: result.html,
    source: result.source,
    name: result.presetFile.name,
    title: result.presetFile.name,
    gridMode,
    referenceCount: dataUrls.length,
    ...(result.error ? { error: result.error } : {}),
  } satisfies ApiResponse);
}
