# Guards — C-132 card meta Century Gothic white 12px

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Token `.cf-card-meta`: `--font-ui`, `#fff`, `12px` | `app/globals.css` |
| static | Feed card title / @username / metrics use `cf-card-meta` | `components/studio/workspace/FeedPostCard.tsx` |
| static | Draft card titles use `cf-card-meta` | `components/studio/workspace/DraftsPanel.tsx` |
| localhost | @1440 `/studio/[moduleId]`: card meta computed 12px white CG on Наши/Конкуренты | Playwright S36 step 5 |
| regression | System titles remain 16px (C-134 `.cf-system-title`) — no mix-up | grep |

## Static asserts (grep)

1. `grep '.cf-card-meta' app/globals.css` → font-family `--font-ui`, color `#fff`, font-size `12px`.
2. `grep cf-card-meta components/studio/workspace/FeedPostCard.tsx` → ≥3 class usages (title, username, metrics).
3. `grep cf-card-meta components/studio/workspace/DraftsPanel.tsx` → draft title.

## Localhost asserts (Playwright / Client — pending)

1. `navigate` → `http://127.0.0.1:8787/studio/carousel-engine`
2. First feed card meta: `font-size: 12px`, `color: rgb(255, 255, 255)` (or `#fff`)
3. Font family includes Century Gothic / `--font-ui`

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | `.cf-card-meta` token 12px white | **PASS** |
| G2 | FeedPostCard applies class | **PASS** |
| G3 | DraftsPanel applies class | **PASS** |
| G4 | Playwright live @1440 typography | **pending Client** |

## Mirror in Client skill

`| C-132 | feed card meta 12px | cf-card-meta CG white 12px all modules | memory/tickets/C-132-card-meta-12px/guards.md |`
