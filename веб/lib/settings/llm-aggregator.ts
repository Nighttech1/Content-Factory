/**
 * C-81 — LLM aggregator connection (URL + API key) in localStorage.
 * Secrets never committed; UI masks key.
 */

export const LLM_AGGREGATOR_STORAGE_KEY = "cf.settings.llmAggregator.v1";

export type LlmAggregatorConfig = {
  baseUrl: string;
  apiKey: string;
};

export const DEFAULT_LLM_AGGREGATOR: LlmAggregatorConfig = {
  baseUrl: "",
  apiKey: "",
};

export function readLlmAggregatorFromStorage(): LlmAggregatorConfig {
  if (typeof window === "undefined") return { ...DEFAULT_LLM_AGGREGATOR };
  try {
    const raw = window.localStorage.getItem(LLM_AGGREGATOR_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LLM_AGGREGATOR };
    const parsed = JSON.parse(raw) as Partial<LlmAggregatorConfig>;
    return {
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : "",
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
    };
  } catch {
    return { ...DEFAULT_LLM_AGGREGATOR };
  }
}

export function writeLlmAggregatorToStorage(cfg: LlmAggregatorConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LLM_AGGREGATOR_STORAGE_KEY,
    JSON.stringify({
      baseUrl: cfg.baseUrl.trim(),
      apiKey: cfg.apiKey,
    }),
  );
}
