/**
 * Sprint 2 executable guards for C-04 / C-05 / C-06 (Launchpad).
 * Run: node scripts/sprint2-guards.mjs
 * Exit 0 = GREEN; non-zero = RED for Fixer.
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

function countOccurrences(haystack, needle) {
  if (!haystack || !needle) return 0;
  let n = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    n += 1;
    i += needle.length;
  }
  return n;
}

// --- Shared files ---
const modules = read("components/studio/modules.ts");
const store = read("lib/studio-store.ts");
const grid = read("components/studio/ModuleSelectorGrid.tsx");
const bar = read("components/studio/FloatingCommandBar.tsx");
const drawer = read("components/studio/GenerationDrawer.tsx");
const page = read("app/studio/page.tsx");

// --- C-04: ModuleSelectorGrid — 4 modules + module-add ---
const MODULE_IDS = [
  "carousel-4-5",
  "infographics",
  "cartoon-reels",
  "heygen-avatar",
];
for (const id of MODULE_IDS) {
  assert(
    modules.includes(`"${id}"`) || modules.includes(`'${id}'`),
    `C-04: modules.ts missing module id ${id}`,
  );
}
assert(
  /export const STUDIO_MODULES/.test(modules),
  "C-04: STUDIO_MODULES export missing",
);
assert(
  countOccurrences(modules, "id:") >= 4 ||
    MODULE_IDS.every((id) => modules.includes(id)),
  "C-04: expected 4 studio modules in modules.ts",
);

assert(
  grid.includes('data-testid="module-card"'),
  'C-04: ModuleSelectorGrid missing data-testid="module-card"',
);
assert(
  grid.includes('data-testid="module-add"'),
  'C-04: ModuleSelectorGrid missing data-testid="module-add"',
);
assert(
  grid.includes("STUDIO_MODULES") && grid.includes("setSelectedModuleId"),
  "C-04: grid must map STUDIO_MODULES and call setSelectedModuleId",
);
assert(
  grid.includes("selectedModuleId") &&
    (grid.includes("GlassCard") || grid.includes("glass")),
  "C-04: grid must use store selection + GlassCard",
);
assert(
  /damping:\s*25/.test(grid) && /stiffness:\s*300/.test(grid),
  "C-04: Motion spring 25/300 on module cards",
);
assert(
  store.includes("selectedModuleId") && store.includes("setSelectedModuleId"),
  "C-04: studio-store must expose selectedModuleId + setter",
);

// --- C-05: FloatingCommandBar — Generate → startGenerate, requires module ---
assert(
  bar.includes('data-testid="command-input"'),
  'C-05: FloatingCommandBar missing data-testid="command-input"',
);
assert(
  bar.includes('data-testid="generate-draft"'),
  'C-05: FloatingCommandBar missing data-testid="generate-draft"',
);
assert(
  bar.includes("startGenerate"),
  "C-05: Generate Draft must call startGenerate",
);
assert(
  /onClick=\{\(\)\s*=>\s*startGenerate\(\)\}/.test(bar) ||
    bar.includes("startGenerate()"),
  "C-05: generate button must invoke startGenerate()",
);
assert(
  bar.includes("selectedModuleId") &&
    (bar.includes("disabled={!canGenerate}") ||
      /disabled=\{!selectedModuleId\}/.test(bar) ||
      bar.includes("canGenerate")),
  "C-05: Generate must require selectedModuleId (disabled when none)",
);
assert(
  store.includes("topic") &&
    store.includes("setTopic") &&
    store.includes("applyPreset") &&
    store.includes("startGenerate"),
  "C-05: store must expose topic + presets + startGenerate",
);
assert(
  /startGenerate:\s*\(\)\s*=>\s*\{[\s\S]*selectedModuleId[\s\S]*return/.test(
    store,
  ) ||
    /if\s*\(\s*!get\(\)\.selectedModuleId\s*\)\s*return/.test(store),
  "C-05/C-06: startGenerate must no-op without selectedModuleId",
);

// --- C-06: GenerationDrawer + mock pipeline + compose ---
assert(
  drawer.includes('data-testid="generation-drawer"'),
  'C-06: GenerationDrawer missing data-testid="generation-drawer"',
);
assert(
  drawer.includes('data-testid="agent-step"'),
  'C-06: GenerationDrawer missing data-testid="agent-step"',
);
assert(
  drawer.includes('data-testid="generation-progress"'),
  'C-06: GenerationDrawer missing data-testid="generation-progress"',
);

const PIPELINE_PHASES = [
  "researching",
  "hooking",
  "scripting",
  "designing",
  "done",
];
for (const phase of PIPELINE_PHASES) {
  assert(
    store.includes(`"${phase}"`) || store.includes(`'${phase}'`),
    `C-06: studio-store pipeline missing phase id ${phase}`,
  );
}
assert(
  store.includes("drawerOpen") &&
    store.includes("agentSteps") &&
    store.includes("progress") &&
    store.includes("runMockPipeline"),
  "C-06: store must open drawer + run mock pipeline with agentSteps/progress",
);
assert(
  /drawerOpen:\s*true/.test(store) || store.includes("drawerOpen: true"),
  "C-06: startGenerate/runMockPipeline must set drawerOpen true",
);
assert(
  store.includes("clearTimeout") || store.includes("setTimeout"),
  "C-06: mock pipeline must use client timers (not SSE)",
);
assert(
  !store.includes("EventSource") && !store.includes("/api/jobs"),
  "C-06: no SSE / job API in mock store",
);

assert(
  page.includes("ModuleSelectorGrid") &&
    page.includes("FloatingCommandBar") &&
    page.includes("GenerationDrawer"),
  "C-06: /studio must compose Grid + CommandBar + Drawer",
);

// Cross-ticket testid inventory (S1 static surface)
const testids = {
  "module-card": grid,
  "module-add": grid,
  "command-input": bar,
  "generate-draft": bar,
  "generation-drawer": drawer,
  "agent-step": drawer,
  "generation-progress": drawer,
};
for (const [id, src] of Object.entries(testids)) {
  assert(
    src.includes(`data-testid="${id}"`),
    `Sprint2: data-testid="${id}" missing in expected file`,
  );
}

if (fails.length) {
  console.error("sprint2-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint2-guards: GREEN (C-04, C-05, C-06)");
process.exit(0);
