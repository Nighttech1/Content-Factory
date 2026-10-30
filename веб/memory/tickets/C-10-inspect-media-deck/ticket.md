# C-10 — Media Inspector: left deck (player + carousel)

| Field | Value |
|-------|-------|
| **ID** | `C-10` |
| **Priority** | P0 |
| **Area** | studio_inspect |
| **Status file** | [status.md](status.md) |
| **Wave** | `W-2026-09-18-sprint4` |

## Repro

1. `/studio/inspect/:id` — маршрута нет.

**URL:** `http://127.0.0.1:3000/studio/inspect/demo`

## Expected (DEV_PLAN 4.1)

- Split-screen Inspector shell; left deck ~55%.
- Mode toggle: **9:16 Reels Player** (scrubber, Play/Pause, karaoke subtitle overlay with Armenian glyphs) vs **4:5 Carousel Deck** (slides 01–08, drag-and-drop reorder).
- Dark Luxury tokens; AppShell preserved.
- Mock media data OK (no real HeyGen/Remotion yet).

## Actual

Route/components missing.

## Notes for Orchestrator

Frontend + `content-factory-ui` / `image-to-luxury-ui`. Stitch: `vernatun_content_factory_media_inspector_hitl_studio`. Right panel → C-11; toolbar → C-12.
