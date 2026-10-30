"use client";

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { mergeStudioModules } from "@/components/studio/modules";
import { cn } from "@/lib/cn";
import { useStudioStore } from "@/lib/studio-store";

const STAGGER = 0.08;
const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };

type AnalyticsModuleMenuProps = {
  onSelectModule: (moduleId: string) => void;
};

/**
 * C-127 — Analytics level-1 menu: same Studio Launchpad module tiles.
 */
export function AnalyticsModuleMenu({ onSelectModule }: AnalyticsModuleMenuProps) {
  const reduceMotion = useReducedMotion();
  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);

  useEffect(() => {
    void hydrateCustomModules();
  }, [hydrateCustomModules]);

  const tiles = useMemo(
    () => mergeStudioModules(customModules),
    [customModules],
  );

  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : STAGGER,
      },
    },
  };

  const cardVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 10, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
  };

  return (
    <section
      data-testid="analytics-module-menu"
      className="flex flex-col gap-4"
      aria-labelledby="analytics-module-menu-heading"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="analytics-module-menu-heading"
          className="text-xl font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Модули диагностики
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Выберите канал — откроется дашборд метрик этого модуля.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {tiles.map((mod) => (
          <motion.div key={mod.id} variants={cardVariants} className="h-full">
            <button
              type="button"
              data-testid="analytics-module-tile"
              data-module-id={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
            >
              <GlassCard
                disableHoverMotion
                className={cn(
                  "flex h-full min-h-[220px] flex-col justify-between gap-4 transition-[border-color] duration-200",
                  "group-hover:border-[color-mix(in_srgb,var(--accent-gold)_40%,var(--border-glass))]",
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-mono)]">
                    {mod.badge}
                  </span>
                  <span className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                    {mod.label}
                  </span>
                  <p className="text-pretty text-xs leading-snug text-[var(--text-muted)]">
                    {mod.description}
                  </p>
                </div>
                <span className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-mono)] group-hover:text-[var(--accent-blue-bright)]">
                  Открыть метрики →
                </span>
              </GlassCard>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
