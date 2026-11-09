/**
 * Programmatic layout gate (not LLM vision).
 * Catches: text in logo safe zone, edge margin violations, orange guide artifacts.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { FRAME_H, FRAME_W } from "./renderer";
import {
  DEFAULT_LOGO_BAKE_SIZE_PX,
  FIXED_LOGO_CORNER,
  emblemCompositeOffset,
} from "./logo-bake";
import type { ArtDirectorFinding } from "./types";

/** Text must stay this many px inside frame edges. */
export const EDGE_MARGIN_PX = 48;

/**
 * Orange guide ring around TR logo pocket.
 * Tiny speck / anti-alias near accent logo ≠ visible dashed frame.
 * MAJOR only when ring looks like a real selection box naked-eye.
 */
export const GUIDE_ARTIFACT_MAJOR_ORANGE_MIN = 220;
export const GUIDE_ARTIFACT_MAJOR_DENSITY_MIN = 0.045;
/** Below major: log as minor (does not block FINAL). */
export const GUIDE_ARTIFACT_MINOR_ORANGE_MIN = 120;
export const GUIDE_ARTIFACT_MINOR_DENSITY_MIN = 0.02;

/**
 * Ink density in edge band that counts as "text too close".
 * Was 0.07 — false positives on bright landscape photos (snow/sky contrast).
 * Real headline glyphs pack denser contiguous ink.
 */
export const EDGE_INK_DENSITY_MIN = 0.22;

/** Min columns (in a horizontal band) that look like a text run. */
export const EDGE_TEXT_RUN_MIN_COLS = 36;

/**
 * Absolute empty pocket for logo bake (TOP-RIGHT).
 * Matches bake geometry with extra breathing room for wordmark.
 */
export const LOGO_SAFE_ZONE = {
  marginPx: 28,
  widthPx: 200,
  heightPx: 236,
} as const;

export function logoSafeZoneRect(
  frameW = FRAME_W,
  frameH = FRAME_H,
): { left: number; top: number; width: number; height: number } {
  const { left, top } = emblemCompositeOffset(
    FIXED_LOGO_CORNER,
    LOGO_SAFE_ZONE.widthPx,
    LOGO_SAFE_ZONE.heightPx,
    LOGO_SAFE_ZONE.marginPx,
    frameW,
    frameH,
  );
  return {
    left,
    top,
    width: LOGO_SAFE_ZONE.widthPx,
    height: LOGO_SAFE_ZONE.heightPx,
  };
}

/** Human-readable prompt block for image LLM. */
export function logoSafeZonePromptBlock(
  frameW = FRAME_W,
  frameH = FRAME_H,
): string {
  const z = logoSafeZoneRect(frameW, frameH);
  const x1 = z.left;
  const y1 = z.top;
  const x2 = z.left + z.width;
  const y2 = z.top + z.height;
  // Exact px so text stays out — but NEVER tell the model to "draw" the zone.
  return `TOP-RIGHT LOGO AIR (for YOUR layout only — NEVER paint this zone on the canvas):
- Exact empty pocket on 1080×1350: x=${x1}..${x2}px, y=${y1}..${y2}px (≈${z.width}×${z.height}px, ${LOGO_SAFE_ZONE.marginPx}px from top/right edges).
- NO headlines, body, CTA, chips, faces, cards, or icons may enter that pocket — keep all glyphs left/below it.
- Do NOT draw, outline, bracket, or mark that pocket in ANY way: no dashed/dotted/solid frames, no corner ticks, no L-guides, no selection boxes, no placeholder plates, no glow rings, no orange edge dots, no "logo here" captions.
- Do NOT draw the club logo/emblem/wordmark yourself — a later post-pass (logo_bake) pastes the exact PNG into this pocket.
- Continue the same photo/sky/wall texture through the pocket (unmarked quiet corner of the scene).
- Keep all on-slide text ≥${EDGE_MARGIN_PX}px from every outer edge.`;
}

type Rgba = { data: Buffer; width: number; height: number; channels: number };

