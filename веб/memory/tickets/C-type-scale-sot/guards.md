# C-type-scale-sot — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** DESIGN `typography.scale` drives composite CSS px; Designer prints numerics

## Permanent asserts

1. `resolveTypeScaleCss` with `scale.cover=40` → cover `.primary` = `40px` (not hardcoded 64)
2. Body templates use `scale.h2` for `.primary`; `.secondary` ← `scale.body`
3. Designer overlay includes `## TYPE SCALE (HARD)` with printed px
4. Hardcoded template sizes = fallback only when scale missing

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G1_*`, `G2_*`

## Evidence (2026-10-18)

- 25/25 PASS (wave script)
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
