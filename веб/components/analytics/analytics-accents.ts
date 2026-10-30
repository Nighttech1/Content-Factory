import type { TopKpiMetric } from "@/types/analytics";

export type AnalyticsAccent = TopKpiMetric["accentColor"];

export const ANALYTICS_ACCENT: Record<
  AnalyticsAccent,
  { text: string; glow: string; border: string; fill: string }
> = {
  amber: {
    text: "var(--accent-gold-bright)",
    glow: "color-mix(in srgb, var(--accent-gold-bright) 20%, transparent)",
    border: "color-mix(in srgb, var(--accent-gold-bright) 35%, transparent)",
    fill: "color-mix(in srgb, var(--accent-gold-bright) 22%, transparent)",
  },
  cyan: {
    text: "var(--accent-blue-bright)",
    glow: "color-mix(in srgb, var(--accent-blue-bright) 20%, transparent)",
    border: "color-mix(in srgb, var(--accent-blue-bright) 35%, transparent)",
    fill: "color-mix(in srgb, var(--accent-blue-bright) 22%, transparent)",
  },
  emerald: {
    text: "#34d399",
    glow: "color-mix(in srgb, #34d399 20%, transparent)",
    border: "color-mix(in srgb, #34d399 35%, transparent)",
    fill: "color-mix(in srgb, #34d399 22%, transparent)",
  },
  rose: {
    text: "var(--accent-terracotta)",
    glow: "color-mix(in srgb, var(--accent-terracotta) 20%, transparent)",
    border: "color-mix(in srgb, var(--accent-terracotta) 35%, transparent)",
    fill: "color-mix(in srgb, var(--accent-terracotta) 22%, transparent)",
  },
};

export const RETENTION_SERIES = {
  ours: {
    key: "ourAssetRetention" as const,
    label: "Наш контент",
    color: ANALYTICS_ACCENT.cyan.text,
    fill: ANALYTICS_ACCENT.cyan.fill,
  },
  benchmark: {
    key: "competitorOutlierBenchmark" as const,
    label: "Бенчмарк outlier",
    color: ANALYTICS_ACCENT.amber.text,
    fill: ANALYTICS_ACCENT.amber.fill,
  },
  ideal: {
    key: "idealRetentionCurve" as const,
    label: "Идеальная кривая",
    color: ANALYTICS_ACCENT.emerald.text,
    fill: ANALYTICS_ACCENT.emerald.fill,
  },
};
