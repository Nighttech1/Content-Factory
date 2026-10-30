/**
 * Analyst insights runner (C-18 AI Bridge).
 *
 * Backend should call `runAnalystInsights()` from GET /api/analytics/insights
 * (and optional refresh). Do not write DB from here — cache/persist is Backend.
 */

import { loadAnalystAggregates } from "./load-aggregates";
import {
  callAnalystLlm,
  loadAnalystPromptPack,
  renderAnalystUserPrompt,
  resolveLlmEnv,
} from "./llm";
import { buildMockInsightsFromAggregates } from "./mock-insights";
import { parseAnalystInsightsJson } from "./parse-insights";
import type { AnalystAggregatesPayload, AnalystRunResult } from "./types";
import { ANALYST_PROMPT_VERSION } from "./types";

export type RunAnalystInsightsOptions = {
  /** Force mock path even if LLM key is present (tests / local demos). */
  forceMock?: boolean;
  windowDays?: number;
  now?: Date;
  /** Inject aggregates (unit tests) instead of reading repository. */
  aggregates?: AnalystAggregatesPayload;
  signal?: AbortSignal;
  /** UI / Settings model id for aggregator (optional). */
  modelId?: string;
};

function cycleLabelFrom(now: Date): string {
  // Stable-ish label for UI; Backend may override from cache metadata.
  const day = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  const cycle = (day % 900) + 1;
  return `CYCLE #${cycle}`;
}

function ensureMinInsights(
  insights: AnalystRunResult["insights"],
  agg: AnalystAggregatesPayload,
): AnalystRunResult["insights"] {
  if (insights.length >= 3) return insights;
  const mock = buildMockInsightsFromAggregates(agg);
  const seen = new Set(insights.map((i) => i.id));
  const merged = [...insights];
  for (const card of mock) {
    if (merged.length >= 3) break;
    if (seen.has(card.id)) continue;
    merged.push(card);
    seen.add(card.id);
  }
  return merged;
}

async function tryLlmInsights(
  agg: AnalystAggregatesPayload,
  signal?: AbortSignal,
  modelId?: string,
): Promise<Pick<AnalystRunResult, "insights" | "promptHints"> | null> {
  const env = resolveLlmEnv({ modelId });
  if (!env) return null;

  try {
    const pack = await loadAnalystPromptPack();
    const user = renderAnalystUserPrompt(pack.userTemplate, agg);
    const { content } = await callAnalystLlm({
      system: pack.system,
      user,
      env,
      signal,
    });
    const parsed = parseAnalystInsightsJson(content);
    if (!parsed) {
      // eslint-disable-next-line no-console -- operational signal, no secrets
      console.info("[analyst] llm parse failed → mock fallback");
      return null;
    }
    return {
      insights: ensureMinInsights(parsed.insights, agg),
      promptHints: parsed.promptHints,
    };
  } catch {
    // eslint-disable-next-line no-console -- operational signal, no secrets
    console.info("[analyst] llm call failed → mock fallback");
    return null;
  }
}

/**
 * Run Analyst: aggregates → LLM (if key) or deterministic mock.
 * promptHints are advisory data only — never applied to workers/**.
 */
export async function runAnalystInsights(
  options: RunAnalystInsightsOptions = {},
): Promise<AnalystRunResult> {
  const now = options.now ?? new Date();
  const agg =
    options.aggregates ??
    (await loadAnalystAggregates({
      windowDays: options.windowDays,
      now,
    }));

  const generatedAt = now.toISOString();
  const cycleLabel = cycleLabelFrom(now);

  if (!options.forceMock) {
    const llm = await tryLlmInsights(agg, options.signal, options.modelId);
    if (llm) {
      return {
        cycleLabel,
        insights: llm.insights,
        promptHints: llm.promptHints,
        source: "llm",
        generatedAt,
        promptVersion: ANALYST_PROMPT_VERSION,
      };
    }
  }

  const insights = buildMockInsightsFromAggregates(agg);
  return {
    cycleLabel,
    insights,
    promptHints: [],
    source: "mock",
    generatedAt,
    promptVersion: ANALYST_PROMPT_VERSION,
  };
}

export {
  ANALYST_PROMPT_VERSION,
  loadAnalystAggregates,
  parseAnalystInsightsJson,
  buildMockInsightsFromAggregates,
  resolveLlmEnv,
};
export type {
  AnalystAggregatesPayload,
  AnalystInsight,
  AnalystRunResult,
  PromptHintProposal,
} from "./types";
