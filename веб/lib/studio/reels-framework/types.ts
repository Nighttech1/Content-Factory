/** Reels Framework — shared types (ТЗ v2.0). */

export const REEL_STATUSES = [
  "NEW_TOPIC",
  "SCRIPT_GENERATING",
  "SCRIPT_READY",
  "AWAITING_FOOTAGE",
  "FOOTAGE_UPLOADED",
  "ANALYZING",
  "PLAN_READY",
  "INSERTS_SEARCH",
  "RENDERING",
  "QA",
  "DONE",
  "NEEDS_INTERVENTION",
  "ERROR",
] as const;

export type ReelStatus = (typeof REEL_STATUSES)[number];

export type SourceAssetMeta = {
  assetId: string;
  fileName: string;
  relativePath: string;
  mime: string;
  sizeBytes: number;
  durationSec?: number;
  width?: number;
  height?: number;
  sha256?: string;
  uploadedAt: string;
};

export type ReelScriptVersion = {
  version: number;
  createdAt: string;
  script: Record<string, unknown>;
  storyboard?: Record<string, unknown>;
};

export type ReelRevision = {
  revisionId: string;
  createdAt: string;
  feedback: string;
  targetSceneIds: string[];
  changeSummary: string;
  planVersionBefore: number;
  planVersionAfter: number;
};

export type QualityReport = {
  passed: boolean;
  checkedAt: string;
  checks: Array<{ id: string; ok: boolean; detail?: string }>;
};

export type RenderJobRecord = {
  jobId: string;
  reelId: string;
  type: "render" | "analyze" | "inserts";
  status: "queued" | "running" | "done" | "failed";
  attempts: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  resultPath?: string;
};

export type ReelRecord = {
  id: string;
  moduleId: "custom-reels";
  topic: string;
  sheetRowKey?: string;
  status: ReelStatus;
  styleProfileId: string;
  script?: ReelScriptVersion;
  sources: SourceAssetMeta[];
  planVersion: number;
  montagePath?: string;
  finalPath?: string;
  lastError?: string;
  quality?: QualityReport;
  revisions: ReelRevision[];
  settingsOverride?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ReelsSoT = {
  version: 1;
  reels: ReelRecord[];
  globalSettings: MontageSettings;
  rules: MontageRule[];
};

export type MontageSettings = {
  insertsEnabled: boolean;
  insertSource: "library" | "site" | "web" | "combined";
  insertMode: "auto" | "suggest" | "manual";
  insertMaxCount: number;
  insertMaxDurationSec: number;
  insertAudioDefault: boolean;
  humorIntensity: number;
  allowedDomains: string[];
  researchMode: boolean;
  productionMode: "draft" | "approval" | "full_auto";
  subtitleLang: "ru" | "hy" | "en";
  finalRetentionDays: number;
};

export type MontageRule = {
  id: string;
  title: string;
  description: string;
  category: string;
  scope: "all" | "style_profile" | "template" | "scene_type" | "language" | "project";
  scopeRef?: string;
  priority: number;
  condition: string;
  exampleOk?: string;
  createdAt: string;
  source: string;
  status: "active" | "disabled" | "proposed";
  version: number;
};

export type InsertCandidate = {
  candidateId: string;
  query: string;
  source: string;
  url?: string;
  localPath?: string;
  licenseNote?: string;
  score: number;
  needsReview: boolean;
};

export const DEFAULT_MONTAGE_SETTINGS: MontageSettings = {
  insertsEnabled: true,
  insertSource: "combined",
  insertMode: "suggest",
  insertMaxCount: 3,
  insertMaxDurationSec: 2,
  insertAudioDefault: false,
  humorIntensity: 0.5,
  allowedDomains: [],
  researchMode: false,
  productionMode: "draft",
  subtitleLang: "ru",
  finalRetentionDays: 14,
};
