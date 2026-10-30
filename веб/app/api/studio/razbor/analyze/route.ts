/**
 * C-razbor-live-haiku-boards — POST /api/studio/razbor/analyze
 * LIVE Haiku Razbor after «Начать разбор». Soft-fail mock only if key missing.
 * Never log API keys.
 */

import { NextResponse } from "next/server";

import type { FeedPost } from "@/lib/studio/feed-types";
import {
  RAZBOR_ANALYST_MODEL,
  runRazborLiveAnalyze,
} from "@/lib/studio/razbor-live-analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type Body = {
  post?: FeedPost | null;
  slideUrls?: string[];
  slideCaptions?: string[];
  moduleId?: string;
  source?: "competitor" | "boards";
  model?: string;
  maxVisionImages?: number;
};

function isFeedPostLike(v: unknown): v is FeedPost {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    o.metrics != null &&
    typeof o.metrics === "object"
  );
}

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

  const post = isFeedPostLike(body.post) ? body.post : null;
  const slideUrls = Array.isArray(body.slideUrls)
    ? body.slideUrls.filter((u): u is string => typeof u === "string")
    : undefined;
  const slideCaptions = Array.isArray(body.slideCaptions)
    ? body.slideCaptions.filter((u): u is string => typeof u === "string")
    : undefined;

  if (!post && (!slideUrls || slideUrls.length === 0)) {
    return NextResponse.json(
      { ok: false, error: "post_or_slides_required" },
      { status: 400 },
    );
  }

  const result = await runRazborLiveAnalyze({
    post,
    slideUrls,
    slideCaptions,
    moduleId:
      typeof body.moduleId === "string" ? body.moduleId.trim() : undefined,
    source: body.source === "boards" ? "boards" : "competitor",
    model:
      typeof body.model === "string" && body.model.trim()
        ? body.model.trim()
        : RAZBOR_ANALYST_MODEL,
    maxVisionImages:
      typeof body.maxVisionImages === "number"
        ? body.maxVisionImages
        : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        source: "error" as const,
      },
      { status: 200 },
    );
  }

  const a = result.analysis;
  return NextResponse.json({
    ok: true,
    source: result.source,
    model: result.model,
    ...(result.source === "mock"
      ? { softFailReason: result.softFailReason }
      : {}),
    competitorSlides: result.competitorSlides,
    analysis: {
      summary: a.summary,
      hook: a.hook,
      middle: a.middle,
      cta: a.cta,
      viralityWhy: a.viralityWhy,
      trainerTasks: a.trainerTasks,
      handoffBrief: a.handoffBrief,
      displayText: a.displayText,
      rawJson: a.rawJson,
    },
    /** Flat fields for FE convenience */
    displayText: a.displayText,
    handoffBrief: a.handoffBrief,
    trainerTasks: a.trainerTasks,
  });
}
