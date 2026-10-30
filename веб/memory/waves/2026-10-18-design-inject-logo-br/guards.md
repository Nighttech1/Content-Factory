# Guards — Wave 2026-10-18 FULL DESIGN inject + logo BR + rich SW + layout variety

**Role:** Тестировщик · chain step 5  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` §8 (G1–G10)  
**Executable:** `npx tsx scripts/verify-design-inject-logo-br-guards.ts` → **38/38 PASS**  
**Backend unit (companion):** `npx tsx scripts/verify-design-inject-logo-br-backend.ts` → **ALL OK**  
**Deploy:** skipped (user / Orchestrator: **no deploy** this turn)

## Verdict: GREEN

| Guard | Result | Evidence |
|-------|--------|----------|
| G1 FULL role payload | PASS | `buildDesignTokensPayload` → `roles.title/body/slideNumber` each has family+sizePx+color; `paletteMood` present |
| G2 Positive FULL inject | PASS | `formatFullDesignTokensInjectBlock` + Designer overlay = `## FULL DESIGN TOKENS (HARD)`; **no** «do NOT assume 64px» in inject/overlay |
| G3 Motifs optional | PASS | `VISUAL_PROMPT_RICHNESS_HARD`: OPTIONAL + FORBIDDEN laundry list (khachkar/…) + ≥3 elements |
| G4 secondary_copy rich | PASS | Critic bar ≥120 chars **OR** ≥3 clauses; thin stub fails; SW overlay richness HARD |
| G5 Logo chrome BR | PASS | Default `bottom-right`; **88px**; `background: transparent`; flex row; name after `<img>` |
| G6 Slide-num body + N / M | PASS | `formatPrettySlideNum(2,6)` → **`03 / 06`**; own `.slide-num`; body font; opposite corner (left) |
| G7 fontFit reduce-only | PASS | Override 64→ stays 40; delta −8 → 32; positive +12 ignored |
| G8 Deconstruct → payload | PASS | `parseDesignPresetFile` / `ensureDeconstructFullTokens` / `ensurePresetTypographyScale` fill scale → roles non-null |
| G9 Layout variety | PASS | Identical top-left fails validate; soft-shuffle restores; fallback rotates anchors |
| G10 Smoke ONE×6 | PASS | `docs/карусель тест/design-inject-logo-br-smoke-6/` = **6 PNG**; pretty `01 / 06`…`06 / 06`; logo BR chrome; templates `cover_center,body_left,body_split,quote_band,cta_bottom` + flex variety |

---

## Permanent asserts (class of defect)

### G1 — FULL DESIGN role table (`C-full-design-inject`)

1. `buildDesignTokensPayload(preset).roles` includes **title / body / content / accent / muted / slideNumber / brandName / cta** with **family + sizePx + color** where applicable.
2. `paletteMood` string guides bg lighting from type colors.
3. `slideNumber` tokens default to **body** family/size/color.

**Paths:** `lib/settings/design-preset.ts` · `lib/settings/design-library.ts` · `lib/intake/placeholders.ts`

### G2 — Positive FULL inject, no 64px negatives (`C-full-design-inject`)

1. Every Designer draw overlay includes `## FULL DESIGN TOKENS (HARD)` with numeric **px** + hex/colors.
2. Inject / overlay must **not** rely on «do NOT assume 64px» / «do not assume 64px» as type guidance (JSDoc historical mention OK).

**Paths:** `lib/studio/create-carousel-prompts.ts` (`formatFullDesignTokensInjectBlock`, `resolveCreateCarouselOverlay`)

### G3 — Motifs optional (`C-motifs-optional-sw`)

1. Scriptwriter `VISUAL_PROMPT_RICHNESS_HARD`: Armenian/Vernatun motifs **OPTIONAL**.
2. Explicit **FORBIDDEN laundry list** (khachkar / apricot / Ararat / pomegranate / carpet every post).
3. ≥3 concrete scene elements kept.

**Paths:** `lib/studio/create-carousel-prompts.ts`

### G4 — secondary_copy 2–3× richer (`C-secondary-copy-rich`)

1. Body slides: fail if length `< 120` **AND** clauses `< 3` (`isThinSecondaryCopy`).
2. Overlay HARD wording «2–3× richer» present for Scriptwriter.

**Paths:** `lib/studio/carousel-critic-05.ts` · `lib/studio/create-carousel-prompts.ts`

### G5 — Logo chrome bottom-RIGHT (`C-logo-chrome-br`)

