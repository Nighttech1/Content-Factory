# C-art-director-agent — guards

**Wave:** 2026-10-18-variant-a-art-director  
**Class:** Art Director worker + prompts + job step + persist; **NO auto-remake**

## Permanent asserts

1. `runArtDirectorReview` / `POST /api/studio/art-director/review` always expose `remakeEnqueued: false`
2. AD code path has **no** `enqueue(` / `addJob(` / `queue.add(` and no Designer/composite redraw wire
3. Verdict zod: `approve | remarks` (+ remarks array)
4. Pipeline job may call AD **once** after finals; remarks must not start a second draw in the same job
5. Prompt lock: «Не запускай перерисовку» / NO remake wording in system prompt

## Executable

```bash
npx tsx scripts/verify-variant-a-ad-guards.ts
```

Assert ids: `G4_*`

Manual grep (belt):

```bash
# expect: comment-only «enqueue», no call sites that redraw
rg -n "enqueue|addJob|queue\\.add" lib/studio/art-director-run.ts app/api/studio/art-director/
```

## Evidence (2026-10-18)

- G4 PASS; smoke `art-director-review.md` contains **NO remake**
- Wave: `memory/waves/2026-10-18-variant-a-art-director/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-variant-a-art-director
