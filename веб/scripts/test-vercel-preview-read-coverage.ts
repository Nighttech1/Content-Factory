/** Independent read-route and gate coverage. Models/network and filesystem mutations are forbidden. */
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { NextRequest } from "next/server";

async function main() {
  const keys = ["CONTENT_FACTORY_PREVIEW", "NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW", "DATABASE_URL"];
  const previous = keys.map(key => process.env[key]);
  process.env.CONTENT_FACTORY_PREVIEW = "1";
  process.env.NEXT_PUBLIC_CONTENT_FACTORY_PREVIEW = "1";
  process.env.DATABASE_URL = "postgresql://preview:unused@127.0.0.1:1/unused";
  const writeNames = ["mkdir", "writeFile", "appendFile", "rename", "unlink", "rm", "copyFile"] as const;
  const saved = writeNames.map(name => fs[name]);
  let writes = 0; const writePaths: string[] = [];
  for (const name of writeNames) {
    (fs as unknown as Record<string, unknown>)[name] = async (...args: unknown[]) => { writes++; writePaths.push(String(args[0])); throw new Error("Tester denies filesystem mutation"); };
  }
  const prismaBefore = (globalThis as unknown as { prisma?: unknown }).prisma;
  try {
    const { middleware } = await import("../middleware");
    const req = (path: string, method = "GET") => new NextRequest(`https://preview.example${path}`, { method });
    const routes = [
      ["/api/settings/landscapes", (await import("../app/api/settings/landscapes/route")).GET],
      ["/api/settings/publicist", (await import("../app/api/settings/publicist/route")).GET],
      ["/api/settings/design-active", (await import("../app/api/settings/design-active/route")).GET],
      ["/api/settings/design-md", (await import("../app/api/settings/design-md/route")).GET],
      ["/api/settings/agent-packs", (await import("../app/api/settings/agent-packs/route")).GET],
      ["/api/brand-kit", (await import("../app/api/brand-kit/route")).GET],
    ] as const;
    for (const [path, handler] of routes) {
      assert.equal(middleware(req(path)).headers.get("x-middleware-next"), "1", path);
      assert.equal((await (handler as (request: Request) => Promise<Response>)(req(path))).status, 200, path);
    }
    const dynamic = [
      ["/api/studio/drafts/preview_draft_1", (await import("../app/api/studio/drafts/[id]/route")).GET, "preview_draft_1"],
      ["/api/studio/boards/preview_board", (await import("../app/api/studio/boards/[id]/route")).GET, "preview_board"],
      ["/api/settings/design-slots/preview_design", (await import("../app/api/settings/design-slots/[id]/route")).GET, "preview_design"],
    ] as const;
    for (const [path, handler, id] of dynamic) {
      assert.equal(middleware(req(path)).headers.get("x-middleware-next"), "1", path);
      assert.equal((await handler(req(path), { params: Promise.resolve({ id }) })).status, 200, path);
    }
    const feed = (await import("../app/api/studio/[moduleId]/feed/route")).GET;
    for (const moduleId of ["carousel-engine", "custom-reels"]) {
      const path = `/api/studio/${moduleId}/feed?fast=0&topic=test`;
      const gate = middleware(req(path));
      const rewritten = gate.headers.get("x-middleware-rewrite");
      assert.ok(rewritten);
      assert.equal(new URL(rewritten).searchParams.get("fast"), "1");
      assert.equal((await feed(new Request(rewritten), { params: Promise.resolve({ moduleId }) })).status, 200);
    }
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      for (const path of ["/api/studio/drafts", "/api/settings/design-active", "/api/brand-kit", "/api/studio/carousel-engine/feed"]) {
        assert.equal(middleware(req(path, method)).status, 403, `${method} ${path}`);
      }
    }
    for (const path of ["/api/intake/sheet/cron-tick", "/api/analytics/ingest", "/api/studio/carousel-engine/scout/run", "/api/aggregator/models", "/api/unknown", "/api/studio/media-proxy?url=https://example.invalid"]) {
      assert.equal(middleware(req(path)).status, 403, path);
    }
    assert.equal(writes, 0, JSON.stringify([...new Set(writePaths)].slice(0, 5)));
    assert.equal((globalThis as unknown as { prisma?: unknown }).prisma, prismaBefore);
    console.log("PASS independent preview coverage: additional actual read routes, feed rewrite, unsafe method/path denial, no FS mutation or Prisma initialization");
  } finally {
    for (let i = 0; i < writeNames.length; i++) (fs as unknown as Record<string, unknown>)[writeNames[i]!] = saved[i];
    for (let i = 0; i < keys.length; i++) {
      if (previous[i] === undefined) delete process.env[keys[i]!]; else process.env[keys[i]!] = previous[i];
    }
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
