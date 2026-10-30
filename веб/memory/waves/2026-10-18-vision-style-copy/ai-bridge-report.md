# AI Bridge report — 2026-10-18 vision style-copy

**Role:** AI Bridge (step 2)  
**Date:** 2026-10-18  
**Wave:** `2026-10-18-vision-style-copy`  
**Verdict:** overlays + defaults + AD checklist live

---

## Files changed

| File | Change |
|------|--------|
| `lib/studio/create-carousel-prompts.ts` | `StyleCopyMode`, `DEFAULT_CHARACTER_PAINT=in_image`, `VISION_STYLE_COPY_HARD`, `LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF`, skip FULL token inject on `vision_ref`, reference-image wire block, Brand content-only channel, ban assert helpers, `resolveCreateCarouselOverlay` / `appendActiveDesignMdToDesignerPrompt` / `formatActivePresetCssVarsForPrompt` wired |
| `lib/studio/carousel-json-contract.ts` | `layoutMapSource` += `vision_ref`; `bgFit` + `photoZone` on `html_layout` |
| `lib/studio/designer-variant-a-pack.ts` | Pass `styleCopyMode` / `referenceImage`; skip DESIGN.md dump on vision_ref |
| `lib/studio/agent-start-bundle.ts` | Accept + forward `styleCopyMode` / `referenceImage` |
| `lib/studio/art-director-review.ts` | Checklist: vision_ref hard-copy, ban stock spreadsheet, ban forced full-bleed, default `in_image` |
| `lib/mesh/agent-defaults.ts` | Carousel Designer/Scriptwriter identity: vision_ref exception, `in_image` default, SW ≥220+≥5 |

**Not touched (by design):** AppShell / Settings UI · composite CSS · aggregator-images · job smoke folders · secrets

---

## Key prompt contract (`styleCopyMode=vision_ref`)

When `resolveCreateCarouselOverlay("designer", …, { styleCopyMode: "vision_ref" })`:

1. Uses **`LAYERED_HTML_DESIGNER_OVERLAY_VISION_REF`** (not the token-card layered overlay).
2. Injects **`VISION_STYLE_COPY_HARD`** — HARD-COPY composition / zones / hierarchy / accents / logo·CTA·numbering presence|absence / photo-vs-plate.
3. Injects **`formatVisionReferenceImageContractBlock`** — Backend must attach etalon as multimodal image part (`path` | `url` | `base64`), **not** ASCII dump into text.
4. Injects **`formatBrandVernatunContentChannel`** — Brand name + optional logo stub + CTA 1–4 content swap only.
5. **Skips** `formatFullDesignTokensInjectBlock` / `buildDesignTokensPayload` dump / `formatActiveDesignMdForPrompt` FULL role table.
6. Instructs `html_layout.layoutMapSource=vision_ref` + `bgFit` (`cover`|`contain`|`mask`) + optional `photoZone`.
7. `characterPaint` defaults to **`in_image`** via `resolveCharacterPaintPath` / `DEFAULT_CHARACTER_PAINT`.
8. layoutMap inject is **not** required on this path.

### Sample ban-proof (smoke check)

```text
ban_ok { ok: true }
has_vision true
has_hard_copy true
has_in_image true
has_full_token false
has_manrope false
has_scale false
ref_wire true
bgFit true
```

Ban substrings asserted by `assertVisionRefPromptBanClean` / `VISION_REF_PROMPT_BAN_SUBSTRINGS`:

- `FULL DESIGN TOKEN`
- `typography.scale`
- `Manrope`
- `Cormorant`
- `buildDesignTokensPayload`
- `/Title\s*=\s*\d+\s*px/i`

Trace markers present instead: `styleCopyMode=vision_ref` · `inject_skipped: token_card_role_table` · `true`.

### Snippet (HARD-COPY + BAN wording · no stock font names)

```text
## VISION STYLE-COPY (styleCopyMode=vision_ref)
- Trace marker: `styleCopyMode=vision_ref` · `inject_skipped: token_card_role_table` · `true`.
- The **attached image** is the STYLE + COMPOSITION source of truth (Backend multimodal / reference-first).
- **HARD-COPY from the picture:**
  · overall composition and balance
  · text zones … hierarchy (title > body > accents)
  · accent treatments …
  · logo / CTA / numbering presence OR absence
  · photo-vs-plate / frame share
- BAN on this path: token-card role spreadsheet · stock type-scale px table · stock default font-family inject.
- BAN: always full-bleed cover when the reference shows partial/inset photo.
- Emit html_layout with layoutMapSource=vision_ref and bgFit …
- layoutMap JSON is NOT required for PASS on this path.
```

