/**
 * C-70 / C-71 / C-75 — editable prompt + rules overrides shared by Settings + Mesh.
 * Keys: `agentId` or `agentId::contentType` (see packScopedKey).
 */

import {
  packScopedKey,
  type ContentTypeId,
} from "@/lib/settings/agent-pack-catalog";

export type AgentPackOverride = {
  prompt: string;
  rules: string;
  /** C-106 — uploaded MD filenames */
  promptFileName?: string;
  rulesFileName?: string;
};

const STORAGE_KEY = "cf.settings.agentPacks.v1";

export type AgentPackOverridesMap = Record<string, AgentPackOverride>;

export function readAgentPackOverrides(): AgentPackOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AgentPackOverridesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeAgentPackOverride(
  agentId: string,
  pack: AgentPackOverride,
  contentType: ContentTypeId | string = "default",
): void {
  if (typeof window === "undefined") return;
  try {
    const key = packScopedKey(agentId, contentType);
    const next = { ...readAgentPackOverrides(), [key]: pack };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function getAgentPackOverride(
  agentId: string,
  contentType: ContentTypeId | string = "default",
): AgentPackOverride | null {
  const all = readAgentPackOverrides();
  const scoped = packScopedKey(agentId, contentType);
  if (all[scoped]) return all[scoped]!;
  // Fall back to unscoped agentId when content-type override missing
  if (contentType !== "default" && all[agentId]) return all[agentId]!;
  return null;
}
