# Guards — C-design-colors-only

Wave: `W-2026-10-13-designer-models-colors-hook` · Scenario: **S45.A** (Design colors-only)

## Expected behavior

| ID | Expectation |
|----|-------------|
| G1 | Settings Design caption includes «Только цвета — разметку придумает Дизайнер» (`SettingsShell`). |
| G2 | Quick Theme Tuner helper repeats colors-only caption (live CSS, no layout markup editor). |
| G3 | Designer runtime prompts inject colors/CSS vars + «layout free» (`create-carousel-prompts.ts`). |
| G4 | No layout markup / grid builder / drag-layout pane as primary Design editor surface. |

## Commands

```bash
npx tsx scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts
# Expect: Settings + Tuner colors-only caption PASS
```

Live Client: **S45.A** — `/settings` → Дизайн = palette + Tuner colors only.

## Class of defect

Layout markup editor in Settings Design; missing colors-only caption; Designer waits for layout from Settings.
