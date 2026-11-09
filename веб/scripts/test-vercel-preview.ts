import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { NextRequest } from "next/server";

async function main(): Promise<void> {
const names = ["CONTENT_FACTORY_PREVIEW", "NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW", "DATABASE_URL", "AGGREGATOR_API_KEY"] as const;
const prior = Object.fromEntries(names.map(name => [name, process.env[name]]));
process.env.CONTENT_FACTORY_PREVIEW = "1";
process.env.NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW = "1";
process.env.DATABASE_URL = "postgresql://preview:unused@127.0.0.1:1/unused";
process.env.AGGREGATOR_API_KEY = "preview-invalid-not-a-real-key";

// Load the TS fixture graph before guarding writes: tsx may write its own compile
// cache during imports. The guard below covers actual application execution.
await Promise.all([
  import("../middleware"), import("../lib/db/actor"), import("../lib/db/sprint8-db"),
  import("../lib/db/sprint8-fallback"), import("../lib/preview"),
  import("../lib/analytics/resolve-insights"), import("../lib/studio/sprint8-migrate"),
  import("../app/api/studio/drafts/route"), import("../app/api/studio/boards/route"),
  import("../app/api/settings/brand/route"), import("../app/api/settings/design-slots/route"),
  import("../app/api/schedule/slots/route"),
]);

let writeCalls = 0;
let networkCalls = 0;
const prismaBefore = (globalThis as unknown as { prisma?: unknown }).prisma;
const fetchBefore = globalThis.fetch;
globalThis.fetch = (() => { networkCalls++; throw new Error("Preview must not fetch a model/backend"); }) as typeof fetch;
const mutators = ["mkdir", "writeFile", "appendFile", "rename", "unlink", "rm"] as const;
const original = new Map<string, unknown>();
const mutableFs = fs as unknown as Record<string, unknown>;
for (const name of mutators) {
  original.set(name, mutableFs[name]);
  mutableFs[name] = async () => { writeCalls++; throw new Error("Read-only preview filesystem"); };
}

try {
  const { middleware } = await import("../middleware");
  const { resolveActor } = await import("../lib/db/actor");
  const { resolveSprint8Db } = await import("../lib/db/sprint8-db");
  const { readSprint8Fallback, writeSprint8Fallback } = await import("../lib/db/sprint8-fallback");
  const { PREVIEW_ACTOR_ID } = await import("../lib/preview");
  const { resolveAnalystInsights } = await import("../lib/analytics/resolve-insights");
  const req = new Request("https://preview.example/api/studio/drafts", { headers: { "x-cf-user-id": "other_actor", cookie: "cf_user_id=other_actor" } });
  assert.equal((await resolveActor(req)).userId, PREVIEW_ACTOR_ID);
  assert.deepEqual(await resolveSprint8Db(), { mode: "fallback", prisma: null });
  const store = await readSprint8Fallback();
  assert.equal(store.drafts.length, 3);
  store.drafts[0]!.title = "Changed only this isolated return value";
  assert.match((await readSprint8Fallback()).drafts[0]!.title, /^\[Тест\]/);
  await assert.rejects(writeSprint8Fallback(store), (err: unknown) => (err as { code?: string }).code === "preview_read_only");

  const routeGets = [
    ["drafts", (await import("../app/api/studio/drafts/route")).GET],
    ["boards", (await import("../app/api/studio/boards/route")).GET],
    ["brand", (await import("../app/api/settings/brand/route")).GET],
    ["design-slots", (await import("../app/api/settings/design-slots/route")).GET],
    ["schedule", (await import("../app/api/schedule/slots/route")).GET],
  ] as const;
  for (const [name, get] of routeGets) {
    const response = await get(req);
    assert.equal(response.status, 200, name);
    const body = await response.json();
    if (name === "drafts") assert.equal(body.drafts.length, 3);
  }
  for (const [path, method] of [
    ["/api/studio/drafts", "POST"], ["/api/settings/brand", "PUT"],
    ["/api/studio/migrate-local", "POST"], ["/api/analytics/ingest", "GET"],
    ["/api/studio/agent-chat", "POST"], ["/api/studio/media-proxy", "GET"],
    ["/api/intake/sheet/cron-tick", "GET"], ["/api/aggregator/models", "GET"],
  ]) {
    const response = middleware(new NextRequest(`https://preview.example${path}`, { method }));
    assert.equal(response.status, 403, `${method} ${path}`);
    assert.equal(response.headers.get("x-cf-preview"), "read-only");
  }
  const feed = middleware(new NextRequest("https://preview.example/api/studio/carousel-engine/feed?topic=test"));
  assert.equal(new URL(feed.headers.get("x-middleware-rewrite")!).searchParams.get("fast"), "1");
  for (const path of ["/api/analytics/snapshot", "/api/analytics/insights"]) {
    const response = middleware(new NextRequest(`https://preview.example${path}`));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).source, "mock");
  }
  assert.equal((await resolveAnalystInsights({ refresh: true })).source, "mock");

  const storage = new Map([["cf.sprint8.migrated.v1", "existing"], ["cf.carousel.drafts.v1", "keep"]]);
  const priorWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) } } });
  try {
    const { ensureSprint8Migrated } = await import("../lib/studio/sprint8-migrate");
    assert.equal(await ensureSprint8Migrated(), false);
    assert.equal(storage.get("cf.carousel.drafts.v1"), "keep");
    assert.equal(storage.get("cf.sprint8.migrated.v1"), "existing");
  } finally {
    if (priorWindow) Object.defineProperty(globalThis, "window", priorWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
  assert.equal(writeCalls, 0);
  assert.equal(networkCalls, 0);
  assert.equal((globalThis as unknown as { prisma?: unknown }).prisma, prismaBefore, "Preview must not initialize a Prisma connection");
  process.env.CONTENT_FACTORY_PREVIEW = "0";
  process.env.NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW = "0";
  assert.equal(middleware(new NextRequest("https://preview.example/api/studio/drafts", { method: "POST" })).headers.get("x-middleware-next"), "1");
  console.log("PASS Vercel preview: actual reads, immutable fixture, fixed actor, no DB/model/filesystem writes, mutation gate, feed fixture, labelled analytics and storage-preserving migration skip");
} finally {
  for (const [name, value] of original) mutableFs[name] = value;
  globalThis.fetch = fetchBefore;
  for (const name of names) {
    if (prior[name] === undefined) delete process.env[name];
    else process.env[name] = prior[name];
  }
}
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
