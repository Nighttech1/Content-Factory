/**
 * Static smoke C-68…C-72 (UX wave 2).
 * Run: npx tsx scripts/smoke-c68-c72-ux-wave2.ts
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
function read(rel: string) {
  return readFileSync(path.join(root, rel), "utf8");
}
function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// C-68 — dynamic lives in *PageClient (ssr:false not allowed in RSC)
assert(
  read("components/studio/StudioPageClient.tsx").includes("dynamic("),
  "C-68 studio dynamic",
);
assert(
  read("components/schedule/SchedulePageClient.tsx").includes("dynamic("),
  "C-68 schedule dynamic",
);
assert(
  read("components/analytics/AnalyticsPageClient.tsx").includes("dynamic("),
  "C-68 analytics dynamic",
);
assert(
  read("components/settings/SettingsPageClient.tsx").includes("dynamic("),
  "C-68 settings dynamic",
);
assert(
  read("components/shell/SidebarNavigation.tsx").includes("PREFETCH_HREFS"),
  "C-68 prefetch",
);
assert(
  read("components/shell/AppShell.tsx").includes("NavPendingOverlay"),
  "C-68 nav-pending",
);
assert(existsSync(path.join(root, "components/shell/NavPendingOverlay.tsx")), "C-68 overlay file");

// C-69
assert(
  read("components/studio/workspace/FeedPostCard.tsx").includes("max-w-[13rem]"),
  "C-69 half card",
);
assert(
  read("components/studio/workspace/FeedPostCard.tsx").includes("AnimatePresence"),
  "C-69 slide motion",
);
assert(
  read("components/studio/workspace/CreateCarouselModal.tsx").includes(
    "create-draw-button",
  ),
  "C-69 create assemble CTA",
);
assert(
  read("components/studio/workspace/CreateCarouselModal.tsx").includes(
    "Арт-директор",
  ),
  "C-69 create Art Director",
);
assert(
  read("components/studio/workspace/CreateCarouselModal.tsx").includes(
    "create-carousel-preview-empty",
  ),
  "C-69 empty preview",
);
assert(
  !read("components/studio/workspace/RazborSlidesCarousel.tsx").includes("Слайд ${"),
  "C-69 no slide N/N template",
);
assert(
  read("components/studio/workspace/RazborModal.tsx").includes("showComposer = true"),
  "C-69 publisher chat",
);

// C-70
assert(
  !read("components/shell/SidebarNavigation.tsx").includes("/brand-kit"),
  "C-70 no brand-kit nav",
);
assert(
  read("app/brand-kit/page.tsx").includes('redirect("/settings")'),
  "C-70 brand redirect",
);
assert(
  read("components/settings/SettingsShell.tsx").includes("settings-design-panel"),
  "C-70 design panel",
);
assert(
  read("components/settings/SettingsShell.tsx").includes("settings-agent-packs-panel"),
  "C-70 agent packs",
);

// C-71
const mesh = read("lib/mesh-seed.ts");
assert(mesh.includes('id: "analyst"'), "C-71 analyst");
assert(mesh.includes('id: "script"'), "C-71 script");
assert(mesh.includes('id: "designer"'), "C-71 designer");
assert(mesh.includes('id: "publisher"'), "C-71 publisher");
assert(!mesh.includes('id: "researcher"'), "C-71 no researcher");
assert(!mesh.includes('id: "router"'), "C-71 no router in seed body");
assert(
  read("components/mesh/AgentPropertiesPanel.tsx").includes("agent-properties-prompt"),
  "C-71 prompt field",
);

// C-72
assert(
  read("components/schedule/ScheduleCalendar.tsx").includes("schedule-file-chip"),
  "C-72 file chips",
);
assert(
  read("components/schedule/ScheduleCalendar.tsx").includes("schedule-slot-popup"),
  "C-72 hover popup",
);
assert(
  read("components/schedule/ScheduleCalendar.tsx").includes("self-start"),
  "C-72 date top-left",
);

console.log("SMOKE_C68_C72_ALL_OK");
