"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import type { PublishedAssetTelemetry } from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const STATUS_STYLE: Record<
  PublishedAssetTelemetry["status"],
  { border: string; text: string }
> = {
  LIVE: {
    border: "border-[color-mix(in_srgb,#34d399_35%,transparent)]",
    text: "text-[#34d399]",
  },
  OPTIMIZING: {
    border: "border-[color-mix(in_srgb,var(--accent-gold-bright)_35%,transparent)]",
    text: "text-[var(--accent-gold-bright)]",
  },
  MUTATING: {
    border: "border-[color-mix(in_srgb,var(--accent-terracotta)_35%,transparent)]",
    text: "text-[var(--accent-terracotta)]",
  },
};

type TelemetryMatrixProps = {
  telemetry: PublishedAssetTelemetry[];
};

export function TelemetryMatrix({ telemetry }: TelemetryMatrixProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section data-testid="analytics-telemetry" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-blue-bright)]">
          Телеметрия
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Опубликованные активы
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Свежесть снимков, охват и save rate по модулям фабрики.
        </p>
      </div>

      {/* Desktop table */}
      <GlassCard className="hidden overflow-hidden border-[var(--border-glass)] bg-[var(--bg-elevated)] p-0 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-glass)] bg-[var(--bg-hover)]">
                {[
                  "Актив",
                  "Модуль",
                  "Каналы",
                  "Охват",
                  "ER",
                  "Save",
                  "Статус",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 font-[family-name:var(--font-mono-jb)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {telemetry.map((row, i) => {
                const statusStyle = STATUS_STYLE[row.status];
                return (
                  <motion.tr
                    key={row.id}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { ...SPRING, delay: i * 0.04 }
                    }
                    className="border-b border-[var(--border-glass)] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-[var(--text-primary)]">
                          {row.title}
                        </span>
                        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                          #{row.categoryTag}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-muted)]">
                      {row.moduleRu}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.channels.map((ch) => (
                          <span
                            key={ch}
                            className="rounded border border-[var(--border-glass)] bg-[var(--bg-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono-jb)] tabular-nums text-[var(--text-primary)]">
                      {row.reach}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono-jb)] tabular-nums text-[var(--accent-blue-bright)]">
                      {row.engagementRate}
                    </td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono-jb)] tabular-nums text-[var(--accent-gold-bright)]">
                      {row.saveRate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] font-semibold",
                          statusStyle.border,
                          statusStyle.text,
                        )}
                      >
                        {row.statusRu}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {telemetry.map((row, i) => {
          const statusStyle = STATUS_STYLE[row.status];
          return (
            <motion.div
              key={row.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...SPRING, delay: i * 0.05 }
              }
            >
              <GlassCard className="flex flex-col gap-3 border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {row.title}
                    </h3>
                    <p className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                      {row.moduleRu} · #{row.categoryTag}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] font-semibold",
                      statusStyle.border,
                      statusStyle.text,
                    )}
                  >
                    {row.statusRu}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[var(--bg-hover)] px-2 py-2">
                    <span className="block text-sm font-bold text-[var(--text-primary)]">
                      {row.reach}
                    </span>
                    <span className="font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]">
                      охват
                    </span>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-hover)] px-2 py-2">
                    <span className="block text-sm font-bold text-[var(--accent-blue-bright)]">
                      {row.engagementRate}
                    </span>
                    <span className="font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]">
                      ER
                    </span>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-hover)] px-2 py-2">
                    <span className="block text-sm font-bold text-[var(--accent-gold-bright)]">
                      {row.saveRate}
                    </span>
                    <span className="font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]">
                      save
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {row.channels.map((ch) => (
                    <span
                      key={ch}
                      className="rounded border border-[var(--border-glass)] bg-[var(--bg-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-muted)]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
