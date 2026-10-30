/**
 * Sheet ⊕ Create intake → Scriptwriter (critic ≤2) → layered_html draw → Draft.
 * S57 product default: bg + HTML Puppeteer (vision OFF).
 * Archaeology: CAROUSEL_PIPELINE=correct still available.
 * No silent social publish. Publicist schedules via ScheduleSlot only.
 *
 * Smoke: CAROUSEL_PROMPT_TRACE=1 → CAROUSEL_PROMPT_TRACE_DIR
 * (canon: docs/карусель тест/layered-smoke-4/).
 */

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { appendAgentLog } from "@/lib/agents/agent-run-log-store";
import { upsertDraft } from "@/lib/db/drafts-repository";
import { upsertScheduleSlot } from "@/lib/db/schedule-repository";
import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import { resolveAggregatorEnv } from "@/lib/llm/aggregator";
import {
  findSheetRow,
  listNormalizedRows,
  updateSheetRowStatus,
} from "@/lib/intake/sheet-client";
import { resolveIntakeModes } from "@/lib/intake/sheet-config";
import { buildCorrectPlaceholders } from "@/lib/intake/placeholders";
import {
  isCarouselPromptTraceEnabled,
  writeUsefulSmokeTimeline,
  type ScriptwriterAttemptTrace,
  type ScriptwriterTraceDump,
} from "@/lib/intake/smoke-prompt-trace";
import type {
  CorrectDraftPayloadFlags,
  NormalizedSheetRow,
  SheetMode,
} from "@/lib/intake/types";
import {
  computeAutoPublishAt,
  getPublicistSettings,
  type PublicistMode,
} from "@/lib/settings/publicist-settings-store";
import { readSyncedActiveDesign } from "@/lib/settings/design-active-server";
import type { CarouselHandoffJson } from "@/lib/studio/carousel-json-contract";
import {
  critiqueCarouselHandoff,
  SCRIPTWRITER_CRITIC_MAX_RETRIES,
} from "@/lib/studio/carousel-quality-critic";
import { runCreateCarouselDraw } from "@/lib/studio/carousel-html-renderer";
import {
  DEFAULT_CHARACTER_PAINT,
  resolveCreateCarouselOverlay,
  suggestAutoSlideCountForTopic,
  type CharacterPaintPath,
  type CorrectPipelinePlaceholders,
  type StyleCopyMode,
} from "@/lib/studio/create-carousel-prompts";
import type { StyleCopyPackId, StyleCopySlotPack } from "@/lib/studio/style-copy-slots";
import type { DesignerPromptDump } from "@/lib/studio/designer-variant-a-pack";
import { mapSlidesToPreviewUrls } from "@/lib/studio/carousel-media-urls";
import { getLandscape } from "@/lib/settings/landscapes-store";
import type { ArtDirectorVerdict } from "@/lib/studio/carousel-json-contract";

const MODULE_ID = "carousel-engine";

function scriptwriterModelId(): string {
  // Wave HIGVEN-3 / smoke: set CAROUSEL_SCRIPTWRITER_MODEL=anthropic/claude-haiku-4.5
  return (
    process.env.CAROUSEL_SCRIPTWRITER_MODEL?.trim() ||
    process.env.SCRIPTWRITER_MODEL?.trim() ||
    process.env.AGGREGATOR_DEFAULT_MODEL?.trim() ||
    "anthropic/claude-sonnet-4"
  );
}

/**
 * CTA flags from sheet (лист 2): 1 = встреча разговорного клуба (детали в шапке
 * профиля), 2 = делитесь в комментариях, 3 = сохрани и подпишись на подборки.
 * The script is written TOWARD this final CTA (whole arc leads to it).
 */
