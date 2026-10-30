/**
 * RE-BAKE a Mode B carousel WITHOUT generation.
 * Takes an existing vernatun job's AI backgrounds (assets/originals/slide_NN_src.jpg)
 * and re-runs ONLY the montage chain (logo → vocab pill → BR arrow) with the current
 * (fixed) bake code, then runs the final Art Director (vision) on the result.
 *
 * No GPT Image calls. Use after bake fixes to re-check the SAME pixels.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/rebake-vernatun-modeb.ts [jobDir]
 */

import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolve } from "node:path";

import { renderModeBCopies } from "../lib/studio/vernatun-carousel/renderer";
import { runArtDirectorFinal } from "../lib/studio/vernatun-carousel/art-director-final";
import {
  runGeometryGate,
  geometrySuspectsToPromptLines,
} from "../lib/studio/vernatun-carousel/geometry-gate";
import { resolveRoleModel } from "../lib/studio/vernatun-carousel/role-models";
import type {
  PreparedSlideImage,
} from "../lib/studio/vernatun-carousel/image-gen";
import type { VernatunScript } from "../lib/studio/vernatun-carousel/types";

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) process.env[key] = val;
  }
}
loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

function ts() {
  return new Date().toISOString().slice(11, 23);
}
function log(stage: string, msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[${ts()}] ${stage} ${msg}`);
}

const DEFAULT_JOB = path.join(
  process.cwd(),
  "generatedMedia",
  "vernatun-jobs",
  "sheet_32d9361e421d4373",
);

async function main() {
  const srcJobDir = path.resolve(process.argv[2] || DEFAULT_JOB);
  const jobId = path.basename(srcJobDir);
  const rebakeDir = path.join(path.dirname(srcJobDir), `${jobId}-rebake`);
  const outDir = path.join(rebakeDir, "rendered");
  const originals = path.join(srcJobDir, "assets", "originals");
  const scriptPath = path.join(srcJobDir, "prompts", "01_script_out.json");

  if (!existsSync(scriptPath)) {
    log("FATAL", `no script at ${scriptPath}`);
    process.exitCode = 1;
    return;
  }
  const script = JSON.parse(await readFile(scriptPath, "utf8")) as VernatunScript;
  const slideCount = script.slide_count ?? script.slides.length;

  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(rebakeDir, "prompts"), { recursive: true });
  // Carry over the logo-bake meta so the wordmark corner/size matches the run.
  const origLogoMeta = path.join(srcJobDir, "prompts", "logo_bake.json");
  if (existsSync(origLogoMeta)) {
    await copyFile(origLogoMeta, path.join(rebakeDir, "prompts", "logo_bake.json"));
  }

  const images: PreparedSlideImage[] = [];
  for (let i = 1; i <= slideCount; i++) {
    const n = String(i).padStart(2, "0");
    const src = path.join(originals, `slide_${n}_src.jpg`);
    if (!existsSync(src)) {
      log("WARN", `missing original ${src}`);
      continue;
    }
    images.push({
      slideIndex: i,
      localPath: src,
      publicUrl: src,
      manifest: {
        asset_id: `rebake-${i}`,
        filename: `slide_${n}_src.jpg`,
        slide_id: `slide_${i}`,
        role: "photo",
        source_type: "generated",
        source_url_or_provider: "rebake/no-regen",
        license_or_terms: "internal",
        original_filename: `slide_${n}_src.jpg`,
        original_width: 0,
        original_height: 0,
        bytes: 0,
        format: "image/jpeg",
        sha256: "",
        transformed: false,
        transform_log: "rebake",
        transformations: [],
        quality_status: "PASS",
        visual_review: "pending",
        accepted: true,
      },
    });
  }

  log("REBAKE", `job=${jobId} slides=${images.length} (NO generation)`);
  log(
    "MODEL",
    `AD-final=${resolveRoleModel("artDirectorFinal").model} (override CAROUSEL_MODEL_AD_FINAL)`,
  );

  const pngPaths = await renderModeBCopies(
    images,
    outDir,
    {
      logoDataUrl: "",
      brandName: "Vernatun",
      tagline: "moscow armenian speaking club",
    },
    script,
    { jobId, jobDir: rebakeDir },
  );
  log("MONTAGE", `re-baked ${pngPaths.length} slide(s) → ${outDir}`);

  // Deterministic geometry gate → CANDIDATES (AD decides final).
  const suspects = await runGeometryGate(rebakeDir);
  const suspectLines = geometrySuspectsToPromptLines(suspects);
  log("GEOMETRY-GATE", `${suspects.length} suspect(s)`);
  for (const l of suspectLines) {
    // eslint-disable-next-line no-console
    console.log("    " + l);
  }

  // Final Art Director (vision) on the re-baked slides — gets geometry hints,
  // makes the FINAL call (can dismiss a code false-positive).
  log("AD", "running final Art Director (vision) on re-baked slides…");
  let verdictLine = "ad_skipped";
  try {
    const ad = await runArtDirectorFinal({
      script,
      pngPaths,
      geometrySuspects: suspectLines,
    });
    verdictLine = `can_finalize=${ad.canFinalize} findings=${ad.findings.length} model=${ad.model}`;
    log("AD", verdictLine);
    const md: string[] = [
      `# AD VERDICT (RE-BAKE) — ${ad.canFinalize ? "APPROVE" : "REMARKS"}`,
      "",
      `- can_finalize: **${ad.canFinalize}**`,
      `- model: ${ad.model}`,
      `- findings_total: ${ad.findings.length}`,
      "",
      "## Summary",
      ad.summary || "(none)",
      "",
      "## Findings",
      ...ad.findings.map(
        (f, i) =>
          `### ${i + 1}. [${f.severity}] ${f.slide_id} · \`${f.element}\`\n- observed: ${f.observed_issue}\n- fix: ${f.recommended_change}\n- check: ${f.acceptance_check}`,
      ),
    ];
    await writeFile(
      path.join(rebakeDir, "AD_VERDICT_REBAKE.md"),
      md.join("\n"),
      "utf8",
    );
    await writeFile(
      path.join(rebakeDir, "AD_FINDINGS_REBAKE.json"),
      JSON.stringify(ad.findings, null, 2),
      "utf8",
    );
  } catch (err) {
    log("AD", `failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Copy clean finals to a flat folder for review.
  const review = path.join(
    process.cwd(),
    "generatedMedia",
    `rebake-${jobId}`,
  );
  await mkdir(review, { recursive: true });
  for (const p of pngPaths) {
    await copyFile(p, path.join(review, path.basename(p)));
  }
  log("DONE", `finals → ${review} · verdict: ${verdictLine}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[rebake] fatal", err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
