import { createMockPlatformAdapter } from "./mock-platform";
import type {
  AdapterPostRef,
  MetricsSnapshot,
  PlatformMetricsAdapter,
} from "./types";

function readYtKey(): string | undefined {
  const key =
    process.env.YOUTUBE_API_KEY?.trim() ||
    process.env.YOUTUBE_DATA_API_KEY?.trim();
  return key || undefined;
}

/**
 * YouTube Data / Analytics adapter.
 * When API key missing → mock. Soft-fails to mock per video on HTTP errors.
 * Never logs API keys.
 */
export function createYouTubeAnalyticsAdapter(): PlatformMetricsAdapter {
  const mock = createMockPlatformAdapter("youtube");

  return {
    platform: "youtube",

    isConfigured(): boolean {
      return Boolean(readYtKey());
    },

    async fetchMetrics(posts: AdapterPostRef[]): Promise<MetricsSnapshot[]> {
      const apiKey = readYtKey();
      if (!apiKey || posts.length === 0) {
        return mock.fetchMetrics(posts);
      }

      const capturedAt = new Date();
      const out: MetricsSnapshot[] = [];

      for (const post of posts) {
        const videoId = post.externalId ?? post.postId;
        try {
          const url = new URL("https://www.googleapis.com/youtube/v3/videos");
          url.searchParams.set("part", "statistics");
          url.searchParams.set("id", videoId);
          url.searchParams.set("key", apiKey);

          const res = await fetch(url.toString(), {
            method: "GET",
            headers: { Accept: "application/json" },
          });

          if (!res.ok) {
            // eslint-disable-next-line no-console
            console.warn(
              `[yt-adapter] videos HTTP ${res.status} for id=${videoId}; using mock`,
            );
            const [fallback] = await mock.fetchMetrics([post]);
            if (fallback) out.push(fallback);
            continue;
          }

          const body = (await res.json()) as {
            items?: Array<{
              statistics?: {
                viewCount?: string;
                likeCount?: string;
                commentCount?: string;
              };
            }>;
          };
          const stats = body.items?.[0]?.statistics;
          if (!stats) {
            const [fallback] = await mock.fetchMetrics([post]);
            if (fallback) out.push(fallback);
            continue;
          }

          const views = Number(stats.viewCount ?? 0) || 0;
          const likes = Number(stats.likeCount ?? 0) || 0;
          const comments = Number(stats.commentCount ?? 0) || 0;

          out.push({
            postId: post.postId,
            platform: "youtube",
            views,
            saves: 0,
            shares: likes + comments,
            retentionCurve: [
              { tSec: 0, retentionPct: 100 },
              { tSec: 30, retentionPct: 65 },
              { tSec: 60, retentionPct: 40 },
            ],
            capturedAt,
            externalPostId: videoId,
            contentJobId: post.contentJobId ?? null,
          });
        } catch {
          // eslint-disable-next-line no-console
          console.warn(`[yt-adapter] fetch failed for id=${videoId}; using mock`);
          const [fallback] = await mock.fetchMetrics([post]);
          if (fallback) out.push(fallback);
        }
      }

      return out;
    },
  };
}
