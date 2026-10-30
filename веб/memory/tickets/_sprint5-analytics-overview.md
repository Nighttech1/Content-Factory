# Sprint 5 — Analytics UI overview (mocks)

> Shared note for wave `W-2026-09-18-sprint5`. Specs live in C-13 / C-14 / C-15.  
> Backend DEV_PLAN **5.4–5.6** deferred to next wave.

## Route

`/analytics` → `app/analytics/page.tsx`  
URL: `http://127.0.0.1:3000/analytics`  
Shell: existing `AppShell` (layout already wraps children). Sidebar link already present.

## Stitch

`stitch_armenian_club_brandbook/vernatun_content_factory_performance_self_learning_engine/code.html`

## Component tree

```text
app/analytics/page.tsx                         ← C-13 (route only)
└── AnalyticsShell.tsx                         ← C-13
    ├── AnalyticsHeader.tsx                    ← C-13 (ENGINE TELEMETRY / Self-Learning Diagnostics)
    ├── KpiCardsRow.tsx                        ← C-13
    │   └── KpiCard.tsx                        ← C-13 (×4 GlassCard)
    ├── AnalyticsMainGrid.tsx                  ← C-13 (xl: 2+1 layout)
    │   ├── RetentionChart.tsx                 ← stub C-13 → fill C-14 (recharts)
    │   └── InsightsFeed.tsx                   ← stub C-13 → fill C-15
    └── PublishedPostsTable.tsx                ← stub C-13 → light fill C-15 (optional polish)
```

## Data

| File | Owner | Role |
|------|-------|------|
| `lib/analytics-mock.ts` | **C-13** | Full seed: KPIs, retention series, insights, published rows |
| `lib/analytics-store.ts` | **C-13** (optional Zustand) | Light UI state: legend visibility, mock sync label, stub filters; C-14/C-15 **consume only** |

## Path ownership (no FE parallel on same file)

| Ticket | Owns (write) | Must not edit |
|--------|--------------|---------------|
| **C-13** | page, shell, header, KPI tree, main grid shell, mock, store, **stubs** RetentionChart + InsightsFeed + PublishedPostsTable | — |
| **C-14** | `RetentionChart.tsx` (+ helpers under `components/analytics/` if needed), `package.json` / lock — add **recharts** | page, KPI/*, InsightsFeed, PublishedPostsTable, mock/store (consume only) |
| **C-15** | `InsightsFeed.tsx` + optional `PublishedPostsTable.tsx` body | page, KPI/*, RetentionChart, mock/store (consume only) |

## Serial Frontend order

1. **C-13** Frontend → Motion → Tester → Fixer → Deployer → Client  
2. **C-14** Frontend → Motion → …  
3. **C-15** Frontend → Motion → …  

**Запрет:** параллельный FE C-13/C-14/C-15 на overlapping paths.

## Package deps

| Dep | Ticket | Why |
|-----|--------|-----|
| **recharts** | **C-14** | Retention multi-line chart; not in `package.json` today |
| zustand | already present | optional analytics store |
| framer-motion | already present | Motion + GlassCard |

KPI sparklines: **inline SVG** (Stitch-like) — do **not** require recharts in C-13.

## Skills

- Frontend: `content-factory-ui`, `luxury-web-craft`
- Motion: `web-motion-engine`
- Reuse: `GlassCard`, `NeonBadge`, `ReactiveButton`, `AppShell`, Dark Luxury CSS tokens

## Deferred (next wave)

5.4 Cron ingest · 5.5 `PostAnalytics` Prisma · 5.6 Analyst worker — **no** Prisma / BullMQ / Instagram / YouTube in this wave.

## Client acceptance (wave)

- `/analytics` shows KPI row + retention chart + insights feed (after C-13→C-15).
- No horizontal scroll @1440; glass cards not clipped; Armenian glyphs OK if present.
- Mock-only OK; live Analyst not required this wave.
