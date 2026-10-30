/**
 * FFmpeg render worker — MontageProject → MP4 1080x1920.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { MontageProject } from "../../montage-schema";
import { ensureReelDirs } from "../../paths";
import type { SourceAssetMeta } from "../../types";

function bin(name: "ffmpeg" | "ffprobe"): string {
  const envKey = name === "ffmpeg" ? "FFMPEG_PATH" : "FFPROBE_PATH";
  return process.env[envKey]?.trim() || name;
}

export function runCmd(
  command: string,
  args: string[],
  cwd?: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr?.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", (err) => {
      resolve({ code: 1, stdout, stderr: err.message });
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function ffmpegAvailable(): Promise<boolean> {
  const r = await runCmd(bin("ffmpeg"), ["-version"]);
  return r.code === 0;
}

export async function ffprobeDuration(filePath: string): Promise<number | undefined> {
  const r = await runCmd(bin("ffprobe"), [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  if (r.code !== 0) return undefined;
  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : undefined;
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%")
    .replace(/\n/g, " ");
}

function resolveAssetPath(
  reelId: string,
  assetId: string,
  sources: SourceAssetMeta[],
): string | null {
  const meta = sources.find((s) => s.assetId === assetId);
  if (!meta) return null;
  const dirs = ensureReelDirs(reelId);
  const abs = path.isAbsolute(meta.relativePath)
    ? meta.relativePath
    : path.join(dirs.root, meta.relativePath);
  return fs.existsSync(abs) ? abs : null;
}

export type RenderResult = {
  ok: true;
  outputPath: string;
  durationSec?: number;
} | {
  ok: false;
  error: string;
};

/**
 * MVP render: scale/pad each video scene, concat, optional burn-in from subtitles.
 * Title/endcard rendered as color+drawtext segments.
 */
