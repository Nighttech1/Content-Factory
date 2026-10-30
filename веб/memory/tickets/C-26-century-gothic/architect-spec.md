# Architect spec — C-26

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Заменить глобальный UI-шрифт Inter на **Century Gothic** во всём приложении, сохранив Noto Sans Armenian для hy-глифов и JetBrains Mono для mono-меток.

## In scope

- `app/layout.tsx`: убрать `Inter` из `next/font/google`; подключить Century Gothic через `next/font/local` (`localFont`) и/или `@font-face` в `app/globals.css`.
- CSS-токен `--font-ui`: значение семейства должно резолвиться в Century Gothic (или зарегистрированное local family name), не Inter.
- Stack на `body` / `:root`: `var(--font-ui), var(--font-hy), system-ui, sans-serif` — порядок: Century Gothic → Noto Armenian → system.
- Mono: `--font-mono-jb` / JetBrains Mono **без изменений**.
- Опционально: `public/fonts/century-gothic*.woff2` (или `.woff`) как webfont fallback, если файл лицензионно можно положить в репо; иначе только `local("Century Gothic")` + documented CSS fallbacks (`CenturyGothic`, `AppleGothic` не трогать как primary — Windows local first).
- Guard / smoke: computed `--font-ui` или `getComputedStyle(body).fontFamily` содержит Century Gothic (или имя из `localFont`).

## Out of scope

- Редизайн палитры / `DESIGN.md` токенов цвета.
- Смена шрифтов в Remotion/SVG mock-assets (`system-ui` в SVG OK).
- C-27 / C-28 навигация и workspace.
- Загрузка платных CDN-шрифтов без локального файла / local family.
- Любые миграции БД / wipe данных.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI / tokens | Frontend | `layout.tsx`, `globals.css`, optional `public/fonts/` |
| Motion | — | не нужен |
| API / data | — | не нужен |
| AI bridge | — | не нужен |

## Contracts

### Font loading strategy (обязательный порядок)

1. **Local OS first:** `src: [{ path: "…", weight: "400", style: "normal" }]` через `localFont` **или** `@font-face { src: local("Century Gothic"), local("CenturyGothic"), url(/fonts/…) format("woff2") }`.
2. **Woff fallback:** если команда кладёт файл в `public/fonts/`, указать путь в spec-реализации; если файла нет в репо на момент кода — только `local()` + CSS `font-family: "Century Gothic", "CenturyGothic", var(--font-hy), …` и зафиксировать в `decisions.md`.
3. **Variable:** сохранить имя CSS-переменной `--font-ui` (не ломать consumers `font-[family-name:var(--font-ui)]` / `--font-sans`).
4. **Armenian:** `--font-hy` = Noto Sans Armenian; hy-фрагменты с `lang="hy"` / `font-[family-name:var(--font-hy)]` остаются валидными.
5. **Mono:** JetBrains Mono → `--font-mono-jb` без изменений.

### Do not

- Не оставлять Inter как primary или fallback в `--font-ui`.
- Не удалять Noto / JetBrains.

## Acceptance criteria (язык Клиента)

1. На любом экране (`/studio`, `/analytics`, shell) основной текст выглядит как Century Gothic (на Windows — знакомый «готический» sans), а не Inter.
2. Армянская строка «Բարև» читается без битых глифов (Noto в стеке).
3. Mono-подписи (`// SPEED PROTOCOL`, labels в sidebar) остаются JetBrains Mono.
4. Guard: `--font-ui` / computed family включает Century Gothic (или имя из `localFont`), не `Inter`.

## Risks

- **Лицензия webfont:** Century Gothic — проприетарный; без файла в `public/fonts/` полагаться на `local("Century Gothic")` (типично на Windows). Если local отсутствует (Linux CI) — fallback на близкий stack (`Gill Sans`, `CenturyGothic`, sans-serif) и явная пометка в decisions; CI guard может assert по CSS variable string, не по pixel font.
- **next/font/local без файла:** если нет woff — использовать чистый CSS `@font-face` + `local()`, не ломать build.
- Регрессия читаемости hy, если `--font-hy` убрать из stack — запрещено.

## Mid-flight escalation

Если лицензия / отсутствие файла блокирует `localFont`: **стоп** → Оркестратор → Архитектор правит decisions (CSS-only local stack) → Frontend продолжает. Не подменять палитру и не трогать C-27/C-28.
