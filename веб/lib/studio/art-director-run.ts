/**
 * Backend Art Director runner — vision/LLM critique once after finals.
 * HARD: NEVER enqueue remake / redraw / re-composite.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { appendAgentLog } from "@/lib/agents/agent-run-log-store";
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import {
  type ArtDirectorVerdict,
  type CarouselHandoffJson,
  type HtmlLayout,
} from "@/lib/studio/carousel-json-contract";
import {
  ART_DIRECTOR_AGENT_ID,
  ART_DIRECTOR_DEFAULT_MODEL,
  ART_DIRECTOR_SYSTEM_PROMPT,
  buildArtDirectorReviewMessages,
  parseArtDirectorReviewResponse,
  resolveArtDirectorModel,
  type ArtDirectorReviewInput,
  type ArtDirectorSlideMeta,
} from "@/lib/studio/art-director-review";

/**
 * Art Director vision model — Gemini flash by default.
 * Env `ART_DIRECTOR_MODEL` wins via `resolveArtDirectorModel`.
 * Do NOT fall through CAROUSEL_VISION_MODEL → openai/gpt-4o.
 */
export const ART_DIRECTOR_VISION_MODEL = resolveArtDirectorModel(
  process.env.ART_DIRECTOR_MODEL,
);

/** Re-export for smoke / Tester guards. */
export { resolveArtDirectorModel, ART_DIRECTOR_DEFAULT_MODEL };

