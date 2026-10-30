"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import { ANALYTICS_ACCENT } from "@/components/analytics/analytics-accents";
import type { TopKpiMetric } from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type KpiCardProps = {
  kpi: TopKpiMetric;
};

export function KpiCard({ kpi }: KpiCardProps) {
  const reduceMotion = useReducedMotion();
  const accent = ANALYTICS_ACCENT[kpi.accentColor];

  const cardVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 12, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
  };

  return (
    <motion.div variants={cardVariants}>
      <GlassCard className="relative flex min-h-[148px] flex-col justify-between overflow-hidden border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
          style={{ background: accent.glow }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-2">
          <span className="font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--text-primary)]">
            {kpi.label}
          </span>
          {kpi.benchmark ? (
            <span
              className="shrink-0 rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px]"
              style={{
                color: accent.text,
                borderColor: accent.border,
                background: accent.fill,
              }}
            >
              {kpi.benchmark}
            </span>
          ) : null}
        </div>

        <div className="relative my-3 flex items-baseline justify-between gap-2">
          <span
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: accent.text }}
          >
            {kpi.value}
          </span>
          <span
            className={cn(
              "font-[family-name:var(--font-mono-jb)] text-xs font-medium",
              kpi.isPositive
                ? "text-[var(--accent-gold)]"
                : "text-[var(--accent-terracotta)]",
            )}
          >
            {kpi.delta}
          </span>
        </div>

        <p className="relative font-[family-name:var(--font-ui)] text-xs text-[var(--text-primary)]">
          {kpi.subtext}
        </p>
      </GlassCard>
    </motion.div>
  );
}
