/**
 * C-155 / C-carousel-agents — Studio agent chat via aggregator.
 * Create carousel: modes chat|handoff|describe|draw → live or source:error (NO mock).
 * Razbor / default chat: soft-fail 200 mock when key missing or LLM fails.
 * Never log API key.
 */

import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { callAggregatorChat } from "@/lib/llm/aggregator-chat";
import {
  DEFAULT_AGGREGATOR_MODEL,
  resolveAggregatorEnv,
  resolveAggregatorModelId,
} from "@/lib/llm/aggregator";
import { seedAgentsForPipeline } from "@/lib/mesh/agent-defaults";
import { isMeshPipelineId } from "@/lib/mesh-roles";
import {
  DEFAULT_DESIGNER_TEXT_MODEL,
  isMeshImageModel,
} from "@/types/mesh-agent";
import {
  designMarkdownFromRequestHeaders,
  resolveActiveDesignMarkdown as resolveServerActiveDesignMarkdown,
} from "@/lib/settings/design-active-server";
import { parseDesignPresetFile } from "@/lib/settings/design-preset";
import {
  CREATE_CAROUSEL_NO_MOCK,
  createCarouselErrorMessage,
} from "@/lib/studio/agent-chat-soft-ack";
import {
  assembleAgentStartSystemPrompt,
  appendSprint9ReelsPackToSystem,
  buildCreateCarouselAgentBundle,
} from "@/lib/studio/agent-start-bundle";
import {
  CarouselJsonParseError,
  parseAndAssertCarouselJsonStrict,
  type CarouselHandoffJson,
} from "@/lib/studio/carousel-json-contract";
import {
  critiqueCarouselHandoff,
  replyLooksLikeCarouselJson,
} from "@/lib/studio/carousel-quality-critic";
import { runCreateCarouselDraw } from "@/lib/studio/carousel-html-renderer";
import {
  assertSlicedCreatePreview,
  mapSlidesToPreviewUrls,
} from "@/lib/studio/carousel-media-urls";
import {
  appendActiveDesignMdToDesignerPrompt,
  CREATE_CAROUSEL_PAIRED_INVARIANTS,
  DEFAULT_CHARACTER_PAINT,
  resolveCreateCarouselOverlay,
  type CreateCarouselAgentRole,
  type CreateCarouselPromptMode,
  type CharacterPaintPath,
  type StyleCopyMode,
} from "@/lib/studio/create-carousel-prompts";
import {
  sanitizeAgentChatTurnsForC155,
  stripCombatBriefGlue,
} from "@/lib/studio/agent-chat-sanitize";
import { runGenerateCarouselSlides } from "@/lib/studio/generate-carousel-slides-core";
import {
  critiqueReelsScript,
  replyLooksLikeReelsJson,
} from "@/lib/studio/reels-quality-critic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const HISTORY_LIMIT = 12;

const ROLE_TO_SEED: Record<string, string> = {
  scriptwriter: "copywriter",
  designer: "designer",
  artdirector: "art-director",
  "art-director": "art-director",
  publisher: "publisher",
  analyst: "analyst",
  razbor: "razbor",
};

const SOFT_ACK: Record<string, string> = {
  scriptwriter: "Ок, подправлю сценарий с учётом вашего комментария.",
  designer: "Ок, подправлю макет слайдов.",
  artdirector:
    "Ок, учту замечания по сценарию и кадрам — напишите, что поправить.",
  "art-director":
    "Ок, учту замечания по сценарию и кадрам — напишите, что поправить.",
  publisher:
    "Записал для слота публикации — уточните дату/время при необходимости.",
  analyst: "Принял правку — учту в следующем проходе разбора.",
  razbor: "Принял правку — учту в следующем проходе разбора.",
};

type AgentChatMode = "chat" | "handoff" | "describe" | "draw";

type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