function ctaFlagMeaning(
  flag?: number | null,
  topic?: string,
): {
  flag: 1 | 2 | 3;
  label: string;
  full: string;
} {
  const f: 1 | 2 | 3 = flag === 1 || flag === 3 ? flag : 2;
  const theme = (topic ?? "").trim();
  if (f === 1) {
    return {
      flag: 1,
      label: "Обсудим это на встрече клуба",
      full: theme
        ? `Приглашение обсудить тему карусели («${theme}») вживую на встрече разговорного клуба Vernatun — детали и запись в шапке профиля.`
        : "Приглашение обсудить тему карусели вживую на встрече разговорного клуба Vernatun — детали в шапке профиля.",
    };
  }
  if (f === 3) {
    return {
      flag: 3,
      label: "Сохрани и подпишись",
      full: "Хочешь получать такие полезные подборки? Сохрани пост и подпишись на Vernatun.",
    };
  }
  return {
    flag: 2,
    label: "Делитесь в комментариях",
    full: "Делитесь в комментариях — задай зрителю вопрос, на который хочется ответить под постом.",
  };
}

function buildScriptwriterUserMessage(row: NormalizedSheetRow): string {
  const parts = [
    `MODE: ${row.mode}`,
    `TOPIC: ${row.topic}`,
  ];
  if (row.notes) parts.push(`NOTES / VALUE: ${row.notes}`);
  if (row.meta) {
    for (const [k, v] of Object.entries(row.meta)) {
      if (v) parts.push(`${k.toUpperCase()}: ${v}`);
    }
  }
  {
    const cta = ctaFlagMeaning(row.cta_type, row.topic);
    parts.push(
      `CTA_FLAG: ${cta.flag} → ${cta.full}`,
      `ВЕСЬ СЦЕНАРИЙ ПИШИ ПОД ЭТОТ ФИНАЛЬНЫЙ CTA: обложка-hook и каждый mid подводят читателя к действию «${cta.label}»; финальный слайд = этот CTA, тему карусели не бросай.`,
    );
  }
  if (row.slides) parts.push(`REQUESTED_SLIDE_COUNT: ${row.slides}`);
  if (row.hero != null) parts.push(`HERO / character_id: ${row.hero}`);
  else parts.push("HERO: (none — no character in scenes)");
  parts.push(
    "",
    "Reply with STRICT carousel JSON only (fenced ```json ok). CTA catalog 1–4. swipe_trigger = meta only.",
    "HARD: never emit JSON null for optional keys — OMIT the key. cta_type only on CTA slide (number 1–4) or root; omit on cover/body.",
    "Required every slide: swipe_trigger (non-empty string meta), visual_prompt, primary_copy, layout_variant.",
    "Root: caption (string), hashtags (array), requested_slide_count === slides.length.",
    "",
    "HARD secondary_copy_wide: every BODY slide secondary_copy ≥220 characters AND ≥5 clauses (or ≥4 short paragraphs) with steps/example — thin 1–3 sentences = FAIL critic.",
  );
  return parts.join("\n");
}

function emptyScriptwriterTrace(
  system: string,
  userBase: string,
): ScriptwriterTraceDump {
  return {
    model: scriptwriterModelId(),
    system,
    userBase,
    attempts: [],
    criticRetries: 0,
    finalOk: false,
  };
}

async function runScriptwriterWithCritic(opts: {
  userId: string;
  row: NormalizedSheetRow;
  placeholders: CorrectPipelinePlaceholders;
  jobId: string;
}): Promise<
  | {
      ok: true;
      json: CarouselHandoffJson;
      criticRetries: number;
      trace: ScriptwriterTraceDump;
    }
  | {
      ok: false;
      needs_input: true;
      message: string;
      criticRetries: number;
      trace: ScriptwriterTraceDump;
    }
