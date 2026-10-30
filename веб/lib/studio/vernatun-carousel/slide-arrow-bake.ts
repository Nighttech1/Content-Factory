/**
 * B4.6 — Bottom-right swipe arrow (post-pass).
 * Shape: client reference swoosh PNG (`brand/arrow-swoosh-ref.png`) — glossy
 *   curved arrow pointing RIGHT. We use its ALPHA silhouette, not the SVG draw.
 * Color: white OR dark ONLY, picked by background luminance (AD/B-W policy) —
 *   never brand orange / gradient.
 * Position: FIXED bottom-right (margin). Raised slightly ONLY when a text/graphic
 *   block from the generated image collides with the arrow pocket.
 * Last slide: caller (renderer / rebake) skips the arrow entirely.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { FRAME_H, FRAME_W } from "./renderer";
import {
  DEFAULT_LOGO_BAKE_SIZE_PX,
  pickWordmarkHexForLuminance,
  WORDMARK_WHITE,
  WORDMARK_DARK,
} from "./logo-bake";

/** Luminance pocket base (kept for API/test compat). */
export const SLIDE_ARROW_LENGTH_PX = Math.round(DEFAULT_LOGO_BAKE_SIZE_PX / 2);
/** Rendered swoosh width — reference arrow reads bigger than a flat chevron. */
export const SLIDE_ARROW_WIDTH_PX = Math.round(DEFAULT_LOGO_BAKE_SIZE_PX * 0.9);
/** Raised from bottom/right edge (fixed anchor). */
export const SLIDE_ARROW_MARGIN_PX = 72;
/** @deprecated SVG stroke — ref-image silhouette now; kept for old imports. */
export const SLIDE_ARROW_STROKE_PX = 16;
/** @deprecated Product path is B/W only — kept for old imports. */
export const SLIDE_ARROW_PRIMARY = "#F58220";

/** Reference arrow asset (client-sent white swoosh with real alpha, points right). */
const ARROW_REF_PATH = path.join(
  process.cwd(),
  "brand",
  "arrow-swoosh-ref2.png",
);

/** White on dark BR, dark on light BR — never primary orange. */
export function pickArrowHexForBackground(luminance: number): string {
  return pickWordmarkHexForLuminance(luminance);
}

export type BakeSlideArrowResult = {
  slideIndex: number;
  outPath: string;
  left: number;
  top: number;
  width: number;
  height: number;
  arrowHex: string;
  luminance: number;
  /** true when the arrow was raised off the fixed anchor to clear a text block. */
  raised: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

/** Average luminance of a slide rectangle (clamped into frame). */
async function sampleRectLuminance(
  slidePath: string,
  left: number,
  top: number,
  w: number,
  h: number,
): Promise<number> {
  const sharp = (await import("sharp")).default;
  const L = Math.max(0, Math.min(FRAME_W - 1, left));
  const T = Math.max(0, Math.min(FRAME_H - 1, top));
  const W = Math.max(1, Math.min(FRAME_W - L, w));
  const H = Math.max(1, Math.min(FRAME_H - T, h));
  const { data, info } = await sharp(slidePath)
    .resize(FRAME_W, FRAME_H, { fit: "fill" })
    .extract({ left: L, top: T, width: W, height: H })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + 2 < data.length; i += ch) {
    sum += 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    n += 1;
  }
  return n ? sum / n : 128;
}

/** @deprecated use sampleRectLuminance — kept for old imports. */
export async function sampleBottomRightArrowLuminance(
  slidePath: string,
  lengthPx = SLIDE_ARROW_WIDTH_PX,
  marginPx = SLIDE_ARROW_MARGIN_PX,
): Promise<number> {
  const w = lengthPx;
  const h = Math.max(56, Math.round(lengthPx * 0.72));
  return sampleRectLuminance(
    slidePath,
    FRAME_W - marginPx - w,
    FRAME_H - marginPx - h,
    w,
    h,
  );
}

/**
 * How "busy" a pocket is: saturated plates (e.g. the orange CTA band) and dense
 * text edges both raise the score. Used only to decide whether to lift the arrow.
 */
