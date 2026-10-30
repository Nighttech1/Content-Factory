"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export type NeonBadgeTone =
  | "blue"
  | "cobalt"
  | "gold"
  | "terracotta"
  | "neutral"
  | "muted";

type NeonBadgeProps = {
  children?: React.ReactNode;
  label?: string;
  tone?: NeonBadgeTone;
  className?: string;
};

const TONE_STYLES: Record<NeonBadgeTone, string> = {
  blue: "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)] text-[var(--accent-blue-bright)]",
  cobalt:
    "bg-[color-mix(in_srgb,var(--accent-blue)_18%,transparent)] text-[var(--accent-blue-bright)]",
  gold: "bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)] text-[var(--accent-gold)]",
  terracotta:
    "bg-[color-mix(in_srgb,var(--accent-terracotta)_18%,transparent)] text-[var(--accent-terracotta)]",
  neutral: "bg-[var(--bg-hover)] text-[var(--text-muted)]",
  muted: "bg-[var(--bg-hover)] text-[var(--text-muted)]",
};

const GLOW: Record<NeonBadgeTone, [string, string]> = {
  blue: [
    "0 0 10px rgba(37,99,235,0.28)",
    "0 0 18px rgba(37,99,235,0.48)",
  ],
  cobalt: [
    "0 0 10px rgba(37,99,235,0.28)",
    "0 0 18px rgba(37,99,235,0.48)",
  ],
  gold: [
    "0 0 10px rgba(212,163,89,0.28)",
    "0 0 18px rgba(212,163,89,0.48)",
  ],
  terracotta: [
    "0 0 10px rgba(200,100,70,0.28)",
    "0 0 18px rgba(200,100,70,0.48)",
  ],
  neutral: [
    "0 0 8px rgba(255,255,255,0.04)",
    "0 0 14px rgba(255,255,255,0.1)",
  ],
  muted: [
    "0 0 8px rgba(255,255,255,0.04)",
    "0 0 14px rgba(255,255,255,0.1)",
  ],
};

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function NeonBadge({
  children,
  label,
  tone = "blue",
  className,
}: NeonBadgeProps) {
  const reduceMotion = useReducedMotion();
  const [glowSoft, glowBright] = GLOW[tone];

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 font-[family-name:var(--font-mono-jb)] text-[11px] font-medium tracking-wide",
        TONE_STYLES[tone],
        className,
      )}
      style={{ boxShadow: glowSoft }}
      animate={
        reduceMotion
          ? { boxShadow: glowSoft }
          : {
              boxShadow: [glowSoft, glowBright, glowSoft],
              scale: [1, 1.02, 1],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              ...SPRING,
              boxShadow: {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }
      }
    >
      {children ?? label}
    </motion.span>
  );
}
