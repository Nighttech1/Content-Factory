"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { shouldShowFeedPlay } from "@/lib/studio/feed-play";
import type { FeedPost } from "@/lib/studio/feed-types";
import type { CompetitorCarouselSlide } from "@/lib/studio/razbor-pipeline";

/** Play toggle / icon swap — C-51 damping ~28 */
const PLAY_SPRING = { type: "spring" as const, damping: 28, stiffness: 340 };
/** Scrub seek settle; snappy enough for drag ticks */
const PLAYHEAD_SPRING = { type: "spring" as const, damping: 28, stiffness: 420 };
const PLAYHEAD_TICK = { duration: 0.08, ease: "linear" as const };
const INSTANT = { duration: 0 };
const DEFAULT_DURATION_SEC = 18;

function formatTimecode(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const m = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const s = (clamped % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type RazborReelPlayerProps = {
  post: FeedPost;
  slides: CompetitorCarouselSlide[];
  className?: string;
  /** C-53: hide Play on IMAGE / aesthetic-graphics via C-52 helper. */
  moduleId?: string;
};

/**
 * C-51 — Competitor reel panel: round Play (no autoplay) + CapCut-lite scrubber.
 * Patterns: FeedPostCard play (21st id=4586 reuse) · CapCutEditorShell / ReelsPlayer scrub.
 */
export function RazborReelPlayer({
  post,
  slides,
  className,
  moduleId,
}: RazborReelPlayerProps) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const showPlay = shouldShowFeedPlay(post, moduleId);
  const hasVideo = showPlay && Boolean(post.mediaUrl);
  const posterUrl =
    post.thumbUrl ?? slides[0]?.imageUrl ?? undefined;
  const durationSec = Math.max(
    1,
    post.durationSec ?? DEFAULT_DURATION_SEC,
  );

  const [playing, setPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Reset on post change — never autoplay
  useEffect(() => {
    setPlaying(false);
    setCurrentSec(0);
    setDragging(false);
    draggingRef.current = false;
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [post.id, post.mediaUrl]);

  // Sync real video element — play only after user toggle
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;
    if (playing) {
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, hasVideo]);

  // Fake clock when no video (poster + scrubber)
  useEffect(() => {
    if (!playing || hasVideo) return;
    const tickMs = reduceMotion ? 250 : 100;
    const step = tickMs / 1000;
    const id = window.setInterval(() => {
      setCurrentSec((prev) => {
        const next = prev + step;
        if (next >= durationSec) {
          setPlaying(false);
          return durationSec;
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(id);
  }, [playing, hasVideo, durationSec, reduceMotion]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const clamped = Math.min(1, Math.max(0, ratio));
      const t = clamped * durationSec;
      setCurrentSec(t);
      const el = videoRef.current;
      if (el && hasVideo) {
        el.currentTime = t;
      }
    },
    [durationSec, hasVideo],
  );

  const scrubFromClientX = useCallback(
    (clientX: number) => {
      const el = scrubRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      seekToRatio((clientX - rect.left) / rect.width);
    },
    [seekToRatio],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setPlaying(false);
    scrubFromClientX(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrubFromClientX(e.clientX);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const togglePlay = () => {
    if (currentSec >= durationSec - 0.05) {
      seekToRatio(0);
    }
    setPlaying((p) => !p);
  };

  const progress =
    durationSec > 0 ? Math.min(100, (currentSec / durationSec) * 100) : 0;
  const playTransition = reduceMotion ? INSTANT : PLAY_SPRING;

  const playheadLeftTransition = reduceMotion
    ? INSTANT
    : dragging
      ? INSTANT
      : playing
        ? PLAYHEAD_TICK
        : PLAYHEAD_SPRING;

  return (
    <div
      data-testid="razbor-reel-player"
      className={cn(
        "relative flex w-full max-w-[300px] flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-[var(--border-glass)]",
          "bg-[#0a0c0f] shadow-[0_16px_48px_rgba(0,0,0,0.5)]",
        )}
        style={{ aspectRatio: "9 / 16" }}
      >
        {showPlay && post.mediaUrl ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            poster={posterUrl}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            preload="metadata"
            autoPlay={false}
            onTimeUpdate={() => {
              const el = videoRef.current;
              if (!el || draggingRef.current) return;
              setCurrentSec(el.currentTime);
            }}
            onLoadedMetadata={() => {
              const el = videoRef.current;
              if (!el) return;
              if (Number.isFinite(el.duration) && el.duration > 0) {
                /* keep post.durationSec as contract; video may differ */
              }
            }}
            onEnded={() => {
              setPlaying(false);
              setCurrentSec(durationSec);
            }}
          />
        ) : posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#1a2030_0%,#0c0e12_100%)]" />
        )}

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-[4]",
            "bg-[rgba(0,0,0,0.28)] transition-opacity duration-150 ease-out motion-reduce:transition-none",
            !showPlay ? "opacity-0" : playing ? "opacity-35" : "opacity-20",
          )}
        />

        {/* Round Play — FeedPostCard / 21st id=4586; C-53: no Play on IMAGE/graphics */}
        {showPlay ? (
        <div className="absolute inset-0 z-[5] flex items-center justify-center">
          <motion.button
            type="button"
            data-testid="razbor-reel-play"
            aria-label={playing ? "Пауза" : "Смотреть"}
            aria-pressed={playing}
            onClick={togglePlay}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              "border border-[rgba(255,255,255,0.18)]",
              "bg-[rgba(8,9,10,0.55)] text-[var(--text-primary)] backdrop-blur-sm",
              "hover:bg-[rgba(8,9,10,0.72)] focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[var(--accent-blue-bright)]",
            )}
            initial={false}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            transition={playTransition}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={playing ? "pause" : "play"}
                className="flex items-center justify-center"
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.92 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, scale: 0.92 }
                }
                transition={playTransition}
              >
                {playing ? (
                  <Pause className="h-5 w-5 fill-current" strokeWidth={2} />
                ) : (
                  <Play
                    className="ml-0.5 h-5 w-5 fill-current"
                    strokeWidth={2}
                  />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        ) : null}
      </div>

      {/* CapCut-lite timeline — video/reels only */}
      {showPlay ? (
      <div
        data-testid="razbor-reel-timeline"
        className="mt-3 shrink-0 rounded-lg border border-[var(--border-glass)] bg-[#0B0D10] px-2.5 pb-2.5 pt-2"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
            Ролик конкурента
          </span>
          <span
            data-testid="razbor-reel-time"
            className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-mono)]"
          >
            {formatTimecode(currentSec)} / {formatTimecode(durationSec)}
          </span>
        </div>

        <div
          ref={scrubRef}
          role="slider"
          aria-label="Razbor timeline scrubber"
          aria-valuemin={0}
          aria-valuemax={Math.round(durationSec)}
          aria-valuenow={Math.round(currentSec)}
          tabIndex={0}
          className="group/scrub relative h-8 cursor-pointer overflow-hidden rounded-md border border-[var(--border-glass)] bg-[#08090A]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              setPlaying(false);
              seekToRatio((currentSec + 1) / durationSec);
            } else if (e.key === "ArrowLeft") {
              setPlaying(false);
              seekToRatio((currentSec - 1) / durationSec);
            }
          }}
        >
          {/* Single mock track */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-1 top-1.5 bottom-1.5 rounded-sm"
            style={{
              background:
                "color-mix(in srgb, var(--accent-blue) 35%, #0a0c0f)",
              border:
                "1px solid color-mix(in srgb, var(--accent-blue) 30%, transparent)",
            }}
          />
          {/* Progress fill — scaleX (transform), not width */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)]"
            initial={false}
            animate={{ scaleX: progress / 100 }}
            transition={playheadLeftTransition}
          />
          {/* Playhead */}
          <motion.div
            data-testid="razbor-reel-playhead"
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[var(--accent-gold)]"
            initial={false}
            animate={{
              left: `${progress}%`,
              ...(reduceMotion
                ? {}
                : {
                    boxShadow: playing
                      ? [
                          "0 0 0 0 rgba(212,163,89,0)",
                          "0 0 10px 1px rgba(212,163,89,0.5)",
                          "0 0 0 0 rgba(212,163,89,0)",
                        ]
                      : "0 0 6px rgba(212,163,89,0.3)",
                  }),
            }}
            transition={
              reduceMotion
                ? INSTANT
                : {
                    left: playheadLeftTransition,
                    boxShadow:
                      playing && !dragging
                        ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : PLAYHEAD_SPRING,
                  }
            }
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--accent-gold)]" />
          </motion.div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
