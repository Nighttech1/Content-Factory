# Guards — C-131 carousel crossfade (no black flash)

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Carousel surfaces use `data-carousel-crossfade` + `AnimatePresence mode="sync"` (overlap) | FeedPostCard, DraftsPanel, CreateCarouselModal, RazborSlidesCarousel |
| static | **Ban** `mode="wait"` on slide swap paths (unmount gap → black flash) | same files — carousel blocks only |
| static | `data-testid="feed-slide-crossfade"` on feed carousel wrapper | `FeedPostCard.tsx` |
| localhost | L/R click: smooth crossfade, **no** black frame between slides | Playwright S38 step 1 |
| regression | Play/pause icon swap may use `mode="wait"` — out of scope (not slide media) | FeedPostCard play button |

## Static asserts (grep)

1. `grep data-carousel-crossfade components/studio` → 4 files (FeedPostCard, DraftsPanel, CreateCarouselModal, RazborSlidesCarousel).
2. Carousel blocks: `mode="sync"` on `AnimatePresence` wrapping slide `motion.img`.
3. FeedPostCard carousel section (lines ~182–215): **no** `mode="wait"`.

## Localhost asserts (Playwright / Client — pending)

1. `navigate` → `http://127.0.0.1:8787/studio/carousel-engine`
2. Multi-slide card: click `[data-testid="feed-slide-next"]` twice — no full black frame between slides
3. Razbor carousel (S38): same crossfade on L/R

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | `data-carousel-crossfade` on 4 surfaces | **PASS** |
| G2 | Slide swap uses `mode="sync"` | **PASS** |
| G3 | No `mode="wait"` in carousel slide path | **PASS** |
| G4 | Playwright live crossfade visual | **pending Client** |

## Mirror in Client skill

`| C-131 | carousel crossfade | data-carousel-crossfade mode=sync; no black flash S38 | memory/tickets/C-131-carousel-crossfade/guards.md |`
