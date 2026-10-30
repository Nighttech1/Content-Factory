/**
 * Studio module tiles — manifests only (`@/modules/manifests`).
 * Do NOT import `@/modules/registry` here: adapters pull Node `fs` (brand-context).
 * Canonical ids only (`carousel-engine`, …). Legacy aliases normalize in the store.
 */

import { listManifests } from "@/modules/manifests";
import type { CanonicalModuleId } from "@/modules/id-map";
import type {
  ContentModuleManifest,
  ModuleOutputFormat,
} from "@/types/module";

/** Re-export for Studio consumers that need raw manifests (client-safe). */
export { listManifests } from "@/modules/manifests";

/** Canonical SDK ids used by Studio selection (post C-19). */
export type StudioModuleId = CanonicalModuleId;

export type StudioModule = {
  id: string;
  label: string;
  description: string;
  badge: string;
  /** Lucide key from manifest (UI-only; tiles may ignore for now). */
  icon: string;
};

/** UI-only badge polish keyed by canonical id; fallback = outputFormat. */
const BADGE_BY_CANONICAL_ID: Readonly<Record<string, string>> = {
  "carousel-engine": "4:5 · PNG",
  "aesthetic-graphics": "Bilingual",
  "cartoon-reels": "9:16 · 2D",
  "heygen-reels": "HeyGen",
  "site-articles": "Сайт",
  "tg-articles": "TG",
};

const BADGE_BY_FORMAT: Readonly<Record<ModuleOutputFormat, string>> = {
  carousel_4_5: "4:5",
  video_9_16: "9:16",
  single_image: "Image",
};

/** Fields needed to render a Studio tile (core or custom). */
export type StudioManifestLike = Pick<
  ContentModuleManifest,
  "id" | "title" | "description" | "outputFormat" | "icon"
>;

/** Map a registry / API manifest → Studio tile view-model. */
export function manifestToStudioModule(
  manifest: StudioManifestLike,
): StudioModule {
  return {
    id: manifest.id,
    label: manifest.title,
    description: manifest.description,
    badge:
      BADGE_BY_CANONICAL_ID[manifest.id] ??
      BADGE_BY_FORMAT[manifest.outputFormat] ??
      manifest.icon,
    icon: manifest.icon,
  };
}

/** Core tiles for ModuleSelectorGrid — from client-safe manifests only. */
export const STUDIO_MODULES: StudioModule[] =
  listManifests().map(manifestToStudioModule);

/** Merge core + custom without duplicating ids (core wins on collision). */
export function mergeStudioModules(
  custom: StudioModule[],
): StudioModule[] {
  const coreIds = new Set(STUDIO_MODULES.map((m) => m.id));
  const extras = custom.filter((m) => !coreIds.has(m.id));
  return [...STUDIO_MODULES, ...extras];
}

/** Static App Router segment reserved for HITL inspect — never a module id. */
export const RESERVED_STUDIO_SEGMENTS = ["inspect"] as const;

export function isReservedStudioSegment(id: string): boolean {
  return (RESERVED_STUDIO_SEGMENTS as readonly string[]).includes(id);
}

/** Href for a module workspace page (canonical or custom id). */
export function studioModuleHref(moduleId: string): string {
  return `/studio/${moduleId}`;
}

/** Resolve a tile from core + optional custom list. */
export function findStudioModule(
  moduleId: string,
  custom: StudioModule[] = [],
): StudioModule | undefined {
  return mergeStudioModules(custom).find((m) => m.id === moduleId);
}

export type TopicPreset = {
  id: string;
  label: string;
  topic: string;
};

export const TOPIC_PRESETS: TopicPreset[] = [
  {
    id: "trend-week",
    label: "🔥 Тренд недели",
    topic: "Тренд недели: что обсуждают в Ереване прямо сейчас",
  },
  {
    id: "yerevan-slang",
    label: "🗣 Ереванский сленг",
    topic: "Ереванский сленг: разбор живых фраз для Reels",
  },
  {
    id: "debate",
    label: "🎭 Дебаты/Спор",
    topic: "Дебаты: старое vs новое в армянской культуре — хук для ролика",
  },
  {
    id: "beginners",
    label: "📚 Для начинающих",
    topic: "Для начинающих: простой разбор темы с примерами на каждый день",
  },
];
