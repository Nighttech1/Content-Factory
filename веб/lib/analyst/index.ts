/**
 * Public barrel for Analyst (C-18 AI Bridge).
 * Backend: `import { runAnalystInsights } from "@/lib/analyst"`.
 */

export {
  ANALYST_PROMPT_VERSION,
  buildMockInsightsFromAggregates,
  loadAnalystAggregates,
  parseAnalystInsightsJson,
  resolveLlmEnv,
  runAnalystInsights,
} from "./run-insights";

export type { RunAnalystInsightsOptions } from "./run-insights";

export type {
  AnalystAggregatesPayload,
  AnalystInsight,
  AnalystInsightSource,
  AnalystRunResult,
  InsightTone,
  PromptHintProposal,
} from "./types";
