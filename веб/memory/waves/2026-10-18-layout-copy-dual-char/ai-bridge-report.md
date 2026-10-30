# AI Bridge report — 2026-10-18 layout-copy-dual-char

**Role:** AI Bridge (step 2)  
**Date:** 2026-10-18  
**Tickets:** C-sw-secondary-wide · C-grid-layout-map · C-numbering-mirror (wording) · C-dual-char-smoke (prompts)

## Done

### 1. Scriptwriter MUCH wider (`secondary_copy_wide`)
- Raised critic bar in overlays: body `secondary_copy` **≥220 chars AND ≥5 clauses** (or ≥4 short paragraphs).
- Paired invariants + Scriptwriter overlay + VIRAL CRAFT updated (supersedes soft ≥120 / 2–3×).
- Injected `SECONDARY_COPY_MUCH_WIDER_HARD` with PASS/FAIL paragraph examples (micro-steps / examples).
- **Not done (Backend):** zod / `carousel-critic-05` enforce — step 3 owns after this lock.

### 2. Deconstruct → layoutMap
- `DECONSTRUCT_STYLE_SYSTEM_PROMPT` requires `layoutMap` on 4-ref grid (textAnchor, numbering present|format|position|style or absent, logo/CTA chrome, numberingGlobal, grammarNote).
- Added `DECONSTRUCT_GRID_USER_INSTRUCTION` + `resolveDeconstructUserInstruction`.
- Helpers: `hasValidLayoutMap`, `attachLayoutMapToPreset`; soft-fill preserves `layoutMap`.
- **Types:** `LayoutMap*` on `types/design.ts`; optional `DesignPresetFile.layoutMap`.
- **Persist parse:** `parseLayoutMap` + wire in `parseDesignPresetFile` / `buildDesignTokensPayload` (`lib/settings/design-preset.ts`). Soft — colors-only presets still valid.

### 3. Designer overlays — mirror layoutMap + dual paint
- `LAYERED_HTML_DESIGNER_OVERLAY`: LAYOUT MAP MIRROR; numbering omit when absent; logo/CTA from map; `html_layout.characterPaint`.
- `formatLayoutMapInjectBlock` / `formatCharacterPaintInjectBlock`.
- `formatActivePresetCssVarsForPrompt` prints layoutMap when present.
- `resolveCreateCarouselOverlay` accepts `layoutMap` + `characterPaint`.

### 4. create-carousel-prompts — conductor + dual path
- `CHARACTER_CONDUCTOR_DUAL_PAINT_HARD` (Scriptwriter + Designer).
- `CharacterPaintPath` = `in_image` | `overlay_cutout` | `none`.
- `buildLayeredBackgroundImagePrompt({ characterPaint })` — in_image allows conductor in scene; overlay = scene without character.
- `BACKGROUND_IN_IMAGE_HARD_BAN` (text/logo still banned).
- `buildCharacterCutoutPrompt` for overlay cutout gen (cover+last mandatory wording).

### 5. Art Director checklist
- Thin secondary → P0/P1 (≥220/≥5).
- Flags: layoutMap fight, numbers when absent, wrong paint path, non-conductor.

## Out of scope (this step)
- Seed 01/02/03 + Landscapes 04 / dual smoke gen → **Backend**
- Composite CSS numbering omit → **Backend**
- zod/critic numeric enforce → **Backend**
- DesignSlot 4-up UI → Frontend only if §9

## How to verify
1. Grep overlays for `≥220` / `≥5 clauses` / `layoutMap` / `overlay_cutout` / `conductor`.
2. `parseLayoutMap` / `parseDesignPresetFile` round-trip fixture with 4 slides + `numberingGlobal: "absent"`.
3. `resolveCreateCarouselOverlay("designer", "draw", { layoutMap, characterPaint: "in_image" })` includes mirror + CHARACTER PAINT blocks.
4. Backend next: wire gridMode on deconstruct route + composite + critic.

## Files touched
- `types/design.ts`
- `lib/settings/design-preset.ts`
- `lib/agents/deconstructStyle.ts`
- `lib/studio/create-carousel-prompts.ts`
- `lib/studio/art-director-review.ts`

```
🤖 AI BRIDGE: SW ≥220+≥5 · layoutMap deconstruct+preset · Designer mirror · dual character_path conductor · AD checklist
Next: Backend (seeds + persist + composite + critic + dual smoke)
```
