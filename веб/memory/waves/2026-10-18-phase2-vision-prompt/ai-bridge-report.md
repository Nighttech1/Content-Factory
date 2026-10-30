# AI Bridge report — 2026-10-18-phase2-vision-prompt

**Role:** AI Bridge  
**Spec:** `architect-spec.md` · Path A logo  
**Review artifact:** `CLEAN-IMAGE-PROMPT.md` (from `IMAGE-PROMPT-AUDIT.md`)

## Changes

| File | What |
|------|------|
| `lib/studio/create-carousel-prompts.ts` | Replaced `buildVisionRefBackgroundImagePrompt` with CLEAN canon (HARD-COPY etalon; soft conductor; no `#FF5A1F` / idx%2 / Photoreal-CGI / house lock). Added `extractVisionRefVisualSubject`. Softened `VISION_STYLE_COPY_HARD`. Designer vision_ref overlay: **MUST** emit `logo.textColor`. Path A logo hint. KEEP `sanitizeBackgroundImagePrompt` + NO TEXT/NO LOGO. |

## How to verify

```bash
npx tsx scripts/verify-phase2-vision-prompt-unit.ts
# sample prompts also in docs/карусель тест/phase2-vision-prompt-smoke/sample-image-prompts.md
```

## Notes

- Phase 3 Pixar product OUT — only hygiene wording («not 3D Pixar invent»).
- Ban-grep: overlay does **not** spell banned substrings (Manrope / FULL DESIGN TOKEN) even in BAN lines — uses paraphrases so `assertVisionRefPromptBanClean` stays clean.
