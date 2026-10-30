/**
 * C-70 — DESIGN.md browser override (legacy single file).
 * C-settings-design-md-carousel: prefer Embla library via
 * `lib/settings/design-library.ts` (`cf.settings.design.library.v1` + activeId).
 * Legacy key still migrated into library on first `readDesignLibrary()`.
 */

const STORAGE_KEY = "cf.settings.designMd.v1";

export function readDesignMdOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw && raw.trim().length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function writeDesignMdOverride(markdown: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, markdown);
  } catch {
    /* quota */
  }
}

export function clearDesignMdOverride(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
