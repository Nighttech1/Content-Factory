/**
 * B5.4 — Logo bake post-pass: exact Vernatun lockup (emblem + wordmark).
 * Corner: ALWAYS top-right (product lock). Wordmark tint: per-slide contrast / AD.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { FRAME_H, FRAME_W } from "./renderer";
import { resolveVernatunEmblemPath } from "./mode-b-brand-chrome";

export type LogoCorner = "tr" | "tl" | "br" | "bl";

export const LOGO_CORNERS: readonly LogoCorner[] = [
  "tr",
  "tl",
  "br",
  "bl",
] as const;

/** Lockup+wordmark readable size (~1.5× prior icon bake). */
export const DEFAULT_LOGO_BAKE_SIZE_PX = 180;

export const WORDMARK_WHITE = "#FFFFFF";
export const WORDMARK_DARK = "#1A1208";

export type BakeExactEmblemInput = {
  slidePath: string;
  emblemPath: string;
  outPath: string;
  corner: LogoCorner;
  sizePx?: number;
  marginPx?: number;
  /** Tint only VERNATUN / ARMENIAN CLUB (not the circular emblem). */
  wordmarkHex?: string;
};

export type BakeExactEmblemResult = {
  outPath: string;
  corner: LogoCorner;
  emblemSha256: string;
  left: number;
  top: number;
  sizePx: number;
  placedW: number;
  placedH: number;
  wordmarkHex: string;
};

/**
 * Fit GPT Image output into 1080×1350 WITHOUT cropping.
 * Aggregator often returns taller-than-4:5 (e.g. 946×1663). Old `fit:"cover"`
 * chopped ~200–300px from top/bottom — text looked "обрезан" only after our bake.
 */
export async function normalizeSlideToFrame(
  slidePath: string,
  background?: { r: number; g: number; b: number; alpha: number },
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const meta = await sharp(slidePath).metadata();
  const w = meta.width ?? FRAME_W;
  const h = meta.height ?? FRAME_H;
  const srcAspect = w / Math.max(1, h);
  const targetAspect = FRAME_W / FRAME_H;

  // Same aspect (±2%) → cover is lossless for content (no letterbox needed)
  if (Math.abs(srcAspect - targetAspect) <= 0.02) {
    return sharp(slidePath)
      .resize(FRAME_W, FRAME_H, { fit: "cover", position: "centre" })
      .ensureAlpha()
      .png()
      .toBuffer();
  }

  const bg =
    background ?? (await sampleBorderBackground(slidePath));
  return sharp(slidePath)
    .resize(FRAME_W, FRAME_H, {
      fit: "contain",
      background: bg,
      position: "centre",
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/** Average RGB of a thin border ring — used as letterbox fill. */
async function sampleBorderBackground(
  slidePath: string,
): Promise<{ r: number; g: number; b: number; alpha: number }> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(slidePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    const band = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
    const push = (x: number, y: number) => {
      const i = (y * w + x) * ch;
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      n += 1;
    };
    for (let x = 0; x < w; x += 2) {
      for (let t = 0; t < band; t++) {
        push(x, t);
        push(x, h - 1 - t);
      }
    }
    for (let y = band; y < h - band; y += 2) {
      for (let t = 0; t < band; t++) {
        push(t, y);
        push(w - 1 - t, y);
      }
    }
    if (!n) return { r: 11, g: 11, b: 11, alpha: 1 };
    return {
      r: Math.round(r / n),
      g: Math.round(g / n),
      b: Math.round(b / n),
      alpha: 1,
    };
  } catch {
    return { r: 11, g: 11, b: 11, alpha: 1 };
  }
}

export function isLogoBakeEnabled(): boolean {
  return process.env.LOGO_BAKE !== "0";
}

/** Product lock: logo always top-right on every carousel / every slide. */
export const FIXED_LOGO_CORNER: LogoCorner = "tr";

export function pickLogoCornerForJob(_jobId?: string): LogoCorner {
  return FIXED_LOGO_CORNER;
}

export function seriesLogoCorner(): LogoCorner {
  return FIXED_LOGO_CORNER;
}

/** Find circular emblem so wordmark tint never recolors inside the mark. */
export function findEmblemCircleInLockup(
  px: Buffer,
  w: number,
  h: number,
): { cx: number; cy: number; r: number } {
  const yMax = Math.floor(h * 0.58);
  let bestWidth = 0;
  let bestLeft = 0;
  let bestRight = 0;
  let bestY = Math.floor(h * 0.25);

  const isContent = (o: number): boolean => {
    const a = px[o + 3]!;
    if (a < 20) return false;
    const r = px[o]!;
    const g = px[o + 1]!;
    const b = px[o + 2]!;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (lum <= 22 && sat < 18) return false;
    return true;
  };

  for (let y = 0; y < yMax; y++) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (isContent(o)) {
        if (left < 0) left = x;
        right = x;
      }
    }
    if (left >= 0 && right - left > bestWidth) {
      bestWidth = right - left;
      bestLeft = left;
      bestRight = right;
      bestY = y;
    }
  }

  const cx = (bestLeft + bestRight) / 2;
  const r = bestWidth / 2 + 6;
  let topY = bestY;
  for (let y = 0; y < yMax; y++) {
    let hit = false;
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= w) continue;
      if (isContent((y * w + x) * 4)) {
        hit = true;
        break;
      }
    }
    if (hit) {
      topY = y;
      break;
    }
  }
  return { cx, cy: topY + r, r };
}

