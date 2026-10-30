# C-e2e-prompts-kill-overlay — Kill HTML-first / zero-text prompt wording

| Field | Value |
|-------|-------|
| **ID** | `C-e2e-prompts-kill-overlay` |
| **Priority** | P0 |
| **Area** | ai_chat / carousel draw prompts |
| **Status file** | [status.md](status.md) |
| **Wave** | `2026-10-16-e2e-image-carousel` |

## Repro

1. Open Designer Create overlays / agent-defaults after Phase3 audit.  
2. Wording still says HTML/CSS-first primary and «no text in diffusion».  
3. Skills already Phase4 / S53 — code strings lag.

**URL:** Create carousel (localhost) — wording only this ticket.

## Expected

Designer / Create paint language = **E2E DIFFUSION**: image model bakes typography; HTML overlay **not** primary.

## Actual

Phase3 «zero readable text» / HTML-first primary still in product prompt strings.

## Notes for Orchestrator

Зона: **AI Bridge** first in wave. Backend draw flip = next ticket.
