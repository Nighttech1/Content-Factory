# Status — C-130 emblem brand

## Frontend [x] — 2026-10-10

- Copied user emblem → `public/brand/vernatun-emblem.png` (58381 bytes).
- Sidebar: circle `img` `/brand/vernatun-emblem.png` + `object-cover` + `rounded-full`; text VERNATUN / ARMENIAN CLUB to the right (`flex-row`).
- Kept C-133 `data-testid="nav-brand"` always on wrapper.

**Files:** `public/brand/vernatun-emblem.png`, `components/shell/SidebarNavigation.tsx`  
## Tester [x] — 2026-10-10

- Static PASS: `vernatun-emblem.png` + sidebar flex-row emblem; guards.md written.
- Playwright @1440 brand row → **pending Client** (S36).

**Next:** Client S36 → Fixer if red.
