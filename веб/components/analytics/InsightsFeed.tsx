"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { InsightCard } from "@/components/analytics/InsightCard";
import {
  fetchAnalyticsInsights,
  fetchAnalyticsSnapshot,
} from "@/lib/analytics-api";
import { useAnalyticsStore } from "@/lib/analytics-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const MODEL_LOSS_PCT = 94;

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

  const footerVariants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0 } : { ...SPRING, delay: 0.28 },
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

      <motion.div
        className="mt-auto flex items-center gap-3 rounded-lg border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_80%,transparent)] px-3 py-2.5"
        variants={footerVariants}
        initial="hidden"
        animate="show"
      >
        <Activity
          className="h-4 w-4 shrink-0 text-[var(--accent-gold)]"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Model Loss Convergence
          </p>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-hover)]"
            role="progressbar"
            aria-valuenow={MODEL_LOSS_PCT}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Model loss convergence"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-gold),var(--accent-terracotta))]"
              style={{ width: `${MODEL_LOSS_PCT}%` }}
            />
          </div>
        </div>
        <span className="font-[family-name:var(--font-mono-jb)] text-xs font-semibold tabular-nums text-[var(--accent-gold)]">
          {MODEL_LOSS_PCT}%
        </span>
      </motion.div>
    </GlassCard>
  );
}
