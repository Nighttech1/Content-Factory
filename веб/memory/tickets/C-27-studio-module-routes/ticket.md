# C-27 — Studio launch: module pages + sidebar submenu

| Field | Value |
|-------|-------|
| **ID** | `C-27` |
| **Priority** | P0 |
| **Area** | studio / navigation |
| **Wave** | W-2026-09-20-studio-workspace |
| **Opened by** | Client — user request 2026-09-20 (§2 rocket / launch) |
| **Status** | specced |

## Expected

1. **Remove** idea/topic input (`FloatingCommandBar` topic field) from `/studio` launch page. Launch shows module cards (+ register slot) only — no idea field.
2. Click each content module card → opens **dedicated page** (e..g. `/studio/carousel-engine`, `/studio/heygen-reels`, …).
3. Left sidebar: under **Studio**, expandable submenu listing the same module pages.

## Actual

- Idea input lives on `/studio` via `FloatingCommandBar`.
- Cards only select module in store; no per-module route.
- Sidebar has flat `/studio` link, no children.

## Notes for Orchestrator

Зона: **Frontend** (+ light Motion). Keep Generate/SSE for later on module page (C-28). Do not delete inspect route. Guard: `/studio` has no topic input testid; each module href navigates; sidebar expands Studio children.
