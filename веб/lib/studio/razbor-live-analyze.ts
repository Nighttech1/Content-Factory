/**
 * C-razbor-live-haiku-boards (S48) — LIVE Haiku Razbor analysis (server).
 * Soft-fail mock ONLY when AGGREGATOR_API_KEY missing (clear message).
 * Never log API keys.
 */

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import { buildCompetitorSlides } from "@/lib/studio/razbor-pipeline";
import type { FeedPost } from "@/lib/studio/feed-types";
import {
  RAZBOR_ANALYST_MODEL,
  RAZBOR_ANALYST_SYSTEM_PROMPT,
  type RazborLiveAnalysis,
  type RazborTrainerTask,
} from "@/lib/studio/razbor-live-shared";

export {
  RAZBOR_ANALYST_MODEL,
  RAZBOR_ANALYST_SYSTEM_PROMPT,
  buildRazborAnalysisSystemOverlay,
  buildRazborScriptwriterHandoffPayload,
  type RazborLiveAnalysis,
  type RazborTrainerTask,
} from "@/lib/studio/razbor-live-shared";

export type RazborAnalyzeSource = "competitor" | "boards";

export type RazborAnalyzeInput = {
  post?: FeedPost | null;
  /** Boards / uploaded slide image URLs (https or data:). */
  slideUrls?: string[];
  /** Optional slide captions aligned with slideUrls. */
  slideCaptions?: string[];
  moduleId?: string;
  source?: RazborAnalyzeSource;
  /** Override model (default Haiku 4.5). */
  model?: string;
  /** Max images to attach for vision (0 = text-only). */
  maxVisionImages?: number;
};

export type RazborAnalyzeResult =
  | {
      ok: true;
      source: "live";
      model: string;
      analysis: RazborLiveAnalysis;
      competitorSlides: Array<{ id: string; imageUrl: string; caption: string }>;
    }
  | {
      ok: true;
      source: "mock";
      model: "mock";
      analysis: RazborLiveAnalysis;
      competitorSlides: Array<{ id: string; imageUrl: string; caption: string }>;
      softFailReason: string;
    }
  | { ok: false; error: string };

function formatMetric(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

/**
 * Rich text carousel context so the model knows there IS a carousel
 * even without vision.
 */
export function buildRazborCarouselUserContext(
  input: RazborAnalyzeInput,
): {
  userText: string;
  imageUrls: string[];
  competitorSlides: Array<{ id: string; imageUrl: string; caption: string }>;
} {
  const post = input.post ?? null;
  const source = input.source ?? (post ? "competitor" : "boards");
  const moduleId = input.moduleId?.trim() || "carousel-engine";

  let competitorSlides: Array<{
    id: string;
    imageUrl: string;
    caption: string;
  }> = [];

  if (post) {
    competitorSlides = buildCompetitorSlides(post);
  }

  const extraUrls = (input.slideUrls ?? []).filter(
    (u) => typeof u === "string" && u.trim().length > 0,
  );
  const extraCaptions = input.slideCaptions ?? [];

  if (extraUrls.length > 0) {
    competitorSlides = extraUrls.map((url, i) => ({
      id: `boards-slide-${i}`,
      imageUrl: url.trim(),
      caption:
        (typeof extraCaptions[i] === "string" && extraCaptions[i]!.trim()) ||
        `Слайд ${i + 1}`,
    }));
  }

  const lines: string[] = [
    `Источник: ${source}`,
    `moduleId: ${moduleId}`,
    "",
    "=== КОНТЕКСТ КАРУСЕЛИ (обязательно использовать) ===",
  ];

  if (post) {
    lines.push(
      `postId: ${post.id}`,
      `mediaType: ${post.mediaType ?? "unknown"}`,
      `sourceMode: ${post.sourceMode}`,
      post.username ? `username: @${post.username}` : "username: (нет)",
      post.permalink ? `permalink: ${post.permalink}` : "permalink: (нет)",
      `title/caption: ${post.title || "(пусто)"}`,
      `topicTags: ${(post.topicTags ?? []).join(", ") || "(нет)"}`,
      `metrics: views=${formatMetric(post.metrics.views)} likes=${formatMetric(post.metrics.likes)} comments=${formatMetric(post.metrics.comments)} shares=${formatMetric(post.metrics.shares)} saves=${formatMetric(post.metrics.saves)}`,
      post.thumbUrl ? `cover/thumbUrl: ${post.thumbUrl}` : "cover/thumbUrl: (нет)",
      post.mediaUrl ? `mediaUrl: ${post.mediaUrl}` : "mediaUrl: (нет)",
    );
  } else {
    lines.push("post: (Boards upload — без competitor scrape)");
  }

  lines.push("", `Слайдов: ${competitorSlides.length}`);
  if (competitorSlides.length === 0) {
    lines.push(
      "Внимание: URL слайдов не переданы. Разбери по caption/metrics; честно отметь ограничение по кадрам.",
    );
  } else {
    competitorSlides.forEach((s, i) => {
      lines.push(
        `--- Слайд ${i + 1} ---`,
        `id: ${s.id}`,
        `caption: ${s.caption}`,
        `imageUrl: ${s.imageUrl}`,
      );
    });
  }

  lines.push(
    "",
    "Задача: полный live-разбор hook / mid / CTA + virality + trainerTasks + handoffBrief для Сценариста.",
  );

  const maxVision = Math.max(0, Math.min(4, input.maxVisionImages ?? 4));
  const imageUrls =
    maxVision > 0
      ? competitorSlides
          .map((s) => s.imageUrl)
          .filter(
            (u) =>
              u.startsWith("https://") ||
              u.startsWith("http://") ||
              u.startsWith("data:image/"),
          )
          .slice(0, maxVision)
      : [];

  return {
    userText: lines.join("\n"),
    imageUrls,
    competitorSlides,
  };
}

function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseTrainerTasks(raw: unknown): RazborTrainerTask[] {
  if (!Array.isArray(raw)) return [];
  const out: RazborTrainerTask[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ target: "module", task: item.trim() });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const task = asString(obj.task) || asString(obj.text) || asString(obj.title);
    if (!task) continue;
    const t = asString(obj.target).toLowerCase();
    const target: RazborTrainerTask["target"] =
      t === "scriptwriter" || t === "designer" ? t : "module";
    out.push({ target, task });
  }
  return out;
}

