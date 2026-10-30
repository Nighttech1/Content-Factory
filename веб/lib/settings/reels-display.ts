/**
 * C-50 — Reels / dual-feed page size preference (client-only).
 * No secrets; localStorage UX clamp only.
 */

export const REELS_PAGE_SIZE_STORAGE_KEY = "cf.reels.pageSize";

export const DEFAULT_REELS_PAGE_SIZE = 12;
export const MIN_REELS_PAGE_SIZE = 4;
export const MAX_REELS_PAGE_SIZE = 48;

/** Invalid/missing → default; otherwise clamp integer to [min, max]. */
export function clampReelsPageSize(value: unknown): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(n)) return DEFAULT_REELS_PAGE_SIZE;
  const int = Math.trunc(n);
  return Math.min(
    MAX_REELS_PAGE_SIZE,
    Math.max(MIN_REELS_PAGE_SIZE, int),
  );
}

export function readReelsPageSizeFromStorage(): number {
  if (typeof window === "undefined") return DEFAULT_REELS_PAGE_SIZE;
  try {
    const raw = window.localStorage.getItem(REELS_PAGE_SIZE_STORAGE_KEY);
    if (raw == null || raw === "") return DEFAULT_REELS_PAGE_SIZE;
    return clampReelsPageSize(raw);
  } catch {
    return DEFAULT_REELS_PAGE_SIZE;
  }
}

export function writeReelsPageSizeToStorage(n: number): void {
  if (typeof window === "undefined") return;
  const next = clampReelsPageSize(n);
  window.localStorage.setItem(REELS_PAGE_SIZE_STORAGE_KEY, String(next));
}
