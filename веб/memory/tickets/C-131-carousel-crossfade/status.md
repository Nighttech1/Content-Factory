# Status — C-131 carousel crossfade

## Frontend [x] — 2026-10-10

- Replaced hard-cut / `mode="wait"` slide swaps with overlapping opacity crossfade (`AnimatePresence mode="sync"`).
- Hooks for Motion: `data-carousel-crossfade`, `SLIDE_CROSSFADE`, reduced-motion = single img swap (no empty frame).
- Surfaces: `FeedPostCard`, `DraftsPanel`, `CreateCarouselModal`, `RazborSlidesCarousel`.
- Smoke C-73 slide assertions updated to C-131 canon.

**Files:** `FeedPostCard.tsx`, `DraftsPanel.tsx`, `CreateCarouselModal.tsx`, `RazborSlidesCarousel.tsx`, `scripts/smoke-c73-c75-ux-wave3.ts`

## Motion [x] — 2026-10-10

- Polish: enter **160ms** / exit **120ms**, ease `[0.23, 1, 0.32, 1]` (no ease-in).
- Kept `mode="sync"` + absolute overlap; no black flash / no `mode="wait"`.
- `useReducedMotion` → instant cut (single img), unchanged.

## Tester [x] — 2026-10-10

- Static PASS: `data-carousel-crossfade` + `mode="sync"` on 4 surfaces; guards.md written.
- Playwright crossfade visual → **pending Client** (S38).

**Next:** Client S38 → Fixer if red.
