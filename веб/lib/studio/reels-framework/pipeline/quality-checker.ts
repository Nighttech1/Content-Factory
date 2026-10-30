import fs from "node:fs";
import { runCmd } from "./render/ffmpeg-render";
import type { QualityReport } from "../types";
import type { MontageProject } from "../montage-schema";

function ffprobeBin(): string {
  return process.env.FFPROBE_PATH?.trim() || "ffprobe";
}

export async function runQualityChecks(opts: {
  mp4Path: string;
  project: MontageProject;
}): Promise<QualityReport> {
  const checks: QualityReport["checks"] = [];
  const exists = fs.existsSync(opts.mp4Path);
  checks.push({
    id: "file_exists",
    ok: exists,
    detail: exists ? opts.mp4Path : "missing",
  });
  if (!exists) {
    return { passed: false, checkedAt: new Date().toISOString(), checks };
  }

  const probe = await runCmd(ffprobeBin(), [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,codec_name,avg_frame_rate",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    opts.mp4Path,
  ]);
  checks.push({
    id: "container_probe",
    ok: probe.code === 0,
    detail: probe.code === 0 ? "ok" : probe.stderr.slice(0, 200),
  });

  let widthOk = false;
  let heightOk = false;
  let hasAudio = false;
  let durationOk = false;
  try {
    const j = JSON.parse(probe.stdout) as {
      streams?: Array<{ width?: number; height?: number }>;
      format?: { duration?: string };
    };
    const stream = j.streams?.[0];
    widthOk = stream?.width === opts.project.format.width;
    heightOk = stream?.height === opts.project.format.height;
    const dur = Number.parseFloat(j.format?.duration ?? "0");
    durationOk = Number.isFinite(dur) && dur > 0.2;
  } catch {
    /* ignore */
  }

  const audioProbe = await runCmd(ffprobeBin(), [
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=codec_name",
    "-of",
    "csv=p=0",
    opts.mp4Path,
  ]);
  hasAudio = audioProbe.code === 0 && audioProbe.stdout.trim().length > 0;

  checks.push({ id: "resolution_width", ok: widthOk });
  checks.push({ id: "resolution_height", ok: heightOk });
  checks.push({ id: "duration_positive", ok: durationOk });
  checks.push({ id: "has_audio", ok: hasAudio, detail: hasAudio ? "aac/other" : "missing" });
  checks.push({
    id: "scenes_present",
    ok: opts.project.scenes.length > 0,
    detail: `scenes=${opts.project.scenes.length}`,
  });

  const passed = checks.every((c) => c.ok);
  return { passed, checkedAt: new Date().toISOString(), checks };
}
