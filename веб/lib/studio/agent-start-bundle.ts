/**
 * C-carousel-agents — agent-start bundle for Create carousel (AI Bridge).
 * Assembles request/context/rules/skills/plugins/MCP summary for aggregator system.
 * No secrets — MCP lists tool/binding names only.
 */

import { seedAgentsForPipeline } from "@/lib/mesh/agent-defaults";
import { isMeshPipelineId, type MeshPipelineId } from "@/lib/mesh-roles";
import type { DesignPresetFile } from "@/lib/settings/design-library";
import {
  appendActiveDesignMdToDesignerPrompt,
  CREATE_CAROUSEL_PAIRED_INVARIANTS,
  resolveCreateCarouselOverlay,
  type CreateCarouselAgentRole,
  type CreateCarouselPromptMode,
  type DrawReferenceImageSignal,
  type StyleCopyMode,
} from "@/lib/studio/create-carousel-prompts";
import { CAROUSEL_JSON_SCHEMA_HINT } from "@/lib/studio/carousel-json-contract";
import {
  SPRINT9_CAROUSEL_CRITIC_INSTRUCTIONS,
  SPRINT9_CAROUSEL_FEWSHOT_BLOCK,
} from "@/lib/studio/prompt-packs/sprint9-carousel-pack";
import {
  SPRINT9_REELS_CRITIC_INSTRUCTIONS,
  SPRINT9_REELS_FEWSHOT_BLOCK,
  SPRINT9_REELS_SYSTEM_CORE,
} from "@/lib/studio/prompt-packs/sprint9-reels-pack";
import type { MeshAgent } from "@/types/mesh-agent";

export type AgentStartBundleParts = {
  request: string;
  context: string;
  rules: string;
  skills: string;
  plugins: string;
  /** Binding / tool names only — never env values or API keys. */
  mcpSummary: string;
};

export type BuildCreateCarouselAgentBundleInput = {
  agentRole: CreateCarouselAgentRole;
  mode: CreateCarouselPromptMode;
  handoffBrief?: string;
  lastAgreedDescription?: string;
  /** Machine-readable Scriptwriter handoff JSON (stringified) for Designer. */
  carouselJson?: string;
  priorDialogSummary?: string;
  pipelineId?: string;
  /** Optional hydrated mesh agent (store override); else seed defaults. */
  meshAgentOverride?: MeshAgent;
  /**
   * C-settings-design-md-carousel — active library DESIGN.md body for Designer.
   * Injected into system/rules only (never into live user turns / C-155).
   */
  activeDesignMarkdown?: string | null;
  activeDesignId?: string | null;
  activeDesignName?: string | null;
  /** Typed companion preset (seeds / deconstruct / Tuner overrides). */
  activeDesignPresetFile?: DesignPresetFile | null;
  /**
   * vision_ref → skip FULL DESIGN inject; Backend attaches etalon image parts.
   * token_card / omit → legacy FULL token path.
   */
  styleCopyMode?: StyleCopyMode | null;
  /** Optional per-call reference signal (Backend fills slots before draw). */
  referenceImage?: DrawReferenceImageSignal | null;
};

const SECTION_ORDER: Array<{
  key: keyof AgentStartBundleParts;
  title: string;
}> = [
  { key: "request", title: "Request" },
  { key: "context", title: "Context" },
  { key: "rules", title: "Rules" },
  { key: "skills", title: "Skills" },
  { key: "plugins", title: "Plugins" },
  { key: "mcpSummary", title: "MCP" },
];

function resolvePipeline(pipelineId?: string): MeshPipelineId {
  if (pipelineId && isMeshPipelineId(pipelineId)) return pipelineId;
  return "carousel-engine";
}

/** UI Create role → mesh seed agent id. */
function meshIdForRole(agentRole: CreateCarouselAgentRole): "copywriter" | "designer" {
  return agentRole === "scriptwriter" ? "copywriter" : "designer";
}

function joinList(items: string[] | undefined, empty = "(нет)"): string {
  const cleaned = (items ?? []).map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) return empty;
  return cleaned.map((s) => `- ${s}`).join("\n");
}

/**
 * MCP summary: names / binding ids only.
 * Strips anything that looks like a secret value (key=, Bearer, long tokens).
 */
