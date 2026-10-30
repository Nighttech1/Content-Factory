/**
 * Static smoke C-73 / C-74 / C-75 (UX-3).
 * Run: npx tsx scripts/smoke-c73-c75-ux-wave3.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
function read(rel: string) {
  return readFileSync(path.join(root, rel), "utf8");
}

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("PASS:", msg);
  }
}

// —— C-73 ——
const sidebar = read("components/shell/SidebarNavigation.tsx");
assert(!sidebar.includes("Пайплайны"), "C-73 no pipelines nav");
assert(!sidebar.includes("Բարև"), "C-73 no Barev greeting");

const settings = read("components/settings/SettingsShell.tsx");
const schedule = read("components/schedule/ScheduleShell.tsx");
assert(!settings.includes('"// '), "C-73 settings no mono eyebrow");
assert(!schedule.includes('"// '), "C-73 schedule no mono eyebrow");

const vertical = read("components/studio/workspace/VerticalPostCarousel.tsx");
assert(
  vertical.includes("lg:grid-cols-2") && vertical.includes("grid-cols-1"),
  "C-73 dual cards grid",
);

const feedCard = read("components/studio/workspace/FeedPostCard.tsx");
assert(
  feedCard.includes("C-73") || feedCard.includes("C-131"),
  "C-73/C-131 feed card slide notes",
);
assert(
  !feedCard.includes("bg-[rgba(0,0,0,0.28)]"),
  "C-73 no dark hover scrim on media",
);
// C-131 supersedes C-73 hard-cut: overlapping opacity crossfade (mode=sync)
assert(
  feedCard.includes('mode="sync"') && feedCard.includes("data-carousel-crossfade"),
  "C-131 feed card crossfade structure",
);

const razborSlides = read("components/studio/workspace/RazborSlidesCarousel.tsx");
assert(
  razborSlides.includes('mode="sync"') &&
    razborSlides.includes("data-carousel-crossfade"),
  "C-131 razbor slides crossfade (supersedes C-73 hard cut)",
);

// —— C-74 ——
assert(
  read("components/ui/multi-button.tsx").includes("MultiButton"),
  "C-74 multi-button component",
);
const composer = read("components/studio/workspace/AgentChatComposer.tsx");
/** S47 — handoff = HandoffRoundButton (arrow+logo), not MultiButton text cell. */
assert(
  composer.includes("HandoffRoundButton") || composer.includes("onHandoff"),
  "C-74 composer handoff control",
);
assert(composer.includes("onHandoff"), "C-74 composer handoff");
assert(composer.includes("aboveInput"), "C-74 aboveInput slot");

const razbor = read("components/studio/workspace/RazborModal.tsx");
assert(!razbor.includes("Аналитик готов"), "C-74 no welcome fluff");
assert(razbor.includes("razbor-start-btn"), "C-74 start CTA present");
assert(razbor.includes("aboveInput"), "C-74 start above composer");
assert(
  razbor.includes("razbor-send-designer") ||
    razbor.includes('handoffTestId'),
  "C-74 handoff testids",
);

// —— C-75 ——
const pipeline = read("lib/studio/razbor-pipeline.ts");
assert(pipeline.includes("buildCarouselIdeaBrief"), "C-75 idea brief builder");
assert(pipeline.includes("handoffPayload"), "C-75 handoff payload");
assert(pipeline.includes("ideaSlides"), "C-75 idea slides");

assert(razbor.includes('status === "handed"'), "C-75 check on handed");
assert(
  !/pane\.status === "done" \?[\s\S]*✓/.test(razbor),
  "C-75 no check on done",
);

const publisher = read("components/studio/workspace/RazborPublisherPane.tsx");
assert(publisher.includes("onEnsureDraft"), "C-75 publisher upsert draft");
assert(publisher.includes("upsertSlot"), "C-75 publisher upsert slot");

const catalog = read("lib/settings/agent-pack-catalog.ts");
assert(catalog.includes("packScopedKey"), "C-75 scoped pack key");
assert(catalog.includes("carousel-engine"), "C-75 content types");
assert(
  settings.includes("settings-content-type-filter"),
  "C-75 settings content-type UI",
);

const create = read("components/studio/workspace/CreateCarouselModal.tsx");
assert(create.includes("create-draw-button"), "Create assemble CTA");
assert(create.includes("Арт-директор"), "Create single Art Director");
assert(create.includes("upsertDraft"), "Create persists draft after draw");
assert(
  !create.includes("CreateCarouselPublicationPane"),
  "Create has no publication pane",
);

if (process.exitCode) {
  console.error("\nSMOKE_C73_C75_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C73_C75_ALL_OK");
