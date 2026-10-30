"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type ReactiveButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: React.ReactNode;
};

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

const BORDER_IDLE = "1px solid var(--border-glass)";
const BORDER_ACTIVE =
  "1px solid color-mix(in srgb, var(--accent-blue-bright) 70%, transparent)";

export function ReactiveButton({
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: ReactiveButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={
        disabled || reduceMotion
          ? undefined
          : {
              scale: 0.97,
              border: BORDER_ACTIVE,
              boxShadow:
                "0 0 0 1px rgba(59,130,246,0.45), 0 0 14px rgba(37,99,235,0.22)",
            }
      }
      whileHover={
        disabled || reduceMotion
          ? undefined
          : {
              border: BORDER_ACTIVE,
              boxShadow:
                "0 0 0 1px rgba(59,130,246,0.55), 0 0 18px rgba(37,99,235,0.25)",
            }
      }
      transition={SPRING}
      style={{ border: BORDER_IDLE }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg",
        "bg-[color-mix(in_srgb,var(--accent-blue)_16%,var(--bg-elevated))] px-4 py-2.5",
        "text-sm font-semibold text-[var(--text-primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
