# AI Bridge contract — C-design-slot-sliced-preview (shared types)

> Frontend owns Embla UI / Tuner. AI Bridge provides typed slot + CSS var helpers only.

## Consume

| Symbol | Path |
|--------|------|
| `DesignLibrarySlot.presetFile` / `colors` / `cssVarOverrides` | `lib/settings/design-library.ts` |
| `resolveSlotPresetFile`, `resolveActiveDesignPreset`, `seedFactoryDesignPresets` | same |
| `designPresetToCssVars`, golden seeds | `lib/settings/design-preset.ts` |
| Deconstruct response | see `C-visual-style-deconstructor/ai-bridge.md` |

## Notes

- Settings preview mocks = CSS 3×4:5 from preset colors (0 PNG preferred).  
- Tuner writes `cssVarOverrides` on slot / presetFile.  
- **Out of AI Bridge scope:** Embla chrome, DesignSlotManager, RazborModal.
