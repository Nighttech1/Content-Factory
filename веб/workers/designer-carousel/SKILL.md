# Designer Carousel — Layout & Visual Engine (1080×1350)

## Role

Рендерер **Module 1** (`carousel-engine`) = **Layout & Visual Engine**.  
Вход: JSON Сценариста (`carousel-json-contract`) + **active DesignPreset** / colors (`DESIGN.md` tone OK) + **Settings colors only**.  
Выход: PNG **1080×1350** `slide_01.png`… + Create preview URLs.  

### Panorama → slice canon (HARD — craft)

| Этап | Обязанность |
|------|-------------|
| **1. Draw** | Сначала **горизонтальная панорама** — непрерывный canvas шириной **N × 1080** × **1350** (одна цельная композиция). Стрелки / пар / линии / glow / doodle **могут пересекать** будущие вертикальные разрезы |
| **2. Slice** | Нарезать панораму на **N кадров 4:5** (1080×1350) по границам `0…1080…2160…` |
| **3. Preview / publish** | Create и Settings показывают **только нарезанные** слайды. Панорама = **внутренний master** для bridges, **не** product UI |

**Запрещено:** рисовать N изолированных «открыток» без общей панорамы (bridges ломаются); показывать пользователю uncut panorama как единственный preview.

Brand lock: Settings Embla library slot → `DesignPresetFile` + **colors/CSS vars** (layout invents LLM) → `carouselHtmlBuilder` / image model.

**Default image model (Settings / mesh):** `openai/gpt-5.4-image-2` — см. `.cursor/skills/trainer/llm-model-catalog-notes.md`. Trainer does not edit `lib/`.

## Sprint 9 (upgrade-only)

- Prompts in place: brandbook 3:5 tokens · panorama→slice · anti purple-slop / black success.
- Golden visual bar: `generatedMedia/wave-visual-deconstructor/` + `memory/fixtures/sprint9/carousel/*/NOTES.md`.
- Critic may reject draw JSON before Draft — **не** удаляет Designer из mesh.
- Pipeline stays Scriptwriter → Designer describe→draw → Draft.

## Phase 6 — Correct pipeline (LEGACY type-on-PNG · archaeology)

Kept for explicit `CAROUSEL_PIPELINE=correct` only. **Product = Phase 7.**

## Phase 7 — LAYERED HTML / Layered Visual Engine (HARD · S57 · product)

Canon: `docs/карусель тест/correct/03_designer_prompt.md.txt` + `LAYERED_HTML_DESIGNER_OVERLAY` + `plugins/trainer/carousel-layered-html-pipeline.md`.

| Lock | Rule |
|------|------|
| Role | **Layered Visual Engine** — bg image + invent HTML layout |
| Image | `image_prompt` = **BACKGROUND ONLY** from `visual_prompt` + HARD **NO TEXT NO LOGO** (`appendBackgroundOnlyGuard` / `assertBackgroundOnlyPrompt`) |
| HTML owns | Typography (`primary`/`secondary`), Brand name+logo, CTA **1–4** button on `cta_slide`, Персонажи cut-outs **OVER** bg, fonts×3 from DESIGN.md |
| FORBIDDEN on bg | Letters, logos, watermarks, UI badges, on-slide copy |
| Character | Product default **`in_image`**: character may be painted **in** scene with environment. Legacy/`overlay_cutout`: cut-outs from `{{CHARACTER_CATALOG}}` **HTML over bg** |
| Vision | **OFF** |
| KEEP | Ignore `swipe_trigger`; CTA catalog 1–4 as HTML button |
| Output | bg prompts length-matched → Puppeteer composite → `renderMode: layered_html` @ 1080×1350 |
| Etalon taste | `layered-html-refs-2026-10-17/` esp. **#3** — invent, don't clone |

## When

Router / Create handoff после Script Writer. Статус `RENDERING_MEDIA` или Create «Нарисовать».  
Settings → Design (**S52 STRICT**): horizontal **3:5** token cards = **colors · typography · text-block · small-element** only (Atelier Synth / brandPack). **Запрет** button layout kits + COVER/BODY/CTA sliced layout previews в Settings. Dedup Coffee Doctrine seeds. Agent-start / describe получает **только** эти tokens (+ active preset id) — **не** layout markup. Create/Razbor product preview = sliced 4:5. Prompt bar: `ai-bridge/s50-prompt-hardening.md`. Themes: **no** hardcoded coffee/club-only — random Armenian for test/live.

