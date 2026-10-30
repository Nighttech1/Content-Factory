/**
 * Static smoke: C-63…C-67 UX wave (nav speed, carousel 9:16, create modal, mesh, schedule).
 * Run: npx tsx scripts/smoke-c63-c67-ux-wave.ts
 * Optional: BASE_URL=http://127.0.0.1:3000
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getFeedForModule } from "../lib/studio/feed-fixtures";
import { createMeshSeed } from "../lib/mesh-seed";

const ROOT = join(__dirname, "..");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function read(rel: string): string {
  const p = join(ROOT, rel);
  assert(existsSync(p), `missing ${rel}`);
  return readFileSync(p, "utf8");
}

function assertExists(rel: string): void {
  assert(existsSync(join(ROOT, rel)), `missing ${rel}`);
}

/** C-63 — route loading + dynamic imports + shells + InsightsFeed */
function assertC63(): void {
  const loadings = [
    "app/studio/loading.tsx",
    "app/schedule/loading.tsx",
    "app/analytics/loading.tsx",
    "app/brand-kit/loading.tsx",
    "app/settings/loading.tsx",
    "app/admin/mesh/loading.tsx",
  ];
  for (const rel of loadings) assertExists(rel);

  const meshPage = read("app/admin/mesh/page.tsx");
  assert(meshPage.includes("dynamic("), "mesh page dynamic()");
  assert(meshPage.includes("AgentMeshCanvas"), "mesh dynamic AgentMeshCanvas");

  const ws = read("components/studio/StudioModuleWorkspace.tsx");
  assert(ws.includes("dynamic("), "workspace dynamic()");
  assert(ws.includes("RazborModal"), "dynamic RazborModal");
  assert(ws.includes("CreateCarouselModal"), "dynamic CreateCarouselModal");

  const analyticsGrid = read("components/analytics/AnalyticsMainGrid.tsx");
  assert(analyticsGrid.includes("dynamic("), "RetentionChart dynamic");
  assert(analyticsGrid.includes("RetentionChart"), "RetentionChart import");

  const insights = read("components/analytics/InsightsFeed.tsx");
  assert(insights.includes("Promise.all"), "InsightsFeed Promise.all");

  const appShell = read("components/shell/AppShell.tsx");
  assert(appShell.includes("initial={false}"), "AppShell initial={false}");

  const analyticsShell = read("components/analytics/AnalyticsShell.tsx");
  assert(
    analyticsShell.includes("initial={false}"),
    "AnalyticsShell initial={false}",
  );

  assert(ws.includes("initial={false}"), "StudioModuleWorkspace initial={false}");

  console.log("SMOKE_C63_OK");
}

/** C-64 — stack 9/16 + slides + L/R + razbor + scrollbar */
function assertC64(): void {
  const ws = read("components/studio/StudioModuleWorkspace.tsx");
  assert(
    /feedLayout\s*=\s*"stack"/.test(ws) || ws.includes('layout={feedLayout}'),
    "workspace stack layout",
  );
  assert(ws.includes('"9/16"'), "carousel-engine aspect 9/16");
  assert(
    /isCarouselEngine[\s\S]*?"9\/16"/.test(ws) ||
      ws.includes('isCarouselEngine\n    ? "9/16"') ||
      ws.includes('isCarouselEngine ?\n    ? "9/16"') ||
      /feedAspect[\s\S]*isCarouselEngine[\s\S]*"9\/16"/.test(ws),
    "carousel-engine maps to 9/16",
  );

  const feed = getFeedForModule("carousel-engine");
  const withSlides = [...feed.ours, ...feed.competitors].filter(
    (p) => (p.slideUrls?.length ?? 0) >= 3,
  );
  assert(withSlides.length >= 6, "carousel fixtures: many posts with slideUrls≥3");
  for (const p of feed.ours.slice(0, 5)) {
    assert(
      (p.slideUrls?.length ?? 0) >= 3,
      `ours ${p.id} slideUrls length ≥3`,
    );
  }

  const card = read("components/studio/workspace/FeedPostCard.tsx");
  assert(card.includes('data-testid="feed-slide-prev"'), "feed-slide-prev");
  assert(card.includes('data-testid="feed-slide-next"'), "feed-slide-next");
  assert(card.includes('data-testid="razbor-btn"'), "razbor-btn");
  assert(
    card.includes("py-2.5") && card.includes("text-sm font-semibold"),
    "razbor-btn large (py-2.5 text-sm font-semibold)",
  );

  const carousel = read("components/studio/workspace/VerticalPostCarousel.tsx");
  assert(
    carousel.includes("[scrollbar-width:thin]"),
    "VerticalPostCarousel styled scrollbar",
  );
  assert(
    carousel.includes("scrollbar-color"),
    "VerticalPostCarousel scrollbar-color",
  );

  console.log("SMOKE_C64_OK");
}