---

## Image ref → Backend contract (how signaled)

| Field | Owner | Meaning |
|-------|-------|---------|
| `styleCopyMode: "vision_ref"` | job / opts | Selects vision overlay + skip FULL inject |
| `referenceImage.kind` | `path` \| `url` \| `base64` | Prefer path → url → base64 |
| `referenceImage.path` / `.url` | slice file | Per-slide slot from pack |
| `referenceImage.slot` | `cover`\|`midA`\|`midB`\|`cta` | From `mapSlideToRefSlot` |
| `referenceImage.base64LengthHint` | optional | Text prompt never gets binary |
| Prompt block `## REFERENCE IMAGE WIRE` | AI Bridge | Instructs multimodal attach on **describe + draw** |

**Backend must:** in `lib/llm/aggregator-images.ts` (+ draw callers) convert `referenceImage*` into provider **image parts** for describe and draw. Text-only path string without multimodal part = FAIL.

---

## Scriptwriter wide KEEP

Confirmed **unchanged / strengthened**:

- `SECONDARY_COPY_MUCH_WIDER_HARD` still requires body **≥220 chars AND ≥5 clauses**
- `CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY` + paired invariants still include the bar
- `agent-defaults` copywriter identity updated from ≥120 → **≥220 AND ≥5** (alignment, not regression)

---

## characterPaint default

| Context | Value |
|---------|-------|
| `DEFAULT_CHARACTER_PAINT` | `in_image` |
| `resolveCharacterPaintPath(undefined)` | `in_image` |
| `formatCharacterPaintInjectBlock()` | `in_image` |
| `buildLayeredBackgroundImagePrompt` default | `in_image` |
| `overlay_cutout` | legacy only — not product default |

---

## Handoff notes for Backend (step 3)

1. **Job flag:** accept `styleCopyMode: "vision_ref" | "token_card"` on draw/job; smoke default `vision_ref`.
2. **Multimodal wire:** resolve pack **01** → 4 slots → `mapSlideToRefSlot(N=6)` → pass `referenceImagePath|Url|Base64` into aggregator **as image parts** for Designer describe + draw. Prompt already signals via `REFERENCE IMAGE WIRE`.
3. **Defaults:** flip remaining Backend defaults still on `overlay_cutout`:
   - `lib/studio/carousel-layered-composite.ts` (`?? "overlay_cutout"`)
   - `lib/studio/carousel-html-renderer.ts` (if any)
   - `lib/intake/correct-pipeline-job.ts` (hero → overlay_cutout) — product default should prefer `in_image` when vision-style / smoke A
4. **Composite `bgFit`:** honor `html_layout.bgFit` + optional `photoZone` (`cover`|`contain`|`mask`) — schema already accepts.
5. **Agent-chat / draw routes:** pass `styleCopyMode` + `referenceImage` into `buildCreateCarouselAgentBundle` / `resolveCreateCarouselOverlay` / `ensureDesignerVariantAPack` (route files are Backend path lock — **not** edited this step).
6. **Timeline:** dump full Designer system+user into `timeline-prompt-full.md`; assert ban clean via `assertVisionRefPromptBanClean`.
7. **Smoke:** ONE × 6, pack 01, `characterPaint=in_image`, useful #17 kitchen → `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/`.

---

## DoD checklist (AI Bridge)

| # | Item | Status |
|---|------|--------|
| 1 | Attach etalon wording + HARD-COPY + BAN FULL/scale/stock fonts | ✅ |
| 2 | Brand Vernatun content swap only | ✅ |
| 3 | `characterPaint` default `in_image` | ✅ |
| 4 | KEEP SW wide ≥220+≥5 | ✅ |
| 5 | layoutMap optional (not sole path) | ✅ |
| 6 | Report with files + snippets + Backend wire | ✅ |

**Next:** Backend (step 3) — multimodal image ref + bgFit composite + smoke A×6.
