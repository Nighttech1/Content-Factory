# C-28 — Content workspace: dual carousels + idea + CapCut editor

| Field | Value |
|-------|-------|
| **ID** | `C-28` |
| **Priority** | P0 |
| **Area** | studio / module_workspace / editor |
| **Wave** | W-2026-09-20-studio-workspace |
| **Opened by** | Client — user request 2026-09-20 (§3–4) |
| **Status** | specced |

## Expected

On each content-type page (`/studio/[moduleId]`):

1. **Top:** idea/topic input (moved from launch).
2. **Left column:** vertical carousel of **our published posts** of this module type + metrics.
3. **Next column:** vertical carousel of **competitor posts** (analyst-selected) + metrics.
4. On idea submit/change: competitor carousel **filters/refetches by topic**; below idea input appears **empty draft block**.
5. Click draft block → opens **post editor** — CapCut-like timeline/canvas window (premium dark UI; can start as polished shell wired to existing inspect/HITL patterns + mock timeline; must feel like video edit workspace, not a plain form).

## Actual

No dual carousels; no competitor data; idea only on launch; inspect is HITL preview, not CapCut editor.

## Notes for Orchestrator

Зона: **Backend** (mock ours + competitors API) → **Frontend** → **Motion**. Mock OK without live IG. Guard: idea updates competitors; draft block visible; editor route/modal opens. Reuse generate/SSE where natural.
