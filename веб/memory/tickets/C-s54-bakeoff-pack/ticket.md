# C-s54-bakeoff-pack — 9 PNG + labeled tree + MD traces + README

| Field | Value |
|-------|-------|
| **ID** | `C-s54-bakeoff-pack` |
| **Priority** | P0 |
| **Area** | ai_chat / artifacts / Client bake-off |
| **Status file** | [status.md](status.md) |
| **Wave** | `2026-10-17-anchor-ref-bakeoff` |

## Repro

1. After prompts + draw land, Client needs side-by-side labeled folders.  
2. Must not reburn etalon / Phase4 e2e into the 9-PNG budget.  
3. MD traces required under `docs/карусель тест/`.

## Expected

`generatedMedia/карусель тест/bakeoff-20261017/` with `pipeline=etalon|e2e_diffusion|anchor_ref_pipeline`, README index, 9 new LANGUAGE PNGs, Scriptwriter+Designer MDs, drafts overwritten — ready for Client **S54**.

## Actual

No bakeoff-20261017 tree / index yet.

## Notes for Orchestrator

Зона: **AI Bridge** last. Deployer refreshes API; Client verdict after folder ready.
