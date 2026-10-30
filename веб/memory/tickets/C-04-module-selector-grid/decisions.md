# Decisions — C-04

| When | Role | Decision |
|------|------|----------|
| 2026-09-18 | Orchestrator | Волна W-2026-09-18-sprint2 |
| 2026-09-18 | Architect | Spec+chain: FE создаёт `lib/studio-store.ts` (`selectedModuleId` only) + `ModuleSelectorGrid`; optional `modules.ts`. **Не** трогать `app/studio/page.tsx` (compose = C-06). |
| 2026-09-18 | Architect | Motion на этом тикете: hover lift + soft blue/amber glow **только** на `ModuleSelectorGrid.tsx` (не откладывать Motion на C-06). |
| 2026-09-18 | Architect | Module ids: `carousel-4-5`, `infographics`, `cartoon-reels`, `heygen-avatar`. 5-я карточка — UI stub, не пишет selection. |
| 2026-09-18 | Architect | Store path lock: порядок C-04 → C-05 → C-06; **запрет** параллельного FE на `studio-store`. Backend/AI Bridge/SSE out of wave. |
| 2026-09-18 | Architect | Chain: Frontend → Motion → Tester → Fixer → Deployer → Client. Visual mount grid на `/studio` после C-06 compose; C-04 Tester — контракт store+component. |
| 2026-09-18 | Frontend | Created `lib/studio-store.ts` (`selectedModuleId`/`setSelectedModuleId`), `components/studio/modules.ts` (4 ids + RU labels), `ModuleSelectorGrid.tsx` (GlassCard + selected cobalt border + dashed add no-op). Page compose deferred to C-06. Basic CSS hover; Motion unchecked. |
| 2026-09-18 | Motion | `motion.button` cards: spring lift `y:-4` + amber glow (idle hover) / blue glow (selected); `{ damping: 25, stiffness: 300 }`; `useReducedMotion` skips hover cinema. Store/shell untouched. |
| 2026-09-18 | Tester | GREEN. 4 modules + `module-add`; selection via store; spring 25/300; anti-slop OK. Guards: `guards.md` + `scripts/sprint2-guards.mjs`. No Fixer. |
| 2026-09-18 | Fixer | N/A / skipped — Tester reported GREEN; no code fix. |
| 2026-09-18 | Deployer | Localhost only. Started `npm run dev` on `:3000` (was down). Verified `http://127.0.0.1:3000/studio` → HTTP 200. No VPS/prod. Client URL: `http://127.0.0.1:3000/studio`. |
