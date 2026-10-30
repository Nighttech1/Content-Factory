# Content Module SDK

## When

Спринт 6, регистрация модулей, слот `[+ Add Custom Module]`, типы в `types/module.ts`.

## Contract

Реализовать `ContentModuleManifest` + `IContentModule` из `ARCHITECTURE.md` §4:

- `generateDraft(topic, options)`
- `renderAsset(draft)`
- `regenerateElement(draftId, elementIndex)` — гранулярный реролл слайда

## Registry

`src/modules/registry.ts` — динамический импорт папок `src/modules/{id}/`.
Появление манифеста → плитка в Studio + узел на Mesh.

## Core modules

1. `carousel-engine` — Satori/Puppeteer 1080×1350
2. `aesthetic-graphics` — SVG/Tailwind cards
3. `cartoon-reels` — Remotion/Lottie
4. `heygen-reels` — HeyGen API

Эти четыре живут в `src/modules/*/manifest.ts` + `src/modules/manifests.ts` (`listManifests`). **Не удалять** и не переименовывать без отдельного тикета.

## Studio product tiles vs C-21/C-22 test plugins

| Тип | Где | ids | Когда |
|-----|-----|-----|--------|
| **CORE** | `manifests.ts` | `carousel-engine`, … | постоянные каналы фабрики |
| **Product custom tiles** (UI-волна, без backend) | `data/local/custom-modules.json` (+ зеркало `localStorage` `cf.customModules.v1`) | **обязательно** `custom-*` (см. `lib/custom-modules-storage.ts` `isLiteManifest`) | продуктовые плитки Launchpad |
| **Test/smoke plugins** | то же JSON / storage | `custom-*-c21`, `custom-c22-*` | только на время smoke; **не оставлять** на Launchpad после приёмки |

### Cleanup Launchpad (типовой запрос)

1. Убрать сток: Tester/Client Plugin C21, C22 Live/Client Recheck — из JSON **и** из `cf.customModules.v1` (иначе hydrate вернёт мусор).
2. Поставить **3 продуктовые** плитки (пример ids — Архитектор фиксирует в spec):
   - `custom-reels` — «Рилс» · `video_9_16`
   - `custom-clips-to-reels` — «Нарезки с видео в рилсы» · `video_9_16`
   - `custom-info-video` — «Информационное видео» · `video_9_16` (или `carousel_4_5` если спека скажет иначе)
3. Title/description — человекочитаемые RU; `workerEndpoint` может быть заглушкой (`http://127.0.0.1:9/no-worker`) пока нет backend-волны.
4. Не тащить эти три в `CORE_MANIFESTS`, пока нет адаптеров/воркеров — UI-волна = custom fixtures.
5. Сетка: `components/studio/modules.ts` → `mergeStudioModules` (CORE + custom); карточки — `ModuleSelectorGrid.tsx`.

## Plugin slot UI

Модалка: title, outputFormat (`carousel_4_5` | `video_9_16` | `single_image`), worker endpoint.
