# Wave W-2026-09-20-carousel-razbor

| Field | Value |
|-------|-------|
| **Focus** | Instagram carousel grid + Разбор agents; CapCut → Reels |
| **Max tickets** | 3 |
| **Status** | **согласовано** |
| **Client verdict** | **согласовано** (2026-09-20) — C-29…C-31 accepted; no open P0/P1 |
| **Depends on** | W-2026-09-20-studio-workspace (согласовано) |
| **Ticket order** | C-29 → C-30 → C-31 |
| **before_sha** | N/A |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-29 | P0 | `tickets/C-29-carousel-grid-mocks/` | 3×7 grid, aspect 3:5, picsum thumbs, Drafts CTA | **done** · ПРИНЯТО |
| C-30 | P0 | `tickets/C-30-competitor-razbor/` | Разбор modal + agent cascade → Drafts | **done** · ПРИНЯТО |
| C-31 | P0 | `tickets/C-31-capcut-reels-only/` | CapCut only reels; competitor → CapCut+ref | **done** · ПРИНЯТО |

## Deployer

- Localhost `:3000` left running (no VPS).
- Smokes: C-29 / C-30 / C-31 GREEN with live BASE_URL.

## Safety

- No DB wipe / migrate reset / Redis wipe / generatedMedia delete.
- Mock images via picsum; no secrets; no force publish.