async function loadRgba(filePath: string): Promise<Rgba | null> {
  try {
    const sharp = (await import("sharp")).default;
    // Same frame policy as logo-bake: never cover-crop for QA sampling
    const { normalizeSlideToFrame } = await import("./logo-bake");
    const normalized = await normalizeSlideToFrame(filePath);
    const { data, info } = await sharp(normalized)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      data: Buffer.from(data),
      width: info.width,
      height: info.height,
      channels: info.channels,
    };
  } catch {
    return null;
  }
}

function pixelAt(
  img: Rgba,
  x: number,
  y: number,
): { r: number; g: number; b: number; a: number } {
  const i = (y * img.width + x) * img.channels;
  return {
    r: img.data[i]!,
    g: img.data[i + 1]!,
    b: img.data[i + 2]!,
    a: img.data[i + 3] ?? 255,
  };
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Glyph-like pixel: dark/bright ONLY if local contrast vs neighbors is high.
 * Plain dark photo (cafe) must NOT count — that caused ink=100% false logo_collision.
 */
function isTextInkAt(img: Rgba, x: number, y: number): boolean {
  const p = pixelAt(img, x, y);
  if (p.a < 20) return false;
  const lum = luminance(p.r, p.g, p.b);
  const sat = Math.max(p.r, p.g, p.b) - Math.min(p.r, p.g, p.b);
  const dark = lum < 48 && sat < 60;
  const bright = lum > 230 && sat < 50;
  if (!dark && !bright) return false;
  // Sample 4-neighbors for contrast (glyph edge)
  const offs: Array<[number, number]> = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  let maxDelta = 0;
  for (const [dx, dy] of offs) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= img.width || ny >= img.height) continue;
    const n = pixelAt(img, nx, ny);
    if (n.a < 20) continue;
    maxDelta = Math.max(
      maxDelta,
      Math.abs(lum - luminance(n.r, n.g, n.b)),
    );
  }
  return maxDelta >= 45;
}

function isOrangeAccent(r: number, g: number, b: number): boolean {
  // Vernatun accent ~#F58220 and dashed guide oranges (slightly wide for anti-alias)
  return (
    r >= 180 &&
    g >= 50 &&
    g <= 210 &&
    b <= 130 &&
    r > g + 30 &&
    r > b + 60
  );
}

/**
 * Orange density on a thin ring around the logo safe-zone border.
 * GPT Image often draws a dashed selection rect exactly on this pocket;
 * interior orange (sun/mountain in the baked emblem) must NOT count.
 */
function sampleOrangePerimeterRing(
  img: Rgba,
  zone: { left: number; top: number; width: number; height: number },
  bandPx = 10,
): { density: number; orange: number; samples: number } {
  let orange = 0;
  let n = 0;
  const x0 = zone.left;
  const y0 = zone.top;
  const x1 = zone.left + zone.width;
  const y1 = zone.top + zone.height;
  const L = Math.max(0, x0 - bandPx);
  const T = Math.max(0, y0 - bandPx);
  const R = Math.min(img.width, x1 + bandPx);
  const B = Math.min(img.height, y1 + bandPx);
  for (let y = T; y < B; y += 1) {
    for (let x = L; x < R; x += 1) {
      const dx = x < x0 ? x0 - x : x > x1 ? x - x1 : 0;
      const dy = y < y0 ? y0 - y : y > y1 ? y - y1 : 0;
      // Outside: Chebyshev to rect. Inside: distance to nearest edge.
      // Deep interior (emblem sun/mountain) → large dist → skipped.
      const dist =
        dx > 0 || dy > 0
          ? Math.max(dx, dy)
          : Math.min(x - x0, x1 - x, y - y0, y1 - y);
      if (dist > bandPx) continue;
      const p = pixelAt(img, x, y);
      if (p.a < 20) continue;
      n += 1;
      if (isOrangeAccent(p.r, p.g, p.b)) orange += 1;
    }
  }
  return { density: n ? orange / n : 0, orange, samples: n };
}

