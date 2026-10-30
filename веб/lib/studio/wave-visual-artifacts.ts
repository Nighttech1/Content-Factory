/**
 * C-carousel-css-vars-builder — wave artifact folder + PNG budget (max 40).
 *
 * Canon path: generatedMedia/wave-visual-deconstructor/{presetId}/slide_NN.png
 * Env override: WAVE_VISUAL_ARTIFACT_DIR (absolute or cwd-relative).
 * Counter file: generatedMedia/wave-visual-deconstructor/_png_budget.json
 *
 * Soft-fail IO — never throw into draw path; never delete unrelated media.
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PNG_BUDGET_MAX } from "@/lib/settings/design-preset";

export { PNG_BUDGET_MAX };

export type PngBudgetState = {
  /** Total PNG generations counted this wave. */
  count: number;
  max: number;
  updatedAt: string;
  /** Optional stop note when capped. */
  stopReport?: string;
};

function artifactRoot(): string {
  const env = process.env.WAVE_VISUAL_ARTIFACT_DIR?.trim();
  if (env) {
    return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
  }
  return path.join(
    process.cwd(),
    "generatedMedia",
    "wave-visual-deconstructor",
  );
}

export function waveVisualArtifactRoot(): string {
  return artifactRoot();
}

export function waveVisualPresetDir(presetId: string): string {
  const safe = (presetId || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);
  return path.join(artifactRoot(), safe || "unknown");
}

function budgetFilePath(): string {
  return path.join(artifactRoot(), "_png_budget.json");
}

export async function readPngBudget(): Promise<PngBudgetState> {
  try {
    const raw = await readFile(budgetFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PngBudgetState>;
    const count =
      typeof parsed.count === "number" && Number.isFinite(parsed.count)
        ? Math.max(0, Math.floor(parsed.count))
        : 0;
    const fileMax =
      typeof parsed.max === "number" && Number.isFinite(parsed.max)
        ? Math.max(1, Math.floor(parsed.max))
        : PNG_BUDGET_MAX;
    return {
      count,
      // Honor smoke/wave file max when raised above factory default
      max: Math.max(PNG_BUDGET_MAX, fileMax),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date(0).toISOString(),
      stopReport:
        typeof parsed.stopReport === "string" ? parsed.stopReport : undefined,
    };
  } catch {
    return {
      count: 0,
      max: PNG_BUDGET_MAX,
      updatedAt: new Date(0).toISOString(),
    };
  }
}

async function writePngBudget(state: PngBudgetState): Promise<void> {
  await mkdir(artifactRoot(), { recursive: true });
  await writeFile(budgetFilePath(), JSON.stringify(state, null, 2), "utf8");
}

/**
 * Reserve `n` PNG slots. Returns ok:false when budget would exceed max.
 * Does not generate images — caller increments only after successful write.
 */
export async function reservePngBudget(n: number): Promise<
  | { ok: true; remaining: number; state: PngBudgetState }
  | { ok: false; remaining: number; state: PngBudgetState; stopReport: string }
> {
  const need = Math.max(0, Math.floor(n));
  const state = await readPngBudget();
  const remaining = Math.max(0, state.max - state.count);
  if (need > remaining) {
    const stopReport =
      state.stopReport ||
      `PNG budget exhausted: ${state.count}/${state.max}. STOP further wave gens.`;
    if (!state.stopReport) {
      await writePngBudget({
        ...state,
        stopReport,
        updatedAt: new Date().toISOString(),
      });
    }
    return {
      ok: false,
      remaining,
      state: { ...state, stopReport },
      stopReport,
    };
  }
  return { ok: true, remaining, state };
}

/** Increment budget after successful PNG writes. */
export async function commitPngBudget(n: number): Promise<PngBudgetState> {
  const add = Math.max(0, Math.floor(n));
  const prev = await readPngBudget();
  const count = Math.min(prev.max, prev.count + add);
  const stopReport =
    count >= prev.max
      ? prev.stopReport ||
        `PNG budget reached ${count}/${prev.max}. STOP further wave gens.`
      : prev.stopReport;
  const next: PngBudgetState = {
    count,
    max: prev.max,
    updatedAt: new Date().toISOString(),
    stopReport,
  };
  try {
    await writePngBudget(next);
  } catch {
    /* soft-fail */
  }
  return next;
}

/**
 * Copy sliced slide PNGs into wave artifact folder.
 * Returns written absolute paths (empty on soft-fail).
 */
export async function copySlidesToWaveArtifacts(opts: {
  presetId: string;
  /** Absolute or cwd-relative source PNG paths, ordered. */
  sourcePngPaths: string[];
}): Promise<{ dir: string; written: string[] }> {
  const dir = waveVisualPresetDir(opts.presetId);
  const written: string[] = [];
  try {
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < opts.sourcePngPaths.length; i++) {
      const src = opts.sourcePngPaths[i]!;
      const fileName = `slide_${String(i + 1).padStart(2, "0")}.png`;
      const dest = path.join(dir, fileName);
      try {
        await copyFile(src, dest);
        written.push(dest);
      } catch {
        /* skip missing source */
      }
    }
  } catch {
    return { dir, written: [] };
  }
  return { dir, written };
}

/**
 * Save PNG buffers / already-written files under artifact dir (write-through).
 * Prefer copySlidesToWaveArtifacts when public/generated already has files.
 */
export async function ensureWaveArtifactDir(presetId: string): Promise<string> {
  const dir = waveVisualPresetDir(presetId);
  await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Download remote slide image URLs into wave artifact folder as slide_NN.png.
 * Counts toward PNG budget. Soft-fail per URL.
 */
export async function downloadSlideUrlsToWaveArtifacts(opts: {
  presetId: string;
  imageUrls: string[];
}): Promise<{
  dir: string;
  written: string[];
  budget: PngBudgetState;
  stopped?: string;
}> {
  const reserve = await reservePngBudget(opts.imageUrls.length);
  if (!reserve.ok) {
    return {
      dir: waveVisualPresetDir(opts.presetId),
      written: [],
      budget: reserve.state,
      stopped: reserve.stopReport,
    };
  }

  const dir = await ensureWaveArtifactDir(opts.presetId);
  const written: string[] = [];

  for (let i = 0; i < opts.imageUrls.length; i++) {
    const url = opts.imageUrls[i];
    if (!url || typeof url !== "string") continue;
    // Skip mocks / relative-only without host
    if (url.includes("picsum.photos")) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 32) continue;
      const fileName = `slide_${String(i + 1).padStart(2, "0")}.png`;
      const dest = path.join(dir, fileName);
      await writeFile(dest, buf);
      written.push(dest);
    } catch {
      /* soft-fail one slide */
    }
  }

  const budget = await commitPngBudget(written.length);
  return { dir, written, budget };
}
