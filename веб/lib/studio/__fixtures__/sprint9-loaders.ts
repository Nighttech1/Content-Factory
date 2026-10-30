/**
 * Sprint 9 — golden fixture loaders (C-s9-02 / C-s9-03).
 * Reads memory/fixtures/sprint9/** for tests / few-shot / critic smoke.
 * No Prisma; no wipe of generatedMedia.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  parseAndAssertCarouselJson,
  type CarouselHandoffJson,
} from "@/lib/studio/carousel-json-contract";
import {
  parseAndAssertReelsScript,
  type ReelsScriptArtifact,
} from "@/lib/studio/reels-script-contract";

const ROOT = join(process.cwd(), "memory", "fixtures", "sprint9");

export type Sprint9CarouselFixture = {
  id: string;
  handoff: CarouselHandoffJson;
  notesPath: string;
};

export type Sprint9ReelsFixture = {
  id: string;
  script: ReelsScriptArtifact;
  notesPath: string;
};

function listDirs(abs: string): string[] {
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/** Load all golden carousel handoffs; throws if any fail STRICT parse. */
export function loadSprint9CarouselFixtures(): Sprint9CarouselFixture[] {
  const base = join(ROOT, "carousel");
  return listDirs(base).map((id) => {
    const handoffPath = join(base, id, "handoff.json");
    const raw = readFileSync(handoffPath, "utf8");
    const handoff = parseAndAssertCarouselJson(raw);
    return {
      id,
      handoff,
      notesPath: join(base, id, "NOTES.md"),
    };
  });
}

/** Load all golden reels scripts; throws if any fail STRICT assert. */
export function loadSprint9ReelsFixtures(): Sprint9ReelsFixture[] {
  const base = join(ROOT, "reels");
  return listDirs(base).map((id) => {
    const scriptPath = join(base, id, "script.json");
    const raw = readFileSync(scriptPath, "utf8");
    const script = parseAndAssertReelsScript(raw);
    return {
      id,
      script,
      notesPath: join(base, id, "NOTES.md"),
    };
  });
}

export function sprint9CarouselFixtureIds(): string[] {
  return listDirs(join(ROOT, "carousel"));
}

export function sprint9ReelsFixtureIds(): string[] {
  return listDirs(join(ROOT, "reels"));
}
