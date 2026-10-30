/**
 * Smoke C-22: register unique custom id → generate must resolve (not module_not_found).
 * Simulates post-hydrate register + generate miss → force re-read from disk.
 * Run: npx tsx scripts/smoke-c22-register-generate.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  createRemoteContentModule,
  recordFromManifest,
} from "../src/modules/custom-remote/factory";
import { upsertCustomModuleRecord } from "../src/modules/custom-remote/persist";
import {
  ensureCustomModulesHydrated,
  getModule,
  resolveModule,
} from "../src/modules/registry";
import { runGenerateDraft } from "../lib/modules/run-module";

const UNIQUE_ID = `custom-smoke-c22-${Date.now()}`;

async function cleanupStore(id: string): Promise<void> {
  const store = path.join(process.cwd(), "data", "local", "custom-modules.json");
  if (!fs.existsSync(store)) return;
  const parsed = JSON.parse(fs.readFileSync(store, "utf8")) as {
    modules?: Array<{ id: string }>;
  };
  parsed.modules = (parsed.modules ?? []).filter((m) => m.id !== id);
  fs.writeFileSync(store, JSON.stringify(parsed, null, 2));
}

async function main() {
  // One-shot hydrate first (same as server boot) — registry "settled".
  await ensureCustomModulesHydrated();
  if (getModule(UNIQUE_ID)) {
    console.error("FAIL: unique id already in registry");
    process.exit(1);
  }

  const mod = createRemoteContentModule({
    title: "C22 Smoke Plugin",
    outputFormat: "carousel_4_5",
    workerEndpoint: "http://127.0.0.1:9/no-worker",
    id: UNIQUE_ID,
  });

  // Persist only — do NOT registerModule (simulates generate route with stale Map
  // that never saw register, or hydrate that ran before this write).
  await upsertCustomModuleRecord(recordFromManifest(mod.manifest));

  if (getModule(UNIQUE_ID)) {
    console.error("FAIL: expected miss before resolveModule force path");
    process.exit(1);
  }

  const resolved = await resolveModule(UNIQUE_ID);
  if (!resolved || resolved.manifest.id !== UNIQUE_ID) {
    console.error("FAIL: resolveModule did not load from disk", resolved?.manifest.id);
    process.exit(1);
  }

  const draft = await runGenerateDraft(UNIQUE_ID, "c22-topic");
  if (!draft || draft.meta?.mock !== true) {
    console.error("FAIL: generate after register miss expected mock draft", draft);
    process.exit(1);
  }

  await cleanupStore(UNIQUE_ID);
  console.log("SMOKE_C22_OK", UNIQUE_ID);
}

main().catch(async (e) => {
  console.error(e);
  await cleanupStore(UNIQUE_ID).catch(() => undefined);
  process.exit(1);
});
