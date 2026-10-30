# Architect spec — C-carousel-css-vars-builder (P0/P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-visual-deconstructor`.  
> Shared chain: `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`.  
> Canon: `workers/designer-carousel` § carouselHtmlBuilder, `carousel-json-contract`, `design-system` CSS vars, Client **S44.B**.  
> Evolves **C-carousel-html-designer** / `lib/studio/carousel-html-renderer.ts`.

## Goal

Evolve **`carousel-html-renderer`** into **`carouselHtmlBuilder`** (alias export OK): inject **`--cf-design-*`** from active `DesignPresetFile` + Tuner overrides; pick **role kits** `cover` | `body_slide` | `cta_slide`; export **sliced** 4:5 PNG frames (not panorama). Seamless bridge fragments when preset enables doodle/arrows. Hard cap wave **≤40 PNG** — copy delivers to `generatedMedia/wave-visual-deconstructor/`.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-cb-1 Evolve in place** | Primary path: `lib/studio/carousel-html-renderer.ts`. Export alias **`carouselHtmlBuilder`** (and/or rename with re-export from old name for callers). Do not fork a second dead renderer. |
| **D-cb-2 CSS vars first** | Before paint: resolve active slot → set frame wrapper / `:root` vars from `colors` + `cssVarOverrides`. **Forbidden:** hardcoded hex in templates ignoring active preset. |
| **D-cb-3 Role kits** | For each `slides[i].role` (or alias `point`/`proof`→body, `cta`→cta_slide): apply kit **cover** / **body_slide** / **cta_slide**. Rhythm for N≥2: index 1 cover, 2…N−1 body, N cta. |
| **D-cb-4 Preset primitives** | Kits respect `DesignPresetFile.components` (marker/doodle/glass/gauge/CTA glow). Seeds dark_notes / bento_glass must be expressible. |
| **D-cb-5 Sliced export** | Output `slide_01.png`…`slide_N.png` at 4:5 (1080×1350 canon). Create preview = **N independent tiles**. **Never** ship uncut panorama as product preview. |
| **D-cb-6 Seamless bridges** | Optional: split bridge art across adjacent slides so row-align works; still separate PNGs. FAIL if continuity only on panorama master. |
| **D-cb-7 Safe-zone** | Keep existing safe-zone rules (e.g. 120/160/80 from C-carousel-html-designer) unless Architect mid-flight changes. |
| **D-cb-8 Budget** | Count PNG generations toward **`png_budget_max: 40`**. At limit → STOP + report; no silent overspend. |
| **D-cb-9 Artifacts** | Deployer/Client copy sliced PNGs to `generatedMedia/wave-visual-deconstructor/{presetId}/`. |
| **D-cb-10 Active design** | Resolve via `cf.settings.design.activeId` + library `presetFile`+markdown — same as deconstructor ticket. |

## In scope

| Path | Owner |
|------|--------|
| `lib/studio/carousel-html-renderer.ts` → `carouselHtmlBuilder` | Backend (primary) + FE callers |
| Call sites: generate-slides / Designer draw / Create preview bind | Backend + Frontend 3b |
| Role kit templates (HTML/CSS) | Backend / shared lib |
| Budget counter helper (optional) | Backend or FE draw path |
| Artifact copy script/note | Deployer |

## Out of scope

- Settings Embla UI chrome (C-design-slot-sliced-preview)
- Vision deconstruct implementation (C-visual-style-deconstructor)
- Reels scriptwriter
- Changing carousel **Scriptwriter JSON** Dramaturgy contract (roles may be consumed; JSON schema stays `carousel-json-contract`)
- RazborModal
- Prod/VPS

## Layers / owners

| Layer | Role | Wave step |
|-------|------|-----------|
| Prompts: sliced-only + CSS vars + role kits | AI Bridge | 1 |
| Builder evolve + server draw | **Backend** | **2** |
| Create preview bind N×4:5 | **Frontend** | **3b** |
| Copy PNGs + localhost | Deployer | 6 |
| QA vs golden | Tester → Client **S44.B** | 4–7 |

## Contracts

```ts
type CarouselSlideRole = "cover" | "body_slide" | "cta_slide";

type CarouselHtmlBuilderInput = {
  slides: Array<{
    role?: CarouselSlideRole | "point" | "proof" | "cta" | string;
    headline?: string;
    body?: string;
    visual_prompt?: string;
    // …existing carousel JSON fields
  }>;
  preset: DesignPresetFile;
  designMd?: string;
  /** Already merged cssVarOverrides preferred */
  cssVars?: Partial<Record<string, string>>;
};

type CarouselHtmlBuilderOutput = {
  frames: Array<{
    index: number; // 1-based
    role: CarouselSlideRole;
    html: string;
    pngPath?: string;
  }>;
  cssVarsApplied: Record<string, string>;
};
```

### CSS var mapping (must)

| Token | CSS var |
|-------|---------|
| colors.bg | `--cf-design-bg` |
| colors.accent | `--cf-design-accent` |
| colors.text | `--cf-design-text` |
| colors.surface | `--cf-design-surface` |
| colors.muted | `--cf-design-muted` |

### Builder algorithm

1. Resolve active `DesignPresetFile` + DESIGN.md.
2. Inject CSS vars (colors + overrides).
3. Normalize roles for N slides.
4. Per slide: kit by role + preset primitives; HTML fonts for text; `visual_prompt` → background only.
5. Optional seamless bridge fragments.
6. Export sliced PNGs; wire Create preview as N tiles.
7. Increment budget; if ≥40 → stop further gens + surface report.

## Acceptance criteria (язык Клиента / S44.B)

1. Create → active **dark_notes** → draw → preview = **N×4:5** sliced, not black, not panorama.
2. Visual vs ref: marker/doodle/checklist/bridges **or** equivalent preset primitives visible.
3. Repeat budget-permitting with **bento_glass**: glass and/or gold CTA visible.
4. Artifacts linked under `generatedMedia/wave-visual-deconstructor/`.
5. Budget ≤40 or stop-report present.

## Risks

- Dual renderers diverge → force alias + deprecate old paint path.
- Ignoring Tuner overrides → Settings live preview ≠ Create draw.
- Burning PNG on Settings mocks → use CSS only there.

## Mid-flight escalation

If Puppeteer/playwright render path needs new worker queue — Architect → Backend BullMQ note; still no DROP; still sliced 4:5.
