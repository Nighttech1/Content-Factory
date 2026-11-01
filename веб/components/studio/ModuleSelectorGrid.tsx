"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Clapperboard,
  Images,
  LayoutGrid,
  Newspaper,
  Palette,
  Send,
  Video,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  mergeStudioModules,
  studioModuleHref,
} from "@/components/studio/modules";
import { cn } from "@/lib/cn";
import { useStudioStore } from "@/lib/studio-store";

const STAGGER = 0.08;
const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };

/** Тематическая иконка модуля (крупно и приглушённо в теле карточки). */
const MODULE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  "carousel-engine": Images,
  "aesthetic-graphics": Palette,
  "cartoon-reels": Clapperboard,
  "heygen-reels": Video,
  "site-articles": Newspaper,
  "tg-articles": Send,
};

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
          const Icon = MODULE_ICONS[mod.id] ?? LayoutGrid;

          return (
            <motion.div
              key={mod.id}
              variants={cardVariants}
              className="h-full"
              whileHover={reduceMotion ? undefined : { y: -5 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={SPRING}
            >
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
                      "relative isolate flex h-full min-h-[252px] flex-col justify-between gap-4 overflow-hidden transition-[border-color,box-shadow] duration-300",
                      selected
                        ? "border-[color-mix(in_srgb,var(--accent-blue-bright)_55%,var(--border-glass))]"
                        : "group-hover:border-[color-mix(in_srgb,var(--accent-gold)_45%,var(--border-glass))] group-hover:shadow-[0_18px_50px_-24px_color-mix(in_srgb,var(--accent-gold)_60%,transparent)]",
                    )}
                  >
                    {/* Декоративное свечение — наполняет пустое тело, усиливается на hover */}
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500",
                        selected
                          ? "bg-[color-mix(in_srgb,var(--accent-blue-bright)_28%,transparent)] opacity-70"
                          : "bg-[color-mix(in_srgb,var(--accent-gold)_22%,transparent)] opacity-25 group-hover:opacity-70",
                      )}
                    />
                    {/* Тематическая иконка модуля — наполняет тело карточки */}
                    <Icon
                      aria-hidden
                      strokeWidth={1}
                      className={cn(
                        "pointer-events-none absolute bottom-3 right-3 -z-10 h-20 w-20 transition-all duration-500",
                        selected
                          ? "text-[var(--accent-blue-bright)] opacity-25"
                          : "text-[var(--text-mono)] opacity-[0.08] group-hover:text-[var(--accent-gold)] group-hover:opacity-30",
                      )}
                    />
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
                        "inline-flex items-center gap-1.5 font-[family-name:var(--font-mono-jb)] text-[11px]",
                        selected
                          ? "text-[var(--accent-blue-bright)]"
                          : "text-[var(--text-mono)] group-hover:text-[var(--accent-gold)]",
                      )}
                    >
                      {selected ? "● Открыть" : "Открыть"}
                      {!selected && (
                        <span
                          aria-hidden
                          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                        >
                          →
                        </span>
                      )}
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
