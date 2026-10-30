# Guards — C-visual-style-deconstructor

Wave: `W-2026-10-13-visual-deconstructor` · Scenario: **S44.A/B** (deconstruct + seeds)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | `DesignPresetFile` type + helpers in `types/design.ts` / `lib/settings/design-preset.ts` (`colors`, `typography`, `components`, `cssVarOverrides?`, `version`). |
| G2 | Seeds `seed-dark-notes` + `seed-bento-glass` via `createDarkNotesSeedPreset` / `createBentoGlassSeedPreset` (or `FACTORY_SEED_PRESETS`). |
| G3 | `deconstructStyle` (studio) + agents parse/mock; soft-fail → mock seed-shaped, **never** wipe library. |
| G4 | POST `/api/settings/design-deconstruct` exists; returns `{ presetFile, markdown, source }`. |
| G5 | Persist keys unchanged: `cf.settings.design.library.v1` + `cf.settings.design.activeId`. |
| G6 | Empty library seed path `seedFactoryDesignPresets` in `design-library.ts`. |
| G7 | **Razbor freeze** — no product edits required to `RazborModal.tsx` for this ticket. |
| G8 | PNG budget max **40** (`PNG_BUDGET_MAX`). |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
# Expect: SMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK
```

Live Client: **S44.A** — Settings → «Создать из референса» → library append + active.

## Class of defect

Missing seeds/ids; deconstruct hard-fail wiping library; renamed persist keys; RazborModal edits; missing DesignPresetFile fields.
