"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { GenerationDrawer } from "@/components/studio/GenerationDrawer";
import { findStudioModule } from "@/components/studio/modules";
import { cn } from "@/lib/cn";
import { parseRefDraftId } from "@/lib/studio/capcut-gate";
import { findFeedPost } from "@/lib/studio/feed-fixtures";
import { useStudioStore } from "@/lib/studio-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const REF_ENTER = { type: "spring" as const, damping: 22, stiffness: 280 };
const DURATION_SEC = 12;

const MOCK_LAYERS = [
  { id: "v1", label: "Video · Hook", kind: "video", color: "#3b82f6" },
  { id: "a1", label: "Voice · Narration", kind: "audio", color: "#D4A359" },
  { id: "t1", label: "Title · Overlay", kind: "text", color: "#C86446" },
  { id: "m1", label: "Music · Bed", kind: "audio", color: "#64748b" },
] as const;

const MOCK_CLIPS = [
  { id: "c1", track: 0, start: 0, end: 0.28, label: "Hook" },
  { id: "c2", track: 0, start: 0.28, end: 0.62, label: "Body" },
  { id: "c3", track: 0, start: 0.62, end: 1, label: "CTA" },
  { id: "c4", track: 1, start: 0.05, end: 0.9, label: "VO" },
  { id: "c5", track: 2, start: 0.1, end: 0.45, label: "Title" },
  { id: "c6", track: 3, start: 0, end: 1, label: "Bed" },
] as const;

type CapCutEditorShellProps = {
  moduleId: string;
  draftId: string;
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 10);
  return `${m}:${String(s).padStart(2, "0")}.${f}`;
}

