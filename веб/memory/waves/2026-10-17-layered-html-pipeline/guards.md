# Guards — 2026-10-17 LAYERED HTML pipeline (S57)

**Date:** 2026-10-17  
**Role:** Тестировщик  
**Wave:** `memory/waves/2026-10-17-layered-html-pipeline/`  
**Verdict:** **GREEN** (unit + artifact matrix). Live Create draw = Client S57 Playwright.  
**Do not weaken.**

---

## Commands / checks run

| # | Check | Result |
|---|--------|--------|
| 1 | `isCarouselLayeredHtmlPipeline()` / missing env → `true` | **PASS** |
| 2 | `resolveCarouselRenderMode()` → `layered_html` | **PASS** |
| 3 | `BACKGROUND_ONLY_HARD_BAN` has NO TEXT + NO LOGOS | **PASS** |
| 4 | `sanitizeBackgroundImagePrompt` strips paint-headline + appends ban | **PASS** |
| 5 | `assertBackgroundOnlyPrompt` fails without ban; ok after guard | **PASS** |
| 6 | zod `secondary_copy: z.string().min(1)` + empty secondary rejected | **PASS** (`zod_reject_empty_secondary`) |
| 7 | Layered draw branch: `vision=OFF`, `needsReview: false` | **PASS** (source `carousel-html-renderer.ts` layeredOn) |
| 8 | Artifacts `docs/карусель тест/layered-smoke-4/` = 4× PNG 1080×1350 + timeline/README | **PASS** |
| 9 | Old `smoke-useful-51-1-17/` empty (0 files) | **PASS** (shell may remain on Windows) |
| 10 | Unit dump | `memory/waves/2026-10-17-layered-html-pipeline/tester-unit.json` |

**Reusable:** `npx tsx` import asserts on `create-carousel-prompts` + `carousel-json-contract` (see tester-unit.json).

---

## Assert matrix (S57 HARD)

### G1 — Product default = `layered_html`

- `isCarouselLayeredHtmlPipeline()` **true** when env missing / `layered_html` / `default` / `layered` / `s57`.
- `resolveCarouselRenderMode()` → **`layered_html`**.
- Intake job stamps `pipeline: "layered_html"` (`correct-pipeline-job.ts`, sheet generate route).
- Create draw primary branch `layeredOn` → `renderMode: "layered_html"`.
- `correct_pipeline` only when explicit archaeology (`CAROUSEL_PIPELINE=correct`).

### G2 — `secondary_copy` REQUIRED

- Contract: `secondary_copy: z.string().min(1)` in `carousel-json-contract.ts`.
- Belt: `assertSecondaryCopyRequired` / parse fails on empty secondary.
- Critic-05 + Scriptwriter overlays: secondary REQUIRED every slide (2–3 practical sentences).

### G3 — Bg prompt helpers ban logo/text

- Exports: `BACKGROUND_ONLY_HARD_BAN`, `appendBackgroundOnlyGuard`, `sanitizeBackgroundImagePrompt`, `assertBackgroundOnlyPrompt`, `buildLayeredBackgroundImagePrompt`.
- Ban text must include **NO TEXT** and **NO LOGO(S)**.
- Sanitize strips paint-headline / add-text / integrated-typography leakage before image call.
- Renderer layered path uses these helpers before image API.

### G4 — Vision OFF on layered

- Layered branch logs `vision=OFF`; returns `needsReview: false` (never OCR regen).
- Vision ≤2 loop only on archaeology `correctOn` path (`!layeredOn`).
- Timeline / README smoke: vision OFF.

### G5 — Smoke artifacts (Client score set)

| Item | Assert |
|------|--------|
| Folder | `docs/карусель тест/layered-smoke-4/` |
| PNG | `slide_01.png`…`slide_04.png` @ **1080×1350** |
| Docs | `timeline.md` + `README.md` (+ optional `01-row-1-timeline.md`) |
| Budget | **4** finals (≤8 without stop-report) |
| Old set | `docs/карусель тест/smoke-useful-51-1-17/` **gone or empty** |

Measured 2026-10-17: dims 1080×1350; old folder file count **0**.

### G6 — KEEP chrome (not re-tested as draw; Client optional)

- CTA catalog 1–4 as HTML button on `cta_slide` only.
- `swipe_trigger` meta only (never painted).
- Settings Brand / Персонажи remain (S55 chrome KEEP).

### G7 — shell_freeze

- AppShell / left-nav IA not in wave draw path; no chrome redesign claimed.

---

## Tickets covered

| Ticket | Guard path |
|--------|------------|
| C-s57-layered-default | `memory/tickets/C-s57-layered-default/guards.md` |
| C-s57-secondary-bg-vision | `memory/tickets/C-s57-secondary-bg-vision/guards.md` |
| C-s57-smoke-4 | `memory/tickets/C-s57-smoke-4/guards.md` |

Regression line: `.cursor/skills/client-review/regression-guards.md` → **W-2026-10-17 layered-html S57**.

---

## Fixer

**None** for wave paths — all listed asserts GREEN.

## Next

Deployer → localhost URL → Client **S57** (Playwright @1440 + 4 PNG taste vs etalon #3).
