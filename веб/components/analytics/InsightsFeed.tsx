"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { InsightCard } from "@/components/analytics/InsightCard";
import {
  fetchAnalyticsInsights,
  fetchAnalyticsSnapshot,
} from "@/lib/analytics-api";
import { useAnalyticsStore } from "@/lib/analytics-store";

export function InsightsFeed() {
  const reduceMotion = useReducedMotion();
  const insights = useAnalyticsStore((s) => s.snapshot.insights);
  const cycleLabel = useAnalyticsStore((s) => s.snapshot.cycleLabel);
  const insightsSource = useAnalyticsStore((s) => s.insightsSource);
  const hydrateInsightsFromApi = useAnalyticsStore(
    (s) => s.hydrateInsightsFromApi,
  );
  const hydrateSnapshotFromApi = useAnalyticsStore(
    (s) => s.hydrateSnapshotFromApi,
  );

  useEffect(() => {
    const ac = new AbortController();

    void (async () => {
      // C-63 — parallel hydrate; failure / empty → keep seed mock in store
      const [insightsPayload, snapshotPayload] = await Promise.all([
        fetchAnalyticsInsights(ac.signal),
        fetchAnalyticsSnapshot(ac.signal),
      ]);
      if (ac.signal.aborted) return;

      if (insightsPayload) {
        hydrateInsightsFromApi(insightsPayload);
      }
      if (snapshotPayload) {
        hydrateSnapshotFromApi(snapshotPayload);
      }
    })();

    return () => ac.abort();
  }, [hydrateInsightsFromApi, hydrateSnapshotFromApi]);

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
  };

  return (
    <GlassCard className="flex min-h-72 flex-col gap-4 p-4 sm:min-h-80">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-gold)]">
              Agent heuristics
            </p>
            <span
              className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
              title="Insight feed provenance"
            >
              · {insightsSource}
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Лента самообучения
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Живые правки весов от Аналитика — по паттернам аудитории.
          </p>
        </div>
        <NeonBadge tone="gold" label={cycleLabel} className="shrink-0 self-start" />
      </header>

      <motion.ul
        className="flex flex-1 flex-col gap-3"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </motion.ul>
    </GlassCard>
  );
}
