"use client";

import { useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type GlowButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: React.ReactNode;
};

/**
 * C-61 — adapted from 21st `@waleedkibhen/components/glow-button`
 * (MCP search/get_component unavailable; pattern from 21st.dev page).
 * Tokens: Cobalt / Gold Dark Luxury. Import `framer-motion`, not `motion/react`.
 */
export function GlowButton({
  children,
  className,
  disabled,
  type = "button",
  onHoverStart,
  onHoverEnd,
  ...rest
}: GlowButtonProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled || reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.97 }}
      transition={SPRING}
      onHoverStart={(e, info) => {
        setHovered(true);
        onHoverStart?.(e, info);
      }}
      onHoverEnd={(e, info) => {
        setHovered(false);
        onHoverEnd?.(e, info);
      }}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        "px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)]",
        "bg-[color-mix(in_srgb,var(--accent-blue)_20%,var(--bg-elevated))]",
        "shadow-[0_0_18px_rgba(37,99,235,0.28),0_0_32px_rgba(212,163,89,0.14)]",
        "ring-1 ring-[color-mix(in_srgb,var(--accent-blue-bright)_42%,transparent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-xl bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.38),rgba(212,163,89,0.14)_48%,transparent_72%)] opacity-80 blur-md"
      />
      {!reduceMotion ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/22 to-transparent"
          initial={false}
          animate={
            hovered
              ? { x: ["-140%", "280%"], opacity: [0, 1, 0] }
              : { x: "-140%", opacity: 0 }
          }
          transition={
            hovered
              ? { duration: 0.7, ease: "easeOut" }
              : { duration: 0.15 }
          }
        />
      ) : null}
      <span className="relative z-[1]">{children}</span>
    </motion.button>
  );
}
