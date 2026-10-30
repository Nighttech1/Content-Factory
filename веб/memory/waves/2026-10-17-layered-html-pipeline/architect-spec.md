# Architect Spec — 2026-10-17 LAYERED HTML pipeline (S57)

**Дата:** 2026-10-17  
**Роль:** Архитектор  
**Волна:** единственный product path карусели = **image bg + HTML/CSS Puppeteer overlay** → PNG **1080×1350**  
**Client gate:** **S57 HARD** (supersedes S53 html-overlay-fail + Phase6 `correct_pipeline` type-on-PNG as ship)  
**ticket_limit:** `default≤3` (один render-mode cluster)  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**draw_path_in_scope:** `true` (`lib/studio/carousel-html-renderer.ts` + prompts + job wire)  
**Trainer:** `memory/trainer/2026-10-17-layered-html-pipeline-grade.md` (grade **A**)  
**Canon card:** `plugins/trainer/carousel-layered-html-pipeline.md`  
**Skills:** `carousel-json-contract` § Phase 7 · `create-carousel-prompts-notes` § LAYERED HTML · `carousel-prompt-trace` · `ai-bridge` · `backend` · `tester` · Client `client-scenarios` **S57.A–C**  
**Код продукта в этом ходе Архитектора:** **нет** — только `architect-spec.md` + `chain.md`.

**Chain:** `memory/waves/2026-10-17-layered-html-pipeline/chain.md`

---

## 1. Зачем (простым языком)

Раньше продукт требовал «весь текст нарисован в картинке» и даже **запрещал** HTML-слой как основной путь. Пользователь зафиксировал новый канон:

