# Guards — C-122

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | `nav-brand` = `flex-row`; PNG `/brand/vernatun-logo.png` exists; text VERNATUN + ARMENIAN CLUB | `components/shell/SidebarNavigation.tsx`, `public/brand/vernatun-logo.png` |
| localhost | @1440 `/studio`: `[data-testid="nav-brand"]` visible; `img[src="/brand/vernatun-logo.png"]`; primary **VERNATUN**; secondary **ARMENIAN CLUB** справа от PNG (не под эмблемой) | Playwright S32 |
| regression | Нет «VERN·ATUN» / «Content Factory» как primary brand в brand slot | Client snapshot |

## Localhost asserts (Playwright / Client)

1. `navigate` → `http://127.0.0.1:8787/studio`
2. `expect(page.getByTestId('nav-brand')).toBeVisible()`
3. `expect(page.getByTestId('nav-brand').locator('img')).toHaveAttribute('src', /vernatun-logo\.png/)`
4. `expect(page.getByTestId('nav-brand')).toContainText('VERNATUN')`
5. `expect(page.getByTestId('nav-brand')).toContainText('ARMENIAN CLUB')`
6. Brand row horizontal: logo bbox left < text bbox left (не vertical stack logo→name)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | PNG asset on disk | PASS |
| G2 | `nav-brand` + horizontal flex-row | PASS |
| G3 | VERNATUN / ARMENIAN CLUB copy | PASS |
| G4 | Playwright live @1440 | pending Client |

## Mirror in Client skill

`| C-122 | sidebar text-only brand | nav-brand PNG+VERNATUN horizontal | memory/tickets/C-122-brand-logo/guards.md |`
