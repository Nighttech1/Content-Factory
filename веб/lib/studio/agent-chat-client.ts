/**
 * C-155 / C-carousel-agents — client helper for POST /api/studio/agent-chat.
 * Create carousel: fail → source:"error" (no soft-ack fallback).
 * Razbor: soft-fail mock via AGENT_CHAT_SOFT_ACK.
 */

import { useMeshAgentStore } from "@/lib/mesh/agent-store";
import { isMeshPipelineId, type MeshPipelineId } from "@/lib/mesh-roles";
import {
  readActiveDesignMarkdownClient,
  type DesignPresetFile,
} from "@/lib/settings/design-library";
import {
  AGENT_CHAT_SOFT_ACK,
  createCarouselErrorMessage,
} from "@/lib/studio/agent-chat-soft-ack";
import { sanitizeAgentChatTurnsForC155 } from "@/lib/studio/agent-chat-sanitize";

export type AgentChatRole =
  | "scriptwriter"
  | "designer"
  | "artDirector"
  | "publisher"
  | "analyst"
  | "razbor";

export type AgentChatMode = "chat" | "handoff" | "describe" | "draw";

export type AgentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentChatSlide = {
  id: string;
  caption: string;
  imageUrl: string;
};

export type AgentChatError = {
  code: string;
  message: string;
};

export type AgentChatResponse = {
  reply: string;
  model: string;
  source: "live" | "mock" | "error";
  slides?: AgentChatSlide[];
  error?: AgentChatError;
};

/** UI tab / role → mesh seed agent id (systemPrompt override). */
export const AGENT_ROLE_TO_MESH_ID: Record<AgentChatRole, string> = {
  scriptwriter: "copywriter",
  designer: "designer",
  artDirector: "art-director",
  publisher: "publisher",
  analyst: "analyst",
  razbor: "razbor",
};

export function resolvePipelineId(moduleId?: string | null): MeshPipelineId {
  if (moduleId && isMeshPipelineId(moduleId)) return moduleId;
  return "carousel-engine";
}

export function meshSystemPromptForRole(
  agentRole: AgentChatRole,
): string | undefined {
  const meshId = AGENT_ROLE_TO_MESH_ID[agentRole];
  const agent = useMeshAgentStore.getState().agents[meshId];
  const prompt = agent?.systemPrompt?.trim();
  return prompt || undefined;
}

export function meshModelConfigForRole(agentRole: AgentChatRole):
  | {
      model: string;
      temperature?: number;
      maxTokens?: number;
      thinking?: boolean;
      reasoningEffort?: "low" | "medium" | "high";
    }
  | undefined {
  const meshId = AGENT_ROLE_TO_MESH_ID[agentRole];
  const cfg = useMeshAgentStore.getState().agents[meshId]?.modelConfig;
  if (!cfg?.model) return undefined;
  return {
    model: cfg.model,
    temperature: cfg.temperature,
    maxTokens: cfg.maxTokens,
    ...(typeof cfg.thinking === "boolean" ? { thinking: cfg.thinking } : {}),
    ...(cfg.reasoningEffort
      ? { reasoningEffort: cfg.reasoningEffort }
      : {}),
  };
}

/**
 * S48 — Razbor modal «Разборщик» tab prefers mesh `razbor` (Haiku + thinking),
 * not Scout `analyst`.
 */
export function meshRazborAnalystSystemPrompt(): string | undefined {
  const razbor = useMeshAgentStore.getState().agents.razbor?.systemPrompt?.trim();
  if (razbor) return razbor;
  return meshSystemPromptForRole("analyst");
}

export function meshRazborAnalystModelConfig():
  | {
      model: string;
      temperature?: number;
      maxTokens?: number;
      thinking?: boolean;
      reasoningEffort?: "low" | "medium" | "high";
    }
  | undefined {
  const cfg = useMeshAgentStore.getState().agents.razbor?.modelConfig;
  if (cfg?.model) {
    return {
      model: cfg.model,
      temperature: cfg.temperature,
      maxTokens: cfg.maxTokens,
      ...(typeof cfg.thinking === "boolean" ? { thinking: cfg.thinking } : {}),
      ...(cfg.reasoningEffort
        ? { reasoningEffort: cfg.reasoningEffort }
        : {}),
    };
  }
  return meshModelConfigForRole("analyst");
}