async function pocketOccupancy(
  slidePath: string,
  left: number,
  top: number,
  w: number,
  h: number,
): Promise<{ satMean: number; edgeFrac: number; lumStd: number }> {
  const sharp = (await import("sharp")).default;
  const L = Math.max(0, Math.min(FRAME_W - 1, left));
  const T = Math.max(0, Math.min(FRAME_H - 1, top));
  const W = Math.max(1, Math.min(FRAME_W - L, w));
  const H = Math.max(1, Math.min(FRAME_H - T, h));
  const { data, info } = await sharp(slidePath)
    .resize(FRAME_W, FRAME_H, { fit: "fill" })
    .extract({ left: L, top: T, width: W, height: H })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const rw = info.width;
  const rh = info.height;
  let satSum = 0;
  let strong = 0;
  let lumSum = 0;
  let lumSqSum = 0;
  let n = 0;
  const lumAt = (x: number, y: number): number => {
    const i = (y * rw + x) * ch;
    return 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
  };
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const i = (y * rw + x) * ch;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      satSum += mx > 0 ? (mx - mn) / mx : 0;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      lumSum += lum;
      lumSqSum += lum * lum;
      if (x + 1 < rw && Math.abs(lumAt(x, y) - lumAt(x + 1, y)) > 55) strong += 1;
      n += 1;
    }
  }
  const mean = n ? lumSum / n : 0;
  const lumStd = n ? Math.sqrt(Math.max(0, lumSqSum / n - mean * mean)) : 0;
  return {
    satMean: n ? satSum / n : 0,
    edgeFrac: n ? strong / n : 0,
    lumStd,
  };
}

/**
 * Fixed BR anchor; raise in up to 2 steps ONLY when the pocket collides with a
 * saturated plate or dense text block from the generated image.
 */
