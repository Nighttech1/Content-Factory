/**
 * Quick smoke for C-21 Backend (factory + persist + hydrate).
 * Run: npx tsx scripts/smoke-c21-register.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  buildCustomModuleId,
  createRemoteContentModule,
  isValidWorkerEndpoint,
  recordFromManifest,
  toSerializableManifest,
} from "../src/modules/custom-remote/factory";
import {
  readCustomModuleRecords,
  upsertCustomModuleRecord,
} from "../src/modules/custom-remote/persist";
import {
  ensureCustomModulesHydrated,
  listCustomManifests,
  listManifests,
  registerModule,
} from "../src/modules/registry";
import { runGenerateDraft } from "../lib/modules/run-module";

async function main() {
  console.log("core manifests:", listManifests().length);
  console.log("slug:", buildCustomModuleId("My Cool Worker"));
  console.log("url ok https:", isValidWorkerEndpoint("https://example.com/w"));
  console.log("url ok /api:", isValidWorkerEndpoint("/api/workers/x"));
  console.log("url bad:", isValidWorkerEndpoint("ftp://x"));

  let reserved = false;
  try {
    buildCustomModuleId("x", "carousel-engine");
  } catch {
    reserved = true;
  }
  console.log("reserved reject:", reserved);

  const mod = createRemoteContentModule({
    title: "Smoke Plugin",
    outputFormat: "carousel_4_5",
    workerEndpoint: "http://127.0.0.1:9/no-worker",
  });
  registerModule(mod);
  const draft = await mod.generateDraft("hello");
  console.log("mock draft:", draft.meta?.mock === true, "id:", mod.manifest.id);

  await upsertCustomModuleRecord(recordFromManifest(mod.manifest));
  const records = await readCustomModuleRecords();
  console.log(
    "persisted:",
    records.some((r) => r.id === mod.manifest.id),
  );

  await ensureCustomModulesHydrated();
  const again = await runGenerateDraft(mod.manifest.id, "after hydrate");
  console.log("generate after hydrate mock:", again.meta?.mock === true);
  console.log(
    "custom list:",
    listCustomManifests()
      .map((m) => m.id)
      .join(","),
  );
  console.log(
    "serializable keys:",
    Object.keys(toSerializableManifest(mod.manifest)).join(","),
  );

  const store = path.join(process.cwd(), "data", "local", "custom-modules.json");
  if (fs.existsSync(store)) {
    const parsed = JSON.parse(fs.readFileSync(store, "utf8")) as {
      modules?: Array<{ id: string }>;
    };
    parsed.modules = (parsed.modules ?? []).filter(
      (m) => m.id !== mod.manifest.id,
    );
    fs.writeFileSync(store, JSON.stringify(parsed, null, 2));
  }

  if (listManifests().length !== 4) {
    console.error("FAIL: core listManifests must stay 4");
    process.exit(1);
  }
  if (!draft.meta?.mock || !again.meta?.mock) {
    console.error("FAIL: expected mock drafts when worker down");
    process.exit(1);
  }
  console.log("SMOKE_C21_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
