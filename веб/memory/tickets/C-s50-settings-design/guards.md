# Guards — C-s50-settings-design (S50.B)

## Class of defect

Wrong Design card aspect; raw DESIGN.md crumbs under cards; slots counter; multi-row toolbar; fat side padding; context menu on card click; colors-only helper paragraph.

## Permanent checks

1. Playwright @1440 `/settings` → Дизайн:
   - Brandbook slides use `aspect-[3/5]` (measured width/height ≈ **0.6**).
   - No leftover raw markdown (`## Typography`, fenced ` ``` `, DESIGN.md wall) **under** Embla cards.
   - No «N слотов» / slots counter copy in Design region.
   - Toolbar **one row**: «дизайн.md» · «референс» · «новый дизайн» · preview **icon-only** (`aria-label` «Превью design.md», empty button text).
   - No colors-only helper paragraph under brandbook.
   - Primary click on brandbook card: **no** `[role=menu]` context chrome.
2. Settings content band: reduced horizontal padding (wider than pre-S50) — visual/regression vs `SettingsShell` S50 margin.

## Evidence (2026-10-14)

- `memory/waves/W-2026-10-14-s50-client-ui-live/s50-settings-design-1440.png`
- Measured `aspect-[3/5]` → 368×613 (ratio 0.6)
