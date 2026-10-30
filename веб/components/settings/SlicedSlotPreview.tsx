"use client";

/**
 * C-design-slot-sliced-preview — interactive 3×4:5 CSS mocks (cover / body / cta).
 * Driven by DesignPresetFile colors + cssVarOverrides. NOT panorama-only.
 * 21st id=5402 Color Palette Card (hover expand) · Vernatun tokens.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import {
  createDefaultVernatunPreset,
  designPresetToCssVars,
  resolveSlotPresetFile,
  type DesignLibrarySlot,
  type DesignPresetFile,
} from "@/lib/settings/design-library";
import type { CarouselSlideRole } from "@/types/design";

const FRAMES: Array<{ role: CarouselSlideRole; label: string }> = [
  { role: "cover", label: "cover" },
  { role: "body_slide", label: "body" },
  { role: "cta_slide", label: "cta" },
];

export type SlicedSlotPreviewProps = {
  slot: DesignLibrarySlot;
  /** Compact strip inside Embla; denser padding. */
  compact?: boolean;
  className?: string;
  /** Optional click on a frame (opens Tuner). */
  onFrameActivate?: () => void;
};

function resolvePreset(slot: DesignLibrarySlot): DesignPresetFile {
  return (
    resolveSlotPresetFile(slot) ??
    slot.presetFile ??
    createDefaultVernatunPreset(slot.name || "Vernatun Design")
  );
}

function cssVarsStyle(preset: DesignPresetFile): CSSProperties {
  const vars = designPresetToCssVars(preset);
  return vars as CSSProperties;
}

