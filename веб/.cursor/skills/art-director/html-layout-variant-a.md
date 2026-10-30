# Variant A — Designer `html_layout` JSON → carousel-layered-composite

**Wave lock:** Designer LLM outputs structured **`html_layout`** per slide; `carousel-layered-composite` / Puppeteer **executes** it (no free-form invent-only HTML as sole path).

Architect owns final zod names; this file = skill contract for AI Bridge + Backend.

## Why

Today composite largely hardcodes placement from `layout_variant` / role. Variant A makes layout **LLM-authored, code-executed**: template + text anchor + accent highlights — still S57 (bg image + HTML overlay).

## Per-slide `html_layout` (proposed)

```json
{
  "html_layout": {
    "template": "cover_center|body_left|body_split|cta_bottom|tip_card|quote_band",
    "anchor": {
      "x": "left|center|right",
      "y": "top|middle|bottom",
      "safe": true
    },
    "highlights": [
      { "text": "exact substring from headline or body", "style": "accent|marker|bold" }
    ],
    "scrim": "none|soft|heavy",
    "brandChrome": "bottom-right|top-right|top-left|none",
    "slideNumber": { "slot": "own|omit", "format": "pretty_N_M|none" },
    "fontFit": { "role": "body|title|content", "deltaPx": -2, "reason": "overflow" },
    "characterSlot": "none|right-cutout|left-cutout",
    "characterPaint": "in_image|overlay_cutout|none",
    "layoutMapSource": "preset|invent|vision_ref",
    "styleCopyMode": "tokens|layout_map|vision_ref"
  }
}
```

| Field | Rule |
|-------|------|
| `template` | Closed enum executed by composite (Architect may extend list; **no** arbitrary CSS from LLM) |
| `anchor` | Where primary type block sits; `safe: true` = clamp inside 120/160/80. **If `styleCopyMode=vision_ref`:** mirror etalon zones. **Else if preset `layoutMap`:** copy map anchors. **Else variety HARD:** rotate `x`/`y` — not always top-left |
| `highlights` | Substrings that exist in `headline`/`body`/`secondary_copy` only — wrap with accent/marker classes |
| `scrim` | Overlay strength over bg |
| `brandChrome` | Prefer etalon / **layoutMap.logoChrome**; else default **`bottom-right`**. Logo enlarged + transparent; name **inline right of icon**. Still OVER bg |
| `slideNumber` | Own HTML slot when etalon/map/global says present; tokens = **body paragraph**; pretty `N / M`. **`omit` / `none` when numbering absent** |
| `fontFit` | Optional: document **reduce-only** deltas when copy won't fit. Never positive enlarge above DESIGN scale (default path). On vision_ref: match etalon scale feel |
| `characterSlot` | Placement hints for cutout path (legacy) |
| `characterPaint` | Product default **`in_image`** (in scene pixels). `overlay_cutout` = legacy cutout OVER bg; `none` = no character |
| `layoutMapSource` | `vision_ref` = style from image reference; `preset` = layoutMap grammar; `invent` = free variety |
| `styleCopyMode` | `vision_ref` \| `layout_map` \| `tokens` — see `plugins/trainer/vision-style-copy.md` |

## Designer duties (Variant A)

1. Parse Dramaturgy JSON (`headline`/`body`/`secondary_copy`/`cta_type`/`visual_prompt`).
2. **Tokens path:** Receive **FULL active DESIGN.md** in prompt — fonts, sizes, **colors for each text role**. Positive scale table only. **`vision_ref` path:** **BAN** FULL DESIGN TOKEN CARD / stock typography.scale; receive **etalon image reference** + Brand Vernatun text/CTA (+ optional logo) only.
3. Emit **bg** prompts = scene only (S57 ban letters/logos); optional cultural taste — **no** forced khachkar/apricot laundry list. On vision_ref: honor **partial/inset** photo geometry from etalon — not always full-bleed cover.
4. Emit **`html_layout`** per slide (template/anchor/highlights) — layout/placement only; start sizes from DESIGN scale **or etalon**; **reduce-only** if overflow (document in `fontFit`).
5. **Style source:** if `styleCopyMode=vision_ref` → `layoutMapSource: vision_ref` and hard-copy from picture. Else if active DESIGN has `layoutMap` → `preset` and mirror map. Else `invent` + **variety**.
6. Do **not** paint `swipe_trigger`.
7. CTA catalog 1–4 → composite HTML button on `cta_slide` only (ctaChrome from etalon/map when present).
8. **Character:** product default `characterPaint=in_image`; cutout only when explicitly legacy-switched.

