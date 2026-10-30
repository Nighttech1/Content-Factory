# Guards — Wave 2026-10-18 Gemini AD + logo dual-path + type scale + rich visual + smoke 6

**Role:** Тестировщик · chain step 5  
**Date:** 2026-10-18  
**Spec:** `architect-spec.md` §8 (G1–G9)  
**Executable:** `npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts` → **25/25 PASS**  
**Deploy:** skipped (user / Orchestrator: **no deploy** this turn)

## Verdict: GREEN

| Guard | Result | Evidence |
|-------|--------|----------|
| G1 Type scale SoT | PASS | `resolveTypeScaleCss(cover_center, {cover:40…})` → `.primary` **40px** (not 64); body → **h2**; smoke HTML `data-type-scale="preset"` |
| G2 Designer inject | PASS | `formatTypeScaleInjectBlock` + `resolveCreateCarouselOverlay("designer","draw")` print **40px** TYPE SCALE block |
| G3 Gemini default | PASS | `ART_DIRECTOR_DEFAULT_MODEL` / `resolveArtDirectorModel()` = `google/gemini-2.5-flash` (not gpt-4o); env override works |
| G4 No remake | PASS | `art-director-run.ts` no `enqueue`/`addJob`/`queue.add`; `remakeEnqueued: false`; smoke AD md **NO remake** |
| G5 Logo dual-path | PASS | `logoRef` = sanitize stub; `logoRefRaw` = raw; smoke HTML has brand `<img src="data:image/…">` |
| G6 Brand font doc | PASS | `.brand-name` → `var(--cf-font-content, var(--cf-font-body))` in composite + smoke HTML |
| G7 Rich VP | PASS | `VISUAL_PROMPT_RICHNESS_HARD` ≥3 elements + Armenian/Vernatun motifs |
| G8 Pretty num | PASS | `formatPrettySlideNum(2,6)` → `03/06`; smoke `slide_03.html` contains `03/06` |
| G9 Smoke 6 + AD | PASS | 6 PNG + `art-director-review.md`/`.json`; model Gemini; verdict approve; remake false |

---

## Permanent asserts (class of defect)

### G1 — Type scale SoT (`C-type-scale-sot`)

1. With `typography.scale.cover=40`, coverish template `.primary` CSS = **`40px`** (hardcoded 64 = fallback **only** when scale missing).
2. Body templates (e.g. `body_left`) use **`scale.h2`** for `.primary`.
3. `.secondary` ← `scale.body`; `.slide-num` ← `scale.caption` (or ≤ caption band).
4. Smoke / composite frames expose `data-type-scale="preset|fallback"`.

**Paths:** `lib/studio/carousel-layered-composite.ts` (`resolveTypeScaleCss`, `scaleFromPreset`)

### G2 — Designer TYPE SCALE inject (`C-type-scale-sot`)

1. Every Designer draw overlay includes `## TYPE SCALE (HARD)` with **numeric** cover/h2/body/caption (or title/body/content map).
2. Overlay states: composite owns px; `html_layout` = placement only; do **not** invent 64px.

**Paths:** `lib/studio/create-carousel-prompts.ts` (`formatTypeScaleInjectBlock`, `resolveCreateCarouselOverlay`)

### G3 — Art Director Gemini vision default (`C-ad-gemini-vision`)

1. Without `ART_DIRECTOR_MODEL`, default = **`google/gemini-2.5-flash`** (acceptable alt `google/gemini-2.0-flash` only if documented).
2. Must **not** silently fall through to `openai/gpt-4o` when PNGs exist.
3. `ART_DIRECTOR_MODEL` env wins when set.

**Paths:** `lib/studio/art-director-review.ts` · `lib/studio/art-director-run.ts`

### G4 — NO auto-remake (`C-ad-gemini-vision` · keep `ad_no_remake`)

1. `runArtDirectorReview` always returns `remakeEnqueued: false`.
2. AD code path has **no** `enqueue(` / `addJob(` / `queue.add(` and no Designer redraw wire.
3. Smoke AD artifact contains **NO remake** section / `remakeEnqueued: false`.

**Paths:** `lib/studio/art-director-run.ts` · smoke `art-director-review.*`