/** Pull a markdown section body by heading keywords (RU/EN). */
function sectionByHeading(text: string, keywords: string[]): string {
  const lines = text.split(/\r?\n/);
  const lowerKeys = keywords.map((k) => k.toLowerCase());
  let capturing = false;
  const buf: string[] = [];
  for (const line of lines) {
    const heading = /^(#{1,4}|\*\*)\s*(.+?)(\*\*)?\s*$/.exec(line.trim());
    if (heading) {
      const title = heading[2]!.replace(/\*+/g, "").trim().toLowerCase();
      if (capturing) break;
      capturing = lowerKeys.some((k) => title.includes(k));
      continue;
    }
    if (capturing) buf.push(line);
  }
  return buf.join("\n").trim();
}

function bulletsFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "").trim())
    .filter((l) => l.length > 8)
    .slice(0, 12);
}

export function parseRazborLiveAnalysis(rawText: string): RazborLiveAnalysis {
  const displayText = rawText.trim();
  const jsonStr = extractJsonBlock(displayText);
  let parsed: Record<string, unknown> | null = null;
  if (jsonStr) {
    try {
      parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
  }

  const viralityRaw = parsed?.viralityWhy ?? parsed?.virality_brief;
  let viralityWhy = Array.isArray(viralityRaw)
    ? viralityRaw.map((x) => String(x).trim()).filter(Boolean)
    : typeof viralityRaw === "string" && viralityRaw.trim()
      ? [viralityRaw.trim()]
      : [];

  let trainerTasks = parseTrainerTasks(
    parsed?.trainerTasks ?? parsed?.trainer_tasks,
  );

  let summary =
    asString(parsed?.summary) ||
    sectionByHeading(displayText, ["краткий", "summary", "итог"]) ||
    displayText.split("\n").find((l) => l.trim().length > 20)?.trim() ||
    "Разбор выполнен.";
  // Prefer body over a lone markdown title line
  if (/^#\s/.test(summary) && summary.length < 120) {
    const brief = sectionByHeading(displayText, [
      "краткий анализ",
      "summary",
      "что цепляет",
    ]);
    if (brief) summary = brief.slice(0, 400);
  }

  const hook =
    asString(parsed?.hook) ||
    asString(parsed?.hook_analysis) ||
    sectionByHeading(displayText, ["hook", "хук", "cover", "слайд 1"]);
  const middle =
    asString(parsed?.middle) ||
    asString(parsed?.mid) ||
    asString(parsed?.middle_analysis) ||
    sectionByHeading(displayText, ["mid", "middle", "середина", "value"]);
  const cta =
    asString(parsed?.cta) ||
    asString(parsed?.cta_analysis) ||
    sectionByHeading(displayText, ["cta", "призыв", "финал"]);

  if (viralityWhy.length === 0) {
    const vSec = sectionByHeading(displayText, [
      "virality",
      "вирус",
      "почему держит",
      "метрики",
    ]);
    if (vSec) viralityWhy = bulletsFromText(vSec);
  }

  if (trainerTasks.length === 0) {
    const tSec = sectionByHeading(displayText, [
      "trainer",
      "задач",
      "scriptwriter",
      "designer",
      "сценарист",
      "дизайнер",
    ]);
    if (tSec) {
      trainerTasks = bulletsFromText(tSec).map((task) => {
        const lower = task.toLowerCase();
        const target: RazborTrainerTask["target"] = lower.includes("design") ||
          lower.includes("дизайн")
          ? "designer"
          : lower.includes("script") ||
              lower.includes("сценар") ||
              lower.includes("копир")
            ? "scriptwriter"
            : "module";
        return { target, task };
      });
    }
  }

  const handoffBrief =
    asString(parsed?.handoffBrief) ||
    asString(parsed?.handoff_brief) ||
    [
      summary,
      hook ? `Hook: ${hook.slice(0, 500)}` : "",
      middle ? `Mid: ${middle.slice(0, 500)}` : "",
      cta ? `CTA: ${cta.slice(0, 400)}` : "",
      viralityWhy.length
        ? `Virality:\n- ${viralityWhy.slice(0, 8).join("\n- ")}`
        : "",
      trainerTasks.length
        ? `Trainer tasks:\n${trainerTasks.map((t) => `- [${t.target}] ${t.task}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

  return {
    summary: summary.slice(0, 800),
    hook: hook.slice(0, 1200),
    middle: middle.slice(0, 1200),
    cta: cta.slice(0, 800),
    viralityWhy,
    trainerTasks,
    handoffBrief,
    displayText,
    rawJson: jsonStr ?? undefined,
  };
}

/** Soft-fail copy when aggregator key missing — never pretend live success. */
export function buildRazborSoftFailAnalysis(
  input: RazborAnalyzeInput,
): RazborLiveAnalysis {
  const { competitorSlides } = buildRazborCarouselUserContext(input);
  const slideHint =
    competitorSlides.length > 0
      ? `В превью видно ${competitorSlides.length} слайд(ов), но live LLM недоступен (нет AGGREGATOR_API_KEY).`
      : "Live LLM недоступен (нет AGGREGATOR_API_KEY).";

  const displayText = [
    "⚠️ Разбор в режиме soft-fail (mock).",
    slideHint,
    "Подключите ключ агрегатора в `.env` (AGGREGATOR_API_KEY), затем снова нажмите «Начать разбор».",
    "",
    "Без live Haiku я не могу честно разобрать hook / mid / CTA этой карусели.",
  ].join("\n");

  return {
    summary: "Soft-fail: нет ключа агрегатора — live-разбор не выполнен.",
    hook: "(нет live-анализа)",
    middle: "(нет live-анализа)",
    cta: "(нет live-анализа)",
    viralityWhy: ["Ключ агрегатора отсутствует — virality brief недоступен."],
    trainerTasks: [
      {
        target: "module",
        task: "Настроить AGGREGATOR_API_KEY и повторить «Начать разбор» для live Haiku.",
      },
    ],
    handoffBrief:
      "Handoff отложен: live-разбор не выполнен (нет AGGREGATOR_API_KEY). Повторите разбор после настройки ключа.",
    displayText,
  };
}

/**
 * Append trainer tasks to memory/trainer (best-effort; no throw).
 */
export async function appendRazborTrainerGapNotes(
  analysis: RazborLiveAnalysis,
  meta?: { moduleId?: string; postId?: string },
): Promise<void> {
  if (analysis.trainerTasks.length === 0) return;
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "memory", "trainer");
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, "razbor-live-tasks.md");
    const stamp = new Date().toISOString().slice(0, 10);
    const header = [
      "",
      `## ${stamp} — razbor live`,
      meta?.moduleId ? `moduleId: ${meta.moduleId}` : null,
      meta?.postId ? `postId: ${meta.postId}` : null,
      "",
    ]
      .filter((x) => x != null)
      .join("\n");
    const body = analysis.trainerTasks
      .map((t) => `- [${t.target}] ${t.task}`)
      .join("\n");
    await fs.appendFile(file, `${header}${body}\n`, "utf8");
  } catch {
    /* optional — ignore write failures */
  }
}

