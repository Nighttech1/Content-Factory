# C-e2e-draw-integrated-text — Flip runCreateCarouselDraw to full-slide image gen

| Field | Value |
|-------|-------|
| **ID** | `C-e2e-draw-integrated-text` |
| **Priority** | P0 |
| **Area** | carousel draw / Backend |
| **Status file** | [status.md](status.md) |
| **Wave** | `2026-10-16-e2e-image-carousel` |

## Repro

1. Call Create Designer **Нарисовать** / `runCreateCarouselDraw`.  
2. Runtime defaults to HTML/CSS-first + Playwright text overlay; image prompts ban letters.  
3. Client S53 requires typography **on** PNG from image-2.

**URL:** Create carousel draw path (localhost API).

## Expected

Default: per-slide `generateAggregatorImage` with scenario text + approx colors → saved PNG; HTML overlay **not** primary.

## Actual

`CAROUSEL_HTML_FIRST` on; `sanitizeLiveGenVisualPrompt` appends NO readable text; Playwright HTML is ship path.

## Notes for Orchestrator

Зона: **Backend** (renderer). After **C-e2e-prompts-kill-overlay**. Live burn = next ticket.
