/**
 * Analyst (C-18) shared contracts — AI Bridge.
 * Aligns with `AnalystInsight` in lib/analytics-mock.ts for FE/Backend.
 */

export const ANALYST_PROMPT_VERSION = "analyst@v2" as const;

export type InsightTone = "green" | "blue" | "gold" | "terracotta";

export type AnalystInsight = {
  id: string;
  tone: InsightTone;
  badge: string;
  targetLabel: string;
  body: string;
  footer: string;
};

/** Advisory only — never auto-applied to workers/** prompts. */
export type PromptHintProposal = {
  target: string;
  fromVersion: string;
  toVersion: string;
  rationale: string;
};

export type AnalystInsightSource = "llm" | "mock";

export type AnalystRunResult = {
  cycleLabel: string;
  insights: AnalystInsight[];
  promptHints: PromptHintProposal[];
  source: AnalystInsightSource;
  generatedAt: string;
  promptVersion: typeof ANALYST_PROMPT_VERSION;
};

export type AnalystAggregatePost = {
  postId: string;
  platform: string;
  views: number;
  saves: number;
  shares: number;
  contentJobId: string | null;
  moduleId: string | null;
  topic: string | null;
  saveRate: number;
  capturedAt: string;
};

export type AnalystAggregatesPayload = {
  generatedAt: string;
  windowDays: number;
  kpi: {
    views: number;
    saves: number;
    shares: number;
    snapshotCount: number;
  };
  byPlatform: Array<{
    platform: string;
    views: number;
    saves: number;
    shares: number;
    count: number;
  }>;
  byModule: Array<{
    moduleId: string;
    views: number;
    saves: number;
    shares: number;
    count: number;
  }>;
  topBySaves: AnalystAggregatePost[];
  topByViews: AnalystAggregatePost[];
  lowestSaveRate: AnalystAggregatePost[];
};
