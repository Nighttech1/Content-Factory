/**
 * Deployer/Tester helper — HTML kits → sliced 4:5 PNGs for Client S44.B.
 *
 * Uses carouselHtmlBuilder + Playwright screenshot (no picsum).
 * Seed presets: dark_notes (3) + bento_glass (6) = 9 PNGs (budget ≤40).
 *
 *   npx tsx scripts/generate-wave-visual-artifacts-pngs.ts
 */

import { mkdir, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  createBentoGlassSeedPreset,
  createDarkNotesSeedPreset,
} from "../lib/settings/design-preset";
import {
  carouselHtmlBuilder,
  CAROUSEL_FRAME_HEIGHT,
  CAROUSEL_FRAME_WIDTH,
  type CarouselHtmlBuilderSlideIn,
} from "../lib/studio/carousel-html-renderer";
import {
  commitPngBudget,
  readPngBudget,
  reservePngBudget,
  waveVisualArtifactRoot,
  waveVisualPresetDir,
} from "../lib/studio/wave-visual-artifacts";

const DARK_NOTES_SLIDES: CarouselHtmlBuilderSlideIn[] = [
  {
    role: "cover",
    headline: "ՍՈՒՐՃԻ ԴՈԿՏՐԻՆԱ",
    body: "КОФЕ НА БЕГУ — ЭТО ПРЕСТУПЛЕНИЕ? Меняем длинный разговор на бумажный стакан.",
  },
  {
    role: "body_slide",
    headline: "Ռիտուալը",
    body: "В Ереване кофе — это паузы в реальности, а не топливо для спринта.",
  },
  {
    role: "cta_slide",
    headline: "Готов замедлиться?",
    body: "Պատրա՞ստ ես դանդաղել · Vernatun Armenian Club",
    captionLine: "Сохранить ритуал",
  },
];

const BENTO_GLASS_SLIDES: CarouselHtmlBuilderSlideIn[] = [
  {
    role: "cover",
    headline: "ՍՈՒՐՃԻ ԴՈԿՏՐԻՆԱ",
    body: "Кофе на бегу — это капитуляция. Vernatun glass hook.",
  },
  {
    role: "body_slide",
    headline: "Парадокс паузы",
    body: "45 минут ритуала против 3 минут to-go — что остаётся в теле.",
  },
  {
    role: "body_slide",
    headline: "Бумага vs керамика",
    body: "Анатомия стакана: value −86.5% · highlight 98%.",
  },
  {
    role: "body_slide",
    headline: "Иллюзия 15 минут",
    body: "Стресс растёт, пока ты «экономишь» утро — telemetry chart.",
  },
  {
    role: "body_slide",
    headline: "Манифест",
    body: "Стеклянная цитата в центре кадра — контроль через ритуал.",
  },
  {
    role: "cta_slide",
    headline: "Завтра утром оставь стакан",
    body: "Vernatun · сохрани ритуал · поделись с командой",
    captionLine: "Сохранить ритуал",
  },
];