## FULL DESIGN tokens vs `html_layout` (HARD · wave 2026-10-18-design-inject)

| Source of truth | Field |
|-----------------|--------|
| **DESIGN.md / DesignPreset** (tokens / layout_map modes) | Full role table: families + **`typography.scale`** sizes + **colors** per title/body/content/(brand)/(slideNumber) |
| **Etalon image** (`vision_ref`) | Composition / zones / type look / chrome — **primary** style SoT; **no** FULL TOKEN CARD inject |
| **`html_layout`** | template, anchor, highlights, scrim, brandChrome, slideNumber slot, characterSlot, optional fontFit — **placement + fit notes**, not inventing a parallel type system |
| **Composite** | Tokens modes: CSS from **preset scale + colors**. vision_ref: placement from `html_layout` mirroring etalon; Brand Vernatun content swap |
| **Font fit** | May **reduce** below scale only for overflow; **never enlarge** arbitrarily; record in overlay/`fontFit` |
| **Contradiction FAIL** | Ignoring DESIGN colors/sizes on tokens path; FULL TOKEN inject on vision_ref; always top-left when inventing; logo name under icon; slide num fused into headline |

AI Bridge: inject `buildDesignTokensPayload` **full role table** every draw **except** `styleCopyMode=vision_ref`.  
Backend: `carousel-layered-composite` ← DESIGN tokens (default) or vision-driven `html_layout`; brand row / `.slide-num` per mode.

## Composite duties

1. Validate `html_layout` (zod STRICT — fail job on unknown template / orphan highlight).
2. Map `template` → existing CSS blocks / grid in `carousel-layered-composite`.
3. Resolve **font-size + color from FULL DESIGN** (fallback to template defaults only if tokens missing); apply `fontFit` reduce if present.
4. Apply highlights as accent spans; escape all text.
5. Brand chrome: **enlarged** logo `<img>` (transparent bg) + **name to the right of icon**, default **bottom-right** when Settings Brand provides logo (dual-path raw `logoRef`).
6. Slide number: **separate** HTML block; body paragraph tokens; pretty `N / M`.
7. Raster 1080×1350 Puppeteer.

## Forbidden

- LLM returns raw HTML/CSS strings as product path (XSS + drift)
- Highlights for words not in copy
- Template invent outside enum without Architect + composite map
- Auto-remake from Art Director remarks

## Handoff order

```text
Scriptwriter (dramaturgy)
  → Designer (bg prompts + html_layout[])
  → Image model (bg plates)
  → carousel-layered-composite (execute html_layout)
  → Art Director (remarks | approve)  ← NO remake
  → Draft / HITL
```

See: `carousel-json-contract` Phase 7 · `plugins/trainer/carousel-layered-html-pipeline.md` · `plugins/trainer/variant-a-art-director.md`.

## Wave 2026-10-18-pipeline-practice-higven-3 (HARD override)

Canon: `plugins/trainer/pipeline-practice-higven-3.md` + wave `plan.md`.

| Field / duty | This wave |
|--------------|-----------|
| **N** | Exactly **3**: cover · body · cta |
| **characterPaint** | Force **`none`** (not product default `in_image`) |
| **Parallel pack** | Designer **ONE** JSON: `image_prompt`×3 **and** `html_layout`×3 together — then image gen ‖ renderer prep in parallel |
| **logo** | Full Vernatun PNG `<img>` only (wordmark in file). Do **not** require inventing `logo.textColor` / HTML wordmark path A |
| **style** | Copy **HIGVEN** grammar (dark industrial / orange accents / hierarchy) from active etalon 01 — not invent purple slop |
| **HITL** | After Scriptwriter: wait **«Передать дизайнеру»** before Designer pack |
| **Art Director** | remarks \| approve — **still NO remake** |
| **Second Designer call** | Forbidden «only for logo color after bg» |
