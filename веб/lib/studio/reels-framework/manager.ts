import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  getReel,
  listReels,
  newReelId,
  upsertReel,
} from "./store";
import { ensureReelDirs, safeJoinUnder } from "./paths";
import type { ReelRecord, SourceAssetMeta } from "./types";
import { buildSimpleMontageFromSources } from "./pipeline/timeline-builder";
import { renderMontageWithFfmpeg, ffprobeDuration } from "./pipeline/render/ffmpeg-render";
import { runQualityChecks } from "./pipeline/quality-checker";
import { tryAcquireHeavyLock, releaseHeavyLock } from "./render-lock";
import { validateMontageProject, type MontageProject } from "./montage-schema";
import { DEFAULT_STYLE_PROFILE_ID } from "./memory/style-profiles";

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

export function createReel(opts: {
  topic: string;
  sheetRowKey?: string;
  styleProfileId?: string;
}): ReelRecord {
  const now = new Date().toISOString();
  const reel: ReelRecord = {
    id: newReelId(),
    moduleId: "custom-reels",
    topic: opts.topic.trim() || "Без темы",
    sheetRowKey: opts.sheetRowKey,
    status: "NEW_TOPIC",
    styleProfileId: opts.styleProfileId || DEFAULT_STYLE_PROFILE_ID,
    sources: [],
    planVersion: 0,
    revisions: [],
    createdAt: now,
    updatedAt: now,
  };
  ensureReelDirs(reel.id);
  return upsertReel(reel);
}

export function findReelBySheetKey(sheetRowKey: string): ReelRecord | undefined {
  return listReels().find(
    (r) => r.sheetRowKey === sheetRowKey && r.moduleId === "custom-reels",
  );
}

export async function addSourceFile(opts: {
  reelId: string;
  fileName: string;
  mime: string;
  buffer: Buffer;
}): Promise<{ ok: true; reel: ReelRecord; asset: SourceAssetMeta } | { ok: false; error: string }> {
  const reel = getReel(opts.reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  if (!VIDEO_MIMES.has(opts.mime) && !opts.fileName.match(/\.(mp4|mov|webm|m4v)$/i)) {
    return { ok: false, error: "unsupported_mime" };
  }
  const maxMb = Number(process.env.REELS_MAX_SOURCE_MB || 512);
  if (opts.buffer.length > maxMb * 1024 * 1024) {
    return { ok: false, error: "file_too_large" };
  }

  const dirs = ensureReelDirs(reel.id);
  const base = path.basename(opts.fileName).replace(/[^\w.\-()+ ]+/g, "_");
  const assetId = `asset_${crypto.randomBytes(4).toString("hex")}`;
  const storedName = `${assetId}_${base}`;
  const abs = safeJoinUnder(dirs.sources, storedName);
  if (!abs) return { ok: false, error: "path_traversal" };

  fs.writeFileSync(abs, opts.buffer);
  const durationSec = await ffprobeDuration(abs);
  const asset: SourceAssetMeta = {
    assetId,
    fileName: base,
    relativePath: path.join("sources", storedName).replace(/\\/g, "/"),
    mime: opts.mime || "video/mp4",
    sizeBytes: opts.buffer.length,
    durationSec,
    sha256: crypto.createHash("sha256").update(opts.buffer).digest("hex"),
    uploadedAt: new Date().toISOString(),
  };

  const next: ReelRecord = {
    ...reel,
    sources: [...reel.sources, asset],
    status: "FOOTAGE_UPLOADED",
    lastError: undefined,
  };
  return { ok: true, reel: upsertReel(next), asset };
}

export function removeSource(
  reelId: string,
  assetId: string,
): { ok: true; reel: ReelRecord } | { ok: false; error: string } {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  const asset = reel.sources.find((s) => s.assetId === assetId);
  if (!asset) return { ok: false, error: "asset_not_found" };
  const dirs = ensureReelDirs(reelId);
  const abs = path.join(dirs.root, asset.relativePath);
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    /* ignore */
  }
  const sources = reel.sources.filter((s) => s.assetId !== assetId);
  const next = upsertReel({
    ...reel,
    sources,
    status: sources.length ? "FOOTAGE_UPLOADED" : "AWAITING_FOOTAGE",
  });
  return { ok: true, reel: next };
}

