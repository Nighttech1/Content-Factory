# Backend report — 2026-10-18-design-inject-logo-br

**Role:** Backend · step 3  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` · locks 1, 3, 4, 6, 7, 8, 9 (+ zod wire for 5/6)

```
🔌 **BACKEND:** FULL role-table payload · logo BR 88px transparent flex-row · slide-num body N / M · fontFit reduce-only · variety soft-shuffle · deconstruct scale persist · smoke 6 GREEN
```

## Done (paths)

| Path | Change |
|------|--------|
| `lib/settings/design-preset.ts` | `buildDesignTokensPayload` **FULL roles** (family+sizePx+color); `ensurePresetTypographyScale` + `PRESET_FALLBACK_SCALE`; `parseDesignPresetFile` always fills scale |
| `lib/settings/design-library.ts` | re-export payload; `formatActiveDesignMdForPrompt` prints FULL role table |
| `lib/intake/placeholders.ts` | `paletteJsonFromPreset` → FULL `buildDesignTokensPayload` (Embla active → Designer) |
| `lib/studio/carousel-json-contract.ts` | logo/`brandChrome` += `bottom-left`/`bottom-right` (default **bottom-right**); `fontFit` + `fontSizeOverride`; text_block.`vertical`; normalize clamps deltaPx ≤0 |
| `lib/studio/carousel-layered-composite.ts` | brand BR · **88px** · transparent · flex row icon→name; slide-num body tokens + pretty **`N / M`** opposite corner; fontFit reduce-only clamp; fallback rotate + soft-shuffle + variety validate; `data-brand-chrome` / `data-anchor` |
| `lib/studio/designer-variant-a-pack.ts` | soft-shuffle identical anchors/templates on pack merge; fallback uses slide index |
| `lib/studio/deconstruct-style.ts` | belt `ensureDeconstructFullTokens` + `ensurePresetTypographyScale` before return |
| `app/api/settings/design-active/route.ts` | POST persists scale-filled preset (Embla activate → FULL inject) |
| `scripts/smoke-design-inject-logo-br-6.ts` | ONE×6 smoke |
| `scripts/verify-design-inject-logo-br-backend.ts` | Backend unit asserts |

## Locks

| Lock | Status |
|------|--------|
| 1 `full_design_inject` | **DONE** — `roles` table + paletteMood in payload; placeholders wire |
| 3 `logo_chrome_br` | **DONE** — default bottom-right; 88px; transparent; flex row name-right-of-icon; dual-path KEEP |
| 4 `slide_num_own_slot` | **DONE** — own `.slide-num`; body family/color/size; pretty `01 / 06`; opposite to logo |
| 5 `secondary_copy_rich` | **AI Bridge critic** (≥120 / ≥3 clauses) — Backend zod min(1) kept; no duplicate bar |
| 6 `font_fit_reduce_only` | **DONE** — schema + `applyFontFitReduceOnly` never enlarges above DESIGN; meta on `data-font-fit` |
| 7 `deconstruct_verify` | **DONE** — path below |
| 8 `layout_variety` | **DONE** — fallback rotate; soft-shuffle on identical; validate helper |
| 9 `smoke_one_x6` | **DONE** — 6 PNG + timeline + AD optional |

## §7 Deconstruct → Embla → FULL inject (verified)

```text
Settings Design upload
  → POST /api/settings/design-deconstruct
  → lib/studio/deconstruct-style.ts
       → agents/deconstructStyle (AI Bridge) + ensureDeconstructFullTokens
       → ensurePresetTypographyScale (Backend belt)
  → FE appendDesignLibrarySlotFifo(presetFile) + selectSlot
  → syncActiveDesignToServer → POST /api/settings/design-active
       → parseDesignPresetFile + ensurePresetTypographyScale
  → readSyncedActiveDesign → buildCorrectPlaceholders
       → buildDesignTokensPayload (roles + scale + colors)
  → Designer overlay / draw
```

| Check | Result |
|-------|--------|
| colors in preset | YES (existing + soft-fill) |
| fonts display/body | YES |
| typography.scale | **YES** — required soft-fill if LLM omits |
| Embla active → payload roles.*.sizePx/color | **YES** via placeholders |
| Frontend §9 | **NOT armed** — upload/deconstruct/activeId path already wired |

## Brand chrome picks (report)

| Param | Value |
|-------|-------|
| Default placement | `bottom-right` |
| Logo size | **88px** (user 80–96 / Architect 72–88) |
| Icon bg | `transparent` (no dark plate) |
| Name layout | flex **row** · name **right of** icon |
| Slide-num | bottom-**left** when logo BR; body tokens; `NN / MM` |

## fontFit

- Designer may send `html_layout.fontFit.deltaPx ≤ 0` or `fontSizeOverride`
- Composite: `applyFontFitReduceOnly` → `min(computed, designPx)`; positive deltas ignored
- Documented on frame `data-font-fit`

## Smoke

| Item | Result |
|------|--------|
| Path | `docs/карусель тест/design-inject-logo-br-smoke-6/` |
| PNG | **6** (slide_01…06.png) |
| logo BR + transparent + 88 + flex row | **PASS** (HTML spot-check) |
| pretty `N / M` | **PASS** (`01 / 06` … `06 / 06`) |
| slide-num opposite | **PASS** (left when logo BR) |
| anchor variety | **PASS** (flex justify/align differs across slides; templates were mostly body_split — soft-shuffle now also rotates body templates for next runs) |
| AD | Gemini optional · **NO remake** |
| Unit | `npx tsx scripts/verify-design-inject-logo-br-backend.ts` → **ALL OK** |

## Placeholders

- Dual-path **KEEP**: `logoRef` sanitized → LLM; `logoRefRaw` → composite `<img>`

## Risks / notes

- Postgres localhost unreachable during smoke → sprint8 fallback store (non-blocking)
- Prior wave guards asserting `03/06` without spaces need update to `03 / 06` (Tester)
- Frontend omit (shell_freeze)

## Next

**Tester** — G1–G10 guards + smoke presence (`guards.md`).
