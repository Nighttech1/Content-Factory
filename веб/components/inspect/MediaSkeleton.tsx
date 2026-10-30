"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/** Soft glass shimmer — adapted from 21st Skeleton shimmer (id=24972), retokenized. */
const SHIMMER =
  "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.04) 75%)";

type ShimmerSurfaceProps = {
  className?: string;
  style?: React.CSSProperties;
};

function ShimmerSurface({ className, style }: ShimmerSurfaceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={cn("bg-[var(--bg-hover)]", className)}
      style={{
        backgroundImage: reduceMotion ? undefined : SHIMMER,
        backgroundSize: "200% 100%",
        ...style,
      }}
      animate={
        reduceMotion ? undefined : { backgroundPosition: ["-200% 0", "200% 0"] }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 1.4, ease: "easeInOut", repeat: Infinity }
      }
    />
  );
}

type VideoSkeletonProps = {
  className?: string;
};

/** 9:16 Reels / video preview placeholder. */
export function VideoSkeleton({ className }: VideoSkeletonProps) {
  return (
    <div
      data-testid="skeleton-video"
      role="status"
      aria-busy="true"
      aria-label="Loading video preview"
      className={cn(
        "relative mx-auto w-full max-w-[340px] overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)]",
        className,
      )}
      style={{ aspectRatio: "9 / 16" }}
    >
      <ShimmerSurface className="absolute inset-0" />
      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
        <div className="h-5 w-20 rounded bg-[rgba(255,255,255,0.06)]" />
        <div className="h-5 w-14 rounded bg-[rgba(255,255,255,0.06)]" />
      </div>
      <div className="absolute inset-x-3 bottom-4 flex flex-col gap-2">
        <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.06)]" />
        <div className="h-8 w-24 rounded-lg bg-[rgba(255,255,255,0.06)]" />
      </div>
    </div>
  );
}

type CarouselSkeletonProps = {
  /** Placeholder thumb count in the strip. */
  slideCount?: number;
  /** When true, also reserve the 4:5 stage above the strip. */
  showStage?: boolean;
  /** When false, hide the strip chrome (MediaDeck stage-only mount). */
  showStrip?: boolean;
  className?: string;
};

/** Carousel stage + strip placeholders (same track geometry as real slides). */
export function CarouselSkeleton({
  slideCount = 3,
  showStage = false,
  showStrip = true,
  className,
}: CarouselSkeletonProps) {
  return (
    <div
      data-testid="skeleton-carousel"
      role="status"
      aria-busy="true"
      aria-label="Loading carousel slides"
      className={cn("flex flex-col gap-3", className)}
    >
      {showStage ? (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
          <div
            className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)]"
            style={{ aspectRatio: "4 / 5" }}
          >
            <ShimmerSurface className="absolute inset-0" />
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
              <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
              <div className="h-4 w-32 rounded bg-[rgba(255,255,255,0.06)]" />
            </div>
          </div>
        </div>
      ) : null}

      {showStrip ? (
        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
          <div className="mb-1 h-3 w-40 rounded bg-[rgba(255,255,255,0.06)]" />
          <div className="flex items-center gap-2 overflow-hidden py-1">
            {Array.from({ length: slideCount }, (_, i) => (
              <div
                key={`skel-slide-${i}`}
                className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)]"
              >
                <ShimmerSurface className="absolute inset-0" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Local demo loading flag (no API). Starts true, clears after delay.
 * Resets when `resetKey` changes (e.g. draft id / preview mode).
 */
export function useDemoMediaLoading(
  resetKey: string,
  delayMs = 1100,
): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), delayMs);
    return () => window.clearTimeout(id);
  }, [resetKey, delayMs]);

  return loading;
}
