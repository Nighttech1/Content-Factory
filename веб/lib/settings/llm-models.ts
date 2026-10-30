/**
 * C-34 / C-81 — Agent LLM model catalog + localStorage prefs (client-only).
 * Catalog is open string ids (aggregator-facing); not limited to 4 stock models.
 */

export const LLM_AGENT_MODELS_STORAGE_KEY = "cf-llm-agent-models";

export const LLM_AGENT_IDS = [
  "researcher",
  "hook-writer",
  "script-writer",
  "analyst",
  "designer",
  "renderer",
  "publisher",
  "router",
] as const;

export type LlmAgentId = (typeof LLM_AGENT_IDS)[number];

/** Open id — any catalog entry or custom aggregator model slug. */
export type LlmModelId = string;

export type LlmModelOption = {
  id: LlmModelId;
  label: string;
  provider?: string;
};

/** C-81 — expanded catalog (aggregator will pick concrete route). */
export const LLM_MODEL_CATALOG: readonly LlmModelOption[] = [
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI" },
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4.1", label: "GPT-4.1", provider: "OpenAI" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", provider: "OpenAI" },
  { id: "o3-mini", label: "o3-mini", provider: "OpenAI" },
  { id: "claude-sonnet", label: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "claude-opus", label: "Claude Opus 4", provider: "Anthropic" },
  { id: "claude-haiku", label: "Claude Haiku 3.5", provider: "Anthropic" },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    label: "Claude 3.7 Sonnet",
    provider: "Anthropic",
  },
  {
    id: "anthropic/claude-sonnet-4",
    label: "Claude Sonnet 4 (Scriptwriter fallback)",
    provider: "Anthropic",
  },
  {
    id: "claude-sonnet-4",
    label: "Claude Sonnet 4",
    provider: "Anthropic",
  },
  {
    id: "openai/gpt-5.4-image-2",
    label: "GPT-5.4 Image 2",
    provider: "OpenAI",
  },
  { id: "gemini-flash", label: "Gemini 2.0 Flash", provider: "Google" },
  { id: "gemini-pro", label: "Gemini 2.5 Pro", provider: "Google" },
  { id: "gemini-flash-lite", label: "Gemini Flash Lite", provider: "Google" },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner", provider: "DeepSeek" },
  { id: "mistral-large", label: "Mistral Large", provider: "Mistral" },
  { id: "mistral-small", label: "Mistral Small", provider: "Mistral" },
  { id: "llama-3.3-70b", label: "Llama 3.3 70B", provider: "Meta" },
  { id: "qwen-max", label: "Qwen Max", provider: "Alibaba" },
  { id: "grok-2", label: "Grok 2", provider: "xAI" },
] as const;

export type LlmAgentMeta = {
  id: LlmAgentId;
  label: string;
  description: string;
  defaultModelId: LlmModelId;
  packPath: string;
};

export const LLM_AGENTS: readonly LlmAgentMeta[] = [
  {
    id: "researcher",
    label: "Исследователь",
    description: "Тренды, источники, ниша",
    defaultModelId: "gpt-4o-mini",
    packPath: "agents/researcher.md",
  },
  {
    id: "hook-writer",
    label: "Автор хуков",
    description: "Хуки и оценка вирусности",
    defaultModelId: "gpt-4o",
    packPath: "agents/hook-writer.md",
  },
  {
    id: "script-writer",
    label: "Сценарист",
    description: "Idea-brief / сценарий",
    defaultModelId: "anthropic/claude-3.7-sonnet",
    packPath: "agents/script-writer.md",
  },
  {
    id: "analyst",
    label: "Аналитик",
    description: "Метрики → инсайты (/analytics)",
    defaultModelId: "gpt-4o-mini",
    packPath: "agents/analyst.md",
  },
  {
    id: "designer",
    label: "Дизайнер",
    description: "Визуал / макеты",
    defaultModelId: "openai/gpt-5.4-image-2",
    packPath: "agents/designer.md",
  },
  {
    id: "renderer",
    label: "Рендерер",
    description: "Remotion / HeyGen / Satori",
    defaultModelId: "gpt-4o-mini",
    packPath: "agents/renderer.md",
  },
  {
    id: "publisher",
    label: "Публицист",
    description: "Слоты и площадки после HITL",
    defaultModelId: "gpt-4o-mini",
    packPath: "agents/publisher.md",
  },
  {
    id: "router",
    label: "Маршрутизатор",
    description: "Выбор модуля пайплайна",
    defaultModelId: "gemini-flash",
    packPath: "agents/router.md",
  },
] as const;

export type LlmAgentModelMap = Record<LlmAgentId, LlmModelId>;

export function defaultLlmAgentModels(): LlmAgentModelMap {
  const out = {} as LlmAgentModelMap;
  for (const agent of LLM_AGENTS) {
    out[agent.id] = agent.defaultModelId;
  }
  return out;
}

function isKnownOrCustomModelId(value: unknown): value is LlmModelId {
  return typeof value === "string" && value.trim().length > 0;
}

/** Merge stored JSON with defaults; keep custom aggregator model ids. */
export function parseLlmAgentModels(raw: unknown): LlmAgentModelMap {
  const defaults = defaultLlmAgentModels();
  if (!raw || typeof raw !== "object") return defaults;
  const src = raw as Record<string, unknown>;
  const out = { ...defaults };
  for (const id of LLM_AGENT_IDS) {
    if (isKnownOrCustomModelId(src[id])) out[id] = String(src[id]).trim();
  }
  return out;
}

export function readLlmAgentModelsFromStorage(): LlmAgentModelMap {
  if (typeof window === "undefined") return defaultLlmAgentModels();
  try {
    const raw = window.localStorage.getItem(LLM_AGENT_MODELS_STORAGE_KEY);
    if (!raw) return defaultLlmAgentModels();
    return parseLlmAgentModels(JSON.parse(raw) as unknown);
  } catch {
    return defaultLlmAgentModels();
  }
}

export function writeLlmAgentModelsToStorage(map: LlmAgentModelMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LLM_AGENT_MODELS_STORAGE_KEY,
    JSON.stringify(map),
  );
}

/** Catalog + any custom ids already chosen by agents. */
export function resolveModelOptions(
  agentModels: LlmAgentModelMap,
): LlmModelOption[] {
  const byId = new Map(LLM_MODEL_CATALOG.map((m) => [m.id, m]));
  for (const id of Object.values(agentModels)) {
    if (!byId.has(id)) {
      byId.set(id, { id, label: id, provider: "Агрегатор" });
    }
  }
  return [...byId.values()];
}
