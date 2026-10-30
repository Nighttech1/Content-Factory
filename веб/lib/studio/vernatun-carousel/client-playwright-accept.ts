/**
 * Клиент — обязательная Playwright-приёмка каруселей (режимы A и B).
 * Работает без пользователя и без MCP: Chromium открывает каждый слайд + Studio.
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export type ClientSlideCheck = {
  url: string;
  jobId: string;
  buildMode: "A" | "B" | "unknown";
  slide: string;
  ok: boolean;
  width?: number;
  height?: number;
  bytes?: number;
  errors: string[];
  screenshot?: string;
};

export type ClientAcceptReport = {
  at: string;
  baseUrl: string;
  studioOk: boolean;
  studioStatus?: number;
  studioScreenshot?: string;
  slides: ClientSlideCheck[];
  byMode: { A: { pass: number; fail: number }; B: { pass: number; fail: number } };
  verdict: "ПРИНЯТО" | "ПРИНЯТО С ЗАМЕЧАНИЯМИ" | "НЕ ПРИНЯТО";
  summary: string;
};

const FRAME_W = 1080;
const FRAME_H = 1350;

async function detectModeFromJobDir(
  jobDir: string,
): Promise<"A" | "B" | "unknown"> {
  if (existsSync(path.join(jobDir, "slides", "slide_01.html"))) return "A";
  const brief = path.join(jobDir, "brief.json");
  if (existsSync(brief)) {
    try {
      const raw = await readFile(brief, "utf8");
      const j = JSON.parse(raw) as { buildMode?: string };
      if (j.buildMode === "A" || j.buildMode === "B") return j.buildMode;
    } catch {
      /* */
    }
  }
  return "unknown";
}

export async function listPublicVernatunSlides(opts?: {
  publicRoot?: string;
  jobsRoot?: string;
}): Promise<
  Array<{ jobId: string; buildMode: "A" | "B" | "unknown"; file: string; urlPath: string }>
> {
  const publicRoot =
    opts?.publicRoot ?? path.join(process.cwd(), "public", "vernatun-jobs");
  const jobsRoot =
    opts?.jobsRoot ?? path.join(process.cwd(), "generatedMedia", "vernatun-jobs");
  const out: Array<{
    jobId: string;
    buildMode: "A" | "B" | "unknown";
    file: string;
    urlPath: string;
  }> = [];

  let jobIds: string[] = [];
  try {
    jobIds = (await readdir(publicRoot)).filter((n) => !n.includes("."));
  } catch {
    return out;
  }

  for (const jobId of jobIds) {
    const dir = path.join(publicRoot, jobId);
    let files: string[] = [];
    try {
      files = (await readdir(dir)).filter((f) => /\.png$/i.test(f));
    } catch {
      continue;
    }
    const mode = await detectModeFromJobDir(path.join(jobsRoot, jobId));
    for (const file of files.sort()) {
      out.push({
        jobId,
        buildMode: mode,
        file,
        urlPath: `/vernatun-jobs/${jobId}/${file}`,
      });
    }
  }
  return out;
}

