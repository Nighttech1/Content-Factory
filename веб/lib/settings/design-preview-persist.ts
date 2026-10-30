/**
 * C-143 — persist Design.md floating preview chrome.
 * Keys: `cf.settings.design-preview.*`
 */

const PREFIX = "cf.settings.design-preview";

export const DESIGN_PREVIEW_KEYS = {
  open: `${PREFIX}.open`,
  x: `${PREFIX}.x`,
  y: `${PREFIX}.y`,
  width: `${PREFIX}.width`,
} as const;

export const DESIGN_PREVIEW_MIN_W = 280;
export const DESIGN_PREVIEW_MAX_W = 560;
export const DESIGN_PREVIEW_DEFAULT_W = 360;

export type DesignPreviewLayout = {
  open: boolean;
  x: number;
  y: number;
  width: number;
};

function clampWidth(n: number) {
  return Math.min(
    DESIGN_PREVIEW_MAX_W,
    Math.max(DESIGN_PREVIEW_MIN_W, Math.round(n)),
  );
}

function readNum(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function defaultXY(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 24, y: 96 };
  const w = DESIGN_PREVIEW_DEFAULT_W;
  return {
    x: Math.max(16, window.innerWidth - w - 24),
    y: 96,
  };
}

export function readDesignPreviewLayout(): DesignPreviewLayout {
  const defaults = defaultXY();
  if (typeof window === "undefined") {
    return {
      open: false,
      x: defaults.x,
      y: defaults.y,
      width: DESIGN_PREVIEW_DEFAULT_W,
    };
  }
  try {
    const openRaw = window.localStorage.getItem(DESIGN_PREVIEW_KEYS.open);
    return {
      open: openRaw === "1" || openRaw === "true",
      x: readNum(DESIGN_PREVIEW_KEYS.x, defaults.x),
      y: readNum(DESIGN_PREVIEW_KEYS.y, defaults.y),
      width: clampWidth(
        readNum(DESIGN_PREVIEW_KEYS.width, DESIGN_PREVIEW_DEFAULT_W),
      ),
    };
  } catch {
    return {
      open: false,
      x: defaults.x,
      y: defaults.y,
      width: DESIGN_PREVIEW_DEFAULT_W,
    };
  }
}

export function writeDesignPreviewOpen(open: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DESIGN_PREVIEW_KEYS.open, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function writeDesignPreviewPosition(x: number, y: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DESIGN_PREVIEW_KEYS.x, String(Math.round(x)));
    window.localStorage.setItem(DESIGN_PREVIEW_KEYS.y, String(Math.round(y)));
  } catch {
    /* ignore */
  }
}

export function writeDesignPreviewWidth(width: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DESIGN_PREVIEW_KEYS.width,
      String(clampWidth(width)),
    );
  } catch {
    /* ignore */
  }
}

export function clampDesignPreviewWidth(n: number): number {
  return clampWidth(n);
}

/** Keep panel within viewport with a small margin. */
export function clampDesignPreviewPosition(
  x: number,
  y: number,
  width: number,
  height = 320,
): { x: number; y: number } {
  if (typeof window === "undefined") return { x, y };
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - Math.min(height, 120) - margin);
  return {
    x: Math.min(maxX, Math.max(margin, Math.round(x))),
    y: Math.min(maxY, Math.max(margin, Math.round(y))),
  };
}
