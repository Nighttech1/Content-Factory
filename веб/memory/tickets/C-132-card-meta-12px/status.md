# Status — C-132 card meta 12px

## Frontend [x] — 2026-10-10

- Shared utility `.cf-card-meta` → Century Gothic via `--font-ui`, white `#fff`, `12px`.
- Applied on `FeedPostCard` title / @username / metrics (all modules via `VerticalPostCarousel`).
- Draft card titles use the same class.
- No new font stack: `--font-ui` already Century Gothic in `globals.css` (C-26).

**Files:** `app/globals.css`, `components/studio/workspace/FeedPostCard.tsx`, `components/studio/workspace/DraftsPanel.tsx`  
## Tester [x] — 2026-10-10

- Static PASS: `.cf-card-meta` token + FeedPostCard/DraftsPanel; guards.md written.
- Playwright @1440 computed 12px → **pending Client** (S36).

**Next:** Client S36 → Fixer if red.