export type RazborAnalyzeApiOk = {
  ok: true;
  source: "live" | "mock";
  model: string;
  softFailReason?: string;
  competitorSlides: Array<{ id: string; imageUrl: string; caption: string }>;
  analysis: {
    summary: string;
    hook: string;
    middle: string;
    cta: string;
    viralityWhy: string[];
    trainerTasks: Array<{
      target: "scriptwriter" | "designer" | "module";
      task: string;
    }>;
    handoffBrief: string;
    displayText: string;
    rawJson?: string;
  };
  displayText: string;
  handoffBrief: string;
  trainerTasks: Array<{
    target: "scriptwriter" | "designer" | "module";
    task: string;
  }>;
};

export type RazborAnalyzeApiErr = {
  ok: false;
  error: string;
  source?: "error";
};

/** Client: POST /api/studio/razbor/analyze (LIVE Haiku). */
export async function postRazborAnalyze(input: {
  post?: import("@/lib/studio/feed-types").FeedPost | null;
  slideUrls?: string[];
  slideCaptions?: string[];
  moduleId?: string;
  source?: "competitor" | "boards";
  model?: string;
  signal?: AbortSignal;
}): Promise<RazborAnalyzeApiOk | RazborAnalyzeApiErr> {
  try {
    const res = await fetch("/api/studio/razbor/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: input.post ?? undefined,
        slideUrls: input.slideUrls,
        slideCaptions: input.slideCaptions,
        moduleId: input.moduleId,
        source: input.source ?? "competitor",
        model: input.model,
      }),
      signal: input.signal,
    });
    const json = (await res.json()) as RazborAnalyzeApiOk | RazborAnalyzeApiErr;
    if (!json || typeof json !== "object") {
      return { ok: false, error: "bad_json", source: "error" };
    }
    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "aborted", source: "error" };
    }
    return { ok: false, error: "network", source: "error" };
  }
}

function isCreateSurface(surface?: string, mode?: AgentChatMode): boolean {
  if (surface === "create-carousel") return true;
  return mode === "handoff" || mode === "describe" || mode === "draw";
}

function createErrorResponse(
  code: string,
  message?: string,
): AgentChatResponse {
  return {
    reply: "",
    model: "error",
    source: "error",
    error: {
      code,
      message: message || createCarouselErrorMessage(code),
    },
  };
}

