# Chain — C-06

> Оркестратор зовёт следующую роль только после checkbox.  
> **Старт Frontend только после** Frontend+Motion **C-05** (topic + `startGenerate` seed готовы).  
> Backend / AI Bridge / SSE — **нет**. Это gate Hard REJECT S1 волны.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/GenerationDrawer.tsx`, `lib/studio-store.ts` (extend: drawer, agentSteps, progress, mock runner / `startGenerate` body), `app/studio/page.tsx` (compose Grid + CommandBar + Drawer) | [x] | mock 1–2s/step; **не** SSE; не shell |
| 2 | Motion | `components/studio/GenerationDrawer.tsx` | [x] | slide-over + progress pulse |
| 3 | Tester | `memory/tickets/C-06-generation-drawer/guards.md` | [x] | **S1** Generate→drawer+steps; regress C-04/C-05 on `/studio`; anti-slop |
| 4 | Fixer | paths Frontend+Motion (+ page/store if red) | [x] | N/A — skipped (Tester GREEN, no fix needed) |
| 5 | Deployer | localhost `:3000` → `/studio` | [x] | started `npm run dev` on `:3000`; `/studio` HTTP 200; Launchpad ready; не VPS |
| 6 | Client | приёмка C-06 (+ волна C-04/C-05 visual) | [x] | S1 обязателен; вердикт Launchpad Sprint 2 |

Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.

**Волна (сводка порядка):**  
`C-04 FE → C-04 Motion → C-05 FE → C-05 Motion → C-06 FE → C-06 Motion → (Tester…)`.  
`lib/studio-store.ts` и `app/studio/page.tsx` — только последовательно, без параллели.
