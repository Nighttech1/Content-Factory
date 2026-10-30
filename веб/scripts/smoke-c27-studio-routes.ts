/**
 * Smoke C-27: Studio launch → module routes + flat sidebar (C-60).
 *
 * Source/file asserts (no Playwright). Optional live HTTP when BASE_URL reachable:
 *   BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c27-studio-routes.ts
 *
 * Run: npx tsx scripts/smoke-c27-studio-routes.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const BASE = process.env.BASE_URL?.replace(/\/$/, "") ?? "";

const CORE_IDS = [
  "carousel-engine",
  "aesthetic-graphics",
  "cartoon-reels",
  "heygen-reels",
] as const;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing file: ${rel}`);
  return readFileSync(p, "utf8");
}

/** G1 — launch `/studio` has no command bar / drawer / command-input */
function assertLaunchClean(): void {
  const page = read("app/studio/page.tsx");
  assert(
    !page.includes("FloatingCommandBar"),
    "app/studio/page.tsx must not import/render FloatingCommandBar",
  );
  assert(
    !page.includes("GenerationDrawer"),
    "app/studio/page.tsx must not import/render GenerationDrawer",
  );
  assert(
    !page.includes("command-input"),
    "app/studio/page.tsx must not reference command-input",
  );
  assert(
    page.includes("ModuleSelectorGrid"),
    "launch must still render ModuleSelectorGrid",
  );
  console.log("SMOKE_C27_LAUNCH_CLEAN_OK");
}

/** G2 — ModuleSelectorGrid Link → /studio/{id} */
function assertModuleLinks(): void {
  const grid = read("components/studio/ModuleSelectorGrid.tsx");
  assert(
    /from\s+["']next\/link["']/.test(grid) || grid.includes('from "next/link"'),
    "ModuleSelectorGrid must import next/link",
  );
  assert(grid.includes("<Link"), "ModuleSelectorGrid must render Link");
  assert(
    grid.includes("studioModuleHref") || /href=\{.*studioModuleHref/.test(grid),
    "ModuleSelectorGrid must use studioModuleHref for card href",
  );
  assert(
    grid.includes('data-testid="module-card"'),
    "module-card testid required",
  );

  const modules = read("components/studio/modules.ts");
  assert(
    modules.includes("studioModuleHref") &&
      modules.includes("`/studio/${moduleId}`"),
    "studioModuleHref must return /studio/{moduleId}",
  );
  for (const id of CORE_IDS) {
    assert(
      modules.includes(`"${id}"`) || modules.includes(`'${id}'`),
      `modules.ts / manifests must reference core id ${id}`,
    );
  }
  console.log("SMOKE_C27_MODULE_LINKS_OK");
}

/** G3 — [moduleId] page exists; inspect reserved */
function assertModuleRoute(): void {
  const page = read("app/studio/[moduleId]/page.tsx");
  assert(
    page.includes("isReservedStudioSegment"),
    "[moduleId] page must reject reserved segments",
  );
  assert(
    page.includes("notFound") || page.includes("notFound("),
    "[moduleId] must call notFound for reserved/empty",
  );
  assert(
    page.includes("StudioModuleWorkspace"),
    "[moduleId] must render StudioModuleWorkspace shell",
  );

  const modules = read("components/studio/modules.ts");
  assert(
    modules.includes('RESERVED_STUDIO_SEGMENTS') &&
      modules.includes('"inspect"'),
    "inspect must be in RESERVED_STUDIO_SEGMENTS",
  );

  assert(
    existsSync(join(ROOT, "app/studio/inspect/[id]/page.tsx")),
    "inspect route app/studio/inspect/[id]/page.tsx must remain",
  );
  console.log("SMOKE_C27_MODULE_ROUTE_OK");
}

/** G4 — C-60: flat Студия, no module children; resize + cf.sidebar.width */
function assertSidebarChildren(): void {
  const sidebar = read("components/shell/SidebarNavigation.tsx");
  assert(
    !sidebar.includes('data-testid="nav-studio-children"'),
    "C-60: nav-studio-children must be absent",
  );
  assert(
    !sidebar.includes('data-testid="nav-studio-module"'),
    "C-60: nav-studio-module links must be absent",
  );
  assert(
    sidebar.includes('testId: "nav-studio"') ||
      sidebar.includes('data-testid="nav-studio"'),
    "sidebar must keep flat nav-studio link",
  );
  assert(
    sidebar.includes("SidebarResizeHandle") ||
      sidebar.includes("sidebar-resize-handle"),
    "sidebar must expose resize handle",
  );

  const widthLib = read("lib/shell/sidebar-width.ts");
  assert(
    widthLib.includes('cf.sidebar.width') ||
      widthLib.includes("SIDEBAR_WIDTH_STORAGE_KEY"),
    "sidebar width must persist via cf.sidebar.width",
  );
  assert(
    widthLib.includes("MIN_SIDEBAR_WIDTH") &&
      widthLib.includes("MAX_SIDEBAR_WIDTH"),
    "sidebar width clamp helpers required",
  );
  console.log("SMOKE_C27_SIDEBAR_FLAT_RESIZE_OK");
}

async function liveHttp(): Promise<void> {
  if (!BASE) {
    console.log("SMOKE_C27_LIVE_SKIP (set BASE_URL for HTTP)");
    return;
  }

  const studio = await fetch(`${BASE}/studio`);
  assert(studio.status === 200, `/studio expected 200, got ${studio.status}`);
  const studioHtml = await studio.text();
  assert(
    !studioHtml.includes('data-testid="command-input"'),
    "live /studio HTML must not contain command-input testid",
  );
  assert(
    !/FloatingCommandBar/.test(studioHtml),
    "live /studio must not reference FloatingCommandBar in HTML",
  );
  console.log("SMOKE_C27_LIVE_STUDIO_OK");

  const modulePage = await fetch(`${BASE}/studio/carousel-engine`);
  assert(
    modulePage.status === 200,
    `/studio/carousel-engine expected 200, got ${modulePage.status}`,
  );
  const moduleHtml = await modulePage.text();
  assert(
    moduleHtml.includes("studio-module-page") ||
      moduleHtml.includes("carousel-engine") ||
      moduleHtml.length > 500,
    "/studio/carousel-engine returned empty/suspicious body",
  );
  console.log("SMOKE_C27_LIVE_MODULE_OK");

  const inspect = await fetch(`${BASE}/studio/inspect/demo`);
  assert(
    inspect.status === 200,
    `/studio/inspect/demo expected 200, got ${inspect.status}`,
  );
  console.log("SMOKE_C27_LIVE_INSPECT_OK");
}

async function main(): Promise<void> {
  assertLaunchClean();
  assertModuleLinks();
  assertModuleRoute();
  assertSidebarChildren();
  await liveHttp();
  console.log("SMOKE_C27_OK");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
