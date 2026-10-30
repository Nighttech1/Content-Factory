# Frontend decisions — C-design-slot-sliced-preview

| Decision | Detail |
|----------|--------|
| 21st id=5402 · element=slot swatches / Tuner palette · motion=yes | Color Palette Card hover-expand adapted to Vernatun; clickable surface/accent/text |
| 21st id=813 · element=Embla library · motion=yes | Existing carousel kept; slide hosts triple 4:5 strip (not single panorama) |
| Modal Tuner | framer-motion spring `{ damping:25, stiffness:300 }` (DesignPreviewPanel parity); further 21st modal get_component skipped — quota 0 |
| Seeds on empty | `seedFactoryDesignPresets()` → dark_notes + bento_glass before any MD fallback |
| Deconstruct CTA | Both «Создать из референса» and «Добавить новый дизайн» → `POST /api/settings/design-deconstruct` + `presetFile` |
| Create wire | `agent-chat-client` sends `activeDesignPresetFile`; route + agent-start-bundle inject CSS vars into Designer system |
| Close HARD | `DesignPreviewPanel` untouched (S43 Close outside pointer capture) |

## Verify Settings

1. Clear `localStorage` key `cf.settings.design.library.v1` (optional) → reload `/settings`
2. Expect two seeded slots (Dark Notes, Bento Glass) with **three** 4:5 frames each
3. Click swatch / Tuner → change accent → frames update live → Save → reload still shows override
4. Chip DESIGN.md opens floating preview; Close still works
5. Upload image via «Создать из референса» → new slot with sliced mocks (cap 10)