async function fileToDataUri(absPath: string): Promise<string | null> {
  try {
    const buf = await fs.readFile(absPath);
    if (buf.length < 32) return null;
    const ext = path.extname(absPath).toLowerCase();
    const mime =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
          ? "image/webp"
          : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function resolveImageForVision(urlOrPath: string): Promise<string | null> {
  const raw = urlOrPath.trim();
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const candidates = [
    path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw),
    path.join(process.cwd(), "public", raw.replace(/^\//, "")),
    path.join(process.cwd(), raw.replace(/^\//, "")),
  ];
  for (const abs of candidates) {
    const data = await fileToDataUri(abs);
    if (data) return data;
  }
  return null;
}

export type RunArtDirectorReviewInput = {
  userId: string;
  draftId?: string;
  jobId?: string;
  /** Absolute paths or https/data URLs to final PNGs (ordered). */
  slideUrls: string[];
  handoff?: CarouselHandoffJson | null;
  htmlLayouts?: Array<HtmlLayout | null | undefined>;
  briefMeta?: ArtDirectorReviewInput["briefMeta"];
  model?: string;
  /** Persist agent log (default true). */
  appendLog?: boolean;
};

export type RunArtDirectorReviewResult =
  | {
      ok: true;
      verdict: ArtDirectorVerdict;
      model: string;
      source: "vision" | "llm_text";
      /** Always false — documented for Tester no-remake guard. */
      remakeEnqueued: false;
    }
  | {
      ok: false;
      error: string;
      remakeEnqueued: false;
    };

function buildSlideMeta(
  slideUrls: string[],
  handoff?: CarouselHandoffJson | null,
  htmlLayouts?: Array<HtmlLayout | null | undefined>,
): ArtDirectorSlideMeta[] {
  return slideUrls.map((url, i) => {
    const sw = handoff?.slides[i];
    const layout = htmlLayouts?.[i] ?? sw?.html_layout ?? null;
    return {
      slideIndex: i + 1,
      pngUrlOrPath: url,
      layout_variant: sw?.layout_variant,
      primary_copy: sw?.primary_copy,
      secondary_copy: sw?.secondary_copy,
      cta_type: sw?.cta_type,
      html_layout: layout,
      template: layout?.template,
    };
  });
}

/**
 * Run Art Director critique once. Does NOT trigger remake under any verdict.
 */
export async function runArtDirectorReview(
  input: RunArtDirectorReviewInput,
): Promise<RunArtDirectorReviewResult> {
  const remakeEnqueued = false as const;

  if (!input.slideUrls.length) {
    const verdict: ArtDirectorVerdict = {
      verdict: "remarks",
      summary: "Нет финальных слайдов для ревью — ассеты отсутствуют.",
      remarks: [
        {
          slideIndex: 1,
          category: "missing_assets",
          severity: "P0",
          note: "Передай slide_0N.png пути/URL Арт-директору; без PNG approve запрещён.",
        },
      ],
      score: 0,
    };
    if (input.appendLog !== false) {
      await appendAgentLog({
        userId: input.userId,
        agentId: ART_DIRECTOR_AGENT_ID,
        agentRole: "art-director",
        jobId: input.jobId,
        level: "red",
        message: `AD missing_assets: ${verdict.summary}`,
        meta: {
          draftId: input.draftId,
          verdict: verdict.verdict,
          remakeEnqueued,
        },
      });
    }
    return { ok: true, verdict, model: "none", source: "llm_text", remakeEnqueued };
  }

  if (!resolveAggregatorEnv()) {
    return {
      ok: false,
      error: "aggregator_key_missing",
      remakeEnqueued,
    };
  }

  const slides = buildSlideMeta(
    input.slideUrls,
    input.handoff,
    input.htmlLayouts,
  );
  const messages = buildArtDirectorReviewMessages({
    slides,
    briefMeta: input.briefMeta ?? {
      idea: input.handoff?.idea,
      hook: input.handoff?.hook,
      mode: input.handoff?.mode,
      renderMode: "layered_html",
    },
  });

  const images: string[] = [];
  for (const url of input.slideUrls.slice(0, 8)) {
    const resolved = await resolveImageForVision(url);
    if (resolved) images.push(resolved);
  }

  const model =
    input.model?.trim() ||
    resolveArtDirectorModel(process.env.ART_DIRECTOR_MODEL);

  const chat = await callAggregatorChat({
    system: messages.system || ART_DIRECTOR_SYSTEM_PROMPT,
    user: messages.user,
    images: images.length > 0 ? images : undefined,
    model,
    temperature: 0.25,
    maxTokens: 4096,
    fallbackModels: true,
  });

  if (!chat.ok) {
    if (input.appendLog !== false) {
      await appendAgentLog({
        userId: input.userId,
        agentId: ART_DIRECTOR_AGENT_ID,
        agentRole: "art-director",
        jobId: input.jobId,
        level: "red",
        message: `AD chat failed: ${chat.error}`,
        meta: { draftId: input.draftId, remakeEnqueued },
      });
    }
    return { ok: false, error: chat.error, remakeEnqueued };
  }

  let verdict: ArtDirectorVerdict;
  try {
    verdict = parseArtDirectorReviewResponse(chat.text);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ad_parse_fail";
    if (input.appendLog !== false) {
      await appendAgentLog({
        userId: input.userId,
        agentId: ART_DIRECTOR_AGENT_ID,
        agentRole: "art-director",
        jobId: input.jobId,
        level: "red",
        message: `AD parse fail: ${message}`,
        meta: { draftId: input.draftId, remakeEnqueued },
      });
    }
    return { ok: false, error: message, remakeEnqueued };
  }

  // HARD: never remake — only log
  if (input.appendLog !== false) {
    await appendAgentLog({
      userId: input.userId,
      agentId: ART_DIRECTOR_AGENT_ID,
      agentRole: "art-director",
      jobId: input.jobId,
      level: verdict.verdict === "approve" ? "info" : "warn",
      message: `AD ${verdict.verdict}: ${verdict.summary}`,
      meta: {
        draftId: input.draftId,
        verdict: verdict.verdict,
        remarksCount: verdict.remarks?.length ?? 0,
        score: verdict.score,
        remakeEnqueued: false,
        noRemake: true,
      },
    });
  }

  return {
    ok: true,
    verdict,
    model: chat.model,
    source: images.length > 0 ? "vision" : "llm_text",
    remakeEnqueued: false,
  };
}

/** Format verdict as markdown for smoke / inspector artifacts. */
export function formatArtDirectorReviewMarkdown(
  verdict: ArtDirectorVerdict,
  meta?: { draftId?: string; model?: string; source?: string },
): string {
  const lines = [
    "# Art Director review",
    "",
    `**Verdict:** \`${verdict.verdict}\``,
    meta?.model ? `**Model:** \`${meta.model}\`` : "",
    meta?.source ? `**Source:** \`${meta.source}\`` : "",
    meta?.draftId ? `**Draft:** \`${meta.draftId}\`` : "",
    verdict.score != null ? `**Score:** ${verdict.score}` : "",
    "",
    "## Summary",
    "",
    verdict.summary,
    "",
  ];
  if (verdict.sequenceNotes) {
    lines.push("## Sequence", "", verdict.sequenceNotes, "");
  }
  lines.push("## Issues / remarks", "");
  const remarks = verdict.remarks ?? [];
  if (remarks.length === 0) {
    lines.push("_No remarks._", "");
  } else {
    for (const r of remarks) {
      lines.push(
        `- **Slide ${r.slideIndex}** · \`${r.category}\` · **${r.severity}** — ${r.note}`,
      );
    }
    lines.push("");
  }
  lines.push(
    "## Remake",
    "",
    "**NO remake** — Art Director never triggers redraw / re-composite.",
    "",
  );
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}
