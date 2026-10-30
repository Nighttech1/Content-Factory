/**
 * C-126 — sticky schedule slot popup position (client localStorage).
 * Viewport/fixed coords; independent of slot/day.
 */

export const SCHEDULE_POPUP_POS_KEY = "cf.schedule.popup.pos";

export type SchedulePopupPos = { x: number; y: number };

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Default: center-ish of viewport (matches prior openEditor math). */
export function defaultSchedulePopupPos(
  viewportW = typeof window !== "undefined" ? window.innerWidth : 1280,
  viewportH = typeof window !== "undefined" ? window.innerHeight : 720,
  w = 320,
  h = 360,
): SchedulePopupPos {
  return {
    x: Math.max(16, Math.round(viewportW / 2 - w / 2)),
    y: Math.max(16, Math.round(viewportH / 2 - h / 2)),
  };
}

export function readSchedulePopupPos(): SchedulePopupPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SCHEDULE_POPUP_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
    if (!isFiniteNumber(parsed.x) || !isFiniteNumber(parsed.y)) {
      // Corrupt → drop so caller can apply default (C-126).
      window.localStorage.removeItem(SCHEDULE_POPUP_POS_KEY);
      return null;
    }
    return { x: parsed.x, y: parsed.y };
  } catch {
    try {
      window.localStorage.removeItem(SCHEDULE_POPUP_POS_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function writeSchedulePopupPos(pos: SchedulePopupPos): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SCHEDULE_POPUP_POS_KEY,
      JSON.stringify({ x: pos.x, y: pos.y }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
