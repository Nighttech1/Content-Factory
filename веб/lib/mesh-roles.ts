/**
 * C-137 — Settings-safe mesh roles / pipeline ids (extracted from legacy mesh-seed).
 * No xyflow coords / PulseEdge clutter here.
 */

export type AgentRoleKind =
  | "user"
  | "scout"
  | "analyst"
  | "trainer"
  | "release";

export type LaneAMode = "user-script" | "user-razbor-script";

/** Canonical Studio content types — one flowchart each (C-53 / C-136). */
export const MESH_PIPELINE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
  "site-articles",
  "tg-articles",
  "custom-reels",
  "custom-clips-to-reels",
  "custom-info-video",
] as const;

export type MeshPipelineId = (typeof MESH_PIPELINE_IDS)[number];

export const MESH_PIPELINE_LABELS: Record<MeshPipelineId, string> = {
  "carousel-engine": "Карусели Instagram",
  "aesthetic-graphics": "Полезные картинки & Инфографика",
  "cartoon-reels": "Мульт-Reels (2D сторителлинг)",
  "heygen-reels": "HeyGen AI-Аватар Reels",
  "site-articles": "Статьи на сайт",
  "tg-articles": "Статьи в TG",
  "custom-reels": "Рилс",
  "custom-clips-to-reels": "Нарезки с видео в рилсы",
  "custom-info-video": "Информационное видео",
};

/** C-105 — separate copywriter pack id per content type. */
export function copywriterPackId(pipelineId: MeshPipelineId): string {
  return `copywriter-${pipelineId}`;
}

export function isMeshPipelineId(id: string): id is MeshPipelineId {
  return (MESH_PIPELINE_IDS as readonly string[]).includes(id);
}

/** C-125 — Razbor cascade in Lane A (User → Разборщик → …). */
export function laneAModeFor(pipelineId: MeshPipelineId): LaneAMode {
  if (pipelineId === "carousel-engine") return "user-razbor-script";
  return "user-script";
}
