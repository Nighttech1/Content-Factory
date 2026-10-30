/**
 * Optional JSON cache for Analyst insights (C-18 Backend).
 * Path: data/local/analyst-insights.json — never secrets; gitignored via data/local/*.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { AnalystInsight, PromptHintProposal } from "@/lib/analyst";

const STORE_DIR = path.join(process.cwd(), "data", "local");
const CACHE_FILE = path.join(STORE_DIR, "analyst-insights.json");

/** Default TTL for serving cache without re-running Analyst (15 min). */
export const DEFAULT_INSIGHTS_TTL_MS = 15 * 60 * 1000;

export type CachedAnalystInsights = {
  cycleLabel: string;
  insights: AnalystInsight[];
  /** Original runner source before cache layer. */
  runSource: "llm" | "mock";
  generatedAt: string;
  promptVersion?: string;
  promptHints?: PromptHintProposal[];
};

export type InsightsApiSource = "llm" | "mock" | "cache";

export type InsightsApiResponse = {
  cycleLabel: string;
  insights: AnalystInsight[];
  source: InsightsApiSource;
  generatedAt: string;
};

function ttlMs(): number {
  const raw = process.env.ANALYST_INSIGHTS_TTL_MS?.trim();
  if (!raw) return DEFAULT_INSIGHTS_TTL_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_INSIGHTS_TTL_MS;
}

export function isCacheFresh(
  cached: CachedAnalystInsights,
  now = new Date(),
): boolean {
  const generated = Date.parse(cached.generatedAt);
  if (!Number.isFinite(generated)) return false;
  return now.getTime() - generated < ttlMs();
}

export async function readInsightsCache(): Promise<CachedAnalystInsights | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<CachedAnalystInsights>;
    if (
      typeof parsed.cycleLabel !== "string" ||
      !Array.isArray(parsed.insights) ||
      typeof parsed.generatedAt !== "string" ||
      (parsed.runSource !== "llm" && parsed.runSource !== "mock")
    ) {
      return null;
    }
    if (parsed.insights.length < 1) return null;
    return {
      cycleLabel: parsed.cycleLabel,
      insights: parsed.insights,
      runSource: parsed.runSource,
      generatedAt: parsed.generatedAt,
      promptVersion: parsed.promptVersion,
      promptHints: parsed.promptHints,
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn("[analytics/insights-cache] read failed", code ?? "unknown");
    return null;
  }
}

export async function writeInsightsCache(
  payload: CachedAnalystInsights,
): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = `${CACHE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tmp, CACHE_FILE);
}

export function toApiResponseFromCache(
  cached: CachedAnalystInsights,
): InsightsApiResponse {
  return {
    cycleLabel: cached.cycleLabel,
    insights: cached.insights,
    source: "cache",
    generatedAt: cached.generatedAt,
  };
}
