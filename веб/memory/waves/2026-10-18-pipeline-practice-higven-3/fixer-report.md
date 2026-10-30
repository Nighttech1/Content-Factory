# Fixer report — pipeline-practice-higven-3

**Attempt 3 of 3 (LAST).** STOP — no attempt 4.

## Client FAIL → cause → fix

| FAIL | Cause | Fix |
|------|--------|-----|
| Cover logo overlaps headline | Logo TL @ ~50px + type at `SAFE.top=120` while logo box ~148–200px tall | `typeClearPadPx` → `.safe { padding-top }` under top logo (cover/cta ≈106px) |
| Opaque white/orange plate under logo | Emblem+HTML wordmark on RE plate; edge cream matte in PNG | Prefer **full** `/brand/vernatun-logo.png` (`img_only`); `stripLogoEdgeMatteDataUri` flood-fill; CSS `background:transparent` |
| Body text contrast weak | RE `visionPlate` odd slides → dark `#1A1A1A` type on charcoal photo | `characterPaint=none` → HIGVEN industrial tokens (white type + `#F58220`); `.secondary` full opacity + stronger shadow; force soft scrim |
| Logo placement ≠ locks | `LAYOUT_MAP_HIGVEN` body/cta = `top-right`; vision_ref synth same | Locks: cover+cta **top-left**, body **bottom-left** (seeds + designer synth + prompts) |

## Smoke

```text
SMOKE_ATTEMPT=3 npx tsx scripts/smoke-pipeline-practice-higven-3.ts
→ ok: true · pngCount: 3 · attempt: 3
→ docs/карусель тест/pipeline-practice-higven-3/
→ copied public/pipeline-practice-higven-3/
```

### Verify (HTML attrs)

| Slide | `data-brand-chrome` | clear pad | logo mode | type color |
|-------|---------------------|-----------|-----------|------------|
| 01 cover | `top-left` | `padding-top:106px` | `img_only` | `#FFFFFF` |
| 02 body | `bottom-left` | `0` | `img_only` | `#FFFFFF` |
| 03 cta | `top-left` | `padding-top:106px` | `img_only` | `#FFFFFF` |

## Files touched

- `lib/settings/design-presets/higven-seeds.ts` — layoutMap logo locks
- `lib/studio/designer-variant-a-pack.ts` — HIGVEN synth logo + scrim/contrast
- `lib/studio/create-carousel-prompts.ts` — HIGVEN-3 placement/contrast LOCK lines
- `lib/studio/carousel-layered-composite.ts` — clear-zone, HIGVEN plate, secondary contrast, full-logo sizing
- `lib/studio/carousel-html-renderer.ts` — full Brand logo path + edge-matte strip

## STOP

Attempt 3 complete. No further remake in this wave.