/**
 * Server entry: LIVE Haiku analyze (or soft-fail mock if no key).
 */
export async function runRazborLiveAnalyze(
  input: RazborAnalyzeInput,
): Promise<RazborAnalyzeResult> {
  const ctx = buildRazborCarouselUserContext(input);

  if (!resolveAggregatorEnv()) {
    const analysis = buildRazborSoftFailAnalysis(input);
    return {
      ok: true,
      source: "mock",
      model: "mock",
      analysis,
      competitorSlides: ctx.competitorSlides,
      softFailReason: "aggregator_key_missing",
    };
  }

  const model = input.model?.trim() || RAZBOR_ANALYST_MODEL;
  const result = await callAggregatorChat({
    system: RAZBOR_ANALYST_SYSTEM_PROMPT,
    user: ctx.userText,
    images: ctx.imageUrls.length > 0 ? ctx.imageUrls : undefined,
    model,
    temperature: 0.35,
    maxTokens: 8192,
    thinking: true,
    reasoningEffort: "high",
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const analysis = parseRazborLiveAnalysis(result.text);
  await appendRazborTrainerGapNotes(analysis, {
    moduleId: input.moduleId,
    postId: input.post?.id,
  });

  return {
    ok: true,
    source: "live",
    model: result.model,
    analysis,
    competitorSlides: ctx.competitorSlides,
  };
}
