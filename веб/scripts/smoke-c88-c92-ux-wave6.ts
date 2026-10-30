/**
 * Static smoke C-88…C-92 (UX-6).
 * Run: npx tsx scripts/smoke-c88-c92-ux-wave6.ts
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

const mb = read("components/ui/multi-button.tsx");
assert(mb.includes("rounded-lg"), "C-88 MultiButton chamfer rounded-lg");
assert(!mb.includes("rounded-full"), "C-88 no pill rounded-full");
assert(mb.includes("WIDTH_SPRING"), "C-88 width spring");
assert(mb.includes("9.4"), "C-88 Cyrillic label width estimate");

const switcher = read("components/mesh/MeshPipelineSwitcher.tsx");
assert(switcher.includes("justify-start"), "C-88 mesh left");
assert(
  read("lib/mesh-seed.ts").includes("Информационное видео"),
  "C-88 full info-video label",
);

const top = read("components/mesh/CanvasTopBar.tsx");
assert(!top.includes("mesh-metric-jobs"), "C-89 no jobs metric");
assert(!top.includes("Задержка"), "C-89 no latency");
assert(!top.includes("GPU"), "C-89 no GPU");
assert(top.includes("justify-start"), "C-89 switcher left");

const props = read("components/mesh/AgentPropertiesPanel.tsx");
assert(props.includes("agent-properties-resize"), "C-90 resize handle");
assert(props.includes("agent-properties-scout"), "C-90 scout feed");
assert(!props.includes("agent-properties-jobs"), "C-90 no jobs count");
assert(props.includes("cf.agent-props.width"), "C-90 width persist");

const menu = read("components/ui/menu-vertical.tsx");
assert(menu.includes("text-base font-bold"), "C-91 +1 bold");
assert(menu.includes("accent-blue-bright"), "C-91 blue titles");
assert(menu.includes("font-ui"), "C-91 Century Gothic");

const shell = read("components/schedule/ScheduleShell.tsx");
assert(
  !shell.includes("setMonth(new Date(day.getFullYear()"),
  "C-92 day click no setMonth",
);
assert(shell.includes("onSlotRemove"), "C-92 delete wired");

const cal = read("components/schedule/ScheduleCalendar.tsx");
assert(cal.includes("schedule-slot-delete"), "C-92 delete button");
assert(
  cal.includes('font-[family-name:var(--font-ui)] text-xs font-semibold text-[var(--accent-blue-bright)]') &&
    cal.includes("Время публикации"),
  "C-92 field label blue CG",
);
assert(cal.includes("schedule-slot-delete"), "C-92 delete testid present");

const settings = read("components/settings/SettingsShell.tsx");
assert(
  settings.includes('data-testid="settings-content-type-filter"') &&
    settings.includes("justify-start"),
  "C-88/91 settings MultiButton left",
);

if (process.exitCode) {
  console.error("\nSMOKE_C88_C92_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C88_C92_OK");
