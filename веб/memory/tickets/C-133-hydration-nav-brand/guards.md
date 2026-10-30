# Guards — C-133 hydration nav-brand

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | `data-testid="nav-brand"` unconditional on brand wrapper (no `mounted` gate) | `components/shell/SidebarNavigation.tsx` |
| static | `motion.aside` uses `initial={false}` (SSR/CSR parity with `useReducedMotion`) | `components/shell/SidebarNavigation.tsx` |
| static | Brand markup identical SSR+CSR — no `typeof window` branch on brand slot | `components/shell/SidebarNavigation.tsx` |
| localhost | @1440 `/studio`: `[data-testid="nav-brand"]` visible on first paint; console **0** hydration mismatch | Playwright S36 step 3 |
| regression | C-130 emblem swap must not reintroduce conditional testid | Client snapshot |

## Static asserts (grep)

1. `grep 'data-testid="nav-brand"' components/shell/SidebarNavigation.tsx` → **1** hit on wrapper (not inside conditional).
2. `grep mounted components/shell/SidebarNavigation.tsx` → **0** hits on brand block.
3. `grep 'initial={false}' components/shell/SidebarNavigation.tsx` → on `motion.aside`.

## Localhost asserts (Playwright / Client — pending)

1. `navigate` → `http://127.0.0.1:8787/studio`
2. `expect(page.getByTestId('nav-brand')).toBeVisible()` on first snapshot
3. Console: no `Hydration failed` / `Text content does not match` on load

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | `nav-brand` unconditional | **PASS** |
| G2 | `initial={false}` on aside | **PASS** |
| G3 | No mounted-only brand branch | **PASS** |
| G4 | Playwright live @1440 + console | **pending Client** |

## Mirror in Client skill

`| C-133 | nav-brand hydration | nav-brand always SSR+CSR; no mismatch S36 | memory/tickets/C-133-hydration-nav-brand/guards.md |`
