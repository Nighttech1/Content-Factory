"use client";

import dynamic from "next/dynamic";
import { RlFeed } from "@/components/analytics/RlFeed";
import type {
  RetentionPoint,
  RetentionSummary,
  RlProposal,
} from "@/types/analytics";

const RetentionChart = dynamic(
  () =>
    import("@/components/analytics/RetentionChart").then(
      (m) => m.RetentionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        data-testid="retention-chart-loading"
        className="min-h-72 animate-pulse rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)]"
        aria-busy="true"
        aria-label="Загрузка графика удержания"
      />
    ),
  },
);

type AnalyticsMainGridProps = {
  retention: RetentionPoint[];
  retentionSummary: RetentionSummary;
  rlFeed: RlProposal[];
};

export function AnalyticsMainGrid({
  retention,
  retentionSummary,
  rlFeed,
}: AnalyticsMainGridProps) {
  return (
    <div className="flex flex-col gap-6">
      <RetentionChart
        retention={retention}
        retentionSummary={retentionSummary}
      />
      <RlFeed rlFeed={rlFeed} />
    </div>
  );
}
