# Architect Spec — 2026-10-18 Gemini AD + logo dual-path + type scale + rich visual + 6-slide smoke

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-gemini-ad-logo-visual`  
**Цель:** закрыть 6 подтверждённых багов поверх уже живого Variant A + Art Director (S57 layered HTML)  
**Client gate:** optional (Orchestrator); product keep **S57** + Variant A  
**ticket_limit:** `full-queue` (пункты 1–6 одним проходом; лимит ≤3 **не** режет)  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**upgrade_only:** `true` (patch prompts + composite + AD model + smoke; **не** rewrite Create chrome)  
**Frontend:** **omit** unless Brand logo upload/preview broken (escalation gate §9)  
**Trainer:** `memory/trainer/2026-10-18-gemini-ad-visual-logo-grade.md` (grade **A**)  
**Canon cards:** `plugins/trainer/variant-a-art-director.md` · `create-carousel-prompts-notes` (TYPE SCALE / LOGO / RICHNESS / AD Gemini)  
**Skills:** `art-director` (+ critique-checklist · html-layout-variant-a) · `carousel-json-contract` Phase 7 · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester` · `prompt-engineering`  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-gemini-ad-logo-visual/chain.md`

---

## 1. Зачем (простым языком)

Карусель уже собирается правильно по схеме S57: нейросеть рисует **только фон**, текст/лого/CTA кладутся **HTML-слоем**. Но на практике сейчас четыре поломки вкуса и одна дыра в проверке:

1. В DESIGN.md задан **размер шрифтов** (`typography.scale`), а код композита всё равно ставит **большие** пиксели из шаблона (64px cover и т.п.). LLM Дизайнера тоже «думает крупно» — текст обрезается / не совпадает с брендом.
2. Арт-директор по умолчанию смотрит через **gpt-4o**, а не **Gemini vision**, и легко уходит в «разбор сценария», а не в пиксели (виральность + дизайн + полнота смысла). Тонкие слайды из двух предложений не ловятся жёстко.
3. Логотип из Settings Brand для LLM **очищают** (чтобы не слать огромный base64) — и этот же «обрезанный» stub уходит в Puppeteer → на кадре **только имя**, без картинки лого.
4. Шрифт названия клуба (`.brand-name`) уже на `--cf-font-content`, но это **не задокументировано** в контракте волны; опционально можно взять display-семейство для имени.
5. `visual_prompt` сценариста часто — одно общее предложение без армянских/Vernatun мотивов → плоские фоны.
6. Smoke всё ещё «4 слайда» и номер на кадре — просто `01`, без красивого **01/06**.

Волна чинит **контракты и runtime** (AI Bridge → Backend → Tester → smoke). UI Brand трогаем **только** если upload лого реально сломан.

---

## 2. Confirmed bugs → locks (HARD)

| # | Bug (confirmed) | Lock id | Acceptance (языком Клиента / Tester) |
|---|-----------------|---------|--------------------------------------|
| 1 | DESIGN `typography.scale` не управляет composite px; LLM layout assumes large type | `type_scale_sot` | SoT = active DESIGN / DesignPreset `typography.scale` → CSS `font-size` на `.primary` / `.secondary`. `html_layout` = placement only. Designer prompt **prints** scale numbers every draw. |
| 2 | Art Director not Gemini vision; thin slides slip; remake risk | `ad_gemini_vision` | Default model = Gemini flash via aggregator (`ART_DIRECTOR_MODEL` **or** `google/gemini-2.5-flash` / `google/gemini-2.0-flash`). Critique = virality + design craft + **content completeness**. Thin ~2-sentence body → `remarks` P1. **NO auto-remake.** |
| 3 | `sanitizeLogoRefForLlm` breaks Playwright composite | `logo_dual_path` | LLM channel: sanitized stub OK. Composite / Playwright: **raw** `logoRef` (field `logoRefRaw` **or** fresh `getBrandSettings().logoRef` at render). Name-only when logo set = **FAIL**. |
| 4 | Club name font undocumented | `brand_name_font_doc` | Document: `.brand-name` uses `var(--cf-font-content, var(--cf-font-body))`. Optional: Architect-allowed switch to display family for name only — **default keep content**. No Inter hardcode. |
| 5 | `visual_prompt` too thin / non-Armenian | `visual_prompt_rich_hy` | Scriptwriter: each slide `visual_prompt` = **≥3 concrete scene elements** + Armenian / Vernatun motifs when topic allows. One-liner «красивый фон» = FAIL (prompt + Tester sample assert). |
| 6 | Smoke 4-slide; bare slide number | `smoke_6_pretty_num` | Smoke = **ONE** **6-slide** layered carousel + AD Gemini artifact. HTML badge **pretty** `01/06` (zero-pad current / total). |

### Keep from prior waves (do not reopen)

| Keep | Rule |
|------|------|
| `s57_layered` | image bg + HTML/CSS Puppeteer @ 1080×1350; OCR remake vision **OFF** |
| `variant_a` | `html_layout` closed templates; composite executes; no raw HTML from LLM |
| `ad_no_remake` | AD `approve` \| `remarks` only; never enqueue Designer / redraw |
| `cta_1_4` / `swipe_meta` | CTA catalog 1–4 on HTML; `swipe_trigger` meta only |
| `hitl_publish` | AD approve ≠ social publish |
| `shell_freeze` | no AppShell / nav redesign |
| `no_silent_social` | no Meta/IG publish this wave |
| `secrets` | never in memory / skills / reports |

---

## 3. Target flow (patched)

```text
Scriptwriter
  → Dramaturgy JSON
  → visual_prompt RICH (≥3 elements + Armenian/Vernatun motifs)  [AI Bridge]
  → Designer
       (a) receives TYPE SCALE numbers from DESIGN (print in system)  [AI Bridge]
       (b) html_layout = placement only (no invent px)
       (c) bg from visual_prompt scene-only
  → Image model → bg plates
  → Placeholders split:
       logoRef (sanitized) → LLM prompts only
       logoRefRaw / getBrandSettings().logoRef → composite <img>   [Backend]
  → carousel-layered-composite
       font-size from typography.scale (map cover→title, body→body, …)
       .brand-name → --cf-font-content (documented; optional display)
       .slide-num → "01/06" pretty badge
       Puppeteer → slide_01.png … slide_06.png
  → Art Director ONCE (Gemini vision)
       virality + design + content completeness
       thin slides → remarks
       STOP — NO remake
  → Draft / HITL unchanged
