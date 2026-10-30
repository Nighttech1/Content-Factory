"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { CompetitorOutlier } from "@/types/analytics";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const PLATFORM_RU: Record<CompetitorOutlier["platform"], string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

type OutliersVaultProps = {
  outliers: CompetitorOutlier[];
  platformFilter?: string;
};

function razborSummary(items: CompetitorOutlier[]): string {
  if (items.length === 0) {
    return "Пока нет аномалий для разбора — задайте тему в разведке и нажмите «Аномалии».";
  }
  const top = items[0]!;
  const avg =
    items.reduce((s, x) => s + x.multiplier, 0) / Math.max(items.length, 1);
  return `Разборщик видит общий паттерн: лидеры бьют медиану примерно в ${avg.toFixed(1)}×. Чаще всего срабатывает хук «${top.hookTypeRu.toLowerCase()}» и триггер «${top.primaryTriggerRu.toLowerCase()}». Люди останавливаются на первых секундах, потому что обещание пользы или эмоции звучит сразу и без воды — а дальше контент держит темп короткими сменами кадра. Для наших выпусков: копируем структуру обещания, а не копируем чужие лица и шутки один в один.`;
}

/**
 * C-101 — horizontal top-15 carousel + human Razborщик summary.
 */
export function OutliersVault({
  outliers,
  platformFilter = "all",
}: OutliersVaultProps) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const filtered =
      platformFilter === "all"
        ? outliers
        : outliers.filter((o) => o.platform === platformFilter);
    return filtered.slice(0, 15);
  }, [outliers, platformFilter]);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <section data-testid="analytics-outliers" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-ui)] text-[20px] font-bold text-[var(--text-primary)]">
          Аномалии
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Назад"
            onClick={() => scrollBy(-1)}
            className="rounded-lg border border-[var(--border-glass)] p-2 text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Вперёд"
            onClick={() => scrollBy(1)}
            className="rounded-lg border border-[var(--border-glass)] p-2 text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        data-testid="analytics-outliers-carousel"
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {items.map((outlier, i) => (
          <motion.div
            key={outlier.id}
            className="w-[220px] shrink-0"
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { ...SPRING, delay: i * 0.03 }
            }
          >
            <GlassCard className="flex h-full flex-col overflow-hidden border-[var(--border-glass)] bg-[var(--bg-elevated)] p-0">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={outlier.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="220px"
                  unoptimized
                />
                <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 font-[family-name:var(--font-ui)] text-[11px] font-bold text-[var(--accent-gold)]">
                  {outlier.multiplier}×
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3">
                <Link
                  href={outlier.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 font-[family-name:var(--font-ui)] text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue-bright)]"
                >
                  {outlier.title}
                </Link>
                <p className="font-[family-name:var(--font-ui)] text-[11px] text-[var(--text-primary)]">
                  {outlier.creatorHandle} · {PLATFORM_RU[outlier.platform]} ·{" "}
                  {outlier.views}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard
        data-testid="analytics-outliers-summary"
        className="border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4"
      >
        <p className="mb-1 font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]">
          Резюме Разборщика
        </p>
        <p className="font-[family-name:var(--font-ui)] text-sm leading-relaxed text-[var(--text-primary)]">
          {razborSummary(items)}
        </p>
      </GlassCard>
    </section>
  );
}
