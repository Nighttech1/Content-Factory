# C-sw-secondary-wide — guards

**Wave:** 2026-10-18-layout-copy-dual-char  
**Class:** body `secondary_copy` ≥220 chars AND ≥5 clauses

## Permanent asserts

1. Overlay HARD ≥220 / ≥5 (or ≥4 short paragraphs)
2. Critic `isThinSecondaryCopy` rejects thin body
3. Zod `assertCarouselSecondaryCopyWide` throws on thin body

## Executable

```bash
npx tsx scripts/verify-layout-copy-dual-char-guards.ts
```

Assert ids: `G1_*`, `G2_*`

## Evidence

Wave: `memory/waves/2026-10-18-layout-copy-dual-char/guards.md` · **33/33 PASS**
