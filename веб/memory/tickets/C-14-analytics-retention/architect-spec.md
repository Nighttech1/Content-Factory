# Architect spec — C-14

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Заполнить **Retention Curves** bay на `/analytics` (DEV_PLAN **5.2**): интерактивный multi-line chart HeyGen vs Cartoon vs Carousel на моках из `lib/analytics-mock.ts`. Зависит от shell C-13.

## In scope

- Заменить stub body в `components/analytics/RetentionChart.tsx` (файл уже создан C-13):
  - Glass / surface bay: title **Multi-Modal Audience Retention Curve**, subtitle first-60s drop-off.
  - Legend (HeyGen terracotta / Carousel gold / Motion Toon blue) — toggle series via store `setSeriesVisible` **или** local state if store omitted; prefer store if C-13 shipped it.
  - Chart: **recharts** `LineChart` / `Line` / `XAxis` / `YAxis` / `Tooltip` / `ResponsiveContainer` / `CartesianGrid` (subtle).
  - X domain: 0–60s with labels at 0 / 3 / 12 / 30 / 45 / 60 (Stitch markers).
  - Y domain: 0–100% retention.
  - Hover tooltip: series name + `%` at `tSec`.
  - Optional annotation chips (3s Hook Gate / 12s spike / Slide 8) — decorative overlays OK; не блокируют приёмку.
  - Optional diagnostic mini-stats row under chart (HeyGen baseline / carousel slides / drop-off) — read from mock footnotes or hardcode from Stitch numbers.
- Добавить зависимость **`recharts`** в `package.json` + lockfile.
- Consume only: `lib/analytics-mock.ts`, `lib/analytics-store.ts` — **не редактировать**.
- Motion: chart bay fade/slide-in; respect `useReducedMotion` (skip draw animation if reduced).
- Skills: `content-factory-ui`, `luxury-web-craft`; Motion: `web-motion-engine`.
- Colors: map series to Dark Luxury tokens (`--accent-terracotta`, `--accent-gold`, `--accent-blue`), not raw Stitch hex unless token-equivalent.

## Out of scope

- KPI cards / header / page shell → **C-13** (не трогать).
- Insights feed / published table → **C-15**.
- Live PostAnalytics / cron / external APIs.
- New chart libraries besides recharts (no Chart.js / Victory / Nivo this wave).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| RetentionChart + recharts dep | Frontend | only owned paths |
| Chart entrance / legend micro | Motion | RetentionChart (+ minor shell if needed — prefer chart-only) |
| QA | Tester → Fixer | 3 series visible; tooltip on hover; legend; anti-slop |
| Localhost | Deployer | `/analytics` |
| Приёмка | Client | retention chart interactive |

## Contracts

### Data

Use `AnalyticsSnapshot.retention: RetentionSeries[]` from mock (shape fixed in C-13 spec).

### recharts styling

- Transparent / token-colored strokes; strokeWidth ~2–3.
- Tooltip: dark glass panel (`bg-[var(--bg-card)]`, border glass) — no default white flash.
- Grid: low opacity dashed.
- Responsive: `h-72 sm:h-80` chart area (Stitch).

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `components/analytics/RetentionChart.tsx` | `app/analytics/**`, KPI/*, InsightsFeed, PublishedPostsTable |
| `package.json`, lockfile (+recharts) | `lib/analytics-mock.ts`, `lib/analytics-store.ts` |
| optional `components/analytics/retention-*.tsx` helpers | |

## Acceptance criteria (язык Клиента)

1. На `/analytics` вместо stub «C-14» виден график удержания с **тремя** линиями (HeyGen / Carousel / Cartoon).
2. Легенда читаема; hover показывает tooltip с %.
3. Layout bay ~2/3 ширины на xl; insights stub/справа не ломается.
4. Нет crash при отсутствии одной series visibility toggle.

## Risks

- recharts + React 19: pin compatible version; smoke import in client component (`"use client"`).
- SSR: chart only in client child (page may stay server; shell already client from C-13).
- Over-annotating chart — keep annotations optional if clutter.

## Mid-flight escalation

Если recharts несовместим с React 19 / Next 15: **стоп** → Architect (fallback: lightweight SVG paths from mock, still interactive tooltip via CSS). Не молча менять lib.
