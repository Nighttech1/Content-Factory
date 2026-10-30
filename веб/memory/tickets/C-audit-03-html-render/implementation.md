# C-audit-03 — HTML/CSS-first carousel draw (implementation)

> Role: Backend (+ AI Bridge helpers)  
> Wave: `2026-10-16-carousel-audit-fix`  
> Spec: `architect-spec.md`

## What changed

Primary path for Create Designer **draw** is now **HTML/CSS → Playwright PNG**, not «N× image-2 then overlay».

| Step | Before | After (C-audit-03) |
|------|--------|---------------------|
| 1 | Always `generateAggregatorImage` per slide | Build full HTML frame (copy + CTA 1–4 pill + kit + `--cf-design-*`) |
| 2 | Fail if zero live bg URLs | Solid CSS-var data-URI bg when image skipped |
| 3 | Skip slide render if no remote bg | Always rasterize HTML (N×4:5) |
| 4 | Aggregator key required always | Key only when optional bg is warranted **or** `CAROUSEL_HTML_FIRST=0` |

## API / env

| Env | Default | Effect |
|-----|---------|--------|
| `CAROUSEL_HTML_FIRST` | **on** (anything except `0`) | Prefer skip diffusion for text kits |
| `CAROUSEL_DRAW_SKIP_BG` | off | `1` / `true` → **never** call image API |
| `CAROUSEL_IMAGE_MODEL` | `openai/gpt-5.4-image-2` | Used only when bg is called |

Helpers exported from `lib/studio/carousel-html-renderer.ts`:

- `isCarouselHtmlFirstDraw` / `isCarouselDrawSkipBg`
- `slideWarrantsOptionalBg` — chalk/marker/bento text kits → skip; photo/cinematic → optional image-2
- `resolveCtaCatalogLabel` / `CAROUSEL_CTA_CATALOG_LABELS`
- `solidPresetBackgroundDataUri`

`runCreateCarouselDraw` result adds `htmlFirst` + `bgImageCalls` (0 = HTML-only).

## Schema

Unchanged — `carousel-json-contract` zod keys stable. CTA pill taken from slide/root `cta_type` 1–4.

## Files

- `lib/studio/carousel-html-renderer.ts` — `runCreateCarouselDraw` flip
- `scripts/smoke-c-audit-03-html-first.ts` — fixture dry-run (no live image API)
- This note

## Smoke (cheap, no 6-PNG live gen)

```bash
# HTML-only fixture → 3 PNGs under public/generated/carousel/c-audit-03-smoke/
npx tsx scripts/smoke-c-audit-03-html-first.ts
```

Asserts: `ok`, 3 PNG paths, `bgImageCalls === 0`, `model === openai/gpt-5.4-image-2`, files not tiny/black.

Full wave 6-PNG live gen → Tester/Deployer (`generatedMedia/wave-carousel-audit-fix/`).

## Guards (for Tester)

1. Fixture 3-slide JSON → 3 PNG paths, `renderMode: html_png`
2. With `CAROUSEL_DRAW_SKIP_BG=1` → `bgImageCalls === 0`
3. When image called → model id = `DEFAULT_CAROUSEL_IMAGE_MODEL` / image-2
4. Draw overlay already HTML/CSS-first (C-audit-02) — runtime matches