> {
  const system = [
    resolveCreateCarouselOverlay("scriptwriter", "handoff", {
      pipeline: "layered_html",
      placeholders: opts.placeholders,
    }),
    "",
    "## Placeholders (filled)",
    `BRAND_NAME=${opts.placeholders.brandName ?? ""}`,
    `LOGO_REF=${opts.placeholders.logoRef ?? ""}`,
    `LOGO_REF_RAW=${opts.placeholders.logoRefRaw ? `present (${opts.placeholders.logoRefRaw.length} chars)` : "absent"}`,
    `MODE=${opts.placeholders.mode ?? opts.row.mode}`,
    `DESIGN_PALETTE_JSON=${opts.placeholders.designPaletteJson ?? "{}"}`,
    `CHARACTER_CATALOG=${opts.placeholders.characterCatalog ?? "[]"}`,
  ].join("\n");

  const userBase = buildScriptwriterUserMessage(opts.row);
  const model = scriptwriterModelId();
  const attempts: ScriptwriterAttemptTrace[] = [];

  if (!resolveAggregatorEnv()) {
    return {
      ok: false,
      needs_input: true,
      message: "AGGREGATOR_API_KEY missing — cannot run Scriptwriter",
      criticRetries: 0,
      trace: emptyScriptwriterTrace(system, userBase),
    };
  }

  let lastMessage = userBase;
  let criticRetries = 0;
  let lastFail = "Scriptwriter failed";

  for (let attempt = 0; attempt <= SCRIPTWRITER_CRITIC_MAX_RETRIES; attempt++) {
    const chat = await callAggregatorChat({
      system,
      user: lastMessage,
      model,
      temperature: 0.7,
      maxTokens: 8000,
      thinking: true,
      reasoningEffort: "medium",
      fallbackModels: true,
    });

    if (!chat.ok) {
      const detail = chat.triedModels?.length
        ? `${chat.error} tried=[${chat.triedModels.join(",")}]`
        : chat.error;
      lastFail = detail;
      attempts.push({
        attempt: attempt + 1,
        user: lastMessage,
        reply: `(aggregator fail) ${detail}`,
        criticOk: false,
        criticMessage: detail,
      });
      await appendAgentLog({
        userId: opts.userId,
        agentId: "scriptwriter",
        agentRole: "scriptwriter",
        jobId: opts.jobId,
        level: "error",
        message: `Scriptwriter aggregator fail: ${detail}`,
      });
      break;
    }

    const verdict = critiqueCarouselHandoff(chat.text, {
      allowRetryHint: true,
      retryCount: criticRetries,
    });

    attempts.push({
      attempt: attempt + 1,
      user: lastMessage,
      reply: chat.text,
      criticOk: verdict.ok,
      criticMessage: verdict.ok ? undefined : verdict.message,
      criticReasons: verdict.ok ? undefined : verdict.reasons,
    });

    if (verdict.ok) {
      return {
        ok: true,
        json: verdict.json,
        criticRetries,
        trace: {
          model,
          system,
          userBase,
          attempts,
          criticRetries,
          finalOk: true,
        },
      };
    }

    lastFail = verdict.message;
    const canRetry =
      attempt < SCRIPTWRITER_CRITIC_MAX_RETRIES &&
      (verdict.retriesRemaining ?? 0) > 0;

    await appendAgentLog({
      userId: opts.userId,
      agentId: "scriptwriter",
      agentRole: "scriptwriter",
      jobId: opts.jobId,
      level: canRetry ? "warn" : "error",
      message: `Critic reject (attempt ${attempt + 1}): ${verdict.message}`,
      meta: { reasons: verdict.reasons, code: verdict.code },
    });

    if (!canRetry) break;

    criticRetries += 1;
    lastMessage = [
      userBase,
      "",
      "## CRITIC RETRY — fix STRICT JSON",
      verdict.retryHint ?? "Fix schema and critic-05 rules, resubmit JSON only.",
      `Reasons: ${(verdict.reasons ?? []).join("; ")}`,
      "",
      "Previous reply (for repair):",
      chat.text.slice(0, 6000),
    ].join("\n");
  }

  return {
    ok: false,
    needs_input: true,
    message: lastFail,
    criticRetries,
    trace: {
      model,
      system,
      userBase,
      attempts,
      criticRetries,
      finalOk: false,
    },
  };
}

// ONE BRAIN (C-ONE-BRAIN-01): the LLM «script Art Director» mask now runs ONCE
// inside the job on the shared Sonnet JobLlmSession — correct-pipeline no longer
// hosts a SECOND script-AD. Only the deterministic CTA guarantee stays here.

function pngAbsFromJob(jobId: string, slideCount: number): string[] {
  // Mode B finals live in the vernatun job render dir (NOT public/generated/carousel).
  // Passing the wrong dir blinded the final Art Director (missing_assets).
  const rendered = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-jobs",
    jobId,
    "rendered",
  );
  const legacy = path.join(process.cwd(), "public", "generated", "carousel", jobId);
  const out: string[] = [];
  for (let i = 1; i <= slideCount; i++) {
    const n = `slide_${String(i).padStart(2, "0")}.png`;
    const inRendered = path.join(rendered, n);
    out.push(existsSync(inRendered) ? inRendered : path.join(legacy, n));
  }
  return out;
}

