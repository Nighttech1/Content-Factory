# Architect spec — C-13

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Поднять **UI-каркас** Performance Analytics на `/analytics` (DEV_PLAN **5.1** / ARCHITECTURE Screen 4): header Self-Learning Diagnostics + **4 glass KPI cards** на моках. Фундамент волны Sprint 5 UI. График → **C-14**; Insights + published table → **C-15**. Backend 5.4–5.6 — **out of scope**.

## In scope

- Заменить placeholder `app/analytics/page.tsx`: монтировать `AnalyticsShell` (client composition под существующий `AppShell`).
- Создать `components/analytics/`:
  - `AnalyticsShell.tsx` — вертикальный stack: header → KPI row → main grid → table stub.
  - `AnalyticsHeader.tsx` — Stitch: `ENGINE TELEMETRY · CYCLE #42`, title **Self-Learning Diagnostics**, short blurb (Yerevan/diaspora), mock Sync chip, CTA «Trigger Heuristic Re-weight» (mock-only; может дергать store action без API).
  - `KpiCardsRow.tsx` + `KpiCard.tsx` — grid `1 / 2 / 4` cols; **GlassCard** + **NeonBadge** deltas.
  - `AnalyticsMainGrid.tsx` — `xl:grid-cols-3`: left `col-span-2` stub chart, right `col-span-1` stub feed.
  - Stubs (минимальный GlassCard + mono label):
    - `RetentionChart.tsx` — «Retention chart — C-14»
    - `InsightsFeed.tsx` — «Insights feed — C-15»
    - `PublishedPostsTable.tsx` — «Published posts — C-15»
- Создать `lib/analytics-mock.ts` — **полный** seed для волны (KPI + retention series + insights + published rows), чтобы C-14/C-15 только consume.
- Опционально `lib/analytics-store.ts` (Zustand уже в проекте): UI-only actions заранее:
  - `setSeriesVisible(seriesId, visible)` — для legend C-14
  - `touchSync()` / `lastSyncedLabel` — mock Sync
  - `triggerReweight()` — mock CTA (toast/state flip OK, no API)
  - stub filters for table if needed later
- KPI sparklines: **inline SVG** (как Stitch), без chart-lib.
- Motion: entrance stagger KPI cards; spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion`.
- Skills: `content-factory-ui`, `luxury-web-craft`; Motion: `web-motion-engine`.
- Tokens: Dark Luxury CSS vars (`--bg-card`, `--accent-terracotta`, `--accent-gold`, `--accent-blue`, mono). Не копировать Tailwind CDN Stitch-палитру вслепую — маппить на существующие токены.

### Four KPIs (Stitch ↔ DEV_PLAN 5.1)

| # | Label (UI) | Value (mock) | Delta / badge |
|---|------------|--------------|---------------|
| 1 | Total Aggregated Views (reach/views) | `1.2M` | `+34.8%` L30D |
| 2 | Saves / Bookmark Rate | `8.4%` | vs benchmark `2.1%` |
| 3 | Conversion Yield (new followers) | `+1,420` | `+18.2% MoM` |
| 4 | Agent Engine Health (AI efficiency) | `99.2%` | Stable Mesh / latency label |

Copy может быть RU или EN в Stitch tone; армянские глифы — через `--font-hy` если появляются в тексте.

## Out of scope

- Interactive retention chart / recharts → **C-14**.
- Insights feed body / published table polish → **C-15**.
- Prisma `PostAnalytics`, BullMQ cron, Instagram/YouTube APIs, Analyst LLM worker (5.4–5.6).
- Изменение `AppShell` / Sidebar / RBAC.
- Inspector / Mesh / Studio.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Route + shell + KPI + mock/store + stubs | Frontend | paths в `chain.md` |
| Soft entrance / KPI stagger | Motion | analytics components only |
| API | — | нет |
| QA | Tester → Fixer | `/analytics` 200; 4 KPI visible; stubs present; anti-slop |
| Localhost | Deployer | `:3000/analytics` |
| Приёмка | Client | KPI row vs Stitch; full Screen 4 after C-14/C-15 |

## Contracts

### Mock shape (`AnalyticsSnapshot`)

```ts
type KpiId = "views" | "save_rate" | "followers" | "ai_efficiency";

