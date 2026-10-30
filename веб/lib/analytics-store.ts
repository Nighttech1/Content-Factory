"use client";

import { create } from "zustand";
import type {
  AnalyticsSnapshotApiResponse,
  InsightsApiResponse,
  InsightsApiSource,
} from "@/lib/analytics-api";
import {
  createAnalyticsSnapshot,
  type AnalyticsSnapshot,
  type RetentionSeriesId,
} from "@/lib/analytics-mock";

type SeriesVisibility = Record<RetentionSeriesId, boolean>;

type AnalyticsUiState = {
  snapshot: AnalyticsSnapshot;
  seriesVisible: SeriesVisibility;
  lastSyncedLabel: string;
  reweightFlash: boolean;
  channelFilter: "all" | string;
  sortMode: "engagement" | "reach" | "recent";
  /** Feed provenance after API hydrate; `mock` while on seed / API fallback. */
  insightsSource: InsightsApiSource;
};

type AnalyticsActions = {
  setSeriesVisible: (seriesId: RetentionSeriesId, visible: boolean) => void;
  touchSync: () => void;
  triggerReweight: () => void;
  setChannelFilter: (filter: "all" | string) => void;
  setSortMode: (mode: "engagement" | "reach" | "recent") => void;
  /** Replace insights + cycle from GET /api/analytics/insights */
  hydrateInsightsFromApi: (payload: InsightsApiResponse) => void;
  /** Optional KPI / retention from GET /api/analytics/snapshot (keeps published) */
  hydrateSnapshotFromApi: (payload: AnalyticsSnapshotApiResponse) => void;
};

export type AnalyticsStore = AnalyticsUiState & AnalyticsActions;

const DEFAULT_VISIBILITY: SeriesVisibility = {
  heygen: true,
  carousel: true,
  cartoon: true,
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  snapshot: createAnalyticsSnapshot(),
  seriesVisible: { ...DEFAULT_VISIBILITY },
  lastSyncedLabel: createAnalyticsSnapshot().lastSyncedAgo,
  reweightFlash: false,
  channelFilter: "all",
  sortMode: "engagement",
  insightsSource: "mock",

  setSeriesVisible: (seriesId, visible) =>
    set((state) => ({
      seriesVisible: { ...state.seriesVisible, [seriesId]: visible },
    })),

  touchSync: () => set({ lastSyncedLabel: "just now" }),

  triggerReweight: () => {
    set({ reweightFlash: true, lastSyncedLabel: "re-weight queued" });
    // Clear flash after a short beat (mock-only UX)
    window.setTimeout(() => {
      if (get().reweightFlash) set({ reweightFlash: false });
    }, 1800);
  },

  setChannelFilter: (filter) => set({ channelFilter: filter }),

  setSortMode: (mode) => set({ sortMode: mode }),

  hydrateInsightsFromApi: (payload) =>
    set((state) => ({
      insightsSource: payload.source,
      lastSyncedLabel: "just now",
      snapshot: {
        ...state.snapshot,
        cycleLabel: payload.cycleLabel,
        insights: payload.insights,
      },
    })),

  hydrateSnapshotFromApi: (payload) =>
    set((state) => ({
      lastSyncedLabel: payload.lastSyncedAgo || state.lastSyncedLabel,
      snapshot: {
        ...state.snapshot,
        // Insights stay from /insights or seed mock — snapshot only KPIs / retention
        cycleLabel: payload.cycleLabel || state.snapshot.cycleLabel,
        versionLabel: payload.versionLabel || state.snapshot.versionLabel,
        lastSyncedAgo:
          payload.lastSyncedAgo || state.snapshot.lastSyncedAgo,
        kpis: payload.kpis.length > 0 ? payload.kpis : state.snapshot.kpis,
        retention:
          payload.retention.length > 0
            ? payload.retention
            : state.snapshot.retention,
      },
    })),
}));
