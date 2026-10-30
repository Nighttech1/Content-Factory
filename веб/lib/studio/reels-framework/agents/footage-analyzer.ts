import fs from "node:fs";
import path from "node:path";
import { getReel, upsertReel } from "../store";
import { ensureReelDirs } from "../paths";
import { tryAcquireHeavyLock, releaseHeavyLock } from "../render-lock";
import { transcribeAudioFile } from "../adapters/speech";
import type { ReelRecord } from "../types";

export type AssetAnalysis = {
  assetId: string;
  durationSec?: number;
  transcript?: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  pauseHints?: Array<{ start: number; end: number }>;
  qualityNotes: string[];
  takeScore: number;
};

export type AnalysisReport = {
  analyzedAt: string;
  assets: AssetAnalysis[];
  chosenTakes: string[];
  missingScenes: string[];
  warnings: string[];
};

/** Analyze footage: metadata + optional Whisper; pick best takes by duration/score. */
export async function analyzeFootage(reelId: string): Promise<{
  ok: true;
  reel: ReelRecord;
  report: AnalysisReport;
} | { ok: false; error: string }> {
  const reel = getReel(reelId);
  if (!reel) return { ok: false, error: "reel_not_found" };
  if (!reel.sources.length) return { ok: false, error: "no_sources" };

  const lock = tryAcquireHeavyLock("analyze", reelId);
  if (!lock.ok) return { ok: false, error: `busy:${lock.holder}` };

  upsertReel({ ...reel, status: "ANALYZING" });

  try {
    const dirs = ensureReelDirs(reelId);
    const assets: AssetAnalysis[] = [];
    const warnings: string[] = [];

    for (const src of reel.sources) {
      const abs = path.join(dirs.root, src.relativePath);
      const qualityNotes: string[] = [];
      if (!src.durationSec || src.durationSec < 0.5) {
        qualityNotes.push("very_short_or_unknown_duration");
      }
      let transcript: string | undefined;
      let segments: AssetAnalysis["segments"];
      const speech = await transcribeAudioFile(abs);
      if (speech.ok) {
        transcript = speech.text;
        segments = speech.segments;
      } else {
        warnings.push(`speech_skip:${src.assetId}:${speech.error}`);
      }

      const takeScore =
        (src.durationSec && src.durationSec > 2 && src.durationSec < 20 ? 0.5 : 0.2) +
        (transcript && transcript.length > 10 ? 0.4 : 0.1) +
        (qualityNotes.length === 0 ? 0.1 : 0);

      assets.push({
        assetId: src.assetId,
        durationSec: src.durationSec,
        transcript,
        segments,
        qualityNotes,
        takeScore,
      });
    }

    const ranked = [...assets].sort((a, b) => b.takeScore - a.takeScore);
    const chosenTakes = ranked.slice(0, Math.min(3, ranked.length)).map((a) => a.assetId);

    const missingScenes: string[] = [];
    const beats = (reel.script?.script as { beats?: unknown[] } | undefined)?.beats;
    if (Array.isArray(beats) && beats.length > reel.sources.length) {
      missingScenes.push("insufficient_takes_for_all_beats");
      warnings.push("missing_material_do_not_invent");
    }

    const report: AnalysisReport = {
      analyzedAt: new Date().toISOString(),
      assets,
      chosenTakes,
      missingScenes,
      warnings,
    };

    fs.writeFileSync(
      path.join(dirs.analysis, "report.json"),
      JSON.stringify(report, null, 2),
      "utf8",
    );

    const next = upsertReel({
      ...getReel(reelId)!,
      status: missingScenes.length ? "NEEDS_INTERVENTION" : "PLAN_READY",
      lastError: missingScenes.length ? "missing_scenes" : undefined,
    });

    return { ok: true, reel: next, report };
  } finally {
    releaseHeavyLock(reelId);
  }
}
