# C-s50-settings-design — Architect spec

**Priority:** P0 · Wave S50 · UI-only this Frontend pass

## Goal

Settings Design Embla shows **only** Heritage-style BrandbookBoard cards at **3:5** (width:height), clean toolbar, wider page — no MD crumbs / slots counter / colors helper / card-click preview panel.

## Locks

| ID | Lock |
|----|------|
| D-bb-3-5 | Card wrapper `aspect-[3/5]`; layout = colors · type · buttons (same as photo) |
| D-no-crumbs | No markdown / slot.name / sliced / swatches under Embla card |
| D-no-slots | Delete «Слотов: N/10 · активный…» |
| D-toolbar | One row: дизайн.md · референс · новый дизайн+icon · preview icon-only |
| D-pad | Horizontal padding ~75% smaller; wider content band |
| D-no-ctx | Card click = select only; no DesignPreviewPanel open |
| D-no-helper | Delete «Только цвета — разметку…» |

## Paths

- `components/settings/DesignLibraryCarousel.tsx`
- `components/settings/BrandbookBoard.tsx`
- `components/settings/SettingsShell.tsx`
- `components/settings/QuickThemeTuner.tsx` (helper text)

## Acceptance (Client S50.B)

1. Embla slot = brandbook visual only @ 3:5.
2. No MD text under cards; no slots counter.
3. Toolbar one row as specified.
4. Settings content wider; no colors helper; card click does not open preview.
