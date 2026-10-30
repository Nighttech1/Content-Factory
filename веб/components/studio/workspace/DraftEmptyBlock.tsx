"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export type DraftEmptyMode = "capcut" | "drafts" | "none";

type DraftEmptyBlockProps = {
  topic: string;
  onOpen: () => void;
  /** C-31: CapCut only for reels; carousel → Drafts; others → visual stub. */
  mode?: DraftEmptyMode;
};

const COPY: Record<
  DraftEmptyMode,
  { hint: string; cta: string; interactive: boolean }
> = {
  capcut: {
    hint: "откройте CapCut-like редактор: превью, таймлайн, слои.",
    cta: "Открыть редактор →",
    interactive: true,
  },
  drafts: {
    hint: "черновики и Разбор конкурента — без CapCut.",
    cta: "Открыть черновики →",
    interactive: true,
  },
  none: {
    hint: "визуальный черновик модуля (редактор CapCut недоступен).",
    cta: "Черновик готов",
    interactive: false,
  },
};

export function DraftEmptyBlock({
  topic,
  onOpen,
  mode = "capcut",
}: DraftEmptyBlockProps) {
  const reduceMotion = useReducedMotion();
  const copy = COPY[mode];

  return (
    <motion.button
      type="button"
      data-testid="draft-empty-block"
      data-draft-mode={mode}
      disabled={!copy.interactive}
      onClick={() => {
        if (copy.interactive) onOpen();
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-dashed",
        "border-[color-mix(in_srgb,var(--accent-gold)_35%,var(--border-glass))]",
        "bg-[color-mix(in_srgb,var(--accent-gold)_6%,var(--bg-elevated))] p-6 text-left",
        copy.interactive &&
          "transition-colors hover:border-[color-mix(in_srgb,var(--accent-gold)_55%,var(--border-glass))]",
        copy.interactive &&
          "hover:bg-[color-mix(in_srgb,var(--accent-gold)_10%,var(--bg-elevated))]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue-bright)]",
        !copy.interactive && "cursor-default opacity-90",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      whileHover={
        reduceMotion || !copy.interactive ? undefined : { y: -2 }
      }
      whileTap={
        reduceMotion || !copy.interactive ? undefined : { scale: 0.99 }
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 0%, rgba(212,163,89,0.18), transparent 55%)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-[family-name:var(--font-mono-jb)] text-[11px] uppercase tracking-[0.14em] text-[var(--accent-gold)]">
            New draft
          </p>
          <p className="text-base font-semibold text-[var(--text-primary)]">
            Пустой черновик под идею
          </p>
          <p className="max-w-xl text-sm text-[var(--text-muted)]">
            «{topic}» — {copy.hint}
          </p>
        </div>
        <span
          className={cn(
            "mt-3 inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
            "bg-[color-mix(in_srgb,var(--accent-blue)_18%,var(--bg-canvas))] text-[var(--text-primary)]",
            "border border-[var(--border-glass)]",
            copy.interactive &&
              "group-hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))]",
          )}
        >
          {copy.cta}
        </span>
      </div>
    </motion.button>
  );
}
