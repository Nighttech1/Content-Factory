# C-visual-prompt-rich-hy — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** Scriptwriter `visual_prompt` richness (≥3 elements + Armenian/Vernatun motifs)

## Permanent asserts

1. Overlay / `VISUAL_PROMPT_RICHNESS_HARD` requires ≥3 concrete scene elements
2. Armenian / Vernatun motif wording present when topic allows
3. Vague one-liner («красивый фон») marked FAIL / soft-fail warning path

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G7_*`

## Evidence (2026-10-18)

- Constant grep PASS in wave script
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
