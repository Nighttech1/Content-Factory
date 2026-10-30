# Chain — C-05

> Оркестратор зовёт следующую роль только после checkbox.  
> **Старт Frontend только после** Frontend+Motion **C-04** (store уже создан).  
> Backend / AI Bridge / SSE — **нет**. Hard link с C-06 на Generate → drawer.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/FloatingCommandBar.tsx`, `lib/studio-store.ts` (extend: topic, presets, `startGenerate`, seed `drawerOpen` if needed) | [x] | **не** Grid, **не** Drawer, **не** `app/studio/page.tsx`; Generate → store `startGenerate` |
| 2 | Motion | `components/studio/FloatingCommandBar.tsx` | [x] | gradient / pulse border на Generate Draft |
| 3 | Tester | `memory/tickets/C-05-floating-command-bar/guards.md` | [x] | input+chips+Generate wiring; full S1 (drawer opens) — jointly C-06 |
| 4 | Fixer | paths Frontend+Motion выше (если красное) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` | [x] | started `npm run dev` on `:3000`; `/studio` HTTP 200; bar live; не VPS |
| 6 | Client | приёмка C-05 | [x] | bar UX; Hard link Generate↔drawer проверяется с C-06 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна:** после Done Frontend+Motion C-05 → Оркестратор стартует C-06 Frontend. Не параллелить store.
