# Architect spec — C-47

> Заполняет **Архитектор** до любого кода. Mid-flight смена → обновить этот файл + `chain.md`.

## Goal

Увеличить высоту карточек модулей Studio ×1.5 (`168 → 252`) и показать **весь** текст description (CORE + будущие product custom) без агрессивной обрезки `line-clamp-2`.

## In scope

- Правка **`components/studio/ModuleSelectorGrid.tsx`**:
  - Карточки модулей: `min-h-[168px]` → **`min-h-[252px]`**
  - Dashed Add-слот: тот же floor **`min-h-[252px]`** (сейчас тоже 168)
  - Description: убрать/ослабить `line-clamp-2`; использовать `text-pretty` + подобрать `text-sm` → `text-xs` / `leading-snug` так, чтобы **полный** product copy (включая длинные RU descriptions C-45) влезал в карточку без `…`
- Не менять логику `mergeStudioModules` / hydrate / store — только визуальный fit copy.

## Out of scope

- Header `/studio` → **C-46**
- Замена QA-плагинов / JSON → **C-45**
- Новые CORE adapters, Motion redesign, GlassCard API (трогать GlassCard только если без этого нельзя выровнять padding — предпочтительно только grid)
- Backend

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Card layout + typography | Frontend | `ModuleSelectorGrid.tsx` |
| Motion | — | не нужен (существующий hover оставить) |
| Backend | — | нет |
| QA | Tester → Fixer | min-h ≥252; description без обрезки на CORE tiles |
| Localhost | Deployer | `:3000/studio` |
| Приёмка | Client | высота + полный текст |

## Contracts

### CSS / Tailwind

| Элемент | Было | Стало |
|---------|------|-------|
| Module card `min-h` | `168px` | **`252px`** |
| Add dashed slot `min-h` | `168px` | **`252px`** |
| Description | `line-clamp-2 text-sm` | полный текст: `text-pretty` + размер/`leading` без агрессивного clamp-1/2 |

Skills: `content-factory-ui` § ModuleSelectorGrid 252px; при конфликте с baseline line-clamp — побеждает fit-copy из content-factory-ui.

### Path lock

- Frontend: **`components/studio/ModuleSelectorGrid.tsx` only** (предпочтительно)
- Не трогать `app/studio/page.tsx`, `custom-modules.json`, `manifests.ts`

### Wave order

После **C-46**. Перед **C-45** — чтобы при приёмке product descriptions C-45 уже влезали в увеличенные карточки.

## Acceptance criteria (язык Клиента)

1. Карточки модулей на `/studio` визуально выше (floor 252px), включая слот «добавить».
2. Описание на карточках CORE читается **целиком** (нет `…` от line-clamp-2).
3. После C-45 — те же правила для трёх product tiles (регрессия одной сетки).

## Risks

- Длинный copy может раздуть ряд сетки — допустимо; не возвращать clamp-2 ради «ровных» рядов.
- Не раздувать padding ради пустоты: рост = под copy.

## Skills / refs

- `.cursor/skills/content-factory-ui/SKILL.md` — ModuleSelectorGrid
- Fact: `min-h-[168px]`, description `line-clamp-2 text-sm` @ ModuleSelectorGrid ~114 / ~128 / ~159