/** C-65 — CreateCarouselModal + CTA + hide description */
function assertC65(): void {
  assertExists("components/studio/workspace/CreateCarouselModal.tsx");
  const modal = read("components/studio/workspace/CreateCarouselModal.tsx");
  assert(
    modal.includes('data-testid="create-carousel-modal"'),
    "create-carousel-modal testid",
  );

  const ws = read("components/studio/StudioModuleWorkspace.tsx");
  assert(ws.includes('data-testid="create-carousel-btn"'), "create-carousel-btn");
  assert(
    ws.includes("!isCarouselEngine") && ws.includes("mod.description"),
    "description gated behind !isCarouselEngine",
  );
  assert(
    /isCarouselEngine \? \(?\s*<GlowButton[\s\S]*create-carousel-btn/.test(ws),
    "create-carousel-btn only on carousel-engine branch",
  );

  console.log("SMOKE_C65_OK");
}

/** C-66 — Команда выпуска + panel + seed fields */
function assertC66(): void {
  const nav = read("components/shell/SidebarNavigation.tsx");
  assert(nav.includes("Команда выпуска"), "nav label Команда выпуска");

  const topBar = read("components/mesh/CanvasTopBar.tsx");
  assert(topBar.includes("Команда выпуска"), "CanvasTopBar title");

  const meshPage = read("app/admin/mesh/page.tsx");
  assert(meshPage.includes("Команда выпуска"), "mesh page title");

  const chromeFiles = [
    "components/mesh/CanvasTopBar.tsx",
    "components/mesh/AgentMeshCanvas.tsx",
    "app/admin/mesh/page.tsx",
  ];
  for (const rel of chromeFiles) {
    const src = read(rel);
    assert(
      !src.includes("Только владелец"),
      `${rel}: no // Только владелец chrome`,
    );
    assert(!src.includes("Сетка агентов"), `${rel}: no Сетка агентов chrome`);
  }

  assertExists("components/mesh/AgentPropertiesPanel.tsx");
  const panel = read("components/mesh/AgentPropertiesPanel.tsx");
  assert(panel.includes("agent.description"), "panel description");
  assert(panel.includes("agent.skills"), "panel skills");
  assert(panel.includes("agent.completedJobs"), "panel completedJobs");

  const canvas = read("components/mesh/AgentMeshCanvas.tsx");
  assert(canvas.includes("AgentPropertiesPanel"), "canvas wires panel");

  const seed = createMeshSeed("carousel-engine");
  const agents = seed.nodes.filter((n) => n.type === "agent");
  assert(agents.length >= 1, "mesh seed has agents");
  for (const n of agents) {
    const d = n.data as {
      description?: string;
      skills?: string[];
      completedJobs?: number;
    };
    assert(
      typeof d.description === "string" && d.description.length > 0,
      `agent ${n.id} description`,
    );
    assert(Array.isArray(d.skills) && d.skills.length > 0, `agent ${n.id} skills`);
    assert(
      typeof d.completedJobs === "number",
      `agent ${n.id} completedJobs`,
    );
  }

  console.log("SMOKE_C66_OK");
}

/** C-67 — schedule rail collapsed + calendar month nav + wrap */
function assertC67(): void {
  const rail = read("components/schedule/ScheduleModuleRail.tsx");
  assert(rail.includes("defaultOpen={false}"), "rail defaultOpen false");
  assert(
    rail.includes("whitespace-normal") &&
      rail.includes("break-words") &&
      rail.includes("text-wrap"),
    "rail wrap classes",
  );

  const cal = read("components/schedule/ScheduleCalendar.tsx");
  assert(!cal.includes("stripDays"), "no stripDays in ScheduleCalendar");
  assert(
    cal.includes('testId="schedule-month-prev"') ||
      cal.includes('data-testid="schedule-month-prev"'),
    "month prev beside title",
  );
  assert(
    cal.includes('testId="schedule-month-next"') ||
      cal.includes('data-testid="schedule-month-next"'),
    "month next beside title",
  );
  assert(cal.includes("monthLabel"), "monthLabel in calendar header");

  console.log("SMOKE_C67_OK");
}

async function optionalHttp(): Promise<void> {
  try {
    const res = await fetch(`${BASE}/studio`, {
      signal: AbortSignal.timeout(4000),
    });
    console.log(`HTTP_STUDIO_${res.status}`);
  } catch {
    console.log("HTTP_STUDIO_SKIP (server not up)");
  }
}

async function main(): Promise<void> {
  assertC63();
  assertC64();
  assertC65();
  assertC66();
  assertC67();
  await optionalHttp();
  console.log("SMOKE_C63_C67_ALL_OK");
}

main().catch((e) => {
  console.error(String(e?.message ?? e));
  process.exit(1);
});
