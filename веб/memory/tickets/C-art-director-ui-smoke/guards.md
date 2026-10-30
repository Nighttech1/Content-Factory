# C-art-director-ui-smoke — guards

**Wave:** 2026-10-18-variant-a-art-director  
**Class:** Mesh/Team «Арт-директор» + inspector review; smoke ONE 4-slide + AD text

## Permanent asserts

1. Mesh: `data-testid` / `testId="node-art-director"`; order Designer → Art Director → Publisher
2. Agent seed carousel-engine: `packId: "art-director"`; UI name «Арт-директор»
3. Smoke canon: `docs/карусель тест/variant-a-ad-smoke/` has **4** PNG (`slide_01`…`04`) @ 1080×1350 + `art-director-review.md`
4. Mirror OK: `generatedMedia/variant-a-ad-smoke/` same 4 PNG + review
5. No remake loop in smoke (AD text only → STOP)
6. Inspector may show Ревью / Logs pin — no «Перерисовать» remake CTA (product)

## Executable

```bash
npx tsx scripts/verify-variant-a-ad-guards.ts
```

Assert ids: `G5_*`, `G6_*`

## Evidence (2026-10-18)

- 4 PNG + `art-director-review.md` on disk (docs + generatedMedia)
- Flowchart node order PASS
- Wave: `memory/waves/2026-10-18-variant-a-art-director/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-variant-a-art-director

## Note

Deployer / Client Playwright @1440 not required for this Tester step (user: no deploy; Client optional).