type KpiCard = {
  id: KpiId;
  label: string;
  value: string;           // display string e.g. "1.2M", "8.4%"
  deltaLabel?: string;     // "+34.8%"
  deltaTone?: "up" | "down" | "neutral";
  badge?: string;          // "L30D", "Stable Mesh"
  footnote?: string;
  sparkline?: number[];    // 0..1 normalized for SVG
  accent?: "terracotta" | "gold" | "blue" | "primary";
};

type RetentionSeriesId = "heygen" | "carousel" | "cartoon";

type RetentionPoint = {
  tSec: number;            // 0..60
  retentionPct: number;    // 0..100
};

type RetentionSeries = {
  id: RetentionSeriesId;
  label: string;           // HeyGen Reel / Editorial Carousel / Motion Toon
  colorToken: "terracotta" | "gold" | "blue";
  points: RetentionPoint[];
};

type InsightTone = "green" | "blue" | "gold" | "terracotta";
// Map to NeonBadge: green→gold or custom CSS; blue→blue; gold→gold; terracotta→terracotta

type AnalystInsight = {
  id: string;
  tone: InsightTone;
  badge: string;           // "+42% RETENTION"
  targetLabel: string;     // "Applied to Hook Writer"
  body: string;            // RU/EN Stitch-tone; diaspora-friendly
  footer: string;
};

type PublishedPostRow = {
  id: string;
  title: string;
  subtitle: string;
  module: "heygen" | "carousel" | "infographic" | "cartoon";
  channels: string[];
  reachLabel: string;
  engRateLabel: string;
  status: "live" | "optimizing" | "archived";
};

type AnalyticsSnapshot = {
  cycleLabel: string;      // "CYCLE #42"
  versionLabel: string;    // "v2.4-weights.active"
  lastSyncedAgo: string;   // "32s ago"
  kpis: KpiCard[];         // length 4
  retention: RetentionSeries[];
  insights: AnalystInsight[];
  published: PublishedPostRow[];
};
```

Seed: ≥3 retention series × points at 0/3/12/30/45/60s; ≥3 insights; ≥3 published rows (gradient thumbs OK — no external image deps required).

### UI layout

1. Header (title + sync + mock CTA).
2. KPI row `grid-cols-1 sm:2 xl:4`.
3. Main: `xl:grid-cols-3` — chart bay 2 cols, insights 1 col (stubs until C-14/C-15).
4. Full-width published table stub below.

### Wave order

1. **Frontend C-13** первым (обязательно).
2. Motion → Tester → Fixer → Deployer → Client для C-13.
3. Затем **C-14** → **C-15** (serial FE).

**Запрет:** параллельный FE C-13/C-14/C-15 на одних файлах.

## Acceptance criteria (язык Клиента)

1. Открывается `http://127.0.0.1:3000/analytics` — не placeholder «Sprint 5 placeholder», виден заголовок Self-Learning / Analytics diagnostics.
2. Видны **4** glass KPI-карточки с числами и delta/badge.
3. Под KPI — две заглушки (график + лента) и опционально таблица-stub — layout не ломается, нет горизонтального скролла @1440.
4. Dark Luxury: glass + tokens; без purple-slop / cream-serif.

## Risks

- Перегрузка `page.tsx` логикой — держать page тонким, shell client.
- Stub heights должны резервировать место под C-14 chart (~h-72+) чтобы layout не прыгал.
- Не добавлять `recharts` в C-13 (владелец dep — C-14).

## Mid-flight escalation

Если нужен live API / Prisma / отказ от mock-first: **стоп** → Оркестратор → Архитектор.
