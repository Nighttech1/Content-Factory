/**
 * B4.5 — Exact HY—RU vocab pill via HTML/Playwright (not GPT glyphs).
 * GPT (as layout AD) freely places ONE empty dashed VOCAB_SLOT by composition;
 * post-pass detects that guide and covers it with the exact pill (size ≈ guide).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { FRAME_H, FRAME_W } from "./renderer";
import { parseHyRuVocab } from "./hy-text";

export type VocabSlotId = "FREE" | "BL";

/** Fallback only if orange guide not found. */
export const VOCAB_FALLBACK_RECT = {
  left: 48,
  top: 1180,
  width: 420,
  height: 78,
} as const;

/**
 * Mid + cover/CTA: dashed slot expected (AI chooses place).
 * `slot` kept for logs; placement is FREE / detect-based.
 */
export function pickVocabSlot(
  slideIndex: number,
  _slideCount: number,
): { dashed: boolean; slot: VocabSlotId } {
  void slideIndex;
  return { dashed: true, slot: "FREE" };
}

/** Prompt: AI freely places empty dashed pocket for HY insert. */
export function vocabSlotPromptBlock(input: {
  dashed: boolean;
  slot: VocabSlotId;
}): string {
  void input.slot;
  // Default (B4.7): NO marker drawn on the image. The exact HY—RU pill is placed
  // by post-pass onto a clean area the Art Director picks from the FINISHED render
  // (vocab-guide-vision) — so there are no dashes to erase and no wipe traces on
  // textured photos. Legacy dashed VOCAB_SLOT only when CAROUSEL_VOCAB_DRAW_SLOT=1.
  if (process.env.CAROUSEL_VOCAB_DRAW_SLOT === "1" && input.dashed) {
    return `VOCAB SLOT (HARD — composition-driven; Art Director of the frame decides WHERE):
- Draw ONE empty dashed/dotted rounded rectangle for a future Armenian vocab chip.
- Size SMALL: about 280–380px wide × **60–80px tall** — a single-line chip pocket, NOT a tall box. Soft corners OK.
- HARD: do NOT draw a big/tall rectangle. The pocket is ~one text line high; a tall slot leaves visible dashed bands around the final pill.
- PLACE FREELY by composition: under text, beside a photo subject, on a quiet wall/sky patch, lower third, mid-left — wherever it looks best for THIS slide. Not forced under the headline.
- HARD: do NOT overlap headline, body copy, or CTA text — leave clear air so the future orange pill won't cover readable words.
- HARD: do NOT cover faces/eyes/hands that are the hero of the frame.
- Inside: COMPLETELY EMPTY — no letters, no Armenian, no Russian, no icons, no fill plate.
- Stroke ONLY: dashed/dotted ELECTRIC CYAN (#00E8FF) — machine marker. NOT orange, NOT gray, NOT brown, NOT purple/magenta (purple bg would hide magenta).
- Stroke weight ~3–5px, gap obvious. One pocket only. Cyan must stay neon-bright so post-pass can find it on ANY photo (warm wood OR violet walls).
- FORBIDDEN: TOP-RIGHT logo air (x=852..1052, y=28..264); BOTTOM-RIGHT arrow air (x≈860..1044, y≈1190..1314); more than one slot; painting any Armenian glyphs; orange/gray/magenta guides.
- Post-pass HTML will paste the exact orange HY—RU design pill ON TOP of this cyan dashed pocket (covering it completely).`;
  }
  return `VOCAB (HARD — NO marker on the image):
- Do NOT draw any Armenian vocab chip, box, dashed/dotted frame, placeholder, or line anywhere on the slide. No Armenian letters.
- Instead leave ONE calm, uncluttered pocket (a quiet wall/sky patch, lower third, or beside the subject) with clear EMPTY space — nothing drawn there.
- HARD: that calm area must NOT overlap the headline, body, CTA text, or faces/hands.
- The exact orange HY—RU pill is composited later onto that clean area — the Art Director picks the position from the FINISHED image (post-pass). Keep the area visually simple so the chip reads.`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * True capsule / oval chip (like early e57af33d): fully rounded ends,
 * width fits the HY—RU label (no clipping), transparent corners.
 */
export async function renderVocabPlaquePng(input: {
  hyRu: string;
  accentHex?: string;
  outPath: string;
  /** Ignored for layout — kept for API compat; size comes from text. */
  widthPx?: number;
  heightPx?: number;
}): Promise<{ outPath: string; width: number; height: number }> {
  const pair = parseHyRuVocab(input.hyRu);
  const label = pair
    ? `${pair.hy} — ${pair.ru}`
    : input.hyRu.trim() || "—";
  const accent = input.accentHex?.trim() || "#F58220";
  // Fixed capsule height (oval ends = radius h/2). Ignore tall guide heights.
  const h = Math.max(64, Math.min(84, input.heightPx ?? 72));
  const fontSize = Math.max(20, Math.min(26, Math.floor(h * 0.38)));
  // Generous side air so HY glyphs never kiss the capsule curve
  const padX = Math.max(36, Math.floor(h * 0.55));

  // Wide canvas; we screenshot only .pill after measuring text.
  const canvasW = 900;
  const canvasH = h + 24;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@600;700&family=Manrope:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{
  width:${canvasW}px;height:${canvasH}px;
  background:transparent;overflow:hidden;
  display:flex;align-items:center;justify-content:flex-start;
}
.pill{
  display:inline-flex;align-items:center;justify-content:center;
  height:${h}px;
  padding:0 ${padX}px;
  border-radius:${Math.floor(h / 2)}px;
  background:${accent};
  box-shadow:0 6px 18px rgba(0,0,0,.28);
  font-family:"Noto Sans Armenian","Manrope",sans-serif;
  font-weight:700;
  font-size:${fontSize}px;
  letter-spacing:0.02em;
  color:#fff;
  white-space:nowrap;
  width:max-content;
  max-width:${canvasW - 16}px;
}
</style></head><body><div class="pill">${escapeHtml(label)}</div></body></html>`;

  await mkdir(path.dirname(input.outPath), { recursive: true });
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: canvasW, height: canvasH },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    // Wait fonts so Armenian glyphs measure correctly
    await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any).fonts?.ready?.catch?.(() => undefined);
    });
    await new Promise((r) => setTimeout(r, 200));
    const pill = page.locator(".pill").first();
    const box = await pill.boundingBox();
    if (!box || box.width < 40) {
      throw new Error("vocab pill failed to layout");
    }
    // Transparent corners → true oval on the photo (NOT a filled square)
    await pill.screenshot({
      path: input.outPath,
      type: "png",
      omitBackground: true,
      animations: "disabled",
    });
    await page.close();
    return {
      outPath: input.outPath,
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export type VocabDetectSource =
  | "geometry"
  | "ink"
  | "ad_vision"
  | "fallback";

export type BakeVocabPlaqueResult = {
  slideIndex: number;
  outPath: string;
  slot: VocabSlotId;
  dashedExpected: boolean;
  hyRu: string;
  left: number;
  top: number;
  detected: boolean;
  detectSource?: VocabDetectSource;
  guideW?: number;
  guideH?: number;
};

/**
 * Machine guide stroke detector.
 * PRIMARY: electric cyan #00E8FF — survives purple/violet photo backgrounds
 *   (magenta would disappear on violet walls).
 * LEGACY: magenta #FF2BD6 — still detected so older jobs can rebake.
 */
function isCyanGuide(r: number, g: number, b: number): boolean {
  // Neon cyan: low R, high G+B
  return r < 110 && g > 170 && b > 180 && g + b > r * 3.2 && Math.abs(g - b) < 90;
}

function isMagentaGuide(r: number, g: number, b: number): boolean {
  return (
    r > 185 &&
    b > 130 &&
    g < 95 &&
    r > g + 60 &&
    b > g + 50 &&
    r + b > g * 3
  );
}

function isMachineGuide(r: number, g: number, b: number): boolean {
  return isCyanGuide(r, g, b) || isMagentaGuide(r, g, b);
}

/**
 * Looser edges for bbox / inpaint (cyan + legacy magenta).
 * Cyan is STRICT vs sky blues: neon needs very low R + both G/B high + close.
 */
function isMachineGuideLoose(r: number, g: number, b: number): boolean {
  const cyan =
    r < 95 &&
    g > 175 &&
    b > 185 &&
    g + b > r * 4 &&
    Math.abs(g - b) < 75 &&
    b > r + 80;
  const magenta =
    r >= 160 &&
    b >= 110 &&
    g < 100 &&
    r > g + 45 &&
    b > g + 30 &&
    r + b > g * 2.5;
  return cyan || magenta;
}

type GuideRect = { left: number; top: number; width: number; height: number };

/** Any remaining magenta ink (even thin leftover dashes after a partial cover). */
export async function findAnyMagentaInkRect(
  slidePath: string,
): Promise<GuideRect | null> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(slidePath)
      .resize(FRAME_W, FRAME_H, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    let n = 0;
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= 852 && y <= 264) continue;
        const i = (y * w + x) * ch;
        if (isMachineGuideLoose(data[i]!, data[i + 1]!, data[i + 2]!)) {
          n += 1;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (n < 40) return null;
    const pad = 20;
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    return {
      left,
      top,
      width: Math.min(FRAME_W - left, maxX - minX + 1 + pad * 2),
      height: Math.min(FRAME_H - top, maxY - minY + 1 + pad * 2),
    };
  } catch {
    return null;
  }
}

/**
 * Find dashed VOCAB_SLOT wherever composition put it (magenta machine guide).
 * Dashes are disconnected → dilate, then pick hollow wide pocket.
 * (Kept export name for callers; orange brand guides were unreliable on warm photos.)
 */
export async function findOrangeVocabGuideRect(
  slidePath: string,
): Promise<GuideRect | null> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(slidePath)
      .resize(FRAME_W, FRAME_H, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const logoL = 852;
    const logoB = 264;
    // Skip BR swipe-arrow air (same pocket as slide-arrow-bake)
    const arrowL = 840;
    const arrowT = 1180;

    // 1) Seed mask — machine guide (cyan/magenta), skip logo + arrow air
    const seed = new Uint8Array(w * h);
    let seedN = 0;
    let sMinX = w;
    let sMinY = h;
    let sMaxX = 0;
    let sMaxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= logoL && y <= logoB) continue;
        if (x >= arrowL && y >= arrowT) continue;
        const i = (y * w + x) * ch;
        if (isMachineGuideLoose(data[i]!, data[i + 1]!, data[i + 2]!)) {
          seed[y * w + x] = 1;
          seedN += 1;
          if (x < sMinX) sMinX = x;
          if (y < sMinY) sMinY = y;
          if (x > sMaxX) sMaxX = x;
          if (y > sMaxY) sMaxY = y;
        }
      }
    }
    if (seedN < 80) return null;

    const hollowCenter = (
      left: number,
      top: number,
      width: number,
      height: number,
    ): number => {
      let centerHits = 0;
      let centerN = 0;
      const cx0 = left + Math.floor(width * 0.25);
      const cx1 = left + Math.floor(width * 0.75);
      const cy0 = top + Math.floor(height * 0.25);
      const cy1 = top + Math.floor(height * 0.75);
      for (let y = cy0; y < cy1; y += 2) {
        for (let x = cx0; x < cx1; x += 2) {
          centerN += 1;
          if (seed[y * w + x]) centerHits += 1;
        }
      }
      return centerN ? centerHits / centerN : 1;
    };

    /** Count guide↔gap toggles on top+bottom edges — dashed ≫ solid. */
    const dashedEdgeScore = (
      left: number,
      top: number,
      width: number,
      height: number,
    ): number => {
      let toggles = 0;
      const sampleRow = (y: number) => {
        let prev = -1;
        for (let x = left; x <= left + width; x += 2) {
          const v = seed[y * w + x] ? 1 : 0;
          if (prev >= 0 && v !== prev) toggles += 1;
          prev = v;
        }
      };
      sampleRow(Math.min(h - 1, top));
      sampleRow(Math.min(h - 1, top + height - 1));
      return toggles;
    };

    const padOut = (r: GuideRect): GuideRect => {
      const pad = 16;
      const left = Math.max(0, r.left - pad);
      const top = Math.max(0, r.top - pad);
      return {
        left,
        top,
        width: Math.min(FRAME_W - left, r.width + pad * 2),
        height: Math.min(FRAME_H - top, r.height + pad * 2),
      };
    };

    // 2) Fast path: union bbox is chip-sized + hollow + dashed-ish edges
    {
      const width = sMaxX - sMinX + 1;
      const height = sMaxY - sMinY + 1;
      const aspect = width / Math.max(1, height);
      const centerRatio = hollowCenter(sMinX, sMinY, width, height);
      const dash = dashedEdgeScore(sMinX, sMinY, width, height);
      if (
        seedN >= 200 &&
        width >= 160 &&
        width <= 520 &&
        height >= 48 &&
        height <= 220 &&
        aspect >= 1.6 &&
        aspect <= 10 &&
        centerRatio <= 0.35 &&
        dash >= 4
      ) {
        return padOut({ left: sMinX, top: sMinY, width, height });
      }
    }

    // 3) Dilate ~12px to bridge dash gaps, then largest hollow CC
    const dilateR = 12;
    const mask = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!seed[y * w + x]) continue;
        for (let dy = -dilateR; dy <= dilateR; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -dilateR; dx <= dilateR; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            if (dx * dx + dy * dy > dilateR * dilateR) continue;
            mask[ny * w + nx] = 1;
          }
        }
      }
    }

    const seen = new Uint8Array(w * h);
    type Comp = {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      n: number;
    };
    const comps: Comp[] = [];
    const qx = new Int32Array(w * h);
    const qy = new Int32Array(w * h);
    const neigh: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const id = y * w + x;
        if (!mask[id] || seen[id]) continue;
        let qh = 0;
        let qt = 0;
        qx[qt] = x;
        qy[qt] = y;
        qt += 1;
        seen[id] = 1;
        let minX = x;
        let minY = y;
        let maxX = x;
        let maxY = y;
        let cn = 0;
        while (qh < qt) {
          const cx = qx[qh]!;
          const cy = qy[qh]!;
          qh += 1;
          cn += 1;
          if (cx < minX) minX = cx;
          if (cy < minY) minY = cy;
          if (cx > maxX) maxX = cx;
          if (cy > maxY) maxY = cy;
          for (const [dx, dy] of neigh) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const nid = ny * w + nx;
            if (!mask[nid] || seen[nid]) continue;
            seen[nid] = 1;
            qx[qt] = nx;
            qy[qt] = ny;
            qt += 1;
          }
        }
        comps.push({ minX, minY, maxX, maxY, n: cn });
      }
    }

    type Cand = GuideRect & { score: number };
    const cands: Cand[] = [];
    for (const c of comps) {
      const width = c.maxX - c.minX + 1;
      const height = c.maxY - c.minY + 1;
      if (width < 140 || height < 40 || width > 560 || height > 220) continue;
      const aspect = width / Math.max(1, height);
      if (aspect < 1.6 || aspect > 12) continue;
      const centerRatio = hollowCenter(c.minX, c.minY, width, height);
      if (centerRatio > 0.35) continue;
      const dash = dashedEdgeScore(c.minX, c.minY, width, height);
      // Prefer dashed rings over solid blobs (geometry, not only color)
      const score =
        (1 - centerRatio) * 3 +
        Math.min(2, dash / 4) +
        Math.min(1, aspect / 5) +
        (width > 220 && width < 480 ? 0.5 : 0) +
        Math.min(1, c.n / 8000);
      cands.push({
        left: c.minX,
        top: c.minY,
        width,
        height,
        score,
      });
    }

    if (!cands.length) return null;
    cands.sort((a, b) => b.score - a.score);
    return padOut(cands[0]!);
  } catch {
    return null;
  }
}

/** Composite exact vocab pill onto slide (after logo_bake). */
export async function bakeVocabPlaqueOntoSlide(input: {
  slidePath: string;
  outPath: string;
  hyRu: string;
  slot: VocabSlotId;
  dashedExpected: boolean;
  accentHex?: string;
  jobDir?: string;
  slideIndex: number;
  /** Optional job LLM session — AD vision fallback shares transcript. */
  session?: import("./job-llm-session").JobLlmSession;
}): Promise<BakeVocabPlaqueResult> {
  const sharp = (await import("sharp")).default;
  const accent = input.accentHex?.trim() || "#F58220";
  // Geometry-validated chip FIRST — raw ink bbox can swallow sky blues / noise
  const chip = await findOrangeVocabGuideRect(input.slidePath);
  const ink = chip ? null : await findAnyMagentaInkRect(input.slidePath);
  let detectSource: VocabDetectSource = chip
    ? "geometry"
    : ink
      ? "ink"
      : "fallback";
  let guide = chip ?? ink ?? null;

  // Miss → Art Director vision finds the dashed pocket coords
  if (!guide) {
    const { locateVocabGuideViaAdVision } = await import(
      "./vocab-guide-vision"
    );
    const vision = await locateVocabGuideViaAdVision({
      slidePath: input.slidePath,
      session: input.session,
    });
    if (vision) {
      guide = vision.rect;
      detectSource = "ad_vision";
    }
  }
  const detected = detectSource !== "fallback";
  if (!guide) guide = { ...VOCAB_FALLBACK_RECT };

  const tmpDir = input.jobDir
    ? path.join(input.jobDir, "vocab-plaques")
    : path.join(path.dirname(input.outPath), "_vocab");
  await mkdir(tmpDir, { recursive: true });
  const pillPath = path.join(
    tmpDir,
    `slide_${String(input.slideIndex).padStart(2, "0")}_pill.png`,
  );

  let workBuf = await sharp(input.slidePath)
    .resize(FRAME_W, FRAME_H, { fit: "fill" })
    .ensureAlpha()
    .png()
    .toBuffer();

  /**
   * Wipe the whole guide zone (not only exact color hits).
   * Dashed AA leftovers miss color gates — force a dilated mask + perimeter ring.
   */
  const wipeGuideZone = async (
    buf: Buffer,
    zone: GuideRect,
  ): Promise<Buffer> => {
    const { data, info } = await sharp(buf)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const src = data;
    const zL = Math.max(0, zone.left - 12);
    const zT = Math.max(0, zone.top - 12);
    const zR = Math.min(w - 1, zone.left + zone.width + 12);
    const zB = Math.min(h - 1, zone.top + zone.height + 12);

    // Seed: machine-guide pixels inside padded zone
    const seed = new Uint8Array(w * h);
    for (let y = zT; y <= zB; y++) {
      for (let x = zL; x <= zR; x++) {
        if (x >= 852 && y <= 264) continue;
        const i = (y * w + x) * ch;
        if (isMachineGuideLoose(src[i]!, src[i + 1]!, src[i + 2]!)) {
          seed[y * w + x] = 1;
        }
      }
    }
    // Perimeter ring of the original guide — catches near-miss AA
    const ring = 4;
    for (let y = zone.top; y < zone.top + zone.height; y++) {
      for (let x = zone.left; x < zone.left + zone.width; x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const onEdge =
          x < zone.left + ring ||
          x >= zone.left + zone.width - ring ||
          y < zone.top + ring ||
          y >= zone.top + zone.height - ring;
        if (!onEdge) continue;
        const i = (y * w + x) * ch;
        const r = src[i]!;
        const g = src[i + 1]!;
        const b = src[i + 2]!;
        // Soft magenta/cyan-ish (wider than loose) OR high chroma pink/cyan
        const softMag = r > 140 && b > 90 && g < 130 && r + b > g * 2;
        const softCyan = r < 130 && g > 140 && b > 150 && b > r + 40;
        if (softMag || softCyan || isMachineGuideLoose(r, g, b)) {
          seed[y * w + x] = 1;
        }
      }
    }
    // Dilate wipe mask just enough to bridge dash gaps — small, so the fill
    // hugs the thin dashes and does NOT smear a big blurry patch on textured
    // backgrounds (client reject: "нереальные следы" on the market slide).
    const dilateR = 6;
    const wipe = new Uint8Array(w * h);
    for (let y = zT; y <= zB; y++) {
      for (let x = zL; x <= zR; x++) {
        if (!seed[y * w + x]) continue;
        for (let dy = -dilateR; dy <= dilateR; dy++) {
          const ny = y + dy;
          if (ny < zT || ny > zB) continue;
          for (let dx = -dilateR; dx <= dilateR; dx++) {
            const nx = x + dx;
            if (nx < zL || nx > zR) continue;
            if (dx * dx + dy * dy > dilateR * dilateR) continue;
            wipe[ny * w + nx] = 1;
          }
        }
      }
    }

    // If the slot sits on a SMOOTH background (sky / plain wall), reconstruct the
    // WHOLE guide-rect interior, not just the dashes: GPT often paints a faint
    // HAZE inside the slot that is not cyan and survives the dash wipe, leaving a
    // box ghost (client reject: visible trace on slide 1). On a TEXTURED corner we
    // keep dash-only, since full reconstruction would blur the texture.
    {
      const bL = Math.max(0, zone.left - 20);
      const bR = Math.min(w - 1, zone.left + zone.width + 20);
      const bT = Math.max(0, zone.top - 20);
      const bB = Math.min(h - 1, zone.top + zone.height + 20);
      let ls = 0;
      let lss = 0;
      let ln = 0;
      for (let y = bT; y <= bB; y++) {
        for (let x = bL; x <= bR; x++) {
          const inside =
            x >= zone.left &&
            x < zone.left + zone.width &&
            y >= zone.top &&
            y < zone.top + zone.height;
          if (inside || wipe[y * w + x]) continue;
          const j = (y * w + x) * ch;
          const lum = 0.299 * src[j]! + 0.587 * src[j + 1]! + 0.114 * src[j + 2]!;
          ls += lum;
          lss += lum * lum;
          ln += 1;
        }
      }
      const mean = ln ? ls / ln : 0;
      const std = ln ? Math.sqrt(Math.max(0, lss / ln - mean * mean)) : 999;
      if (std < 26) {
        for (let y = zone.top; y < zone.top + zone.height; y++) {
          for (let x = zone.left; x < zone.left + zone.width; x++) {
            if (x < 0 || y < 0 || x >= w || y >= h) continue;
            if (x >= 852 && y <= 264) continue; // never touch logo air
            wipe[y * w + x] = 1;
          }
        }
      }
    }

    // Directional interpolation fill (NOT box-average): for each wiped pixel,
    // find the nearest clean pixel left/right and up/down, then LINEARLY
    // interpolate across each pair. On a smooth gradient linear interpolation
    // reproduces the gradient exactly, so no rectangular ghost remains. MAXW is
    // wide enough to span a full reconstructed slot rect.
    const out = Buffer.from(src);
    const MAXW = 320;
    type Hit = { j: number; d: number } | null;
    const isClean = (nx: number, ny: number): boolean => {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return false;
      if (wipe[ny * w + nx]) return false;
      const j = (ny * w + nx) * ch;
      return !isMachineGuideLoose(src[j]!, src[j + 1]!, src[j + 2]!);
    };
    const walk = (x: number, y: number, dx: number, dy: number): Hit => {
      let nx = x + dx;
      let ny = y + dy;
      let d = 1;
      while (d <= MAXW) {
        if (isClean(nx, ny)) return { j: (ny * w + nx) * ch, d };
        nx += dx;
        ny += dy;
        d += 1;
      }
      return null;
    };
    for (let y = zT; y <= zB; y++) {
      for (let x = zL; x <= zR; x++) {
        if (!wipe[y * w + x]) continue;
        const i = (y * w + x) * ch;
        const L = walk(x, y, -1, 0);
        const R2 = walk(x, y, 1, 0);
        const U = walk(x, y, 0, -1);
        const D = walk(x, y, 0, 1);
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let wsum = 0;
        const addPair = (a: Hit, b: Hit): void => {
          if (!a || !b) return;
          const tot = a.d + b.d;
          const wa = b.d / tot; // nearer endpoint weighs more
          const wb = a.d / tot;
          const weight = 1 / tot; // shorter span = more reliable
          sr += (src[a.j]! * wa + src[b.j]! * wb) * weight;
          sg += (src[a.j + 1]! * wa + src[b.j + 1]! * wb) * weight;
          sb += (src[a.j + 2]! * wa + src[b.j + 2]! * wb) * weight;
          wsum += weight;
        };
        addPair(L, R2);
        addPair(U, D);
        if (wsum === 0) {
          const near = [L, R2, U, D]
            .filter((h): h is { j: number; d: number } => h !== null)
            .sort((p, q) => p.d - q.d)[0];
          if (near) {
            sr = src[near.j]!;
            sg = src[near.j + 1]!;
            sb = src[near.j + 2]!;
            wsum = 1;
          }
        }
        if (wsum > 0) {
          out[i] = Math.round(sr / wsum);
          out[i + 1] = Math.round(sg / wsum);
          out[i + 2] = Math.round(sb / wsum);
        }
        if (ch === 4) out[i + 3] = 255;
      }
    }
    return sharp(out, {
      raw: { width: w, height: h, channels: ch as 3 | 4 },
    })
      .png()
      .toBuffer();
  };

  // Global leftover pass (thin dashes outside zone after soft AA)
  const inpaintLeftover = async (buf: Buffer): Promise<Buffer> => {
    const { data, info } = await sharp(buf)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;
    const src = data;
    const out = Buffer.from(src);
    const R = 5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= 852 && y <= 264) continue;
        const i = (y * w + x) * ch;
        if (!isMachineGuideLoose(src[i]!, src[i + 1]!, src[i + 2]!)) continue;
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let n = 0;
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = (ny * w + nx) * ch;
            if (isMachineGuideLoose(src[j]!, src[j + 1]!, src[j + 2]!)) continue;
            sr += src[j]!;
            sg += src[j + 1]!;
            sb += src[j + 2]!;
            n += 1;
          }
        }
        if (n > 0) {
          out[i] = Math.round(sr / n);
          out[i + 1] = Math.round(sg / n);
          out[i + 2] = Math.round(sb / n);
        }
        if (ch === 4) out[i + 3] = 255;
      }
    }
    return sharp(out, {
      raw: { width: w, height: h, channels: ch as 3 | 4 },
    })
      .png()
      .toBuffer();
  };

  // Remove the GPT dashed VOCAB_SLOT from the background BEFORE placing the pill.
  // Wipe the FULL detected guide bbox: the dashes sit on the whole rectangle
  // perimeter and GPT often oversizes the slot (guideH up to ~210px), so a
  // footprint-only wipe leaves visible dash bands above/below the smaller pill
  // (AD reject d9daaed7 slides 2–3 guide_artifact). Full-bbox wipe clears every
  // perimeter dash; the pill then covers the center. Slot height is pushed down
  // in vocabSlotPromptBlock so the wiped band stays tight to the pill.
  // Reconstruct the guide rect ONLY when a real COLOURED dashed slot was found by
  // pixel detection (geometry/ink). On ad_vision placement (AD picked a CLEAN area
  // by looking at the finished bg) or fallback there is NO guide drawn — running
  // the rect reconstruction over that area smears a GRAY box-ghost behind the pill
  // (client reject: «серый фон на хтмл плашке»). inpaintLeftover is colour-gated
  // (only machine-guide pixels) so it is safe either way.
  if (detectSource === "geometry" || detectSource === "ink") {
    workBuf = await wipeGuideZone(workBuf, guide);
    workBuf = await wipeGuideZone(workBuf, guide);
  }
  workBuf = await inpaintLeftover(workBuf);
  workBuf = await inpaintLeftover(workBuf);

  // Oval capsule sized to the actual text (not the dashed guide bbox)
  const rendered = await renderVocabPlaquePng({
    hyRu: input.hyRu,
    accentHex: accent,
    outPath: pillPath,
    heightPx: 72,
  });
  const coverW = rendered.width;
  const coverH = rendered.height;
  const gcx = guide.left + guide.width / 2;
  const gcy = guide.top + guide.height / 2;
  const coverLeft = Math.max(
    0,
    Math.min(FRAME_W - coverW, Math.round(gcx - coverW / 2)),
  );
  const coverTop = Math.max(
    0,
    Math.min(FRAME_H - coverH, Math.round(gcy - coverH / 2)),
  );

  // Keep alpha — flatten would turn the capsule back into a square plate
  const label = await sharp(pillPath).ensureAlpha().png().toBuffer();

  workBuf = await sharp(workBuf)
    .composite([{ input: label, left: coverLeft, top: coverTop }])
    .png()
    .toBuffer();

  // Final leftover wipe outside pill, then re-stamp pill
  workBuf = await inpaintLeftover(workBuf);
  workBuf = await sharp(workBuf)
    .composite([{ input: label, left: coverLeft, top: coverTop }])
    .png()
    .toBuffer();

  await sharp(workBuf).png().toFile(input.outPath);

  return {
    slideIndex: input.slideIndex,
    outPath: input.outPath,
    slot: input.slot,
    dashedExpected: input.dashedExpected,
    hyRu: input.hyRu,
    left: coverLeft,
    top: coverTop,
    detected,
    detectSource,
    guideW: guide.width,
    guideH: guide.height,
  };
}

export async function writeVocabBakeLog(
  jobDir: string,
  rows: BakeVocabPlaqueResult[],
): Promise<void> {
  await mkdir(path.join(jobDir, "prompts"), { recursive: true });
  await writeFile(
    path.join(jobDir, "prompts", "vocab_bake.json"),
    JSON.stringify({ slides: rows }, null, 2),
    "utf8",
  );
}
