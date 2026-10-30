/**
 * Static smoke C-102…C-106 (UX-8).
 * Run: npx tsx scripts/smoke-c102-c106-ux-wave8.ts
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

const seed = read("lib/mesh-seed.ts");
assert(seed.includes('label: "Скаут"'), "C-102 scout node");
assert(seed.includes('label: "Аналитик"'), "C-102 analyst");
assert(seed.includes('label: "Тренер"'), "C-102 trainer");
assert(seed.includes("copywriterPackId"), "C-105 per-type copywriter");
assert(seed.includes("фильтр постов"), "C-129 handoff short RU (was C-102)");
assert(
  !seed.includes("Стартует разбор конкурента"),
  "C-102 analyst not razbor",
);

assert(
  read("components/mesh/edges/PulseEdge.tsx").includes("mesh-edge-handoff"),
  "C-102 edge handoff UI",
);
assert(
  !read("components/mesh/edges/PulseEdge.tsx").includes(">json<"),
  "C-102 no json label",
);

const cal = read("components/schedule/ScheduleCalendar.tsx");
assert(cal.includes("fixed z-[80]"), "C-103 fixed popup");
assert(cal.includes("schedule-slot-popup-drag"), "C-103 draggable");

assert(
  read("components/schedule/ScheduleShell.tsx").includes("schedule-rail-resize"),
  "C-103 rail resize",
);

assert(
  read("components/settings/ScoutSettingsPanel.tsx").includes(
    "settings-scout-content-types",
  ),
  "C-104 scout MultiButton",
);
assert(
  read("lib/settings/content-type-platforms.ts").includes("SCOUT_CONTENT_TYPE_OPTIONS"),
  "C-104 all pipeline types",
);

assert(
  read("lib/settings/agent-pack-catalog.ts").includes("copywriter-"),
  "C-105 copywriter packs",
);
assert(
  read("lib/settings/agent-pack-catalog.ts").includes("razbor-agent"),
  "C-102 razbor pack id",
);

const shell = read("components/settings/SettingsShell.tsx");
assert(shell.includes("settings-pack-prompt-upload"), "C-106 prompt MD upload");
assert(shell.includes("settings-pack-tools"), "C-106 tools list");
assert(!shell.includes('data-testid="settings-pack-prompt"'), "C-106 no prompt textarea");

if (process.exitCode) {
  console.error("\nSMOKE_C102_C106_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C102_C106_OK");
