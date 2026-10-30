/**
 * Smoke C-28: mock studio feed API (fixtures + optional live HTTP).
 *
 * File asserts always run. Live HTTP when BASE_URL reachable:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c28-feed.ts
 *
 * Run: npx tsx scripts/smoke-c28-feed.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  emptyFeed,
  getFeedForModule,
  matchesTopic,
  resolveFeed,
} from "../lib/studio/feed-fixtures";
import {
  FEED_CORE_MODULE_IDS,
  isCustomModuleId,
  isFeedCoreModuleId,
} from "../lib/studio/feed-types";

const ROOT = join(__dirname, "..");
const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

function assertShape(body: unknown, label: string): void {
  assert(body && typeof body === "object", `${label}: body must be object`);
  const o = body as Record<string, unknown>;
  assert(Array.isArray(o.ours), `${label}: ours must be array`);
  assert(Array.isArray(o.competitors), `${label}: competitors must be array`);
  for (const p of o.ours as unknown[]) {
    assertPost(p, `${label}.ours`);
  }
  for (const p of o.competitors as unknown[]) {
    assertPost(p, `${label}.competitors`);
  }
}

function assertPost(p: unknown, label: string): void {
  assert(p && typeof p === "object", `${label}: post object`);
  const post = p as Record<string, unknown>;
  assert(typeof post.id === "string" && post.id, `${label}: id`);
  assert(
    post.source === "ours" || post.source === "competitor",
    `${label}: source`,
  );
  assert(typeof post.title === "string", `${label}: title`);
  assert(post.metrics && typeof post.metrics === "object", `${label}: metrics`);
  const m = post.metrics as Record<string, unknown>;
  assert(typeof m.likes === "number", `${label}: likes`);
  assert(typeof m.views === "number", `${label}: views`);
}

function assertFixtures(): void {
  for (const id of FEED_CORE_MODULE_IDS) {
    assert(isFeedCoreModuleId(id), `core id ${id}`);
    const def = getFeedForModule(id);
    assert(def.ours.length >= 2, `${id}: ours fixtures`);
    assert(def.competitors.length >= 3, `${id}: competitor fixtures`);
    assertShape(def, id);

    const filtered = getFeedForModule(id, "cocktail");
    for (const c of filtered.competitors) {
      assert(
        matchesTopic(c, "cocktail"),
        `${id}: filtered competitor must match topic`,
      );
    }
    assert(
      filtered.ours.length === def.ours.length,
      `${id}: ours unchanged by topic`,
    );
  }

  assert(resolveFeed("not-a-module") === null, "unknown → null");
  assert(isCustomModuleId("custom-client-plugin"), "custom pattern");
  assert(!isCustomModuleId("custom-"), "custom- alone invalid");
  assert(!isCustomModuleId("foo"), "plain id not custom");

  const empty = emptyFeed();
  assert(empty.ours.length === 0 && empty.competitors.length === 0, "empty");

  const route = read("app/api/studio/[moduleId]/feed/route.ts");
  assert(route.includes('runtime = "nodejs"'), "runtime nodejs");
  assert(route.includes("module_not_found"), "404 error key");
  assert(!route.includes("prisma"), "no prisma in feed route");

  console.log("SMOKE_C28_FIXTURES_OK");
}

async function assertLive(): Promise<void> {
  if (!BASE) {
    console.log("SMOKE_C28_LIVE_SKIP (set BASE_URL to hit HTTP)");
    return;
  }

  const defRes = await fetch(`${BASE}/api/studio/carousel-engine/feed`);
  assert(defRes.status === 200, `default feed status ${defRes.status}`);
  const defBody = await defRes.json();
  assertShape(defBody, "live default");
  assert(
    (defBody as { competitors: unknown[] }).competitors.length > 0,
    "default competitors non-empty",
  );

  const topicRes = await fetch(
    `${BASE}/api/studio/carousel-engine/feed?topic=${encodeURIComponent("wedding")}`,
  );
  assert(topicRes.status === 200, `topic feed status ${topicRes.status}`);
  const topicBody = (await topicRes.json()) as {
    competitors: { title: string; topicTags?: string[] }[];
  };
  assertShape(topicBody, "live topic");
  for (const c of topicBody.competitors) {
    const blob = `${c.title} ${(c.topicTags ?? []).join(" ")}`.toLowerCase();
    assert(blob.includes("wedding"), `topic filter: ${c.title}`);
  }

  const customRes = await fetch(
    `${BASE}/api/studio/custom-smoke-plugin/feed`,
  );
  assert(customRes.status === 200, `custom status ${customRes.status}`);
  const customBody = await customRes.json();
  assertShape(customBody, "live custom");
  assert(
    (customBody as { ours: unknown[] }).ours.length === 0 &&
      (customBody as { competitors: unknown[] }).competitors.length === 0,
    "custom empty arrays",
  );

  const badRes = await fetch(`${BASE}/api/studio/unknown-module-xyz/feed`);
  assert(badRes.status === 404, `unknown status ${badRes.status}`);
  const badBody = (await badRes.json()) as { ok?: boolean; error?: string };
  assert(badBody.ok === false && badBody.error === "module_not_found", "404 body");

  console.log("SMOKE_C28_LIVE_OK");
}

async function main(): Promise<void> {
  assertFixtures();
  await assertLive();
  console.log("SMOKE_C28_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