export function saveMontageProject(
  reelId: string,
  project: MontageProject,
): { ok: true; reel: ReelRecord } | { ok: false; error: string } {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  const v = validateMontageProject(project);
  if (!v.ok) return { ok: false, error: v.error };
  const dirs = ensureReelDirs(reelId);
  const montagePath = path.join(dirs.root, "montage-plan.json");
  // version history
  const histDir = path.join(dirs.root, "montage-versions");
  fs.mkdirSync(histDir, { recursive: true });
  fs.writeFileSync(
    path.join(histDir, `v${v.project.version}.json`),
    JSON.stringify(v.project, null, 2),
    "utf8",
  );
  fs.writeFileSync(montagePath, JSON.stringify(v.project, null, 2), "utf8");
  const next = upsertReel({
    ...reel,
    planVersion: v.project.version,
    montagePath: path.relative(process.cwd(), montagePath).replace(/\\/g, "/"),
    status: "PLAN_READY",
  });
  return { ok: true, reel: next };
}

export function loadMontageProject(reelId: string): MontageProject | null {
  const reel = getReel(reelId);
  if (!reel?.montagePath) return null;
  const abs = path.isAbsolute(reel.montagePath)
    ? reel.montagePath
    : path.join(process.cwd(), reel.montagePath);
  if (!fs.existsSync(abs)) return null;
  const raw = JSON.parse(fs.readFileSync(abs, "utf8"));
  const v = validateMontageProject(raw);
  return v.ok ? v.project : null;
}

export function buildAndSaveSimplePlan(reelId: string): {
  ok: true;
  reel: ReelRecord;
  project: MontageProject;
} | { ok: false; error: string } {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  if (!reel.sources.length) return { ok: false, error: "no_sources" };
  const built = buildSimpleMontageFromSources({
    reelId,
    styleProfile: reel.styleProfileId,
    version: Math.max(1, reel.planVersion + 1),
    sources: reel.sources,
    titleText: reel.topic.slice(0, 80),
    endcardText: reel.script?.script?.cta
      ? String((reel.script.script as { cta?: { captionLine?: string } }).cta?.captionLine || "")
      : undefined,
  });
  if (!built.ok) return built;
  const saved = saveMontageProject(reelId, built.project);
  if (!saved.ok) return saved;
  return { ok: true, reel: saved.reel, project: built.project };
}

export async function renderReel(reelId: string): Promise<{
  ok: true;
  reel: ReelRecord;
} | { ok: false; error: string; reel?: ReelRecord }> {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };

  let project = loadMontageProject(reelId);
  if (!project) {
    const built = buildAndSaveSimplePlan(reelId);
    if (!built.ok) return { ok: false, error: built.error, reel };
    project = built.project;
  }

  const lock = tryAcquireHeavyLock("render", reelId);
  if (!lock.ok) {
    return { ok: false, error: `busy:${lock.holder}`, reel };
  }

  upsertReel({ ...reel, status: "RENDERING", lastError: undefined });

  try {
    const result = await renderMontageWithFfmpeg({
      reelId,
      project,
      sources: reel.sources,
    });
    if (!result.ok) {
      const failed = upsertReel({
        ...getReel(reelId)!,
        status: "ERROR",
        lastError: result.error,
      });
      return { ok: false, error: result.error, reel: failed };
    }

    upsertReel({ ...getReel(reelId)!, status: "QA" });
    const qa = await runQualityChecks({ mp4Path: result.outputPath, project });
    const dirs = ensureReelDirs(reelId);
    fs.writeFileSync(
      path.join(dirs.reports, "qa.json"),
      JSON.stringify(qa, null, 2),
      "utf8",
    );

    if (!qa.passed) {
      const failed = upsertReel({
        ...getReel(reelId)!,
        status: "NEEDS_INTERVENTION",
        lastError: "qa_failed",
        quality: qa,
        finalPath: path.relative(process.cwd(), result.outputPath).replace(/\\/g, "/"),
      });
      return { ok: false, error: "qa_failed", reel: failed };
    }

    const done = upsertReel({
      ...getReel(reelId)!,
      status: "DONE",
      quality: qa,
      finalPath: path.relative(process.cwd(), result.outputPath).replace(/\\/g, "/"),
      lastError: undefined,
    });
    return { ok: true, reel: done };
  } finally {
    releaseHeavyLock(reelId);
  }
}

export { listReels, getReel };
