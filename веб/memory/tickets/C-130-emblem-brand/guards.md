# Guards — C-130 emblem-only brand (supersedes C-122 PNG path)

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Asset `public/brand/vernatun-emblem.png` exists (circle emblem, no baked wordmark) | `public/brand/` |
| static | Sidebar brand = `flex-row`; `img[src="/brand/vernatun-emblem.png"]` + `rounded-full` | `components/shell/SidebarNavigation.tsx` |
| static | Text **VERNATUN** + **ARMENIAN CLUB** to the right of emblem (not under) | `components/shell/SidebarNavigation.tsx` |
| static | `data-testid="nav-brand"` preserved (C-133) | same |
| localhost | @1440 `/studio`: emblem circle-only left; text right; no baked wordmark in PNG | Playwright S36 step 1 |
| regression | No primary «Content Factory» / «VERN·ATUN» in brand slot | Client snapshot |

## Static asserts (grep)

1. `grep vernatun-emblem components/shell/SidebarNavigation.tsx` → img src `/brand/vernatun-emblem.png`.
2. `Test-Path public/brand/vernatun-emblem.png` → **True** (58381 bytes).
3. Brand wrapper `flex-row` + `rounded-full` on img.

## Localhost asserts (Playwright / Client — pending)

1. `navigate` → `http://127.0.0.1:8787/studio`
2. `expect(page.getByTestId('nav-brand')).toBeVisible()`
3. `expect(page.getByTestId('nav-brand').locator('img')).toHaveAttribute('src', /vernatun-emblem\.png/)`
4. `expect(page.getByTestId('nav-brand')).toContainText('VERNATUN')`
5. `expect(page.getByTestId('nav-brand')).toContainText('ARMENIAN CLUB')`
6. Logo bbox left < text bbox left (horizontal row)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | `vernatun-emblem.png` on disk | **PASS** |
| G2 | Sidebar uses emblem + flex-row | **PASS** |
| G3 | VERNATUN / ARMENIAN CLUB copy | **PASS** |
| G4 | Playwright live @1440 | **pending Client** |

## Mirror in Client skill

`| C-130 | emblem-only brand | nav-brand circle emblem + text right | memory/tickets/C-130-emblem-brand/guards.md |`