### G5 — Logo dual-path (`C-logo-dual-path`)

1. `buildCorrectPlaceholders`: `logoRef` = `sanitizeLogoRefForLlm`; **`logoRefRaw`** = raw Brand `logoRef`.
2. Playwright composite resolves via `logoRefRaw` → else non-stub `logoRef` → else fresh Brand store; stubs (`[brand logo present…` / `[truncated N chars]`) never become `<img src>`.
3. When Brand has logo: smoke HTML includes real brand `<img>` (data-URL / resolvable src), not name-only.

**Paths:** `lib/intake/placeholders.ts` · `lib/studio/carousel-html-renderer.ts` (`resolveBrandLogoForPlaywright`, `isSanitizedLogoStub`)

### G6 — Brand name font documented (`C-brand-name-font-doc`)

1. `.brand-name { font-family: var(--cf-font-content, var(--cf-font-body)); }`
2. No Inter hardcode on brand name. Optional display switch = P2 (not required).

**Paths:** `lib/studio/carousel-layered-composite.ts` · `backend-report.md`

### G7 — Scriptwriter rich `visual_prompt` (`C-visual-prompt-rich-hy`)

1. Overlay contains ≥3 concrete scene elements rule + Armenian/Vernatun motif wording.
2. One-liner «красивый фон» / vague vibe = FAIL wording (critic soft-fail OK).

**Paths:** `lib/studio/create-carousel-prompts.ts` (`VISUAL_PROMPT_RICHNESS_HARD`)

### G8 — Pretty slide numbers (`C-smoke-6-pretty-num`)

1. Format zero-pad `N/M` when total ≤ 99 → e.g. slide index 2 of 6 = **`03/06`**.
2. Composite HTML `.slide-num` renders pretty badge (not bare `03`).

**Paths:** `lib/studio/carousel-layered-composite.ts` (`formatPrettySlideNum`)

### G9 — Smoke ONE × 6 + AD Gemini (`C-smoke-6-pretty-num`)

Canon folder:

`docs/карусель тест/gemini-ad-logo-visual-smoke-6/`  
(+ mirror `generatedMedia/gemini-ad-logo-visual-smoke-6/`)

| Artifact | Required |
|----------|----------|
| `slide_01.png` … `slide_06.png` | exactly **6** finals |
| `art-director-review.md` | present (verdict + **NO remake**) |
| `art-director-review.json` | model Gemini; `remakeEnqueued: false` |
| optional | `timeline.md`, `README.md`, `slide_0N.html` |

**Hard:** STOP after AD (no remake loop). Budget ≤8 finals; target exactly 6.

---

## Evidence run (2026-10-18)

```text
npx tsx scripts/verify-gemini-ad-logo-visual-guards.ts
SUMMARY 25/25 PASS
```

Smoke AD sample (`art-director-review.json`):

- `verdict`: `approve`
- `model`: `google/gemini-2.5-flash`
- `source`: `vision`
- `remakeEnqueued`: `false`
- remarks: `[]`

Spot-checks on smoke HTML:

- `slide_03.html` → `03/06`
- brand `<img src="data:image/png;base64,…">` present
- `.brand-name` → `--cf-font-content`
- `data-type-scale="preset"`

---

## Tickets

| Ticket | Guard file |
|--------|------------|
| C-type-scale-sot | `memory/tickets/C-type-scale-sot/guards.md` |
| C-ad-gemini-vision | `memory/tickets/C-ad-gemini-vision/guards.md` |
| C-logo-dual-path | `memory/tickets/C-logo-dual-path/guards.md` |
| C-brand-name-font-doc | `memory/tickets/C-brand-name-font-doc/guards.md` |
| C-visual-prompt-rich-hy | `memory/tickets/C-visual-prompt-rich-hy/guards.md` |
| C-smoke-6-pretty-num | `memory/tickets/C-smoke-6-pretty-num/guards.md` |

## Regression registry

`.cursor/skills/client-review/regression-guards.md` · **W-2026-10-18-gemini-ad-logo-visual**

## Out of this step

- Deployer localhost / VPS — **not run** (user: no deploy)
- Client Playwright @1440 — optional, not armed
- Fixer — **skip** (Tester GREEN)
