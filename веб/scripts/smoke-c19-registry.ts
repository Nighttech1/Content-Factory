import {
  listManifests,
  getModule,
  listModules,
} from "../src/modules/registry";
import { toCanonicalModuleId } from "../src/modules/id-map";

async function main() {
  const ids = listManifests()
    .map((m) => m.id)
    .sort();
  console.log("manifests:", ids.join(","));
  console.log("count:", ids.length);
  console.log(
    "alias heygen-avatar ->",
    getModule("heygen-avatar")?.manifest.id,
  );
  console.log(
    "alias carousel-4-5 ->",
    getModule("carousel-4-5")?.manifest.id,
  );
  console.log(
    "alias infographics ->",
    getModule("infographics")?.manifest.id,
  );
  console.log(
    "canonical heygen-reels ->",
    getModule("heygen-reels")?.manifest.id,
  );
  console.log(
    "toCanonical(heygen-avatar):",
    toCanonicalModuleId("heygen-avatar"),
  );

  const draft = await getModule("carousel-engine")!.generateDraft(
    "smoke topic",
  );
  console.log("draft elements:", draft.elements.length, "mock:", draft.meta?.mock);

  let threw = false;
  try {
    await getModule("heygen-reels")!.renderAsset(draft);
  } catch (e) {
    threw = String(e).includes("NotImplemented:C-20");
    console.log("renderAsset throws NotImplemented:C-20:", threw);
  }
  console.log("modules:", listModules().length);
  if (ids.length !== 4) {
    console.error("FAIL: expected 4 manifests");
    process.exit(1);
  }
  if (!threw) {
    console.error("FAIL: renderAsset should throw");
    process.exit(1);
  }
  console.log("SMOKE_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
