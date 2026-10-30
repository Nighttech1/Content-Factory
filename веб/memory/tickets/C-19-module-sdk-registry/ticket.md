# C-19 — IContentModule + module registry

| Field | Value |
|-------|-------|
| **ID** | `C-19` |
| **Priority** | P0 |
| **Area** | module_sdk |
| **Wave** | `W-2026-09-19-sprint6-sdk` |

## Expected (DEV_PLAN 6.1)

- Types `ContentModuleManifest` + `IContentModule` per `ARCHITECTURE.md` §4 (`types/module.ts` or equivalent).
- Registry `src/modules/registry.ts` with dynamic import / registration of module folders.
- Core module ids wired into registry stubs: `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`.
- Studio tiles can list modules from registry (not only hardcoded constants) — full UI polish may land in C-21.

## Notes

Architect writes `architect-spec.md` + `chain.md` before any code.  
Adapters implementation → C-20. Plugin Slot UI → C-21. No secrets in repo.