type Body = {
  agentRole?: string;
  pipelineId?: string;
  messages?: ChatTurn[];
  moduleId?: string;
  systemPrompt?: string;
  modelConfig?: {
    model?: string;
    /** C-audit-01 — chat text when `model` is image-class. */
    textModel?: string;
    temperature?: number;
    maxTokens?: number;
    thinking?: boolean;
    reasoningEffort?: "low" | "medium" | "high";
  };
  mode?: AgentChatMode | "agent-start";
  surface?: "create-carousel" | "razbor" | string;
  handoffBrief?: string;
  lastAgreedDescription?: string;
  priorDialogSummary?: string;
  /**
   * Validated Create handoff JSON (object or stringified).
   * Draw prefers this; else parses lastAgreedDescription / handoffBrief.
   */
  carouselJson?: unknown;
  /**
   * C-settings-design-md-carousel — active Embla library DESIGN.md for Designer system.
   * Never merge into user message (C-155).
   */
  activeDesignMarkdown?: string;
  activeDesignId?: string;
  activeDesignName?: string;
  /** Typed DesignPresetFile from Settings library / Tuner. */
  activeDesignPresetFile?: unknown;
  /** Vision style-copy (wave 2026-10-18) — draw body wire. */
  styleCopyMode?: StyleCopyMode | string;
  characterPaint?: CharacterPaintPath | string;
  character_path?: CharacterPaintPath | string;
  styleCopyPackId?: string;
  styleCopyPackPath?: string;
  /** Legacy aliases (pre-D1) — still accepted. */
  agentId?: string;
  userMessage?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  systemPromptOverride?: string;
  modelOverride?: string;
  /** Vernatun: Mode A HTML/CSS or Mode B full AI slide. */
  buildMode?: "A" | "B" | string;
  /** Topic-first Vernatun draw (Create Art Director). */
  topic?: string;
  /** Slide count for topic-first draw (default 4). */
  slideCount?: number;
  /** Post-preview chat repair notes → styleNotes in Vernatun brief (O6). */
  styleNotes?: string;
  /** Optional user photo attachments (base64) for ingest. */
  userAssetFiles?: Array<{
    filename: string;
    mime?: string;
    data: string;
    required?: boolean;
  }>;
};

function carouselJsonErrorCode(
  err: CarouselJsonParseError,
): "carousel_json_missing" | "carousel_json_invalid" | "carousel_json_count" {
  if (err.code === "NO_JSON") return "carousel_json_missing";
  if (err.code === "COUNT_MISMATCH") return "carousel_json_count";
  return "carousel_json_invalid";
}

/**
 * Resolve carousel JSON for Create draw: body.carouselJson → text fields.
 */
function resolveDrawCarouselJson(input: {
  carouselJson?: unknown;
  lastAgreedDescription?: string;
  handoffBrief?: string;
}):
  | { ok: true; json: CarouselHandoffJson }
  | { ok: false; code: string; message: string } {
  const { carouselJson, lastAgreedDescription, handoffBrief } = input;

  if (carouselJson != null && carouselJson !== "") {
    try {
      const text =
        typeof carouselJson === "string"
          ? carouselJson
          : JSON.stringify(carouselJson);
      // Sprint 9.7 STRICT: CTA + visual_prompt required before draw
      return { ok: true, json: parseAndAssertCarouselJsonStrict(text) };
    } catch (err) {
      if (err instanceof CarouselJsonParseError) {
        const code = carouselJsonErrorCode(err);
        return {
          ok: false,
          code,
          message: createCarouselErrorMessage(code),
        };
      }
      return {
        ok: false,
        code: "carousel_json_invalid",
        message: createCarouselErrorMessage("carousel_json_invalid"),
      };
    }
  }

  const texts = [lastAgreedDescription, handoffBrief].filter(
    (t): t is string => typeof t === "string" && t.trim().length > 0,
  );
  if (texts.length === 0) {
    return {
      ok: false,
      code: "carousel_json_missing",
      message: createCarouselErrorMessage("carousel_json_missing"),
    };
  }

  let lastErr: CarouselJsonParseError | null = null;
  for (const text of texts) {
    try {
      return { ok: true, json: parseAndAssertCarouselJsonStrict(text) };
    } catch (err) {
      if (err instanceof CarouselJsonParseError) {
        lastErr = err;
        if (err.code !== "NO_JSON") {
          const code = carouselJsonErrorCode(err);
          return {
            ok: false,
            code,
            message: createCarouselErrorMessage(code),
          };
        }
        continue;
      }
      return {
        ok: false,
        code: "carousel_json_invalid",
        message: createCarouselErrorMessage("carousel_json_invalid"),
      };
    }
  }

  const code = lastErr
    ? carouselJsonErrorCode(lastErr)
    : "carousel_json_missing";
  return {
    ok: false,
    code,
    message: createCarouselErrorMessage(code),
  };
}