export type CorrectPipelineGenResult =
  | {
      ok: true;
      draftId: string;
      needs_review: boolean;
      needs_input: boolean;
      sheetRowKey: string;
      mode: SheetMode;
      slotId?: string;
      writeSkipped?: boolean;
      writeSkippedReason?: string;
      jobId?: string;
      pngAbsPaths?: string[];
      timelineMd?: string;
      /** Art Director once after composite — never remakes. */
      artDirectorReview?: ArtDirectorVerdict;
      designerPromptDump?: DesignerPromptDump;
      styleCopyMode?: StyleCopyMode;
      styleCopyPackId?: string;
      styleCopySlotMap?: Array<{
        slide: number;
        slot: string;
        refPath?: string;
        refKind?: string;
      }>;
    }
  | {
      ok: false;
      error: string;
      needs_input?: boolean;
      draftId?: string;
      sheetRowKey?: string;
      mode?: SheetMode;
      jobId?: string;
      timelineMd?: string;
      designerPromptDump?: DesignerPromptDump;
    };

export async function runCorrectPipelineFromRow(opts: {
  userId: string;
  row: NormalizedSheetRow;
  /** manual ISO publishAt; if omitted and publicist=auto → compute */
  scheduleAt?: string | null;
  publishMode?: PublicistMode | null;
  /** Dual paint path — alias character_path. Product default = in_image. */
  characterPaint?: CharacterPaintPath;
  /** Force Landscapes hero number (smoke: Ануш = 1). */
  forceHero?: number;
  /** Gen cutout poses via image model (overlay_cutout). Default true. */
  generateCutoutPoses?: boolean;
  /** Vision style-copy: etalon image ref path (wave 2026-10-18). */
  styleCopyMode?: StyleCopyMode;
  styleCopyPackId?: StyleCopyPackId;
  styleCopyPackPath?: string;
  styleCopySlots?: StyleCopySlotPack;
}): Promise<CorrectPipelineGenResult> {
  const jobId = `sheet_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const { userId } = opts;
  // Auto-7 for «N способов» when sheet/opts did not already set slides
  const autoN = suggestAutoSlideCountForTopic(opts.row.topic);
  let row: NormalizedSheetRow =
    opts.row.slides == null && autoN != null
      ? { ...opts.row, slides: autoN }
      : opts.row;
  if (
    typeof opts.forceHero === "number" &&
    Number.isFinite(opts.forceHero) &&
    opts.forceHero > 0
  ) {
    row = { ...row, hero: Math.floor(opts.forceHero) };
  }
  // Product default = in_image when hero present (overlay_cutout = legacy explicit only).
  const characterPaint: CharacterPaintPath =
    opts.characterPaint ??
    (row.hero != null && row.hero > 0 ? DEFAULT_CHARACTER_PAINT : "none");
  const styleCopyMode: StyleCopyMode | undefined = opts.styleCopyMode;
  const startedAt = new Date().toISOString();
  const dumpTrace = isCarouselPromptTraceEnabled();

  const statusWrite = await updateSheetRowStatus({
    mode: row.mode,
    sheetRowKey: row.sheetRowKey,
    status: "generating",
    topic: row.topic,
  });
  if (statusWrite.writeSkipped) {
    await appendAgentLog({
      userId,
      agentId: "scout",
      agentRole: "intake",
      jobId,
      level: "red",
      message: `sheet write skipped: ${statusWrite.writeSkippedReason}`,
      meta: { sheetRowKey: row.sheetRowKey, mode: row.mode },
    });
  }

  const placeholders = await buildCorrectPlaceholders({
    userId,
    mode: row.mode,
    hero: row.hero,
  });

  const script = await runScriptwriterWithCritic({
    userId,
    row,
    placeholders,
    jobId,
  });

  if (!script.ok) {
    await updateSheetRowStatus({
      mode: row.mode,
      sheetRowKey: row.sheetRowKey,
      status: "needs_input",
      topic: row.topic,
    });
    await appendAgentLog({
      userId,
      agentId: "scriptwriter",
      agentRole: "scriptwriter",
      jobId,
      level: "red",
      message: `needs_input: ${script.message}`,
    });

    let timelineMd: string | undefined;
    if (dumpTrace) {
      try {
        const written = await writeUsefulSmokeTimeline({
          row,
          startedAt,
          finishedAt: new Date().toISOString(),
          jobId,
          scriptwriter: script.trace,
          error: script.message,
        });
        timelineMd = written.mdPath;
      } catch {
        /* trace best-effort */
      }
    }

    return {
      ok: false,
      error: script.message,
      needs_input: true,
      sheetRowKey: row.sheetRowKey,
      mode: row.mode,
      jobId,
      timelineMd,
    };
  }

  // ONE BRAIN (C-ONE-BRAIN-01): no second script-AD here — the job's shared Sonnet
  // session refines the script. Keep ONLY the DETERMINISTIC CTA guarantee: the
  // scriptwriter prompt still drifts the final slide to the club default
  // («Приходите на разговорную встречу») regardless of flag, so force the LAST
  // slide to the flag CTA; if the flag is NOT the club and the headline drifted
  // into club wording, replace it too.
  {
    const cta = ctaFlagMeaning(row.cta_type, row.topic);
    const slides = script.json.slides as Array<Record<string, unknown>>;
    const last = slides[slides.length - 1];
    if (last) {
      last.cta = cta.label;
      last.cta_type = cta.flag;
      const CLUB_RE = /встреч|клуб|приходите|разговорн/i;
      if (cta.flag !== 1 && CLUB_RE.test(String(last.primary_copy ?? ""))) {
        last.primary_copy =
          cta.flag === 3 ? "Сохрани эту подборку" : "А как считаете вы?";
      }
    }
    (script.json as Record<string, unknown>).cta_type = cta.flag;
    await appendAgentLog({
      userId,
      agentId: "art-director-script",
      agentRole: "art-director",
      jobId,
      level: "info",
      message: `CTA forced to flag ${cta.flag}: «${cta.label}» (script-AD consolidated into job session)`,
    });
  }

  const synced = await readSyncedActiveDesign();
  // Force promptTrace capture when dumping timelines
  const prevTrace = process.env.CAROUSEL_PROMPT_TRACE;
  if (dumpTrace) process.env.CAROUSEL_PROMPT_TRACE = "1";

  // Resolve Персонажи cut-out photo for HTML overlay (not LLM-sanitized stubs)
  let characterCutoutUrl: string | undefined;
  const heroId =
    script.json.character_id ??
    (typeof row.hero === "number" ? row.hero : null);
  if (heroId != null && heroId > 0) {
    try {
      const hero = await getLandscape(userId, heroId);
      const photo = hero?.photoUrls?.find((u) => typeof u === "string" && u.trim());
      if (photo) characterCutoutUrl = photo.trim();
    } catch {
      /* optional */
    }
  }

  // Ensure character_id on handoff when hero forced
  if (
    row.hero != null &&
    row.hero > 0 &&
    (script.json.character_id == null || script.json.character_id <= 0)
  ) {
    script.json.character_id = row.hero;
  }

  const draw = await runCreateCarouselDraw(script.json, {
    pipeline: "layered_html",
    placeholders,
    jobId,
    designMarkdown: synced?.markdown,
    presetFile: synced?.presetFile ?? null,
    copyToWaveArtifacts: true,
    skipVision: true,
    characterCutoutUrl:
      characterPaint === "overlay_cutout" ? characterCutoutUrl : undefined,
    characterPaint,
    generateCutoutPoses:
      characterPaint === "overlay_cutout"
        ? opts.generateCutoutPoses !== false
        : false,
    styleCopyMode,
    styleCopyPackId: opts.styleCopyPackId,
    styleCopyPackPath: opts.styleCopyPackPath,
    styleCopySlots: opts.styleCopySlots,
  });
  if (prevTrace === undefined) {
    if (!dumpTrace) delete process.env.CAROUSEL_PROMPT_TRACE;
  } else {
    process.env.CAROUSEL_PROMPT_TRACE = prevTrace;
  }

  if (!draw.ok) {
    await updateSheetRowStatus({
      mode: row.mode,
      sheetRowKey: row.sheetRowKey,
      status: "needs_input",
      topic: row.topic,
    });
    await appendAgentLog({
      userId,
      agentId: "designer",
      agentRole: "designer",
      jobId,
      level: "red",
      message: `draw failed: ${draw.error.message}`,
      meta: { code: draw.error.code },
    });

    let timelineMd: string | undefined;
    if (dumpTrace) {
      try {
        const written = await writeUsefulSmokeTimeline({
          row,
          startedAt,
          finishedAt: new Date().toISOString(),
          jobId,
          scriptwriter: script.trace,
          error: draw.error.message,
        });
        timelineMd = written.mdPath;
      } catch {
        /* best-effort */
      }
    }

    return {
      ok: false,
      error: draw.error.message,
      needs_input: true,
      sheetRowKey: row.sheetRowKey,
      mode: row.mode,
      jobId,
      timelineMd,
      designerPromptDump: draw.designerPromptDump,
    };
  }

  const needsReview = Boolean(draw.needsReview);
  const slides = mapSlidesToPreviewUrls(
    draw.slides.map((s) => ({
      id: s.id,
      caption: s.caption,
      imageUrl: s.imageUrl,
    })),
  );

  const pngAbsPaths = pngAbsFromJob(jobId, draw.slides.length);

  // ONE BRAIN (C-ONE-BRAIN-01): the single final Art Director already ran INSIDE
  // the job (one Sonnet session) — do NOT run a second review here. Surface the
  // job's verdict from its remarks. HARD: never remake / redraw.
  const jobVisionFailures = draw.visionFailures ?? [];
  const artDirectorReview: ArtDirectorVerdict =
    jobVisionFailures.length > 0
      ? {
          verdict: "remarks",
          summary: `Арт-директор (единая Sonnet-сессия в джобе): ${jobVisionFailures.length} замечаний`,
          remarks: jobVisionFailures.slice(0, 6).map((v) => ({
            slideIndex: Math.max(1, v.slide),
            category: "hierarchy" as const,
            severity: "P1" as const,
            note:
              (v.reason ?? "").trim().length >= 8
                ? v.reason.slice(0, 300)
                : "См. prompts/AD_VERDICT.md джоба",
          })),
        }
      : {
          verdict: "approve",
          summary: "Арт-директор (единая Sonnet-сессия в джобе): без блокеров",
          remarks: [],
        };

  const payload: CorrectDraftPayloadFlags = {
    pipeline: "layered_html",
    needs_review: needsReview || undefined,
    sheetRowKey: row.sheetRowKey,
    mode: row.mode,
    visionFailures: draw.visionFailures,
    criticRetries: script.criticRetries,
    artDirectorReview: {
      ...artDirectorReview,
      model: draw.model,
      source: "job_single_brain",
      reviewedAt: new Date().toISOString(),
      remakeEnqueued: false,
    },
  };

  const draftId = `draft_correct_${jobId}`;
  const title =
    script.json.idea?.trim() ||
    script.json.hook?.trim() ||
    row.topic.slice(0, 80);

  const scenarioJson = draw.handoffWithLayouts ?? script.json;

  const draft = await upsertDraft(userId, {
    id: draftId,
    moduleId: MODULE_ID,
    title,
    slides,
    scenario: JSON.stringify(scenarioJson),
    status: "unpublished",
    payload,
  });

  const sheetStatus = needsReview ? "needs_review" : "ready";
  const afterWrite = await updateSheetRowStatus({
    mode: row.mode,
    sheetRowKey: row.sheetRowKey,
    status: sheetStatus,
    topic: row.topic,
  });

  if (needsReview) {
    await appendAgentLog({
      userId,
      agentId: "designer",
      agentRole: "designer",
      jobId,
      level: "red",
      message: "vision gate failed after ≤2 gens — draft delivered with needs_review",
      meta: { visionFailures: draw.visionFailures, draftId },
    });
  } else {
    await appendAgentLog({
      userId,
      agentId: "designer",
      agentRole: "designer",
      jobId,
      level: "info",
      message: `correct pipeline draft ready: ${draftId}`,
    });
  }

  // Publicist wire: auto from settings OR manual scheduleAt
  let slotId: string | undefined;
  const publicist = await getPublicistSettings(userId);
  const modeHint = opts.publishMode ?? publicist.mode;
  let publishAt: string | null =
    typeof opts.scheduleAt === "string" && opts.scheduleAt.trim()
      ? opts.scheduleAt.trim()
      : null;

  if (!publishAt && modeHint === "auto") {
    publishAt = computeAutoPublishAt(publicist);
  }

  if (publishAt && Number.isFinite(Date.parse(publishAt))) {
    const slot = await upsertScheduleSlot(userId, {
      postId: draft.id,
      draftId: draft.id,
      moduleId: MODULE_ID,
      startsAt: publishAt,
      platformId: publicist.platformId,
      status: "draft",
    });
    slotId = slot.id;
    payload.publishMode = modeHint;
    payload.publishAt = publishAt;
    await upsertDraft(userId, {
      id: draft.id,
      moduleId: MODULE_ID,
      title: draft.title,
      slides: draft.slides,
      scenario: draft.scenario,
      status: draft.status,
      payload,
    });
  }

  // AD review consolidated into the job (one Sonnet session) — no second pass here.
  // `artDirectorReview` is already baked into `payload` at draft creation above.

  let timelineMd: string | undefined;
  if (dumpTrace) {
    try {
      const written = await writeUsefulSmokeTimeline({
        row,
        startedAt,
        finishedAt: new Date().toISOString(),
        draftId: draft.id,
        jobId,
        scriptwriter: script.trace,
        designer: {
          model: draw.model,
          renderMode: draw.renderMode,
          imagePrompts: draw.imagePrompts ?? [],
          promptTrace: draw.promptTrace,
          visionFailures: draw.visionFailures,
          needsReview,
          pngAbsPaths,
          artifactDir: draw.artifactDir,
        },
      });
      timelineMd = written.mdPath;
    } catch {
      /* best-effort */
    }
  }

  return {
    ok: true,
    draftId: draft.id,
    needs_review: needsReview,
    needs_input: false,
    sheetRowKey: row.sheetRowKey,
    mode: row.mode,
    slotId,
    writeSkipped: afterWrite.writeSkipped || statusWrite.writeSkipped,
    writeSkippedReason:
      afterWrite.writeSkippedReason || statusWrite.writeSkippedReason,
    jobId,
    pngAbsPaths,
    timelineMd,
    artDirectorReview,
    designerPromptDump: draw.ok ? draw.designerPromptDump : undefined,
    styleCopyMode: draw.ok ? draw.styleCopyMode : styleCopyMode,
    styleCopyPackId: draw.ok ? draw.styleCopyPackId : undefined,
    styleCopySlotMap: draw.ok ? draw.styleCopySlotMap : undefined,
  };
}

/**
 * Merge optional `slides` onto the sheet row before Scriptwriter user message.
 * `force` skips pickable gate (smoke / re-gen).
 */
export async function runCorrectPipelineGenerate(opts: {
  userId: string;
  mode: SheetMode;
  sheetRowKey: string;
  scheduleAt?: string | null;
  publishMode?: PublicistMode | null;
  /** Force REQUESTED_SLIDE_COUNT (smoke: 4). */
  slides?: number;
  /** Skip pickable check (smoke re-runs). */
  force?: boolean;
  characterPaint?: CharacterPaintPath;
  forceHero?: number;
  generateCutoutPoses?: boolean;
  styleCopyMode?: StyleCopyMode;
  styleCopyPackId?: StyleCopyPackId;
  styleCopyPackPath?: string;
  styleCopySlots?: StyleCopySlotPack;
}): Promise<CorrectPipelineGenResult> {
  const found = await findSheetRow(opts.mode, opts.sheetRowKey);
  if (!found) {
    return {
      ok: false,
      error: "row_not_found",
      sheetRowKey: opts.sheetRowKey,
      mode: opts.mode,
    };
  }
  if (!opts.force && !found.pickable) {
    return {
      ok: false,
      error: `row_not_pickable status=${found.statusRaw || "(empty)"}`,
      sheetRowKey: opts.sheetRowKey,
      mode: opts.mode,
    };
  }

  // Explicit opts.slides wins (smoke force=4). Else auto-7 for «N способов».
  const autoSlides = suggestAutoSlideCountForTopic(found.topic);
  const slidesN =
    typeof opts.slides === "number" &&
    Number.isFinite(opts.slides) &&
    opts.slides >= 3 &&
    opts.slides <= 10
      ? opts.slides
      : typeof found.slides === "number" && found.slides >= 3
        ? found.slides
        : autoSlides ?? undefined;

  const row: NormalizedSheetRow =
    typeof slidesN === "number" ? { ...found, slides: slidesN } : found;

  return runCorrectPipelineFromRow({
    userId: opts.userId,
    row,
    scheduleAt: opts.scheduleAt,
    publishMode: opts.publishMode,
    characterPaint: opts.characterPaint,
    forceHero: opts.forceHero,
    generateCutoutPoses: opts.generateCutoutPoses,
    styleCopyMode: opts.styleCopyMode,
    styleCopyPackId: opts.styleCopyPackId,
    styleCopyPackPath: opts.styleCopyPackPath,
    styleCopySlots: opts.styleCopySlots,
  });
}

/**
 * Cron tick: pick up to `limit` pickable rows → gen drafts.
 * Default mode = **useful only** (meetings not polled unless explicit).
 */
export async function runSheetCronTick(opts: {
  userId: string;
  mode?: SheetMode;
  limit?: number;
}): Promise<{
  ok: true;
  processed: CorrectPipelineGenResult[];
  skipped: number;
}> {
  const modes = resolveIntakeModes(opts.mode);
  const limit = Math.min(Math.max(opts.limit ?? 1, 1), 5);
  const processed: CorrectPipelineGenResult[] = [];
  let skipped = 0;

  for (const mode of modes) {
    const pickable = (await listNormalizedRows(mode, { pickableOnly: true })).slice(
      0,
      limit,
    );
    if (pickable.length === 0) {
      skipped += 1;
      continue;
    }
    for (const row of pickable) {
      const result = await runCorrectPipelineFromRow({
        userId: opts.userId,
        row,
      });
      processed.push(result);
    }
  }

  return { ok: true, processed, skipped };
}

/**
 * Publicist: schedule an existing unpublished draft (auto|manual).
 * HITL path — status DRAFT on slot (approve → SCHEDULED). No social push.
 */
export async function scheduleDraftForPublish(opts: {
  userId: string;
  draftId: string;
  /** manual ISO; if omitted and mode=auto → compute */
  publishAt?: string | null;
  mode?: PublicistMode;
  platformId?: string | null;
}): Promise<
  | { ok: true; slotId: string; startsAt: string; publishMode: PublicistMode }
  | { ok: false; error: string }
> {
  const { getDraft, patchDraft } = await import("@/lib/db/drafts-repository");
  const draft = await getDraft({ userId: opts.userId, id: opts.draftId });
  if (!draft) return { ok: false, error: "draft_not_found" };

  const settings = await getPublicistSettings(opts.userId);
  const publishMode = opts.mode ?? settings.mode;
  let startsAt =
    typeof opts.publishAt === "string" && opts.publishAt.trim()
      ? opts.publishAt.trim()
      : null;
  if (!startsAt) {
    if (publishMode !== "auto") {
      return { ok: false, error: "publishAt_required_for_manual" };
    }
    startsAt = computeAutoPublishAt(settings);
  }
  if (!Number.isFinite(Date.parse(startsAt))) {
    return { ok: false, error: "invalid_publishAt" };
  }

  const slot = await upsertScheduleSlot(opts.userId, {
    postId: draft.id,
    draftId: draft.id,
    moduleId: draft.moduleId || MODULE_ID,
    startsAt,
    platformId:
      opts.platformId !== undefined ? opts.platformId : settings.platformId,
    status: "draft",
  });

  const prevPayload =
    draft.payload && typeof draft.payload === "object" ? draft.payload : {};
  await patchDraft({
    userId: opts.userId,
    id: draft.id,
    patch: {
      payload: {
        ...prevPayload,
        publishMode,
        publishAt: startsAt,
      },
    },
  });

  await appendAgentLog({
    userId: opts.userId,
    agentId: "publisher",
    agentRole: "publisher",
    level: "info",
    message: `Publicist scheduled draft ${draft.id} at ${startsAt} (${publishMode}) — HITL queue only`,
    meta: { slotId: slot.id, socialPublish: false },
  });

  return {
    ok: true,
    slotId: slot.id,
    startsAt,
    publishMode,
  };
}
