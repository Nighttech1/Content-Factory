/**
 * overlay_cutout helpers: SINGLE conductor pose plate — never paste a multi-pose sheet.
 * Primary: image model with sheet as style ref.
 * Soft-fail: Playwright crop of one cell from a 2×3 (or NxM) sheet.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/** Anush sheet etalon layout: 2 cols × 3 rows (571×1024). */
export const DEFAULT_SHEET_COLS = 2;
export const DEFAULT_SHEET_ROWS = 3;

/** Cover = standing present (0); last/CTA = hands-on-hips energy (3). */
export function defaultPoseCellForSlide(
  slideIndex0: number,
  slideTotal: number,
): number {
  if (slideIndex0 <= 0) return 0;
  if (slideIndex0 >= slideTotal - 1) return 3;
  return 0;
}

export function looksLikeCharacterSheetUrl(ref: string): boolean {
  const s = ref.trim().toLowerCase();
  return (
    s.includes("sheet") ||
    s.includes("character-sheet") ||
    s.includes("anush-sheet")
  );
}

/**
 * Crop ONE cell from a character sheet via Playwright (no sharp).
 * Returns absolute PNG path, or null on failure.
 */
export async function cropSinglePoseFromSheet(opts: {
  /** data: URI or absolute/local path or /public URL */
  sheetSrc: string;
  outDir?: string;
  cellIndex?: number;
  cols?: number;
  rows?: number;
  /** Optional label for filename */
  label?: string;
}): Promise<string | null> {
  const cols = Math.max(1, opts.cols ?? DEFAULT_SHEET_COLS);
  const rows = Math.max(1, opts.rows ?? DEFAULT_SHEET_ROWS);
  const cell = Math.max(
    0,
    Math.min((opts.cellIndex ?? 0) | 0, cols * rows - 1),
  );
  const col = cell % cols;
  const row = Math.floor(cell / cols);

  const outDir =
    opts.outDir?.trim() ||
    path.join(process.cwd(), "generatedMedia", "cutout-poses");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(
    outDir,
    `pose-${opts.label ?? "cell"}${cell}-${randomUUID().slice(0, 8)}.png`,
  );

  const src = opts.sheetSrc.trim();
  if (!src) return null;

  // Probe natural size via HTML, then clip one cell.
  const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  html,body{margin:0;padding:0;background:transparent;}
  #frame{position:relative;overflow:hidden;background:transparent;}
  #sheet{position:absolute;left:0;top:0;display:block;}
</style></head><body>
<div id="frame"><img id="sheet" src="${src.replace(/"/g, "&quot;")}" alt=""/></div>
<script>
  const img = document.getElementById('sheet');
  const frame = document.getElementById('frame');
  const cols = ${cols};
  const rows = ${rows};
  const col = ${col};
  const row = ${row};
  function layout() {
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    if (!w || !h) return false;
    const cw = Math.floor(w / cols);
    const ch = Math.floor(h / rows);
    frame.style.width = cw + 'px';
    frame.style.height = ch + 'px';
    img.style.width = w + 'px';
    img.style.height = h + 'px';
    img.style.left = (-col * cw) + 'px';
    img.style.top = (-row * ch) + 'px';
    return true;
  }
  window.__ready = new Promise((resolve) => {
    const done = () => resolve(layout());
    if (img.complete && img.naturalWidth) done();
    else { img.onload = done; img.onerror = () => resolve(false); }
  });
