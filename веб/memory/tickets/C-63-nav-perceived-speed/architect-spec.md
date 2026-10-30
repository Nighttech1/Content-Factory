# Architect spec — C-63

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Смена экранов App Shell воспринимается **≤1s**: сразу skeleton/`loading.tsx` или контент; shell (sidebar) не гаснет; тяжёлые виджеты — `next/dynamic`; Analytics — параллельный fetch.

## Depends

- Wave `memory/waves/W-2026-10-07-ux-carousel-nav.md`.
- **Frontend на `StudioModuleWorkspace`:** только **после C-64 и C-65** (или один Frontend-pass с ownership: C-64→C-65→C-63).
- Trainer grade A: `memory/trainer/2026-10-07-ux-wave-grade.md`.
- Skills: `content-factory-ui` § Nav/route loading, `web-motion-engine` § route enter, `client-scenarios` S15.

## In scope

### 1. Route `loading.tsx`

Добавить (или выровнять) segment loading UI — Dark Luxury skeleton колонки/хрома, **не** full-app blank:

| Route segment | Path |
|---------------|------|
| studio | `app/studio/loading.tsx` |
| schedule | `app/schedule/loading.tsx` |
| analytics | `app/analytics/loading.tsx` |
| brand-kit | `app/brand-kit/loading.tsx` |
| settings | `app/settings/loading.tsx` |
| admin/mesh | `app/admin/mesh/loading.tsx` |

Sidebar/`AppShell` остаются смонтированными (layout выше segment).

### 2. `next/dynamic` heavy clients

| Target | When |
|--------|------|
| `AgentMeshCanvas` | page `/admin/mesh` — dynamic + loading fallback |
| `RetentionChart` / recharts | Analytics shell — dynamic |
| `RazborModal` | load when open (workspace already owned after C-65) — dynamic import / conditional mount |

Не ломать SSR layout shell. `ssr: false` только где уже client-only graph/chart.

### 3. Soften / remove full-page opacity:0

Файлы-кандидаты (grep + fix **route shells**):

- `components/shell/AppShell.tsx` — main content wrapper enter
- `components/studio/StudioModuleWorkspace.tsx` — page-level enter (после C-64/65)
- Mesh page / `AgentMeshCanvas` wrapper enter **если** full-page feel

**Запрет:** `initial={{ opacity: 0 }}` на весь viewport/main при смене маршрута.  
**OK:** короткий fade вложенного блока ≤150ms; skeleton; reduced-motion → без enter fade.

Не трогать modal enter/exit Razbor (C-62) без нужды — только route shells.

### 4. Analytics parallel fetch

Файл: `components/analytics/InsightsFeed.tsx` (и при необходимости hydrate helpers в store).

Сейчас: sequential `fetchAnalyticsInsights` → затем `fetchAnalyticsSnapshot`.  
**Нужно:** `Promise.all([insights, snapshot])` (один abort signal / оба), затем hydrate. Не менять API контракты.

Опционально выровнять `AnalyticsShell` если fetch живёт там — один источник, без двойного waterfall.

## Out of scope

- Carousel 9:16 / CreateCarouselModal → **C-64 / C-65**
- Mesh rename / AgentPropertiesPanel → **C-66**
- Schedule folders/strip → **C-67**
- Backend, Prisma, VPS, plan file

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| loading.tsx + dynamic + Analytics Promise.all + workspace enter (last) | **Frontend** | path lock ниже |
| AppShell / route enter motion soften | **Motion** | после DOM; `web-motion-engine` |
| Backend / AI Bridge | — | **не звать** |

## Path ownership (this ticket)

```
app/studio/loading.tsx
app/schedule/loading.tsx
app/analytics/loading.tsx
app/brand-kit/loading.tsx
app/settings/loading.tsx
app/admin/mesh/loading.tsx
app/admin/mesh/page.tsx          (dynamic AgentMeshCanvas)
components/shell/AppShell.tsx
components/analytics/AnalyticsShell.tsx
components/analytics/InsightsFeed.tsx
components/analytics/RetentionChart.tsx  (dynamic boundary)
components/studio/StudioModuleWorkspace.tsx  # AFTER C-64/C-65 — opacity + RazborModal dynamic only
```

**Не трогать в C-63:** `FeedPostCard`, `VerticalPostCarousel`, `feed-fixtures`, `CreateCarouselModal`, schedule calendar/rail, mesh-seed panel UI (кроме dynamic import page).

## Contracts

```
No full-page / layout-main opacity:0 on route enter
loading.tsx present for listed segments
AgentMeshCanvas, RetentionChart, RazborModal → dynamic / deferred
InsightsFeed: insights + snapshot via Promise.all
Perceived nav ≤1s (S15) with shell visible
```

## Acceptance criteria (язык Клиента)

1. Студия → Расписание → Команда выпуска/Холст → назад: нет «экран погас» >1s; sidebar на месте (S15).
2. На переходах виден skeleton сегмента или контент, не чёрный blank.
3. Analytics: insights и snapshot не ждут друг друга по очереди (сеть параллельна).
4. Mesh / chart / Razbor не блокируют первый paint всего App Shell.

## Risks

- Overlap `StudioModuleWorkspace` с C-64/C-65 → **строго после** или один Frontend pass.
- Dynamic Razbor ломает testids open — mount on open must keep `razbor-*` after open.
- C-66 также трогает mesh page — C-63 только dynamic wrapper; panel UI = C-66. Если одновременно: C-63 dynamic first или один агент на `app/admin/mesh/page.tsx`.

## Mid-flight escalation

- Нужен React Server Components prefetch strategy beyond loading.tsx — обновить spec, не плодить Backend.
- Prefetch MenuVertical links — OK в Frontend без нового тикета если безопасно.
