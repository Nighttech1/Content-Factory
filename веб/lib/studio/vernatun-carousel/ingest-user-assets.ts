/**
 * Ingest user photo attachments into Vernatun brief (chat → job).
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UserAssetRecord } from "./types";

export type IngestableUserFile = {
  filename: string;
  mime?: string;
  /** Base64 without data: prefix, or raw buffer. */
  data: string | Buffer;
  required?: boolean;
};

function decodeData(data: string | Buffer): Buffer {
  if (Buffer.isBuffer(data)) return data;
  const raw = data.includes(",") ? data.split(",").pop()! : data;
  return Buffer.from(raw, "base64");
}

/**
 * Persist chat attachments under jobDir/assets/user and return records.
 * Hard product rule: every returned asset must later be used or rejected.
 */
export async function ingestUserAssets(input: {
  jobDir: string;
  files: IngestableUserFile[];
}): Promise<UserAssetRecord[]> {
  if (!input.files.length) return [];
  const dir = path.join(input.jobDir, "assets", "user");
  await mkdir(dir, { recursive: true });
  const out: UserAssetRecord[] = [];
  for (let i = 0; i < input.files.length; i++) {
    const f = input.files[i]!;
    const buf = decodeData(f.data);
    const sha = createHash("sha256").update(buf).digest("hex");
    const safe =
      f.filename.replace(/[^\w.\-]+/g, "_").slice(0, 80) || `user_${i + 1}.jpg`;
    const dest = path.join(dir, `${String(i + 1).padStart(2, "0")}_${safe}`);
    await writeFile(dest, buf);
    out.push({
      asset_id: `user_${sha.slice(0, 12)}`,
      original_filename: f.filename || safe,
      mime: f.mime || "image/jpeg",
      bytes: buf.length,
      sha256: sha,
      path: dest,
      status: "pending",
      required: f.required !== false,
    });
  }
  return out;
}

/** Gate: every user asset must be used or explicitly rejected before FINAL. */
export function assertUserAssetsResolved(input: {
  userAssets: UserAssetRecord[];
  usedAssetIds: Set<string>;
}): { ok: boolean; unresolved: string[] } {
  const unresolved: string[] = [];
  for (const a of input.userAssets) {
    if (a.status === "rejected") continue;
    if (input.usedAssetIds.has(a.asset_id) || a.status === "used") continue;
    unresolved.push(a.asset_id);
  }
  return { ok: unresolved.length === 0, unresolved };
}
