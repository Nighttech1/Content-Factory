# Guards — C-19 Module SDK registry

Date: 2026-09-19  
Role: Tester  
Result: **GREEN**

Executable smoke: `npx tsx scripts/smoke-c19-registry.ts` → `SMOKE_OK`

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Exactly 4 core manifests registered with canonical ids | GREEN | Smoke: `aesthetic-graphics,carousel-engine,cartoon-reels,heygen-reels` / `count: 4` |
| G2 | Alias resolve → canonical (`heygen-avatar`, `carousel-4-5`, `infographics`) | GREEN | Smoke: aliases map to `heygen-reels`, `carousel-engine`, `aesthetic-graphics`; `toCanonical(heygen-avatar)` OK |
| G3 | Stub `renderAsset` / adapters deferred: `NotImplemented:C-20` | GREEN | Smoke: `renderAsset throws NotImplemented:C-20: true`; `generateDraft` mock draft (`elements: 1`, `mock: true`) |
| G4 | No secrets / env reads in module packages | GREEN | Grep `src/modules/**` + `types/module.ts`: no `HEYGEN_API_KEY` values, no `process.env` / api-key patterns |
| G5 | Studio tiles source = registry | GREEN | `components/studio/modules.ts`: `STUDIO_MODULES = listManifests().map(manifestToStudioModule)`; grid imports `STUDIO_MODULES` |
| G6 | Store normalizes legacy ids to canonical | GREEN | `lib/studio-store.ts`: `setSelectedModuleId` → `toCanonicalModuleId(id)` |
| G7 | `[+ Добавить модуль]` disabled (C-21 gate) | GREEN | `ModuleSelectorGrid.tsx`: `disabled` + `aria-disabled="true"` + title mentions C-21; `data-testid="module-add"` |
| G8 | anti-slop scan | GREEN | `python plugins/frontend/anti_slop_scan.py .` → `anti_slop_scan: OK` |
| G9 | `/studio` reachable on localhost | GREEN | Dev started (`npm run dev`); `curl http://localhost:3000/studio` → **200** (left running) |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| 1. Types + registry + 4 core ids | GREEN (G1, smoke + `types/module.ts` / `src/modules/**`) |
| 2. `/studio` four cards from registry | GREEN (G5, G9; Deployer/Client visual confirm optional) |
| 3. Add button does not open Plugin Slot | GREEN (G7 disabled) |
| 4. No HeyGen keys / no external API from stubs | GREEN (G4) |
| 5. Legacy Studio ids aliased or gone | GREEN (G2, G6) |

## Failures for Fixer

None.

## Re-run

```bash
npx tsx scripts/smoke-c19-registry.ts
python plugins/frontend/anti_slop_scan.py .
curl -s -o NUL -w "%{http_code}" http://localhost:3000/studio
```

## Mirror in Client skill

| C-19 | registry ≠ 4 / aliases broken / secrets / Add enabled | smoke-c19 | `scripts/smoke-c19-registry.ts` + this file |