1. Картинка рисует **только фон/сцену** (без букв, логотипов, водяных знаков).
2. Текст, логотип бренда, кнопка CTA и персонажи-вырезки кладутся **HTML/CSS-слоем** и «фотографируются» Puppeteer в финальный PNG 4:5.
3. Это **единственный** способ выпуска карусели. Старый `correct_pipeline` (type-on-PNG + vision) и S53 «kill HTML overlay» для ship **сняты**.
4. Для приёмки Клиент смотрит на вкус эталона (особенно кадр **#3**) и одну новую 4-слайдовую карусель — не старый набор smoke 51/1/17.

---

## 2. Жёсткие замки (HARD · user locks)

| # | Lock | Значение |
|---|------|----------|
| 1 | `single_render_layered` | **Один** product mode: image bg (no text/logo) + HTML/CSS Puppeteer overlay → PNG **1080×1350**. Нет parallel paint-режимов как ship. |
| 2 | `bg_ban_prompt_and_code` | Image prompts = scene only. **FORCE** strip/ban letters/logos/watermarks в **prompt AND code**. Logo = HTML из Settings **Бренд** only. |
| 3 | `secondary_copy_required` | `secondary_copy` **REQUIRED** на **каждом** слайде; `primary_copy` / headline — короткий; body — практичный (не вода). |
| 4 | `swipe_cta` | `swipe_trigger` = **meta only** (никогда paint / HTML text). CTA catalog **1–4** = **HTML button** только на `cta_slide`. |
| 5 | `auto_7_n_ways` | Тема «N способов / советов / ошибок» → Scriptwriter/Backend auto `requested_slide_count=7` (cover + 5 body + cta); Scriptwriter **may bump** выше. Иначе — user N / sheet `slides`. |
| 6 | `brand_html` | Brand **name + logo** из Settings → **Бренд** (не в image model). |
| 7 | `fonts_3_design_md` | **3 fonts** из active DESIGN.md: title / body / content. Missing → **download** в factory font store, затем использовать. |
| 8 | `vision_off` | Vision text-check / OCR regen loop = **OFF**. |
| 9 | `characters_over_bg` | Settings **Персонажи**: cut-out conductors **OVER** bg (HTML/composite). Split-across-slides = **optional rare** (Designer decides), не каждый сет. |
| 10 | `etalon_taste` | `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` — **#3** (`03-website-fast-cutout.png`) best taste. Designer **invents** layout (не pixel-clone). |
| 11 | `smoke_rewrite` | **DELETE** (user-explicit) `docs/карусель тест/smoke-useful-51-1-17/` → положить **ONE** new **4-slide** carousel в тот же path **или** `docs/карусель тест/layered-smoke-4/` (один канон на волну — Backend выбирает и фиксирует в report). |
| 12 | `shell_freeze` | AppShell / nav chrome freeze. Draw/composite **in scope**. |
| 13 | `s57_supersede` | Supersede **S53** html-overlay-fail + Phase6 **`correct_pipeline` type-on-PNG** as product path → Client **S57**. |

| Доп. | Значение |
|------|----------|
| `reuse_html_renderer` | Rebrand существующий `lib/studio/carousel-html-renderer.ts` → **primary layered**; kill `correct_pipeline` as **default** product success. |
| `keep_chrome` | Sheet⊕Create, Brand, Персонажи, Logs, RED, Publicist auto\|manual, CTA 1–4, swipe meta — **KEEP** (не ломать S55 chrome). |
| `critic_keep` | Code critic (05) + zod STRICT — **KEEP** (vision removed; critic остаётся). |
| `no_silent_social` | Social publish только Publicist + HITL. |
| `budget` | Client-score set = **1×4** final PNG (≤**8** finals без stop-report). Не возрождать 12-PNG useful-smoke. |

---

## 3. Supersedes / KEEP

| Prior | Status under S57 |
|-------|------------------|
| **S53** «kill HTML-overlay-primary» | **SUPERSEDED** — layered HTML **is** the ship path |
| Phase4 E2E type-on-PNG | **not** product path |
| Phase6 `renderMode: correct_pipeline` + vision≤2 | paint **removed** as product default; vision **OFF** |
| S54 bake-off compare folders | **not** required for S57 accept |
| S55 type-on-PNG paint bar | paint → **S57**; chrome KEEP |
| S56 multi-row `smoke-useful-51-1-17` | **DELETE** + ONE 4-slide rewrite |

**KEEP:** useful sheet intake · Create chat · Brand · Персонажи · Logs/RED · Publicist · CTA 1–4 · `swipe_trigger` meta · critic⊃zod · Drafts after draw.

---

## 4. Target flow

```text
Create ⊕ useful sheet (KEEP)
  → Scriptwriter → Dramaturgy JSON
       visual_prompt = SCENE ONLY (no text/logo)
       primary short + secondary_copy REQUIRED every slide
       swipe_trigger = meta; auto N=7 when «N ways»
       cta_type 1–4 on root / cta_slide
  → zod STRICT (+ critic 05 KEEP; vision OFF)
  → Designer (Layered Visual Engine)
       (a) bg prompts = scene + HARD ban letters/logos (prompt+code)
       (b) invent HTML/CSS (taste from layered-html-refs, esp. #3)
       (c) cut-out Персонажи OVER bg if hero set (split rare)
       (d) brand name+logo + 3 DESIGN.md fonts in HTML
       (e) CTA 1–4 as HTML button on cta_slide only
  → Image model → bg PNG(s) 1080×1350 (no text/logo)
  → Puppeteer localhost → composite → final slide_0N.png @ 1080×1350
  → Drafts (vision OFF)
  → Publicist auto|manual (unchanged)
```

---

## 5. Layers (контракты)

```text
┌─────────────────────────────────────────────────────────────┐
│ FE Settings: Brand · Персонажи · DESIGN.md fonts (EXISTING) │
│ FE Create chrome: shell_freeze — no redesign                │
└──────────────────────────┬──────────────────────────────────┘
                           │ brand / heroes / design tokens
┌──────────────────────────▼──────────────────────────────────┐
│ AI Bridge: overlays + zod fields + bg ban prompts           │
│ secondary_copy required · auto-7 · swipe meta · CTA HTML    │
│ deprecate correct_pipeline / type-on-PNG ship wording       │
└──────────────────────────┬──────────────────────────────────┘
                           │ renderMode: layered_html
┌──────────────────────────▼──────────────────────────────────┐
│ Backend: carousel-html-renderer primary layered             │
│ Puppeteer 1080×1350 · FORCE bg ban · fonts download         │
│ vision OFF · job wire · DELETE old smoke · gen 1×4          │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | Scriptwriter/Designer overlays; zod: `secondary_copy` required; scene-only `visual_prompt`; auto-7 heuristics in prompts; CTA HTML / swipe meta wording; ban letters/logos in image prompts; deprecate type-on-PNG / vision ON ship text; trace contract for layered | AppShell; Settings JSX (unless Frontend step armed); Puppeteer raster impl |
| **Backend** | Default `renderMode` / `CAROUSEL_PIPELINE=layered_html` (or supersede `correct`); rebrand `carousel-html-renderer.ts` path as primary; FORCE strip/reject text-like / logo in bg path; vision disabled; font resolve+download from DESIGN.md; Brand/Персонажи into HTML composite; wire intake/Create job; DELETE `smoke-useful-51-1-17/`; generate ONE 4-slide deliverable + traces | Prompt prose invent beyond wire; AppShell; mesh redesign |
| **Frontend** | **OMIT by default.** Arm only if Backend cannot resolve fonts without a Settings «font path / upload» UI | Prompts; renderer; smoke gen |
| **Tester** | Guards: single layered mode; vision off; bg ban; secondary_copy; CTA HTML; swipe meta; smoke folder rewrite; auto-7 unit if cheap | Product invent |
| **Deployer** | Localhost API refresh for Client S57 | Prod/VPS |
| **Client** | Playwright **S57.A–C** @1440 + taste vs etalon #3 | Code |

---

## 6. Schema / prompt contracts (AI Bridge)

### 6.1 Handoff JSON (delta vs Phase6)

| Field | S57 rule |
|-------|----------|
| `requested_slide_count` | User/sheet N; **force 7** when topic matches «N способов/советов/ошибок» (RU/EN ways/tips); SW may bump |
| `slides[].primary_copy` / headline | **Short** (cover hook ≤6–8 words pattern) |
| `slides[].secondary_copy` | **REQUIRED** non-empty on **every** slide (practical body; map from `body` if legacy alias — but zod must require final field) |
| `slides[].visual_prompt` | Scene / light / materials / composition **only** — **no** letters, logos, watermarks, on-slide copy |
| `slides[].swipe_trigger` | Required meta QA — never copy into primary/secondary/HTML |
| `cta_type` | `1\|2\|3\|4`; rendered as **HTML button** on `cta_slide` only |
| `renderMode` (artifact/trace) | Product = **`layered_html`** |

### 6.2 Designer overlays

- Role rename in prompts: **Layered Visual Engine** (not image_prompt-only invent ban for HTML).
- Image path: bake **ban** strings; **do not** ask model to paint typography.
- HTML invent: layout freedom; refs = craft bar; #3 cut-out energy preferred when characters used.
- Characters: cut-out URLs from Персонажи catalog **over** bg; split-across-slides optional rare flag/heuristic — not mandatory every carousel.

### 6.3 Env / pipeline gate

| Item | Target |
|------|--------|
| Default product gate | `CAROUSEL_PIPELINE=layered_html` (or treat missing/`correct` as **migrate to layered** for Create/intake ship) |
| Legacy | `correct` / `e2e_diffusion` / type-on-PNG may remain as **explicit non-default** flags for archaeology — **never** default success |
| Vision | Skip / no-op; no OCR regen enqueue |

---

## 7. Renderer / Backend contracts

### 7.1 Reuse `lib/studio/carousel-html-renderer.ts`

| Action | Spec |
|--------|------|
| Rebrand | Existing HTML/Puppeteer path becomes **primary** `layered_html` |
| Kill default | `correctOn` / `renderMode: "correct_pipeline"` **must not** be Create/intake default |
| Canvas | Always raster finals **1080×1350** |
| Composite order | (1) bg image → (2) optional character cut-outs → (3) typography + brand chrome → (4) CTA HTML on cta_slide |
| Bg ban code | After image gen: reject/regenerate or strip path if OCR-free heuristic / prompt sanitizer detects text-instruction leakage; **minimum:** prompt sanitizer strips «add text/logo/watermark» + append HARD negative; prefer reject if model returns obvious text-heavy failure when detectable without vision loop |
| Vision | Do **not** call `carousel-vision-text-check` on product path |
| Fonts | Parse 3 families from active DESIGN.md; ensure files in factory store (`public/fonts/…` or equivalent); download if missing; `@font-face` in HTML template |
| Brand | Inject name + logo URL from Settings Brand into HTML |
| Traces | `carousel-prompt-trace`: bg prompts (no typography) + HTML layout notes + composite paths + `renderMode: layered_html` |

### 7.2 Job wire

- `lib/intake/correct-pipeline-job.ts` (or successor): call draw with **layered** pipeline; rename/comment OK but **behavior** = layered default.
- Create draw route / studio job: same default.
- Smoke script: replace `scripts/smoke-useful-51-1-17.ts` usage — delete folder contents per lock; new smoke produces **one** 4-slide set.

### 7.3 Smoke deliverable (HARD)

1. **DELETE** entire tree `docs/карусель тест/smoke-useful-51-1-17/` (user-explicit).
2. Place **ONE** new 4-slide carousel artifacts (PNG + short timeline MD) either:
   - recreated path `docs/карусель тест/smoke-useful-51-1-17/` **or**
   - `docs/карусель тест/layered-smoke-4/`
3. Backend picks **one** and writes path into `backend-report.md`. Do not leave both half-full.
4. Finals also mirrored under `generatedMedia/` as needed for Client open.
5. Budget: **4** finals (+ optional bg intermediates); stop-report if >8 finals.

---

## 8. Frontend decision (Architect)

| Question | Decision |
|----------|----------|
| Settings font path UI needed? | **No for this wave** — Backend resolves fonts from DESIGN.md + download into factory store. Existing Brand/Персонажи UI **KEEP** (already shipped). |
| Frontend in chain? | **OMIT** (conditional step marked `[skipped]` unless Backend discovers unblockable need for font picker UI — then escalate to Architect mid-flight, do not invent chrome). |

---

## 9. Tickets (≤3)

| ID | Owner | Covers |
|----|-------|--------|
| **C-s57-ai-bridge-layered** | AI Bridge | Schema/prompts: secondary_copy required; scene-only visual_prompt; bg ban; auto-7; swipe meta; CTA HTML; deprecate correct/type-on-PNG ship wording; vision off in overlays |
| **C-s57-backend-composite** | Backend | Renderer primary layered; FORCE ban; fonts download; vision off; job wire; DELETE old smoke; gen ONE×4 |
| **C-s57-guards-client** | Tester→Deployer→Client | Guards + localhost + Playwright S57.A–C |

Path lock: **AI Bridge → Backend** sequential (no parallel writers on `create-carousel-prompts.ts` / `carousel-json-contract.ts` / `carousel-html-renderer.ts`). Frontend omitted.

---

## 10. Acceptance (Client language · S57)

**ПРИНЯТО** only if Playwright MCP @1440 completes **S57.A–C**:

1. **A** — Create path delivers bg+HTML Puppeteer finals (not type-on-PNG / not correct_pipeline success); preview N×4:5; CTA HTML on cta slide.  
2. **B** — Traces/bg: no letters/logos on image layer; Brand logo HTML; 3 DESIGN.md fonts; characters over bg if used; vision OFF.  
3. **C** — Old multi-row smoke folder gone; ONE 4-slide set present; craft scored vs etalon **#3** (invent OK).

**НЕ ПРИНЯТО** if: parallel paint as ship; letters/logos on bg; swipe painted; CTA not HTML 1–4; vision ON; characters baked into scene; ignore #3; not 1080×1350; old 51/1/17 set still present; accept without Playwright.

---

## 11. Out of scope

- AppShell / Sidebar / left nav IA / module top chrome redesign  
- Motion / Mesh / Razbor redesign  
- Scout/Apify changes  
- Social Meta publish  
- Reviving S54 bake-off compare requirement  
- Regenerating 12-PNG useful-smoke rows 51/1/17  
- Monolith coder replacing AI Bridge + Backend  

---

## 12. Evidence paths (for executors)

| Artifact | Path |
|----------|------|
| Etalon | `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` (#3 best) |
| Old smoke (DELETE) | `docs/карусель тест/smoke-useful-51-1-17/` |
| New smoke | same path **or** `docs/карусель тест/layered-smoke-4/` |
| Renderer | `lib/studio/carousel-html-renderer.ts` |
| Prompts | `lib/studio/create-carousel-prompts.ts` |
| Zod | `lib/studio/carousel-json-contract.ts` |
| Job | `lib/intake/correct-pipeline-job.ts` (+ Create draw entry) |
| Wave reports | `memory/waves/2026-10-17-layered-html-pipeline/` |

---

## 13. Architect verdict

Spec + chain готовы. Следующий исполнитель: **AI Bridge** (C-s57-ai-bridge-layered). Код продукта Архитектором **не** пишется.
