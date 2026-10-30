# Architect spec — C-45

> Заполняет **Архитектор** до любого кода. Mid-flight смена → обновить этот файл + `chain.md`.

## Goal

Убрать стоковые QA-плагины C-21/C-22 с сетки Studio Launchpad и заменить их **тремя продуктовыми плитками** (RU title/description). Четыре CORE-модуля оставить без изменений. Без новых SDK adapters / воркеров — UI fixtures через custom hydrate.

## In scope

1. **Заменить содержимое** `data/local/custom-modules.json` (не добавлять CORE в `src/modules/manifests.ts`).
2. Убрать ids QA junk:
   - `custom-tester-plugin-c21`
   - `custom-client-plugin-c21`
   - `custom-c22-live-plugin-1789828442177`
   - `custom-c22-client-recheck-1789828479876`
3. Поставить **ровно 3** product custom (ids зафиксированы ниже).
4. **Dual-source:** серверный JSON + зеркало `localStorage` key `cf.customModules.v1` (через существующий `hydrateCustomModules` → GET `/api/modules/register` → `writeCustomModulesListToStorage`). После замены JSON успешный hydrate **перезаписывает** localStorage — stale QA не должен остаться. Если нужно — Frontend может явно очистить/перезаписать mirror при первом mount (без нового API).
5. Сетка по-прежнему: `mergeStudioModules` = CORE (`STUDIO_MODULES` из manifests) + custom extras. CORE wins on id collision.

## Out of scope

- Удаление / правка CORE: `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`
- Новые adapters в `src/modules/registry.ts` / Node workers
- Header cleanup → **C-46**; card height → **C-47** (уже должны быть Done до визуальной приёмки этой волны)
- Prisma / Redis / SSE / publish / Mesh
- Реальные worker endpoints (placeholder OK)

## Fixed module ids (обязательно `custom-*`)

| id | title (RU) | description (RU, продуктовый) | outputFormat | icon (Lucide key, FE может уточнить) | workerEndpoint |
|----|------------|-------------------------------|--------------|--------------------------------------|----------------|
| `custom-reels` | Рилс | Короткие вертикальные ролики 9:16 под Reels и Shorts: хук, сценарий и монтажный ритм под бренд клуба. | `video_9_16` | `Clapperboard` | `http://127.0.0.1:9/no-worker` |
| `custom-clips-to-reels` | Нарезки с видео в рилсы | Нарезает длинное видео на серию рилсов: лучшие моменты, субтитры и готовые куски под публикацию. | `video_9_16` | `Scissors` | `http://127.0.0.1:9/no-worker` |
| `custom-info-video` | Информационное видео | Объясняющий ролик с тезисами и визуальной структурой: цифры, шаги, выводы без «пустого» сторителлинга. | `video_9_16` | `Presentation` | `http://127.0.0.1:9/no-worker` |

### Seed shape (`custom-modules.json`)

Сохранить совместимость с `src/modules/custom-remote/persist.ts` (top-level `workerEndpoint`, как у текущего файла):

```json
{
  "version": 1,
  "modules": [
    {
      "id": "custom-reels",
      "title": "Рилс",
      "description": "…",
      "version": "0.1.0",
      "outputFormat": "video_9_16",
      "icon": "Clapperboard",
      "workerEndpoint": "http://127.0.0.1:9/no-worker"
    }
    // + clips-to-reels, info-video
  ]
}
```

API GET нормализует в `CustomModuleManifestLite` (`defaultSettings.workerEndpoint`) для FE mirror — Frontend **не** обязан менять `lib/custom-modules-storage.ts`, если hydrate уже работает.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Seed JSON (+ optional FE mirror clear) | Frontend | `data/local/custom-modules.json`; при необходимости только существующие helpers storage/store — **без** новых CORE adapters |
| Backend | — | обычно **не нужен**: FE правит JSON напрямую. Звать Backend только если write через API register критичен и JSON недоступен агенту |
| Motion | — | нет |
| QA | Tester → Fixer | нет C21/C22 titles; есть 3 RU + 4 CORE |
| Localhost | Deployer | `:3000/studio` |
| Приёмка | Client | product tiles |

## Contracts

### Dual-source (инвариант)

| Source | Role |
|--------|------|
| `data/local/custom-modules.json` | Source of truth на сервере (GET/POST `/api/modules/register`) |
| `localStorage` `cf.customModules.v1` | FE mirror после hydrate; **должен** отражать 3 product ids, не QA |

### Merge UI

- `components/studio/modules.ts` → `mergeStudioModules` — **не менять контракт** (core wins).
- Ожидаемый итог сетки: **4 CORE + 3 product custom** (+ dashed Add-слот как сейчас).

### Path lock

- Primary: `data/local/custom-modules.json`
- Touch only if hydrate/mirror broken for new ids: `lib/custom-modules-storage.ts`, `lib/studio-store.ts` (hydrate) — минимально
- **Запрещено:** `src/modules/manifests.ts` CORE delete/add; Node registry adapters для этих трёх

### Wave order

Последний в волне: **C-46 → C-47 → C-45**. Так карточки уже 252px к моменту product copy.

## Acceptance criteria (язык Клиента)

1. На `/studio` **нет** плиток Tester/Client Plugin C21, C22 Live/Client Recheck.
2. Есть плитки **Рилс**, **Нарезки с видео в рилсы**, **Информационное видео** с человекочитаемыми RU-описаниями.
3. CORE четыре модуля на месте (карусели / инфографика / мульт-Reels / HeyGen).
4. После reload dual-source: localStorage не возвращает старые QA ids (hydrate перезаписал mirror).
5. Placeholder worker — ок; Generate может не давать реальный ассет (вне scope этой волны).

## Risks

- Stale `cf.customModules.v1` до первого успешного GET — Tester обязан проверить reload; Fixer: force overwrite mirror.
- Не класть product ids в CORE без adapters — иначе ломается Module SDK контракт.
- Не оставлять пустой `modules: []` — пользователь ждёт 3 product tiles.

## Skills / refs

- `.cursor/skills/content-module-sdk/SKILL.md` — Studio product tiles vs C-21/C-22
- `.cursor/skills/content-factory-ui/SKILL.md`
- Fact paths: `mergeStudioModules`, `hydrateCustomModules`, `/api/modules/register`
- Trainer: ids `custom-reels` / `custom-clips-to-reels` / `custom-info-video`