function sampleRectInkDensity(
  img: Rgba,
  left: number,
  top: number,
  width: number,
  height: number,
): number {
  let ink = 0;
  let n = 0;
  const x1 = Math.max(0, left);
  const y1 = Math.max(0, top);
  const x2 = Math.min(img.width, left + width);
  const y2 = Math.min(img.height, top + height);
  for (let y = y1; y < y2; y += 2) {
    for (let x = x1; x < x2; x += 2) {
      const p = pixelAt(img, x, y);
      if (p.a < 20) continue;
      n += 1;
      if (isTextInkAt(img, x, y)) ink += 1;
    }
  }
  return n ? ink / n : 0;
}

/**
 * Count columns in a band that have ≥2 ink hits — text lines form runs;
 * photo noise is scattered.
 */
function countInkColumnRuns(
  img: Rgba,
  left: number,
  top: number,
  width: number,
  height: number,
): number {
  const x1 = Math.max(0, left);
  const y1 = Math.max(0, top);
  const x2 = Math.min(img.width, left + width);
  const y2 = Math.min(img.height, top + height);
  let runCols = 0;
  for (let x = x1; x < x2; x += 2) {
    let hits = 0;
    for (let y = y1; y < y2; y += 2) {
      if (isTextInkAt(img, x, y)) {
        hits += 1;
        if (hits >= 2) break;
      }
    }
    if (hits >= 2) runCols += 1;
  }
  return runCols;
}

/** True only when density is high AND ink looks like a horizontal text run. */
export function edgeBandLooksLikeText(
  dens: number,
  runCols: number,
): boolean {
  return dens >= EDGE_INK_DENSITY_MIN && runCols >= EDGE_TEXT_RUN_MIN_COLS;
}

function finding(
  slideIndex: number,
  element: string,
  observed: string,
  change: string,
  check: string,
  severity: ArtDirectorFinding["severity"] = "major",
): ArtDirectorFinding {
  return {
    slide_id: `slide_${slideIndex}`,
    severity,
    element,
    observed_issue: observed,
    recommended_change: change,
    reason: "programmatic_layout_qa",
    acceptance_check: check,
  };
}

/**
 * Deterministic layout QA. Prefer originals for logo-zone ink (pre-bake),
 * rendered PNG for edge margins + orange guides after bake.
 */