function FrameMock({
  role,
  label,
  preset,
  compact,
}: {
  role: CarouselSlideRole;
  label: string;
  preset: DesignPresetFile;
  compact?: boolean;
}) {
  const glass = preset.components.card?.glass;
  const marker = Boolean(preset.components.markerHighlight);
  const doodle = preset.components.doodle?.enabled;
  const darkNotes = preset.preset === "dark_notes";
  const bento = preset.preset === "bento_glass" || glass;

  return (
    <div
      className={cn(
        "relative flex aspect-[4/5] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--cf-design-accent)_28%,transparent)]",
        "bg-[var(--cf-design-bg)] text-[var(--cf-design-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
      )}
      data-testid={`sliced-frame-${role}`}
      data-role={role}
    >
      {/* chalk grid / atmosphere */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          darkNotes ? "opacity-[0.5]" : "opacity-[0.28]",
        )}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: darkNotes ? "10px 10px" : "14px 14px",
        }}
      />
      {bento ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--cf-design-accent) 35%, transparent), transparent 70%)",
          }}
        />
      ) : null}

      <div
        className={cn(
          "relative z-[1] flex flex-1 flex-col",
          compact ? "gap-1 p-1.5" : "gap-1.5 p-2",
        )}
      >
        <span className="font-[family-name:var(--font-mono-jb)] text-[7px] uppercase tracking-wider text-[var(--cf-design-muted)]">
          {label}
        </span>

        {role === "cover" ? (
          <>
            {bento && !darkNotes ? (
              <span className="inline-flex w-fit rounded-full border border-white/15 px-1.5 py-0.5 text-[6px] uppercase tracking-wide text-[var(--cf-design-muted)]">
                01 / hook
              </span>
            ) : null}
            <div
              className={cn(
                "mt-0.5 w-[92%] font-bold leading-tight",
                compact ? "text-[8px]" : "text-[10px]",
                marker || darkNotes
                  ? "rounded-[2px] bg-[var(--cf-design-accent)] px-1 py-0.5 text-[var(--cf-design-bg)] shadow-[1px_1px_0_rgba(0,0,0,0.35)]"
                  : "text-[var(--cf-design-text)]",
              )}
            >
              {darkNotes ? "ՍՈՒՐՃԻ ԴՈԿՏՐԻՆԱ" : "Coffee Doctrine"}
            </div>
            <p
              className={cn(
                "text-[var(--cf-design-muted)]",
                compact ? "text-[6px] leading-snug" : "text-[7px] leading-snug",
              )}
            >
              Кофе на бегу — капитуляция
            </p>
            {doodle || darkNotes ? (
              <div className="mt-auto flex items-end justify-between gap-1">
                <div className="flex flex-col gap-0.5">
                  <span className="inline-flex h-2.5 w-2.5 rounded-[1px] border border-[var(--cf-design-text)]" />
                  <span className="inline-flex h-2.5 w-2.5 rounded-[1px] border border-[var(--cf-design-muted)]" />
                </div>
                <svg
                  aria-hidden
                  className="h-7 w-6 text-[var(--cf-design-text)] opacity-80"
                  viewBox="0 0 32 40"
                  fill="none"
                >
                  <path
                    d="M8 14h12l-1.5 18H9.5z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M10 8c1-4 3-5 4-2M16 7c1-4 3-5 4-1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  aria-hidden
                  className="h-4 w-8 text-[var(--cf-design-accent)]"
                  viewBox="0 0 40 16"
                  fill="none"
                >
                  <path
                    d="M2 10c8-8 18-8 28 0"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M26 4l10 6-10 4"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : bento ? (
              <div
                className="mt-auto h-10 w-full rounded-md border border-white/15 bg-[var(--cf-design-surface)]"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <div className="flex h-full items-center justify-center opacity-70">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 8h9v10H6zM15 10h3a2 2 0 010 4h-3"
                      stroke="white"
                      strokeWidth="1.4"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="mt-auto h-1.5 w-10 rounded-full bg-[var(--cf-design-accent)] opacity-80" />
            )}
          </>
        ) : null}

        {role === "body_slide" ? (
          <>
            {bento && !darkNotes ? (
              <span className="inline-flex w-fit rounded-full border border-white/15 px-1.5 py-0.5 text-[6px] uppercase tracking-wide text-[var(--cf-design-muted)]">
                02 / paradox
              </span>
            ) : null}
            <div
              className={cn(
                "mt-0.5 font-bold leading-tight",
                compact ? "text-[8px]" : "text-[9px]",
                darkNotes
                  ? "w-fit rounded-[2px] bg-[var(--cf-design-accent)] px-1 py-0.5 text-[var(--cf-design-bg)]"
                  : undefined,
              )}
            >
              {darkNotes ? "1. Ռիտուալը" : "Pulse · 00:45"}
            </div>
            <p
              className={cn(
                "text-[var(--cf-design-muted)]",
                compact ? "text-[6px] leading-snug" : "text-[7px] leading-snug",
              )}
            >
              {darkNotes ? "паузы в реальности" : "Telemetry bento"}
            </p>
            {bento && !darkNotes ? (
              <div className="mt-auto grid grid-cols-2 gap-0.5">
                <div
                  className="rounded border border-[color-mix(in_srgb,var(--cf-design-accent)_45%,transparent)] bg-[var(--cf-design-surface)] px-1 py-1"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  <div className="text-[7px] font-semibold tabular-nums text-[var(--cf-design-accent)]">
                    00:45
                  </div>
                  <div className="text-[5px] text-[var(--cf-design-muted)]">
                    ritual
                  </div>
                </div>
                <div
                  className="rounded border border-white/12 bg-[var(--cf-design-surface)] px-1 py-1"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  <div className="text-[7px] font-semibold tabular-nums">
                    00:03
                  </div>
                  <div className="text-[5px] text-[var(--cf-design-muted)]">
                    rush
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto flex items-center gap-1">
                <span className="inline-flex h-3 w-3 items-center justify-center rounded-[2px] border border-[var(--cf-design-text)] text-[6px]">
                  ✕
                </span>
                <span
                  className={cn(
                    "text-[var(--cf-design-muted)]",
                    compact ? "text-[5px]" : "text-[6px]",
                  )}
                >
                  пауза
                </span>
                <svg
                  aria-hidden
                  className="ml-auto h-3 w-6 text-[var(--cf-design-accent)]"
                  viewBox="0 0 32 12"
                  fill="none"
                >
                  <path
                    d="M2 8c6-6 14-6 22 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </>
        ) : null}

        {role === "cta_slide" ? (
          <>
            <p
              className={cn(
                "mt-0.5 font-bold leading-tight",
                compact ? "text-[7px]" : "text-[9px]",
              )}
            >
              {darkNotes ? "Готов замедлиться?" : "Сохранить ритуал"}
            </p>
            <div
              className={cn(
                "mt-auto flex items-center justify-center gap-1 rounded-md font-bold text-[var(--cf-design-bg)]",
                compact ? "h-5 text-[7px]" : "h-6 text-[8px]",
              )}
              style={{
                background: "var(--cf-design-accent)",
                boxShadow: preset.components.buttonCta?.glow
                  ? "0 0 16px color-mix(in srgb, var(--cf-design-accent) 55%, transparent)"
                  : undefined,
                borderRadius: preset.components.buttonCta?.radius ?? "8px",
              }}
            >
              CTA
            </div>
            <div className="flex items-center justify-end gap-1">
              <svg
                aria-hidden
                className="h-4 w-3.5"
                viewBox="0 0 20 24"
                fill="none"
              >
                <path
                  d="M10 3c1-2 3-2 4 0-1 1-2 3-1 4"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <path
                  d="M10 7c-4 1-6 5-5 9s5 6 8 5 5-5 4-8c-1-3-4-6-7-6z"
                  fill="#B91C1C"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              <span className="text-[6px] font-bold tracking-wider text-[var(--cf-design-text)]">
                VERNATUN
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Triple 4:5 sliced preview for a design library slot.
 */
export function SlicedSlotPreview({
  slot,
  compact = true,
  className,
  onFrameActivate,
}: SlicedSlotPreviewProps) {
  const reduceMotion = useReducedMotion();
  const preset = resolvePreset(slot);
  const style = cssVarsStyle(preset);

  return (
    <motion.div
      role={onFrameActivate ? "button" : undefined}
      tabIndex={onFrameActivate ? 0 : undefined}
      onClick={onFrameActivate}
      onKeyDown={
        onFrameActivate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFrameActivate();
              }
            }
          : undefined
      }
      className={cn(
        "flex w-full gap-1.5 outline-none",
        onFrameActivate ? "cursor-pointer" : undefined,
        className,
      )}
      style={style}
      data-testid="sliced-slot-preview"
      data-preset={preset.preset}
      initial={false}
      whileHover={
        reduceMotion || !onFrameActivate ? undefined : { scale: 1.01 }
      }
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {FRAMES.map((f) => (
        <FrameMock
          key={f.role}
          role={f.role}
          label={f.label}
          preset={preset}
          compact={compact}
        />
      ))}
    </motion.div>
  );
}
