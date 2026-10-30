# Decisions — C-76

## Канон (без развилок)

| Решение | Канон |
|---------|--------|
| Тип плиток | **CORE** manifests (`listManifests`), не `custom-*` localStorage |
| moduleId | `site-articles`, `tg-articles` |
| Titles | «Статьи на сайт», «Статьи в TG» |
| outputFormat | `single_image` (оба) |
| Worker | stub в `defaultSettings` (mock / no live CMS) |
| Copy ban | Удалить **все** строки с «Выберите модуль» на Launchpad |
| Descriptive | **Один** абзац только в `StudioPageClient` под h1 «Студия»; под «Каналы рендера» — **без** второго абзаца |
| Секция | Заголовок «Каналы рендера» остаётся |
| ID конфликт | Старый wave3 «C-76 publisher E2E» **не** этот тикет → C-78 / P2 |

## Path lock

Только Launchpad + manifests. Razbor / Schedule / MultiButton — **out**.

## Rollback

1. `git checkout --` paths из `chain.md` step Frontend.
2. Папку `memory/tickets/C-76-launchpad-channels-copy/` не удалять.