export async function runClientPlaywrightAccept(opts?: {
  baseUrl?: string;
  outDir?: string;
  /** Limit jobs (newest first by mtime if provided). */
  maxJobs?: number;
}): Promise<ClientAcceptReport> {
  const baseUrl = (opts?.baseUrl ?? "http://127.0.0.1:3000").replace(/\/$/, "");
  const outDir =
    opts?.outDir ??
    path.join(
      process.cwd(),
      "memory",
      "client-accept",
      new Date().toISOString().slice(0, 10),
    );
  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(outDir, "screens"), { recursive: true });

  let slides = await listPublicVernatunSlides();
  if (opts?.maxJobs && opts.maxJobs > 0) {
    const byJob = new Map<string, typeof slides>();
    for (const s of slides) {
      const arr = byJob.get(s.jobId) ?? [];
      arr.push(s);
      byJob.set(s.jobId, arr);
    }
    const jobIds = [...byJob.keys()].slice(-opts.maxJobs);
    slides = slides.filter((s) => jobIds.includes(s.jobId));
  }

  const playwright = await import("playwright");
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });

  const checks: ClientSlideCheck[] = [];
  let studioOk = false;
  let studioStatus = 0;
  let studioScreenshot: string | undefined;

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    // S-studio: open create surface
    try {
      const res = await page.goto(`${baseUrl}/studio`, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });
      studioStatus = res?.status() ?? 0;
      studioOk = studioStatus >= 200 && studioStatus < 400;
      const shot = path.join(outDir, "screens", "studio.png");
      await page.screenshot({ path: shot, fullPage: false });
      studioScreenshot = shot;
    } catch (err) {
      studioOk = false;
      checks.push({
        url: `${baseUrl}/studio`,
        jobId: "studio",
        buildMode: "unknown",
        slide: "studio",
        ok: false,
        errors: [`studio_nav_fail:${err instanceof Error ? err.message : String(err)}`],
      });
    }

    for (const item of slides) {
      const url = `${baseUrl}${item.urlPath}`;
      const errors: string[] = [];
      let width = 0;
      let height = 0;
      let bytes = 0;
      let ok = true;
      let screenshot: string | undefined;

      try {
        const disk = path.join(
          process.cwd(),
          "public",
          "vernatun-jobs",
          item.jobId,
          item.file,
        );
        try {
          const st = await stat(disk);
          bytes = st.size;
          if (bytes < 8_000) {
            ok = false;
            errors.push(`file_too_small:${bytes}`);
          }
        } catch {
          ok = false;
          errors.push("file_missing_on_disk");
        }

        const res = await page.goto(url, {
          waitUntil: "load",
          timeout: 30_000,
        });
        if (!res || res.status() >= 400) {
          ok = false;
          errors.push(`http_${res?.status() ?? 0}`);
        }

        const dims = await page.evaluate(() => {
          const img = document.querySelector("img");
          if (img && img.complete) {
            return { w: img.naturalWidth, h: img.naturalHeight };
          }
          // raw PNG navigated as document — body may be empty; use canvas decode
          return { w: 0, h: 0 };
        });

        if (dims.w > 0 && dims.h > 0) {
          width = dims.w;
          height = dims.h;
        } else {
          // Playwright opens PNG as image document — read via fetch+Image or file header
          try {
            const buf = await readFile(
              path.join(
                process.cwd(),
                "public",
                "vernatun-jobs",
                item.jobId,
                item.file,
              ),
            );
            if (buf[0] === 0x89 && buf[1] === 0x50 && buf.length >= 24) {
              width = buf.readUInt32BE(16);
              height = buf.readUInt32BE(20);
            }
          } catch {
            errors.push("png_header_unreadable");
            ok = false;
          }
        }

        if (width && height) {
          if (
            Math.abs(width - FRAME_W) > 4 ||
            Math.abs(height - FRAME_H) > 4
          ) {
            // Mode B may be 1024x1280 source copied — warn not always fail
            if (item.buildMode === "A") {
              ok = false;
              errors.push(`size_${width}x${height}_expected_${FRAME_W}x${FRAME_H}`);
            } else {
              errors.push(
                `warn_size_${width}x${height}_not_exact_${FRAME_W}x${FRAME_H}`,
              );
            }
          }
        } else {
          ok = false;
          errors.push("no_dimensions");
        }

        const shot = path.join(
          outDir,
          "screens",
          `${item.jobId}_${item.file.replace(/\.png$/i, "")}.png`,
        );
        await page.setViewportSize({
          width: Math.max(width || FRAME_W, 400),
          height: Math.max(height || FRAME_H, 400),
        });
        await page.goto(url, { waitUntil: "load", timeout: 30_000 });
        await page.screenshot({ path: shot });
        screenshot = shot;
      } catch (err) {
        ok = false;
        errors.push(err instanceof Error ? err.message : String(err));
      }

      checks.push({
        url,
        jobId: item.jobId,
        buildMode: item.buildMode,
        slide: item.file,
        ok,
        width,
        height,
        bytes,
        errors,
        screenshot,
      });
    }

    await page.close();
  } finally {
    await browser.close().catch(() => undefined);
  }

  const byMode = {
    A: { pass: 0, fail: 0 },
    B: { pass: 0, fail: 0 },
  };
  for (const c of checks) {
    if (c.jobId === "studio") continue;
    const m = c.buildMode === "B" ? "B" : c.buildMode === "A" ? "A" : null;
    if (!m) continue;
    if (c.ok) byMode[m].pass += 1;
    else byMode[m].fail += 1;
  }

  const slideFails = checks.filter((c) => c.jobId !== "studio" && !c.ok);
  const hasWarns = checks.some((c) =>
    c.errors.some((e) => e.startsWith("warn_")),
  );
  let verdict: ClientAcceptReport["verdict"] = "ПРИНЯТО";
  if (!studioOk || slideFails.length > 0) verdict = "НЕ ПРИНЯТО";
  else if (hasWarns) verdict = "ПРИНЯТО С ЗАМЕЧАНИЯМИ";

  const report: ClientAcceptReport = {
    at: new Date().toISOString(),
    baseUrl,
    studioOk,
    studioStatus,
    studioScreenshot,
    slides: checks,
    byMode,
    verdict,
    summary: `Studio ${studioOk ? "OK" : "FAIL"}; slides checked=${checks.filter((c) => c.jobId !== "studio").length}; A ${byMode.A.pass}/${byMode.A.pass + byMode.A.fail}; B ${byMode.B.pass}/${byMode.B.pass + byMode.B.fail}; fails=${slideFails.length}`,
  };

  await writeFile(
    path.join(outDir, "CLIENT_ACCEPT_REPORT.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(outDir, "CLIENT_ACCEPT_REPORT.md"),
    [
      `# Клиент — Playwright приёмка каруселей`,
      ``,
      `**Вердикт:** ${report.verdict}`,
      ``,
      report.summary,
      ``,
      `## Режим A`,
      `pass=${byMode.A.pass} fail=${byMode.A.fail}`,
      ``,
      `## Режим B`,
      `pass=${byMode.B.pass} fail=${byMode.B.fail}`,
      ``,
      `## Провалы`,
      ...slideFails.map(
        (f) => `- ${f.buildMode} ${f.jobId}/${f.slide}: ${f.errors.join("; ")}`,
      ),
      ``,
    ].join("\n"),
    "utf8",
  );

  return report;
}