export function summarizeMcpBindings(mcp: string[] | undefined): string {
  const names: string[] = [];
  for (const raw of mcp ?? []) {
    const line = raw.trim();
    if (!line) continue;
    if (/=.+/.test(line) && /key|token|secret|password|auth/i.test(line)) {
      // Keep only the left-hand name if present: AUTH_ENV_KEY=*** → AUTH_ENV_KEY
      const nameOnly = line.split("=")[0]?.trim();
      if (nameOnly) names.push(nameOnly);
      continue;
    }
    if (/bearer\s+\S+/i.test(line) || /sk-[a-z0-9]+/i.test(line)) {
      continue;
    }
    names.push(line);
  }
  return joinList(names, "(нет MCP-привязок)");
}

function buildRequest(
  agentRole: CreateCarouselAgentRole,
  mode: CreateCarouselPromptMode,
  handoffBrief?: string,
  lastAgreedDescription?: string,
  carouselJson?: string,
): string {
  const brief = handoffBrief?.trim();
  const agreed = lastAgreedDescription?.trim();
  const json = carouselJson?.trim();

  if (agentRole === "scriptwriter") {
    const lines = [
      "Задача: Dramaturgy & Hook Engine — STRICT JSON карусели Instagram 4:5 Vernatun (Sprint 9).",
      "Режим: " + mode + ".",
      "JSON contract: " + CAROUSEL_JSON_SCHEMA_HINT,
      "Paired invariants + CTA/hook HARD — see Rules (once). Here: few-shots + critic only.",
      "",
      SPRINT9_CAROUSEL_FEWSHOT_BLOCK,
      "",
      SPRINT9_CAROUSEL_CRITIC_INSTRUCTIONS,
    ];
    if (brief) lines.push("", "Доп. запрос пользователя:", brief);
    return lines.join("\n");
  }

  if (mode === "draw") {
    return [
      "Задача: отрисовать карусель по handoff JSON (visual_prompt + copies; HTML text overlays).",
      "Режим: draw.",
      "slideCount = slides.length из JSON — не хардкодить.",
      "",
      "Carousel JSON:",
      json || "(JSON не передан — не рисуй; запроси handoff с валидным JSON)",
      "",
      "Согласованное описание (если есть):",
      agreed || brief || "(нет)",
    ].join("\n");
  }

  // designer handoff | describe | chat
  return [
    "Задача: принять JSON сценариста, подтвердить получение и дать краткое описание по slides[].",
    "Режим: " + mode + ".",
    "JSON contract: " + CAROUSEL_JSON_SCHEMA_HINT,
    "",
    "Carousel JSON / brief от сценариста:",
    json || brief || "(brief/JSON пуст — попроси пользователя передать задание ещё раз)",
  ].join("\n");
}

function buildContext(
  priorDialogSummary?: string,
  lastAgreedDescription?: string,
  mode?: CreateCarouselPromptMode,
  carouselJson?: string,
): string {
  const parts: string[] = [];
  const dialog = priorDialogSummary?.trim();
  if (dialog) {
    parts.push("### Диалог / артефакты предыдущего шага", dialog);
  } else {
    parts.push("### Диалог", "(сводка диалога не передана)");
  }
  const json = carouselJson?.trim();
  if (json) {
    parts.push("", "### priorArtifacts.carouselJson", json);
  }
  if (mode !== "draw") {
    const agreed = lastAgreedDescription?.trim();
    if (agreed) {
      parts.push("", "### Текущее описание кадров", agreed);
    }
  }
  parts.push("", "### JSON schema hint", CAROUSEL_JSON_SCHEMA_HINT);
  return parts.join("\n");
}

/**
 * C-audit-02 D-p-1 — Rules once:
 * paired invariants → role overlay delta → short mesh identity → mesh rules list.
 * Forbidden: full CREATE overlay + full mesh systemPrompt + pack HARD triple-spam.
 */
