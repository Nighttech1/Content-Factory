# Guards — C-06

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script / testids | `generation-drawer`, `agent-step`, `generation-progress` на панели. | `components/studio/GenerationDrawer.tsx` + `scripts/sprint2-guards.mjs` |
| script / pipeline | Фазы mock: `researching` → `hooking` → `scripting` → `designing` → `done`; timers client-side; **без** SSE. | `lib/studio-store.ts` + `scripts/sprint2-guards.mjs` |
| script / S1 open | `startGenerate` / `runMockPipeline` ставит `drawerOpen: true` + сбрасывает `agentSteps`/`progress`. | `lib/studio-store.ts` + `scripts/sprint2-guards.mjs` |
| script / compose | `/studio` монтирует `ModuleSelectorGrid` + `FloatingCommandBar` + `GenerationDrawer`. | `app/studio/page.tsx` + `scripts/sprint2-guards.mjs` |
| regress | C-04 (4+1 cards) + C-05 (Generate gate) в том же `sprint2-guards.mjs`. | `scripts/sprint2-guards.mjs` |
| anti-slop | Нет indigo/violet slop на волне. | `python plugins/frontend/anti_slop_scan.py .` → OK |
| smoke | Static S1 surface (testids + phases + compose); Client Playwright S1 после Deployer. | Tester 2026-09-18 |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`
