# Backend report — 2026-10-18 gemini-ad-logo-visual

**Role:** Backend · step 3  
**Spec:** `architect-spec.md` §5.1 / §5.2 / §5.3 / §5.4 / §5.6  
**Status:** DONE — code + smoke GREEN

## Delivered

| Ticket | Change |
|--------|--------|
| **C-logo-dual-path** | `buildCorrectPlaceholders` sets `logoRef` = `sanitizeLogoRefForLlm` **and** `logoRefRaw` = raw Brand `logoRef`. `carousel-html-renderer` resolves Playwright logo via `logoRefRaw` → else non-stub `logoRef` → else fresh `getBrandSettings().logoRef`. Stubs (`[brand logo present…` / `[truncated N chars]`) never become `<img src>`. |
| **C-type-scale-sot** | `carousel-layered-composite`: `resolveTypeScaleCss` maps `preset.typography.scale` → `.primary` / `.secondary` / `.brand-name` / `.slide-num` / `.cta-btn` px. Coverish templates use `scale.cover`; body templates use `scale.h2`. Hardcoded 64/52/… = **fallback only**. `data-type-scale="preset\|fallback"`. |
| **C-smoke-6-pretty-num** | `.slide-num` → pretty `01/06` (zero-pad) as accent corner chip (pill + accent border + blur). Smoke: `docs/карусель тест/gemini-ad-logo-visual-smoke-6/`. |
| **C-ad-gemini-vision** | `art-director-run.ts` uses `resolveArtDirectorModel()` / `ART_DIRECTOR_DEFAULT_MODEL = google/gemini-2.5-flash`. Dropped `CAROUSEL_VISION_MODEL` → `openai/gpt-4o` fallback. |
| **C-brand-name-font-doc** | `.brand-name` keeps `font-family: var(--cf-font-content, var(--cf-font-body))` (documented in composite CSS comment + this report). Optional display switch = P2 not taken. |

## Brand logo load

- `getBrandSettings` / `putBrandSettings` run `normalizeBrandLogoRef`: data:/https:/file: passthrough; resolves `/brand/…` under `public/`; relative uploads under cwd / `data/local/brand-logos/`.
- Existing seed admin store has large `data:image/png;base64,…` logo → dual-path feeds **raw** to Puppeteer (verified: `logoRefRawLen≈363610`, LLM stub only on `logoRef`).

## Files touched

- `lib/intake/placeholders.ts`
- `lib/studio/carousel-html-renderer.ts`
- `lib/studio/carousel-layered-composite.ts`
- `lib/studio/art-director-run.ts`
- `lib/settings/brand-store.ts`
- `lib/intake/correct-pipeline-job.ts` (timeline: `LOGO_REF_RAW=present (N chars)`)
- `scripts/smoke-gemini-ad-logo-visual-6.ts`
- this report

## Local verifies (pre-smoke)

```
pretty(2,6) → 03/06
scale cover_center {cover:40…} → primary 40px (not 64)
AD default → google/gemini-2.5-flash
placeholders → logoRef=stub, logoRefRawLen=363610
```

## Smoke — GREEN

```bash
npx tsx scripts/smoke-gemini-ad-logo-visual-6.ts
# exit 0 · ~214s
```

Folder `docs/карусель тест/gemini-ad-logo-visual-smoke-6/`:

| Artifact | Result |
|----------|--------|
| `slide_01.png` … `slide_06.png` | 6 / 6 |
| `timeline.md` | yes |
| `art-director-review.md` + `.json` | yes |
| AD model | `google/gemini-2.5-flash` (vision) |
| AD verdict | `approve` · remarks 0 · **NO remake** |
| brand logo `<img>` | **true** (data-URL logoRef dual-path) |
| pretty `N/M` | **true** |
| row | useful `1` — армянский без ссор |

## Explicitly NOT done

- Frontend Brand panel JSX (omit — upload already persists; dual-path sufficient)
- Prompt prose (AI Bridge step 2)
- Tester guards.md (step 5)

## Next

**Tester** — G1–G9 → `guards.md`.
