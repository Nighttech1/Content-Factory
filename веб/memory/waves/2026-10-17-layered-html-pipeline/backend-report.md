# Backend report — C-s57-backend-composite

**Wave:** `memory/waves/2026-10-17-layered-html-pipeline/`  
**Date:** 2026-10-17  
**Role:** Backend  
**Ticket:** C-s57-backend-composite  

## Done

Product Create/intake draw path defaults to **`layered_html`**: background image (sanitized, no text/logo) → HTML/CSS Puppeteer composite @ **1080×1350** → final PNG. Vision OCR loop **OFF**. `correct_pipeline` remains archaeology only (`CAROUSEL_PIPELINE=correct`).

## Files changed

| File | Change |
|------|--------|
| `lib/studio/carousel-fonts.ts` | **NEW** — parse 3 DESIGN.md/preset roles (title/body/content); download woff2 → `public/fonts/`; `@font-face` CSS |
| `lib/studio/carousel-layered-composite.ts` | **NEW** — layered HTML template: bg → optional character cut-out → Brand name+logo → primary/secondary → CTA HTML button on `cta_slide` only; safe 120/160; swipe never painted |
| `lib/studio/carousel-html-renderer.ts` | Primary branch `layeredOn`; `renderMode: "layered_html"`; bg via `buildLayeredBackgroundImagePrompt` / `sanitizeBackgroundImagePrompt` / `assertBackgroundOnlyPrompt`; data-URI embed for Playwright; vision skipped; E2E/correct only when layered gate OFF |
| `lib/intake/correct-pipeline-job.ts` | Draw `pipeline: "layered_html"`; Scriptwriter overlay layered; `suggestAutoSlideCountForTopic`; hero cut-out URL from Персонажи store; payload `pipeline: "layered_html"` |
| `lib/intake/smoke-prompt-trace.ts` | Default dir → `layered-smoke-4`; timeline label layered; vision OFF note |
| `lib/intake/types.ts` | `CorrectDraftPayloadFlags.pipeline` = `layered_html \| correct` |
| `app/api/intake/sheet/generate/route.ts` | Response `pipeline: "layered_html"` |
| `scripts/smoke-layered-4.ts` | **NEW** — ONE row × 4 slides Client-score smoke |
| `scripts/smoke-useful-51-1-17.ts` | **RETIRED** (points to layered-4) |
| `scripts/recompose-layered-smoke-bg.ts` | One-shot fix: re-raster existing `.bg.png` after data-URI embed (no new image API spend) |

## Smoke deliverable (HARD)

| Item | Path |
|------|------|
| **Canon folder** | `docs/карусель тест/layered-smoke-4/` |
| Finals | `slide_01.png` … `slide_04.png` (~1.2–1.7 MB each after recompose) |
| Timeline | `timeline.md` (+ `01-row-1-timeline.md`) |
| README | `README.md` |
| Media mirror | `generatedMedia/layered-smoke-4/` |
| Job artifacts | `public/generated/carousel/sheet_f49f4cfa0ddb4dbf/` (`.bg.png` + `.html` + finals) |

**Topic:** useful row `1` — «Как научить ребёнка армянскому без ссор: 5 способов»  
**Forced slides:** 4 (Client score; auto-7 not applied for this smoke)  
**draftId:** `draft_correct_sheet_f49f4cfa0ddb4dbf`  
**renderMode (trace):** `layered_html` · vision OFF · fonts Geist Sans + Geist Mono + Noto Sans Armenian  
**CTA slide 04:** HTML button «Напишите в комментариях» (catalog 1)

### Old smoke DELETE

- Contents of `docs/карусель тест/smoke-useful-51-1-17/` **removed** (0 files).
- Empty directory shell may remain on Windows (`EBUSY` lock from IDE) — no timelines/PNGs left. Treat as deleted for Client S57.C.

### Fix note (same wave)

First Playwright pass used `file://` bg URLs → black plates. Fixed to **data-URI embed** in renderer; recomposed the same 4 bg plates without new image gens (`scripts/recompose-layered-smoke-bg.ts`).

## Contract summary

1. Default gate = layered (missing env / `layered_html` / `default`).  
2. Step A: sanitized bg prompt only. Step B: HTML composite (Brand, 3 fonts, type, CTA button, optional cut-out on cover).  
3. `swipe_trigger` never in HTML. Vision never enqueued on product path.  
4. Intake + Create draw (no explicit pipeline) → layered.  
5. Budget: 4 finals for Client score (≤8).

## Not touched (path lock)

- `create-carousel-prompts.ts` / zod overlays (AI Bridge)  
- SettingsShell / AppShell  
- Prompt prose invent  

## Next

**Tester** — guards for single layered default, vision OFF, secondary_copy, bg ban hooks, smoke folder rewrite → Deployer → Client S57.A–C.
