# Chain — C-45

> Оркестратор зовёт следующую роль только после checkbox.  
> **Motion / AI Bridge — нет. Backend — обычно skip** (FE правит JSON).  
> Старт после Done Frontend **C-47** (волна: C-46 → C-47 → **C-45**).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `data/local/custom-modules.json` (± `lib/custom-modules-storage.ts` / `lib/studio-store.ts` только если mirror не перезаписывается) | [x] | Убрать 4 QA; seed 3 product ids ниже; **не** трогать CORE `manifests.ts` |
| 2 | Tester | `memory/tickets/C-45-product-module-tiles/guards.md` | [x] | Disk PASS (3 product); LIVE FAIL — GET /api/modules/register всё ещё C21/C22 (stale hydrate) |
| 3 | Fixer | `src/modules/registry.ts` + `app/api/modules/register/route.ts` | [x] | Sync delete stale custom-* + GET force hydrate; CORE не тронут |
| 4 | Deployer | localhost `:3000` | [x] | API check GREEN count=3 product ids; HMR, полный рестарт не нужен |
| 5 | Client | приёмка C-45 | [ ] | product tiles; Hard REJECT если QA junk остался |

### Fixed ids (для Frontend / Tester)

- `custom-reels` — «Рилс»
- `custom-clips-to-reels` — «Нарезки с видео в рилсы»
- `custom-info-video` — «Информационное видео»

Порядок: **Frontend → Tester → Fixer → Deployer → Client**.

**Backend:** не ставить в chain по умолчанию. Если JSON write blocked — эскалация к Архитектору (mid-flight), не самовольный SDK.