export async function postStudioAgentChat(input: {
  agentRole: AgentChatRole;
  pipelineId: string;
  messages: AgentChatMessage[];
  moduleId?: string;
  systemPrompt?: string;
  modelConfig?: {
    model: string;
    temperature?: number;
    maxTokens?: number;
    thinking?: boolean;
    reasoningEffort?: "low" | "medium" | "high";
  };
  mode?: AgentChatMode;
  surface?: "create-carousel" | "razbor" | string;
  handoffBrief?: string;
  lastAgreedDescription?: string;
  priorDialogSummary?: string;
  /**
   * Create draw: validated handoff JSON (object or string).
   * Backend uses slides.length for N; HTML renderer when present.
   */
  carouselJson?: unknown;
  /**
   * Optional active DESIGN.md from Settings library.
   * If omitted on Designer Create paths, client resolves from localStorage.
   */
  activeDesignMarkdown?: string | null;
  activeDesignId?: string | null;
  activeDesignName?: string | null;
  /** Active DesignPresetFile (seeds / deconstruct / Tuner) for Designer draw. */
  activeDesignPresetFile?: DesignPresetFile | null;
  /** Vernatun Mode A (HTML/CSS) or B (full AI slide). */
  buildMode?: "A" | "B";
  /** Vernatun topic-first draw (Create Art Director). */
  topic?: string;
  /** Default 4 for Vernatun Create path when topic-first. */
  slideCount?: number;
  /** Post-preview AD remarks → Vernatun styleNotes / repair (O6). */
  styleNotes?: string;
  /** User photos from chat (base64) for Mode A must-use. */
  userAssetFiles?: Array<{
    filename: string;
    mime?: string;
    data: string;
    required?: boolean;
  }>;
  signal?: AbortSignal;
}): Promise<AgentChatResponse> {
  const createPath = isCreateSurface(input.surface, input.mode);

  const soft: AgentChatResponse = {
    reply: AGENT_CHAT_SOFT_ACK[input.agentRole],
    model: "mock",
    source: "mock",
  };

  // C-155: never send Team brief glue in user turns
  const messages = sanitizeAgentChatTurnsForC155(input.messages);

  // Create draw (designer / artDirector): attach active library DESIGN.md + preset
  const attachDesign =
    createPath &&
    (input.agentRole === "designer" || input.agentRole === "artDirector");
  let activeDesignMarkdown = input.activeDesignMarkdown ?? null;
  let activeDesignId = input.activeDesignId ?? null;
  let activeDesignName = input.activeDesignName ?? null;
  let activeDesignPresetFile = input.activeDesignPresetFile ?? null;
  if (attachDesign && !activeDesignMarkdown?.trim()) {
    try {
      const resolved = readActiveDesignMarkdownClient();
      if (resolved.markdown.trim()) {
        activeDesignMarkdown = resolved.markdown;
        activeDesignId = resolved.activeId;
        activeDesignName = resolved.slot?.name ?? null;
        activeDesignPresetFile =
          resolved.presetFile ??
          resolved.slot?.presetFile ??
          null;
      }
    } catch {
      /* SSR / storage */
    }
  } else if (attachDesign && !activeDesignPresetFile) {
    try {
      const resolved = readActiveDesignMarkdownClient();
      activeDesignPresetFile =
        resolved.presetFile ?? resolved.slot?.presetFile ?? null;
    } catch {
      /* */
    }
  }

  try {
    const res = await fetch("/api/studio/agent-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentRole: input.agentRole,
        pipelineId: input.pipelineId,
        messages,
        moduleId: input.moduleId,
        systemPrompt: input.systemPrompt,
        modelConfig: input.modelConfig,
        mode: input.mode,
        surface: input.surface,
        handoffBrief: input.handoffBrief,
        lastAgreedDescription: input.lastAgreedDescription,
        priorDialogSummary: input.priorDialogSummary,
        ...(input.carouselJson != null
          ? { carouselJson: input.carouselJson }
          : {}),
        ...(input.buildMode ? { buildMode: input.buildMode } : {}),
        ...(input.topic?.trim() ? { topic: input.topic.trim() } : {}),
        ...(typeof input.slideCount === "number" &&
        Number.isFinite(input.slideCount)
          ? { slideCount: input.slideCount }
          : {}),
        ...(input.styleNotes?.trim()
          ? { styleNotes: input.styleNotes.trim() }
          : {}),
        ...(input.userAssetFiles?.length
          ? { userAssetFiles: input.userAssetFiles }
          : {}),
        ...(activeDesignMarkdown?.trim()
          ? {
              activeDesignMarkdown,
              activeDesignId,
              activeDesignName,
              ...(activeDesignPresetFile
                ? { activeDesignPresetFile }
                : {}),
            }
          : {}),
      }),
      signal: input.signal,
    });

    if (!res.ok) {
      if (createPath) {
        return createErrorResponse(
          res.status === 400 ? "invalid_request" : "upstream_fail",
        );
      }
      return soft;
    }

    const json = (await res.json()) as Partial<AgentChatResponse> & {
      reply?: string;
      error?: AgentChatError | string;
    };

    if (json.source === "error") {
      const err =
        json.error && typeof json.error === "object"
          ? json.error
          : undefined;
      return createErrorResponse(
        err?.code || "upstream_fail",
        err?.message,
      );
    }

    if (typeof json.reply !== "string" || !json.reply.trim()) {
      if (createPath) return createErrorResponse("empty_reply");
      return soft;
    }

    // Create carousel: never accept mock / unknown as success
    if (createPath && json.source !== "live") {
      return createErrorResponse("upstream_fail");
    }

    const slides = Array.isArray(json.slides)
      ? json.slides.filter(
          (s): s is AgentChatSlide =>
            !!s &&
            typeof s.id === "string" &&
            typeof s.imageUrl === "string" &&
            s.imageUrl.length > 0,
        )
      : undefined;

    return {
      reply: json.reply.trim(),
      model: typeof json.model === "string" ? json.model : "unknown",
      source: json.source === "live" ? "live" : "mock",
      ...(slides && slides.length > 0 ? { slides } : {}),
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    if (createPath) {
      return createErrorResponse("aggregator_unavailable");
    }
    return soft;
  }
}
