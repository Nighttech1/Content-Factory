export type KpiId = "views" | "save_rate" | "followers" | "ai_efficiency";

export type KpiCard = {
  id: KpiId;
  label: string;
  value: string;
  deltaLabel?: string;
  deltaTone?: "up" | "down" | "neutral";
  badge?: string;
  footnote?: string;
  sparkline?: number[];
  accent?: "terracotta" | "gold" | "blue" | "primary";
  /** Optional progress bar 0–100 (save-rate card) */
  progressPct?: number;
  /** Secondary value line (e.g. latency, benchmark) */
  secondaryLabel?: string;
};

export type RetentionSeriesId = "heygen" | "carousel" | "cartoon";

export type RetentionPoint = {
  tSec: number;
  retentionPct: number;
};

export type RetentionSeries = {
  id: RetentionSeriesId;
  label: string;
  colorToken: "terracotta" | "gold" | "blue";
  points: RetentionPoint[];
};

export type InsightTone = "green" | "blue" | "gold" | "terracotta";

export type AnalystInsight = {
  id: string;
  tone: InsightTone;
  badge: string;
  targetLabel: string;
  body: string;
  footer: string;
};

export type PublishedPostRow = {
  id: string;
  title: string;
  subtitle: string;
  module: "heygen" | "carousel" | "infographic" | "cartoon";
  channels: string[];
  reachLabel: string;
  engRateLabel: string;
  status: "live" | "optimizing" | "archived";
  /** CSS gradient for thumb — no external image deps */
  thumbGradient: string;
};

export type AnalyticsSnapshot = {
  cycleLabel: string;
  versionLabel: string;
  lastSyncedAgo: string;
  kpis: KpiCard[];
  retention: RetentionSeries[];
  insights: AnalystInsight[];
  published: PublishedPostRow[];
};

/** Full wave seed — C-14 / C-15 consume only */
export const ANALYTICS_SNAPSHOT: AnalyticsSnapshot = {
  cycleLabel: "CYCLE #42",
  versionLabel: "v2.4-weights.active",
  lastSyncedAgo: "32s ago",
  kpis: [
    {
      id: "views",
      label: "Total Aggregated Views",
      value: "1.2M",
      deltaLabel: "+34.8%",
      deltaTone: "up",
      badge: "L30D",
      footnote: "vs previous synthetic run",
      sparkline: [0.35, 0.42, 0.3, 0.55, 0.48, 0.72, 0.9],
      accent: "gold",
    },
    {
      id: "save_rate",
      label: "Saves / Bookmark Rate",
      value: "8.4%",
      badge: "HVC 4x",
      footnote: "High-Value Multiplier Applied",
      secondaryLabel: "Benchmark: 2.1%",
      progressPct: 84,
      accent: "gold",
    },
    {
      id: "followers",
      label: "Conversion Yield",
      value: "+1,420",
      deltaLabel: "+18.2% MoM",
      deltaTone: "up",
      badge: "$0.00 Organic",
      footnote: "CAC: Nil (Agent Directed)",
      secondaryLabel: "Vernatun Residents",
      accent: "blue",
    },
    {
      id: "ai_efficiency",
      label: "Agent Engine Health",
      value: "99.2%",
      badge: "Stable Mesh",
      footnote: "Zero fatal schema drops",
      secondaryLabel: "48.2s Latency",
      accent: "terracotta",
    },
  ],
  retention: [
    {
      id: "heygen",
      label: "HeyGen Reel",
      colorToken: "terracotta",
      points: [
        { tSec: 0, retentionPct: 100 },
        { tSec: 3, retentionPct: 74 },
        { tSec: 12, retentionPct: 62 },
        { tSec: 30, retentionPct: 58 },
        { tSec: 45, retentionPct: 48 },
        { tSec: 60, retentionPct: 42 },
      ],
    },
    {
      id: "carousel",
      label: "Editorial Carousel",
      colorToken: "gold",
      points: [
        { tSec: 0, retentionPct: 100 },
        { tSec: 3, retentionPct: 94 },
        { tSec: 12, retentionPct: 90 },
        { tSec: 30, retentionPct: 86 },
        { tSec: 45, retentionPct: 83 },
        { tSec: 60, retentionPct: 82 },
      ],
    },
    {
      id: "cartoon",
      label: "Motion Toon",
      colorToken: "blue",
      points: [
        { tSec: 0, retentionPct: 100 },
        { tSec: 3, retentionPct: 92 },
        { tSec: 12, retentionPct: 88 },
        { tSec: 30, retentionPct: 52 },
        { tSec: 45, retentionPct: 38 },
        { tSec: 60, retentionPct: 28 },
      ],
    },
  ],
  insights: [
    {
      id: "ins-slang",
      tone: "gold",
      badge: "+42% RETENTION",
      targetLabel: "Applied to Hook Writer",
      body: "Hooks opening with Yerevan street slang or rhetorical cafe questions had 42% higher retention in the first 3 seconds than academic introductions.",
      footer: "Weight update injected into Node 02",
    },
    {
      id: "ins-library",
      tone: "blue",
      badge: "2.3X DM CONVERSION",
      targetLabel: "Module 4 Synthesis",
      body: "Module 4 (HeyGen Avatars in historical library interiors) drove 2.3x more direct messages and salon inquiries than flat infographics.",
      footer: "Visual environment biased to +35% Library",
    },
    {
      id: "ins-cadence",
      tone: "terracotta",
      badge: "OPTIMAL POST TIME",
      targetLabel: "Cadence Scheduler",
      body: "Cross-channel engagement for Yerevan & Diaspora peaks at 20:15 MSK on Tuesdays and Saturdays.",
      footer: "Publish queue shifted: Next at 20:15 MSK",
    },
  ],
  published: [
    {
      id: "SYNTH-8902",
      title: "Cafe Chess & Philosophy",
      subtitle: "Yerevan Bohemia series",
      module: "heygen",
      channels: ["Instagram", "TikTok", "YouTube"],
      reachLabel: "482.1k",
      engRateLabel: "9.8%",
      status: "live",
      thumbGradient:
        "linear-gradient(145deg, #3a2218 0%, #c86446 45%, #d4a359 100%)",
    },
    {
      id: "SYNTH-8905",
      title: "Slang: Tsavt Tanem Deep Dive",
      subtitle: "Diaspora Linguistic Nodes",
      module: "carousel",
      channels: ["Instagram", "LinkedIn"],
      reachLabel: "210.4k",
      engRateLabel: "12.4%",
      status: "live",
      thumbGradient:
        "linear-gradient(145deg, #1a1510 0%, #d4a359 50%, #8b5a2b 100%)",
    },
    {
      id: "SYNTH-8911",
      title: "Motion Toon: Ararat Dawn",
      subtitle: "Cartoon diaspora pack",
      module: "cartoon",
      channels: ["TikTok", "YouTube Shorts"],
      reachLabel: "156.8k",
      engRateLabel: "7.1%",
      status: "optimizing",
      thumbGradient:
        "linear-gradient(145deg, #0c1a2e 0%, #2563eb 55%, #3b82f6 100%)",
    },
  ],
};

export function createAnalyticsSnapshot(): AnalyticsSnapshot {
  return structuredClone(ANALYTICS_SNAPSHOT);
}
