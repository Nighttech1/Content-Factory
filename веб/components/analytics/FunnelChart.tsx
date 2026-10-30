"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge } from "@/components/ui/NeonBadge";
import {
  type ContentFunnel,
  funnelConversions,
  formatFunnelValue,
} from "@/lib/analytics/funnel";

const SPRING = { type: "spring" as const, damping: 26, stiffness: 240 };

const ACCENT_VAR: Record<string, string> = {
  cyan: "var(--accent-blue-bright)",
  blue: "var(--accent-blue)",
  gold: "var(--accent-gold)",
  terracotta: "var(--accent-terracotta)",
};

export function FunnelChart({ funnel }: { funnel: ContentFunnel }) {
  const reduceMotion = useReducedMotion();
  const max = funnel.stages[0]?.value ?? 1;
  const conv = funnelConversions(funnel);

  return (
    <GlassCard className="flex flex-col gap-4 p-4" data-testid="content-funnel">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-wider text-[var(--accent-gold)]">
            KPI №1 · путь к встрече
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            Воронка: контент → комьюнити → встреча
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Куда ведёт контент и где рвётся путь до живой встречи · {funnel.windowLabel}
          </p>
        </div>
        <NeonBadge
          tone={funnel.source === "live" ? "gold" : "blue"}
          label={funnel.source === "live" ? "live" : "демо (ждёт данных)"}
          className="shrink-0 self-start"
        />
      </header>

      <div className="flex flex-col items-center gap-1.5">
        {funnel.stages.map((s, i) => {
          const widthPct = Math.max(26, (s.value / max) * 100);
          const accent = ACCENT_VAR[s.accent] ?? "var(--accent-blue)";
          return (
            <div key={s.id} className="flex w-full flex-col items-center gap-1.5">
              <motion.div
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-glass)] px-4 py-3"
                style={{
                  width: `${widthPct}%`,
                  minWidth: 220,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 26%, transparent), color-mix(in srgb, ${accent} 8%, transparent))`,
                  borderColor: `color-mix(in srgb, ${accent} 40%, var(--border-glass))`,
                }}
                initial={reduceMotion ? false : { opacity: 0, y: 8, scaleX: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleX: 1 }}
                transition={
                  reduceMotion ? { duration: 0 } : { ...SPRING, delay: i * 0.06 }
                }
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {s.label}
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {s.hint}
                  </p>
                </div>
                <span
                  className="shrink-0 font-[family-name:var(--font-mono-jb)] text-xl font-semibold tabular-nums"
                  style={{ color: accent }}
                >
                  {formatFunnelValue(s.value)}
                </span>
              </motion.div>

              {i < conv.length ? (
                <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  ↓ {conv[i]!.toFixed(conv[i]! < 10 ? 1 : 0)}% →{" "}
                  {funnel.stages[i + 1]!.label.toLowerCase()}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="rounded-lg border border-dashed border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_70%,transparent)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
        Эту воронку читает Контент-директор: где конверсия проседает — туда усиливает
        контент и правит CTA. Значения — демо, пока не подключены: охват (PostAnalytics),
        TG-подписки, явки на встречу (@vernatunbot) и возвраты.
      </p>
    </GlassCard>
  );
}
