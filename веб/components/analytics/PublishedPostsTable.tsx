"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge, type NeonBadgeTone } from "@/components/ui/NeonBadge";
import { cn } from "@/lib/cn";
import type { PublishedPostRow } from "@/lib/analytics-mock";
import { useAnalyticsStore } from "@/lib/analytics-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const MODULE_BADGE: Record<
  PublishedPostRow["module"],
  { label: string; tone: NeonBadgeTone }
> = {
  heygen: { label: "HeyGen", tone: "terracotta" },
  carousel: { label: "Carousel", tone: "gold" },
  infographic: { label: "Infographic", tone: "blue" },
  cartoon: { label: "Cartoon", tone: "blue" },
};

const STATUS_STYLE: Record<PublishedPostRow["status"], string> = {
  live: "text-[var(--accent-gold)]",
  optimizing: "text-[var(--accent-blue-bright)]",
  archived: "text-[var(--text-muted)]",
};

function filterRows(
  rows: PublishedPostRow[],
  channelFilter: string,
  sortMode: "engagement" | "reach" | "recent",
): PublishedPostRow[] {
  let next = rows;
  if (channelFilter !== "all") {
    next = next.filter((r) =>
      r.channels.some(
        (c) => c.toLowerCase() === channelFilter.toLowerCase(),
      ),
    );
  }
  if (sortMode === "engagement") {
    next = [...next].sort(
      (a, b) =>
        parseFloat(b.engRateLabel) - parseFloat(a.engRateLabel),
    );
  } else if (sortMode === "reach") {
    next = [...next].sort((a, b) => {
      const parse = (s: string) =>
        parseFloat(s.replace(/k/i, "")) * (s.toLowerCase().includes("k") ? 1000 : 1);
      return parse(b.reachLabel) - parse(a.reachLabel);
    });
  }
  return next;
}

export function PublishedPostsTable() {
  const reduceMotion = useReducedMotion();
  const published = useAnalyticsStore((s) => s.snapshot.published);
  const channelFilter = useAnalyticsStore((s) => s.channelFilter);
  const sortMode = useAnalyticsStore((s) => s.sortMode);
  const setChannelFilter = useAnalyticsStore((s) => s.setChannelFilter);
  const setSortMode = useAnalyticsStore((s) => s.setSortMode);

  const rows = filterRows(published, channelFilter, sortMode);

  const bodyVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.05,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  const rowVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
  };

  const cycleSort = () => {
    const order: Array<"engagement" | "reach" | "recent"> = [
      "engagement",
      "reach",
      "recent",
    ];
    const i = order.indexOf(sortMode);
    setSortMode(order[(i + 1) % order.length]!);
  };

  const cycleFilter = () => {
    const options = ["all", "Instagram", "TikTok", "YouTube"] as const;
    const i = options.indexOf(
      channelFilter as (typeof options)[number],
    );
    setChannelFilter(options[(i + 1) % options.length]!);
  };

  return (
    <GlassCard className="flex min-h-40 flex-col gap-3 overflow-hidden p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-blue-bright)]">
            Telemetry matrix
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Autonomous Posts & Telemetry
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cycleFilter}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-[var(--border-glass)]",
              "bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] text-[var(--text-muted)]",
              "transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]",
            )}
            aria-label={`Filter channel: ${channelFilter}`}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filter
            <span className="font-[family-name:var(--font-mono-jb)] text-[var(--accent-blue-bright)]">
              {channelFilter === "all" ? "All" : channelFilter}
            </span>
          </button>
          <button
            type="button"
            onClick={cycleSort}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-[var(--border-glass)]",
              "bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[11px] text-[var(--text-muted)]",
              "transition-colors hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)]",
            )}
            aria-label={`Sort by ${sortMode}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
            Sort
            <span className="font-[family-name:var(--font-mono-jb)] text-[var(--accent-gold)]">
              {sortMode}
            </span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-glass)]">
              {[
                "Asset",
                "Module",
                "Channels",
                "Reach",
                "Eng %",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2 font-[family-name:var(--font-mono-jb)] text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={bodyVariants}
            initial="hidden"
            animate="show"
          >
            {rows.map((row) => {
              const mod = MODULE_BADGE[row.module];
              return (
                <motion.tr
                  key={row.id}
                  variants={rowVariants}
                  className="border-b border-[var(--border-glass)] last:border-b-0"
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-9 w-9 shrink-0 rounded-md border border-[var(--border-glass)]"
                        style={{ background: row.thumbGradient }}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--text-primary)]">
                          {row.title}
                        </p>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          {row.subtitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <NeonBadge tone={mod.tone} label={mod.label} />
                  </td>
                  <td className="px-2 py-3">
                    <span className="font-[family-name:var(--font-mono-jb)] text-xs text-[var(--text-mono)]">
                      {row.channels.join(" · ")}
                    </span>
                  </td>
                  <td className="px-2 py-3 font-[family-name:var(--font-mono-jb)] text-xs tabular-nums text-[var(--text-primary)]">
                    {row.reachLabel}
                  </td>
                  <td className="px-2 py-3 font-[family-name:var(--font-mono-jb)] text-xs tabular-nums text-[var(--accent-gold)]">
                    {row.engRateLabel}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={cn(
                        "font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider",
                        STATUS_STYLE[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </GlassCard>
  );
}
