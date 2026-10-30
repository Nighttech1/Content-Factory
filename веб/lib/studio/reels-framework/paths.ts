import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

export function reelsJobsRoot(): string {
  const fromEnv = process.env.REELS_JOBS_DIR?.trim();
  return path.resolve(ROOT, fromEnv || "generatedMedia/reels-jobs");
}

export function reelJobDir(reelId: string): string {
  const safe = reelId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(reelsJobsRoot(), safe);
}

export function ensureReelDirs(reelId: string): {
  root: string;
  sources: string;
  analysis: string;
  inserts: string;
  final: string;
  temp: string;
  reports: string;
  logs: string;
} {
  const root = reelJobDir(reelId);
  const dirs = {
    root,
    sources: path.join(root, "sources"),
    analysis: path.join(root, "analysis"),
    inserts: path.join(root, "inserts"),
    final: path.join(root, "final"),
    temp: path.join(root, "temp"),
    reports: path.join(root, "reports"),
    logs: path.join(root, "logs"),
  };
  for (const d of Object.values(dirs)) {
    fs.mkdirSync(d, { recursive: true });
  }
  return dirs;
}

export function sotPath(): string {
  return path.join(ROOT, "data", "local", "reels-sot.json");
}

export function safeJoinUnder(base: string, name: string): string | null {
  const baseResolved = path.resolve(base);
  const target = path.resolve(base, path.basename(name));
  if (!target.startsWith(baseResolved + path.sep) && target !== baseResolved) {
    return null;
  }
  return target;
}
