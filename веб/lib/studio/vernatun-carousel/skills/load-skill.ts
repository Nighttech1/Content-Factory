import { readFileSync } from "node:fs";
import path from "node:path";

const SKILL_DIR = "lib/studio/vernatun-carousel/skills";

const cache = new Map<string, string>();

function readSkill(relName: string, fallback: string): string {
  if (cache.has(relName)) return cache.get(relName)!;
  try {
    const text = readFileSync(
      path.join(process.cwd(), SKILL_DIR, relName),
      "utf8",
    );
    cache.set(relName, text);
    return text;
  } catch {
    return fallback;
  }
}

/** Load viral carousel skill (MAKE + CHECK) for mask prompts. */
export function loadViralCarouselSkill(): string {
  return readSkill(
    "viral-carousel-design.md",
    "# viral skill missing — use Vernatun defaults: contrast, hierarchy, diversity, Design colors only.",
  );
}

/** Scriptwriter MAKE skill (sense + HY vocab). */
export function loadScriptwriterSkill(): string {
  return readSkill(
    "scriptwriter-viral.md",
    "# scriptwriter skill missing — viral hook + one HY—RU vocab per slide.",
  );
}

/** Art-director-script CHECK skill (marketing / viral). */
export function loadArtDirectorScriptSkill(): string {
  return readSkill(
    "art-director-script-viral.md",
    "# AD script skill missing — reject empty hooks; require one HY—RU per slide.",
  );
}

export function skillMakeSection(): string {
  const full = loadViralCarouselSkill();
  const i = full.indexOf("## MAKE");
  const jCheck = full.indexOf("## CHECK");
  const jReview = full.indexOf("## REVIEW CHECKLIST");
  const j = jCheck >= 0 ? jCheck : jReview;
  if (i >= 0 && j > i) return full.slice(i, j).trim();
  return full;
}

export function skillCheckSection(): string {
  const full = loadViralCarouselSkill();
  const iCheck = full.indexOf("## CHECK");
  const iReview = full.indexOf("## REVIEW CHECKLIST");
  const i = iCheck >= 0 ? iCheck : iReview;
  if (i >= 0) return full.slice(i).trim();
  return full;
}

/** Inject into scriptwriter system prompt. */
export function scriptwriterSkillSection(): string {
  return loadScriptwriterSkill().trim();
}

/** Inject into AD-script system prompt. */
export function artDirectorScriptSkillSection(): string {
  return loadArtDirectorScriptSkill().trim();
}

export const VIRAL_SKILL_MARKER = "VIRAL_CAROUSEL_SKILL";
export const SCRIPT_SKILL_MARKER = "SCRIPTWRITER_VIRAL_SKILL";
export const AD_SCRIPT_SKILL_MARKER = "AD_SCRIPT_VIRAL_SKILL";
