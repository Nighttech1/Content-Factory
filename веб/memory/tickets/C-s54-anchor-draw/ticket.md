# C-s54-anchor-draw — Cover-first draw + Polza ref / MASTER STYLE

| Field | Value |
|-------|-------|
| **ID** | `C-s54-anchor-draw` |
| **Priority** | P0 |
| **Area** | backend / carousel draw |
| **Status file** | [status.md](status.md) |
| **Wave** | `2026-10-17-anchor-ref-bakeoff` |

## Repro

1. `generateAggregatorImage` is prompt-only (`POST /images/generations`).  
2. No sequential cover→reference path for slides 2–N.  
3. Bake-off needs labeled writes under HARD `pipeline=anchor_ref_pipeline/…`.

## Expected

Cover painted first; slides 2–N match cover via Polza edits/image param **if supported**, else locked MASTER STYLE + sequential prompts; PNG under User HARD bakeoff tree.

## Actual

One-shot Phase4 per-slide generations only; no cover reference continuity.

## Notes for Orchestrator

Зона: **Backend** after prompts ticket. Live 3-theme burn = pack ticket.
