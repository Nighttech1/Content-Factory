"use client";

import { BookOpen, Clapperboard } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useInspectStore } from "@/lib/inspect-store";
import type { PreviewMode } from "@/lib/inspect-mock";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const MODES: {
  id: PreviewMode;
  label: string;
  badge: string;
  icon: typeof Clapperboard;
}[] = [
  {
    id: "reels_9_16",
    label: "Video Reel Preview",
    badge: "9:16",
    icon: Clapperboard,
  },
  {
    id: "carousel_4_5",
    label: "Carousel Deck",
    badge: "8 Slides",
    icon: BookOpen,
  },
];

export function PreviewModeToggle() {
  const previewMode = useInspectStore((s) => s.previewMode);
  const setPreviewMode = useInspectStore((s) => s.setPreviewMode);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-glass)] bg-[var(--bg-elevated)] p-1">
      <div className="flex flex-wrap items-center gap-1">
        {MODES.map((mode) => {
          const active = previewMode === mode.id;
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => setPreviewMode(mode.id)}
              aria-pressed={active}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                active
                  ? "font-semibold text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              )}
              whileHover={
                reduceMotion || active ? undefined : { opacity: 0.92 }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={SPRING}
            >
              {active && (
                <motion.span
                  layoutId={reduceMotion ? undefined : "preview-mode-pill"}
                  className="absolute inset-0 rounded-lg bg-[color-mix(in_srgb,var(--accent-terracotta)_28%,var(--bg-elevated))] shadow-[0_0_12px_rgba(200,100,70,0.22)]"
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  aria-hidden
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">{mode.label}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-[family-name:var(--font-mono-jb)] text-[10px]",
                    active
                      ? "bg-[var(--accent-terracotta)] text-[var(--bg-canvas)]"
                      : "bg-[var(--bg-hover)] text-[var(--text-muted)]",
                  )}
                >
                  {mode.badge}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
