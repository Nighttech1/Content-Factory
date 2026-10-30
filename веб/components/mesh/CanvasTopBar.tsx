"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  MESH_PIPELINE_LABELS,
  isMeshPipelineId,
  type MeshPipelineId,
} from "@/lib/mesh-roles";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

export function meshTeamScreenTitle(pipelineId: string): string {
  const label = isMeshPipelineId(pipelineId)
    ? MESH_PIPELINE_LABELS[pipelineId]
    : pipelineId;
  return `Команда выпуска: ${label}`;
}

type CanvasTopBarProps = {
  /** Current Studio module / mesh pipeline — drives visible title (C-147). */
  pipelineId: MeshPipelineId | string;
};

/**
 * C-141 / C-147 — title + subtitle only (no Copy TZ / MultiButton / pipeline switcher).
 * Title includes module name from MESH_PIPELINE_LABELS.
 */
export function CanvasTopBar({ pipelineId }: CanvasTopBarProps) {
  const reduceMotion = useReducedMotion();
  const title = meshTeamScreenTitle(pipelineId);

  return (
    <motion.header
      data-testid="mesh-topbar"
      className="relative z-20 flex flex-shrink-0 items-center gap-4 border-b border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_95%,transparent)] px-6 py-4 backdrop-blur-md md:px-8"
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
    >
      <div className="min-w-0">
        <h1
          data-testid="mesh-screen-title"
          className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl"
        >
          {title}
        </h1>
        <p
          data-testid="mesh-screen-subtitle"
          className="mt-0.5 max-w-2xl text-xs text-[var(--text-muted)] md:text-sm"
        >
          Пайплайн создания и публикации контента. Кликните на любого агента для
          детальной настройки.
        </p>
      </div>
    </motion.header>
  );
}