function mockResponse(agentRole: string) {
  const reply = SOFT_ACK[agentRole] ?? "Принял сообщение. (режим без LLM)";
  return NextResponse.json({
    reply,
    model: "mock",
    source: "mock" as const,
  });
}

function errorResponse(code: string, status = 200) {
  return NextResponse.json(
    {
      reply: "",
      source: "error" as const,
      error: { code, message: createCarouselErrorMessage(code) },
    },
    { status },
  );
}

function sanitizeTurns(
  raw: ChatTurn[],
): Array<{ role: "user" | "assistant"; content: string }> {
  const base = raw
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));
  // C-155 / S49: strip Team «Задание» / combat-brief glue; never inject loadUserBrief
  return sanitizeAgentChatTurnsForC155(base);
}

function normalizeMode(raw: Body["mode"]): AgentChatMode {
  if (raw === "agent-start") return "handoff";
  if (raw === "handoff" || raw === "describe" || raw === "draw" || raw === "chat") {
    return raw;
  }
  return "chat";
}

function isCreateCarouselRole(
  role: string,
): role is CreateCarouselAgentRole {
  return role === "scriptwriter" || role === "designer";
}

function isCreatePath(
  surface: string | undefined,
  mode: AgentChatMode,
): boolean {
  if (surface === "create-carousel") return true;
  return mode === "handoff" || mode === "describe" || mode === "draw";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const pipelineId =
    typeof body.pipelineId === "string" ? body.pipelineId.trim() : "";
  if (!pipelineId || !isMeshPipelineId(pipelineId)) {
    return NextResponse.json({ error: "invalid_pipelineId" }, { status: 400 });
  }

  const agentRoleRaw =
    (typeof body.agentRole === "string" && body.agentRole.trim()) ||
    (typeof body.agentId === "string" && body.agentId.trim()) ||
    "";
  const agentRole = agentRoleRaw.toLowerCase();
  const seedId = ROLE_TO_SEED[agentRole] ?? ROLE_TO_SEED[mapLegacy(agentRole)];
  if (!seedId) {
    return NextResponse.json({ error: "invalid_agentRole" }, { status: 400 });
  }
  const roleKey = ROLE_TO_SEED[agentRole] ? agentRole : mapLegacy(agentRole);

  const seeds = seedAgentsForPipeline(pipelineId);
  const seedAgent = seeds[seedId];
  if (!seedAgent) {
    return NextResponse.json(
      { error: "agent_not_in_pipeline" },
      { status: 400 },
    );
  }

  const mode = normalizeMode(body.mode);
  const surface =
    typeof body.surface === "string" ? body.surface.trim() : undefined;
  const createPath = isCreatePath(surface, mode);
  const handoffBrief =
    typeof body.handoffBrief === "string" ? body.handoffBrief.trim() : "";
  const lastAgreedDescription =
    typeof body.lastAgreedDescription === "string"
      ? body.lastAgreedDescription.trim()
      : "";
  const priorDialogSummary =
    typeof body.priorDialogSummary === "string"
      ? body.priorDialogSummary.trim()
      : "";
  const activeDesignId =
    typeof body.activeDesignId === "string"
      ? body.activeDesignId.trim()
      : "";
  const activeDesignName =
    typeof body.activeDesignName === "string"
      ? body.activeDesignName.trim()
      : "";
  const activeDesignPresetFile = parseDesignPresetFile(
    body.activeDesignPresetFile,
  );

  // Active DESIGN.md: body → header/cookie → synced file (Embla is localStorage-only)
  const { headerMarkdown, cookieMarkdown } =
    designMarkdownFromRequestHeaders(req);
  const activeDesignMarkdown =
    (await resolveServerActiveDesignMarkdown({
      bodyMarkdown:
        typeof body.activeDesignMarkdown === "string"
          ? body.activeDesignMarkdown
          : null,
      headerMarkdown,
      cookieMarkdown,
    })) ?? "";

  let turns = Array.isArray(body.messages)
    ? sanitizeTurns(body.messages)
    : [];

  if (turns.length === 0 && Array.isArray(body.history)) {
    turns = sanitizeTurns(body.history as ChatTurn[]);
  }

  let userMessage = "";
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (typeof body.userMessage === "string" && body.userMessage.trim()) {
    userMessage = stripCombatBriefGlue(body.userMessage);
    history = turns.slice(-HISTORY_LIMIT);
    const last = history[history.length - 1];
    if (last?.role === "user" && last.content === userMessage) {
      history = history.slice(0, -1);
    }
  } else {
    const lastUserIdx = (() => {
      for (let i = turns.length - 1; i >= 0; i -= 1) {
        if (turns[i]?.role === "user") return i;
      }
      return -1;
    })();
    if (lastUserIdx >= 0) {
      userMessage = stripCombatBriefGlue(turns[lastUserIdx]!.content);
      history = turns.slice(0, lastUserIdx).slice(-HISTORY_LIMIT);
    }
  }

  // Handoff / describe / draw: allow synthetic user when client sends empty start.
  if (!userMessage && createPath && mode !== "chat") {
    if (mode === "draw") {
      userMessage = lastAgreedDescription || handoffBrief || "[draw]";
    } else {
      userMessage = handoffBrief || "[agent-start]";
    }
  }

  if (!userMessage) {
    if (createPath) {
      return errorResponse("invalid_request", 400);
    }
    return NextResponse.json({ error: "empty_userMessage" }, { status: 400 });
  }

  const modelFromClient =
    (typeof body.modelConfig?.model === "string" &&
      body.modelConfig.model.trim()) ||
    (typeof body.modelOverride === "string" && body.modelOverride.trim()) ||
    "";
  const seedModel =
    typeof seedAgent.modelConfig?.model === "string"
      ? seedAgent.modelConfig.model.trim()
      : "";
  const clientTextModel =
    typeof body.modelConfig?.textModel === "string"
      ? body.modelConfig.textModel.trim()
      : "";
  const seedTextModel =
    typeof seedAgent.modelConfig?.textModel === "string"
      ? seedAgent.modelConfig.textModel.trim()
      : "";
  /**
   * C-audit-01 D-m-4: chat|handoff|describe must NEVER call chat/completions
   * with an image-class id (falls to gpt-4o-mini). Draw keeps image path separately.
   */
  let preferredModel =
    modelFromClient ||
    seedModel ||
    process.env.AGGREGATOR_DEFAULT_MODEL?.trim() ||
    DEFAULT_AGGREGATOR_MODEL;
  if (mode !== "draw" && isMeshImageModel(preferredModel)) {
    preferredModel =
      clientTextModel ||
      seedTextModel ||
      DEFAULT_DESIGNER_TEXT_MODEL;
  }
  const model = resolveAggregatorModelId(preferredModel);

  const temperature =
    typeof body.modelConfig?.temperature === "number"
      ? body.modelConfig.temperature
      : typeof seedAgent.modelConfig?.temperature === "number"
        ? seedAgent.modelConfig.temperature
        : undefined;
  const maxTokens =
    typeof body.modelConfig?.maxTokens === "number"
      ? body.modelConfig.maxTokens
      : typeof seedAgent.modelConfig?.maxTokens === "number"
        ? seedAgent.modelConfig.maxTokens
        : undefined;
  const thinking =
    typeof body.modelConfig?.thinking === "boolean"
      ? body.modelConfig.thinking
      : typeof seedAgent.modelConfig?.thinking === "boolean"
        ? seedAgent.modelConfig.thinking
        : undefined;
  const reasoningEffort =
    body.modelConfig?.reasoningEffort === "low" ||
    body.modelConfig?.reasoningEffort === "medium" ||
    body.modelConfig?.reasoningEffort === "high"
      ? body.modelConfig.reasoningEffort
      : seedAgent.modelConfig?.reasoningEffort === "low" ||
          seedAgent.modelConfig?.reasoningEffort === "medium" ||
          seedAgent.modelConfig?.reasoningEffort === "high"
        ? seedAgent.modelConfig.reasoningEffort
        : undefined;

  // ── Draw mode (Create): JSON handoff OR topic-first Vernatun ────────────
  if (createPath && mode === "draw") {
    if (!resolveAggregatorEnv()) {
      return errorResponse("missing_key");
    }

    // Mode A removed — carousels always generate full AI slides (Mode B).
    const buildMode = "B";
    const topicFromBody =
      typeof body.topic === "string" ? body.topic.trim() : "";
    const slideCountBody =
      typeof body.slideCount === "number" && Number.isFinite(body.slideCount)
        ? Math.min(12, Math.max(2, Math.round(body.slideCount)))
        : 4;

    const resolved = resolveDrawCarouselJson({
      carouselJson: body.carouselJson,
      lastAgreedDescription: lastAgreedDescription || undefined,
      handoffBrief: handoffBrief || undefined,
    });

    // Topic-first Vernatun (Art Director Create): no JSON required
    if (!resolved.ok) {
      const topic =
        topicFromBody ||
        lastAgreedDescription ||
        handoffBrief ||
        userMessage;
      if (!topic.trim()) {
        return NextResponse.json({
          reply: "",
          source: "error" as const,
          error: { code: resolved.code, message: resolved.message },
        });
      }

      const { runVernatunFromTopic } = await import(
        "@/lib/studio/vernatun-carousel/draw-bridge"
      );
      const styleNotes =
        typeof body.styleNotes === "string" ? body.styleNotes.trim() : "";
      let userAssets:
        | import("@/lib/studio/vernatun-carousel/types").UserAssetRecord[]
        | undefined;
      let jobId: string | undefined;
      if (Array.isArray(body.userAssetFiles) && body.userAssetFiles.length) {
        jobId = randomUUID();
        const jobDir = path.join(
          process.cwd(),
          "generatedMedia",
          "vernatun-jobs",
          jobId,
        );
        const { ingestUserAssets } = await import(
          "@/lib/studio/vernatun-carousel/ingest-user-assets"
        );
        userAssets = await ingestUserAssets({
          jobDir,
          files: body.userAssetFiles.map((f) => ({
            filename: String(f.filename || "photo.jpg"),
            mime: f.mime,
            data: String(f.data || ""),
            required: f.required !== false,
          })),
        });
      }
      const topicDraw = await runVernatunFromTopic({
        topic: topic.trim(),
        slideCount: slideCountBody,
        buildMode,
        jobId,
        styleNotes: styleNotes || undefined,
        userAssets,
      });
      if (!topicDraw.ok) {
        return NextResponse.json({
          reply: "",
          source: "error" as const,
          error: topicDraw.error,
        });
      }
      const slides = mapSlidesToPreviewUrls(
        topicDraw.slides.map((s) => ({
          id: s.id,
          caption: s.caption,
          imageUrl: s.imageUrl,
        })),
      );
      const slicedOk = assertSlicedCreatePreview(slides, slideCountBody);
      if (!slicedOk.ok) {
        return NextResponse.json({
          reply: "",
          source: "error" as const,
          error: {
            code: "panorama_preview_rejected",
            message: slicedOk.message,
          },
        });
      }
      const remarks =
        topicDraw.needsReview && topicDraw.visionFailures?.length
          ? topicDraw.visionFailures.map((f) => f.reason).filter(Boolean)
          : [];
      const reply =
        remarks.length > 0
          ? `Карусель собрана, но есть замечания:\n${remarks
              .slice(0, 8)
              .map((r) => `• ${r}`)
              .join("\n")}\n\nСтатус: не FINAL — можно править здесь в чате и собрать снова.`
          : "Готово. Карусель собрана — превью справа. Замечания по кадрам пишите сюда же; слот публикации — на странице Расписание.";
      return NextResponse.json({
        reply,
        model: topicDraw.model,
        source: "live" as const,
        slides,
        renderMode: topicDraw.renderMode,
        slideCount: slides.length,
        needsReview: Boolean(topicDraw.needsReview),
        remarks,
        buildMode,
        ...(topicDraw.artifactDir ? { artifactDir: topicDraw.artifactDir } : {}),
      });
    }

    const carouselJson = resolved.json;
    const slideCount = carouselJson.slides.length;

    // Sprint 9.8 — quality critic BEFORE draw / Draft (max soft reject, no mock success)
    const critic = critiqueCarouselHandoff(carouselJson, {
      allowRetryHint: true,
    });
    if (!critic.ok) {
      return NextResponse.json({
        reply: "",
        source: "error" as const,
        error: {
          code: critic.code,
          message: critic.message,
          reasons: critic.reasons,
          retryHint: critic.retryHint,
        },
      });
    }

    // Preferred path: HTML safe-zone → PNG (or bg proxy fallback)
    const styleCopyModeRaw =
      typeof body.styleCopyMode === "string" ? body.styleCopyMode.trim() : "";
    const styleCopyMode: StyleCopyMode | undefined =
      styleCopyModeRaw === "vision_ref" || styleCopyModeRaw === "token_card"
        ? styleCopyModeRaw
        : undefined;
    const characterPaintRaw =
      typeof body.characterPaint === "string"
        ? body.characterPaint.trim()
        : typeof body.character_path === "string"
          ? body.character_path.trim()
          : "";
    const characterPaint: CharacterPaintPath | undefined =
      characterPaintRaw === "in_image" ||
      characterPaintRaw === "overlay_cutout" ||
      characterPaintRaw === "none"
        ? characterPaintRaw
        : styleCopyMode === "vision_ref"
          ? DEFAULT_CHARACTER_PAINT
          : undefined;
    const drawResult = await runCreateCarouselDraw(carouselJson, {
      model: process.env.CAROUSEL_IMAGE_MODEL?.trim() || undefined,
      designMarkdown: activeDesignMarkdown || undefined,
      presetFile: activeDesignPresetFile,
      copyToWaveArtifacts: true,
      styleCopyMode,
      characterPaint,
      styleCopyPackId:
        typeof body.styleCopyPackId === "string"
          ? body.styleCopyPackId.trim()
          : undefined,
      styleCopyPackPath:
        typeof body.styleCopyPackPath === "string"
          ? body.styleCopyPackPath.trim()
          : undefined,
      buildMode,
    });

    if (drawResult.ok) {
      const slides = mapSlidesToPreviewUrls(
        drawResult.slides.map((s) => ({
          id: s.id,
          caption: s.caption,
          imageUrl: s.imageUrl,
        })),
      );
      const slicedOk = assertSlicedCreatePreview(slides, slideCount);
      if (!slicedOk.ok) {
        return NextResponse.json({
          reply: "",
          source: "error" as const,
          error: {
            code: "panorama_preview_rejected",
            message: slicedOk.message,
          },
        });
      }
      const remarks =
        drawResult.needsReview && drawResult.visionFailures?.length
          ? drawResult.visionFailures.map((f) => f.reason).filter(Boolean)
          : [];
      const reply =
        remarks.length > 0
          ? `Карусель собрана, но есть замечания:\n${remarks
              .slice(0, 8)
              .map((r) => `• ${r}`)
              .join("\n")}\n\nСтатус: не FINAL — можно править и перерисовать.`
          : "Готово. Вот собранная карусель.";
      return NextResponse.json({
        reply,
        model: drawResult.model,
        source: "live" as const,
        slides,
        renderMode: drawResult.renderMode,
        slideCount,
        needsReview: Boolean(drawResult.needsReview),
        remarks,
        buildMode,
        ...(drawResult.artifactDir
          ? { artifactDir: drawResult.artifactDir }
          : {}),
        ...(drawResult.budget ? { budget: drawResult.budget } : {}),
        ...(drawResult.cssVarsApplied
          ? { cssVarsApplied: drawResult.cssVarsApplied }
          : {}),
      });
    }

    // Fallback: background-only generate with exact JSON length + captions
    const slidesSpec = carouselJson.slides.map((s) => {
      const primary = s.primary_copy?.trim() || "";
      const secondary = s.secondary_copy?.trim() || "";
      const caption =
        primary && secondary ? `${primary}\n${secondary}` : primary || secondary;
      return {
        caption,
        visual_prompt: s.visual_prompt,
      };
    });

    const title =
      carouselJson.idea?.trim() ||
      carouselJson.hook?.trim() ||
      lastAgreedDescription.slice(0, 80).replace(/\s+/g, " ") ||
      "Vernatun carousel";

    const slidesResult = await runGenerateCarouselSlides({
      competitorId: "create-carousel",
      title,
      description: lastAgreedDescription || undefined,
      slidesSpec,
      slideCount,
      model: process.env.CAROUSEL_IMAGE_MODEL?.trim() || undefined,
      designMarkdown: activeDesignMarkdown || undefined,
      noMock: CREATE_CAROUSEL_NO_MOCK,
      persistToWaveArtifacts: true,
    });

    if (!slidesResult.ok) {
      return NextResponse.json({
        reply: "",
        source: "error" as const,
        error: slidesResult.error ?? drawResult.error,
      });
    }

    const fallbackSlides = mapSlidesToPreviewUrls(slidesResult.slides);
    const slicedOk = assertSlicedCreatePreview(fallbackSlides, slideCount);
    if (!slicedOk.ok) {
      return NextResponse.json({
        reply: "",
        source: "error" as const,
        error: {
          code: "panorama_preview_rejected",
          message: slicedOk.message,
        },
      });
    }
    return NextResponse.json({
      reply: "Готово. Вот собранная карусель.",
      model: slidesResult.model,
      source: "live" as const,
      slides: fallbackSlides,
      slideCount,
      ...(slidesResult.artifactDir
        ? { artifactDir: slidesResult.artifactDir }
        : {}),
      ...(slidesResult.budget ? { budget: slidesResult.budget } : {}),
    });
  }

  // ── System prompt assembly ───────────────────────────────────────────────
  const overridePrompt =
    (typeof body.systemPrompt === "string" && body.systemPrompt.trim()) ||
    (typeof body.systemPromptOverride === "string" &&
      body.systemPromptOverride.trim()) ||
    "";

  let systemPrompt = "";

  if (
    createPath &&
    isCreateCarouselRole(roleKey) &&
    (mode === "handoff" || mode === "describe" || mode === "chat")
  ) {
    if (mode === "handoff" || mode === "describe") {
      const bundle = buildCreateCarouselAgentBundle({
        agentRole: roleKey,
        mode: mode as CreateCarouselPromptMode,
        handoffBrief: handoffBrief || undefined,
        lastAgreedDescription: lastAgreedDescription || undefined,
        priorDialogSummary: priorDialogSummary || undefined,
        pipelineId,
        activeDesignMarkdown: activeDesignMarkdown || undefined,
        activeDesignId: activeDesignId || undefined,
        activeDesignName: activeDesignName || undefined,
        activeDesignPresetFile: activeDesignPresetFile || undefined,
      });
      systemPrompt = assembleAgentStartSystemPrompt(bundle);
    } else {
      // create-carousel + chat: mesh systemPrompt + overlay (+ active DESIGN.md for Designer)
      const meshPrompt =
        overridePrompt ||
        (typeof seedAgent.systemPrompt === "string"
          ? seedAgent.systemPrompt.trim()
          : "");
      let overlay = resolveCreateCarouselOverlay(roleKey, "chat");
      if (roleKey === "designer") {
        overlay = appendActiveDesignMdToDesignerPrompt(
          overlay,
          {
            library: activeDesignMarkdown
              ? [
                  {
                    id: activeDesignId || "active",
                    name: activeDesignName || "DESIGN.md",
                    markdown: activeDesignMarkdown,
                    createdAt: "",
                    presetFile: activeDesignPresetFile ?? undefined,
                  },
                ]
              : [],
            activeId: activeDesignId || "active",
            fallbackMarkdown: activeDesignMarkdown || undefined,
          },
          activeDesignPresetFile,
        );
      }
      // C-audit-02 — paired invariants once + short mesh identity + role overlay
      systemPrompt = [
        CREATE_CAROUSEL_PAIRED_INVARIANTS,
        meshPrompt,
        overlay,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  } else {
    systemPrompt =
      overridePrompt ||
      (typeof seedAgent.systemPrompt === "string"
        ? seedAgent.systemPrompt.trim()
        : "");
    if (
      createPath &&
      roleKey === "designer" &&
      mode === "draw" &&
      activeDesignMarkdown
    ) {
      systemPrompt = appendActiveDesignMdToDesignerPrompt(
        systemPrompt,
        {
          library: [
            {
              id: activeDesignId || "active",
              name: activeDesignName || "DESIGN.md",
              markdown: activeDesignMarkdown,
              createdAt: "",
              presetFile: activeDesignPresetFile ?? undefined,
            },
          ],
          activeId: activeDesignId || "active",
        },
        activeDesignPresetFile,
      );
    }
  }

  // Sprint 9.6/9.8 — custom-reels Scriptwriter gets reels pack (carousel path untouched)
  if (pipelineId === "custom-reels" && roleKey === "scriptwriter") {
    systemPrompt = appendSprint9ReelsPackToSystem(systemPrompt);
  }

  /**
   * C-razbor-draft-edit D-rb-3 — when FE sends carouselJson on razbor chat,
   * ensure system sees draft slides/JSON (skip if FE already injected overlay).
   */
  if (
    surface === "razbor" &&
    body.carouselJson != null &&
    body.carouselJson !== "" &&
    !systemPrompt.includes("Existing carousel draft")
  ) {
    const jsonText =
      typeof body.carouselJson === "string"
        ? body.carouselJson
        : JSON.stringify(body.carouselJson, null, 2);
    systemPrompt = [
      systemPrompt,
      "## priorArtifacts.carouselJson (draft edit)",
      jsonText,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (!resolveAggregatorEnv()) {
    if (createPath) return errorResponse("missing_key");
    // custom-reels generate also no soft-mock success on missing key when asserting JSON later
    if (pipelineId === "custom-reels" && roleKey === "scriptwriter") {
      return errorResponse("missing_key");
    }
    return mockResponse(roleKey);
  }

  // C-audit-06: Scriptwriter Sonnet 503 → sonnet-4 → haiku (documented, not silent)
  const useScriptwriterFallback =
    roleKey === "scriptwriter" &&
    (createPath || pipelineId === "custom-reels" || pipelineId === "carousel-engine");

  const result = await callAggregatorChat({
    system: systemPrompt,
    user: userMessage,
    history,
    model,
    temperature,
    maxTokens,
    ...(typeof thinking === "boolean" ? { thinking } : {}),
    ...(reasoningEffort ? { reasoningEffort } : {}),
    ...(useScriptwriterFallback ? { fallbackModels: true as const } : {}),
  });

  if (!result.ok) {
    if (createPath || pipelineId === "custom-reels") {
      const code =
        result.error === "aggregator_key_missing"
          ? "missing_key"
          : result.error === "empty_user"
            ? "invalid_request"
            : "upstream_fail";
      // Surface tried models (no secrets) so UI/logs show degrade path, not silent fail
      if (result.triedModels?.length) {
        console.warn(
          `[agent-chat] Scriptwriter upstream fail after models: ${result.triedModels.join(" → ")} (${result.error})`,
        );
      }
      return errorResponse(code);
    }
    return mockResponse(roleKey);
  }

  if (!result.text.trim()) {
    if (createPath || pipelineId === "custom-reels") {
      return errorResponse("empty_reply");
    }
    return mockResponse(roleKey);
  }

  const replyText = result.text;

  // Sprint 9.7/9.8 — STRICT + critic when Scriptwriter emits JSON (Create carousel)
  if (
    createPath &&
    roleKey === "scriptwriter" &&
    replyLooksLikeCarouselJson(replyText)
  ) {
    const verdict = critiqueCarouselHandoff(replyText, {
      allowRetryHint: true,
    });
    if (!verdict.ok) {
      return NextResponse.json({
        reply: replyText,
        model: result.model,
        source: "error" as const,
        error: {
          code: verdict.code,
          message: verdict.message,
          reasons: verdict.reasons,
          retryHint: verdict.retryHint,
        },
        critic: "carousel",
      });
    }
  }

  // Sprint 9.6/9.7/9.8 — custom-reels Scriptwriter STRICT + critic
  if (pipelineId === "custom-reels" && roleKey === "scriptwriter") {
    if (replyLooksLikeReelsJson(replyText)) {
      const verdict = critiqueReelsScript(replyText, { allowRetryHint: true });
      if (!verdict.ok) {
        return NextResponse.json({
          reply: replyText,
          model: result.model,
          source: "error" as const,
          error: {
            code: verdict.code,
            message: verdict.message,
            reasons: verdict.reasons,
            retryHint: verdict.retryHint,
          },
          critic: "reels",
        });
      }
    }
  }

  return NextResponse.json({
    reply: replyText,
    model: result.model,
    source: "live" as const,
    ...(result.fallbackFrom
      ? {
          fallbackFrom: result.fallbackFrom,
          triedModels: result.triedModels,
        }
      : {}),
  });
}

function mapLegacy(id: string): string {
  if (id === "copywriter") return "scriptwriter";
  return id;
}
