/**
 * Smoke C-38: Researcher packs + skill expose topic→hashtags contract.
 * Docs/fixtures only — no Graph API, no tokens.
 * Run: npx tsx scripts/smoke-c38-topic-hashtags.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const agent = read("agents/researcher.md");
const skill = read("workers/researcher/SKILL.md");
const version = read("workers/researcher/VERSION.md");
const pipeline = read(".cursor/skills/content-pipeline-agents/SKILL.md");

const packs = [
  ["agents/researcher.md", agent],
  ["workers/researcher/SKILL.md", skill],
  [".cursor/skills/content-pipeline-agents/SKILL.md", pipeline],
] as const;

for (const [path, body] of packs) {
  assert(body.includes("instagramHashtags"), `${path}: instagramHashtags`);
  assert(body.includes("deterministic_mapper"), `${path}: deterministic_mapper`);
  assert(body.includes("emptyTopic"), `${path}: emptyTopic`);
  assert(body.includes("IG_DEFAULT_HASHTAGS"), `${path}: IG_DEFAULT_HASHTAGS`);
  assert(
    body.includes("armenianclub") &&
      body.includes("yerevan") &&
      body.includes("armenianfood") &&
      body.includes("guestnight"),
    `${path}: niche defaults`,
  );
  assert(
    /optional\s+(BD\s+)?fallback/i.test(body) ||
      /fallback only/i.test(body) ||
      /Optional BD fallback/i.test(body),
    `${path}: BD marked fallback`,
  );
  assert(
    /HTML\s+scrap/i.test(body) &&
      (/Forbidden/i.test(body) ||
        /Forbid/i.test(body) ||
        /Запрещ/i.test(body) ||
        /запрещ/i.test(body)),
    `${path}: scrape forbidden`,
  );
  assert(
    !/Business Discovery only/i.test(body),
    `${path}: must not say Business Discovery only as primary`,
  );
}

assert(skill.includes("researcher@v3"), "workers/researcher/SKILL.md: researcher@v3");
assert(version.includes("researcher@v3"), "VERSION.md: researcher@v3");
assert(
  /Primary:.*Hashtag Search/i.test(pipeline) || /Hashtag Search \+ `top_media`/i.test(pipeline),
  "pipeline skill: Hashtag Search primary",
);
assert(
  /optional BD fallback only/i.test(pipeline) ||
    /Fallback only:.*Business Discovery/i.test(pipeline),
  "pipeline skill: BD fallback",
);

// Secret scan — no long token-like literals in pack surfaces
const secretRe = /\b(EAA[A-Za-z0-9]{20,}|IGQ[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})\b/;
for (const [path, body] of [
  ...packs,
  ["workers/researcher/VERSION.md", version] as const,
]) {
  assert(!secretRe.test(body), `${path}: secret-like literal`);
}

console.log(
  "C-38 smoke OK: instagramHashtags contract, empty defaults, BD fallback, no scrape, researcher@v3",
);
