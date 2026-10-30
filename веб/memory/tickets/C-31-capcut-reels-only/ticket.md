# C-31 — CapCut editor only for Reels; competitor opens CapCut

| Field | Value |
|-------|-------|
| **ID** | `C-31` |
| **Priority** | P0 |
| **Area** | studio / reels / editor |
| **Wave** | W-2026-09-20-carousel-razbor |
| **Status** | specced |

## Expected

1. CapCut-like editor (`/studio/[moduleId]/edit/...`) is for **reels modules** only (`cartoon-reels`, `heygen-reels`). Carousel-engine must **not** open CapCut for draft/competitor — uses C-30 Разбор instead.
2. On reels pages: fill Ours/Competitors with mock thumbs (same grid polish as C-29 if shared component, or reels-appropriate 9:16).
3. Opening a **competitor** on reels opens the CapCut editor window (prefilled with competitor mock as reference), not the carousel Разбор modal.

## Notes

Зона: Frontend primarily; gate by `outputFormat` / moduleId. Keep inspect HITL intact.
