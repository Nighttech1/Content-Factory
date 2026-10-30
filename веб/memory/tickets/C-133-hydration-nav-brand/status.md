# Status — C-133 hydration nav-brand

## Frontend [x] — 2026-10-10

- `data-testid="nav-brand"` always on brand wrapper (SSR + CSR, no mounted gate).
- `motion.aside` uses `initial={false}` so `useReducedMotion` cannot diverge SSR/CSR markup.
- Role switcher remains static structure (no window-only branch).

**Files:** `components/shell/SidebarNavigation.tsx`  
## Tester [x] — 2026-10-10

- Static PASS: `nav-brand` unconditional; `initial={false}`; guards.md written.
- Playwright @1440 + hydration console → **pending Client** (S36).

**Next:** Client S36 → Fixer if red.
