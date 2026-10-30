"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonBadge } from "@/components/ui/NeonBadge";
import { ViralityMeter } from "@/components/inspect/ViralityMeter";
import { HookAlternatives } from "@/components/inspect/HookAlternatives";
import { ScriptEditor } from "@/components/inspect/ScriptEditor";
import { HeyGenPersonaSwitcher } from "@/components/inspect/HeyGenPersonaSwitcher";
import { useInspectStore } from "@/lib/inspect-store";
import type { InspectStatus } from "@/lib/inspect-mock";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

function statusLabel(status: InspectStatus): string {
  switch (status) {
    case "awaiting_signoff":
      return "Ждёт подтверждения";
    case "approved":
      return "Утверждено";
    case "scheduled":
      return "В слоте";
    default:
      return status;
  }
}

function statusTone(
  status: InspectStatus,
): "gold" | "cobalt" | "terracotta" | "muted" {
  switch (status) {
    case "awaiting_signoff":
      return "gold";
    case "approved":
      return "cobalt";
    case "scheduled":
      return "terracotta";
    default:
      return "muted";
  }
}

export function InspectControlPanel() {
  const reduceMotion = useReducedMotion();
  const jobLabel = useInspectStore((s) => s.jobLabel);
  const status = useInspectStore((s) => s.status);
  const pipelineName = useInspectStore((s) => s.pipelineName);

  const panelVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 10, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={panelVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={cardVariants}>
        <GlassCard className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-[family-name:var(--font-mono-jb)] text-sm font-semibold text-[var(--accent-terracotta)]">
                {jobLabel}
              </span>
              <NeonBadge
                tone={statusTone(status)}
                className="gap-1.5 px-2 py-0.5 text-[11px]"
              >
                <span
                  className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                  aria-hidden
                />
                {statusLabel(status)}
              </NeonBadge>
            </div>
            <span className="truncate font-[family-name:var(--font-mono-jb)] text-[11px] text-[var(--text-muted)]">
              {pipelineName}
            </span>
          </div>

          <ViralityMeter />
        </GlassCard>
      </motion.div>

      <motion.div variants={cardVariants}>
        <GlassCard className="flex flex-col gap-2 p-4">
          <HookAlternatives />
        </GlassCard>
      </motion.div>

      <motion.div variants={cardVariants}>
        <GlassCard className="flex flex-col gap-2 p-4">
          <ScriptEditor />
        </GlassCard>
      </motion.div>

      <motion.div variants={cardVariants}>
        <GlassCard className="flex flex-col gap-2 p-4">
          <HeyGenPersonaSwitcher />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
