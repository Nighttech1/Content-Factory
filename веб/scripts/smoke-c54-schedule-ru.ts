/**
 * C-54: /schedule calendar rail + cf.schedule.v1 + RU chrome.
 * Run: npx tsx scripts/smoke-c54-schedule-ru.ts
 * Optional: BASE_URL=http://127.0.0.1:3000
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  parseScheduleFile,
  SCHEDULE_STORAGE_KEY,
  upsertSlot,
} from "../lib/schedule/storage";

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

function assertScheduleUi(): void {
  assert(SCHEDULE_STORAGE_KEY === "cf.schedule.v1", "storage key");
  const shell = read("components/schedule/ScheduleShell.tsx");
  assert(shell.includes('data-testid="schedule-page"'), "schedule-page");
  const cal = read("components/schedule/ScheduleCalendar.tsx");
  assert(cal.includes('data-testid="schedule-calendar"'), "schedule-calendar");
  const rail = read("components/schedule/ScheduleModuleRail.tsx");
  assert(rail.includes('data-testid="schedule-module-rail"'), "module rail");
  assert(rail.includes('data-testid="schedule-ready-post"'), "ready post");
  assert(rail.includes('data-testid="schedule-slot-label"'), "slot label");

  const page = read("app/schedule/page.tsx");
  assert(page.includes("ScheduleShell"), "page uses shell");
  assert(!/Publishing calendar placeholder/i.test(page), "no EN placeholder");
  assert(!/placeholder/i.test(shell) || !/english/i.test(shell), "no EN placeholder shell");

  const corrupt = parseScheduleFile({ version: 9, slots: "nope" });
  assert(corrupt.version === 1 && corrupt.slots.length === 0, "corrupt → empty");
  const junk = parseScheduleFile("not-json-object");
  assert(junk.slots.length === 0, "non-object → empty");
  const next = upsertSlot(
    { version: 1, slots: [] },
    {
      postId: "ours-ag-01",
      moduleId: "aesthetic-graphics",
      startsAt: "2026-10-06T12:00:00.000Z",
    },
  );
  assert(next.slots.length === 1, "upsert writes slot");
  console.log("SMOKE_C54_SCHEDULE_OK");
}

function assertRuChrome(): void {
  const nav = read("components/shell/SidebarNavigation.tsx");
  assert(nav.includes('label: "Команда выпуска"'), "sidebar Команда выпуска");
  assert(nav.includes('label: "Расписание"'), "sidebar Расписание");
  assert(nav.includes("<span>Студия</span>"), "sidebar Студия");
  assert(!nav.includes("Studio Launchpad"), "no Launchpad in nav");
  assert(!/label:\s*"Canvas"/.test(nav), "no Canvas nav label");
  assert(!/label:\s*"Schedule"/.test(nav), "no Schedule nav label");

  const studio = read("app/studio/page.tsx");
  assert(studio.includes("Студия"), "studio h1 RU");
  assert(!studio.includes("Studio Launchpad"), "C-46 EN superseded");

  const grid = read("components/studio/ModuleSelectorGrid.tsx");
  assert(grid.includes("Каналы рендера"), "render channels RU");
  assert(!grid.includes("Target Render Channels"), "no EN channels");

  const settings = read("app/settings/page.tsx");
  assert(settings.includes("Настройки"), "settings RU");

  const mesh = read("app/admin/mesh/page.tsx");
  assert(!mesh.includes("Agent Mesh Canvas"), "mesh sr-only not EN leftover");
  assert(
    mesh.includes("Команда выпуска") || mesh.includes("Студию"),
    "mesh RU",
  );

  const topbar = read("components/mesh/CanvasTopBar.tsx");
  assert(topbar.includes("Активные задачи"), "topbar jobs RU");
  assert(topbar.includes("Добавить модуль пайплайна"), "add module RU");
  assert(!topbar.includes("Active Jobs"), "no Active Jobs");

  const analytics = read("components/analytics/AnalyticsHeader.tsx");
  assert(
    analytics.includes("Самообучающаяся диагностика"),
    "analytics title RU",
  );
  assert(!analytics.includes("Self-Learning"), "no EN analytics title");

  const seed = read("lib/mesh-seed.ts");
  assert(seed.includes('label: "Исследователь"'), "mesh researcher RU");
  assert(seed.includes('label: "Автор хуков"'), "mesh hook RU");
  assert(seed.includes('label: "Очередь задач"'), "mesh queue RU");
  assert(seed.includes('label: "Шлюз согласования"'), "mesh hitl RU");
  assert(seed.includes('label: "Издатель"'), "mesh publisher RU");
  assert(seed.includes('label: "Аналитик"'), "mesh analyst RU");
  assert(!seed.includes("The Researcher"), "no EN Researcher");
  assert(!seed.includes("BullMQ Queue"), "no EN BullMQ Queue");
  assert(!seed.includes("HITL Gate"), "no EN HITL Gate");
  assert(!seed.includes("The Carousel Designer"), "no EN designer labels");

  const workspace = read("components/studio/StudioModuleWorkspace.tsx");
  assert(workspace.includes('title="Наши"'), "workspace Ours RU");
  assert(workspace.includes('title="Конкуренты"'), "workspace Competitors RU");

  const approve = read("components/inspect/ApproveScheduleModal.tsx");
  assert(approve.includes("«Запланировано»"), "approve Scheduled RU");
  assert(!approve.includes("«Scheduled»"), "no EN Scheduled copy");

  console.log("SMOKE_C54_RU_CHROME_OK");
}

async function optionalHttp(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const schedule = await fetch(`${BASE}/schedule`, { signal: ctrl.signal });
    clearTimeout(t);
    assert(schedule.ok, `/schedule ${schedule.status}`);
    const html = await schedule.text();
    assert(html.includes("Расписание") || html.includes("schedule-page"), "RU schedule");
    assert(!/Publishing calendar/i.test(html), "no EN placeholder live");

    const studio = await fetch(`${BASE}/studio`);
    assert(studio.ok, `/studio ${studio.status}`);
    const studioHtml = await studio.text();
    assert(!studioHtml.includes("Studio Launchpad"), "live no Launchpad");
    assert(!studioHtml.includes("Target Render Channels"), "live no Target Render");

    console.log("SMOKE_C54_HTTP_OK");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`SMOKE_C54_HTTP_SKIP (${msg})`);
  }
}

async function main(): Promise<void> {
  assertScheduleUi();
  assertRuChrome();
  await optionalHttp();
  console.log("SMOKE_C54_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
