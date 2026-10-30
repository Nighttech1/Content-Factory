import type {
  AdapterPostRef,
  MetricsSnapshot,
  PlatformId,
  PlatformMetricsAdapter,
} from "./types";

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicMetrics(
  platform: PlatformId,
  postId: string,
  capturedAt: Date,
): Pick<MetricsSnapshot, "views" | "saves" | "shares" | "retentionCurve"> {
  const day = capturedAt.toISOString().slice(0, 10);
  const seed = hashSeed(`${platform}:${postId}:${day}`);
  const base = 800 + (seed % 9200);

  if (platform === "instagram") {
    return {
      views: base,
      saves: Math.floor(base * 0.04) + (seed % 40),
      shares: Math.floor(base * 0.015) + (seed % 25),
      retentionCurve: [
        { tSec: 0, retentionPct: 100 },
        { tSec: 3, retentionPct: 62 + (seed % 12) },
        { tSec: 8, retentionPct: 38 + (seed % 10) },
        { tSec: 15, retentionPct: 22 + (seed % 8) },
      ],
    };
  }

  // YouTube: saves often N/A → 0; shares ≈ likes/comments proxy
  return {
    views: base * 2 + (seed % 500),
    saves: 0,
    shares: Math.floor(base * 0.03) + (seed % 60),
    retentionCurve: [
      { tSec: 0, retentionPct: 100 },
      { tSec: 15, retentionPct: 71 + (seed % 8) },
      { tSec: 45, retentionPct: 44 + (seed % 10) },
      { tSec: 90, retentionPct: 28 + (seed % 7) },
    ],
  };
}

/**
 * Deterministic mock adapter — used when real platform keys are absent.
 * Always returns at least one snapshot per requested post.
 */
export function createMockPlatformAdapter(
  platform: PlatformId,
): PlatformMetricsAdapter {
  return {
    platform,
    isConfigured(): boolean {
      return false;
    },
    async fetchMetrics(posts: AdapterPostRef[]): Promise<MetricsSnapshot[]> {
      const capturedAt = new Date();
      return posts.map((p) => {
        const metrics = deterministicMetrics(platform, p.postId, capturedAt);
        return {
          postId: p.postId,
          platform,
          ...metrics,
          capturedAt,
          externalPostId: p.externalId ?? p.postId,
          contentJobId: p.contentJobId ?? null,
        };
      });
    },
  };
}