## Hard gate (обязательно)

1. Handoff JSON валиден: `slides` array, `requested_slide_count === slides.length`.
2. **Active design** доступен (`DesignPresetFile` / colors slot) — иначе FAILED + понятная ошибка.
3. **Dynamic length** — рендер **любого** `slides.length`; запрет hardcoded loop N=5/8.
4. **Panorama-first** — compose continuous strip, **then** slice; bridges align across cuts.
5. **Sliced 4:5 export + preview** — product = `slide_01.png`…; never panorama-only UI.
6. **Role rhythm** — `cover` / `body_slide`×(N−2) / `cta_slide` (см. ниже); роли влияют на layout primitives, не на fixed N.
7. **Layout ownership (S52)** — human Settings = **colors + type + text-block + small-element tokens only**; layout/composition/role kits = Designer LLM (not Settings markup; not sliced COVER/BODY/CTA chrome in prefs).
8. **Themes** — do not bake coffee/club as the only Vernatun topic; rotate **Armenian** cultural themes on live-gen / smoke.

## Types canon (Architect locks names; смысл обязателен)

```ts
// Semantic sketch — Zod/Prisma names = Architect
type ColorTokens = {
  bg: string; surface: string; text: string; muted: string;
  accent: string; accentSoft?: string; danger?: string; success?: string;
  // mapped live → CSS vars --cf-design-*
};

type TypographyTokens = {
  display: string; body: string; mono?: string;
  armenianSafe?: string; // e.g. Noto Sans Armenian
  scale: { cover: number; h2: number; body: number; caption: number };
};

type ComponentPrimitiveConfig = {
  card?: { radius: string; blur?: string; border?: string; glass?: boolean };
  buttonCta?: { radius: string; glow?: boolean; labelWeight?: number };
  checkbox?: { style: "hand" | "ui"; stroke?: string };
  gauge?: { stroke: string; glow?: boolean };
  doodle?: { enabled: boolean; ink?: string };
  markerHighlight?: { color: string; ragged?: boolean };
  logoMark?: "vernatun_pomegranate" | "none" | string;
};

type DesignPresetId =
  | "dark_notes"
  | "bento_glass"
  | "dark_editorial"
  | "bold_poster";

type DesignPresetFile = {
  id: string;           // library slot id
  preset: DesignPresetId;
  name: string;
  designMd: string;     // DESIGN.md body / path
  colors: ColorTokens;
  typography: TypographyTokens;
  components: ComponentPrimitiveConfig;
  /** Live overrides — Frontend Quick Theme Tuner writes these; builder reads CSS vars */
  cssVarOverrides?: Partial<Record<string, string>>;
  referenceImageUrl?: string; // deconstructor source
  version: number;
};
```

| Preset | Look (from product refs) | Primitives |
|--------|--------------------------|------------|
| **`dark_notes`** | Chalkboard / charcoal grid, yellow marker highlights, hand doodles, checklist boxes, coffee steam, **seamless arrows** across cuts, Vernatun pomegranate | marker, doodle, checkbox hand, bridge arrows |
| **`bento_glass`** | Dark charcoal, **glass** cards, bento modules, gold/orange accent glow, timers/metrics | glass card, bento grid, glow |
| **`dark_editorial`** | Photo cover cinematic B/W, telemetry gauges, gold CTA button, editorial type | photo cover, gauge, CTA button |
| **`bold_poster`** | High-contrast poster type, solid blocks, minimal chrome | poster type, solid CTA |

`bento_glass` и `dark_editorial` могут жить в одном слоте как близкая семья (photo cover + glass metrics) — Deconstructor выбирает ближайший preset + overrides.

## N-slides layout rhythm (HARD)

Для `requested_slide_count = N` (≥2):

