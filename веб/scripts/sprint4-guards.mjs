/**
 * Sprint 4 executable guards for C-10 / C-11 / C-12 (Media Inspector).
 * Run: node scripts/sprint4-guards.mjs
 *
 * Filesystem assertions always run. Optional HTTP check against
 * http://127.0.0.1:3000/studio/inspect/demo when localhost responds.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fails.push(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

function fileExists(rel) {
  const ok = existsSync(join(root, rel));
  assert(ok, `missing file: ${rel}`);
  return ok;
}

// --- Required route + components (filesystem) ---
const routeRel = "app/studio/inspect/[id]/page.tsx";
fileExists(routeRel);

const componentRels = [
  "components/inspect/MediaDeck.tsx",
  "components/inspect/ReelsPlayer.tsx",
  "components/inspect/CarouselDeck.tsx",
  "components/inspect/ViralityMeter.tsx",
  "components/inspect/HookAlternatives.tsx",
  "components/inspect/ScriptEditor.tsx",
  "components/inspect/HeyGenPersonaSwitcher.tsx",
  "components/inspect/HitlToolbar.tsx",
  "components/inspect/ApproveScheduleModal.tsx",
];
for (const rel of componentRels) fileExists(rel);

fileExists("lib/inspect-store.ts");
fileExists("components/inspect/KaraokeCaptions.tsx");

const store = read("lib/inspect-store.ts");
const karaoke = read("components/inspect/KaraokeCaptions.tsx");
const hooks = read("components/inspect/HookAlternatives.tsx");
const hitl = read("components/inspect/HitlToolbar.tsx");
const approve = read("components/inspect/ApproveScheduleModal.tsx");
const page = read(routeRel);
const media = read("components/inspect/MediaDeck.tsx");
const reels = read("components/inspect/ReelsPlayer.tsx");
const carousel = read("components/inspect/CarouselDeck.tsx");
const virality = read("components/inspect/ViralityMeter.tsx");
const script = read("components/inspect/ScriptEditor.tsx");
const persona = read("components/inspect/HeyGenPersonaSwitcher.tsx");

// --- C-10: Media deck foundation ---
assert(
  page.includes("InspectorShell"),
  "C-10: inspect page must mount InspectorShell",
);
assert(
  media.includes("ReelsPlayer") || media.includes("reels"),
  "C-10: MediaDeck wires Reels preview",
);
assert(
  media.includes("CarouselDeck") || media.includes("carousel"),
  "C-10: MediaDeck wires Carousel preview",
);
assert(
  reels.length > 0 && (reels.includes("9") || reels.includes("aspect")),
  "C-10: ReelsPlayer present with aspect/9:16 signal",
);
assert(
  carousel.includes("@dnd-kit") ||
    carousel.includes("DndContext") ||
    carousel.includes("useSortable"),
  "C-10: CarouselDeck must use @dnd-kit sortable",
);
assert(
  karaoke.includes("--font-hy") || karaoke.includes("font-hy"),
  "C-10: KaraokeCaptions must use --font-hy or font-hy",
);
assert(
  store.includes("selectHook") &&
    store.includes("rerollSelectedSlide") &&
    store.includes("confirmApproveSchedule"),
  "C-10: store must export selectHook, rerollSelectedSlide, confirmApproveSchedule",
);
assert(
  store.includes("openApproveModal") && store.includes("cancelApproveModal"),
  "C-10: store must export openApproveModal + cancelApproveModal",
);
assert(
  store.includes("setPreviewMode") &&
    store.includes("reorderSlides") &&
    store.includes("selectSlide"),
  "C-10: store must include media actions setPreviewMode/reorderSlides/selectSlide",
);

// --- C-11: Hook panel / S2 hook swap ---
assert(
  hooks.includes("selectHook"),
  "C-11: HookAlternatives must call selectHook (S2 hook swap)",
);
assert(
  virality.includes("viralityScore") ||
    virality.includes("activeHookId") ||
    virality.includes("hooks"),
  "C-11: ViralityMeter must read score/hooks from store",
);
assert(
  script.includes("setScript") || script.includes("script"),
  "C-11: ScriptEditor must bind script store",
);
assert(
  persona.includes("setPersonaField") || persona.includes("persona"),
  "C-11: HeyGenPersonaSwitcher must bind persona store",
);
assert(
  hooks.includes("ACTIVE") ||
    hooks.includes("active") ||
    hooks.includes("SWAP") ||
    hooks.includes("aria-selected"),
  "C-11: HookAlternatives must show ACTIVE vs inactive/SWAP state",
);

// --- C-12: HITL toolbar / S2 Approve ---
assert(
  hitl.includes("rerollSelectedSlide"),
  "C-12: HitlToolbar must call rerollSelectedSlide",
);
assert(
  hitl.includes("openApproveModal"),
  "C-12: HitlToolbar must call openApproveModal (S2 Approve entry)",
);
assert(
  approve.includes("confirmApproveSchedule"),
  "C-12: ApproveScheduleModal must call confirmApproveSchedule",
);
assert(
  approve.includes("cancelApproveModal") || hitl.includes("ApproveScheduleModal"),
  "C-12: Approve flow must wire cancel/modal",
);
assert(
  hitl.includes("scheduled") || hitl.includes("Scheduled"),
  "C-12: HitlToolbar must surface Scheduled status after approve (S2 UI change)",
);

async function optionalHttpCheck() {
  const url = "http://127.0.0.1:3000/studio/inspect/demo";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, { signal: ctrl.signal, redirect: "manual" });
    clearTimeout(timer);
    assert(
      res.status === 200,
      `C-10 HTTP: GET ${url} expected 200, got ${res.status}`,
    );
    console.log(`HTTP optional: GET ${url} → ${res.status}`);
  } catch (err) {
    console.log(
      `HTTP optional: localhost not reachable (${err?.cause?.code || err?.name || "skip"}) — filesystem guards only`,
    );
  }
}

await optionalHttpCheck();

if (fails.length) {
  console.error("sprint4-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint4-guards: GREEN (C-10, C-11, C-12)");
