/**
 * Single heavy job lock for Whisper OR FFmpeg on small VPS.
 */

import fs from "node:fs";
import path from "node:path";
import { reelsJobsRoot } from "./paths";

const LOCK_NAME = ".heavy-job.lock";

export type HeavyJobKind = "render" | "analyze" | "whisper";

function lockPath(): string {
  const root = reelsJobsRoot();
  fs.mkdirSync(root, { recursive: true });
  return path.join(root, LOCK_NAME);
}

export function tryAcquireHeavyLock(
  kind: HeavyJobKind,
  ownerId: string,
): { ok: true } | { ok: false; holder: string } {
  const p = lockPath();
  if (fs.existsSync(p)) {
    try {
      const cur = JSON.parse(fs.readFileSync(p, "utf8")) as {
        kind: string;
        ownerId: string;
        at: string;
      };
      // Stale > 30 min → steal
      const age = Date.now() - new Date(cur.at).getTime();
      if (Number.isFinite(age) && age < 30 * 60 * 1000) {
        return { ok: false, holder: `${cur.kind}:${cur.ownerId}` };
      }
    } catch {
      /* steal corrupt */
    }
  }
  fs.writeFileSync(
    p,
    JSON.stringify({ kind, ownerId, at: new Date().toISOString() }, null, 2),
    "utf8",
  );
  return { ok: true };
}

export function releaseHeavyLock(ownerId: string): void {
  const p = lockPath();
  if (!fs.existsSync(p)) return;
  try {
    const cur = JSON.parse(fs.readFileSync(p, "utf8")) as { ownerId: string };
    if (cur.ownerId === ownerId) fs.unlinkSync(p);
  } catch {
    try {
      fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
}
