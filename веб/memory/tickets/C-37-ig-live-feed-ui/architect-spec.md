# Architect spec — C-37

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Studio UI (`carousel-engine`): колонки **Наши** / **Конкуренты** и модал **Разбор** потребляют **live feed contract** из C-36 — реальные превью, метрики, `slideUrls` для слайдов конкурента; бейдж **live vs demo-mock**; без токена — прежний mock UX без падений.

## Depends

- **C-36** Backend feed API + extended `FeedPost` / `FeedResponse` done (Tester green).
- C-35 agent copy rules available for Razbor Analyst text.
- Existing UI: dual columns, `FeedPostCard`, `RazborModal`, `buildCompetitorSlides` in `razbor-pipeline.ts`.

## In scope

1. **Feed consumer**
   - Workspace fetch of `/api/studio/carousel-engine/feed` types updated to new contract (`sourceMode`, optional `slideUrls`, `permalink`, `username`, etc.).
   - Cards show real `thumbUrl` + metrics when live.
   - Empty competitors (live ours only) → empty state copy, not error.

2. **Source badge**
   - Visible label near dual columns or workspace chrome: e.g. «Instagram · live» vs «Демо · mock» from `FeedResponse.sourceMode` (and/or mixed hint if partial).
   - `data-testid` for Tester: e.g. `feed-source-badge`.

3. **Razbor**
   - `buildCompetitorSlides(post)`: if `post.slideUrls?.length` → use those URLs (ordered); else fallback picsum synthetic (mock path).
   - Analyst pane uses metrics already on `FeedPost` (live numbers when `sourceMode === "live"`); templates from C-35.
   - Do not fetch Graph from browser; server feed only.

4. **Resilience**
   - Feed fetch error → keep last good / fixtures client fallback if already implemented; never blank crash.
   - Broken image URLs → placeholder, card remains.

5. **Motion**
   - Only if existing enter/slide animations break with variable slide counts — surgical; not a redesign.

## Out of scope

- Implementing Graph client in the browser.
- New Prisma models.
- Changing Generate drawer global agent mesh.
- CapCut / other modules live IG.
- Prod/VPS deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Studio workspace + cards + badge + Razbor slides wire | Frontend | skill `content-factory-ui` |
| `buildCompetitorSlides` live branch if not done in C-35/C-36 | Frontend or leftover Backend | Prefer FE calls updated helper; if helper still picsum-only, FE ticket owns switch using `slideUrls` |
| Motion | Motion only if broken | optional last |
| Tester / Fixer / Deployer / Client | as chain | |

## Contracts (UI)

### Badge

| `FeedResponse.sourceMode` | UI |
|---------------------------|-----|
| `live` | Badge live (Armenian/RU copy OK: «Онлайн · Instagram») |
| `mock` | Badge demo («Демо-данные») |

### Slides

```ts
// Pseudocontract — implementation in razbor-pipeline
if (post.slideUrls && post.slideUrls.length > 0) {
  // map to CompetitorCarouselSlide[]; caption from title / «Слайд i»
} else {
  // existing picsum synthetic
}
```

### Card metrics

Bind `post.metrics.likes|views|comments` as today; live zeros are valid (see C-36 D2).

## Acceptance criteria (Client language)

1. С настроенным IG: колонка «Наши» показывает посты `mosarmclub` с живыми превью и цифрами; бейдж live.
2. С конкурентами в env: колонка «Конкуренты» — реальные карусели + метрики.
3. «Разбор»: справа слайды из `slideUrls` (не picsum), слева Analyst с реальными цифрами при live.
4. Без токена: как раньше mock + бейдж demo; нет белого экрана / 500 в UI.
5. Нет токенов в network response bodies consumed by UI (guard).

## Risks

| Risk | Mitigation |
|------|------------|
| CDN media_url expires while modal open | Re-fetch feed or show placeholder; TTL 10 min |
| Mixed live/mock confusing | Badge + optional per-card subtle hint if partial |
| Layout break with long captions | Clamp title; existing card chrome |
| Motion jank with N slides | Motion only if needed; prefer CSS already in C-30 |

## Escalate?

- None for Prisma. If FE needs server-driven Razbor API change — thin adjust only, no schema.
