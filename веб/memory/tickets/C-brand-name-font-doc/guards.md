# C-brand-name-font-doc — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** `.brand-name` uses content font token (documented)

## Permanent asserts

1. CSS: `.brand-name { font-family: var(--cf-font-content, var(--cf-font-body)); }`
2. No Inter hardcode on brand name
3. Optional display-family switch remains P2 (default keep content)

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G6_*`

## Evidence (2026-10-18)

- Composite source + smoke HTML both use `--cf-font-content`
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
