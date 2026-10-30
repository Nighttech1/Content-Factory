# C-21 — Plugin Slot modal (Register New Module)

| Field | Value |
|-------|-------|
| **ID** | `C-21` |
| **Priority** | P1 |
| **Area** | studio_ui |
| **Wave** | `W-2026-09-19-sprint6-sdk` |

## Expected (DEV_PLAN 6.3)

- Modal `[+ Register New Module]` from the dashed «Add module» tile on `/studio`.
- Fields: title, output type (`Video` / `Carousel` / `Graphic` → map to `outputFormat`), worker API endpoint.
- Registered custom module appears as a new tile (local persistence OK for localhost; no prod publish).
- Dark Luxury glass styling consistent with Studio.

## Notes

Depends on C-19 registry API. Adapters M1–M4 (C-20) should already be selectable. SSE live progress → Sprint 7.
