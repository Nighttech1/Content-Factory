import fs from "node:fs";
import path from "node:path";
import { getReel, getGlobalSettings } from "../../store";
import { ensureReelDirs } from "../../paths";
import { searchInsertCandidates } from "../../adapters/search";
import { loadMontageProject, saveMontageProject } from "../../manager";
import type { MontageProject } from "../../montage-schema";
import type { InsertCandidate } from "../../types";

export type { InsertCandidate };

/**
 * Find humorous inserts; skip if nothing suitable (never invent).
 */
export async function findAndOptionallyApplyInserts(opts: {
  reelId: string;
  applyAuto?: boolean;
}): Promise<{
  ok: true;
  candidates: InsertCandidate[];
  skippedReason?: string;
  project?: MontageProject;
} | { ok: false; error: string }> {
  const reel = getReel(opts.reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  const settings = {
    ...getGlobalSettings(),
    ...(reel.settingsOverride as Partial<ReturnType<typeof getGlobalSettings>>),
  };

  if (!settings.insertsEnabled) {
    return { ok: true, candidates: [], skippedReason: "inserts_disabled" };
  }

  const project = loadMontageProject(opts.reelId);
  if (!project) return { ok: false, error: "no_montage_project" };

  const dirs = ensureReelDirs(opts.reelId);
  const libraryDir = path.join(dirs.inserts, "library");
  fs.mkdirSync(libraryDir, { recursive: true });

  const candidates: InsertCandidate[] = [];

  // Mode C — local library files
  if (settings.insertSource === "library" || settings.insertSource === "combined") {
    const files = fs.existsSync(libraryDir) ? fs.readdirSync(libraryDir) : [];
    for (const f of files.slice(0, settings.insertMaxCount)) {
      candidates.push({
        candidateId: `lib_${f}`,
        query: "library",
        source: "library",
        localPath: path.join(libraryDir, f),
        score: 0.7,
        needsReview: false,
      });
    }
  }

  // Mode B — web search
  if (
    (settings.insertSource === "web" || settings.insertSource === "combined") &&
    candidates.length < settings.insertMaxCount
  ) {
    const query =
      reel.topic.slice(0, 80) ||
      String((reel.script?.script as { hook?: { onScreen?: string } })?.hook?.onScreen || "мем");
    const found = await searchInsertCandidates({
      query,
      limit: settings.insertMaxCount,
      allowedDomains: settings.allowedDomains,
    });
    candidates.push(...found);
  }

  // Mode A — site (only if domains configured)
  if (
    (settings.insertSource === "site" || settings.insertSource === "combined") &&
    settings.allowedDomains.length === 0
  ) {
    /* deferred — no URL */
  }

  const usable = candidates
    .filter((c) => c.score >= 0.4)
    .slice(0, settings.insertMaxCount);

  fs.writeFileSync(
    path.join(dirs.inserts, "candidates.json"),
    JSON.stringify(usable, null, 2),
    "utf8",
  );

  if (!usable.length) {
    return {
      ok: true,
      candidates: [],
      skippedReason: "no_suitable_material",
      project,
    };
  }

  if (settings.insertMode === "suggest" && !opts.applyAuto) {
    return { ok: true, candidates: usable, project };
  }

  if (settings.insertMode === "manual" && !opts.applyAuto) {
    return { ok: true, candidates: usable, project };
  }

  // auto apply: insert one scene before endcard
  const endIdx = project.scenes.findIndex((s) => s.type === "endcard");
  const insertScene = {
    scene_id: `scene_insert_${Date.now().toString(36)}`,
    type: "insert" as const,
    asset_id: usable[0]!.candidateId,
    duration: Math.min(settings.insertMaxDurationSec, 2),
    audio_enabled: settings.insertAudioDefault,
    transition: "cut" as const,
    effects: [],
    source_url: usable[0]!.url,
    reason: `auto:${usable[0]!.source}`,
  };
  const scenes = [...project.scenes];
  if (endIdx >= 0) scenes.splice(endIdx, 0, insertScene);
  else scenes.push(insertScene);

  const nextProject: MontageProject = {
    ...project,
    version: project.version + 1,
    scenes,
  };
  const saved = saveMontageProject(opts.reelId, nextProject);
  if (!saved.ok) return { ok: false, error: saved.error };

  return { ok: true, candidates: usable, project: nextProject };
}
