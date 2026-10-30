"use client";

import { create } from "zustand";
import {
  getAgentPackOverride,
  writeAgentPackOverride,
} from "@/lib/settings/agent-pack-overrides";
import {
  cloneAgents,
  seedAgentsForPipeline,
} from "@/lib/mesh/agent-defaults";
import {
  isMeshPipelineId,
  type MeshPipelineId,
} from "@/lib/mesh-roles";
import type { MeshAgent } from "@/types/mesh-agent";

/** C-151 — bump clears stale names (e.g. Копирайтер рилсов → Сценарист). */
const STORAGE_PREFIX = "cf.mesh.agents.v2:";
/** C-140 — per-pipeline editable combat brief. */
export const USER_BRIEF_STORAGE_PREFIX = "cf.mesh.userBrief.v1:";

function storageKey(pipelineId: MeshPipelineId) {
  return `${STORAGE_PREFIX}${pipelineId}`;
}

export function userBriefStorageKey(pipelineId: MeshPipelineId) {
  return `${USER_BRIEF_STORAGE_PREFIX}${pipelineId}`;
}

/**
 * S49 — Team basic brief gone. Always empty for inject paths.
 * Legacy localStorage keys are ignored (never return combat seed / custom brief).
 */
export function loadUserBrief(_pipelineId: MeshPipelineId): string {
  return "";
}

/** @deprecated S49 — no-op; brief UI removed. Clears legacy key if present. */
export function persistUserBrief(
  pipelineId: MeshPipelineId,
  _brief: string,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(userBriefStorageKey(pipelineId));
  } catch {
    /* quota */
  }
}

/**
 * @deprecated C-155 / C-team-brief-n-indicator — **no brief glue**.
 * Live Create/Team chat must send raw topic only. Kept for call-site compat;
 * always returns trimmed topic (ignores moduleId / Team «Задание»).
 */
export function composeTopicWithBrief(
  topic: string,
  _moduleId?: string | undefined,
): string {
  return topic.trim();
}

/** Migrate legacy persisted agents (no plugins/mcp/maxTokens). */
function normalizeAgent(raw: MeshAgent): MeshAgent {
  return {
    ...raw,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    plugins: Array.isArray(raw.plugins) ? raw.plugins : [],
    mcp: Array.isArray(raw.mcp) ? raw.mcp : [],
    rules: Array.isArray(raw.rules) ? raw.rules : [],
    modelConfig: {
      model: raw.modelConfig?.model ?? "gpt-4o",
      temperature:
        typeof raw.modelConfig?.temperature === "number"
          ? raw.modelConfig.temperature
          : 0.4,
      maxTokens:
        typeof raw.modelConfig?.maxTokens === "number"
          ? raw.modelConfig.maxTokens
          : 4096,
      ...(typeof raw.modelConfig?.thinking === "boolean"
        ? { thinking: raw.modelConfig.thinking }
        : {}),
      ...(raw.modelConfig?.reasoningEffort === "low" ||
      raw.modelConfig?.reasoningEffort === "medium" ||
      raw.modelConfig?.reasoningEffort === "high"
        ? { reasoningEffort: raw.modelConfig.reasoningEffort }
        : {}),
    },
  };
}

function normalizeAgents(
  agents: Record<string, MeshAgent>,
): Record<string, MeshAgent> {
  const next: Record<string, MeshAgent> = {};
  for (const [id, agent] of Object.entries(agents)) {
    next[id] = normalizeAgent(agent);
  }
  return next;
}

function loadPersisted(
  pipelineId: MeshPipelineId,
): Record<string, MeshAgent> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(pipelineId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, MeshAgent>;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeAgents(parsed);
  } catch {
    return null;
  }
}

function persist(
  pipelineId: MeshPipelineId,
  agents: Record<string, MeshAgent>,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(pipelineId), JSON.stringify(agents));
  } catch {
    /* quota */
  }
}

