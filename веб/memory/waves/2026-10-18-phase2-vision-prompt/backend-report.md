# Backend report — 2026-10-18-phase2-vision-prompt

**Role:** Backend (sequential after AI Bridge)  
**Logo quality:** **Path A** — emblem PNG + HTML wordmark + `logo.textColor`

## Changes

| File | What |
|------|------|
| `lib/studio/carousel-json-contract.ts` | `html_layout.logo.textColor` optional hex; aliases `logoTextColor` / `logo.text_color` via `normalizeHtmlLayoutRaw` |
| `lib/studio/carousel-layered-composite.ts` | `BRAND_LOGO_SIZE_PX=200`; `BRAND_EMBLEM_REF`; `resolveLogoTextColor`; Path A `splitEmblemWordmark` → emblem `<img>` + `.brand-name` colored; crisp image-rendering; no aggressive matte on emblem |
| `lib/studio/carousel-html-renderer.ts` | Prefer emblem for Puppeteer; `splitEmblemWordmark: true`; vision_ref scrubs Manrope `@font-face`; soft conductorDesc |

## Smoke

```bash
npx tsx scripts/verify-phase2-vision-prompt-unit.ts
npx tsx scripts/smoke-phase2-vision-prompt.ts
```

**Out:** `docs/карусель тест/phase2-vision-prompt-smoke/` — **PASS** (6 PNG + HTML + `SMOKE-REPORT.md` + sample prompts)

## Guards

| Guard | Result |
|-------|--------|
| IMAGE prompt no positive stock locks | PASS |
| sanitize NO TEXT/NO LOGO | PASS |
| Designer overlay ban clean | PASS |
| Path A emblem+wordmark + textColor | PASS |
| No Manrope in composite HTML | PASS |
| Size 200 | PASS |

## Out of scope

- Phase 3 character sheet  
- VPS / publish / DB wipe  