export async function renderMontageWithFfmpeg(opts: {
  reelId: string;
  project: MontageProject;
  sources: SourceAssetMeta[];
}): Promise<RenderResult> {
  const available = await ffmpegAvailable();
  if (!available) {
    return {
      ok: false,
      error: "ffmpeg_not_found: install ffmpeg or set FFMPEG_PATH",
    };
  }

  const dirs = ensureReelDirs(opts.reelId);
  const tempSegDir = path.join(dirs.temp, `v${opts.project.version}`);
  fs.mkdirSync(tempSegDir, { recursive: true });

  const { width, height, fps } = opts.project.format;
  const segmentFiles: string[] = [];
  let segIndex = 0;

  for (const scene of opts.project.scenes) {
    if (scene.type === "audio_bed") continue;
    const outSeg = path.join(tempSegDir, `seg_${String(segIndex).padStart(3, "0")}.mp4`);

    if (scene.type === "video") {
      const src = resolveAssetPath(opts.reelId, scene.asset_id, opts.sources);
      if (!src) {
        return { ok: false, error: `missing_asset:${scene.asset_id}` };
      }
      const dur = Math.max(0.1, scene.source_end - scene.source_start);
      const args = [
        "-y",
        "-ss",
        String(scene.source_start),
        "-t",
        String(dur),
        "-i",
        src,
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=${fps},format=yuv420p`,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-shortest",
        outSeg,
      ];
      const r = await runCmd(bin("ffmpeg"), args);
      if (r.code !== 0) {
        return { ok: false, error: `ffmpeg_seg_failed:${scene.scene_id}:${r.stderr.slice(-400)}` };
      }
    } else if (scene.type === "title" || scene.type === "endcard") {
      const text =
        scene.type === "title"
          ? scene.parameters.text
          : [scene.parameters.text, scene.parameters.cta].filter(Boolean).join(" — ");
      const dur = scene.duration;
      const draw = `drawtext=text='${escapeDrawtext(text)}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5:boxborderw=16`;
      const args = [
        "-y",
        "-f",
        "lavfi",
        "-i",
        `color=c=0x111111:s=${width}x${height}:d=${dur}:r=${fps}`,
        "-f",
        "lavfi",
        "-i",
        `anullsrc=r=44100:cl=stereo`,
        "-vf",
        draw,
        "-t",
        String(dur),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        outSeg,
      ];
      const r = await runCmd(bin("ffmpeg"), args);
      if (r.code !== 0) {
        return { ok: false, error: `ffmpeg_title_failed:${scene.scene_id}:${r.stderr.slice(-400)}` };
      }
    } else if (scene.type === "insert" || scene.type === "motion_graphic") {
      // MVP: treat as short color card if no local asset file
      const src = resolveAssetPath(opts.reelId, "asset_id" in scene ? scene.asset_id : "", opts.sources);
      const dur = "duration" in scene ? scene.duration : 1.5;
      if (src) {
        const args = [
          "-y",
          "-t",
          String(dur),
          "-i",
          src,
          "-vf",
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=${fps},format=yuv420p`,
          "-an",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          outSeg,
        ];
        const r = await runCmd(bin("ffmpeg"), args);
        if (r.code !== 0) {
          return { ok: false, error: `ffmpeg_insert_failed:${scene.scene_id}` };
        }
      } else {
        const label =
          scene.type === "insert" ? "INSERT" : String((scene as { template_id?: string }).template_id ?? "GFX");
        const args = [
          "-y",
          "-f",
          "lavfi",
          "-i",
          `color=c=0x222233:s=${width}x${height}:d=${dur}:r=${fps}`,
          "-f",
          "lavfi",
          "-i",
          `anullsrc=r=44100:cl=stereo`,
          "-vf",
          `drawtext=text='${escapeDrawtext(label)}':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
          "-t",
          String(dur),
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-shortest",
          outSeg,
        ];
        const r = await runCmd(bin("ffmpeg"), args);
        if (r.code !== 0) {
          return { ok: false, error: `ffmpeg_placeholder_failed:${scene.scene_id}` };
        }
      }
    } else {
      continue;
    }

    segmentFiles.push(outSeg);
    segIndex += 1;
  }

  if (segmentFiles.length === 0) {
    return { ok: false, error: "no_segments" };
  }

  const listFile = path.join(tempSegDir, "concat.txt");
  fs.writeFileSync(
    listFile,
    segmentFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf8",
  );

  const rawOut = path.join(dirs.temp, `concat_v${opts.project.version}.mp4`);
  const concat = await runCmd(bin("ffmpeg"), [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c",
    "copy",
    rawOut,
  ]);
  if (concat.code !== 0) {
    // fallback re-encode concat
    const concat2 = await runCmd(bin("ffmpeg"), [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      rawOut,
    ]);
    if (concat2.code !== 0) {
      return { ok: false, error: `ffmpeg_concat_failed:${concat2.stderr.slice(-400)}` };
    }
  }

  let finalOut = path.join(dirs.final, "reel.mp4");
  if (opts.project.subtitles.length > 0) {
    // Burn first few cues as stacked drawtext at bottom (MVP; ASS later)
    const cues = opts.project.subtitles.slice(0, 12);
    const filters = cues.map((c, i) => {
      const y = height - 220 - i * 0; // same baseline; enable by time
      return `drawtext=text='${escapeDrawtext(c.text)}':fontsize=36:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=${y}:enable='between(t\\,${c.start}\\,${c.end})'`;
    });
    const burned = path.join(dirs.final, "reel.mp4");
    const r = await runCmd(bin("ffmpeg"), [
      "-y",
      "-i",
      rawOut,
      "-vf",
      filters.join(","),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-c:a",
      "copy",
      burned,
    ]);
    if (r.code !== 0) {
      fs.copyFileSync(rawOut, finalOut);
    } else {
      finalOut = burned;
    }
  } else {
    fs.copyFileSync(rawOut, finalOut);
  }

  // cleanup temp segments (keep concat log parent optional)
  try {
    for (const f of segmentFiles) fs.unlinkSync(f);
    fs.unlinkSync(listFile);
    if (fs.existsSync(rawOut) && rawOut !== finalOut) fs.unlinkSync(rawOut);
  } catch {
    /* best-effort */
  }

  const durationSec = await ffprobeDuration(finalOut);
  return { ok: true, outputPath: finalOut, durationSec };
}
