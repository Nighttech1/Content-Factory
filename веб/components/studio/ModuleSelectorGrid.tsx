"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  mergeStudioModules,
  studioModuleHref,
} from "@/components/studio/modules";
import { cn } from "@/lib/cn";
import { useStudioStore } from "@/lib/studio-store";

const STAGGER = 0.08;
const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };

export function ModuleSelectorGrid() {
  const reduceMotion = useReducedMotion();
  const selectedModuleId = useStudioStore((s) => s.selectedModuleId);
  const setSelectedModuleId = useStudioStore((s) => s.setSelectedModuleId);
  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);

  useEffect(() => {
    void hydrateCustomModules();
  }, [hydrateCustomModules]);

  const tiles = mergeStudioModules(customModules);

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
    <section className="flex flex-col gap-4" aria-labelledby="module-grid-heading">
      <div className="flex flex-col gap-1">
        <h2
          id="module-grid-heading"
          className="text-xl font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Каналы рендера
        </h2>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        variants={gridVariants}
        initial="hidden"
        animate="show"
      >
        {tiles.map((mod) => {
          const selected = selectedModuleId === mod.id;
          const href = studioModuleHref(mod.id);

          return (
            <motion.div key={mod.id} variants={cardVariants} className="h-full">
              <Link
                href={href}
                data-testid="module-card"
                data-module-id={mod.id}
                aria-current={selected ? "page" : undefined}
                onClick={() => setSelectedModuleId(mod.id)}
                className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
              >
                <div className="h-full">
                  <GlassCard
                    disableHoverMotion
                    className={cn(
                      "flex h-full min-h-[252px] flex-col justify-between gap-4 transition-[border-color] duration-200",
                      selected
                        ? "border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))]"
                        : "group-hover:border-[color-mix(in_srgb,var(--accent-gold)_40%,var(--border-glass))]",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                        {mod.label}
                      </span>
                      <p className="text-pretty text-xs leading-snug text-[var(--text-muted)]">
                        {mod.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-[family-name:var(--font-mono-jb)] text-[11px]",
                        selected
                          ? "text-[var(--accent-blue-bright)]"
                          : "text-[var(--text-mono)]",
                      )}
                    >
                      {selected ? "● Открыть" : "Открыть →"}
                    </span>
                  </GlassCard>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
