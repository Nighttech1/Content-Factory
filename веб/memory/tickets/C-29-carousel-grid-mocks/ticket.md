# C-29 — Carousel feed grid 3×7 + mock images + Drafts

| Field | Value |
|-------|-------|
| **ID** | `C-29` |
| **Priority** | P0 |
| **Area** | studio / carousel-engine |
| **Wave** | W-2026-09-20-carousel-razbor |
| **Status** | `Done` |

## Expected

On `/studio/carousel-engine` (Ours + Competitors blocks):
1. Cards in a **CSS grid: 3 columns**, **7 rows** (21 cards visible / scrollable if needed).
2. Card aspect ratio **3:5**.
3. Real **mock photos** via stable image URLs (picsum.photos / images.unsplash.com) — not empty gradients only.
4. **Ours** header: button **«Черновики»** top-right (panel/list can be stub wired for C-30 drafts store).

## Notes

Зона: Backend (expand fixtures to 21+21 with thumbUrls) → Frontend → Motion light.


