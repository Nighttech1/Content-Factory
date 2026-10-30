/**
 * Montage readiness run — NO generation.
 * Rasters an EXISTING carousel's layered-html montage layer (image bg already
 * baked as data-URI + HTML/CSS overlay) to fresh PNG 1080×1350 via Playwright,
 * then runs a deterministic Art Director QA pass over the composites.
 *
 * Does NOT call any image / LLM API. Proves the montage team (Art Director lead)
 * can compose + raster carousels from ready plates.
 */

import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = "E:/Applications/Content factory/Content factory";
const jobId = process.argv[2] || "sheet_20319431c6a94291";
const jobDir = path.join(ROOT, "public", "generated", "carousel", jobId);
const outDir = path.join(ROOT, "generatedMedia", "readiness-montage", jobId);

const FRAME_W = 1080;
const FRAME_H = 1350;

type SlideMeta = {
  n: string;
  render: string;
  role: string;
  template: string;
  brandChrome: string;
  bgFit: string;
  bytes: number;
  width: number;
  height: number;
};

function readMarker(html: string, name: string, attr = "content"): string {
  const re = new RegExp(`${name}"\\s+${attr}="([^"]+)"`);
  const m = re.exec(html);
  return m ? m[1]! : "";
}

async function rasterHtmlToPng(html: string, outPath: string) {
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
    // give fonts/images a beat
    await page.waitForTimeout(400);
    await page.screenshot({
      path: outPath,
      type: "png",
      clip: { x: 0, y: 0, width: FRAME_W, height: FRAME_H },
    });
    await page.close();
  } finally {
    await browser.close();
  }
}

/** Minimal PNG IHDR reader — width/height from first 24 bytes. */
function pngSize(buf: Buffer): { width: number; height: number } {
  // PNG: 8-byte sig, then IHDR chunk length(4)+type(4)+width(4)+height(4)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

async function main() {
  if (!existsSync(jobDir)) {
    throw new Error(`Job dir not found: ${jobDir}`);
  }
  await mkdir(outDir, { recursive: true });

  const slides: SlideMeta[] = [];
  for (let i = 1; i <= 12; i++) {
    const n = String(i).padStart(2, "0");
    const htmlPath = path.join(jobDir, `slide_${n}.html`);
    if (!existsSync(htmlPath)) break;
    const html = await readFile(htmlPath, "utf8");
    const outPng = path.join(outDir, `slide_${n}.png`);

    // RASTER ONLY — no generation. bg image is already embedded in the HTML.
    await rasterHtmlToPng(html, outPng);

    const buf = await readFile(outPng);
    const { width, height } = pngSize(buf);
    const meta: SlideMeta = {
      n,
      render: readMarker(html, "cf-render"),
      role: readMarker(html, "cf-role"),
      template: readMarker(html, "cf-template"),
      brandChrome: readMarker(html, "data-brand-chrome", "").length
        ? ""
        : "",
      bgFit: readMarker(html, "cf-bg-fit"),
      bytes: buf.byteLength,
      width,
      height,
    };
    // brand chrome lives as data-brand-chrome="..."
    const bc = /data-brand-chrome="([^"]+)"/.exec(html);
    meta.brandChrome = bc ? bc[1]! : "none";
    slides.push(meta);
    // eslint-disable-next-line no-console
    console.log(
      `[montage] slide_${n} ${meta.render} role=${meta.role} tmpl=${meta.template} brand=${meta.brandChrome} bgFit=${meta.bgFit} ${width}x${height} ${buf.byteLength}b`,
    );
  }

  // ---- Art Director QA (deterministic, no LLM) ----
  const remarks: string[] = [];
  let hasBrand = false;
  for (const s of slides) {
    if (s.render !== "layered_html") {
      remarks.push(
        `slide_${s.n}: render=${s.render || "unknown"} (expected layered_html — background must be scene-only + HTML overlay)`,
      );
    }
    if (s.width !== FRAME_W || s.height !== FRAME_H) {
      remarks.push(
        `slide_${s.n}: raster ${s.width}x${s.height} ≠ ${FRAME_W}x${FRAME_H}`,
      );
    }
    if (s.bytes < 40_000) {
      remarks.push(`slide_${s.n}: suspiciously small PNG (${s.bytes}b) — blank?`);
    }
    if (s.brandChrome && s.brandChrome !== "none") hasBrand = true;
  }
  const cover = slides.find((s) => s.role === "cover");
  const cta = slides.find((s) => s.role === "cta_slide");
  if (!cover) remarks.push("no cover slide (role=cover) found");
  if (!cta) remarks.push("no CTA slide (role=cta_slide) found");
  if (!hasBrand) remarks.push("no brand chrome on any slide (Settings Brand missing)");

  const verdict = remarks.length === 0 ? "approve" : "remarks";

  const report = {
    jobId,
    generated: false,
    renderedAt: new Date().toISOString(),
    slideCount: slides.length,
    frame: `${FRAME_W}x${FRAME_H}`,
    slides,
    artDirector: {
      verdict,
      remarksCount: remarks.length,
      remarks,
      note: "NO auto-remake · raster-only · no image/LLM API called",
    },
  };
  const reportPath = path.join(outDir, "ART_DIRECTOR_REPORT.json");
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(`\n[ART DIRECTOR] verdict=${verdict} remarks=${remarks.length}`);
  for (const r of remarks) console.log("  · " + r);
  // eslint-disable-next-line no-console
  console.log(`\n[montage] out: ${outDir}`);
  console.log(`[montage] report: ${reportPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
