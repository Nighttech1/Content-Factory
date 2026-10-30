"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prefetchAll } from "@/lib/image-cache";

/** S48 Motion — expensive horizontal L/R (extends C-131). */
const SLIDE_LR = {
  duration: 0.34,
  ease: [0.23, 1, 0.32, 1] as const,
};
const SLIDE_X = "12%";

export type CreateCarouselPreviewSlide = {
  id: string;
  imageUrl: string;
  caption?: string;
};

type FrameStatus = "loading" | "loaded" | "error";

type CreateCarouselPreviewProps = {
  slides: CreateCarouselPreviewSlide[];
  slideIndex: number;
  onStep: (delta: number) => void;
  reduceMotion?: boolean | null;
  /** true only when every current slide fired onLoad with naturalWidth > 0 */
  onAllLoaded?: (ok: boolean) => void;
  /** Fired when any frame hits onError (RU message for chat) */
  onPreviewError?: (message: string) => void;
};

const ERROR_RU = "Не удалось загрузить кадр";

function withCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_cb=${Date.now()}`;
}

/**
 * C-carousel-preview-black / C-designer-panorama-slice —
 * Create modal preview = **sliced** frames aspect 4/5 (one tile at a time).
 * Never render a panorama strip as the product preview.
 */
export function CreateCarouselPreview({
  slides,
  slideIndex,
  onStep,
  reduceMotion,
  onAllLoaded,
  onPreviewError,
}: CreateCarouselPreviewProps) {
  const [srcOverrides, setSrcOverrides] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, FrameStatus>>({});
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const prevIndexRef = useRef(slideIndex);
  const onAllLoadedRef = useRef(onAllLoaded);
  const onPreviewErrorRef = useRef(onPreviewError);
  onAllLoadedRef.current = onAllLoaded;
  onPreviewErrorRef.current = onPreviewError;

  const slideKey = slides.map((s) => `${s.id}:${s.imageUrl}`).join("|");

  useEffect(() => {
    setSrcOverrides({});
    const next: Record<string, FrameStatus> = {};
    for (const s of slides) {
      next[s.id] = "loading";
    }
    setStatuses(next);
    onAllLoadedRef.current?.(false);
    void prefetchAll(slides.map((s) => s.imageUrl));
    // slideKey encodes id+url; intentionally omit `slides` identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideKey]);

  useEffect(() => {
    const prev = prevIndexRef.current;
    if (slideIndex !== prev) {
      setSlideDir(slideIndex > prev ? 1 : -1);
      prevIndexRef.current = slideIndex;
    }
  }, [slideIndex]);

  useEffect(() => {
    if (slides.length === 0) {
      onAllLoadedRef.current?.(false);
      return;
    }
    const allLoaded = slides.every((s) => statuses[s.id] === "loaded");
    const anyError = slides.some((s) => statuses[s.id] === "error");
    if (allLoaded) {
      onAllLoadedRef.current?.(true);
    } else if (anyError) {
      onAllLoadedRef.current?.(false);
    }
  }, [slides, statuses]);

  const markLoaded = useCallback((id: string, img: HTMLImageElement) => {
    if (img.naturalWidth <= 0) {
      setStatuses((prev) => {
        if (prev[id] === "error") return prev;
        return { ...prev, [id]: "error" };
      });
      onPreviewErrorRef.current?.(ERROR_RU);
      return;
    }
    setStatuses((prev) => {
      if (prev[id] === "loaded") return prev;
      return { ...prev, [id]: "loaded" };
    });
  }, []);

  const markError = useCallback((id: string) => {
    setStatuses((prev) => {
      if (prev[id] === "error") return prev;
      return { ...prev, [id]: "error" };
    });
    onPreviewErrorRef.current?.(ERROR_RU);
  }, []);

  /**
   * Cached/complete images may skip onLoad — sync once via microtask.
   * Never setState synchronously in ref during commit (Maximum update depth).
   */
  const bindFrameImg = useCallback(
    (id: string, img: HTMLImageElement | null) => {
      if (!img || !img.complete) return;
      queueMicrotask(() => {
        if (img.naturalWidth > 0) markLoaded(id, img);
        else markError(id);
      });
    },
    [markLoaded, markError],
  );

  const retryFrame = useCallback((slide: CreateCarouselPreviewSlide) => {
    setStatuses((prev) => ({ ...prev, [slide.id]: "loading" }));
    setSrcOverrides((prev) => ({
      ...prev,
      [slide.id]: withCacheBust(slide.imageUrl),
    }));
    onAllLoadedRef.current?.(false);
  }, []);

  if (slides.length === 0) {
    return (
      <p
        data-testid="create-carousel-preview-empty"
        className="max-w-[20rem] text-center text-sm text-[var(--text-muted)]"
      >
        Карусель появится после «Нарисовать»
      </p>
    );
  }

  const safeIndex = Math.min(slideIndex, Math.max(0, slides.length - 1));
  const current = slides[safeIndex]!;
  const src = srcOverrides[current.id] ?? current.imageUrl;
  const status = statuses[current.id] ?? "loading";
  const enterX = slideDir > 0 ? SLIDE_X : `-${SLIDE_X}`;
  const exitX = slideDir > 0 ? `-${SLIDE_X}` : SLIDE_X;

  return (
    <div
      className="flex w-full max-w-[min(100%,36rem)] flex-col items-center gap-3"
      data-testid="create-carousel-preview-sliced"
      data-slide-count={slides.length}
    >
      <div className="flex w-full items-center gap-2">
        <motion.button
          type="button"
          data-testid="create-carousel-slide-prev"
          aria-label="Предыдущий слайд"
          onClick={() => onStep(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <div
          /* S50 preview ≈1.5× again (S48 19.5rem → ~29rem) */
          className="relative aspect-[4/5] w-[min(100%,29rem)] overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[rgba(0,0,0,0.45)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          data-carousel-crossfade
          data-testid="create-carousel-slide-crossfade"
          data-motion="s50-preview-15"
        >
          {status === "loading" ? (
            <div
              data-testid="create-carousel-preview-loading"
              className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(0,0,0,0.35)]"
              aria-busy="true"
            >
              <span className="text-xs text-[var(--text-muted)]">Загрузка…</span>
            </div>
          ) : null}

          {status === "error" ? (
            <div
              data-testid="create-carousel-preview-error"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[rgba(8,9,10,0.92)] px-3 text-center"
              role="alert"
            >
              <p className="text-xs leading-snug text-[color-mix(in_srgb,#f87171_90%,white)]">
                {ERROR_RU}
              </p>
              <button
                type="button"
                data-testid="create-carousel-preview-retry"
                className="rounded-md border border-[var(--border-glass)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                onClick={() => retryFrame(current)}
              >
                Повторить
              </button>
            </div>
          ) : null}

          {reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${current.id}:${src}`}
              ref={(el) => bindFrameImg(current.id, el)}
              src={src}
              alt={current.caption ?? ""}
              className="absolute inset-0 h-full w-full object-contain"
              onLoad={(e) => markLoaded(current.id, e.currentTarget)}
              onError={() => markError(current.id)}
            />
          ) : (
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={`${current.id}:${src}`}
                ref={(el) => bindFrameImg(current.id, el)}
                src={src}
                alt={current.caption ?? ""}
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ opacity: 0.35, x: enterX }}
                animate={{
                  opacity: status === "loaded" ? 1 : 0.45,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: exitX,
                  transition: SLIDE_LR,
                }}
                transition={SLIDE_LR}
                onLoad={(e) => markLoaded(current.id, e.currentTarget)}
                onError={() => markError(current.id)}
              />
            </AnimatePresence>
          )}

          {/* Eager-load off-screen slides so onAllLoaded can fire for full set */}
          <div className="sr-only" aria-hidden>
            {slides.map((s) => {
              if (s.id === current.id) return null;
              const offSrc = srcOverrides[s.id] ?? s.imageUrl;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`preload-${s.id}:${offSrc}`}
                  ref={(el) => bindFrameImg(s.id, el)}
                  src={offSrc}
                  alt=""
                  onLoad={(e) => markLoaded(s.id, e.currentTarget)}
                  onError={() => markError(s.id)}
                />
              );
            })}
          </div>
        </div>

        <motion.button
          type="button"
          data-testid="create-carousel-slide-next"
          aria-label="Следующий слайд"
          onClick={() => onStep(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(8,9,10,0.55)] text-white backdrop-blur-sm"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {current.caption?.trim() ? (
        <p
          data-testid="create-carousel-preview-caption"
          className="max-w-full px-1 text-center text-xs leading-snug text-[var(--text-muted)]"
        >
          {current.caption.trim()}
        </p>
      ) : null}

      <p
        data-testid="create-carousel-slide-index"
        className="font-[family-name:var(--font-century-gothic)] text-sm tabular-nums text-white"
      >
        {safeIndex + 1}/{slides.length}
      </p>
    </div>
  );
}
