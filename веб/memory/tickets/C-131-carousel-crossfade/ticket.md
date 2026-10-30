# C-131 — Carousel crossfade (no black flash)

| Field | Value |
|-------|-------|
| **ID** | `C-131` |
| **Priority** | P0 |
| **Area** | studio_feed / motion |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | `status.md` (Frontend done; Motion next) |
| **[MKT]** | Слайды карусели без чёрной пустоты между кадрами |

## Repro

1. Feed / Create preview / Razbor carousel — клик L/R или auto advance.
2. Между слайдами виден чёрный/пустой кадр (hard cut).

**URL:** `http://127.0.0.1:8787/studio/<moduleId>`

## Expected

Smooth **crossfade** / shared-layout slide transition; **no** black/empty frame between slides.

## Actual

Wave3 hard cut / opacity hole → black flash.

## Notes for Orchestrator

После C-132. **Frontend hook + Motion** role. Client S38.
