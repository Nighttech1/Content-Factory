"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import { RETENTION_SERIES } from "@/components/analytics/analytics-accents";
import type {
  RetentionCohortSnapshot,
  RetentionPoint,
  RetentionSummary,
} from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type RetentionChartProps = {
  retention: RetentionPoint[];
  retentionSummary?: RetentionSummary;
};

type SeriesKey = (typeof RETENTION_SERIES)[keyof typeof RETENTION_SERIES]["key"];

const SERIES_LIST = [
  RETENTION_SERIES.ours,
  RETENTION_SERIES.benchmark,
  RETENTION_SERIES.ideal,
] as const;

function formatCohort(snap: RetentionCohortSnapshot): string {
  if (snap.total <= 0) return "n/a";
  return `${snap.pct}% (${snap.retained}/${snap.total})`;
}

function RetentionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    dataKey?: string | number;
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--border-glass)] bg-[var(--bg-elevated)] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <p className="mb-1.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {typeof label === "number" ? `${label} сек` : label}
      </p>
      <ul className="flex flex-col gap-1">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey)}
            className="flex items-center gap-2 text-xs text-[var(--text-primary)]"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span className="text-[var(--text-muted)]">{entry.name}</span>
            <span className="font-[family-name:var(--font-mono-jb)] font-semibold tabular-nums">
              {typeof entry.value === "number" ? `${entry.value}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function cohortFromSeries(
  retention: RetentionPoint[],
  second: number,
  total = 50,
): RetentionCohortSnapshot {
  const pct = retention.find((p) => p.second === second)?.ourAssetRetention ?? 0;
  if (total <= 0) return { retained: 0, total: 0, pct: 0 };
  return {
    pct: Math.round(pct),
    total,
    retained: Math.floor((pct / 100) * total),
  };
}

export function RetentionChart({
  retention,
  retentionSummary,
}: RetentionChartProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    ourAssetRetention: true,
    competitorOutlierBenchmark: true,
    idealRetentionCurve: true,
  });

  const chartData = useMemo(
    () =>
      retention.map((pt) => ({
        second: pt.second,
        ourAssetRetention: pt.ourAssetRetention,
        competitorOutlierBenchmark: pt.competitorOutlierBenchmark,
        idealRetentionCurve: pt.idealRetentionCurve,
      })),
    [retention],
  );

  const at3 =
    retentionSummary?.at3 ?? cohortFromSeries(retention, 3);
  const at15 =
    retentionSummary?.at15 ?? cohortFromSeries(retention, 15);

  const at3Series = retention.find((p) => p.second === 3);
  const oursAt3 = at3Series?.ourAssetRetention ?? at3.pct;
  const benchAt3 = at3Series?.competitorOutlierBenchmark ?? 0;

  return (
    <motion.div
      data-testid="analytics-retention"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      className="min-w-0"
    >
      <GlassCard className="flex min-h-72 flex-col border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4 sm:min-h-80">
        <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-terracotta)]">
              Удержание
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Кривая удержания · первые 15 секунд
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Наш live-контент vs бенчмарк outlier и идеальная кривая.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Легенда удержания"
          >
            {SERIES_LIST.map((s) => {
              const isVisible = visible[s.key];
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={isVisible}
                  onClick={() =>
                    setVisible((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wide transition-colors",
                    isVisible
                      ? "border-[var(--border-glass)] bg-[var(--bg-hover)] text-[var(--text-primary)]"
                      : "border-transparent bg-transparent text-[var(--text-mono)] opacity-55",
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: isVisible ? s.color : "var(--text-mono)",
                    }}
                    aria-hidden
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-hover)] p-2 sm:h-80">
          <div className="pointer-events-none absolute inset-x-3 top-2 z-10 flex flex-wrap justify-between gap-2">
            <div className="rounded border border-[color-mix(in_srgb,var(--accent-terracotta)_25%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-2 py-1 backdrop-blur-sm">
              <span className="block font-[family-name:var(--font-mono-jb)] text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-terracotta)]">
                Ворота 3с
              </span>
              <span
                data-testid="retention-at-3"
                className="font-[family-name:var(--font-mono-jb)] text-[10px] tabular-nums text-[var(--text-primary)]"
              >
                {formatCohort(at3)}
              </span>
            </div>
            <div
              data-testid="retention-at-15"
              className="rounded border border-[color-mix(in_srgb,var(--accent-blue-bright)_30%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-2 py-1 backdrop-blur-sm"
            >
              <span className="block font-[family-name:var(--font-mono-jb)] text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-blue-bright)]">
                На 15-й секунде
              </span>
              <span className="font-[family-name:var(--font-mono-jb)] text-[10px] tabular-nums text-[var(--text-primary)]">
                {formatCohort(at15)}
              </span>
            </div>
            <div className="rounded border border-[color-mix(in_srgb,var(--accent-gold-bright)_25%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] px-2 py-1 backdrop-blur-sm">
              <span className="block font-[family-name:var(--font-mono-jb)] text-[9px] font-semibold uppercase tracking-wider text-[var(--accent-gold-bright)]">
                Бенчмарк 3с
              </span>
              <span className="text-[10px] text-[var(--text-primary)]">
                {benchAt3}% outlier
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 48, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                {SERIES_LIST.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`fill-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                stroke="var(--text-primary)"
                strokeOpacity={0.06}
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="second"
                type="number"
                domain={[0, 15]}
                ticks={[0, 3, 6, 9, 12, 15]}
                tickFormatter={(v: number) => `${v}с`}
                tick={{
                  fill: "var(--text-muted)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono-jb)",
                }}
                axisLine={{ stroke: "var(--border-glass)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v: number) => `${v}%`}
                width={40}
                tick={{
                  fill: "var(--text-muted)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono-jb)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={RetentionTooltip as never}
                cursor={{
                  stroke: "var(--border-glass)",
                  strokeDasharray: "3 3",
                }}
              />
              {SERIES_LIST.map((s) =>
                visible[s.key] ? (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={s.key === "ourAssetRetention" ? 2.5 : 2}
                    fill={`url(#fill-${s.key})`}
                    isAnimationActive={!reduceMotion}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ) : null,
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-[var(--bg-hover)] px-3 py-2">
            <span className="block font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Наш контент @3с
            </span>
            <span className="text-sm font-semibold tabular-nums text-[var(--accent-blue-bright)]">
              {formatCohort(at3)}
            </span>
          </div>
          <div className="rounded-lg bg-[var(--bg-hover)] px-3 py-2">
            <span className="block font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              На 15-й секунде
            </span>
            <span className="text-sm font-semibold tabular-nums text-[var(--accent-blue-bright)]">
              {formatCohort(at15)}
            </span>
            <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
              Δ vs 3с {(at3.pct - at15.pct).toFixed(0)} п.п.
            </span>
          </div>
          <div className="rounded-lg bg-[var(--bg-hover)] px-3 py-2">
            <span className="block font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Outlier @3с
            </span>
            <span className="text-sm font-semibold text-[var(--accent-gold-bright)]">
              {oursAt3}% → {benchAt3}%
            </span>
            <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
              Δ {(benchAt3 - oursAt3).toFixed(1)} п.п.
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
