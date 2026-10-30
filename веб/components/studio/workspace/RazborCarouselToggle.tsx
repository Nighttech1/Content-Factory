"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const INSTANT = { duration: 0 };

export type RazborCarouselSide = "competitor" | "ours";

type RazborCarouselToggleProps = {
  value: RazborCarouselSide;
  onChange: (side: RazborCarouselSide) => void;
  /** C-62: «Наши» grey + disabled until our draft/slides exist */
  oursEnabled?: boolean;
};

export function RazborCarouselToggle({
  value,
  onChange,
  oursEnabled = false,
}: RazborCarouselToggleProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      data-testid="razbor-carousel-toggle"
      className="relative mb-0 inline-flex rounded-full border border-[var(--border-glass)] bg-[rgba(255,255,255,0.03)] p-0.5"
      role="tablist"
      aria-label="Карусель"
    >
      {(["competitor", "ours"] as const).map((side) => {
        const active = value === side;
        const blocked = side === "ours" && !oursEnabled;
        return (
          <button
            key={side}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={blocked || undefined}
            disabled={blocked}
            data-testid={`razbor-carousel-toggle-${side}`}
            onClick={() => {
              if (blocked) return;
              onChange(side);
            }}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5 text-xs font-medium",
              blocked && "cursor-not-allowed",
              blocked
                ? "text-[var(--text-mono)] opacity-55"
                : active
                  ? "text-white"
                  : "text-[var(--text-muted)]",
            )}
          >
            {active && !blocked && !reduceMotion ? (
              <motion.span
                layoutId="razbor-carousel-toggle-pill"
                className="absolute inset-0 -z-0 rounded-full bg-[var(--accent-gold)]"
                transition={SPRING}
              />
            ) : active && !blocked ? (
              <span className="absolute inset-0 -z-0 rounded-full bg-[var(--accent-gold)]" />
            ) : null}
            <span
              className={cn(
                "relative z-10",
                active && !blocked && "text-white",
              )}
            >
              {side === "competitor" ? "Конкуренты" : "Наши"}
            </span>
          </button>
        );
      })}
      {reduceMotion ? null : (
        <motion.span className="sr-only" transition={INSTANT} />
      )}
    </div>
  );
}
