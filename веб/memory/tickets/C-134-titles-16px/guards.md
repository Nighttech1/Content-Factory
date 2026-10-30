# Guards — C-134 system / Razbor titles Century Gothic white 16px

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | Token `.cf-system-title`: `--font-century-gothic` / `--font-ui`, `#ffffff`, `16px`, `font-weight: 600` | `app/globals.css` |
| static | Razbor eyebrow + modal title use `cf-system-title` | `components/studio/workspace/RazborModal.tsx` |
| static | Razbor source pane title uses `cf-system-title` | `RazborModal.tsx` (`razbor-pane-source-title` section) |
| localhost | Razbor open: system titles 16px white CG | Playwright S36 step 5 |
| regression | Feed meta stays 12px (C-132) — no `cf-system-title` on card captions | grep FeedPostCard |

## Static asserts (grep)

1. `grep '.cf-system-title' app/globals.css` → `font-size: 16px`, `color: #ffffff`.
2. `grep cf-system-title components/studio/workspace/RazborModal.tsx` → eyebrow + title + source pane.
3. `grep cf-system-title components/studio/workspace/FeedPostCard.tsx` → **0** hits.

## Localhost asserts (Playwright / Client — pending)

1. Open Razbor on `/studio/carousel-engine` (competitor card)
2. `[data-testid="razbor-system-eyebrow"]` + `#razbor-modal-title`: computed `font-size: 16px`, white

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | `.cf-system-title` token 16px white | **PASS** |
| G2 | RazborModal applies class | **PASS** |
| G3 | No 16px token on feed meta | **PASS** |
| G4 | Playwright live @1440 | **pending Client** |

## Mirror in Client skill

`| C-134 | system titles 16px | cf-system-title CG white 16px Razbor | memory/tickets/C-134-titles-16px/guards.md |`
