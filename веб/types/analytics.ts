/**
 * C-80 — Self-learning analytics dashboard types.
 * UI chrome strings are Russian; ids stay English.
 * C-127 — RlProposal (Trainer HITL); C-128 — retention at3/at15 cohort.
 */

export type ContentPillar =
  | "Linguistic Slang"
  | "Cultural History"
  | "Diaspora Bohemia"
  | "Humor & Memes";

export type ContentFormat = "Reels" | "Carousel" | "Shorts" | "Story";

export type TopKpiMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  isPositive: boolean;
  benchmark?: string;
  subtext: string;
  accentColor: "amber" | "cyan" | "emerald" | "rose";
};

export type ScoutPillarStat = {
  pillar: ContentPillar;
  /** RU display name for pillar */
  pillarRu: string;
  scoutedUnits: number;
  qualifiedUnits: number;
  outliersDetected: number;
  formatDistribution: {
    reels: number;
    carousels: number;
    shorts: number;
  };
  fatigueIndex: number;
};

export type CompetitorOutlier = {
  id: string;
  title: string;
  creatorHandle: string;
  platform: "instagram" | "tiktok" | "youtube";
  originalUrl: string;
  thumbnailUrl: string;
  multiplier: number;
  views: string;
  saveRate: string;
  hookType:
    | "Contrarian Statement"
    | "Pattern Interrupt"
    | "Open Loop Curiosity"
    | "Visual Shock";
  hookTypeRu: string;
  primaryTrigger:
    | "Save (High Utility)"
    | "Share (Identity)"
    | "Comment (Provocation)";
  primaryTriggerRu: string;
  status: "DECONSTRUCTED" | "BLUEPRINT_READY" | "SYNTHESIZED";
  statusRu: string;
  scoutedAt: string;
};

export type RetentionPoint = {
  second: number;
  ourAssetRetention: number;
  competitorOutlierBenchmark: number;
  idealRetentionCurve: number;
};

/** Cohort snapshot at a gate second (C-128). */
export type RetentionCohortSnapshot = {
  retained: number;
  total: number;
  pct: number;
};

export type RetentionSummary = {
  at3: RetentionCohortSnapshot;
  at15: RetentionCohortSnapshot;
};

export type RlProposalStatus = "pending" | "approved" | "rejected";

/** C-127 — Trainer RL proposal with HITL status. */
export type RlProposal = {
  id: string;
  cycle: number;
  timestamp: string;
  category: "HOOK" | "PACING" | "VOICEOVER" | "VISUAL_BROLL";
  categoryRu: string;
  badge: string;
  actionText: string;
  deltaImpact: string;
  lossConvergence: number;
  /** Always Trainer in UI (not Scout). */
  author: "trainer";
  status: RlProposalStatus;
};

/** Alias — prefer RlProposal (C-127). */
export type AgentHeuristicLog = RlProposal;

export type PublishedAssetTelemetry = {
  id: string;
  title: string;
  categoryTag: string;
  module: "HeyGen" | "Carousel" | "Cartoon";
  moduleRu: string;
  channels: string[];
  reach: string;
  engagementRate: string;
  saveRate: string;
  status: "LIVE" | "OPTIMIZING" | "MUTATING";
  statusRu: string;
};

export type AnalyticsDashboard = {
  kpis: TopKpiMetric[];
  scout: ScoutPillarStat[];
  outliers: CompetitorOutlier[];
  retention: RetentionPoint[];
  /** C-128 — cohort callouts for Retention chart */
  retentionSummary: RetentionSummary;
  rlFeed: RlProposal[];
  telemetry: PublishedAssetTelemetry[];
};
