/**
 * One-shot: re-composite layered smoke finals from existing .bg.png plates
 * (data URI embed — Playwright setContent cannot load file:// reliably).
 * Does NOT call image/LLM APIs.
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const jobId = process.argv[2] || "sheet_f49f4cfa0ddb4dbf";
const outDir = path.join(process.cwd(), "public", "generated", "carousel", jobId);
const docsDir = path.join(process.cwd(), "docs", "карусель тест", "layered-smoke-4");
const mediaDir = path.join(process.cwd(), "generatedMedia", "layered-smoke-4");

async function fileToDataUri(absPath: string): Promise<string> {
  const buf = await readFile(absPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function screenshotHtmlToPng(html: string, outPath: string) {
  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });
    await page.screenshot({
      path: outPath,
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
    });
    await page.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(docsDir, { recursive: true });
  await mkdir(mediaDir, { recursive: true });

  for (let i = 1; i <= 4; i++) {
    const n = String(i).padStart(2, "0");
    const htmlPath = path.join(outDir, `slide_${n}.html`);
    const bgPath = path.join(outDir, `slide_${n}.bg.png`);
    const outPng = path.join(outDir, `slide_${n}.png`);
    let html = await readFile(htmlPath, "utf8");
    const dataUri = await fileToDataUri(bgPath);
    html = html.replace(
      /background-image:\s*url\("[^"]+"\)/,
      `background-image: url("${dataUri}")`,
    );
    html = html.replace(
      /background:\s*linear-gradient\(\s*180deg,\s*rgba\(0,0,0,0\.28\)[\s\S]*?\);/,
      "background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 42%, rgba(0,0,0,0.45) 100%);",
    );
    await writeFile(htmlPath, html, "utf8");
    await screenshotHtmlToPng(html, outPng);
    await copyFile(outPng, path.join(docsDir, `slide_${n}.png`));
    await copyFile(outPng, path.join(mediaDir, `slide_${n}.png`));
    const st = (await readFile(outPng)).byteLength;
    // eslint-disable-next-line no-console -- recompose
    console.log("[recompose]", n, st, "bytes");
  }
  // eslint-disable-next-line no-console -- recompose
  console.log("[recompose] done");
}

main().catch((err) => {
  // eslint-disable-next-line no-console -- recompose
  console.error(err);
  process.exitCode = 1;
});
