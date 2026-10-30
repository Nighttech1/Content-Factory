/**
 * C-34 — Thin env reader for the shared LLM aggregator.
 *
 * Settings UI (`/settings`) picks which model each agent uses
 * (browser localStorage `cf-llm-agent-models`). Env holds only:
 *   - AGGREGATOR_API_KEY + AGGREGATOR_BASE_URL
 *   - optional AGGREGATOR_DEFAULT_MODEL
 *   - optional AGGREGATOR_MODEL_MAP_<uiModelId> remaps
 *
 * Never log apiKey or Authorization headers.
 */

export const DEFAULT_AGGREGATOR_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_AGGREGATOR_MODEL = "gpt-4o-mini";

export type AggregatorEnv = {
  apiKey: string;
  baseUrl: string;
};

/**
 * Resolve aggregator credentials from process.env.
 * Returns null when no key is configured (callers should mock / skip live LLM).
 */
export function resolveAggregatorEnv(): AggregatorEnv | null {
  const apiKey =
    process.env.AGGREGATOR_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.ANALYST_LLM_API_KEY?.trim() ||
    "";
  if (!apiKey) return null;

  const baseUrl =
    process.env.AGGREGATOR_BASE_URL?.trim() || DEFAULT_AGGREGATOR_BASE_URL;

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, "") };
}

/**
 * Map a UI / request model id to the slug the aggregator expects.
 * Priority: AGGREGATOR_MODEL_MAP_<id> → uiModelId (if non-empty) →
 * AGGREGATOR_DEFAULT_MODEL → gpt-4o-mini.
 */
export function resolveAggregatorModelId(uiModelId: string): string {
  const trimmed = uiModelId?.trim() ?? "";
  if (trimmed) {
    const mapped = process.env[`AGGREGATOR_MODEL_MAP_${trimmed}`]?.trim();
    if (mapped) return mapped;
    return trimmed;
  }
  return (
    process.env.AGGREGATOR_DEFAULT_MODEL?.trim() || DEFAULT_AGGREGATOR_MODEL
  );
}

/** Chat completions URL for OpenAI-compatible aggregators. */
export function aggregatorChatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}