function mergeOverrides(
  pipelineId: MeshPipelineId,
  agents: Record<string, MeshAgent>,
): Record<string, MeshAgent> {
  const next = cloneAgents(agents);
  for (const agent of Object.values(next)) {
    if (agent.roleKind === "user") continue;
    const ov = getAgentPackOverride(agent.packId, pipelineId);
    if (!ov) continue;
    if (ov.prompt) agent.systemPrompt = ov.prompt;
    if (ov.rules) {
      agent.rules = ov.rules
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return normalizeAgents(next);
}

function bootAgents(pipelineId: MeshPipelineId): Record<string, MeshAgent> {
  const seeded = seedAgentsForPipeline(pipelineId);
  const saved = loadPersisted(pipelineId);
  if (!saved) return mergeOverrides(pipelineId, seeded);
  const merged = cloneAgents(seeded);
  for (const id of Object.keys(merged)) {
    if (saved[id]) {
      merged[id] = normalizeAgent({
        ...merged[id]!,
        ...saved[id]!,
        id,
        plugins: saved[id]!.plugins ?? merged[id]!.plugins,
        mcp: saved[id]!.mcp ?? merged[id]!.mcp,
      });
    }
  }
  return mergeOverrides(pipelineId, merged);
}

type MeshAgentStore = {
  pipelineId: MeshPipelineId;
  agents: Record<string, MeshAgent>;
  /** Snapshot of last Save / seed for Reset. */
  savedBaseline: Record<string, MeshAgent>;
  selectedAgentId: string | null;
  /** C-140 — editable combat brief for current pipeline. */
  userBrief: string;
  setPipeline: (pipelineId: string) => void;
  selectAgent: (id: string | null) => void;
  updateAgent: (id: string, patch: Partial<MeshAgent>) => void;
  saveAgent: (id: string) => void;
  resetAgent: (id: string) => void;
  setUserBrief: (brief: string) => void;
  resetUserBrief: () => void;
  getSelected: () => MeshAgent | null;
};

/**
 * S49 — never write brief into user.userRequest (Create/agents use raw chat only).
 */
function syncUserAgentBrief(
  agents: Record<string, MeshAgent>,
  _brief: string,
): Record<string, MeshAgent> {
  const user = agents.user;
  if (!user) return agents;
  return {
    ...agents,
    user: normalizeAgent({ ...user, userRequest: "" }),
  };
}

export const useMeshAgentStore = create<MeshAgentStore>((set, get) => ({
  pipelineId: "carousel-engine",
  agents: seedAgentsForPipeline("carousel-engine"),
  savedBaseline: seedAgentsForPipeline("carousel-engine"),
  selectedAgentId: null,
  userBrief: "",

  setPipeline: (raw) => {
    const pipelineId: MeshPipelineId = isMeshPipelineId(raw)
      ? raw
      : "carousel-engine";
    const agents = bootAgents(pipelineId);
    const userBrief = loadUserBrief(pipelineId);
    set({
      pipelineId,
      agents: syncUserAgentBrief(agents, userBrief),
      savedBaseline: cloneAgents(agents),
      selectedAgentId: null,
      userBrief,
    });
  },

  selectAgent: (id) => {
    if (id === "user") {
      set({ selectedAgentId: null });
      return;
    }
    set({ selectedAgentId: id });
  },

  updateAgent: (id, patch) => {
    const { agents } = get();
    const prev = agents[id];
    if (!prev) return;
    set({
      agents: {
        ...agents,
        [id]: normalizeAgent({ ...prev, ...patch, id: prev.id }),
      },
    });
  },

  saveAgent: (id) => {
    const { agents, pipelineId, savedBaseline } = get();
    const agent = agents[id];
    if (!agent) return;
    persist(pipelineId, agents);
    if (agent.roleKind !== "user") {
      writeAgentPackOverride(
        agent.packId,
        {
          prompt: agent.systemPrompt,
          rules: agent.rules.join("\n"),
        },
        pipelineId,
      );
    }
    set({
      savedBaseline: {
        ...savedBaseline,
        [id]: cloneAgents({ [id]: agent })[id]!,
      },
    });
  },

  resetAgent: (id) => {
    const { pipelineId, savedBaseline, agents } = get();
    const baseline =
      savedBaseline[id] ?? seedAgentsForPipeline(pipelineId)[id];
    if (!baseline) return;
    set({
      agents: {
        ...agents,
        [id]: cloneAgents({ [id]: baseline })[id]!,
      },
    });
  },

  setUserBrief: (_brief) => {
    const { pipelineId, agents } = get();
    persistUserBrief(pipelineId, "");
    set({
      userBrief: "",
      agents: syncUserAgentBrief(agents, ""),
    });
  },

  resetUserBrief: () => {
    const { pipelineId, agents } = get();
    persistUserBrief(pipelineId, "");
    set({
      userBrief: "",
      agents: syncUserAgentBrief(agents, ""),
    });
  },

  getSelected: () => {
    const { selectedAgentId, agents } = get();
    if (!selectedAgentId) return null;
    return agents[selectedAgentId] ?? null;
  },
}));
