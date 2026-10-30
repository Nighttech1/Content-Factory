# Frontend report — useful-smoke 51/1/17

**Дата:** 2026-10-17  
**Роль:** Frontend  
**shell_freeze:** AppShell / Sidebar / nav IA — **не трогались**

## Plan → Act

1. Rename UI «Пейзажи» → «Персонажи» in Settings chrome.
2. Cap Brand + Персонажи form stacks at `max-w-[50%]`.
3. Keep API `/api/settings/landscapes` + `data-testid=settings-landscapes-*` stable.

## Changes

| File | What |
|------|------|
| `SettingsQuickNav.tsx` | TOC label **Персонажи** (id `settings-landscapes` kept) |
| `LandscapesPanel.tsx` | Heading **Персонажи**; load error «персонажей»; content wrap `w-full min-w-[min(100%,18rem)] max-w-[50%]` |
| `BrandPanel.tsx` | Same half-width wrapper around heading + fields |
| `SettingsShell.tsx` | Page subtitle «персонажи»; comment-only S56 note |

## Kept

- Route `/api/settings/landscapes`
- Component file `LandscapesPanel.tsx`
- Section id / testids `settings-landscapes-*`

## Out of scope (as locked)

- AppShell / Sidebar
- Design brandbook grid
- Publicist panel width
- Intake / prompts

## Verify

Settings → TOC shows **Персонажи**; Brand + Персонажи panels ≤ ~half content column; zero product chrome «Пейзажи».

`🎨 **FRONTEND:** Settings rename+half-width done; next Backend+AI Bridge.`