| Index | `slides[].role` | Layout duty |
|-------|-----------------|-------------|
| 1 | **`cover`** | Hook ≤6–8 words; hero visual / photo or marker title; minimal body |
| 2 … N−1 | **`body_slide`** | Point / proof / metric / doodle checklist; keep swipe_trigger |
| N | **`cta_slide`** | CTA copy + button/checkbox save + Vernatun mark |

Alias ok in JSON: `point`/`proof` → treat as `body_slide`; `cta` → `cta_slide`.  
**Не** фиксировать «всегда 5/8» — только ритм ролей под N.

## Visual Style Deconstructor (vision → library)

**Цель:** картинка-референс (liked carousel / Gemini ref / upload) → **`DesignPresetFile` + `DESIGN.md`** → слот Settings Embla library + `activeId`.

Pipeline (AI Bridge + Backend persist; Frontend upload UI):

1. Accept image (panorama OK as **input only**) **or 4-slide grid** (cover · mid · mid · CTA last).
2. Vision pass: extract palette, type feel, primitives (glass/marker/doodle/gauge/CTA), bridge elements, logo mark.
3. Map → nearest `DesignPresetId` + `ColorTokens` / `TypographyTokens` / `ComponentPrimitiveConfig`.
4. Write `DESIGN.md` (see `create-design-md` § Carousel / Deconstructor mode) + optional HTML companion kit.
5. Append library slot (≤10) → **set current** `activeId`.
6. Settings preview must show **3 sliced 4:5 frames** (cover / body / cta sample), **not** the raw panorama as the only preview.

### Grid deconstruct + layoutMap (HARD · 2026-10-18 layout-copy)

When user uploads **4** ordered refs:

