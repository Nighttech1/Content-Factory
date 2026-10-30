# Architect spec — C-76

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Studio Launchpad (`/studio`): в «Каналы рендера» добавить плитки **«Статьи на сайт»** и **«Статьи в TG»**; убрать dual-copy «Выберите модуль…»; оставить **ровно одну** человеческую RU-описательную часть.

## Depends

- Wave `memory/waves/W-2026-10-08-ux-wave4a.md` — **UX-4a**, тикет 1/3.
- Trainer grade A: `memory/trainer/2026-10-08-ux-wave4-grade.md`.
- Skills: `content-factory-ui` § Launchpad channels+copy, `content-module-sdk` § Studio product tiles, `client-scenarios` **S23**.
- Wave3 leftover «publisher E2E» **не** этот ID (см. C-78 guards / P2).

## In scope

### 1. Новые каналы в сетке

| moduleId (канон) | RU title | outputFormat | Тип |
|------------------|----------|--------------|-----|
| `site-articles` | Статьи на сайт | `single_image` | **CORE** manifest |
| `tg-articles` | Статьи в TG | `single_image` | **CORE** manifest |

- Добавить `src/modules/site-articles/manifest.ts` + `src/modules/tg-articles/manifest.ts`.
- Зарегистрировать в `src/modules/manifests.ts` → `listManifests()` (сетка читает через `components/studio/modules.ts`).
- RU `description` (1–2 предложения, вмещаются в карточку без агрессивного `line-clamp`).
- Badge polish в `BADGE_BY_CANONICAL_ID` (`modules.ts`): напр. `Сайт` / `TG`.
- Workspace route `/studio/{id}` уже через `[moduleId]` — stub feed/empty OK; **не** писать live-воркеры в этой волне.
- Если есть `CanonicalModuleId` / id-map — расширить union под оба id.

### 2. Одна описательная часть + ban copy

| Файл | Действие |
|------|----------|
| `components/studio/StudioPageClient.tsx` | Оставить **один** RU абзац под «Студия» (человеческий смысл студии/каналов). **Удалить** «Выберите модуль — откроется рабочая страница канала.» |
| `components/studio/ModuleSelectorGrid.tsx` | Под «Каналы рендера» **убрать** `<p>Выберите модуль — откроется страница канала</p>` целиком. Заголовок секции «Каналы рендера» остаётся. |

Запрет: два supporting sentence подряд; EN «Target Render Channels» / «Studio Launchpad».

## Out of scope

- CompactMultiButton / Разборщик (C-77)
- Schedule sticky / DnD / publisher sync / footer help (C-78)
- Platforms CRUD (C-79)
- Реальные воркеры статей / CMS publish
- VPS / prod

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Manifests + Launchpad copy + grid | **Frontend** | `21st-ui-catalog` optional для tile polish |
| Motion | — | stagger сетки уже есть — не ломать |
| Backend / AI Bridge | — | **не звать** (stub CORE only) |

## Path ownership (this ticket)

```
components/studio/StudioPageClient.tsx
components/studio/ModuleSelectorGrid.tsx
components/studio/modules.ts
src/modules/manifests.ts
src/modules/site-articles/manifest.ts          # new
src/modules/tg-articles/manifest.ts            # new
src/modules/id-map.ts (или эквивалент CanonicalModuleId)  # если есть union
app/studio/page.tsx                            # only if wiring required
```

**Не трогать:** `FloatingCommandBar`, Razbor/Create modals, `ScheduleCalendar*`, Settings, Analytics, Mesh.

## Contracts

```
CORE ids: site-articles, tg-articles
Titles RU: «Статьи на сайт», «Статьи в TG»
Zero occurrences: «Выберите модуль» (Launchpad / ModuleSelectorGrid / StudioPageClient)
Exactly one descriptive paragraph on /studio (under «Студия»)
Section title: «Каналы рендера»
```

## Acceptance criteria (язык Клиента)

Сценарий **S23**:

1. Открыл `/studio` — в «Каналы рендера» видны плитки **«Статьи на сайт»** и **«Статьи в TG»**.
2. Нет текста «Выберите модуль…» / «откроется… страница канала».
3. Есть ровно одна описательная часть + сетка. Screenshot.

## Risks

- Grid `xl:grid-cols-5` при 6+ плитках — допустим wrap на новый ряд; не ломать `min-h` 252px (C-47).
- Не класть ids в `custom-*` storage — канон CORE, иначе hydrate/custom cleanup их сотрёт.

## Mid-flight escalation

- Нужен отдельный `outputFormat` для статей — стоп, обновить spec (не выдумывать enum вне `types/module.ts`).
