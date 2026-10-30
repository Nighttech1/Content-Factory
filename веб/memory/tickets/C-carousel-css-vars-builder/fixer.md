# Fixer — C-carousel-css-vars-builder

**Role:** Фиксер  
**Wave:** `W-2026-10-13-visual-deconstructor`  
**Date:** 2026-10-13

## What failed / polish backlog

Tester PASS with non-blocking backlog:

1. **CTA pill truncation/duplicate** on `bento_glass/slide_06` — `.cta-pill` used `secondary.slice(0, 48)`, cutting mid-phrase and echoing the body.
2. **Dual `normalizeCarouselSlideRole`** — `types/design.ts` vs `carousel-html-renderer.ts`.
3. Visual kits below golden-ref level (marker / doodle arrow / glass).

## Root cause

`buildRoleBodyHtml` (`cta_slide`) put truncated long `secondary` into the pill. No `captionLine` / short CTA field.

## Fix

| Item | Change |
|------|--------|
| CTA pill | `resolveCtaPillLabel(secondary, captionLine)` — prefer `captionLine`/`cta_label`, else first `·` segment, else default `Сохранить · Vernatun`. Never mid-phrase truncate. Omit secondary body when it equals the pill. |
| Role normalize | Single source in `types/design.ts` (full aliases); renderer re-exports. |
| Kit chrome | Marker uses preset yellow tape color + ragged rotate; SVG doodle swirl + curved bridge arrow; stronger glass inset/blur; CTA gradient pill + nowrap ellipsis. |
| Seed script | CTA slides pass `captionLine` (`Сохранить ритуал` / `Сохранить пресет`). |

## Same-command rerun

```bash
npx tsx scripts/generate-wave-visual-artifacts-pngs.ts
npx tsx scripts/smoke-w-2026-10-13-visual-deconstructor.ts
```

## Architecture

No change — surgical kit/builder polish inside existing `carouselHtmlBuilder`.
