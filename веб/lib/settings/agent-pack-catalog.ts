/**
 * C-70 / C-75 / C-105 — agent instruction packs.
 * Each content type has its own copywriter (`copywriter-<pipelineId>`).
 */

import {
  MESH_PIPELINE_IDS,
  MESH_PIPELINE_LABELS,
  copywriterPackId,
  type MeshPipelineId,
} from "@/lib/mesh-roles";

export type ContentTypeId = MeshPipelineId | "default";

export const CONTENT_TYPE_OPTIONS: { id: ContentTypeId; label: string }[] = [
  { id: "default", label: "Общий" },
  ...MESH_PIPELINE_IDS.map((id) => ({
    id: id as ContentTypeId,
    label: MESH_PIPELINE_LABELS[id],
  })),
];

export type AgentToolRef = {
  kind: "skill" | "plugin" | "mcp";
  name: string;
};

export type AgentPackMeta = {
  id: string;
  label: string;
  agentMd?: string;
  skillMd?: string;
  promptMd?: string;
  /** C-106 — tools the agent uses (shown in Settings). */
  tools?: AgentToolRef[];
  contentTypeDefaults?: Partial<Record<ContentTypeId, { promptHint: string }>>;
};

export function packScopedKey(
  agentId: string,
  contentType: ContentTypeId | string = "default",
): string {
  if (!contentType || contentType === "default") return agentId;
  return `${agentId}::${contentType}`;
}

export function parsePackScopedKey(key: string): {
  agentId: string;
  contentType: ContentTypeId | string;
} {
  const idx = key.indexOf("::");
  if (idx === -1) return { agentId: key, contentType: "default" };
  return {
    agentId: key.slice(0, idx),
    contentType: key.slice(idx + 2) || "default",
  };
}

const COPYWRITER_PACKS: AgentPackMeta[] = MESH_PIPELINE_IDS.map((id) => ({
  id: copywriterPackId(id),
  label: `Копирайтер · ${MESH_PIPELINE_LABELS[id]}`,
  agentMd: `agents/copywriters/${id}.md`,
  skillMd: `workers/copywriters/${id}/SKILL.md`,
  tools: [
    { kind: "skill", name: `copywriter-${id}` },
    { kind: "skill", name: "prompt-engineering" },
    { kind: "plugin", name: "content-pipeline-agents" },
  ],
}));

export const AGENT_PACK_CATALOG: AgentPackMeta[] = [
  {
    id: "scout",
    label: "Скаут",
    agentMd: "agents/scout.md",
    skillMd: "workers/scout/SKILL.md",
    tools: [
      { kind: "skill", name: "content-factory-analytics" },
      { kind: "mcp", name: "playwright" },
    ],
  },
  {
    id: "analyst",
    label: "Аналитик",
    agentMd: "agents/analyst.md",
    skillMd: "workers/analyst/SKILL.md",
    promptMd: "workers/analyst/prompt.md",
    tools: [
      { kind: "skill", name: "content-factory-analytics" },
      { kind: "mcp", name: "chrome-devtools" },
    ],
  },
  {
    id: "team-trainer",
    label: "Тренер команды",
    agentMd: "agents/team-trainer.md",
    skillMd: "workers/team-trainer/SKILL.md",
    tools: [
      { kind: "skill", name: "trainer" },
      { kind: "mcp", name: "huggingface-skills" },
      { kind: "plugin", name: "plugins/trainer" },
    ],
  },
  {
    id: "razbor-agent",
    label: "Разборщик",
    agentMd: "agents/razbor-agent.md",
    skillMd: "workers/razbor-agent/SKILL.md",
    tools: [
      { kind: "skill", name: "content-pipeline-agents" },
      { kind: "skill", name: "client-scenarios" },
    ],
  },
  ...COPYWRITER_PACKS,
  {
    id: "script-writer",
    label: "Сценарист (legacy)",
    agentMd: "agents/script-writer.md",
    skillMd: "workers/script-writer/SKILL.md",
    tools: [{ kind: "skill", name: "prompt-engineering" }],
  },
  {
    id: "designer",
    label: "Дизайнер",
    agentMd: "agents/designer.md",
    skillMd: "workers/designer-carousel/SKILL.md",
    tools: [
      { kind: "skill", name: "content-factory-ui" },
      { kind: "mcp", name: "21st" },
    ],
  },
  {
    id: "art-director",
    label: "Арт-директор",
    agentMd: "agents/art-director.md",
    skillMd: "workers/art-director/SKILL.md",
    tools: [
      { kind: "skill", name: "art-director" },
      { kind: "skill", name: "carousel-json-contract" },
    ],
  },
  {
    id: "publisher",
    label: "Публицист",
    agentMd: "agents/publisher.md",
    skillMd: "workers/publisher/SKILL.md",
    tools: [{ kind: "skill", name: "content-pipeline-agents" }],
  },
  {
    id: "researcher",
    label: "Исследователь",
    agentMd: "agents/researcher.md",
    skillMd: "workers/researcher/SKILL.md",
  },
  {
    id: "hook-writer",
    label: "Хук-райтер",
    agentMd: "agents/hook-writer.md",
    skillMd: "workers/hook-writer/SKILL.md",
  },
  {
    id: "router",
    label: "Роутер",
    agentMd: "agents/router.md",
    skillMd: "workers/router/SKILL.md",
  },
  {
    id: "renderer",
    label: "Рендерер",
    agentMd: "agents/renderer.md",
  },
];
