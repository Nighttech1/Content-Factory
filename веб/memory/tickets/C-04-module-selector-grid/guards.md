# Guards — C-04

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script / modules | Ровно 4 id: `carousel-4-5`, `infographics`, `cartoon-reels`, `heygen-avatar` в `STUDIO_MODULES`. Предотвращает пустую/урезанную сетку. | `components/studio/modules.ts` + `scripts/sprint2-guards.mjs` |
| script / testids | `data-testid="module-card"` на карточках + `data-testid="module-add"` на stub «[+ Добавить модуль]». | `components/studio/ModuleSelectorGrid.tsx` + `scripts/sprint2-guards.mjs` |
| script / selection | Grid читает `selectedModuleId` и пишет через `setSelectedModuleId`. Предотвращает UI без store. | `ModuleSelectorGrid.tsx` + `lib/studio-store.ts` + `scripts/sprint2-guards.mjs` |
| script / motion | Spring `{ damping: 25, stiffness: 300 }` на карточках. | `ModuleSelectorGrid.tsx` + `scripts/sprint2-guards.mjs` |
| regress | C-05/C-06 Launchpad compose + Generate wiring всё ещё зелёные (тот же `sprint2-guards.mjs`). | `scripts/sprint2-guards.mjs` |
| anti-slop | Нет indigo/violet slop на волне. | `python plugins/frontend/anti_slop_scan.py .` → OK |
| smoke | Static: 4 modules + module-add present; Client visual `/studio` после Deployer. | Tester 2026-09-18 |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`
