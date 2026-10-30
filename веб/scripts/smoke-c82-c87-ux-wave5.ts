/**
 * Static smoke C-82…C-87 (UX-5).
 * Run: npx tsx scripts/smoke-c82-c87-ux-wave5.ts
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

// C-82 Studio: no stock hover motion / no format badges on tiles
const grid = read("components/studio/ModuleSelectorGrid.tsx");
assert(grid.includes("disableHoverMotion"), "C-82 disableHoverMotion");
assert(!grid.includes("NeonBadge"), "C-82 no NeonBadge format tags");
assert(!grid.includes("group-hover:-translate-y"), "C-82 no stock lift");
assert(
  read("components/ui/GlassCard.tsx").includes("disableHoverMotion"),
  "C-82 GlassCard prop",
);

// C-83 Mesh: expanded MultiButton + Studio-style title
assert(
  read("components/mesh/MeshPipelineSwitcher.tsx").includes("MultiButton") &&
    !read("components/mesh/MeshPipelineSwitcher.tsx").includes(
      "CompactMultiButton",
    ),
  "C-83 expanded MultiButton",
);
const topbar = read("components/mesh/CanvasTopBar.tsx");
assert(topbar.includes("Команда выпуска"), "C-83 title text");
assert(topbar.includes("text-3xl font-semibold"), "C-83 Studio title style");
assert(topbar.includes("justify-center"), "C-83 centered switcher");

// C-84 Schedule sticky Save/Cancel opaque
const cal = read("components/schedule/ScheduleCalendar.tsx");
assert(cal.includes("schedule-slot-save"), "C-84 Save");
assert(cal.includes("schedule-slot-cancel"), "C-84 Cancel");
assert(cal.includes("bg-[var(--bg-elevated)]"), "C-84 opaque popup");
assert(cal.includes("if (dragging) setEditor(null)"), "C-84 drag clears editor");
assert(
  !read("components/schedule/ScheduleModuleRail.tsx").includes("4:5"),
  "C-84 rail no format tags",
);

// C-85 Design + TOC
const shell = read("components/settings/SettingsShell.tsx");
assert(shell.includes("settings-design-filename"), "C-85 filename");
assert(shell.includes("settings-design-upload"), "C-85 upload");
assert(!shell.includes("clearDesignMdOverride"), "C-85 no reset-to-file");
assert(
  !shell.includes("settings-design-editor") &&
    !shell.includes("Сохранить в браузере"),
  "C-85 no code editor / save-in-browser",
);
assert(
  read("components/settings/SettingsQuickNav.tsx").includes(
    "settings-quick-nav",
  ),
  "C-85 TOC",
);
assert(shell.includes('id="settings-design"'), "C-85 design id");
assert(shell.includes('id="settings-agents"'), "C-85 agents id");
assert(shell.includes('id="settings-llm"'), "C-85 llm id");
assert(shell.includes('id="settings-reels"'), "C-85 reels id");

// C-86 Platforms ping green/red
const plat = read("components/settings/PlatformsPanel.tsx");
assert(plat.includes("Проверить подключение"), "C-86 ping label");
assert(plat.includes("settings-platform-ping-"), "C-86 ping testid");
assert(plat.includes('data-conn={st}'), "C-86 conn status");
assert(plat.includes("#3d9a6a"), "C-86 green tone");
assert(plat.includes("accent-terracotta"), "C-86 red tone");

// C-87 dual MultiButton
assert(shell.includes("settings-content-type-filter"), "C-87 content MultiButton");
assert(shell.includes("settings-agent-filter"), "C-87 agent MultiButton");
assert(shell.includes("contentTypeItems"), "C-87 contentTypeItems");
assert(shell.includes("agentPackItems"), "C-87 agentPackItems");

if (process.exitCode) {
  console.error("\nSMOKE_C82_C87_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C82_C87_OK");
