/**
 * S52 — Apify only via Scout; feed GET never imports/calls Apify path.
 * Run: npx tsx scripts/smoke-s52-scout-apify-only.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

async function main() {
  const live = read("lib/studio/ig-live-feed.ts");
  assert(
    !live.includes("tryApifyCompetitors"),
    "ig-live-feed must not call tryApifyCompetitors",
  );
  assert(
    !live.includes("fetchApifyCompetitorPosts"),
    "ig-live-feed must not import fetchApifyCompetitorPosts",
  );
  assert(
    live.includes("getScoutCompetitorsForFeed"),
    "ig-live-feed must read Scout snapshot",
  );

  const route = read("app/api/studio/[moduleId]/feed/route.ts");
  assert(
    route.includes("never") || route.includes("S52"),
    "feed route docs must mention S52 / never Apify",
  );

  const scoutRun = read("lib/studio/scout-run.ts");
  assert(
    scoutRun.includes("fetchApifyCompetitorPosts"),
    "scout-run owns Apify",
  );

  const scoutApi = read("app/api/studio/[moduleId]/scout/run/route.ts");
  assert(scoutApi.includes("runScoutApify"), "scout API wires runScoutApify");

  const ui = read("components/mesh/v2/ScoutInspectorSettings.tsx");
  assert(ui.includes('data-testid="scout-razvedat"'), "Разведать button");
  assert(
    ui.includes("scout-inspector-min-likes"),
    "min likes filter in Scout UI",
  );
  assert(
    ui.includes("scout-inspector-frequency-hours"),
    "frequency hours in Scout UI",
  );

  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    !/fetch\s*\(\s*[`'"][^`'"]*\/scout\/run/.test(workspace),
    "Studio workspace must not POST scout/run",
  );
  assert(
    workspace.includes("SCOUT_SNAPSHOT_UPDATED_EVENT"),
    "workspace listens for Scout snapshot update",
  );

  const { writeScoutSnapshot, readScoutSnapshot, clearScoutSnapshotMemory } =
    await import("../lib/studio/scout-snapshot-store");
  const { resolveStudioFeed } = await import("../lib/studio/ig-live-feed");
  const { shouldRunAutoScout } = await import("../lib/studio/scout-run");

  clearScoutSnapshotMemory();
  writeScoutSnapshot("carousel-engine", [
    {
      id: "scout-smoke-1",
      source: "competitor",
      title: "S52 snapshot post",
      metrics: { likes: 99, views: 1000, comments: 1 },
      sourceMode: "live",
      username: "smoke_scout",
    },
  ]);

  const feed = await resolveStudioFeed("carousel-engine");
  assert(feed, "resolveStudioFeed returns feed");
  assert(
    feed!.competitors.some((p) => p.id === "scout-smoke-1"),
    "feed competitors come from Scout snapshot",
  );

  assert(
    shouldRunAutoScout(null, 12) === true,
    "auto-scout due when never run",
  );
  assert(
    shouldRunAutoScout(new Date().toISOString(), 12) === false,
    "auto-scout not due immediately after run",
  );

  const snap = readScoutSnapshot("carousel-engine");
  assert(snap?.competitors.length === 1, "disk/memory snapshot readable");

  console.log("OK smoke-s52-scout-apify-only");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
