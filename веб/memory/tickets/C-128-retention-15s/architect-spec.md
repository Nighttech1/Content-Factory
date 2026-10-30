# Architect spec — C-128 (Retention %@15s fraction)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Path lock #5b** — после C-127; не parallel overlap на `AnalyticsShell` / charts.

## Goal

На Retention показать удержание на 15-й секунде **процентом через дробь** `(n/m)`, рядом/в дополнение к метрике на 3с.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Metric** | Callout / badge на карточке Retention: **«на 15-й секунде»** + format **`{pct}% ({retained}/{total})`** (пример `62% (31/50)`). Допустимо `31/50 · 62%`. |
| **D2 Alongside 3s** | Если уже есть callout на **3с** — **сохранить** и добавить **15с** рядом (не заменить 3с молча). Если 3с нет — добавить оба: 3с + 15с из series/mock. |
| **D3 Types** | Расширить `RetentionPoint` и/или dashboard meta: optional `at15: { retained: number; total: number; pct: number }` и `at3?: { … }` на уровне серии «ours» (или `AnalyticsDashboard.retentionSummary`). Mock в `self-learning-mock.ts`. |
| **D4 UI** | `RetentionChart.tsx` — RU label; не EN-only `retention@15`. Читаемо на glass Dark Luxury. |
| **D5 Data** | Mock OK: cohort total = views start; retained@15 = floor(pct * total). Live wire later. |

## In scope

- `components/analytics/RetentionChart.tsx`
- `types/analytics.ts` (+ mock)
- Optionally `AnalyticsMainGrid` wiring if summary lives outside chart

## Out of scope

- Меню модулей / RL HITL (C-127)
- Backend live retention ingest (unless trivial mock field)
- Mesh / Schedule

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI + types | **Frontend** | `content-factory-analytics` § C-128 |
| Backend | optional | types only if shared |

## Acceptance (язык Клиента)

1. На Retention виден **%@15s** с дробью `(n/m)`.
2. Метрика 3с не пропала (если была) / оба callout читаемы.
3. После C-127 menu — проверка внутри выбранного модуля.
4. Playwright snapshot/assert visible text.

## Risks

- Division by zero total → show `—` / `0% (0/0)` ban; use `n/a` if total=0.
- Не дублировать EN subtitle Cross-platform.

## Mid-flight escalation

Стоп → Архитектор → правка schema `at15`.
