# C-smoke-6-pretty-num — guards

**Wave:** 2026-10-18-gemini-ad-logo-visual  
**Class:** Pretty `N/M` slide badge + ONE 6-slide smoke + AD Gemini artifact

## Permanent asserts

1. `formatPrettySlideNum(2, 6)` → `03/06` (zero-pad both sides)
2. Smoke folder has exactly **6** PNG finals
3. `art-director-review.md` + `.json` present; Gemini model; **NO remake**
4. HTML `.slide-num` shows pretty badge (not bare index)

## Executable

```bash
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
```

Assert ids: `G8_*`, `G9_*`

Canon path: `docs/карусель тест/gemini-ad-logo-visual-smoke-6/`

## Evidence (2026-10-18)

- 6 PNG sizes ~1.7–2.2 MB each; AD approve @ `google/gemini-2.5-flash`
- Wave: `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## Regression

See `.cursor/skills/client-review/regression-guards.md` · W-2026-10-18-gemini-ad-logo-visual
