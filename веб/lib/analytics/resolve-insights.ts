/**
 * Backend service: resolve Analyst insights with optional file cache (C-18).
 * Calls AI Bridge `runAnalystInsights` — does not own prompts.
 */

import { runAnalystInsights, type RunAnalystInsightsOptions } from "@/lib/analyst";

import {
  isCacheFresh,
  readInsightsCache,
  toApiResponseFromCache,
  writeInsightsCache,
  type InsightsApiResponse,
} from "./insights-cache";

export type ResolveInsightsOptions = {
  /** Bypass cache and re-run Analyst. */
  refresh?: boolean;
  forceMock?: boolean;
  windowDays?: number;
  signal?: AbortSignal;
};

/**
 * Serve fresh cache when available; otherwise run Analyst and persist.
 */
export async function resolveAnalystInsights(
  options: ResolveInsightsOptions = {},
): Promise<InsightsApiResponse> {
  if (!options.refresh) {
    const cached = await readInsightsCache();
    if (cached && isCacheFresh(cached) && cached.insights.length >= 3) {
      return toApiResponseFromCache(cached);
    }
  }

  const runOpts: RunAnalystInsightsOptions = {
    forceMock: options.forceMock,
    windowDays: options.windowDays,
    signal: options.signal,
  };
  const result = await runAnalystInsights(runOpts);

  try {
    await writeInsightsCache({
      cycleLabel: result.cycleLabel,
      insights: result.insights,
      runSource: result.source,
      generatedAt: result.generatedAt,
      promptVersion: result.promptVersion,
      promptHints: result.promptHints,
    });
  } catch (err) {
    // Cache is best-effort — still return live result.
    // eslint-disable-next-line no-console -- operational; no secrets
    console.warn(
      "[analytics/insights] cache write failed",
      err instanceof Error ? err.message : "unknown",
    );
  }

  return {
    cycleLabel: result.cycleLabel,
    insights: result.insights,
    source: result.source,
    generatedAt: result.generatedAt,
  };
}

/**
 * Auth for refresh: secret header in prod; open in development when unset.
 * Accepts ANALYST_REFRESH_SECRET or INGEST_SECRET (same ops pattern as C-17).
 */
export function isInsightsRefreshAuthorized(req: Request): boolean {
  const secret =
    process.env.ANALYST_REFRESH_SECRET?.trim() ||
    process.env.INGEST_SECRET?.trim();
  if (secret) {
    const header =
      req.headers.get("x-analyst-refresh-secret") ??
      req.headers.get("x-ingest-secret") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    return header === secret;
  }
  return process.env.NODE_ENV !== "production";
}