async function resolveArrowTop(
  slidePath: string,
  left: number,
  anchorTop: number,
  w: number,
  h: number,
): Promise<{ top: number; raised: boolean }> {
  // Lift ONLY for a real solid UI plate over the pocket: high saturation AND
  // very flat luminance (e.g. the orange CTA band). Any textured PHOTO corner
  // (warm pastries, string lights, wood) has high lumStd and keeps the fixed
  // anchor — a busy photo is not a "text block". (The one real collision case,
  // the CTA band, is on the last slide, which has no arrow at all.)
  const collides = (o: {
    satMean: number;
    edgeFrac: number;
    lumStd: number;
  }): boolean => o.satMean > 0.5 && o.lumStd < 26;
  const base = await pocketOccupancy(slidePath, left, anchorTop, w, h);
  if (!collides(base)) return { top: anchorTop, raised: false };

  const step = Math.round(h * 0.95);
  const minTop = Math.round(FRAME_H * 0.42);
  let best = anchorTop;
  let bestScore = base.satMean + base.edgeFrac;
  for (let s = 1; s <= 2; s++) {
    const t = anchorTop - step * s;
    if (t < minTop) break;
    const o = await pocketOccupancy(slidePath, left, t, w, h);
    if (!collides(o)) return { top: t, raised: true };
    const score = o.satMean + o.edgeFrac;
    if (score < bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return { top: best, raised: best !== anchorTop };
}

type TrimmedRef = {
  widthPx: number;
  data: Buffer;
  W: number;
  H: number;
  channels: number;
};
let _refCache: TrimmedRef | null = null;

/**
 * The reference arrow (ref2) is a white swoosh with REAL alpha transparency.
 * Use the alpha channel directly as the silhouette mask, crop to its bbox, and
 * resize. Cached per width. Returned W/H are the ACTUAL arrow dims.
 */
async function getTrimmedRef(widthPx: number): Promise<TrimmedRef> {
  if (_refCache && _refCache.widthPx === widthPx) return _refCache;
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(ARROW_REF_PATH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w0 = info.width;
  const h0 = info.height;
  const ch = info.channels;
  // Alpha bbox (the arrow's own transparency is the silhouette).
  let minX = w0;
  let minY = h0;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h0; y++) {
    for (let x = 0; x < w0; x++) {
      if (data[(y * w0 + x) * ch + (ch - 1)]! > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    minX = 0;
    minY = 0;
    maxX = w0 - 1;
    maxY = h0 - 1;
  }
  const cropped = await sharp(data, {
    raw: { width: w0, height: h0, channels: ch },
  })
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })
    .resize({ width: widthPx })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  _refCache = {
    widthPx,
    data: cropped.data,
    W: cropped.info.width,
    H: cropped.info.height,
    channels: cropped.info.channels,
  };
  return _refCache;
}

/**
 * Render the reference swoosh as a flat B/W silhouette (+ soft contrasting halo
 * so it reads on any photo). Shape = client ref alpha; color = white or dark.
 */
/**
 * Supersample factor. The reference swoosh is ~1774×887; rendering the ink+halo
 * straight at the tiny final width (≈162) aliases the thin lower curve into
 * horizontal "speed-trail" stripes (client reject: потёртости/чёрные линии у
 * стрелки). We render the silhouette at SS× and downscale the final composite —
 * the extra samples collapse the stripes into a clean edge.
 */
const ARROW_SUPERSAMPLE = 3;

export async function renderSlideArrowPng(input: {
  outPath: string;
  /** Target width; defaults to SLIDE_ARROW_WIDTH_PX. */
  lengthPx?: number;
  strokePx?: number;
  arrowHex: string;
}): Promise<{ outPath: string; width: number; height: number }> {
  const sharp = (await import("sharp")).default;
  const widthPx = Math.ceil(input.lengthPx ?? SLIDE_ARROW_WIDTH_PX);
  const hex = input.arrowHex.trim() || WORDMARK_WHITE;
  const isLight =
    hex.toUpperCase() === WORDMARK_WHITE.toUpperCase() ||
    hex.toUpperCase() === "#FFF" ||
    hex.toUpperCase() === "#FFFFFF";
  const ink = hexToRgb(isLight ? WORDMARK_WHITE : WORDMARK_DARK);
  const halo = isLight ? [0, 0, 0] : [255, 255, 255];

  // Build at SS× resolution, then downscale the finished composite (anti-alias).
  const renderW = widthPx * ARROW_SUPERSAMPLE;
  const ref = await getTrimmedRef(renderW);
  const src = ref.data;
  const W = ref.W;
  const H = ref.H;
  const chN = ref.channels;
  const px = W * H;

  const inkBuf = Buffer.alloc(px * 4);
  const alphaOnly = Buffer.alloc(px);
  for (let q = 0, p = 0; q < px; q++, p += 4) {
    const a = src[q * chN + (chN - 1)]!;
    alphaOnly[q] = a;
    if (a > 16) {
      inkBuf[p] = ink[0]!;
      inkBuf[p + 1] = ink[1]!;
      inkBuf[p + 2] = ink[2]!;
      inkBuf[p + 3] = a;
    }
  }

  // DIRECTIONAL drop shadow (NOT a symmetric halo). The old full-perimeter halo
  // painted a gray ring all around the arrow that reads as a «потёртый серый фон»
  // on busy photos (client reject: у оранжевых плашек такого нет). Match the
  // vocab pill's box-shadow instead: blur the silhouette, offset it DOWN, low
  // alpha — a subtle lift under the arrow, no ring around it.
  const SHADOW_OFFSET = Math.round(6 * ARROW_SUPERSAMPLE);
  const blurred = await sharp(alphaOnly, {
    raw: { width: W, height: H, channels: 1 },
  })
    .blur(6 * ARROW_SUPERSAMPLE)
    .raw()
    .toBuffer();
  const shadowBuf = Buffer.alloc(px * 4);
  for (let q = 0, p = 0; q < px; q++, p += 4) {
    shadowBuf[p] = halo[0]!;
    shadowBuf[p + 1] = halo[1]!;
    shadowBuf[p + 2] = halo[2]!;
    shadowBuf[p + 3] = Math.min(255, Math.round(blurred[q]! * 0.42));
  }
  // Shift the shadow straight down by SHADOW_OFFSET (pad top, crop back to W×H).
  const shadowShifted = await sharp(shadowBuf, {
    raw: { width: W, height: H, channels: 4 },
  })
    .extend({
      top: SHADOW_OFFSET,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extract({ left: 0, top: 0, width: W, height: H })
    .raw()
    .toBuffer();

  const big = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadowShifted, raw: { width: W, height: H, channels: 4 } },
      { input: inkBuf, raw: { width: W, height: H, channels: 4 } },
    ])
    .png()
    .toBuffer();
  // Downscale the finished SS× composite to the target width — collapses the
  // aliasing stripes into a clean edge.
  const out = await sharp(big)
    .resize({ width: widthPx, kernel: "lanczos3" })
    .png()
    .toBuffer();
  const outMeta = await sharp(out).metadata();

  await mkdir(path.dirname(input.outPath), { recursive: true });
  await writeFile(input.outPath, out);
  return {
    outPath: input.outPath,
    width: outMeta.width ?? Math.round(W / ARROW_SUPERSAMPLE),
    height: outMeta.height ?? Math.round(H / ARROW_SUPERSAMPLE),
  };
}

/** Composite BR arrow onto slide (after vocab bake). */
export async function bakeSlideArrowOntoSlide(input: {
  slidePath: string;
  outPath: string;
  jobDir?: string;
  slideIndex: number;
  lengthPx?: number;
  marginPx?: number;
}): Promise<BakeSlideArrowResult> {
  const sharp = (await import("sharp")).default;
  const widthPx = input.lengthPx ?? SLIDE_ARROW_WIDTH_PX;
  const marginPx = input.marginPx ?? SLIDE_ARROW_MARGIN_PX;

  // Size (independent of color) from the real cropped+resized reference dims.
  const ref = await getTrimmedRef(widthPx);
  const arrowW = ref.W;
  const arrowH = ref.H;

  const left = Math.max(0, FRAME_W - marginPx - arrowW);
  const anchorTop = Math.max(0, FRAME_H - marginPx - arrowH);

  // Fixed anchor; lift only if a text/graphic block sits in the pocket.
  const { top, raised } = await resolveArrowTop(
    input.slidePath,
    left,
    anchorTop,
    arrowW,
    arrowH,
  );

  const lum = await sampleRectLuminance(
    input.slidePath,
    left,
    top,
    arrowW,
    arrowH,
  );
  const arrowHex = pickArrowHexForBackground(lum);

  const tmpDir = input.jobDir
    ? path.join(input.jobDir, "slide-arrows")
    : path.join(path.dirname(input.outPath), "_arrows");
  await mkdir(tmpDir, { recursive: true });
  const arrowPath = path.join(
    tmpDir,
    `slide_${String(input.slideIndex).padStart(2, "0")}_arrow.png`,
  );
  const rendered = await renderSlideArrowPng({
    outPath: arrowPath,
    lengthPx: widthPx,
    arrowHex,
  });

  const base = await sharp(input.slidePath)
    .resize(FRAME_W, FRAME_H, { fit: "fill" })
    .ensureAlpha()
    .png()
    .toBuffer();
  const overlay = await sharp(arrowPath).ensureAlpha().png().toBuffer();

  await sharp(base)
    .composite([{ input: overlay, left, top }])
    .png()
    .toFile(input.outPath);

  return {
    slideIndex: input.slideIndex,
    outPath: input.outPath,
    left,
    top,
    width: rendered.width,
    height: rendered.height,
    arrowHex,
    luminance: Math.round(lum),
    raised,
  };
}

export async function writeSlideArrowBakeLog(
  jobDir: string,
  rows: BakeSlideArrowResult[],
): Promise<void> {
  await mkdir(path.join(jobDir, "prompts"), { recursive: true });
  await writeFile(
    path.join(jobDir, "prompts", "slide_arrow_bake.json"),
    JSON.stringify({ slides: rows }, null, 2),
    "utf8",
  );
}
