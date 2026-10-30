/**
 * Static smoke C-93…C-101 (UX-7).
 * Run: npx tsx scripts/smoke-c93-c101-ux-wave7.ts
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

assert(
  !read("components/studio/StudioPageClient.tsx").includes("«Наши»"),
  "C-93 no Наши in studio blurb",
);

assert(
  read("components/mesh/MeshPipelineSwitcher.tsx").includes('layout={vertical ? "column"'),
  "C-94 vertical MultiButton",
);
assert(
  read("components/ui/multi-button.tsx").includes('layout?: MultiButtonLayout'),
  "C-94 layout prop",
);

assert(
  read("components/mesh/nodes/AgentNode.tsx").includes("AgentProfessionAvatar"),
  "C-95 profession avatar",
);
assert(
  !read("components/mesh/nodes/AgentNode.tsx").includes("задачи:"),
  "C-95 no task count",
);
assert(
  !read("components/mesh/edges/PulseEdge.tsx").includes(">json<") &&
    !read("components/mesh/edges/PulseEdge.tsx").includes("EdgeLabelRenderer"),
  "C-95 no json edge label",
);

assert(
  read("components/schedule/ScheduleModuleRail.tsx").includes("start >= todayStart"),
  "C-96 hide past published from rail",
);

assert(
  read("components/settings/SettingsQuickNav.tsx").includes("text-[var(--text-primary)]") &&
    read("components/settings/SettingsQuickNav.tsx").includes("Навигация"),
  "C-97 TOC white",
);
assert(
  read("components/settings/ScheduleAutofillPanel.tsx").includes("settings-schedule-panel"),
  "C-97 schedule autofill",
);
assert(
  read("components/settings/ScoutSettingsPanel.tsx").includes("settings-scout-panel"),
  "C-97 scout settings",
);

const header = read("components/analytics/AnalyticsHeader.tsx");
assert(!header.includes("цикл 12"), "C-98 no cycle eyebrow");
assert(!header.includes("пересчёт") && !header.includes("эвристик"), "C-98 no reweight");
assert(header.includes("Синхронизация:"), "C-98 full sync word");
assert(header.includes("analytics-filters"), "C-100 dual filters");

assert(
  read("components/analytics/ScoutSection.tsx").includes("scout-topic-search"),
  "C-99 topic search",
);
assert(
  !read("components/analytics/ScoutSection.tsx").includes("Столбы контента"),
  "C-99 no scout pillars mock blurb",
);
assert(
  read("components/analytics/AnalyticsShell.tsx").includes("content-anomalies"),
  "C-99 merged KPI",
);

assert(
  read("components/analytics/OutliersVault.tsx").includes("analytics-outliers-carousel"),
  "C-101 carousel",
);
assert(
  read("components/analytics/OutliersVault.tsx").includes("Резюме Разборщика"),
  "C-101 razbor summary",
);

if (process.exitCode) {
  console.error("\nSMOKE_C93_C101_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C93_C101_OK");
