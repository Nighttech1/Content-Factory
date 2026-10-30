# C-ad-gemini-vision — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** Art Director default Gemini vision; completeness critique; **NO auto-remake**

## Permanent asserts

1. Default model = `google/gemini-2.5-flash` when `ART_DIRECTOR_MODEL` unset (not silent `openai/gpt-4o`)
2. Env `ART_DIRECTOR_MODEL` overrides
3. System/checklist: virality + design + **content completeness**; thin slides → remarks
4. `remakeEnqueued` always `false`; no enqueue/draw from AD path

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G3_*`, `G4_*`, `G9_ad_*`

## Evidence (2026-10-18)

- Smoke AD: model `google/gemini-2.5-flash`, verdict `approve`, `remakeEnqueued: false`
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
