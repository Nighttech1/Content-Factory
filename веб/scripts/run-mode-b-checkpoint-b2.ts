/**
 * Mode B checkpoint: 1 test + 1 finish carousel (×4).
 * Usage: npx tsx scripts/run-mode-b-checkpoint-b2.ts [test|finish|both] [outTag]
 * outTag default: 2026-10-23-b0-b2 — for B1/B3/B5 use e.g. 2026-10-23-b1-b5
 */
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path, { resolve } from "node:path";
import { runVernatunCarouselJob } from "../lib/studio/vernatun-carousel/orchestrator";

function loadDotEnv(file: string) {
  try {
    const raw = readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env) || !process.env[key]) process.env[key] = val;
    }
  } catch {
    /* */
  }
}
loadDotEnv(resolve(process.cwd(), ".env"));
loadDotEnv(resolve(process.cwd(), ".env.local"));

// Product B: no HTML chrome unless explicitly enabled
if (!process.env.MODE_B_HTML_CHROME) process.env.MODE_B_HTML_CHROME = "0";

type Kind = "test" | "finish";

async function runOne(kind: Kind, outTag: string) {
  const topic =
    kind === "test"
      ? "Почему живой разговор в Vernatun сильнее бесконечного чата"
      : "Связи в сообществе — сила, а не кумовство: приходи в Vernatun";

  console.log(`\n=== Mode B checkpoint ${kind} (${outTag}) ===`);
  console.log("topic:", topic);

  const result = await runVernatunCarouselJob({
    brief: {
      topic,
      slideCount: 4, // FORCE for checkpoint (AD rule still in prompts)
      buildMode: "B",
      skipScriptApproval: true,
      maxRepairCycles: 2,
      cta: "Приходите на встречу Vernatun",
      audience: "москвичи, армянский speaking-club",
      styleNotes:
        kind === "test"
          ? "CHECKPOINT: native logo pixel-faithful every slide; pagination only k/4 or omit; type_system locked; no concert."
          : "CHECKPOINT FINISH: poster cover ≤4 words; ONE identical Vernatun emblem per slide; Design colors; strong CTA.",
    },
    onProgress: (a, m) => console.log(`  [${a}] ${m}`),
  });

  const outDir = path.join(
    process.cwd(),
    "generatedMedia",
    "vernatun-smoke",
    outTag,
  );
  await mkdir(outDir, { recursive: true });
  const summaryPath = path.join(outDir, `${kind}-${result.jobId}.json`);
  await writeFile(
    summaryPath,
    JSON.stringify(
      {
        kind,
        jobId: result.jobId,
        status: result.status,
        ok: result.ok,
        slideCount: result.script?.slides?.length,
        slides: result.slides.map((s) => s.imageUrl),
        remarks: result.remarks,
        findings: result.findings?.slice(0, 12),
        jobDir: result.jobDir,
        error: result.error,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log("status:", result.status, "ok:", result.ok);
  console.log("jobId:", result.jobId);
  console.log("jobDir:", result.jobDir);
  console.log("summary:", summaryPath);
  const logoExists =
    existsSync(path.join(process.cwd(), "brand", "apple-touch-icon.png")) ||
    existsSync(
      path.join(process.cwd(), "public", "brand", "apple-touch-icon.png"),
    );
  console.log("emblem on disk:", logoExists);
  return result;
}

async function main() {
  const arg = (process.argv[2] || "both").toLowerCase();
  const outTag = process.argv[3] || "2026-10-23-b0-b2";
  const kinds: Kind[] =
    arg === "test"
      ? ["test"]
      : arg === "finish"
        ? ["finish"]
        : ["test", "finish"];
  const results = [];
  for (const k of kinds) {
    results.push(await runOne(k, outTag));
  }
  console.log("\n=== DONE ===");
  for (const r of results) {
    console.log(r.jobId, r.status, r.ok);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
