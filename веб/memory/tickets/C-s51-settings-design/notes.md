# C-s51-settings-design — Frontend notes

| Field | Value |
|-------|-------|
| **ID** | `C-s51-settings-design` |
| **Priority** | P0 |
| **Status** | FE done (await Tester/Client) |

## Done

1. All Design actions in **top-right** of «Дизайн» (`design-header-row`).
2. Removed standalone «Превью design.md» toggle (`DesignPreviewPanel showToggle={false}`).
3. Eye control labeled **«код дизайн мд»** → opens MD panel.
4. BrandbookBoard: tighter compact padding / denser tiles (less empty bottom).
5. Active card: **blue neon** perimeter glow (not gold).
6. Card click = **select only**; no QuickThemeTuner / context / edit popup; `onContextMenu` prevented.

## Files

- `components/settings/DesignLibraryCarousel.tsx`
- `components/settings/BrandbookBoard.tsx`
- `components/settings/SettingsShell.tsx`
- `components/settings/DesignPreviewPanel.tsx`
