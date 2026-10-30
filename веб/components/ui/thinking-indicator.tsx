"use client";

/**
 * C-155 D5 — ThinkingIndicator: shimmer label left + 3×3 cubes assemble loop.
 */

import { useReducedMotion, motion } from "framer-motion";
import { cn } from "@/lib/cn";

const CUBE_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

type ThinkingIndicatorProps = {
  className?: string;
  label?: string;
};

export function ThinkingIndicator({
  className,
  label = "Thinking...",
}: ThinkingIndicatorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      data-testid="thinking-indicator"
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-start gap-3 px-1 py-1.5",
        className,
      )}
    >
      {reduceMotion ? (
        <span className="text-sm text-[var(--text-muted)]">{label}</span>
      ) : (
        <motion.span
          className={cn(
            "text-sm font-medium",
            "bg-[linear-gradient(90deg,var(--text-muted)_0%,var(--text-primary)_35%,var(--accent-gold)_50%,var(--text-primary)_65%,var(--text-muted)_100%)]",
            "bg-[length:200%_100%] bg-clip-text text-transparent",
          )}
          animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        >
          {label}
        </motion.span>
      )}

      <div
        className="grid h-7 w-7 grid-cols-3 grid-rows-3 gap-[2px]"
        aria-hidden
      >
        {CUBE_ORDER.map((i) =>
          reduceMotion ? (
            <span
              key={i}
              className="rounded-[2px] bg-[color-mix(in_srgb,var(--accent-gold)_55%,var(--bg-elevated))]"
            />
          ) : (
            <motion.span
              key={i}
              className="rounded-[2px] bg-[color-mix(in_srgb,var(--accent-gold)_70%,transparent)]"
              initial={{ opacity: 0.25, scale: 0.55 }}
              animate={{
                opacity: [0.25, 1, 0.25],
                scale: [0.55, 1, 0.55],
              }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.08,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}
