/**
 * Static smoke C-79 / C-80 / C-81 (UX-4b full queue).
 * Run: npx tsx scripts/smoke-c79-c81-ux-wave4b.ts
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

// C-79
assert(read("lib/settings/platforms.ts").includes("PublishPlatform"), "C-79 platforms store");
assert(
  read("components/settings/PlatformsPanel.tsx").includes("settings-platforms-panel"),
  "C-79 platforms panel",
);
assert(
  read("components/ui/platform-carousel-picker.tsx").includes("PlatformCarouselPicker"),
  "C-79 carousel picker",
);
assert(
  read("lib/schedule/storage.ts").includes("platformId"),
  "C-79 slot platformId",
);
assert(
  read("components/studio/workspace/RazborPublisherPane.tsx").includes(
    "razbor-publisher-platform",
  ),
  "C-79 publisher platform",
);

// C-80
assert(read("types/analytics.ts").includes("AnalyticsDashboard"), "C-80 types");
assert(
  read("lib/analytics/self-learning-mock.ts").includes("getSelfLearningDashboard"),
  "C-80 mock",
);
const shell = read("components/analytics/AnalyticsShell.tsx");
assert(shell.includes("analytics-shell") || shell.includes("Самообучающаяся"), "C-80 shell");
assert(
  read("components/analytics/AnalyticsHeader.tsx").includes("Самообучающаяся диагностика"),
  "C-80 RU title",
);
assert(
  read("components/analytics/ScoutSection.tsx").includes("analytics-scout") ||
    shell.includes("ScoutSection"),
  "C-80 scout",
);

// C-81
assert(
  read("components/settings/SettingsShell.tsx").includes("settings-design-upload"),
  "C-81 design upload",
);
assert(
  read("components/settings/SettingsShell.tsx").includes("settings-llm-base-url"),
  "C-81 aggregator URL",
);
assert(
  read("lib/settings/llm-models.ts").includes("deepseek-chat") &&
    read("lib/settings/llm-models.ts").includes("resolveModelOptions"),
  "C-81 expanded catalog",
);
assert(
  read("lib/settings/llm-aggregator.ts").includes("LLM_AGGREGATOR_STORAGE_KEY"),
  "C-81 aggregator storage",
);

if (process.exitCode) {
  console.error("\nSMOKE_C79_C81_FAIL");
  process.exit(1);
}
console.log("\nSMOKE_C79_C81_ALL_OK");
