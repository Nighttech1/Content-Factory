# Guards C-73 — chrome + dual cards + instant slides

| ID | Check | Result |
|----|-------|--------|
| G1 | Sidebar: нет «Пайплайны» / «Բարև» | PASS |
| G2 | Settings/Schedule: нет `//` mono eyebrows | PASS |
| G3 | VerticalPostCarousel: `grid-cols-1 lg:grid-cols-2` | PASS |
| G4 | FeedPostCard / RazborSlides: instant swap, no dark scrim | PASS |

Smoke: `npx tsx scripts/smoke-c73-c75-ux-wave3.ts`
