# Guards — C-22 Custom generate hydrate

Date: 2026-09-19  
Role: Tester  
Result: **GREEN**

Executable smoke:
- `npx tsx scripts/smoke-c22-register-generate.ts` → `SMOKE_C22_OK`

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| G1 | Smoke: persist-only then `resolveModule` + `runGenerateDraft` | GREEN | `SMOKE_C22_OK custom-smoke-c22-1789828400542` — force re-hydrate path after one-shot hydrate |
| G2 | Live `POST /api/modules/register` unique title | GREEN | `http://localhost:3000` → **200** `{ ok:true, manifest.id: custom-c22-live-plugin-1789828442177 }` |
| G3 | Live `POST /api/modules/{id}/generate` same id immediately | GREEN | **200** `{ ok:true, draft.meta.mock:true }` — **not** 404 `module_not_found` |
| G4 | `GET /studio` reachable for Deployer/Client | GREEN | **200** on `:3000` |

## Acceptance criteria map (architect-spec)

| AC | Verdict |
|----|---------|
| POST register → POST generate same custom id → 200 ok + mock | GREEN (G2–G3) |
| No `module_not_found` after late register | GREEN (G1, G3) |

## Failures for Fixer

none

## Re-run

```bash
npx tsx scripts/smoke-c22-register-generate.ts
# with npm run dev on :3000:
# POST http://localhost:3000/api/modules/register
#      {"title":"C22 Live Plugin <unique>","outputFormat":"carousel_4_5","workerEndpoint":"http://127.0.0.1:9/no-worker"}
# POST http://localhost:3000/api/modules/<returned-id>/generate {"topic":"c22-live-topic"}
# Expect: both 200; generate ok + mock when worker unreachable
```

## Mirror in Client skill

| C-22 | After Register, custom generate resolves (hydrate/singleton) | smoke-c22 | `scripts/smoke-c22-register-generate.ts` + this file |
