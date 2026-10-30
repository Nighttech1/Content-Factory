/**
 * Bridge: legacy runCreateCarouselDraw shape ← Vernatun orchestrator.
 * Product path — old layered/e2e/correct unused unless CAROUSEL_LEGACY_DRAW=1.
 * Avoid importing carousel-html-renderer (circular with dynamic import there).
 */

import type { CarouselHandoffJson } from "@/lib/studio/carousel-json-contract";
import { createCarouselErrorMessage } from "@/lib/studio/agent-chat-soft-ack";
import { runVernatunCarouselJob } from "./orchestrator";
import type {
  BuildMode,
  VernatunProgressFn,
  VernatunScript,
  VernatunSlideScript,
} from "./types";

type DrawSlideOut = {
  id: string;
  index: number;
  imageUrl: string;
  caption: string;
  alt_text: string;
};

export type VernatunDrawBridgeResult =
  | {
      ok: true;
      slides: DrawSlideOut[];
      model: string;
      renderMode: "layered_html" | "e2e_diffusion";
      jobId?: string;
      status?: string;
      remarks?: string[];
      needsReview?: boolean;
      visionFailures?: Array<{
        slide: number;
        reason: string;
        gensUsed: number;
      }>;
      artifactDir?: string;
    }
  | {
      ok: false;
      source: "error";
      error: { code: string; message: string };
      jobId?: string;
    };

function handoffToScript(json: CarouselHandoffJson): VernatunScript {
  const slides: VernatunSlideScript[] = (json.slides ?? []).map((s, i) => {
    const row = s as {
      primary_copy?: string;
      secondary_copy?: string;
      visual_prompt?: string;
      image_prompt?: string;
      cta?: string;
    };
    return {
      index: i + 1,
      role:
        i === 0
          ? "cover"
          : i === (json.slides?.length ?? 1) - 1
            ? "cta"
            : "body",
      headline: String(row.primary_copy ?? "").trim() || `Слайд ${i + 1}`,
      body: String(row.secondary_copy ?? "").trim(),
      supporting_copy: undefined,
      cta: typeof row.cta === "string" ? row.cta : undefined,
      visual_intent: String(
        row.visual_prompt ?? row.image_prompt ?? "documentary photo",
      ).trim(),
      facts_to_verify: [],
    };
  });
  const title =
    String(json.idea ?? "").trim() ||
    String(json.hook ?? "").trim() ||
    "Карусель";
  return {
    carousel_title: title,
    audience: "Vernatun",
    central_thesis: title,
    slides,
  };
}

function mapVernatunResult(
  result: Awaited<ReturnType<typeof runVernatunCarouselJob>>,
  buildMode: BuildMode,
): VernatunDrawBridgeResult {
  if (!result.ok || result.slides.length === 0) {
    return {
      ok: false,
      source: "error",
      error: {
        code: "vernatun_draw_fail",
        message:
          result.error ||
          result.remarks[0] ||
          createCarouselErrorMessage("generate_slides_fail"),
      },
    };
  }

  const slides: DrawSlideOut[] = result.slides.map((s) => ({
    id: s.id,
    index: s.index,
    caption: s.caption,
    imageUrl: s.imageUrl,
    alt_text: s.caption.slice(0, 120) || `Слайд ${s.index}`,
  }));

  return {
    ok: true,
    slides,
    model: "vernatun-orchestrator",
    renderMode: "e2e_diffusion",
    jobId: result.jobId,
    status: result.status,
    remarks: result.remarks,
    needsReview: result.status === "BLOCKED_WITH_REMARKS",
    visionFailures:
      result.status === "BLOCKED_WITH_REMARKS"
        ? result.remarks.slice(0, 8).map((reason, i) => ({
            slide: i + 1,
            reason,
            gensUsed: result.repairCycles,
          }))
        : undefined,
    artifactDir: result.jobDir,
  };
}

/**
 * Product Create path: topic + slideCount → full Vernatun job (script inside).
 * Default slideCount = 4.
 */
export async function runVernatunFromTopic(opts: {
  topic: string;
  slideCount?: number;
  buildMode?: BuildMode;
  jobId?: string;
  onProgress?: VernatunProgressFn;
  /** Chat repair notes after preview (O6). */
  styleNotes?: string;
  userAssets?: import("./types").UserAssetRecord[];
}): Promise<VernatunDrawBridgeResult> {
  // Mode A removed — always full AI slide generation (Mode B).
  const buildMode: BuildMode = "B";
  const rawCount = opts.slideCount ?? 4;
  const slideCount = Math.min(
    12,
    Math.max(2, Number.isFinite(rawCount) ? Math.round(rawCount) : 4),
  );
  const topic = opts.topic.trim() || "Карусель";

  const result = await runVernatunCarouselJob({
    jobId: opts.jobId,
    onProgress: opts.onProgress,
    brief: {
      topic,
      slideCount,
      buildMode,
      skipScriptApproval: true,
      maxRepairCycles: 0,
      styleNotes: opts.styleNotes,
      useUserAssets: Boolean(opts.userAssets?.length),
      userAssets: opts.userAssets,
    },
  });

  return mapVernatunResult(result, buildMode);
}

export async function runVernatunAsCreateDraw(
  json: CarouselHandoffJson,
  opts?: {
    buildMode?: BuildMode;
    jobId?: string;
    topic?: string;
    onProgress?: VernatunProgressFn;
  },
): Promise<VernatunDrawBridgeResult> {
  const script = handoffToScript(json);
  // Mode A removed — always full AI slide generation (Mode B).
  const buildMode: BuildMode = "B";

  const result = await runVernatunCarouselJob({
    jobId: opts?.jobId,
    approvedScript: script,
    onProgress: opts?.onProgress,
    brief: {
      topic:
        opts?.topic ||
        String(json.idea ?? "").trim() ||
        String(json.hook ?? "").trim() ||
        "Карусель",
      slideCount: script.slides.length,
      buildMode,
      skipScriptApproval: true,
    },
  });

  return mapVernatunResult(result, buildMode);
}

export function isVernatunProductPathEnabled(): boolean {
  return process.env.CAROUSEL_LEGACY_DRAW?.trim() !== "1";
}