1. `DEFAULT_BRAND_CHROME === "bottom-right"`; `BRAND_LOGO_SIZE_PX === 88`.
2. Composite: brand `bottom`+`right`; img **transparent** bg; `flex-direction: row`; name **right of** icon (`brand-name` after `<img>`).
3. Dual-path KEEP: raw logo → `<img>` (not name-only when logo set).

**Paths:** `lib/studio/carousel-layered-composite.ts`

### G6 — Slide-num own slot + body tokens (`C-slide-num-body`)

1. Pretty format with spaces: **`NN / MM`** (e.g. `03 / 06`) — supersedes prior wave `03/06` without spaces for **this** product path.
2. Own `.slide-num` block; `font-family: var(--cf-font-body)`; opposite corner from logo BR → bottom-left.

**Paths:** `lib/studio/carousel-layered-composite.ts` (`formatPrettySlideNum`)

### G7 — fontFit reduce-only (`C-font-fit-reduce`)

1. `applyFontFitReduceOnly`: never enlarge above DESIGN base px.
2. Negative `deltaPx` / lower override reduces; positive delta ignored.
3. Frame may document via `data-font-fit`.

**Paths:** `lib/studio/carousel-layered-composite.ts` · `lib/studio/carousel-json-contract.ts`

### G8 — Deconstruct → Embla → FULL inject (`C-deconstruct-verify`)

1. Path: Settings upload → `POST /api/settings/design-deconstruct` → `deconstruct-style` → `ensureDeconstructFullTokens` → Embla active → `buildDesignTokensPayload` roles.
2. Colors-only stub without scale: parser/ensure fills `typography.scale` (cover/h2/body/caption).
3. Round-trip payload roles `sizePx` + `color` non-null.

**Paths:** `lib/agents/deconstructStyle.ts` · `lib/studio/deconstruct-style.ts` · `lib/settings/design-preset.ts` · `app/api/settings/design-active/route.ts`

### G9 — Layout variety (`C-layout-variety`)

1. `validateLayoutVariety` fails when all anchors identical top-left.
2. `softShuffleIdenticalAnchors` restores variety.
3. `synthesizeFallbackHtmlLayout(body, i)` rotates anchor/vertical by index; default logo BR.

**Paths:** `lib/studio/carousel-layered-composite.ts` · `lib/studio/designer-variant-a-pack.ts`

### G10 — Smoke ONE × 6 (`C-smoke-design-inject-6`)

Canon folder:

`docs/карусель тест/design-inject-logo-br-smoke-6/`

| Artifact | Required |
|----------|----------|
| `slide_01.png` … `slide_06.png` | exactly **6** finals |
| `slide_0N.html` | pretty `N / 06`; `data-brand-chrome="bottom-right"`; 88px; transparent; brand `<img>` |
| layout variety | ≥3 distinct frame `data-template` **or** ≥3 `.safe` flex layouts |
| optional | `timeline.md`, `art-director-review.*`, `README.md` |

**Hard:** STOP after smoke (no remake loop). Budget = ONE × 6.

**Note (P2, not FAIL):** this smoke’s frame HTML omits `data-anchor` / `data-vertical` attrs even though current composite source emits them — variety proven via templates + flex. Future smoke should include the attrs for easier grepping.

---

## Evidence run (2026-10-18)

```text
npx tsx scripts/verify-design-inject-logo-br-guards.ts
SUMMARY 38/38 PASS

npx tsx scripts/verify-design-inject-logo-br-backend.ts
ALL BACKEND UNIT OK
```

Smoke spot-check:

- brand CSS: `bottom: 44px; right: 80px;` · flex row · img 88px transparent
- slide-num: `01 / 06` … `06 / 06` · left when logo BR · `--cf-font-body`
- templates: cover_center · body_left · body_split · quote_band · cta_bottom

---

## Tickets → guards

| Ticket | Guards |
|--------|--------|
| C-full-design-inject | G1, G2 |
| C-motifs-optional-sw | G3 |
| C-logo-chrome-br | G5 |
| C-slide-num-body | G6 |
| C-secondary-copy-rich | G4 |
| C-font-fit-reduce | G7 |
| C-deconstruct-verify | G8 |
| C-layout-variety | G9 |
| C-smoke-design-inject-6 | G10 |

Per-ticket mirrors: `memory/tickets/C-*/guards.md` → this file + verify script.

```
🧪 **ТЕСТИРОВЩИК:** G1–G10 GREEN 38/38 · smoke 6 PNG · no deploy · guards: memory/waves/2026-10-18-design-inject-logo-br/guards.md
```
