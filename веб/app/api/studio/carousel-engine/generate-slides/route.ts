/**
 * C-154 / C-carousel-agents — Generate Vernatun Instagram carousel slide images.
 * Razbor default: soft-fail to picsum mock when key missing or all gens fail.
 * Create (surface=create-carousel / noMock): error, never mock success.
 * Never log API key.
 */

import { NextResponse } from "next/server";

import {
  designMarkdownFromRequestHeaders,
  resolveActiveDesignMarkdown,
  resolveActiveDesignPreset,
} from "@/lib/settings/design-active-server";
import { parseDesignPresetFile } from "@/lib/settings/design-preset";
import { runGenerateCarouselSlides } from "@/lib/studio/generate-carousel-slides-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Body = {
  competitorId?: string;
  title?: string;
  captions?: string[];
  visualPrompts?: string[];
  slidesSpec?: Array<{ caption: string; visual_prompt?: string }>;
  slideCount?: number;
  model?: string;
  /** Last agreed Designer description (Create draw / prompts). */
  description?: string;
  /** Active Embla DESIGN.md — preferred over synced file when set. */
  designMarkdown?: string;
  activeDesignMarkdown?: string;
  /** Optional DesignPresetFile from Embla active slot. */
  presetFile?: unknown;
  surface?: "create-carousel" | string;
  noMock?: boolean;
  persistToWaveArtifacts?: boolean;
};

export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const competitorId =
    typeof body.competitorId === "string" ? body.competitorId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const noMock =
    body.noMock === true || body.surface === "create-carousel";

  if (!competitorId || !title) {
    if (!(noMock && description)) {
      return NextResponse.json(
        { ok: false, error: "competitorId_and_title_required" },
        { status: 400 },
      );
    }
  }

  const { headerMarkdown, cookieMarkdown } =
    designMarkdownFromRequestHeaders(req);
  const bodyMd =
    (typeof body.designMarkdown === "string" && body.designMarkdown.trim()) ||
    (typeof body.activeDesignMarkdown === "string" &&
      body.activeDesignMarkdown.trim()) ||
    null;
  const designMarkdown = await resolveActiveDesignMarkdown({
    bodyMarkdown: bodyMd,
    headerMarkdown,
    cookieMarkdown,
  });
  const presetFile =
    parseDesignPresetFile(body.presetFile) ??
    (await resolveActiveDesignPreset({ bodyPreset: null }));

  const result = await runGenerateCarouselSlides({
    competitorId: competitorId || "create-carousel",
    title:
      title ||
      description.slice(0, 80).replace(/\s+/g, " ") ||
      "Carousel",
    captions: Array.isArray(body.captions) ? body.captions : undefined,
    visualPrompts: Array.isArray(body.visualPrompts)
      ? body.visualPrompts
      : undefined,
    slidesSpec: Array.isArray(body.slidesSpec) ? body.slidesSpec : undefined,
    slideCount: body.slideCount,
    model: typeof body.model === "string" ? body.model : undefined,
    description: description || undefined,
    designMarkdown: designMarkdown || undefined,
    presetFile,
    noMock,
    persistToWaveArtifacts: body.persistToWaveArtifacts,
  });

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      source: "error" as const,
      error: result.error,
    });
  }

  return NextResponse.json({
    ok: true,
    sourceMode: result.sourceMode,
    model: result.model,
    slides: result.slides,
    ...(result.artifactDir ? { artifactDir: result.artifactDir } : {}),
    ...(result.budget ? { budget: result.budget } : {}),
  });
}