function buildRulesBlock(
  agent: MeshAgent | undefined,
  overlay: string,
  agentRole: CreateCarouselAgentRole,
  activeDesignMarkdown?: string | null,
  activeDesignId?: string | null,
  activeDesignName?: string | null,
  activeDesignPresetFile?: DesignPresetFile | null,
  styleCopyMode?: StyleCopyMode | null,
  referenceImage?: DrawReferenceImageSignal | null,
): string {
  let effectiveOverlay = overlay;
  if (agentRole === "designer") {
    effectiveOverlay = appendActiveDesignMdToDesignerPrompt(
      overlay,
      {
        library: activeDesignMarkdown?.trim()
          ? [
              {
                id: activeDesignId ?? "active",
                name: activeDesignName?.trim() || "DESIGN.md",
                markdown: activeDesignMarkdown.trim(),
                createdAt: "",
                presetFile: activeDesignPresetFile ?? undefined,
              },
            ]
          : [],
        activeId: activeDesignId ?? "active",
        fallbackMarkdown: activeDesignMarkdown,
      },
      activeDesignPresetFile,
      { styleCopyMode, referenceImage },
    );
  }

  const meshRules = joinList(agent?.rules, "(нет mesh rules)");
  /** Short role identity only — seed prompts are slim after C-audit-02. */
  const identity = agent?.systemPrompt?.trim()
    ? agent.systemPrompt.trim().slice(0, 420)
    : "(нет mesh identity)";

  return [
    CREATE_CAROUSEL_PAIRED_INVARIANTS,
    "",
    "### Role overlay (delta — Create carousel)",
    effectiveOverlay,
    "",
    "### Mesh role identity (short)",
    identity,
    "",
    "### Mesh rules",
    meshRules,
  ].join("\n");
}

/**
 * Format bundle parts as markdown sections for aggregator `system` (or context prepend).
 */
export function assembleAgentStartSystemPrompt(
  parts: AgentStartBundleParts,
): string {
  return SECTION_ORDER.map(({ key, title }) => {
    const body = (parts[key] ?? "").trim() || "(пусто)";
    return `## ${title}\n\n${body}`;
  }).join("\n\n");
}

/**
 * Build Create-carousel agent-start parts from mesh defaults (+ optional override).
 */
export function buildCreateCarouselAgentBundle(
  input: BuildCreateCarouselAgentBundleInput,
): AgentStartBundleParts {
  const pipelineId = resolvePipeline(input.pipelineId);
  const meshId = meshIdForRole(input.agentRole);
  const seeded = seedAgentsForPipeline(pipelineId)[meshId];
  const agent = input.meshAgentOverride ?? seeded;

  const overlay = resolveCreateCarouselOverlay(input.agentRole, input.mode, {
    styleCopyMode: input.styleCopyMode,
    referenceImage: input.referenceImage,
    characterPaint: input.agentRole === "designer" ? "in_image" : null,
  });

  const parts: AgentStartBundleParts = {
    request: buildRequest(
      input.agentRole,
      input.mode,
      input.handoffBrief,
      input.lastAgreedDescription,
      input.carouselJson,
    ),
    context: buildContext(
      input.priorDialogSummary,
      input.lastAgreedDescription,
      input.mode,
      input.carouselJson,
    ),
    rules: buildRulesBlock(
      agent,
      overlay,
      input.agentRole,
      input.activeDesignMarkdown,
      input.activeDesignId,
      input.activeDesignName,
      input.activeDesignPresetFile,
      input.styleCopyMode,
      input.referenceImage,
    ),
    skills: joinList(agent?.skills),
    plugins: joinList(agent?.plugins),
    mcpSummary: summarizeMcpBindings(agent?.mcp),
  };

  // Sprint 9.8 — inject reels pack when pipeline is custom-reels (Scriptwriter only).
  if (pipelineId === "custom-reels" && input.agentRole === "scriptwriter") {
    parts.rules = [
      parts.rules,
      "",
      "### Sprint 9 reels pack",
      SPRINT9_REELS_SYSTEM_CORE,
      "",
      SPRINT9_REELS_FEWSHOT_BLOCK,
      "",
      SPRINT9_REELS_CRITIC_INSTRUCTIONS,
    ].join("\n");
  }

  return parts;
}

/**
 * Build system append for live custom-reels chat (mesh seed + Sprint 9 pack).
 * Does not remove carousel overlays on carousel-engine.
 */
export function appendSprint9ReelsPackToSystem(base: string): string {
  const pack = [
    SPRINT9_REELS_SYSTEM_CORE,
    "",
    SPRINT9_REELS_FEWSHOT_BLOCK,
    "",
    SPRINT9_REELS_CRITIC_INSTRUCTIONS,
  ].join("\n");
  const trimmed = (base ?? "").trim();
  return trimmed ? `${trimmed}\n\n${pack}` : pack;
}
