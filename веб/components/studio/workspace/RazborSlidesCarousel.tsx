"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { prefetchAll } from "@/lib/image-cache";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const INSTANT = { duration: 0 };
/** S48 Motion — expensive horizontal L/R (extends C-131). */
const SLIDE_LR = {
  duration: 0.34,
  ease: [0.23, 1, 0.32, 1] as const,
};
const SLIDE_X = "12%";

export type RazborSlidePreview = {
  id: string;
  imageUrl: string;
  caption?: string;
};

type RazborSlidesCarouselProps = {
  slides: RazborSlidePreview[];
  testId?: string;
};

/** C-69/C-131/S47/S48 — L/R; object-contain; index N/M CG; preview ≈1.5×; preload. */
export function RazborSlidesCarousel({
  slides,
  testId = "razbor-slides-carousel",
}: RazborSlidesCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const count = slides.length;
  const safeIndex = Math.min(index, Math.max(0, count - 1));
  const current = slides[safeIndex];

  const slideKey = slides.map((s) => `${s.id}:${s.imageUrl}`).join("|");

  useEffect(() => {
    setIndex(0);
    setDir(1);
  }, [slideKey]);

  useEffect(() => {
    const urls = slides.map((s) => s.imageUrl).filter(Boolean);
    if (urls.length === 0) return;
    void prefetchAll(urls);
    // slideKey encodes urls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideKey]);

  function step(delta: number) {
    if (count <= 0) return;
    setDir(delta >= 0 ? 1 : -1);
    setIndex((i) => (i + delta + count) % count);
  }

  if (!current) {
    return (
      <p
        className="text-sm text-[var(--text-muted)]"
        data-testid={testId}
        data-empty="true"
      >
        Карусель появится после дизайнера
      </p>
    );
  }

  const enterX = dir > 0 ? SLIDE_X : `-${SLIDE_X}`;
  const exitX = dir > 0 ? `-${SLIDE_X}` : SLIDE_X;

  return (
    <div
      data-testid={testId}
      className="flex w-full max-w-[min(100%,30rem)] flex-col items-center gap-2"
      data-preview-layout="c-razbor-right-preview-collapse"
    >
      {/*
        C-razbor-right-preview-collapse: grid cols give the 4:5 frame a definite
        width. Flex row + w-full + aspect-ratio + absolute img collapsed to ~0×0
        when the parent was shrink-wrapped (no w-full). Match CreateCarouselPreview.
      */}
      <div className="grid w-full grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-2">
        <motion.button
          type="button"
          data-testid="razbor-slide-prev"
          aria-label="Предыдущий слайд"
          onClick={() => step(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center justify-self-center rounded-full border border-[var(--border-glass)] text-white"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={reduceMotion ? INSTANT : SPRING}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <div
          className={cn(
            /* S50 preview ≈1.5×; definite width so aspect-[4/5] cannot collapse */
            "relative aspect-[4/5] w-full min-h-[12rem] min-w-0 overflow-hidden rounded-xl border border-[var(--border-glass)]",
            "bg-[#0a0c0f] shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
          )}
          data-carousel-crossfade
          data-testid="razbor-slide-crossfade"
          data-motion="s50-preview-15"
        >
          {reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.imageUrl}
              alt={current.caption ?? ""}
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <AnimatePresence initial={false} mode="sync">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={current.id}
                src={current.imageUrl}
                alt={current.caption ?? ""}
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ opacity: 0.35, x: enterX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: exitX, transition: SLIDE_LR }}
                transition={SLIDE_LR}
              />
            </AnimatePresence>
          )}
        </div>
        <motion.button
          type="button"
          data-testid="razbor-slide-next"
          aria-label="Следующий слайд"
          onClick={() => step(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center justify-self-center rounded-full border border-[var(--border-glass)] text-white"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={reduceMotion ? INSTANT : SPRING}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
      <p
        data-testid="razbor-slide-index"
        className="font-[family-name:var(--font-century-gothic)] text-sm tabular-nums text-white"
      >
        {safeIndex + 1}/{count}
      </p>
    </div>
  );
}
