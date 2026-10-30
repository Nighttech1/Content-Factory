/**
 * Deterministic geometry gate (montage).
 *
 * Reads the bake logs (vocab pill + swipe arrow rects) and flags geometry
 * SUSPECTS — overlaps, out-of-frame clipping, a fallback-guessed vocab slot,
 * collisions with the logo air or the arrow pocket.
 *
 * These are CANDIDATES, not a verdict: the final accept/reject stays with the
 * vision Art Director, which gets them as hints and can dismiss a code
 * false-positive (e.g. a rect overlap that is visually fine). Code never blocks
 * on its own — it steers the AD's attention to the exact pixels to check.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { FRAME_W, FRAME_H } from "./renderer";

export type GeometrySuspect = {
  slide: number;
  kind: string;
  note: string;
};

type Rect = { left: number; top: number; width: number; height: number };

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/** Top-right logo lockup air (reserved). */
const LOGO_AIR: Rect = { left: 852, top: 0, width: FRAME_W - 852, height: 264 };
/** Bottom-right swipe-arrow pocket (reserved). */
const ARROW_POCKET: Rect = {
  left: 860,
  top: 1190,
  width: FRAME_W - 860,
  height: FRAME_H - 1190,
};

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

type VocabRow = {
  slideIndex: number;
  left: number;
  top: number;
  guideW?: number;
  guideH?: number;
  hyRu?: string;
  detected?: boolean;
  detectSource?: string;
};
type ArrowRow = {
  slideIndex: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export async function runGeometryGate(
  jobDir: string,
): Promise<GeometrySuspect[]> {
  const suspects: GeometrySuspect[] = [];
  const vocab = await readJsonSafe<{ slides: VocabRow[] }>(
    path.join(jobDir, "prompts", "vocab_bake.json"),
  );
  const arrow = await readJsonSafe<{ slides: ArrowRow[] }>(
    path.join(jobDir, "prompts", "slide_arrow_bake.json"),
  );
  const arrowBySlide = new Map<number, ArrowRow>(
    (arrow?.slides ?? []).map((r) => [r.slideIndex, r]),
  );

  for (const v of vocab?.slides ?? []) {
    const rect: Rect = {
      left: v.left,
      top: v.top,
      width: v.guideW ?? 420,
      height: v.guideH ?? 78,
    };
    const where = `слайд ${v.slideIndex}`;

    // Slot was not detected — the pill landed at a GUESSED position. This is the
    // exact case that smeared a gray box / overlapped the CTA before the fixes.
    if (v.detectSource === "fallback" || v.detected === false) {
      suspects.push({
        slide: v.slideIndex,
        kind: "vocab_fallback_pos",
        note: `${where}: vocab-pill «${v.hyRu ?? ""}» встал в fallback-позицию (слот не найден) — проверь, что под ним чистый фон и он не лёг на плашку/кнопку/текст`,
      });
    }
    // Clipping out of frame.
    if (rect.left < 0 || rect.left + rect.width > FRAME_W || rect.top + rect.height > FRAME_H) {
      suspects.push({
        slide: v.slideIndex,
        kind: "vocab_clip",
        note: `${where}: vocab-pill выходит за край кадра (left=${rect.left}, top=${rect.top}, w=${rect.width}) — проверь обрезку`,
      });
    }
    // Into reserved logo air.
    if (overlaps(rect, LOGO_AIR)) {
      suspects.push({
        slide: v.slideIndex,
        kind: "vocab_logo_air",
        note: `${where}: vocab-pill заходит в зону логотипа (top-right) — проверь наложение на лого`,
      });
    }
    // Collides with the arrow on the same slide.
    const a = arrowBySlide.get(v.slideIndex);
    if (a && overlaps(rect, { left: a.left, top: a.top, width: a.width, height: a.height })) {
      suspects.push({
        slide: v.slideIndex,
        kind: "vocab_arrow_overlap",
        note: `${where}: vocab-pill пересекается со стрелкой — проверь наложение`,
      });
    }
    // Vocab sitting inside the arrow pocket (even if arrow skipped this slide).
    if (overlaps(rect, ARROW_POCKET) && !a) {
      suspects.push({
        slide: v.slideIndex,
        kind: "vocab_in_arrow_pocket",
        note: `${where}: vocab-pill в правом-нижнем «кармане» стрелки — на CTA-слайде там обычно кнопка CTA, проверь наложение`,
      });
    }
  }

  return suspects;
}

/** Compact lines for injecting into the AD prompt. */
export function geometrySuspectsToPromptLines(
  suspects: GeometrySuspect[],
): string[] {
  return suspects.map((s) => `- [${s.kind}] ${s.note}`);
}
