# Chain — C-19

> Оркестратор зовёт **после** Architect Done.  
> **Запрет:** adapters M1–M4 (C-20), Plugin Slot modal (C-21), HeyGen live calls, `migrate reset`, secrets in git.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `types/module.ts`, `src/modules/id-map.ts` (или colocated), `src/modules/registry.ts`, `src/modules/carousel-engine/{manifest.ts,index.ts}`, `src/modules/aesthetic-graphics/{manifest.ts,index.ts}`, `src/modules/cartoon-reels/{manifest.ts,index.ts}`, `src/modules/heygen-reels/{manifest.ts,index.ts}`, `src/modules/_index.ts` (опц.), `.env.example` (коммент HEYGEN only) | [x] | 2026-09-19: types + id-map + registry + 4 stubs; generateDraft mock; render/regenerate → NotImplemented:C-20; smoke OK |
| 2 | Frontend | `components/studio/modules.ts`, `lib/studio-store.ts`, `components/studio/ModuleSelectorGrid.tsx` (только list source / data-module-id canonical; Add остаётся disabled) | [x] | 2026-09-19: tiles from `listManifests()`; store normalizes via `toCanonicalModuleId`; Add disabled (C-21 title). No modal / mesh. |
| 3 | Tester | `memory/tickets/C-19-module-sdk-registry/guards.md` | [x] | 2026-09-19: GREEN — smoke SMOKE_OK; aliases; NotImplemented:C-20; no secrets; Add disabled; tiles from registry; anti_slop OK; /studio 200 |
| 4 | Fixer | Backend + Frontend paths выше (если красное) | [x] | skip — Tester GREEN, no red |
| 5 | Deployer | localhost | [x] | 2026-09-19: `/studio` 200; smoke SMOKE_OK; Next :3000 left up; VPS N/A |
| 6 | Client | приёмка C-19 | [x] | **ПРИНЯТО** 2026-09-19 — 4 canonical ids on `/studio`; Add now enabled via C-21 (wave OK). Playwright MCP gap (HTTP+smoke+source). |

Порядок: **Backend → Frontend → Tester → Fixer → Deployer → Client**.  
Не параллелить Backend и Frontend на `modules.ts` / store.

Depends on: Sprint 2 Studio UI.  
Blocks: C-20 (adapters), C-21 (slot uses registry).  
Overview: `memory/tickets/_sprint6-sdk-overview.md`
