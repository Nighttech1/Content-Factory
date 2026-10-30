# C-logo-dual-path — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** LLM gets sanitized `logoRef`; Puppeteer gets raw `logoRefRaw` / Brand store

## Permanent asserts

1. `buildCorrectPlaceholders` sets both `logoRef` (sanitize) and `logoRefRaw` (raw)
2. `isSanitizedLogoStub` detects `[brand logo present…` / `[truncated N chars]`
3. Composite never uses stub as `<img src>`
4. When Brand logo exists → smoke HTML has real brand `<img>`

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G5_*`

## Evidence (2026-10-18)

- Smoke HTML brand `<img data:image/png;base64,…>` present
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
