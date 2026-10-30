# AI Bridge contract — C-carousel-css-vars-builder

> For **Backend** `carouselHtmlBuilder` evolve + FE Create bind. AI Bridge owns prompts; Backend owns HTML paint.

## Prompt / helper exports

| Symbol | Path | Use |
|--------|------|-----|
| `CREATE_CAROUSEL_DESIGNER_DRAW_OVERLAY` | `lib/studio/create-carousel-prompts.ts` | Role kits + CSS vars + sliced-only + FAIL + budget ≤40 |
| `formatActivePresetCssVarsForPrompt` | same | Inject `--cf-design-*` block into Designer system |
| `appendActiveDesignMdToDesignerPrompt(base, design, presetFile?)` | same | DESIGN.md + preset JSON + CSS vars |
| `resolveDesignerSystemWithActiveDesign(mode, md, { presetFile, … })` | same | Full Designer agent-start / draw system |
| `designPresetToCssVars` / `CF_DESIGN_CSS_VARS` | `lib/settings/design-preset.ts` | Builder `:root` map |
| `toCarouselStylePreset` / `normalizeCarouselSlideRole` | `types/design.ts` | Role rhythm cover/body/cta |
| `PNG_BUDGET_MAX` (=40) | `lib/settings/design-preset.ts` | Hard stop gate |

## CSS var mapping (must)

| Token | CSS var |
|-------|---------|
| colors.bg | `--cf-design-bg` |
| colors.surface | `--cf-design-surface` |
| colors.text | `--cf-design-text` |
| colors.muted | `--cf-design-muted` |
| colors.accent | `--cf-design-accent` |
| colors.accentSoft | `--cf-design-accent-soft` |

Overrides: `presetFile.cssVarOverrides` / slot `cssVarOverrides` win.

## Role kits (prompt + builder)

- `cover` | `body_slide` | `cta_slide`
- Aliases: `point`/`proof` → body; `cta` → cta_slide
- Rhythm N≥2: index1 cover, 2…N−1 body, N cta
- Primitives from `DesignPresetFile.components` incl. **seamlessConnector**

## Forbidden in prompts / builder

- Hardcoded hex ignoring active preset  
- Panorama JPG as product preview  
- Fixed N=5/8 templates  

## Verify

1. Designer draw system contains `--cf-design-` and «нарезанные» / sliced.  
2. With active dark_notes preset, prompt lists marker/doodle/seamless.  
3. Budget phrase references ≤40 PNG.
