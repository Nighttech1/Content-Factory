import { createInstagramGraphAdapter } from "./instagram-graph";
import { createMockPlatformAdapter } from "./mock-platform";
import { createYouTubeAnalyticsAdapter } from "./youtube-analytics";
import type { PlatformId, PlatformMetricsAdapter } from "./types";

export type {
  AdapterPostRef,
  MetricsSnapshot,
  PlatformId,
  PlatformMetricsAdapter,
} from "./types";
export { createMockPlatformAdapter } from "./mock-platform";
export { createInstagramGraphAdapter } from "./instagram-graph";
export { createYouTubeAnalyticsAdapter } from "./youtube-analytics";

/**
 * Real adapter if configured, else mock — per platform (C-17 decisions).
 */
export function resolvePlatformAdapters(): {
  adapters: PlatformMetricsAdapter[];
  modes: Record<PlatformId, "real" | "mock">;
} {
  const ig = createInstagramGraphAdapter();
  const yt = createYouTubeAnalyticsAdapter();

  const adapters: PlatformMetricsAdapter[] = [
    ig.isConfigured() ? ig : createMockPlatformAdapter("instagram"),
    yt.isConfigured() ? yt : createMockPlatformAdapter("youtube"),
  ];

  return {
    adapters,
    modes: {
      instagram: ig.isConfigured() ? "real" : "mock",
      youtube: yt.isConfigured() ? "real" : "mock",
    },
  };
}
