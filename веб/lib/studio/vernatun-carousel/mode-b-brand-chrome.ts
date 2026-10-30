/**
 * Mode B: after AI full-slide (or exact user photo), composite Vernatun
 * logo + name. Default chrome = bare (no plaque / no glass bar).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { FRAME_H, FRAME_W } from "./renderer";

export type ModeBChromeStyle = "bare" | "float";

export type ModeBBrandChromeInput = {
  slidePngOrJpegPath: string;
  outPngPath: string;
  logoDataUrl: string;
  brandName: string;
  tagline: string;
  /** 0-based — rotates placement so series is not identical */
  slideIndex0: number;
  /** bare = logo+name on photo with shadow only (default). float = glass pill. */
  chromeStyle?: ModeBChromeStyle;
  /** Optional cover hook text overlaid on exact user photo */
  headline?: string;
  supporting?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function accentLastWord(headline: string): string {
  const parts = headline.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return escapeHtml(headline);
  const last = parts.pop()!;
  return `${escapeHtml(parts.join(" "))} <span class="accent">${escapeHtml(last)}</span>`;
}

function placementClass(index0: number): string {
  const places = ["br", "bl", "tr", "br"] as const;
  return places[index0 % places.length]!;
}

/**
 * Overlay brand chrome via Playwright screenshot of HTML composite.
 */
export async function applyModeBBrandChrome(
  input: ModeBBrandChromeInput,
): Promise<void> {
  const slideBuf = await readFile(input.slidePngOrJpegPath);
  const ext = path.extname(input.slidePngOrJpegPath);
  const mime =
    ext.toLowerCase() === ".jpg" || ext.toLowerCase() === ".jpeg"
      ? "image/jpeg"
      : ext.toLowerCase() === ".webp"
        ? "image/webp"
        : "image/png";
  const slideDataUrl = `data:${mime};base64,${slideBuf.toString("base64")}`;
  const place = placementClass(input.slideIndex0);
  const name = escapeHtml((input.brandName || "Vernatun").toUpperCase());
  const tag = escapeHtml(
    input.tagline || "moscow armenian speaking club",
  );
  const chrome = input.chromeStyle === "float" ? "float" : "bare";
  const headline = (input.headline || "").trim();
  const supporting = (input.supporting || "").trim();
  const typeBlock =
    headline || supporting
      ? `<div class="hook">
  ${headline ? `<h1>${accentLastWord(headline)}</h1>` : ""}
  ${supporting ? `<p class="sub">${escapeHtml(supporting)}</p>` : ""}
</div>`
      : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:${FRAME_W}px;height:${FRAME_H}px;overflow:hidden;background:#000}
.slide{position:relative;width:${FRAME_W}px;height:${FRAME_H}px}
.slide>img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(105deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.22) 45%,rgba(0,0,0,.12) 100%);z-index:1;pointer-events:none}
.hook{position:absolute;z-index:4;left:48px;top:120px;right:110px;max-width:920px;color:#fff;
  font-family:Arial,Helvetica,sans-serif;text-shadow:0 3px 18px rgba(0,0,0,.85),0 1px 3px rgba(0,0,0,.95)}
.hook h1{font-size:64px;line-height:1.08;font-weight:900;letter-spacing:-1px}
.hook h1 .accent{color:#F58220}
.hook .sub{margin-top:18px;font-size:26px;line-height:1.3;font-weight:600;max-width:720px}
.brand{
  position:absolute;z-index:5;display:flex;align-items:center;gap:14px;
  max-width:72%;color:#fff;
  font-family:Arial,Helvetica,sans-serif;
}
.brand.bare{
  background:transparent;border:none;padding:0;
  filter:drop-shadow(0 3px 14px rgba(0,0,0,.7));
}
.brand.float{
  padding:12px 16px;border-radius:18px;
  background:rgba(12,10,8,.55);backdrop-filter:blur(6px);
  border:1px solid rgba(255,255,255,.28);
}
.brand.br{right:36px;bottom:42px;flex-direction:row}
.brand.bl{left:36px;bottom:42px;flex-direction:row}
.brand.tr{right:36px;top:42px;flex-direction:row}
.brand img.logo{
  width:72px;height:72px;object-fit:contain;flex:0 0 auto;
  filter:drop-shadow(0 2px 8px rgba(0,0,0,.45));
}
.brand .meta{min-width:0}
.brand strong{display:block;font-size:22px;letter-spacing:2px;line-height:1.05;color:#fff}
.brand small{display:block;font-size:12px;letter-spacing:1px;margin-top:4px;color:rgba(255,255,255,.92)}
</style></head><body>
<article class="slide">
  <img class="bg" src="${slideDataUrl}" alt=""/>
  ${headline || supporting ? `<div class="shade"></div>${typeBlock}` : ""}
  <div class="brand ${chrome} ${place}">
    <img class="logo" src="${input.logoDataUrl}" alt="${name}"/>
    <div class="meta"><strong>${name}</strong><small>${tag}</small></div>
  </div>
</article>
</body></html>`;

  await mkdir(path.dirname(input.outPngPath), { recursive: true });
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: FRAME_W, height: FRAME_H },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await page.locator(".slide").first().screenshot({
      path: input.outPngPath,
      type: "png",
      animations: "disabled",
    });
    await page.close();
  } finally {
    await browser.close().catch(() => undefined);
  }
}

/** Absolute path for Vernatun lockup (wordmark) or emblem fallback. */
export function resolveVernatunEmblemPath(): string | null {
  const candidates = [
    path.join(process.cwd(), "brand", "vernatun-logo-lockup.png"),
    path.join(process.cwd(), "public", "brand", "vernatun-logo-lockup.png"),
    path.join(process.cwd(), "brand", "apple-touch-icon.png"),
    path.join(process.cwd(), "public", "brand", "apple-touch-icon.png"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/** Prefer brand/apple-touch-icon.png for Mode B chrome. */
export async function resolveVernatunEmblemDataUrl(
  fallbackLogoDataUrl: string,
): Promise<string> {
  const p = resolveVernatunEmblemPath();
  if (p) {
    try {
      const buf = await readFile(p);
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      /* fall through */
    }
  }
  return fallbackLogoDataUrl;
}
