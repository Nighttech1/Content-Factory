# Architect spec — C-46

> Заполняет **Архитектор** до любого кода. Mid-flight смена → обновить этот файл + `chain.md`.

## Goal

Убрать флуд-статус шапки Studio Launchpad (`/studio`): SPEED PROTOCOL, армянское приветствие в header, Engine Standby / Mock pipeline. Оставить чистый заголовок + одно короткое пояснение про выбор модуля.

## In scope

- Правка **только** `app/studio/page.tsx` (header-блок ~строки 8–38).
- Удалить:
  - `// SPEED PROTOCOL ACTIVE`
  - строку `Բարև — Vernatun Content Factory` (`lang="hy"`) из шапки
  - правый бейдж `Engine: Standby` + `Mock pipeline · no SSE` (весь glass-chip с ping-точкой)
- Оставить:
  - `h1`: **Studio Launchpad**
  - одно supporting sentence (RU): выбор модуля / переход в workspace — можно слегка укоротить существующий текст «Выберите модуль…», без mock/SSE-шума

## Out of scope

- `ModuleSelectorGrid.tsx`, карточки, min-h → **C-47**
- `custom-modules.json`, hydrate, CORE manifests → **C-45**
- Motion / Backend / AI Bridge / SSE / Prisma / registry Node
- Shell sidebar / brand chrome вне `page.tsx`

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Header chrome | Frontend | только `app/studio/page.tsx` |
| Motion | — | не нужен |
| Backend | — | нет |
| QA | Tester → Fixer | текст-отсутствие флуда на `/studio` |
| Localhost | Deployer | `:3000/studio` |
| Приёмка | Client | чистая шапка |

## Contracts

### UI (язык Клиента)

| Было (запрещено оставить) | Стало |
|---------------------------|--------|
| `// SPEED PROTOCOL ACTIVE` | нет |
| `Բարև — Vernatun Content Factory` в header | нет |
| `Engine: Standby` / `Mock pipeline · no SSE` | нет |
| Studio Launchpad + пояснение | да |

Skills: `content-factory-ui` § Launchpad chrome; `baseline-ui` без новых кирпичей 21st.

### Path lock

- Frontend: **`app/studio/page.tsx` only**
- Не трогать `ModuleSelectorGrid`, `modules.ts`, JSON, storage

### Wave order

**C-46 → C-47 → C-45** (этот тикет первый). Paths не overlapping с C-47/C-45 — один Frontend-агент может идти sequential.

## Acceptance criteria (язык Клиента)

1. На `/studio` в шапке виден заголовок Studio Launchpad и короткое полезное пояснение.
2. Нет строк SPEED PROTOCOL / Բարև / Engine Standby / Mock pipeline.
3. Сетка модулей на странице по-прежнему рендерится (регрессия: `ModuleSelectorGrid` не сломан этим diff).

## Risks / dual-write

- Нет. Только визуальный cleanup одного файла.

## Skills / refs

- `.cursor/skills/content-factory-ui/SKILL.md` — Launchpad chrome
- Trainer grade: `memory/trainer/2026-10-05-studio-modules-cleanup-grade.md`
- Wave: `memory/waves/W-2026-10-05-studio-tiles-cleanup.md`
