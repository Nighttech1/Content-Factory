"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PreviewModeToggle } from "@/components/inspect/PreviewModeToggle";
import { ReelsPlayer } from "@/components/inspect/ReelsPlayer";
import { CarouselDeck } from "@/components/inspect/CarouselDeck";
import { useInspectStore } from "@/lib/inspect-store";

const SPRING = { type: "spring" as const, damping: 28, stiffness: 280 };

export function MediaDeck() {
  const previewMode = useInspectStore((s) => s.previewMode);
  const reduceMotion = useReducedMotion();

  const viewportTransition = reduceMotion ? { duration: 0 } : SPRING;
  const viewportInitial = reduceMotion
    ? false
    : { opacity: 0, scale: 0.98 };
  const viewportExit = reduceMotion
    ? undefined
    : { opacity: 0, scale: 0.98 };

  return (
    <div className="flex flex-col gap-3">
      <PreviewModeToggle />

      {/* Mode crossfade: Reels ↔ Carousel main viewport only; strip stays mounted */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {previewMode === "reels_9_16" ? (
            <motion.div
              key="reels-viewport"
              initial={viewportInitial}
              animate={{ opacity: 1, scale: 1 }}
              exit={viewportExit}
              transition={viewportTransition}
            >
              <ReelsPlayer />
            </motion.div>
          ) : (
            <motion.div
              key="carousel-viewport"
              initial={viewportInitial}
              animate={{ opacity: 1, scale: 1 }}
              exit={viewportExit}
              transition={viewportTransition}
            >
              <CarouselDeck showStage showStrip={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CarouselDeck showStage={false} />
    </div>
  );
}