export async function runProgrammaticLayoutQa(input: {
  pngPaths: string[];
  jobDir?: string;
}): Promise<ArtDirectorFinding[]> {
  const out: ArtDirectorFinding[] = [];
  const zone = logoSafeZoneRect();

  for (let i = 0; i < input.pngPaths.length; i++) {
    const slideIndex = i + 1;
    const rendered = input.pngPaths[i]!;
    const original = input.jobDir
      ? path.join(
          input.jobDir,
          "assets",
          "originals",
          `slide_${String(slideIndex).padStart(2, "0")}_src.jpg`,
        )
      : null;

    const renderedImg = await loadRgba(rendered);
    if (!renderedImg) continue;

    // 1) Edge margins — ink too close to frame border
    const bands: Array<{
      name: string;
      left: number;
      top: number;
      w: number;
      h: number;
    }> = [
      { name: "top", left: 0, top: 0, w: FRAME_W, h: EDGE_MARGIN_PX },
      {
        name: "bottom",
        left: 0,
        top: FRAME_H - EDGE_MARGIN_PX,
        w: FRAME_W,
        h: EDGE_MARGIN_PX,
      },
      { name: "left", left: 0, top: 0, w: EDGE_MARGIN_PX, h: FRAME_H },
      {
        name: "right",
        left: FRAME_W - EDGE_MARGIN_PX,
        top: 0,
        w: EDGE_MARGIN_PX,
        h: FRAME_H,
      },
    ];
    for (const b of bands) {
      // Right/top bands overlap logo zone — skip logo pocket for those edges
      const left = b.left;
      let top = b.top;
      let w = b.w;
      let h = b.h;
      if (b.name === "top") {
        w = Math.max(1, zone.left); // only left of logo zone
      }
      if (b.name === "right") {
        // only below logo zone
        top = zone.top + zone.height;
        h = Math.max(1, FRAME_H - top);
      }
      const dens = sampleRectInkDensity(renderedImg, left, top, w, h);
      const runCols = countInkColumnRuns(renderedImg, left, top, w, h);
      // Photo edges (snow/sky) often hit ~8–12% density without real text —
      // require dense contiguous column runs (glyphs).
      if (edgeBandLooksLikeText(dens, runCols)) {
        out.push(
          finding(
            slideIndex,
            "edge_margin",
            `Текст слишком близко к ${b.name}-краю кадра (плотность ${(dens * 100).toFixed(1)}%, text-run cols=${runCols} в полосе ${EDGE_MARGIN_PX}px).`,
            `Отодвинуть все глифы ≥${EDGE_MARGIN_PX}px от края ${b.name}; перегенерировать слайд.`,
            `В полосе ${EDGE_MARGIN_PX}px от края ${b.name} нет крупного текста`,
          ),
        );
        break; // one edge finding per slide enough
      }
    }

    // 2) Logo safe zone collision — TEXT ink in TR on ORIGINAL (before bake)
    const probePath =
      original && existsSync(original) ? original : rendered;
    const probeImg =
      probePath === rendered ? renderedImg : await loadRgba(probePath);
    if (probeImg) {
      const dens = sampleRectInkDensity(
        probeImg,
        zone.left,
        zone.top,
        zone.width,
        zone.height,
      );
      // Strict: only real typography invading TR (not cafe photo texture)
      if (dens >= 0.055) {
        out.push(
          finding(
            slideIndex,
            "logo_collision",
            `В TOP-RIGHT safe zone (x=${zone.left}..${zone.left + zone.width}, y=${zone.top}..${zone.top + zone.height}) есть текст/элементы (ink ${(dens * 100).toFixed(1)}%) — наезд на лого.`,
            `Перегенерировать слайд: пустой прямоугольник ${zone.width}×${zone.height}px в TOP-RIGHT; текст левее x=${zone.left}.`,
            `Safe zone TOP-RIGHT без букв и иконок`,
          ),
        );
      }
    }

    // 3) Orange dotted / dashed guide frame around TR safe zone.
    // Prefer ORIGINAL (pre-bake): after bake the emblem covers / muddies the ring.
    // Tiny orange speck at edge (logo anti-alias) → minor only; full dashed box → major.
    const guideImg = probeImg ?? renderedImg;
    const ring = sampleOrangePerimeterRing(guideImg, zone, 14);
    if (
      ring.orange >= GUIDE_ARTIFACT_MAJOR_ORANGE_MIN &&
      ring.density >= GUIDE_ARTIFACT_MAJOR_DENSITY_MIN
    ) {
      out.push(
        finding(
          slideIndex,
          "guide_artifact",
          `Видимая оранжевая рамка/пунктир вокруг TOP-RIGHT (плотность ${(ring.density * 100).toFixed(1)}%, ${ring.orange}px) — мусор генератора.`,
          `Перегенерировать слайд без guide/dashed/selection boxes; FORBIDDEN в prompt.`,
          `В TOP-RIGHT нет видимой оранжевой рамки-направляющей`,
          "major",
        ),
      );
    } else if (
      ring.orange >= GUIDE_ARTIFACT_MINOR_ORANGE_MIN &&
      ring.density >= GUIDE_ARTIFACT_MINOR_DENSITY_MIN
    ) {
      out.push(
        finding(
          slideIndex,
          "guide_artifact",
          `Слабый оранжевый оттенок у края TOP-RIGHT (${ring.orange}px) — невооружённым глазом почти не читается.`,
          `Опционально подчистить при следующем regen; не блокер приёмки.`,
          `Нет заметной направляющей рамки`,
          "minor",
        ),
      );
    }
  }

  return out;
}

/** Merge programmatic findings ahead of LLM AD (programmatic wins on layout). */
export function mergeLayoutFindings(
  programmatic: ArtDirectorFinding[],
  llmFindings: ArtDirectorFinding[],
): ArtDirectorFinding[] {
  const keys = new Set(
    programmatic.map((f) => `${f.slide_id}|${f.element}`),
  );
  const rest = llmFindings.filter(
    (f) => !keys.has(`${f.slide_id}|${f.element}`),
  );
  return [...programmatic, ...rest].slice(0, 12);
}
