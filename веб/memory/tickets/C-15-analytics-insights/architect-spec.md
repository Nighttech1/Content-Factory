# Architect spec — C-15

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Заполнить **Analyst insights feed** на `/analytics` (DEV_PLAN **5.3**) + лёгкий stub/fill **published posts table** если место в layout есть (Stitch bottom matrix). Моки из C-13; live LLM Analyst → следующая волна (5.6).

## In scope

- Заменить stub `components/analytics/InsightsFeed.tsx`:
  - Header: `AGENT HEURISTICS` / **Self-Learning Feed** / Loop badge from mock `cycleLabel`.
  - List of insight cards (≥3) from `AnalyticsSnapshot.insights`.
  - Color differentiation by `tone`:
    - green / gold accents → retention wins (NeonBadge `gold` or token secondary)
    - blue → conversion / DM / azure (NeonBadge `blue`)
    - terracotta / primary → cadence / schedule
  - Each card: tone badge, targetLabel, body (RU or EN Stitch-tone, diaspora/Yerevan-friendly), footer with Lucide icon (не Material CDN).
  - Optional footer strip «Model Loss Convergence» — mock constant OK.
- Опционально заполнить `components/analytics/PublishedPostsTable.tsx`:
  - Compact table: asset title, module badge, channels, reach, eng rate, status.
  - Thumbnails: CSS gradient placeholders (no required remote images).
  - Filter/Sort buttons — **visual stub only** (may wire to store filters if present; no backend).
  - Do **not** block ticket on full table polish; insights feed is P0 for C-15 acceptance.
- Consume only mock/store — **не редактировать** `lib/analytics-*`.
- Motion: list stagger / card entrance; `useReducedMotion`.
- Skills: `content-factory-ui`, `luxury-web-craft`; Motion: `web-motion-engine`.
- Reuse: `GlassCard`, `NeonBadge`.

### Insight copy guidance (examples — seed in mock by C-13; C-15 may adjust presentation only)

If mock texts are weak, Frontend may ask Orchestrator to patch mock via **C-13 owner** — C-15 must not edit mock file. Prefer C-13 seed already includes:

- Question/slang hooks → +retention (green/gold)
- Cheat-sheet / carousel format → DM shares (blue)
- Optimal post time MSK (terracotta)

## Out of scope

- Editing KPI / RetentionChart / page shell / package.json.
- Live Analyst worker, LLM prompts, PostAnalytics DB.
- Real Instagram/YouTube metrics.
- Full sortable/filterable data-grid productization.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| InsightsFeed (+ optional table) | Frontend | owned paths only |
| Feed stagger | Motion | InsightsFeed / table rows |
| QA | Tester → Fixer | ≥3 tone-differentiated cards; table optional; anti-slop |
| Localhost | Deployer | `/analytics` |
| Приёмка | Client | insights feed visible; table nice-to-have |

## Contracts

### Insight tone → UI

| `InsightTone` | Visual |
|---------------|--------|
| `green` | NeonBadge gold/secondary-like success chip (no new green token required) |
| `blue` | NeonBadge `blue` |
| `gold` | NeonBadge `gold` |
| `terracotta` | NeonBadge `terracotta` |

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `components/analytics/InsightsFeed.tsx` | RetentionChart, KPI/*, page, header |
| `components/analytics/PublishedPostsTable.tsx` | `lib/analytics-mock.ts`, `lib/analytics-store.ts` |
| optional `components/analytics/InsightCard.tsx` | `package.json` |

## Acceptance criteria (язык Клиента)

1. Справа (или в bay) видна лента **≥3** инсайтов The Analyst с разным цветом бейджей.
2. Тексты читаемы; не «lorem»; тон Vernatun / diaspora OK.
3. Таблица published: если сделана — не даёт H-scroll на 1440; если только stub — **не** Hard REJECT при зелёной ленте.
4. Страница целиком: header + KPI + retention (C-14) + insights = Screen 4 mock complete.

## Risks

- Overlapping edit of mock — escalate to Orchestrator, don’t violate path lock.
- Table images from Stitch remote URLs — prefer gradients to avoid flaky external deps.

## Mid-flight escalation

Нужен live Analyst API → следующая волна (5.6), не патчить backend в C-15.
