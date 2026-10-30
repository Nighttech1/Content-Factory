/**
 * C-114 — Apify Instagram scraper env config (Studio competitors).
 * Never log or return the raw token beyond length/prefix probes.
 */

export const IG_SCRAPER_DEFAULT_BASE_URL = "https://api.apify.com";

export type IgScraperConfig = {
  /** Apify API token — never log the value. */
  token: string;
  /**
   * API root (`https://api.apify.com`) **or** a full actor run URL ending in
   * `/run-sync-get-dataset-items`. Caller builds the POST URL in ig-apify-scraper.
   */
  baseUrl: string;
};

export function isIgScraperConfigured(): boolean {
  return Boolean(process.env.IG_SCRAPER_API_KEY?.trim());
}

/**
 * S50 — demo fixtures for competitors only when explicitly enabled.
 * When `IG_SCRAPER_API_KEY` is set, live Apify wins; fixtures are never
 * merged as success unless this flag is `1` (local/CI without burning Apify).
 */
export function allowFeedFixtures(): boolean {
  return process.env.USE_FEED_FIXTURES?.trim() === "1";
}

/**
 * Full config or null when key missing (caller soft-fails).
 */
export function readIgScraperConfig(): IgScraperConfig | null {
  const token = process.env.IG_SCRAPER_API_KEY?.trim();
  if (!token) return null;

  const baseUrl =
    process.env.IG_SCRAPER_BASE_URL?.trim().replace(/\/$/, "") ||
    IG_SCRAPER_DEFAULT_BASE_URL;

  return { token, baseUrl };
}