async function screenshotHtmlToPng(
  html: string,
  outPath: string,
): Promise<boolean> {
  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage({
        viewport: {
          width: CAROUSEL_FRAME_WIDTH,
          height: CAROUSEL_FRAME_HEIGHT,
        },
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
      // Allow webfonts (Noto Sans Armenian / Manrope) to settle
      await page.waitForTimeout(400);
      await page.screenshot({
        path: outPath,
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: CAROUSEL_FRAME_WIDTH,
          height: CAROUSEL_FRAME_HEIGHT,
        },
      });
      await page.close();
      return true;
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (err) {
    console.error("screenshot fail:", err);
    return false;
  }
}

async function renderPreset(
  presetId: "dark_notes" | "bento_glass",
  slides: CarouselHtmlBuilderSlideIn[],
): Promise<{ written: string[]; stopped?: string }> {
  const preset =
    presetId === "dark_notes"
      ? createDarkNotesSeedPreset()
      : createBentoGlassSeedPreset();

  const budget = await readPngBudget();
  const remaining = Math.max(0, budget.max - budget.count);
  if (remaining < 1) {
    return {
      written: [],
      stopped: `PNG budget exhausted ${budget.count}/${budget.max}`,
    };
  }

  const take = Math.min(slides.length, remaining);
  if (take < slides.length) {
    console.warn(
      `Budget near cap: rendering ${take}/${slides.length} for ${presetId}`,
    );
  }

  const reserve = await reservePngBudget(take);
  if (!reserve.ok) {
    return { written: [], stopped: reserve.stopReport };
  }

  const built = carouselHtmlBuilder({
    slides: slides.slice(0, take),
    preset,
  });

  const dir = waveVisualPresetDir(presetId);
  await mkdir(dir, { recursive: true });
  const written: string[] = [];

  for (const frame of built.frames) {
    const fileName = `slide_${String(frame.index).padStart(2, "0")}.png`;
    const outPath = path.join(dir, fileName);
    const htmlPath = path.join(dir, fileName.replace(/\.png$/, ".html"));
    await writeFile(htmlPath, frame.html, "utf8");
    const ok = await screenshotHtmlToPng(frame.html, outPath);
    if (ok) {
      written.push(outPath);
      console.log("PNG:", outPath);
    } else {
      console.error("FAIL PNG:", outPath);
    }
  }

  await commitPngBudget(written.length);
  return { written };
}

async function writeReadme(filesByPreset: Record<string, string[]>) {
  const root = waveVisualArtifactRoot();
  await mkdir(root, { recursive: true });
  const budget = await readPngBudget();
  const lines: string[] = [
    "# Wave artifacts — Visual Style Deconstructor",
    "",
    `**Path (canon):** \`generatedMedia/wave-visual-deconstructor/\``,
    "",
    `**Generated:** ${new Date().toISOString()}`,
    `**Budget:** ${budget.count}/${budget.max} PNG`,
    "",
    "Sliced 4:5 HTML→PNG via `carouselHtmlBuilder` + Playwright (seed CSS kits, Vernatun sample copy). No picsum.",
    "",
    "## File list",
    "",
  ];

  for (const [preset, files] of Object.entries(filesByPreset)) {
    lines.push(`### \`${preset}/\``);
    lines.push("");
    if (files.length === 0) {
      lines.push("_empty_");
    } else {
      for (const f of files) {
        lines.push(`- \`${path.relative(root, f).replace(/\\/g, "/")}\``);
      }
    }
    lines.push("");
  }

  lines.push("## Quality bar");
  lines.push("");
  lines.push("- `dark_notes` — chalk grid, yellow marker blocks, coffee doodle, checkboxes, bridge arrows, pomegranate CTA");
  lines.push("- `bento_glass` — glass bento, timers, metric cards, line chart, gold CTA + Vernatun mark");
  lines.push("");
  lines.push("Panorama JPGs are Deconstructor **inputs** only — not the product deliverable.");
  lines.push("");

  await writeFile(path.join(root, "README.md"), lines.join("\n"), "utf8");
}

async function countPngsUnderRoot(): Promise<number> {
  const root = waveVisualArtifactRoot();
  let n = 0;
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.toLowerCase().endsWith(".png")) n += 1;
    }
  }
  await walk(root);
  return n;
}

async function main() {
  const before = await readPngBudget();
  console.log(`Budget before: ${before.count}/${before.max}`);

  const dark = await renderPreset("dark_notes", DARK_NOTES_SLIDES);
  if (dark.stopped) {
    console.error("STOP:", dark.stopped);
  }

  const afterDark = await readPngBudget();
  let bentoWritten: string[] = [];
  if (afterDark.count >= afterDark.max) {
    console.error("STOP before bento_glass — budget capped");
  } else {
    const bento = await renderPreset("bento_glass", BENTO_GLASS_SLIDES);
    bentoWritten = bento.written;
    if (bento.stopped) console.error("STOP:", bento.stopped);
  }

  const filesByPreset = {
    dark_notes: dark.written,
    bento_glass: bentoWritten,
  };
  await writeReadme(filesByPreset);

  const totalPng = await countPngsUnderRoot();
  const budget = await readPngBudget();
  console.log(`PNG files on disk: ${totalPng}`);
  console.log(`Budget after: ${budget.count}/${budget.max}`);
  console.log(`Artifact root: ${waveVisualArtifactRoot()}`);

  const needDark = 3;
  const needBento = 1; // at least one bento frame for Client link
  if (dark.written.length < needDark) {
    console.error("WAVE_VISUAL_ARTIFACTS_FAIL: dark_notes < 3");
    process.exit(1);
  }
  if (bentoWritten.length < needBento && budget.count < budget.max) {
    console.error("WAVE_VISUAL_ARTIFACTS_FAIL: bento_glass empty");
    process.exit(1);
  }
  if (totalPng > 40) {
    console.error("WAVE_VISUAL_ARTIFACTS_FAIL: exceeded 40 PNGs on disk");
    process.exit(1);
  }

  console.log("WAVE_VISUAL_ARTIFACTS_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
