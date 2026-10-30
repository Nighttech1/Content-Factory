# Architect spec — C-design-colors-only (P0)

> Wave: `W-2026-10-13-designer-models-colors-hook`.  
> Chain: `memory/waves/W-2026-10-13-designer-models-colors-hook/chain.md`.  
> Client **S45** colors-only Settings Design.

## Goal

Settings → Дизайн = **только цвета** (palette swatches + Quick Theme Tuner COLORS). Подпись: **«Только цвета — разметку придумает Дизайнер»**. В runtime Designer system inject **только** colors / `--cf-design-*` CSS vars — **layout free**; не ждать layout markup из Settings.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-co-1 Surface** | Keep Embla slots + 3×4:5 sliced mocks + swatches + Quick Theme Tuner color fields. |
| **D-co-2 Hide** | Remove/hide layout markup editors, primitive toggles, dense token forms if present in Settings Design. DESIGN.md floating preview chip may remain read-only — not a layout editor. |
| **D-co-3 Caption** | Section helper text = «Только цвета — разметку придумает Дизайнер» (RU). |
| **D-co-4 Prompt inject** | `formatActivePresetCssVarsForPrompt` / `formatActiveDesignMdForPrompt`: inject **colors + cssVarOverrides + CSS vars only**; strip or de-emphasize `components` / typography / full MD layout instructions. Explicit line: «layout free — invent composition; do NOT wait for layout from Settings». |
| **D-co-5 agent-defaults** | Designer brand lock: colors/CSS vars from active preset — not fonts/spacing tables from Settings. |
| **D-co-6 Razbor freeze** | No `RazborModal.tsx`. |

## In scope

| Path | Owner |
|------|--------|
| `components/settings/SettingsShell.tsx` | Frontend — caption |
| `components/settings/DesignLibraryCarousel.tsx` / `QuickThemeTuner.tsx` | Frontend — hide non-color editors if any |
| `lib/studio/create-carousel-prompts.ts` | AI Bridge — colors-only inject |
| `lib/settings/design-library.ts` | AI Bridge/FE — `formatActiveDesignMdForPrompt` colors-only |
| `lib/mesh/agent-defaults.ts` | AI Bridge — designerUsesDesignMd copy |

## Out of scope

- Rewriting deconstruct pipeline
- Changing Embla ≤10 / persist keys
- VPS

## Acceptance

Settings Design читается как «только цвета». Designer prompt в Create не содержит «жди layout из Settings»; содержит colors/CSS vars + layout-free.
