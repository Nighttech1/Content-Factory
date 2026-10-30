/**
 * Static smoke C-76 / C-77 / C-78 (UX-4a).
 * Run: npx tsx scripts/smoke-c76-c78-ux-wave4a.ts
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

// C-76
assert(
  read("src/modules/site-articles/manifest.ts").includes("Статьи на сайт"),
  "C-76 site-articles",
);
assert(
  read("src/modules/tg-articles/manifest.ts").includes("Статьи в TG"),
  "C-76 tg-articles",
);
assert(
  read("src/modules/manifests.ts").includes("siteArticles") &&
    read("src/modules/manifests.ts").includes("tgArticles"),
  "C-76 manifests registered",
);
const studio = read("components/studio/StudioPageClient.tsx");
const grid = read("components/studio/ModuleSelectorGrid.tsx");
assert(!studio.includes("Выберите модуль"), "C-76 no choose-module in header");
assert(!grid.includes("Выберите модуль"), "C-76 no choose-module under grid");
assert(studio.includes("канал выпуска"), "C-76 one descriptive paragraph");

// C-77
assert(
  read("components/mesh/MeshPipelineSwitcher.tsx").includes("CompactMultiButton"),
  "C-77 mesh CompactMultiButton",
);
assert(
  read("components/studio/workspace/RazborModal.tsx").includes(
    "AgentPeopleIconTabs",
  ) ||
    read("components/studio/workspace/RazborModal.tsx").includes(
      "CompactMultiButton",
    ),
  "C-77/S47 razbor agent people tabs",
);
assert(
  read("lib/studio/carousel-draft-types.ts").includes('label: "Разборщик"'),
  "C-77 Разборщик label",
);
assert(
  read("lib/studio/razbor-pipeline.ts").includes("Я Разборщик"),
  "C-77 welcome Разборщик",
);
assert(
  read("components/shell/SidebarNavigation.tsx").includes("Аналитика"),
  "C-77 nav still Аналитика",
);

// C-78
const cal = read("components/schedule/ScheduleCalendar.tsx");
assert(!cal.includes("Нажмите день — слот сохранится"), "C-78 no footer help");
assert(!cal.includes(">Время слота<") && !cal.includes("Время слота\n"), "C-78 no footer time label");
assert(cal.includes("POPUP_GRACE_MS") || cal.includes("scheduleClose"), "C-78 sticky grace");
assert(cal.includes("application/x-cf-schedule-slot"), "C-78 chip DnD mime");
assert(
  read("lib/schedule/storage.ts").includes("moveSlotDay"),
  "C-78 moveSlotDay",
);
assert(
  read("components/schedule/ScheduleShell.tsx").includes("keepTime"),
  "C-78 shell keepTime",
);

if (process.exitCode) {
  console.error("\nSMOKE_C76_C78_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C76_C78_ALL_OK");