export function CapCutEditorShell({
  moduleId,
  draftId,
}: CapCutEditorShellProps) {
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const customModules = useStudioStore((s) => s.customModules);
  const hydrateCustomModules = useStudioStore((s) => s.hydrateCustomModules);
  const setSelectedModuleId = useStudioStore((s) => s.setSelectedModuleId);
  const topic = useStudioStore((s) => s.topic);
  const generateStatus = useStudioStore((s) => s.generateStatus);
  const progress = useStudioStore((s) => s.progress);
  const startGenerate = useStudioStore((s) => s.startGenerate);

  const mod = findStudioModule(moduleId, customModules);
  const [playhead, setPlayhead] = useState(0.18);
  const [playing, setPlaying] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState("v1");
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const referenceCompetitorId = useMemo(() => {
    const fromQuery = searchParams.get("ref")?.trim();
    if (fromQuery) return fromQuery;
    return parseRefDraftId(draftId);
  }, [searchParams, draftId]);

  const referencePost = useMemo(() => {
    if (!referenceCompetitorId) return null;
    return findFeedPost(moduleId, referenceCompetitorId);
  }, [moduleId, referenceCompetitorId]);

  const hasReference = Boolean(referenceCompetitorId);

  useEffect(() => {
    void hydrateCustomModules();
  }, [hydrateCustomModules]);

  useEffect(() => {
    setSelectedModuleId(moduleId);
  }, [moduleId, setSelectedModuleId]);

  const tick = useCallback((ts: number) => {
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;
    setPlayhead((p) => {
      const next = p + dt / DURATION_SEC;
      if (next >= 1) {
        setPlaying(false);
        return 1;
      }
      return next;
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!playing || reduceMotion) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, reduceMotion, tick]);

  const canGenerate = generateStatus !== "running";
  const currentSec = playhead * DURATION_SEC;

  return (
    <>
      <motion.div
        data-testid="capcut-editor"
        data-module-id={moduleId}
        data-draft-id={draftId}
        data-reference-id={referenceCompetitorId ?? undefined}
        className={cn(
          "relative -mx-6 -my-8 flex min-h-[calc(100vh-0px)] flex-col md:-mx-8",
          "bg-[#070809] text-[var(--text-primary)]",
        )}
        initial={
          reduceMotion
            ? false
            : hasReference
              ? { opacity: 0, y: 18, scale: 0.97 }
              : { opacity: 0, y: 14, scale: 0.985 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : hasReference ? REF_ENTER : SPRING
        }
      >
        {/* Top bar */}
        <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border-glass)] bg-[#0B0D10]/95 px-4 py-2.5 backdrop-blur-md">
          <Link
            href={`/studio/${encodeURIComponent(moduleId)}`}
            data-testid="editor-back"
            className={cn(
              "rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-1.5",
              "text-xs font-medium text-[var(--text-muted)]",
              "transition-colors hover:border-[var(--border-active)] hover:text-[var(--text-primary)]",
            )}
          >
            ← Workspace
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.14em] text-[var(--accent-blue-bright)]">
              CapCut shell · {mod?.label ?? moduleId}
            </p>
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {topic.trim() ||
                referencePost?.title ||
                "Untitled draft"}{" "}
              ·{" "}
              <span className="font-normal text-[var(--text-muted)]">
                {draftId}
              </span>
            </p>
          </div>
          {generateStatus === "running" ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent-blue-bright)]"
                  initial={false}
                  animate={{ width: `${Math.max(4, progress)}%` }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                />
              </div>
              <span className="font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-muted)]">
                {Math.round(progress)}%
              </span>
            </div>
          ) : null}
          <button
            type="button"
            data-testid="editor-generate"
            disabled={!canGenerate}
            onClick={() => startGenerate()}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold",
              "bg-[color-mix(in_srgb,var(--accent-blue)_22%,var(--bg-elevated))] text-[var(--text-primary)]",
              "border border-[color-mix(in_srgb,var(--accent-blue-bright)_35%,var(--border-glass))]",
              "shadow-[0_0_16px_rgba(37,99,235,0.15)]",
              "disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {generateStatus === "running" ? "Генерация…" : "Сгенерировать"}
          </button>
        </header>

        {/* Body: layers | preview */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside
            data-testid="editor-layers"
            className="flex w-full shrink-0 flex-col border-b border-[var(--border-glass)] bg-[#0A0C0F] lg:w-56 lg:border-b-0 lg:border-r"
          >
            <p className="border-b border-[var(--border-glass)] px-3 py-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.14em] text-[var(--text-mono)]">
              Layers / clips
            </p>
            <ul className="flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-visible">
              {MOCK_LAYERS.map((layer) => (
                <li key={layer.id} className="shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => setSelectedLayer(layer.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs",
                      selectedLayer === layer.id
                        ? "border-[color-mix(in_srgb,var(--accent-blue-bright)_40%,var(--border-glass))] bg-[rgba(37,99,235,0.12)] text-[var(--text-primary)]"
                        : "border-transparent text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.03)]",
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ background: layer.color }}
                      aria-hidden
                    />
                    <span className="truncate">{layer.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            {hasReference ? (
              <motion.div
                data-testid="editor-reference-panel"
                className="mt-auto border-t border-[var(--border-glass)] p-3"
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduceMotion ? { duration: 0 } : { ...SPRING, delay: 0.08 }
                }
              >
                <p className="mb-2 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.14em] text-[var(--accent-terracotta)]">
                  Reference · competitor
                </p>
                <div className="flex items-center gap-2">
                  {referencePost?.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={referencePost.thumbUrl}
                      alt=""
                      className="h-12 w-7 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-7 shrink-0 rounded bg-[rgba(255,255,255,0.06)]" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                      {referencePost?.title ?? referenceCompetitorId}
                    </p>
                    <p className="truncate font-[family-name:var(--font-mono-jb)] text-[9px] text-[var(--text-mono)]">
                      {referenceCompetitorId}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              data-testid="editor-preview"
              className="relative flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,#12151c_0%,#070809_70%)] p-6"
            >
              <motion.div
                className={cn(
                  "relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl",
                  "border border-[var(--border-glass)] bg-[#0D1014]",
                  "shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
                )}
                animate={
                  playing && !reduceMotion
                    ? {
                        boxShadow: [
                          "0 24px 64px rgba(0,0,0,0.55)",
                          "0 28px 72px rgba(37,99,235,0.12)",
                          "0 24px 64px rgba(0,0,0,0.55)",
                        ],
                      }
                    : undefined
                }
                transition={
                  playing && !reduceMotion
                    ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    : undefined
                }
              >
                {referencePost?.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={referencePost.thumbUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${135 + playhead * 40}deg, #1a2030 0%, #0c0e12 45%, #1e1820 100%)`,
                    }}
                  />
                )}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                {hasReference ? (
                  <motion.span
                    data-testid="editor-reference-badge"
                    className={cn(
                      "absolute left-2.5 top-2.5 z-10 rounded-md px-2 py-1",
                      "border border-[color-mix(in_srgb,var(--accent-terracotta)_40%,transparent)]",
                      "bg-[color-mix(in_srgb,var(--accent-terracotta)_22%,#0a0c0f)]",
                      "font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.12em]",
                      "text-[var(--accent-terracotta)]",
                    )}
                    initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { ...SPRING, delay: 0.12 }
                    }
                  >
                    Ref · competitor
                  </motion.span>
                ) : null}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-[0.16em] text-[var(--accent-gold)]">
                    Preview frame
                  </span>
                  <p className="text-lg font-semibold leading-snug text-white/90">
                    {topic.trim() ||
                      referencePost?.title ||
                      "Draft canvas"}
                  </p>
                  <p className="font-[family-name:var(--font-mono-jb)] text-[11px] text-white/45">
                    {formatTime(currentSec)} / {formatTime(DURATION_SEC)}
                  </p>
                </div>
                {/* Bracket chrome */}
                <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-white/25" />
                <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r border-t border-white/25" />
                <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b border-l border-white/25" />
                <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-white/25" />
              </motion.div>
            </div>

            {/* Timeline */}
            <div
              data-testid="editor-timeline"
              className="shrink-0 border-t border-[var(--border-glass)] bg-[#0B0D10] px-3 pb-3 pt-2"
            >
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  data-testid="editor-play"
                  onClick={() => {
                    if (playhead >= 1) setPlayhead(0);
                    setPlaying((p) => !p);
                  }}
                  className={cn(
                    "rounded-md border border-[var(--border-glass)] bg-[var(--bg-card)] px-3 py-1",
                    "font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-primary)]",
                    "hover:border-[var(--border-active)]",
                  )}
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <span className="font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)]">
                  {formatTime(currentSec)}
                </span>
                <span className="ml-auto font-[family-name:var(--font-mono-jb)] text-[10px] text-[var(--text-mono)]">
                  Mock tracks · not Remotion NLE
                </span>
              </div>

              <div
                className="relative h-[7.5rem] overflow-hidden rounded-lg border border-[var(--border-glass)] bg-[#08090A]"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  setPlayhead(Math.min(1, Math.max(0, x)));
                  setPlaying(false);
                }}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(playhead * 100)}
                aria-label="Timeline scrubber"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    setPlayhead((p) => Math.min(1, p + 0.02));
                    setPlaying(false);
                  }
                  if (e.key === "ArrowLeft") {
                    setPlayhead((p) => Math.max(0, p - 0.02));
                    setPlaying(false);
                  }
                }}
              >
                {/* Track lanes */}
                {MOCK_LAYERS.map((layer, track) => (
                  <div
                    key={layer.id}
                    className="absolute left-0 right-0 border-b border-white/[0.04]"
                    style={{ top: `${track * 25}%`, height: "25%" }}
                  >
                    {MOCK_CLIPS.filter((c) => c.track === track).map((clip) => (
                      <div
                        key={clip.id}
                        className="absolute top-1 bottom-1 overflow-hidden rounded-sm opacity-90"
                        style={{
                          left: `${clip.start * 100}%`,
                          width: `${(clip.end - clip.start) * 100}%`,
                          background: `color-mix(in srgb, ${layer.color} 55%, #0a0c0f)`,
                          border: `1px solid color-mix(in srgb, ${layer.color} 40%, transparent)`,
                        }}
                      >
                        <span className="px-1.5 text-[9px] text-white/80">
                          {clip.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Playhead */}
                <motion.div
                  data-testid="editor-playhead"
                  className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[var(--accent-gold)]"
                  style={{ left: `${playhead * 100}%` }}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          boxShadow: playing
                            ? [
                                "0 0 0 0 rgba(212,163,89,0)",
                                "0 0 12px 1px rgba(212,163,89,0.55)",
                                "0 0 0 0 rgba(212,163,89,0)",
                              ]
                            : "0 0 8px rgba(212,163,89,0.35)",
                        }
                  }
                  transition={
                    playing && !reduceMotion
                      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                >
                  <span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-[var(--accent-gold)] shadow-[0_0_10px_rgba(212,163,89,0.6)]" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <GenerationDrawer />
    </>
  );
}