1. Extract **colors + fonts + sizes** as usual → DESIGN.md / preset.
2. Also emit **`layoutMap`**: per-slide `textAnchor`, `numbering` present|absent (+ style/slot), `logoChrome`, `ctaChrome`, plus `numberingGlobal` + short `grammarNote`.
3. Persist `layoutMap` on `DesignPresetFile` / DESIGN.md companion JSON — **not** a human Settings layout markup editor.
4. On draw: Designer/composite **copies** map grammar; invents only content + bg + CTA. If refs have **no** numbers → `numberingGlobal: "absent"` → **omit** slide-num HTML.
5. Wave targets: **3** library slots from grids — real-estate orange · luma coffee · omkopa teal. Etalon copy: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`.

Card: `plugins/trainer/layout-copy-dual-char.md`.

### Vision style-copy (HARD · 2026-10-18-vision-style-copy)

When `styleCopyMode=vision_ref` (user experiment · Variant A):

1. Pass **etalon slide PNG** as **image reference** into Designer/draw (reference-first) — primary style SoT.
2. Prompt: hard-copy composition / zones / hierarchy / logo / CTA / numbering from the picture.
3. **BAN** FULL DESIGN TOKEN CARD / stock Manrope·Cormorant / default `typography.scale` inject on this path.
4. Brand Vernatun = our text + CTA 1–4 (+ optional Settings logo) separately.
5. Bg geometry: **partial/inset** photo OK when etalon shows it — **not** always full-bleed cover.
6. `layoutMap` optional — **do not** require parser fix as sole PASS path.
7. Product default `character_paint=in_image`. Smoke keep: `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` ×6.

Card: `plugins/trainer/vision-style-copy.md`.

### Dual character paint

| Mode | Rule |
|------|------|
| `in_image` | **Product default.** Character allowed **in** image-model scene with environment; HTML still owns type/logo/CTA |
| `overlay_cutout` | **Legacy.** Bg scene **without** character; sheet → HTML cutout OVER bg; conductor **speaks** copy |

Razbor CTA «Добавить новый дизайн» / Settings **Create from reference** = этот же pipeline (+ grid path when 4 files; + vision_ref when mode set).

## Color overrides live (CSS vars)

| Rule | Detail |
|------|--------|
| Source | `DesignPresetFile.colors` + `cssVarOverrides` |
| Apply | `carouselHtmlBuilder` sets `:root` / frame wrapper `--cf-design-bg`, `--cf-design-accent`, `--cf-design-text`, … from active slot |
| Tuner | Settings **Quick Theme Tuner** edits swatches → live CSS vars on **sliced** preview (no full re-deconstruct) |
| Persist | overrides saved on slot; next Create draw reads same vars |
| Forbidden | Hardcoded hex in slide templates ignoring active preset; Tuner that only changes MD text without vars |

## Seamless bridges (cross-cut continuity)

Когда стрелки / пар / линии / glow **пересекают** вертикальный разрез слайдов (как в `dark_notes` yellow arrows 01→02, steam, white arrow 02→03):

| Rule | Detail |
|------|--------|
| Authoring | **Draw on panorama first** — element spans continuous X across cut; slice splits the same pixels |
| Export | Still **separate** PNGs 4:5 — bridge pieces split so when slides sit in a row they align |
| Preview | UI shows **sliced** frames; optional ghost align guide in Settings only — **never** replace product preview with one uncut panorama |
| FAIL | Per-slide isolated cards with fake “half-arrow”; bridges only on uncut master left as sole UI; cut slides lose continuity |

## carouselHtmlBuilder

1. Resolve active `DesignPresetFile` / DESIGN.md.
2. Inject CSS vars from colors + overrides.
3. For each slide: pick layout kit by `role` (`cover` | `body_slide` | `cta_slide`) + preset primitives.
4. HTML/Tailwind frame 1080×1350 + safe-zone; text via HTML fonts; `visual_prompt` → background only.
5. Apply seamless bridge fragments if preset enables doodle/arrows.
6. Export `slide_01.png`…; wire Create preview as **N independent 4:5 tiles** (Embla / strip of frames).

## Inputs

| Вход | Источник |
|------|----------|
| `rawScript.slides[]` + roles / `visual_prompt` / headline / body | Script Writer JSON |
| `requested_slide_count` | User via Scriptwriter |
| **Active DesignPresetFile** | Settings Embla `activeId` |
| Reference image | Deconstructor / Razbor upload |
| `brand-lock.md` | fallback only if library empty |

## Outputs

- `generatedMedia`: PNG **per slide** 1080×1350, ordered
- Create / Settings preview: **sliced** 4:5 frames (never panorama-only)
- Draft card Ours → Черновики (`C-drafts-always`)
- Logs: `activeDesignId`, preset id, layout roles, bridge flags, render ms

## Active design (HARD)

1. Before paint: read **selected** preset + DESIGN.md.
2. Tokens/fonts/colors/primitives = that slot (+ CSS var overrides).
3. Switching Embla / Tuner **must** change next render + live preview without redeploy.
4. Deconstructor path always lands in library slot + set current.

## Canvas / safe-zone (open-carrusel inspired)

| Spec | Value |
|------|-------|
| Size | **1080 × 1350** (4:5) |
| Top | ≥ **120** |
| Bottom | ≥ **160** |
| Sides | ≥ **80** each |

Текст/CTA/лого **внутри** safe-zone. Background / doodle bridges may bleed; readable copy — нет.

## Pipeline

1. Parse `slides[]` of **any** length; normalize roles → cover / body_slide / cta_slide rhythm.
2. Bind CSS vars from active preset.
3. Per slide: HTML/Tailwind frame + role layout + primitives.
4. `visual_prompt` → background; copy via HTML.
5. Seamless bridges if needed.
6. Export ordered PNGs; Create preview = sliced frames.
7. Bubble «готово» **только** с non-empty visible **per-slide** sources.

## Top-tier quality bar (golden refs — HARD)

Канон качества волны Visual Deconstructor = рефы **dark_notes** и **bento_glass / dark_editorial** (план Trainer). Create draw обязан быть **на уровне рефов**, не «примерно похоже».

| Preset | Must-have look |
|--------|----------------|
| **dark_notes** | Charcoal chalkboard + faint grid; **marker-yellow** ragged title blocks; white mono body; hand doodles/stars; checklist boxes; **seamless yellow arrows** across 01→02→03 cuts; Vernatun pomegranate on CTA; Armenian+RU OK |
| **bento_glass / dark_editorial** | Matte black; **glass** cards (`backdrop-blur` + thin border); photo-cover cinematic; telemetry/timers/gauges with **gold/amber** glow; large CTA button «СОХРАНИТЬ…»; Vernatun mark; no flat gray boxes pretending to be glass |

### FAIL — non-premium / wrong product shape

| FAIL | Why |
|------|-----|
| Product preview = **panorama-only** (one wide JPG) | User must see **sliced 4:5**; panorama = **draw master** + Deconstructor input — not sole UI |
| Draw = N isolated cards, no shared panorama | Bridges cannot cross cuts; craft FAIL |
| Flat stock template / Inter-only / purple glow AI slop | Not Vernatun; not matching refs |
| Missing role rhythm (no cover hook / no CTA save) | Marketing-save fail |
| dark_notes without marker **or** seamless bridges | Below golden |
| bento/editorial without glass **or** gold CTA | Below golden |
| Text outside safe-zone / cropped Armenian glyphs | QA reject |
| «Готово» with black / empty / wrong-count frames | P0 |
| Settings layout markup editor driving composition | Colors-only Settings; **LLM invents layout** |

Budget wave: **≤40 PNG** generations. Prefer Settings mock = CSS 3×4:5 (0–few LLM images); burn budget on Create draw for Client S44. If quality still below ref at 40 → **STOP** + report (no more gen).

## Create-carousel prompts canon (AI Bridge wire)

AI Bridge **must** upgrade `lib/studio/create-carousel-prompts.ts` (+ Designer system overlay) to encode:

1. Active `DesignPresetFile` / **colors + CSS vars** (`--cf-design-*`) before paint. Settings has **no layout markup** — prompt must tell model to **invent layout**.
2. Role kits: `cover` | `body_slide` | `cta_slide` — not fixed N templates.
3. **Panorama → slice (verbatim intent):**  
   - «Сначала нарисуй **одну горизонтальную панораму** (N×1080)×1350 как непрерывную сцену.»  
   - «Элементы (стрелки, пар, линии, glow) **могут пересекать** будущие разрезы.»  
   - «Затем **нарежь** на N слайдов 4:5 (1080×1350).»  
   - «В продукт / Create preview отдавай **только нарезанные** кадры — не одну панораму как UI.»
4. Default image model note: prefer Settings Designer = `openai/gpt-5.4-image-2` (catalog notes).
5. Preset primitive keywords: marker/doodle/checkbox/bridge **or** glass/bento/telemetry/gold-CTA.
6. Fail phrases: «изолированные открытки без панорамы», «панорама вместо нарезки в UI», «нет cover/body/cta», «flat mock», «layout editor в Settings».
7. Append active DESIGN.md / colors via `appendActiveDesignMdToDesignerPrompt` / `resolveDesignerSystemWithActiveDesign` — keep; extend with preset id + cssVarOverrides JSON.

Trainer does **not** edit `create-carousel-prompts.ts` — AI Bridge does in chain.

## P0 — black preview / panorama mistake

| FAIL | Canon |
|------|--------|
| «Готово» + чёрный preview | Wire FE `C-carousel-preview-black` |
| Preview = one wide panorama JPG only | Must show **нарезанные** 4:5 slides |
| Text-only «готово» | AI Bridge: artifact URLs length-matched to `slides[]` |
| Draw quality ≪ golden refs | Client **S44** REJECT; strengthen prompts/primitives, do not burn past 40 PNG |

## Practical skills

1. Parse JSON + roles before paint.
2. Preset primitives > freestyle mid-job.
3. Satori/Puppeteer / HTML discipline — template per preset+role.
4. Reroll one slide — same template/vars.
5. Overflow — shorten via Script/HITL; keep safe-zone.
6. Parity — margins/fonts/colors slide 1 vs N; bridge alignment check.

## Rules

- Не публиковать; после рендера → HITL / Publication.
- Не менять brandbook mid-render.
- UI Studio chrome tokens ≠ slide tokens without MD/preset write.
- Не хардкодить N; не подменять sliced preview панорамой.
- Секреты vision/LLM не в logs.

## Done when

Все слайды в `generatedMedia` как **отдельные** 4:5, preview нарезан, active preset+CSS vars applied, bridges align when placed in a row, draft в Черновиках, lock + safe-zone ok.

## Related

- `carousel-json-contract`, `create-design-md` (Deconstructor), `design-system` (DesignPresetFile), `content-factory-ui` (Settings Design renov), Client **S44**
