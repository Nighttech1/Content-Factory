"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { useInspectStore } from "@/lib/inspect-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const GAUGE_R = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;

function tierLabel(score: number): string {
  if (score >= 40) return "Top 4% Engagement Tier (Armenian Cultural Category)";
  if (score >= 30) return "Strong mid-funnel hook · Cultural affinity";
  return "Solid baseline · Consider a sharper open";
}

export function ViralityMeter() {
  const reduceMotion = useReducedMotion();
  const viralityScore = useInspectStore((s) => s.viralityScore);
  const activeHookId = useInspectStore((s) => s.activeHookId);
  const hooks = useInspectStore((s) => s.hooks);

  const activeHook = hooks.find((h) => h.id === activeHookId);
  /** Prefer active hook score so selectHook visibly updates the gauge (S2). */
  const score = activeHook?.score ?? viralityScore;
  const clamped = Math.min(100, Math.max(0, score));
  const dash = (clamped / 100) * CIRCUMFERENCE;

  const prevScoreRef = useRef(score);
  const scoreChanged = prevScoreRef.current !== score;

  useEffect(() => {
    prevScoreRef.current = score;
  }, [score]);

  return (
    <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg bg-[var(--bg-hover)] p-3">
      {scoreChanged && !reduceMotion && (
        <motion.span
          key={`score-flash-${score}`}
          className="pointer-events-none absolute inset-0 rounded-lg bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={SPRING}
          aria-hidden
        />
      )}
      <div className="relative z-10 flex min-w-0 items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg
            className="h-12 w-12 -rotate-90"
            viewBox="0 0 36 36"
            aria-hidden
          >
            <circle
              cx="18"
              cy="18"
              r={GAUGE_R}
              fill="none"
              stroke="var(--border-glass)"
              strokeWidth="3.5"
            />
            <motion.circle
              cx="18"
              cy="18"
              r={GAUGE_R}
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              initial={false}
              animate={{ strokeDasharray: `${dash} ${CIRCUMFERENCE}` }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
            />
          </svg>
          <motion.span
            key={score}
            className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-mono-jb)] text-sm font-bold text-[var(--text-primary)]"
            initial={
              reduceMotion || !scoreChanged
                ? false
                : { scale: 0.94, opacity: 0.55 }
            }
            animate={
              reduceMotion || !scoreChanged
                ? { scale: 1, opacity: 1 }
                : { scale: [0.94, 1.08, 1], opacity: 1 }
            }
            transition={reduceMotion ? { duration: 0 } : SPRING}
            aria-live="polite"
            aria-label={`Predicted hook score ${score}`}
          >
            {score}
          </motion.span>
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Predicted Hook Score
          </span>
          <motion.span
            key={`tier-${score}`}
            className="truncate text-xs font-medium text-[var(--accent-gold)]"
            initial={
              reduceMotion || !scoreChanged ? false : { opacity: 0.4, y: 4 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : SPRING}
          >
            {tierLabel(score)}
          </motion.span>
        </div>
      </div>

      <div className="relative z-10 hidden shrink-0 flex-col items-end text-right sm:flex">
        <span className="text-[11px] text-[var(--text-muted)]">Retention 3s</span>
        <NeonBadge tone="cobalt" className="mt-1 px-2 py-0.5 text-[10px]">
          {viralityScore}%
        </NeonBadge>
      </div>
    </div>
  );
}
