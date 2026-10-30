# Guards — C-21 Plugin Slot

Date: 2026-09-19  
Role: Tester  
Result: **GREEN**

Executable smoke:
- `npx tsx scripts/smoke-c21-register.ts` → `SMOKE_C21_OK`
- `python plugins/frontend/anti_slop_scan.py .` → `anti_slop_scan: OK`

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | `GET /studio` → 200 | GREEN | Dev `npm run dev`; `Invoke-WebRequest http://localhost:3000/studio` → **200** |
| G2 | `POST /api/modules/register` → ok + custom id | GREEN | Body `{ title, outputFormat: carousel_4_5, workerEndpoint }`; **200** `{ ok:true, manifest.id: custom-tester-plugin-c21 }` |
| G3 | `GET /api/modules/register` includes custom | GREEN | **200** `{ ok:true, count:1, manifests:[{ id: custom-tester-plugin-c21, … }] }` — persist reload path |
| G4 | `POST /api/modules/{customId}/generate` mock-safe | GREEN | Unreachable worker → **200** `{ ok:true, draft.meta.mock:true, reason:"fetch failed" }` — not 500 |
| G5 | Add tile enabled + Register modal | GREEN | `ModuleSelectorGrid`: `data-testid="module-add"` **no** `disabled`; opens modal. `RegisterModuleModal` has `data-testid="register-module-modal"` |
| G6 | Core 4 intact in manifests | GREEN | `listManifests()` → `carousel-engine,aesthetic-graphics,cartoon-reels,heygen-reels` (count 4); smoke asserts core stays 4 |
| G7 | anti-slop | GREEN | `anti_slop_scan: OK` |
| G8 | No secrets in C-21 files | GREEN | Sweep `custom-remote/`, register route, RegisterModuleModal, ModuleSelectorGrid, custom-modules-storage, smoke → no key literals; persist only endpoint URL; `data/local/*` gitignored |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. Add opens register modal | GREEN (G5 — Add enabled + modal testid; FE wires `onClick` → `setRegisterOpen(true)`) |
| 2. Fill title / output / worker → Register | GREEN (G2 API + modal form fields present in `RegisterModuleModal.tsx`) |
| 3. New tile selectable | GREEN (G2 id `custom-*`; grid merges `customModules` with `data-module-id`) |
| 4. Core M1–M4 still present | GREEN (G6) |
| 5. Dark Luxury modal / no 1440 H-scroll | GREEN for style tokens (glass / elevated); visual 1440 → Client |
| 6. Persist across reload | GREEN (G3 GET after POST; hybrid JSON + `cf.customModules.v1` localStorage) |
| 7. No secrets; unreachable worker ≠ crash | GREEN (G4, G8) |

## Failures for Fixer

none

## Re-run

```bash
npx tsx scripts/smoke-c21-register.ts
python plugins/frontend/anti_slop_scan.py .
# with npm run dev:
# GET  http://localhost:3000/studio → 200
# POST http://localhost:3000/api/modules/register
#      {"title":"Tester Plugin C21","outputFormat":"carousel_4_5","workerEndpoint":"http://127.0.0.1:9/no-worker"}
# GET  http://localhost:3000/api/modules/register → includes custom-*
# POST http://localhost:3000/api/modules/custom-tester-plugin-c21/generate {"topic":"t"} → ok + mock
```

Expect: `SMOKE_C21_OK`; anti_slop OK; studio **200**; register/generate **200** with `custom-*` id and `mock:true` when worker down.

## Mirror in Client skill

| C-21 | Plugin Slot register modal + custom tile persist + mock worker | smoke-c21 | `scripts/smoke-c21-register.ts` + this file |
