/**
 * Bridge between legacy Studio tile ids and canonical Module SDK ids.
 * After C-19, store/registry use SDK ids; aliases normalize on input.
 */

/** Canonical Module SDK ids (ARCHITECTURE §4 / Sprint 6). */
export type CanonicalModuleId =
  | "carousel-engine"
  | "aesthetic-graphics"
  | "cartoon-reels"
  | "heygen-reels"
  | "site-articles"
  | "tg-articles";

/** Legacy Studio ids from `components/studio/modules.ts` (pre–C-19). */
export type LegacyStudioModuleId =
  | "carousel-4-5"
  | "infographics"
  | "cartoon-reels"
  | "heygen-avatar";

/** Legacy Studio id → canonical SDK id. */
export const STUDIO_MODULE_ID_ALIASES: Readonly<
  Record<LegacyStudioModuleId, CanonicalModuleId>
> = {
  "carousel-4-5": "carousel-engine",
  infographics: "aesthetic-graphics",
  "cartoon-reels": "cartoon-reels",
  "heygen-avatar": "heygen-reels",
} as const;

/** Canonical → preferred legacy Studio id (for UI that still expects old keys). */
export const CANONICAL_TO_STUDIO_ID: Readonly<
  Partial<Record<CanonicalModuleId, LegacyStudioModuleId>>
> = {
  "carousel-engine": "carousel-4-5",
  "aesthetic-graphics": "infographics",
  "cartoon-reels": "cartoon-reels",
  "heygen-reels": "heygen-avatar",
} as const;

const ALIAS_LOOKUP: Readonly<Record<string, CanonicalModuleId>> = {
  ...STUDIO_MODULE_ID_ALIASES,
  "carousel-engine": "carousel-engine",
  "aesthetic-graphics": "aesthetic-graphics",
  "cartoon-reels": "cartoon-reels",
  "heygen-reels": "heygen-reels",
  "site-articles": "site-articles",
  "tg-articles": "tg-articles",
};

/**
 * Normalize any known Studio or SDK id to canonical SDK id.
 * Unknown ids are returned unchanged (caller may treat as custom / future).
 */
export function toCanonicalModuleId(id: string): string {
  return ALIAS_LOOKUP[id] ?? id;
}

/**
 * Map canonical SDK id to legacy Studio id when a reverse mapping exists.
 * Unknown / custom ids returned unchanged.
 */
export function toStudioModuleId(canonicalId: string): string {
  const mapped =
    CANONICAL_TO_STUDIO_ID[canonicalId as CanonicalModuleId];
  return mapped ?? canonicalId;
}

export function isCanonicalModuleId(id: string): id is CanonicalModuleId {
  return (
    id === "carousel-engine" ||
    id === "aesthetic-graphics" ||
    id === "cartoon-reels" ||
    id === "heygen-reels" ||
    id === "site-articles" ||
    id === "tg-articles"
  );
}
