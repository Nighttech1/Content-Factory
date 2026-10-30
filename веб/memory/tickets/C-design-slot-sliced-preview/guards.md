# Guards — C-design-slot-sliced-preview

Wave: `W-2026-10-13-visual-deconstructor` · Scenario: **S44.A** (Embla 3×4:5)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Embla slot primary preview = **`SlicedSlotPreview`** — three frames cover / body / cta, aspect **4:5**. |
| G2 | **Forbidden:** panorama / single wide ref as **sole** slot preview. |
| G3 | `QuickThemeTuner` writes `presetFile.cssVarOverrides` for `--cf-design-bg` / `--cf-design-accent` (and ideally text/surface/muted) and rebinds live on sliced frames. |
| G4 | CSS var names: `--cf-design-bg`, `--cf-design-accent`, `--cf-design-text`, `--cf-design-surface`, `--cf-design-muted`. |
| G5 | Visible CTA «Создать из референса» (and/or «Добавить новый дизайн») in Design library chrome. |
| G6 | DESIGN.md chip + Close preview parity kept (S43). |
| G7 | Library ≤10; persist keys unchanged. |
| G8 | **Razbor freeze**. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
# Expect: SMOKE_W_2026_10_13_VISUAL_DECONSTRUCTOR_OK
```

Live Client: **S44.A** Playwright @1440 — Settings → Дизайн → 3×4:5 + Tuner swatch change visible.

## Class of defect

Panorama-only Embla preview; Tuner edits MD prose only (no CSS vars); missing create-from-ref CTA; 3 frames not 4:5.
