/**
 * C-31 — CapCut editor allowlist.
 * Only cartoon-reels / heygen-reels may open `/studio/.../edit/...`.
 * custom-* and other core modules stay OFF until explicit allowlist.
 */

export const CAPCUT_MODULE_IDS = ["cartoon-reels", "heygen-reels"] as const;

export type CapCutModuleId = (typeof CAPCUT_MODULE_IDS)[number];

export function isCapCutModule(id: string): id is CapCutModuleId {
  return (CAPCUT_MODULE_IDS as readonly string[]).includes(id);
}

/** draftId `ref-{competitorId}` → competitor id, else null. */
export function parseRefDraftId(draftId: string): string | null {
  const raw = draftId.trim();
  if (!raw.startsWith("ref-")) return null;
  const id = raw.slice(4).trim();
  return id.length > 0 ? id : null;
}