export function emblemCompositeOffset(
  corner: LogoCorner,
  boxW: number,
  boxH: number,
  marginPx: number,
  frameW = FRAME_W,
  frameH = FRAME_H,
): { left: number; top: number } {
  const left =
    corner === "tl" || corner === "bl" ? marginPx : frameW - marginPx - boxW;
  const top =
    corner === "tl" || corner === "tr" ? marginPx : frameH - marginPx - boxH;
  return { left, top };
}

export function parseHexColor(raw: string): { r: number; g: number; b: number } | null {
  const m = raw.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function normalizeWordmarkHex(raw: string | undefined | null): string {
  if (!raw?.trim()) return WORDMARK_WHITE;
  const t = raw.trim().toLowerCase();
  if (t === "white" || t === "светл" || t === "белый" || t === "бел") {
    return WORDMARK_WHITE;
  }
  if (
    t === "dark" ||
    t === "black" ||
    t === "тёмн" ||
    t === "темн" ||
    t === "чёрн" ||
    t === "черн"
  ) {
    return WORDMARK_DARK;
  }
  const parsed = parseHexColor(raw);
  if (!parsed) return WORDMARK_WHITE;
  return `#${raw.replace(/^#/, "").toUpperCase()}`;
}

/**
 * Recolor near-white wordmark ONLY below/outside the circular emblem.
 * Never touch pixels inside the circle (snow peaks etc. must stay).
 */
export async function tintLockupWordmark(
  lockupPng: Buffer,
  wordmarkHex: string,
): Promise<Buffer> {
  const hex = normalizeWordmarkHex(wordmarkHex);
  if (hex.toUpperCase() === WORDMARK_WHITE) return lockupPng;
  const rgb = parseHexColor(hex);
  if (!rgb) return lockupPng;

  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(lockupPng)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const px = Buffer.from(data);
  const { cx, cy, r } = findEmblemCircleInLockup(px, w, h);
  // Text starts under the circle (with small gap).
  const yTextMin = Math.min(h - 1, Math.floor(cy + r * 0.92));

  for (let y = yTextMin; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) continue; // inside emblem — never tint
      const i = (y * w + x) * 4;
      const a = px[i + 3]!;
      if (a < 20) continue;
      const r0 = px[i]!;
      const g0 = px[i + 1]!;
      const b0 = px[i + 2]!;
      const lum = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
      const sat = Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
      // Source lockup wordmark is white / near-white
      if (lum >= 200 && sat < 45) {
        px[i] = rgb.r;
        px[i + 1] = rgb.g;
        px[i + 2] = rgb.b;
      }
    }
  }

  return sharp(px, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * Light / beige under wordmark → dark text; dark photo → white text.
 * Threshold 155 catches cream/beige panels where white letters vanish.
 */
export function pickWordmarkHexForLuminance(luminance: number): string {
  // 155 → 140: bright-ish skies (~140–155) read white-on-light with poor contrast
  // (client C-LOGO-CONTRAST-03, slide 3 wordmark on light sky). Dark wordmark on
  // medium-bright backgrounds; dark backgrounds (< 140) still get white.
  return luminance >= 140 ? WORDMARK_DARK : WORDMARK_WHITE;
}

/**
 * Sample luminance under the wordmark band (lower ~45% of logo box),
 * not the colorful emblem — that is where club name sits.
 */
export async function sampleSlideCornerLuminance(input: {
  slidePath: string;
  corner: LogoCorner;
  boxW: number;
  boxH: number;
  marginPx?: number;
}): Promise<number> {
  const margin = input.marginPx ?? 28;
  const { left, top } = emblemCompositeOffset(
    input.corner,
    input.boxW,
    input.boxH,
    margin,
  );
  const sharp = (await import("sharp")).default;
  // Wordmark lives in the lower portion of the lockup box.
  const bandTop = top + Math.floor(input.boxH * 0.52);
  const bandH = Math.max(12, Math.floor(input.boxH * 0.45));
  const extractTop = Math.min(bandTop, FRAME_H - bandH);
  const extractLeft = Math.max(0, Math.min(left, FRAME_W - input.boxW));
  const extractW = Math.min(input.boxW, FRAME_W - extractLeft);
  const extractH = Math.min(bandH, FRAME_H - extractTop);

  const framed = await normalizeSlideToFrame(input.slidePath);
  const { data, info } = await sharp(framed)
    .extract({
      left: extractLeft,
      top: Math.max(0, extractTop),
      width: Math.max(1, extractW),
      height: Math.max(1, extractH),
    })
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

/**
 * Parse AD fix text for wordmark tint override.
 * Examples: "#FFFFFF", "white", "тёмный wordmark", "wordmark #1A1208"
 */
export function parseWordmarkHexFromFixText(blob: string): string | null {
  const t = blob.toLowerCase();
  const hex = blob.match(/#([0-9a-fA-F]{6})/);
  if (hex) return normalizeWordmarkHex(`#${hex[1]}`);
  if (
    /wordmark|название|vernatun|club.?name|цвет.*(лого|назван)|logo.*(contrast|contrast|слив|читаем)/i.test(
      t,
    ) ||
    /сливает|не чита|контраст.*(лого|назван|wordmark)/i.test(t)
  ) {
    if (/бел|white|светл|#fff/i.test(t)) return WORDMARK_WHITE;
    if (/т[её]мн|чёрн|черн|black|dark|#000|#1a/i.test(t)) return WORDMARK_DARK;
    if (/оранж|accent|#f58220/i.test(t)) return "#F58220";
  }
  if (/wordmark\s*(white|бел)/i.test(t)) return WORDMARK_WHITE;
  if (/wordmark\s*(dark|black|т[её]мн|чёрн)/i.test(t)) return WORDMARK_DARK;
  return null;
}

export async function bakeExactEmblemOntoSlide(
  input: BakeExactEmblemInput,
): Promise<BakeExactEmblemResult> {
  const corner = input.corner;
  const sizePx = input.sizePx ?? DEFAULT_LOGO_BAKE_SIZE_PX;
  const marginPx = input.marginPx ?? 28;
  const wordmarkHex = normalizeWordmarkHex(input.wordmarkHex);

  let emblemBuf = await readFile(input.emblemPath);
  const emblemSha256 = createHash("sha256").update(emblemBuf).digest("hex");
  emblemBuf = await tintLockupWordmark(emblemBuf, wordmarkHex);

  const sharp = (await import("sharp")).default;
  const resizedEmblem = await sharp(emblemBuf)
    .resize(sizePx, sizePx, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const placed = await sharp(resizedEmblem).metadata();
  const placedW = placed.width ?? sizePx;
  const placedH = placed.height ?? sizePx;
  const { left, top } = emblemCompositeOffset(
    corner,
    placedW,
    placedH,
    marginPx,
  );

  await mkdir(path.dirname(input.outPath), { recursive: true });

  // NEVER cover-crop aggregator output — preserve full GPT Image frame, then paste logo.
  const base = await normalizeSlideToFrame(input.slidePath);
  await sharp(base)
    .composite([{ input: resizedEmblem, left, top }])
    .png()
    .toFile(input.outPath);

  return {
    outPath: input.outPath,
    corner,
    emblemSha256,
    left,
    top,
    sizePx,
    placedW,
    placedH,
    wordmarkHex,
  };
}

export function resolveLogoBakeEmblemPath(
  override?: string | null,
): string | null {
  if (override === null) return null;
  if (override?.trim()) return override.trim();
  return resolveVernatunEmblemPath();
}

export type LogoBakeJobMeta = {
  corner: LogoCorner;
  sizePx: number;
  emblemPath: string;
  /**
   * Per-slide wordmark tint. Keys = slide index ("1","2",…).
   * Auto-filled on bake; AD locks mark slides in adLockedBySlide.
   */
  wordmarkBySlide?: Record<string, string>;
  /** Slides where AD forced tint — do not re-auto on next bake. */
  adLockedBySlide?: Record<string, boolean>;
  /** @deprecated series-wide — prefer wordmarkBySlide */
  wordmarkHex?: string;
  emblemSha256?: string;
};

export async function readLogoBakeJobMeta(
  jobDir: string,
): Promise<LogoBakeJobMeta | null> {
  try {
    const raw = await readFile(
      path.join(jobDir, "prompts", "logo_bake.json"),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<LogoBakeJobMeta>;
    if (
      parsed.corner &&
      LOGO_CORNERS.includes(parsed.corner as LogoCorner) &&
      parsed.emblemPath
    ) {
      const bySlide: Record<string, string> = {};
      if (parsed.wordmarkBySlide) {
        for (const [k, v] of Object.entries(parsed.wordmarkBySlide)) {
          bySlide[k] = normalizeWordmarkHex(v);
        }
      }
      return {
        corner: FIXED_LOGO_CORNER,
        sizePx: parsed.sizePx ?? DEFAULT_LOGO_BAKE_SIZE_PX,
        emblemPath: parsed.emblemPath,
        wordmarkBySlide: Object.keys(bySlide).length ? bySlide : undefined,
        adLockedBySlide: parsed.adLockedBySlide,
        wordmarkHex: parsed.wordmarkHex
          ? normalizeWordmarkHex(parsed.wordmarkHex)
          : undefined,
        emblemSha256: parsed.emblemSha256,
      };
    }
  } catch {
    /* */
  }
  return null;
}

export async function writeLogoBakeJobMeta(
  jobDir: string,
  meta: LogoBakeJobMeta,
): Promise<void> {
  const promptsDir = path.join(jobDir, "prompts");
  await mkdir(promptsDir, { recursive: true });
  await writeFile(
    path.join(promptsDir, "logo_bake.json"),
    JSON.stringify(meta, null, 2),
    "utf8",
  );
}

export async function ensureLogoBakeJobMeta(
  jobDir: string,
  jobId: string,
  emblemPath: string,
  sizePx = DEFAULT_LOGO_BAKE_SIZE_PX,
): Promise<LogoBakeJobMeta> {
  const existing = await readLogoBakeJobMeta(jobDir);
  if (existing) {
    // Force product lock: always top-right (migrate older random-corner jobs).
    const next = {
      ...existing,
      corner: FIXED_LOGO_CORNER,
      emblemPath: existing.emblemPath || emblemPath,
      sizePx: existing.sizePx || sizePx,
    };
    if (existing.corner !== FIXED_LOGO_CORNER) {
      await writeLogoBakeJobMeta(jobDir, next);
    }
    return next;
  }
  const meta: LogoBakeJobMeta = {
    corner: FIXED_LOGO_CORNER,
    sizePx,
    emblemPath,
  };
  await writeLogoBakeJobMeta(jobDir, meta);
  return meta;
}

/**
 * Resolve wordmark tint for ONE slide.
 * Priority: AD lock for that slide > auto sample this slide's wordmark band.
 */
export async function resolveWordmarkHexForSlide(input: {
  meta: LogoBakeJobMeta;
  slideIndex: number;
  slidePath: string;
}): Promise<{ wordmarkHex: string; luminance: number }> {
  const key = String(input.slideIndex);
  const stored = input.meta.wordmarkBySlide?.[key];
  if (input.meta.adLockedBySlide?.[key] && stored) {
    return { wordmarkHex: normalizeWordmarkHex(stored), luminance: -1 };
  }

  const lum = await sampleSlideCornerLuminance({
    slidePath: input.slidePath,
    corner: input.meta.corner,
    boxW: input.meta.sizePx,
    boxH: input.meta.sizePx,
  });
  return {
    wordmarkHex: pickWordmarkHexForLuminance(lum),
    luminance: lum,
  };
}

/** Merge AD per-slide wordmark overrides into job meta (locks those slides). */
export async function applyWordmarkOverridesToMeta(
  jobDir: string,
  meta: LogoBakeJobMeta,
  overrides: Record<number, string>,
): Promise<LogoBakeJobMeta> {
  const next: LogoBakeJobMeta = {
    ...meta,
    wordmarkBySlide: { ...(meta.wordmarkBySlide || {}) },
    adLockedBySlide: { ...(meta.adLockedBySlide || {}) },
  };
  for (const [idx, hex] of Object.entries(overrides)) {
    const k = String(idx);
    next.wordmarkBySlide![k] = normalizeWordmarkHex(hex);
    next.adLockedBySlide![k] = true;
  }
  await writeLogoBakeJobMeta(jobDir, next);
  return next;
}

/** @deprecated use resolveWordmarkHexForSlide — kept for rebake CLI */
export async function resolveSeriesWordmarkHex(input: {
  jobDir: string;
  meta: LogoBakeJobMeta;
  sampleSlidePath?: string;
  adOverrideHex?: string | null;
}): Promise<{ meta: LogoBakeJobMeta; wordmarkHex: string }> {
  let meta = { ...input.meta };
  if (input.adOverrideHex) {
    meta = await applyWordmarkOverridesToMeta(input.jobDir, meta, {
      1: input.adOverrideHex,
    });
    return {
      meta,
      wordmarkHex: normalizeWordmarkHex(input.adOverrideHex),
    };
  }
  if (input.sampleSlidePath) {
    const r = await resolveWordmarkHexForSlide({
      meta,
      slideIndex: 1,
      slidePath: input.sampleSlidePath,
    });
    return { meta, wordmarkHex: r.wordmarkHex };
  }
  return { meta, wordmarkHex: WORDMARK_WHITE };
}

export function cornerPromptLabel(corner: LogoCorner): string {
  switch (corner) {
    case "tr":
      return "TOP-RIGHT";
    case "tl":
      return "TOP-LEFT";
    case "br":
      return "BOTTOM-RIGHT";
    case "bl":
      return "BOTTOM-LEFT";
  }
}
