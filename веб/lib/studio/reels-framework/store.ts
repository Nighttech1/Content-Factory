import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_MONTAGE_SETTINGS,
  type MontageRule,
  type MontageSettings,
  type ReelRecord,
  type ReelsSoT,
} from "./types";
import { sotPath } from "./paths";

function emptySoT(): ReelsSoT {
  return {
    version: 1,
    reels: [],
    globalSettings: { ...DEFAULT_MONTAGE_SETTINGS },
    rules: [],
  };
}

function readSoT(): ReelsSoT {
  const p = sotPath();
  try {
    if (!fs.existsSync(p)) return emptySoT();
    const raw = JSON.parse(fs.readFileSync(p, "utf8")) as ReelsSoT;
    if (!raw || raw.version !== 1 || !Array.isArray(raw.reels)) return emptySoT();
    return {
      version: 1,
      reels: raw.reels,
      globalSettings: { ...DEFAULT_MONTAGE_SETTINGS, ...raw.globalSettings },
      rules: Array.isArray(raw.rules) ? raw.rules : [],
    };
  } catch {
    return emptySoT();
  }
}

function writeSoT(sot: ReelsSoT): void {
  const p = sotPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(sot, null, 2), "utf8");
  fs.renameSync(tmp, p);
}

export function listReels(): ReelRecord[] {
  return readSoT().reels.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getReel(id: string): ReelRecord | undefined {
  return readSoT().reels.find((r) => r.id === id);
}

export function upsertReel(reel: ReelRecord): ReelRecord {
  const sot = readSoT();
  const idx = sot.reels.findIndex((r) => r.id === reel.id);
  const next = { ...reel, updatedAt: new Date().toISOString() };
  if (idx >= 0) sot.reels[idx] = next;
  else sot.reels.push(next);
  writeSoT(sot);
  return next;
}

export function getGlobalSettings(): MontageSettings {
  return { ...readSoT().globalSettings };
}

export function setGlobalSettings(patch: Partial<MontageSettings>): MontageSettings {
  const sot = readSoT();
  sot.globalSettings = { ...sot.globalSettings, ...patch };
  writeSoT(sot);
  return { ...sot.globalSettings };
}

export function listRules(): MontageRule[] {
  return readSoT().rules.slice();
}

export function upsertRule(rule: MontageRule): MontageRule {
  const sot = readSoT();
  const idx = sot.rules.findIndex((r) => r.id === rule.id);
  if (idx >= 0) sot.rules[idx] = rule;
  else sot.rules.push(rule);
  writeSoT(sot);
  return rule;
}

export function newReelId(): string {
  return `reel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Test helper — wipe SoT. */
export function __resetReelsSoTForTests(): void {
  writeSoT(emptySoT());
}
