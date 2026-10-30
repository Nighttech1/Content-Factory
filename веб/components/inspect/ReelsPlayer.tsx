"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ReactiveButton } from "@/components/ui/ReactiveButton";
import { KaraokeCaptions } from "@/components/inspect/KaraokeCaptions";
import {
  VideoSkeleton,
  useDemoMediaLoading,
} from "@/components/inspect/MediaSkeleton";
import { useInspectStore } from "@/lib/inspect-store";
import { cn } from "@/lib/cn";

function formatTimecode(sec: number) {
  const clamped = Math.max(0, Math.floor(sec));
  const m = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const s = (clamped % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ReelsPlayer() {
  const draftId = useInspectStore((s) => s.id);
  const reels = useInspectStore((s) => s.reels);
  const togglePlay = useInspectStore((s) => s.togglePlay);
  const setCurrentTime = useInspectStore((s) => s.setCurrentTime);
  const reduceMotion = useReducedMotion();
  const scrubRef = useRef<HTMLDivElement>(null);
  const isMediaLoading = useDemoMediaLoading(`${draftId}:reels`);

  useEffect(() => {
    if (!reels.playing) return;
    const id = window.setInterval(() => {
      const next = useInspectStore.getState().reels.currentTimeSec + 0.25;
      const duration = useInspectStore.getState().reels.durationSec;
      if (next >= duration) {
        setCurrentTime(duration);
      } else {
        setCurrentTime(next);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [reels.playing, setCurrentTime]);

  const progress =
    reels.durationSec > 0
      ? (reels.currentTimeSec / reels.durationSec) * 100
      : 0;

  function scrubToClientX(clientX: number) {
    const el = scrubRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setCurrentTime(ratio * reels.durationSec);
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 bg-gradient-to-tr from-[color-mix(in_srgb,var(--accent-terracotta)_20%,transparent)] via-[color-mix(in_srgb,var(--accent-gold)_10%,transparent)] to-transparent opacity-60 blur-2xl"
      />

      {isMediaLoading ? (
        <VideoSkeleton />
      ) : (
      <div
        className="relative flex w-full max-w-[340px] flex-col justify-between overflow-hidden rounded-lg shadow-2xl"
        style={{ aspectRatio: "9 / 16" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: reels.posterUrl }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-transparent to-[color-mix(in_srgb,var(--bg-canvas)_70%,transparent)]" />

        <div className="relative z-10 flex w-full items-center justify-between p-3">
          <div className="flex items-center gap-1.5 rounded bg-[color-mix(in_srgb,var(--bg-canvas)_80%,transparent)] px-2 py-0.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {!reduceMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-gold)] opacity-60" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-gold)]" />
            </span>
            <span className="font-[family-name:var(--font-mono-jb)] text-[10px] tracking-wider text-[var(--accent-gold)]">
              SYNTH·AI 60fps
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase text-[var(--text-primary)]">
              1080×1920
            </span>
            <span className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--accent-blue-bright)]">
              ProRes
            </span>
          </div>
        </div>

        <KaraokeCaptions className="relative z-10 mb-8" />

        <div className="relative z-10 flex w-full flex-col gap-1.5 bg-gradient-to-t from-[var(--bg-canvas)] via-[color-mix(in_srgb,var(--bg-canvas)_90%,transparent)] to-transparent p-3">
          <div
            ref={scrubRef}
            role="slider"
            aria-label="Scrub timeline"
            aria-valuemin={0}
            aria-valuemax={reels.durationSec}
            aria-valuenow={Math.round(reels.currentTimeSec)}
            tabIndex={0}
            className="group/scrub relative h-1.5 w-full cursor-pointer rounded-full bg-[var(--bg-hover)]"
            onClick={(e) => scrubToClientX(e.clientX)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                setCurrentTime(reels.currentTimeSec + 1);
              } else if (e.key === "ArrowLeft") {
                setCurrentTime(reels.currentTimeSec - 1);
              }
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent-terracotta)]"
              style={{ width: `${progress}%` }}
            />
            <div
              className={cn(
                "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-gold)] shadow-md ring-2 ring-[var(--bg-canvas)]",
                "transition-transform group-hover/scrub:scale-125",
              )}
              style={{ left: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <ReactiveButton
                aria-label={reels.playing ? "Pause" : "Play"}
                onClick={togglePlay}
                className="h-8 w-8 !px-0"
              >
                {reels.playing ? (
                  <Pause className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={2} />
                )}
              </ReactiveButton>
              <button
                type="button"
                aria-label="Rewind 10 seconds"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                onClick={() => setCurrentTime(reels.currentTimeSec - 10)}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <div className="pl-1 font-[family-name:var(--font-mono-jb)] text-[11px]">
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatTimecode(reels.currentTimeSec)}
                </span>
                <span className="mx-1 text-[var(--text-mono)]">/</span>
                <span className="text-[var(--text-muted)]">
                  {formatTimecode(reels.durationSec)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
