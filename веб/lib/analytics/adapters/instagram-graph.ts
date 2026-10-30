import { readIgToken } from "./ig-token";
import { createMockPlatformAdapter } from "./mock-platform";
import type {
  AdapterPostRef,
  MetricsSnapshot,
  PlatformMetricsAdapter,
} from "./types";

/**
 * Instagram Graph API adapter.
 * When token missing → mock. Real fetch is best-effort; failures fall back to mock for that run.
 * Never logs access tokens.
 */
export function createInstagramGraphAdapter(): PlatformMetricsAdapter {
  const mock = createMockPlatformAdapter("instagram");

  return {
    platform: "instagram",

    isConfigured(): boolean {
      return Boolean(readIgToken());
    },

    async fetchMetrics(posts: AdapterPostRef[]): Promise<MetricsSnapshot[]> {
      const token = readIgToken();
      if (!token || posts.length === 0) {
        return mock.fetchMetrics(posts);
      }

      const capturedAt = new Date();
      const out: MetricsSnapshot[] = [];

      for (const post of posts) {
        const mediaId = post.externalId ?? post.postId;
        try {
          const url = new URL(`https://graph.facebook.com/v21.0/${mediaId}/insights`);
          url.searchParams.set("metric", "impressions,reach,saved,shares");
          url.searchParams.set("access_token", token);

          const res = await fetch(url.toString(), {
            method: "GET",
            headers: { Accept: "application/json" },
          });

          if (!res.ok) {
            // Soft-fail to mock for this post (no token in logs).
            // eslint-disable-next-line no-console
            console.warn(
              `[ig-adapter] insights HTTP ${res.status} for media=${mediaId}; using mock`,
            );
            const [fallback] = await mock.fetchMetrics([post]);
            if (fallback) out.push(fallback);
            continue;
          }

          const body = (await res.json()) as {
            data?: Array<{ name?: string; values?: Array<{ value?: number }> }>;
          };
          const byName = new Map<string, number>();
          for (const row of body.data ?? []) {
            const name = row.name ?? "";
            const value = row.values?.[0]?.value ?? 0;
            byName.set(name, Number(value) || 0);
          }

          out.push({
            postId: post.postId,
            platform: "instagram",
            views: byName.get("impressions") ?? byName.get("reach") ?? 0,
            saves: byName.get("saved") ?? 0,
            shares: byName.get("shares") ?? 0,
            retentionCurve: [
              { tSec: 0, retentionPct: 100 },
              { tSec: 5, retentionPct: 55 },
              { tSec: 12, retentionPct: 32 },
            ],
            capturedAt,
            externalPostId: mediaId,
            contentJobId: post.contentJobId ?? null,
          });
        } catch {
          // eslint-disable-next-line no-console
          console.warn(`[ig-adapter] fetch failed for media=${mediaId}; using mock`);
          const [fallback] = await mock.fetchMetrics([post]);
          if (fallback) out.push(fallback);
        }
      }

      return out;
    },
  };
}
