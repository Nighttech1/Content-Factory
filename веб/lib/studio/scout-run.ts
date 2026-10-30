/**
 * S52 — Scout owns Apify. Manual «Разведать» + auto-scout schedule only.
 */

import {
  fetchApifyCompetitorPosts,
  filterCompetitorsForModule,
  popularityScorePost,
} from "@/lib/studio/ig-apify-scraper";
import { isIgScraperConfigured } from "@/lib/studio/ig-scraper-config";
import type { FeedPost } from "@/lib/studio/feed-types";
import {
  readScoutSnapshot,
  writeScoutSnapshot,
  type ScoutSnapshot,
} from "@/lib/studio/scout-snapshot-store";

export type ScoutRunFilters = {
  topic?: string;
  minViews?: number;
  minLikes?: number;
  /** Min popularity score (likes+comments+views). */
  minVirality?: number;
  lookbackDays?: number;
};

export type ScoutRunResult =
  | {
      ok: true;
      snapshot: ScoutSnapshot;
      competitorsCount: number;
      filteredOut: number;
    }
  | {
      ok: false;
      error:
        | "scraper_not_configured"
        | "module_unsupported"
        | "apify_empty"
        | "apify_failed";
      competitorsCount: 0;
    };

const SCOUT_APIFY_MODULES = new Set(["carousel-engine", "custom-reels"]);

function applyMetricFilters(
  posts: FeedPost[],
  filters: ScoutRunFilters,
): FeedPost[] {
  const minViews = Math.max(0, Number(filters.minViews) || 0);
  const minLikes = Math.max(0, Number(filters.minLikes) || 0);
  const minVirality = Math.max(0, Number(filters.minVirality) || 0);
  // lookbackDays reserved for future actor date filter (FeedPost has no postedAt)

  return posts.filter((p) => {
    if (minViews > 0 && (Number(p.metrics.views) || 0) < minViews) return false;
    if (minLikes > 0 && (Number(p.metrics.likes) || 0) < minLikes) return false;
    if (minVirality > 0 && popularityScorePost(p) < minVirality) return false;
    return true;
  });
}

export function shouldRunAutoScout(
  lastRunAtIso: string | null | undefined,
  frequencyHours: number,
  nowMs = Date.now(),
): boolean {
  const hours = Math.max(1, Number(frequencyHours) || 12);
  if (!lastRunAtIso) return true;
  const last = Date.parse(lastRunAtIso);
  if (!Number.isFinite(last)) return true;
  return nowMs - last >= hours * 60 * 60 * 1000;
}

/**
 * Run Apify once for module, filter, persist Scout snapshot.
 * Soft-fail: never throws for missing key / empty / network.
 */
export async function runScoutApify(
  moduleId: string,
  filters: ScoutRunFilters = {},
): Promise<ScoutRunResult> {
  if (!SCOUT_APIFY_MODULES.has(moduleId)) {
    return { ok: false, error: "module_unsupported", competitorsCount: 0 };
  }
  if (!isIgScraperConfigured()) {
    return { ok: false, error: "scraper_not_configured", competitorsCount: 0 };
  }

  try {
    const all = await fetchApifyCompetitorPosts(filters.topic);
    const typed = filterCompetitorsForModule(moduleId, all);
    const filtered = applyMetricFilters(typed, filters);
    if (typed.length === 0) {
      writeScoutSnapshot(moduleId, [], filters.topic);
      return { ok: false, error: "apify_empty", competitorsCount: 0 };
    }
    const snap = writeScoutSnapshot(moduleId, filtered, filters.topic);
    return {
      ok: true,
      snapshot: snap,
      competitorsCount: filtered.length,
      filteredOut: Math.max(0, typed.length - filtered.length),
    };
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`[scout-run] Apify failed module=${moduleId}; soft-fail`);
    return { ok: false, error: "apify_failed", competitorsCount: 0 };
  }
}

/** Last known snapshot for feed (no Apify). */
export function getScoutCompetitorsForFeed(moduleId: string): FeedPost[] {
  return readScoutSnapshot(moduleId)?.competitors ?? [];
}