</script>
</body></html>`;

  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage({
        deviceScaleFactor: 1,
        // temporary; resized after layout
        viewport: { width: 512, height: 768 },
      });
      await page.setContent(html, { waitUntil: "load", timeout: 45_000 });
      const ok = await page.evaluate(async () => {
        // @ts-expect-error injected
        return Boolean(await window.__ready);
      });
      if (!ok) {
        await page.close();
        return null;
      }
      const box = await page.evaluate(() => {
        const frame = document.getElementById("frame");
        if (!frame) return null;
        const r = frame.getBoundingClientRect();
        return {
          width: Math.max(1, Math.round(r.width)),
          height: Math.max(1, Math.round(r.height)),
        };
      });
      if (!box) {
        await page.close();
        return null;
      }
      await page.setViewportSize({ width: box.width, height: box.height });
      await page.screenshot({
        path: outPath,
        type: "png",
        omitBackground: true,
        clip: { x: 0, y: 0, width: box.width, height: box.height },
      });
      await page.close();
      return outPath;
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch {
    return null;
  }
}

/**
 * Knock out light / checkerboard studio bg → true PNG alpha (Playwright canvas).
 * Keeps the girl pixels; removes near-white and checkerboard pairs.
 */
export async function knockoutCutoutBackground(opts: {
  srcDataUriOrPath: string;
  outPath: string;
  /** 0–255 luminance threshold for near-white (default 235) */
  whiteThreshold?: number;
}): Promise<string | null> {
  const src = opts.srcDataUriOrPath.trim();
  if (!src) return null;
  const threshold = opts.whiteThreshold ?? 235;
  const html = `<!doctype html><html><body style="margin:0;background:transparent">
<canvas id="c"></canvas>
<img id="i" src="${src.replace(/"/g, "&quot;")}" style="display:none" alt=""/>
<script>
window.__done = new Promise((resolve) => {
  const img = document.getElementById('i');
  const run = () => {
    try {
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) return resolve(false);
      const c = document.getElementById('c');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      const thr = ${threshold};
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        const lum = 0.299*r + 0.587*g + 0.114*b;
        // near-white / light gray studio
        if (lum >= thr && (max - min) < 28) { d[i+3] = 0; continue; }
        // checkerboard-ish light cells (very light gray)
        if (lum >= 210 && (max - min) < 18) { d[i+3] = 0; continue; }
      }
      ctx.putImageData(id, 0, 0);
      resolve(true);
    } catch (e) { resolve(false); }
  };
  if (img.complete && img.naturalWidth) run();
  else { img.onload = run; img.onerror = () => resolve(false); }
});
</script></body></html>`;

  try {
    await mkdir(path.dirname(opts.outPath), { recursive: true });
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage({ deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: "load", timeout: 45_000 });
      const ok = await page.evaluate(async () => {
        // @ts-expect-error injected
        return Boolean(await window.__done);
      });
      if (!ok) {
        await page.close();
        return null;
      }
      const box = await page.evaluate(() => {
        const c = document.getElementById("c") as HTMLCanvasElement | null;
        if (!c) return null;
        return { width: c.width, height: c.height };
      });
      if (!box?.width || !box?.height) {
        await page.close();
        return null;
      }
      await page.setViewportSize({ width: box.width, height: box.height });
      const canvas = page.locator("#c");
      await canvas.screenshot({
        path: opts.outPath,
        type: "png",
        omitBackground: true,
      });
      await page.close();
      return opts.outPath;
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch {
    return null;
  }
}

/** Persist a remote/data cutout URL to disk as PNG/JPEG bytes when possible. */
export async function materializeCutoutUrlToFile(
  url: string,
  outDir?: string,
  label?: string,
): Promise<string | null> {
  const raw = url.trim();
  if (!raw) return null;
  const dir =
    outDir?.trim() ||
    path.join(process.cwd(), "generatedMedia", "cutout-poses");
  await mkdir(dir, { recursive: true });
  try {
    if (raw.startsWith("data:")) {
      const m = /^data:([^;]+);base64,(.+)$/i.exec(raw);
      if (!m) return null;
      const mime = m[1] || "image/png";
      const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
      const outPath = path.join(
        dir,
        `pose-gen-${label ?? "x"}-${randomUUID().slice(0, 8)}.${ext}`,
      );
      await writeFile(outPath, Buffer.from(m[2]!, "base64"));
      return outPath;
    }
    const res = await fetch(raw);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32) return null;
    const ct = res.headers.get("content-type") || "image/png";
    const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : "png";
    const outPath = path.join(
      dir,
      `pose-gen-${label ?? "x"}-${randomUUID().slice(0, 8)}.${ext}`,
    );
    await writeFile(outPath, buf);
    return outPath;
  } catch {
    return null;
  }
}
