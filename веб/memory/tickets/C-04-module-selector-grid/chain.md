# Chain — C-04

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с C-05/C-06 на `lib/studio-store.ts`.  
> Старт Frontend C-04 первым в волне Sprint 2. Backend / AI Bridge / SSE — **нет**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `lib/studio-store.ts` (create: `selectedModuleId` + setter), `components/studio/ModuleSelectorGrid.tsx`, optional `components/studio/modules.ts` | [x] | GlassCard/tokens; **не** `app/studio/page.tsx`; **не** CommandBar/Drawer |
| 2 | Motion | `components/studio/ModuleSelectorGrid.tsx` | [x] | hover lift + soft blue/amber glow; spring `{ damping: 25, stiffness: 300 }` |
| 3 | Tester | `memory/tickets/C-04-module-selector-grid/guards.md` | [x] | 4+1 cards contract; store selection; anti-slop; visual `/studio` grid — после C-06 compose |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` | [x] | started `npm run dev` on `:3000`; `/studio` HTTP 200; не VPS |
| 6 | Client | приёмка C-04 | [x] | сетка + выбор модуля; финальный взгляд Launchpad вместе с C-05/C-06 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Done Frontend+Motion C-04 → Оркестратор стартует C-05 Frontend (extend store). Не параллелить C-04 FE с C-05/C-06 FE.