```

---

## 4. Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Frontend: OMIT (unless Brand logo upload broken — §9)        │
│ shell_freeze AppShell                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ (optional escalate only)
┌──────────────────────────▼───────────────────────────────────┐
│ AI Bridge: TYPE SCALE inject; Scriptwriter rich VP;          │
│ AD checklist+system Gemini wording; agent-defaults sync      │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Backend: composite scale map; logo dual-path; slide-num;     │
│ ART_DIRECTOR default Gemini; placeholders split; smoke ×6    │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Tester: guards 1–6 + smoke ONE×6 + AD artifact               │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | `create-carousel-prompts.ts` overlays (TYPE SCALE block print; Scriptwriter `visual_prompt` richness FAIL rules; Designer «do not invent px»); `art-director-review.ts` checklist sync (completeness + thin slides + type/logo); mesh `agent-defaults` AD/Scriptwriter/Designer prompt deltas if needed; notes align with skills | `carousel-layered-composite.ts` CSS impl; AppShell; BrandPanel JSX |
| **Backend** | `carousel-layered-composite.ts` scale→CSS + pretty `N/M` + brand-name doc comment; `placeholders.ts` dual-path (`logoRef` sanitized + `logoRefRaw`); composite/draw call sites use **raw** logo; `art-director-run.ts` default model Gemini; smoke script/path **6** slides + AD artifact | Prompt prose invent beyond thin wire; Create modal; AppShell |
| **Frontend** | **Skip by default.** Only if §9 gate: Brand logo upload/preview so Settings stores a resolvable `logoRef` | AppShell; Create redesign; mesh geometry |
| **Tester** | Guards + smoke presence (6 PNG + AD md/json); grep asserts dual-path / Gemini default / scale yield | Product invent |
| **Deployer** | Localhost refresh before smoke if Orchestrator arms | Prod/VPS |
| **Smoke** | ONE 6-slide + AD Gemini text; stop even if remarks | Remake loop |

---

## 5. Contracts (Architect FINAL)

### 5.1 Type scale SoT

**Source:** `DesignPresetFile.typography.scale` (example shape already in presets):

```ts
scale: { cover: number; h2: number; body: number; caption: number } // px
```

**Composite map (lock):**

| CSS selector / role | Scale bucket |
|---------------------|--------------|
| `.primary` on cover / `cover_center` / quote-ish | `scale.cover` |
| `.primary` on body templates (`body_left`, `body_split`, `tip_card`, …) | `scale.h2` |
| `.secondary` | `scale.body` |
| `.slide-num`, small chrome | `scale.caption` (or fixed ≤ caption) |
| CTA button | keep readable; prefer `scale.body`–`h2` band — **not** cover |

**Rules:**

1. If `scale` present on active preset / `designPaletteJson` → **must** drive `font-size` (append `px`).  
2. `templatePrimarySize()` hardcoded 64/52/… → **yield** to scale; keep as **fallback only** when scale missing/null.  
3. Pass resolved scale into layered HTML builder (parse from `designPaletteJson` / preset already on placeholders).  
4. AI Bridge: every Designer system overlay must include explicit TYPE SCALE block with **numeric** title/body/content (or cover/h2/body/caption) — not families alone. `buildDesignTokensPayload` already has `scale`; ensure Create/Designer path **prints** it (see `create-carousel-prompts-notes` § Typography scale inject).

**FAIL:** LLM invents «huge Instagram type»; composite ignores preset and paints 64px when scale.cover=52 (or smaller brand scale).

### 5.2 Art Director — Gemini vision

| Item | Lock |
|------|------|
| Env | `ART_DIRECTOR_MODEL` wins when set |
| Default (code) | Prefer aggregator Gemini id: **`google/gemini-2.5-flash`** first; acceptable alt **`google/gemini-2.0-flash`** (or `google/gemini-2.5-flash-lite` only if flash unavailable — note in backend-report). **Do not** default to `openai/gpt-4o` when PNGs exist. |
| Fallback chain today (bug) | `ART_DIRECTOR_MODEL` → `CAROUSEL_VISION_MODEL` → `openai/gpt-4o` — **replace last default** with Gemini flash id above |
| Input | Ordered final PNG multimodal parts + short brief meta |
| Critique axes | (1) virality / swipe craft (2) design craft / hierarchy / safe-zone / brand (3) **content completeness** — thin 2-sentence body without proof/ritual beat → remarks P1 `copy` or `hierarchy` |
| Output | existing `ArtDirectorVerdict` zod — unchanged shape |
| Remake | **FORBIDDEN** — no Designer enqueue from AD |

AI Bridge sync `ART_DIRECTOR_CHECKLIST_COMPRESSED` + system prompt with skill checklist (type scale mismatch, missing logo `<img>`, thin slides, pretty numbering awareness).

### 5.3 Logo dual-path

**Bug evidence:** `buildCorrectPlaceholders` sets `logoRef: sanitizeLogoRefForLlm(brand.logoRef)` — stub like `[brand logo present as image/png; …]` then flows into composite → Playwright cannot load image.

**Contract:**

```ts
type CorrectPipelinePlaceholders = {
  brandName?: string;
  /** Sanitized for LLM prompts only (stub / truncated). */
  logoRef?: string;
  /** Raw Settings Brand logoRef for Puppeteer <img>. Never sanitize. */
  logoRefRaw?: string;
  designPaletteJson?: string;
  // …existing fields
};
```

| Channel | Field | Transform |
|---------|-------|-----------|
| Scriptwriter / Designer **text** prompts | `logoRef` | `sanitizeLogoRefForLlm` OK |
| `carousel-layered-composite` / `carousel-html-renderer` / correct-pipeline job draw | `logoRefRaw` **or** direct `getBrandSettings().logoRef` | **raw** → `resolveAssetUrlForPlaywright` / `resolvePlaywrightImageSrc` |

**Rules:**

1. Prefer add `logoRefRaw` on placeholders + update call sites; if thinner patch: composite ignores sanitized stub (detect `[brand logo present` / truncated) and re-reads Brand store.  
2. Name-only chrome when raw logo exists = **FAIL** (Tester + AD `brand` remark).  
3. Do **not** put giant base64 into LLM system messages.

### 5.4 Brand name font (document + optional)

| Layer | Location |
|-------|----------|
| Text | Settings Brand `brandName` |
| CSS | `carousel-layered-composite` `.brand-name { font-family: var(--cf-font-content, var(--cf-font-body)); … }` |
| SoT families | DESIGN.md / DesignPreset `typography` → CSS vars `--cf-font-*` |

**Lock:** Document in Backend report + keep skill map (Trainer already).  
**Optional (P2, not required for wave PASS):** allow `.brand-name` to use `--cf-font-title` / display when `cssVarOverrides` or Architect flag — **default remains content**. Do not switch unless AI Bridge+Backend agree in report without breaking Armenian glyphs.

### 5.5 Scriptwriter `visual_prompt` richness

Inject / harden in Scriptwriter system (AI Bridge):

```text
visual_prompt RICHNESS (HARD):
- ≥3 concrete scene elements (light + material + object/place at minimum).
- When topic allows: Armenian / Vernatun motifs
  (pattern, stone, textile, pomegranate accent, diaspora city texture, ritual light, manuscript warmth — as fits).
- SCENE ONLY: no letters, logos, watermarks, on-slide copy.
- Empty / one vague sentence («красивый фон», «aesthetic vibe») = FAIL.
```

Keep S57 scene-only ban. Designer/image still do not paint type.

### 5.6 Pretty slide numbers + smoke 6

**Composite HTML (lock):**

```html
<div class="slide-num" aria-label="Slide N of M">01/06</div>
```

- Format: zero-pad both sides to 2 digits when `total ≤ 99`: `${pad(n)}/${pad(total)}`.  
- Style: badge-like (existing `.slide-num` may gain subtle pill/background — keep readable on busy photo; Century/content font token).  
- Pass `slideIndex0` + `slideCount` into builder (today only current index — **add total**).

**Smoke path (canon):**

```text
docs/карусель тест/gemini-ad-logo-visual-smoke-6/
  slide_01.png … slide_06.png   (or slide_0N.png consistent with factory)
  art-director-review.md
  art-director-review.json
  README.md (theme + model ids + scale source + logo dual-path note)
```

- **ONE** carousel only (Client-score set).  
- Even if AD = `remarks` → **STOP** (no remake).  
- Budget: ≤8 finals without stop-report; target exactly 6.  
- Replace/supersede expectation of 4-slide smoke for **this** wave; do not delete unrelated older smoke folders unless Orchestrator asks.

---

## 6. Tickets (full-queue pack)

| ID | Covers | Owner steps |
|----|--------|-------------|
| **C-type-scale-sot** | §5.1 Designer inject + composite yield | AI Bridge → Backend |
| **C-ad-gemini-vision** | §5.2 model default + checklist sync + thin slides | AI Bridge → Backend |
| **C-logo-dual-path** | §5.3 placeholders + render raw | Backend (+ AI Bridge type field if shared) |
| **C-brand-name-font-doc** | §5.4 document (+ optional display) | Backend report; AI Bridge note if display opted |
| **C-visual-prompt-rich-hy** | §5.5 Scriptwriter richness | AI Bridge |
| **C-smoke-6-pretty-num** | §5.6 N/M + smoke folder | Backend → Tester → smoke |

Path lock: **one writer** on prompts (`create-carousel-prompts.ts` / `art-director-review.ts`) = AI Bridge first; Backend then composite/run/placeholders/smoke. No parallel writers on same files.

---

## 7. Evidence anchors (pre-fix — for implementers)

| Bug | File evidence |
|-----|---------------|
| Hardcoded type | `lib/studio/carousel-layered-composite.ts` → `templatePrimarySize` returns `"64px"` etc.; `.primary { font-size: ${primarySize} }` |
| Scale in palette but unused for CSS | `lib/intake/placeholders.ts` `paletteJsonFromPreset` already includes `typography.scale` |
| Logo sanitize starvation | `buildCorrectPlaceholders` → `logoRef: sanitizeLogoRefForLlm(...)` only |
| AD default gpt-4o | `lib/studio/art-director-run.ts` `ART_DIRECTOR_VISION_MODEL` fallback `"openai/gpt-4o"` |
| Bare slide num | composite `.slide-num` → `padStart(2,"0")` **only current**, no `/total` |
| Brand name font | `.brand-name` already `--cf-font-content` — document, don't break |

---

## 8. Acceptance / Tester matrix

| Guard | Pass when |
|-------|-----------|
| G1 Type scale | Unit/fixture: with `scale.cover=40`, rendered CSS for cover `.primary` contains `40px` (not 64) |
| G2 Designer inject | Prompt snapshot / string includes numeric scale from tokens payload |
| G3 Gemini default | `ART_DIRECTOR_VISION_MODEL` without env → Gemini id (not gpt-4o); env override still works |
| G4 No remake | AD path cannot enqueue Designer (grep + existing job assert) |
| G5 Logo dual-path | placeholders expose raw; composite HTML `img.brand` src not stub text when Brand has logo |
| G6 Brand font doc | Report cites `.brand-name` + `--cf-font-content`; CSS still uses token |
| G7 Rich VP | Scriptwriter overlay contains ≥3-elements + Armenian/Vernatun motif wording |
| G8 Pretty num | Composite HTML for slide 3 of 6 contains `03/06` (or equivalent zero-pad) |
| G9 Smoke | Folder has **6** PNGs + AD md/json; README notes Gemini model used |

**Smoke ≠ Client Playwright** unless Orchestrator arms Client. Product ship bar remains S57 + this wave locks.

---

## 9. Frontend escalation gate (usually SKIP)

Arm **Frontend** only if Backend proves:

- Settings Brand upload does not persist `logoRef`, **or**
- preview shows logo but factory never stores resolvable path/data-URL,

…and dual-path alone cannot render `<img>`.

Then: **Frontend-minimal** on Brand panel only (`shell_freeze` still). Otherwise **Frontend out of chain**.

---

## 10. Out of scope

- AppShell / Sidebar / Create modal redesign  
- Mesh flowchart geometry (AD node already from prior wave)  
- Social publish / Meta  
- OCR remake vision ON  
- Parallel `correct_pipeline` paint as product  
- Monolith coder replacing AI Bridge + Backend  
- VPS/prod apply (Orchestrator checklist only at end)  
- Deleting user media / DB reset  

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Aggregator Gemini id differs (`gemini-2.5-flash` vs `google/…`) | Backend tries Architect defaults; document actual working id in `backend-report.md`; keep `ART_DIRECTOR_MODEL` override |
| Scale keys `cover/h2/body` vs prompt «title/body/content» | Map explicitly in AI Bridge print: title←cover, body←body, content←caption/h2 as documented in overlay |
| `logoRefRaw` type churn | Prefer additive field; Fixer if call sites miss |
| Smoke cost (6 slides × image + Gemini) | ONE carousel only; stop on AD remarks |

---

## 12. Deliverables this Architect turn

| File | Status |
|------|--------|
| `memory/waves/2026-10-18-gemini-ad-logo-visual/architect-spec.md` | **this file** |
| `memory/waves/2026-10-18-gemini-ad-logo-visual/chain.md` | **paired** |

**No product code** in Architect step.

---

## 13. Next executor

**AI Bridge** — step 2 of `chain.md` (TYPE SCALE inject, rich `visual_prompt`, AD Gemini checklist sync).
