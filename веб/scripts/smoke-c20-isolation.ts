/**
 * C-20: regenerateElement must change only the target index.
 * Run: npx tsx scripts/smoke-c20-isolation.ts
 */
import { getModule } from "../src/modules/registry";
import { getStoredDraft } from "../src/modules/_shared/draft-store";

const CORE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
] as const;

async function main() {
  for (const id of CORE_IDS) {
    const mod = getModule(id);
    if (!mod) {
      console.error("FAIL: missing", id);
      process.exit(1);
    }
    const draft = await mod.generateDraft(`iso ${id}`, { slideCount: 4 });
    const before = Object.fromEntries(
      draft.elements.map((e) => [e.index, JSON.stringify(e.payload)]),
    );
    const target = draft.elements.length > 1 ? 1 : 0;
    await mod.regenerateElement(draft.draftId, target);
    const stored = getStoredDraft(draft.draftId);
    if (!stored) {
      console.error("FAIL:", id, "draft not stored");
      process.exit(1);
    }
    for (const el of stored.elements) {
      const prev = before[el.index];
      const now = JSON.stringify(el.payload);
      if (el.index === target) {
        if (prev === now) {
          console.error("FAIL:", id, "target unchanged");
          process.exit(1);
        }
      } else if (prev !== now) {
        console.error("FAIL:", id, "sibling", el.index, "changed");
        process.exit(1);
      }
    }
    console.log(
      "ISO_OK",
      id,
      "target=",
      target,
      "siblings=",
      stored.elements.length - 1,
    );
  }
  console.log("ISOLATION_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
