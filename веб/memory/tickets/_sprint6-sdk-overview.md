# Sprint 6 — Module SDK overview

| Ticket | DEV_PLAN | Priority | Status |
|--------|----------|----------|--------|
| C-19 | 6.1 IContentModule + registry | P0 | **done** · Client ПРИНЯТО |
| C-20 | 6.2 Isolated adapters M1–M4 | P0 | **done** · Client ПРИНЯТО |
| C-21 | 6.3 Plugin Slot modal | P1 | **done_with_remarks** · Client ПРИНЯТО С ЗАМЕЧАНИЯМИ (замечание закрыто C-22) |
| C-22 | 6.3 follow-up: custom generate hydrate | P1 | **done** · Client ПРИНЯТО |

**Wave:** `memory/waves/W-2026-09-19-sprint6-sdk.md`  
**Client (2026-09-19, C-22 close):** **согласовано** — C-19…C-22 accepted; no open P0/P1; DEV_PLAN 6.1–6.3 `[x]`.  
**Playwright MCP:** gap (honest) — HTTP + smoke + UI source.  
**Skills:** `content-module-sdk`, `bullmq-job-queue`, `remotion-pipeline`, `heygen-avatar`, `content-pipeline-agents`, `content-factory-ui`  
**Refs:** `ARCHITECTURE.md` §4, `DEV_PLAN.md` Sprint 6, `workers/_index.md`

---

## Architect notes (2026-09-19)

### Order for Orchestrator

1. **C-19** → Backend → Frontend → Tester → Fixer → Deployer → Client  
2. **C-20** → Backend → AI Bridge → Frontend(opt) → Tester → Fixer → Deployer → Client  
3. **C-21** → Backend(opt) → Frontend → Tester → Fixer → Deployer → Client  
4. **C-22** → Architect → Backend → Tester → Fixer → Deployer → Client  

Do **not** parallel overlapping paths (`src/modules/**`, `registry.ts`, `ModuleSelectorGrid.tsx`).

### Key paths

| Area | Paths |
|------|--------|
| Types | `types/module.ts` |
| Registry + core | `src/modules/registry.ts`, `src/modules/{carousel-engine,aesthetic-graphics,cartoon-reels,heygen-reels}/` |
| ID bridge | `src/modules/id-map.ts` — Studio legacy (`carousel-4-5`, `infographics`, `heygen-avatar`) → SDK ids |
| Adapters / API | `lib/modules/run-module.ts`, `app/api/modules/**` |
| HeyGen | `lib/ai/heygen-gateway.ts` (mock if no `HEYGEN_API_KEY`) |
| Workers (contracts) | `workers/designer-{carousel,graphics,cartoon,heygen}/` |
| Studio UI | `components/studio/modules.ts`, `ModuleSelectorGrid.tsx`, `RegisterModuleModal.tsx` (C-21) |
| Custom persist | localStorage `cf.customModules.v1` **or** `data/local/custom-modules.json` (gitignored) |

### Boundaries

- C-19: types + registry + stubs + thin Studio list; Add stays disabled.  
- C-20: real adapters mock-first; AI Bridge owns HeyGen + prompts; no secrets in git.  
- C-21: Plugin Slot modal; uses `registerModule`; no remote code eval.  
- C-22: after Register, generate must resolve `custom-*` (re-hydrate / shared registry).  
- No `migrate reset`; localhost Client acceptance **without** live HeyGen.

### Spec / chain files

- `memory/tickets/C-19-module-sdk-registry/architect-spec.md` + `chain.md`
- `memory/tickets/C-20-module-adapters/architect-spec.md` + `chain.md`
- `memory/tickets/C-21-plugin-slot/architect-spec.md` + `chain.md`
- `memory/tickets/C-22-custom-generate-hydrate/ticket.md` + `architect-spec.md` + `chain.md` + `guards.md`
