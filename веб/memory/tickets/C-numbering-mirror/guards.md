# C-numbering-mirror — guards

**Wave:** 2026-10-18-layout-copy-dual-char  
**Class:** numberingGlobal absent → omit `.slide-num`

## Permanent asserts

1. `shouldShowSlideNumber` false when `numberingGlobal: "absent"`
2. Composite HTML has no `class="slide-num"`
3. Smoke A+B meta `slideNumFound: false`

## Executable

```bash
npx tsx scripts/verify-layout-copy-dual-char-guards.ts
```

Assert ids: `G4_*`, smoke `G10_smoke_A_no_slide_num`, `G11_smoke_B_no_slide_num`

## Evidence

Wave: `memory/waves/2026-10-18-layout-copy-dual-char/guards.md` · **33/33 PASS**
