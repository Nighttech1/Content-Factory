"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  MessageCircle,
  Network,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { NeonBadge, type NeonBadgeTone } from "@/components/ui/NeonBadge";
import { cn } from "@/lib/cn";
import type { AnalystInsight, InsightTone } from "@/lib/analytics-mock";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

/** Map insight tone → NeonBadge (green → gold per architect contract) */
export function insightBadgeTone(tone: InsightTone): NeonBadgeTone {
  if (tone === "green" || tone === "gold") return "gold";
  if (tone === "blue") return "blue";
  return "terracotta";
}

const FOOTER_ICON: Record<InsightTone, LucideIcon> = {
  green: TrendingUp,
  gold: Network,
  blue: MessageCircle,
  terracotta: CalendarClock,
};

const ACCENT_BORDER: Record<InsightTone, string> = {
  green: "border-l-[var(--accent-gold)]",
  gold: "border-l-[var(--accent-gold)]",
  blue: "border-l-[var(--accent-blue)]",
  terracotta: "border-l-[var(--accent-terracotta)]",
};

type InsightCardProps = {
  insight: AnalystInsight;
  className?: string;
};

/** List-item root so InsightsFeed staggerChildren hits this node directly. */
export function InsightCard({ insight, className }: InsightCardProps) {
  const reduceMotion = useReducedMotion();
  const tone = insightBadgeTone(insight.tone);
  const FooterIcon = FOOTER_ICON[insight.tone];

  const cardVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 10, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
  };

  return (
    <motion.li
      className={cn(
        "flex list-none flex-col gap-2.5 rounded-lg border border-[var(--border-glass)]",
        "border-l-[3px] bg-[var(--bg-elevated)] px-3.5 py-3",
        ACCENT_BORDER[insight.tone],
        className,
      )}
      variants={cardVariants}
    >
      <div className="flex flex-wrap items-center gap-2">
        <NeonBadge tone={tone} label={insight.badge} />
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {insight.targetLabel}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[var(--text-primary)]">
        {insight.body}
      </p>

      <footer className="mt-0.5 flex items-center gap-2 border-t border-[var(--border-glass)] pt-2">
        <FooterIcon
          className="h-3.5 w-3.5 shrink-0 text-[var(--text-mono)]"
          aria-hidden
        />
        <span className="font-[family-name:var(--font-mono-jb)] text-[10px] tracking-wide text-[var(--text-mono)]">
          {insight.footer}
        </span>
      </footer>
    </motion.li>
  );
}
