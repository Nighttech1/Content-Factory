# C-variant-a-html-layout — guards

**Wave:** 2026-10-18-variant-a-art-director  
**Class:** Designer emit `html_layout`; zod STRICT; composite template map + accent wrap

## Permanent asserts

1. Closed template enum (6): `cover_center|body_left|body_split|cta_bottom|tip_card|quote_band` — unknown → zod reject
2. Designer pack requires `html_layout` per slide
3. Orphan highlight phrase (not substring of copy) → critic FAIL
4. Composite maps templates → `data-template` + accent `<span class="accent">`
5. Raster finals **1080×1350**

## Executable

```bash
npx tsx scripts/verify-variant-a-ad-guards.ts
```

Assert ids: `G1_*`, `G2_*`, `G3_*`, `G5_png_1080x1350`

## Evidence (2026-10-18)

- 16/16 PASS (wave script)
- Wave: `memory/waves/2026-10-18-variant-a-art-director/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-variant-a-art-director
