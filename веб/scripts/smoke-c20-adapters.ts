/**
 * C-20 smoke: generateDraft + renderAsset for all 4 core modules (mock:true).
 * Run: npx tsx scripts/smoke-c20-adapters.ts
 */
import { listManifests, getModule, listModules } from "../src/modules/registry";

const CORE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
] as const;

async function main() {
  const manifests = listManifests();
  console.log(
    "manifests:",
    manifests.map((m) => m.id).join(","),
  );
  if (listModules().length !== 4) {
    console.error("FAIL: expected 4 modules, got", listModules().length);
    process.exit(1);
  }

  for (const id of CORE_IDS) {
    const mod = getModule(id);
    if (!mod) {
      console.error("FAIL: missing module", id);
      process.exit(1);
    }
    const draft = await mod.generateDraft(`smoke ${id}`, { slideCount: 4 });
    if (!draft.elements.length) {
      console.error("FAIL:", id, "empty elements");
      process.exit(1);
    }
    const original0 = draft.elements.find((e) => e.index === 0)?.payload;
    const render = await mod.renderAsset(draft);
    if (!render.mock) {
      console.error("FAIL:", id, "expected mock:true render");
      process.exit(1);
    }
    if (!render.assets.length) {
      console.error("FAIL:", id, "empty assets");
      process.exit(1);
    }
    const reroll = await mod.regenerateElement(draft.draftId, 0);
    if (reroll.elementIndex !== 0) {
      console.error("FAIL:", id, "regenerate wrong index");
      process.exit(1);
    }
    if (JSON.stringify(reroll.payload) === JSON.stringify(original0)) {
      console.error("FAIL:", id, "regenerate did not change payload");
      process.exit(1);
    }
    console.log(
      "OK",
      id,
      "elements=",
      draft.elements.length,
      "assets=",
      render.assets.length,
      "mock=",
      render.mock,
      "feedback=",
      (render.feedbackLogs ?? []).slice(0, 2).join("|"),
    );
  }

  console.log("SMOKE_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
