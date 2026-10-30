# C-22 — Custom module Generate 404 after Register

| Field | Value |
|-------|-------|
| **ID** | `C-22` |
| **Priority** | P1 |
| **Area** | module_sdk / plugin_slot |
| **Wave** | W-2026-09-19-sprint6-sdk |
| **Opened by** | Client acceptance W-2026-09-19-sprint6-sdk |
| **Parent** | C-21 Plugin Slot |
| **Closed** | 2026-09-19 Client **ПРИНЯТО** · status `done` · DEV_PLAN 6.3 `[x]` |

## Repro

1. `POST /api/modules/register` with `{ title, outputFormat, workerEndpoint }` → **200**, id e.g. `custom-client-plugin-c21`.
2. Confirm persist: `GET /api/modules/register` lists the new id; `data/local/custom-modules.json` contains it.
3. `POST /api/modules/custom-client-plugin-c21/generate` `{ "topic":"t" }` → **404** `{ ok:false, error:"module_not_found" }`.
4. Contrast: older `custom-tester-plugin-c21` (present at first hydrate) → **200** mock draft.

**URL:** `http://localhost:3000/studio` + APIs above.

## Expected

After Register, the new `custom-*` module is resolvable by `getModule` / generate facade (same as hydrate-from-disk). Selecting the new tile + **Generate Draft** opens drawer and returns mock (or worker) draft — no `module_not_found`.

## Actual

Register + GET list + tile merge work. Generate for modules registered **after** the first `ensureCustomModulesHydrated()` resolves returns **404**. Likely: one-shot hydrate cache and/or dual Next module instances (register route `registerModule` ≠ generate route registry map).

## Evidence (Client 2026-09-19)

- Persist file has both `custom-tester-plugin-c21` and `custom-client-plugin-c21`.
- Tester generate **200** mock; Client plugin generate **404** `module_not_found`.
- Playwright MCP: **gap** (same as Sprint 5) — HTTP + smoke + UI source.

## Notes for Orchestrator

Зона: **Backend** (`src/modules/registry.ts` hydrate idempotency / re-read; `lib/modules/run-module.ts`; register + generate routes).  
Не трогать тела M1–M4 adapters без нужды. Guard: POST register → POST generate same id → 200 mock.  
Chain: Architect → Backend → Tester → Fixer → Deployer → Client.
