"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  /** C-82 — disable stock grey hover lift/rect (e.g. Studio tiles own hover). */
  disableHoverMotion?: boolean;
};

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function GlassCard({
  children,
  className,
  disableHoverMotion = false,
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card)] p-5 backdrop-blur-md",
        "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        className,
      )}
      whileHover={
        disableHoverMotion || reduceMotion
          ? undefined
          : {
              y: -3,
              boxShadow: "0 14px 40px rgba(0,0,0,0.42)",
            }
      }
      transition={SPRING}
    >
      {children}
    </motion.div>
  );
}
