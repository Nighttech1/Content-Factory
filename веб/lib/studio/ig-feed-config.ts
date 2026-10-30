/**
 * C-36 / C-39 — Instagram live feed env config (Studio carousel-engine only).
 * Never log token values.
 */

import { readIgToken } from "@/lib/analytics/adapters/ig-token";
import {
  IG_NICHE_DEFAULT_HASHTAGS,
  parseDefaultHashtags,
} from "@/lib/studio/topic-hashtags";

/** Soft max competitors processed per refresh (Business Discovery fallback quota). */
export const IG_FEED_MAX_COMPETITORS = 5;

export type IgFeedConfig = {
  /** Graph access token — never log. */
  token: string;
  /** Instagram Business/Creator user id (ours media + hashtag user_id + BD root). */
  igUserId: string;
  /** Display handle for ours (default mosarmclub). */
  oursUsername: string;
  /**
   * Optional Business Discovery handles — **fallback only** when hashtag path
   * returns zero posts (C-39). Not primary discovery.
   */
  competitorUsernames: string[];
  /** Empty-topic hashtag defaults (env `IG_DEFAULT_HASHTAGS` or niche hardcoded). */
  defaultHashtags: string[];
};

/**
 * Configured when token (any of 3 keys) + IG_USER_ID are present.
 */
export function isIgFeedConfigured(): boolean {
  return Boolean(readIgToken() && process.env.IG_USER_ID?.trim());
}

function parseCompetitorUsernames(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const list = raw
    .split(",")
    .map((s) => s.trim().replace(/^@/, ""))
    .filter(Boolean);
  if (list.length > IG_FEED_MAX_COMPETITORS) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ig-feed] IG_COMPETITOR_USERNAMES has ${list.length} entries; truncating to ${IG_FEED_MAX_COMPETITORS} (BD fallback only)`,
    );
    return list.slice(0, IG_FEED_MAX_COMPETITORS);
  }
  return list;
}

/**
 * Full config or null when not configured (caller must soft-fail to fixtures).
 */
export function readIgFeedConfig(): IgFeedConfig | null {
  const token = readIgToken();
  const igUserId = process.env.IG_USER_ID?.trim();
  if (!token || !igUserId) return null;

  const oursUsername =
    process.env.IG_OURS_USERNAME?.trim().replace(/^@/, "") || "mosarmclub";

  return {
    token,
    igUserId,
    oursUsername,
    competitorUsernames: parseCompetitorUsernames(
      process.env.IG_COMPETITOR_USERNAMES,
    ),
    defaultHashtags: parseDefaultHashtags(
      process.env.IG_DEFAULT_HASHTAGS,
      IG_NICHE_DEFAULT_HASHTAGS,
    ),
  };
}
