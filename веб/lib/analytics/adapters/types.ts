/** Platform metrics adapter contract (C-17). */

export type PlatformId = "instagram" | "youtube";

export type AdapterPostRef = {
  postId: string;
  externalId?: string;
  contentJobId?: string | null;
};

export type MetricsSnapshot = {
  postId: string;
  platform: PlatformId;
  views: number;
  saves: number;
  shares: number;
  /** Adapter-native curve; ingest maps to repository `{ t, value }`. */
  retentionCurve?: { tSec: number; retentionPct: number }[];
  capturedAt: Date;
  externalPostId?: string;
  contentJobId?: string | null;
};

export interface PlatformMetricsAdapter {
  platform: PlatformId;
  /** True when real API env keys are present. */
  isConfigured(): boolean;
  fetchMetrics(posts: AdapterPostRef[]): Promise<MetricsSnapshot[]>;
}
