# Architect spec — C-trace-docs-md (P1)

> Wave `2026-10-16-carousel-prompt-trace` · after Scriptwriter + Designer tickets  
> Folder: `docs/карусель тест/`

## Goal

Close the Client debug package: **index** all session MDs, link PNG paths, and write a clear **weak-link verdict** so the user can see where quality dies — without more generation.

## Decision locks

| ID | Lock |
|----|------|
| **D-doc-1** | Fill `docs/карусель тест/README.md` index table (file · theme · PNG · weak link per run). |
| **D-doc-2** | Wave verdict section: one primary weak link ∈ { Scriptwriter flat · weak handoff · empty/generic visual_prompt · weak image prompt · HTML overlay miss · none/PASS } + 2–4 sentence evidence citing MD section anchors. |
| **D-doc-3** | Verify both pairs exist: `01-scriptwriter-*` + `02-designer-*` × 2 topics; all mandatory template sections present (no empty «…» placeholders left as sole content in system/user). |
| **D-doc-4** | Redact pass: no secrets, no raw `.env`, no Authorization headers. |
| **D-doc-5** | Do **not** regenerate PNG unless ticket 2 failed budget — docs ticket is package/close only. |
| **D-doc-6** | `shell_freeze` — docs/MD only (+ optional wave folder note under `memory/waves/2026-10-16-carousel-prompt-trace/`). |

## Exact files

| Path | Action |
|------|--------|
| `docs/карусель тест/README.md` | Update index + verdict |
| Session MD files | Fix section gaps / redactionsact only if Tester flags |
| `memory/waves/2026-10-16-carousel-prompt-trace/` | Optional `weak-link-verdict.md` copy for Client |

## MUST NOT

- Product code / prompt overlay edits (reopen ticket 1/2)  
- UI chrome  
- Apify / feed work  
- Invent MD content without live dumps — if dumps missing, **FAIL** and return to prior ticket  

## Acceptance

- [ ] README index has 2 rows with real filenames + PNG paths  
- [ ] Verdict written with cited evidence  
- [ ] Templates’ mandatory sections present in all 4 session files  
- [ ] No secrets  

## Guards (Tester)

- README links resolve to existing files  
- Section header checklist vs `_templates/`  
- Guard file: `memory/tickets/C-trace-docs-md/guards.md`

## Skills

`carousel-prompt-trace` · `ticket-engine` (docs package) · `client-review` (read-only for verdict language)
