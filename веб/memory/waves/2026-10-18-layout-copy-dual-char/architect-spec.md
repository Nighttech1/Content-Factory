# Architect Spec — 2026-10-18 layout-copy + dual character

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-layout-copy-dual-char`  
**Цель:** MUCH wider Scriptwriter body; DesignSlot **4-ref** deconstruct → colors/fonts/sizes **+ `layoutMap`** (gen mirrors grammar); seed **3 DESIGN presets** from etalon grids + Vernatun girl → Landscapes; **dual smoke ×6** (`in_image` + `overlay_cutout`) on **разных** useful-sheet topics; character = **conductor** (speaks slide text)  
**Client gate:** optional (Orchestrator); product keep **S57** layered HTML + Variant A + prior design-inject FULL DESIGN / logo BR (supersede numbering-always)  
**ticket_limit:** `full-queue` (locks 1–5 + dual smoke одним проходом; лимит ≤3 **не** режет)  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**upgrade_only:** `true` (patch prompts + deconstruct + composite + dual paint; **не** rewrite Create chrome)  
**Frontend:** **omit** unless 4-up DesignSlot upload UI missing (escalation §9)  
**Trainer:** `memory/trainer/2026-10-18-layout-copy-dual-char-grade.md` (grade **B**)  
**Canon card:** `plugins/trainer/layout-copy-dual-char.md`  
**Skills:** `carousel-json-contract` Phase 7 + `create-carousel-prompts-notes` § LAYOUT MAP · MUCH WIDER · DUAL CHAR · `art-director/html-layout-variant-a` · `critique-checklist` · `workers/designer-carousel` grid deconstruct · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester` · `prompt-engineering`  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-layout-copy-dual-char/chain.md`

**Etalon SoT (уже на диске):**  
`generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`

| File | Role in wave |
|------|----------------|
| `01-real-estate-orange-grid…` | Design preset **01 RE orange** — **ACTIVE for smokes** |
| `02-luma-coffee-grid.jpg` | Design preset **02 luma coffee** |
| `03-omkopa-teal-character-…` | Design preset **03 omkopa teal** (grid for design tokens + layoutMap) |
| `04-vernatun-girl-character-…` | **Character sheet** → Landscapes catalog as **conductor** (not a 4th design preset) |

---

## 1. Зачем (простым языком)

Карусель уже рисует фон нейросетью, а текст/лого/номер/CTA — HTML-слоем (S57). Предыдущая волна дала FULL DESIGN inject и logo bottom-right. Но остаются дыры:

1. Текст на слайдах всё ещё «три коротких предложения» — нужно **гораздо шире**: ≥220 символов **и** ≥5 смысловых частей на body.
2. Deconstruct из одной картинки даёт цвета/шрифты, но **не копирует раскладку** эталона. Нужен слот из **4 кадров** (обложка · середина A · середина B · CTA) → карта раскладки (`layoutMap`): где текст, есть ли номера, где лого/кнопка. Генерация **повторяет эту грамматику**, придумывает только контент, фон и CTA из каталога 1–4.
3. На диске уже лежат три эталонные сетки + лист персонажа — их нужно **посеять** в библиотеку Design (3 пресета) и Landscapes (девушка-проводник), активировать оранжевый RE для смоков.
4. Нужны **два** смока по 6 слайдов на **разных** темах из полезного листа: (A) девушка **нарисована в картинке** вместе со сценой; (B) отдельный cutout **поверх** фона. В обоих случаях персонаж — **проводник** между картинкой и зрителем: говорит текст слайда, смотрит «в камеру», **не** участвует в сюжете сцены как актёр внутри истории.

Волна чинит **контракты и runtime** (AI Bridge → Backend → Tester → dual smoke). UI Design 4-up трогаем **только** если upload сломан (§9).

---

## 2. User locks (HARD)

| # | Lock id | Acceptance (языком Клиента / Tester) |
|---|---------|--------------------------------------|
| 1 | `secondary_copy_wide` | Body slides: `secondary_copy` **≥220 chars AND ≥5 clauses** (или ≥4 коротких абзаца). Cover/CTA могут быть короче, но multi-beat. 1–3 коротких предложения = **FAIL**. Critic/zod enforce. |
| 2 | `grid_layout_map` | DesignSlot = **4 refs** (cover, midA, midB, cta). Deconstruct → colors + fonts + sizes **+ `layoutMap`** (text anchors, numbering format/pos **OR omit**, logo/CTA chrome). Gen **mirrors** layout grammar; invents content + bg + CTA catalog only. |
| 3 | `seed_three_designs_plus_char` | Seed presets from etalon grids **01 / 02 / 03**. **Activate 01** for smokes. Sheet **04** → Landscapes catalog as **conductor**. |
| 4 | `dual_smoke_paths` | **Two** × **6** layered carousels, **different** useful-sheet topics (e.g. **17** kitchen · **13** remote work · **51** meeting — Backend picks two distinct IDs). **A** `character_path=in_image`. **B** `character_path=overlay_cutout` (cover + last **mandatory** cutout). |
| 5 | `conductor_role` | Character = conductor between image and viewer; **speaks** slide text; pose «to camera»; **not** a story participant inside the scene narrative. |

### Naming aliases (HARD — one concept)

| User / smoke | Runtime / JSON | Notes |
|--------------|----------------|-------|
| `character_path` | `character_paint` / `html_layout.characterPaint` | Same enum: `in_image` \| `overlay_cutout` \| `none` |
| DesignSlot 4 refs | cover · midA · midB · cta | Order fixed; roles map to `layoutMap.slides[].role` |

### Keep from prior waves (do not reopen)

| Keep | Rule |
|------|------|
| `s57_layered` | image bg + HTML/CSS Puppeteer @ 1080×1350; OCR remake vision **OFF** |
| `variant_a` | `html_layout` closed templates; composite executes; no raw HTML from LLM |
| `full_design_inject` | FULL role table fonts+sizes+colors every Designer draw |
| `logo_dual_path` | sanitized `logoRef` → LLM; raw → composite `<img>` |
| `font_fit_reduce_only` | reduce-only from DESIGN scale |
| `cta_1_4` / `swipe_meta` | CTA catalog 1–4 on HTML; `swipe_trigger` meta only |
| `ad_no_remake` | AD `approve` \| `remarks` only; never enqueue Designer redraw |
| `shell_freeze` | no AppShell / nav redesign |
| `no_silent_social` | no Meta/IG publish this wave |
| `secrets` | never in memory / skills / reports |

### Supersede within this wave

| Prior wording | New lock |
|---------------|----------|
| Always pretty `N / M` on every slide (design-inject) | Render numbers **only if** `layoutMap.numberingGlobal ≠ absent` (`numbering_mirror`) |
| S52 «Designer invents layout freely» when map present | **Copy grammar** from `layoutMap`; invent content/bg/CTA only |
| secondary_copy ≥120 / 2–3× soft | **MUCH wider** ≥220 chars **AND** ≥5 clauses (`secondary_copy_wide`) |
| Single character path (cutout only) | Dual `in_image` \| `overlay_cutout` (`dual_smoke_paths`) |

---

## 3. Target flow (patched)

```text
SEED (Backend ops · lock 3)
  etalon 01/02/03 grids
    → deconstruct 4-up (or grid-slice) → DesignPreset ×3
       colors + fonts + sizes + layoutMap
    → library slots: re-orange · luma-coffee · omkopa-teal
    → Embla / DesignSlot activeId = 01 RE orange   [ACTIVE for smokes]
  etalon 04 Vernatun girl sheet
    → Landscapes catalog entry (conductor sheet)
    → available as {{CHARACTER_CATALOG}} / hero number

DesignSlot runtime (lock 2 · ongoing)
  upload 4 refs (cover · midA · midB · cta)
  → POST design-deconstruct (grid mode)
  → deconstructStyle + deconstructStyle agent
  → DesignPresetFile + layoutMap JSON companion
  → active resolve → FULL DESIGN inject + layoutMap grammar

Scriptwriter                                              [AI Bridge]
  → Dramaturgy JSON
  → secondary_copy MUCH wider (≥220 + ≥5 clauses on body)
  → visual_prompt scene-only letters ban (S57)
  → character role: conductor speaks text (prompt lock 5)

Designer                                                  [AI Bridge]
  → FULL DESIGN tokens + layoutMap inject
  → html_layout mirrors map anchors / chrome / numbering presence
  → characterPaint = character_path from job
  → in_image: allow girl IN scene prompt (conductor pose, to-camera,
              WITH picture/environment — not story actor)
  → overlay_cutout: bg WITHOUT character; cutout OVER; cover+last mandatory

Image model
  → A: scene + painted conductor
  → B: scene-only bg

carousel-layered-composite                                [Backend]
  → honor layoutMap numbering omit
  → logo/CTA chrome from map (else design-inject BR defaults)
  → B: HTML cutout layer from Landscapes sheet
  → Puppeteer → slide_01…06

Art Director (if wired)
  → remarks: thin secondary / grammar fight / wrong paint path / non-conductor
  → STOP — NO remake

DUAL SMOKE (lock 4)
  A) useful topic T1 · character_path=in_image · active design 01 · 6 PNG
  B) useful topic T2 ≠ T1 · character_path=overlay_cutout · 01 · 6 PNG
```

---

## 4. Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Frontend: OMIT (unless §9 — 4-up DesignSlot upload missing)  │
│ shell_freeze AppShell                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ (optional escalate only)
┌──────────────────────────▼───────────────────────────────────┐
│ AI Bridge: SW ≥220+≥5; layoutMap inject; dual paint prompts; │
│ conductor wording; deconstruct agent layoutMap schema;       │
│ AD checklist sync                                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Backend: 4-up deconstruct persist + seed 3 presets +         │
│ Landscapes 04; composite numbering omit + dual paint modes;  │
│ zod/critic bars; dual smoke×6                                │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Tester: guards G1–G12 + dual smoke presence                  │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — MUCH wider SW; layoutMap inject; dual `character_path` / `characterPaint` wording; conductor role; `lib/agents/deconstructStyle.ts` — emit layoutMap; `lib/studio/art-director-review.ts` checklist; optional `lib/mesh/agent-defaults.ts` deltas | Composite CSS; seed file I/O; AppShell; Design upload JSX (unless §9) |
| **Backend** | 4-up deconstruct persist (`deconstruct-style` + route); `DesignPresetFile.layoutMap`; seed scripts/ops for 01/02/03 + Landscapes 04; activate 01; `carousel-layered-composite` honor numbering absent + dual paint; `carousel-json-contract` / critic zod ≥220+≥5; dual smoke folders | Prompt prose invent beyond thin wire; Create modal; AppShell |
| **Frontend** | **Skip by default.** §9 only: DesignSlot accepts **4** refs (not single-image only) | AppShell; Create redesign; mesh |
| **Tester** | Guards + dual smoke 2×6 PNG + topic/path asserts | Product invent |
| **Deployer** | Localhost refresh if Orchestrator arms | Prod/VPS |
| **Smoke** | TWO × 6; stop; no remake loop | Second draw after AD |

---

## 5. Contracts by lock

### 5.1 Scriptwriter MUCH wider (`secondary_copy_wide`) — P0

**Bar (HARD):**

```text
body_slide.secondary_copy:
  length ≥ 220 characters
  AND clause_count ≥ 5   (split on «.» «!» «?» «;» / short paragraphs ≥4 OK as alt)
cover / cta_slide: multi-beat allowed shorter — not one-line stub
```

**Wire:**
- AI Bridge: Scriptwriter system/user overlays — replace soft «2–3× / ≥120» with MUCH WIDER bar + examples.
- Backend: zod and/or `carousel-critic-05` reject thin body `secondary_copy`.
- AD checklist: thin air = P0 content completeness.

**FAIL:** 1–3 short sentences shipped as body quality.

### 5.2 Grid deconstruct + layoutMap (`grid_layout_map`) — P0

**Input:** exactly **4** reference images ordered cover → midA → midB → cta.

**Extract (must):**
- colors / fonts / sizes (FULL DESIGN roles) — KEEP prior wave
- **`layoutMap`** per trainer schema:

```json
{
  "layoutMap": {
    "slides": [
      {
        "role": "cover|body_slide|cta_slide",
        "textAnchor": { "x": "left|center|right", "y": "top|middle|bottom" },
        "numbering": { "present": false, "format": "pretty_N_M|digits_only|corner_badge|omit", "slot": "…|absent" },
        "logoChrome": { "present": true, "slot": "bottom-right|top-right|top-left|absent" },
        "ctaChrome": { "present": false, "slot": "bottom|center|absent" }
      }
    ],
    "numberingGlobal": "absent|pretty_N_M|digits_only|corner_badge",
    "grammarNote": "short human note of repeated rhythm"
  }
}
```

**Generation rule (HARD):**
- When active preset has `layoutMap` → `html_layout.layoutMapSource = "preset"`.
- Mirror anchors, logo/CTA chrome presence+slot, numbering presence.
- Invent **only** copy, scene bg, CTA type 1–4.
- If refs have **no** numbers → `numberingGlobal: "absent"` → composite **omits** `.slide-num` HTML entirely.

**FAIL:** inventing numbers when map says absent; fighting map anchors; deconstruct colors-only without layoutMap.

### 5.3 Seed 3 DESIGN + Landscapes conductor (`seed_three_designs_plus_char`) — P0

| Source file | Persist as | Active? |
|-------------|------------|---------|
| `01-*-orange-*` | DesignPreset **RE orange** | **YES** for all smokes |
| `02-luma-coffee-grid.jpg` | DesignPreset **luma coffee** | library only |
| `03-omkopa-teal-*` | DesignPreset **omkopa teal** | library only |
| `04-vernatun-girl-*` | Landscapes catalog **conductor** sheet | used by both smoke paths |

**Backend ops:** seed once (script or documented one-shot); write `layoutMap` on each of 01–03; set Embla/`activeId` → 01; register 04 in Landscapes with stable hero number for `{{CHARACTER_CATALOG}}`.

**FAIL:** smokes run without active 01; girl not in Landscapes; presets missing layoutMap.

### 5.4 Dual smoke (`dual_smoke_paths`) — P0

| Arm | `character_path` | Useful topic | Slides | Character rule |
|-----|------------------|--------------|--------|----------------|
| **A** | `in_image` | e.g. **17** kitchen (or Backend-chosen T1) | 6 | LLM paints Vernatun girl **WITH** picture/scene; conductor pose; speaking to camera; **not** acting inside story beats |
| **B** | `overlay_cutout` | e.g. **13** remote work **or** **51** meeting — **≠ T1** | 6 | Separate pose gen → HTML cutout OVER bg; **cover + last (cta) mandatory**; mid slides may include cutout when taste needs |

**Paths (proposed):**
- `docs/карусель тест/layout-copy-dual-char-smoke-A-in_image-6/`
- `docs/карусель тест/layout-copy-dual-char-smoke-B-overlay_cutout-6/`

**Both:** active design **01**; layered S57; layoutMap grammar from 01; wider SW; conductor speaks text.

**FAIL:** same topic for A and B; missing cover/last cutout on B; A without girl in image; remake loop.

### 5.5 Conductor role (`conductor_role`) — P0 · cross-cutting

**Intent (user):** character stands **between** the image and the viewer — presents / speaks the slide text.

**Prompt locks (AI Bridge):**
- Pose: facing / addressing camera (or clear presenter stance).
- Copy ownership: she «says» headline/body (metaphor for presentation) — not a third-party in a cooking/office plot.
- **A careful:** `in_image` **does** paint the girl **into** the generated picture with the environment (user: paints girl WITH picture) — but she remains conductor, not a kitchen helper / coworker in the narrative.
- **B:** cutout over clean scene; first + last mandatory.

**FAIL:** girl cooking as protagonist / sitting in meeting as participant with no presenter read; cutout baked into bg on path B.

---

## 6. Tickets (full-queue · one pass)

| ID | Locks | Primary role |
|----|-------|--------------|
| **C-sw-secondary-wide** | 1 | AI Bridge (+ Backend zod/critic) |
| **C-grid-layout-map** | 2 | AI Bridge deconstruct + Backend persist/composite |
| **C-seed-designs-landscapes** | 3 | Backend |
| **C-dual-char-smoke** | 4, 5 | AI Bridge prompts + Backend gen + Tester |
| **C-numbering-mirror** | 2 (subset) | Backend composite (+ AI Bridge map wording) |

Path order = chain steps (no parallel overlapping writers).

---

## 7. File path locks (no overlapping writers)

| Path | Owner step |
|------|------------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/art-director-review.ts` | AI Bridge |
| `lib/agents/deconstructStyle.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` (optional) | AI Bridge |
| `lib/studio/deconstruct-style.ts` + `app/api/settings/design-deconstruct/route.ts` | Backend |
| `lib/settings/design-library.ts` (layoutMap on preset + active 01) | Backend |
| `lib/settings/landscapes-store.ts` (+ seed 04) | Backend |
| `lib/studio/carousel-layered-composite.ts` | Backend |
| `lib/studio/carousel-json-contract.ts` / `carousel-critic-05.ts` | Backend **after** AI Bridge prompt lock |
| Smoke dirs under `docs/карусель тест/` | Backend |
| Guards under `scripts/` + `guards.md` | Tester |
| AppShell / Sidebar / Create chrome | **FORBIDDEN** |
| DesignSlot 4-up UI | Frontend **only** if §9 armed |

---

## 8. Tester guards (proposed G1–G12)

| ID | Assert |
|----|--------|
| G1 | Scriptwriter overlay contains ≥220 / ≥5 clauses HARD wording |
| G2 | Critic or zod rejects fixture body `secondary_copy` &lt; 220 or &lt; 5 clauses |
| G3 | Deconstruct 4-up fixture emits `layoutMap` with 4 slides + `numberingGlobal` |
| G4 | When `numberingGlobal: absent` → composite HTML has **no** `.slide-num` |
| G5 | When map present → `html_layout` / composite anchors match map (fixture) |
| G6 | Three DesignPresets seeded (01/02/03) with layoutMap; active = 01 |
| G7 | Landscapes contains Vernatun girl sheet from 04 |
| G8 | Job/prompt accepts `character_path` / `characterPaint` enum `in_image` \| `overlay_cutout` |
| G9 | Conductor wording present in SW/Designer overlays (to-camera / speaks text / not story actor) |
| G10 | Smoke A dir: **6** PNG + meta `character_path=in_image` + topic T1 |
| G11 | Smoke B dir: **6** PNG + meta `overlay_cutout` + topic T2 ≠ T1 + cover+last cutout evidence |
| G12 | shell_freeze: no AppShell churn in wave diff |

---

## 9. Frontend escalation gate (§9)

Arm Frontend-minimal **only if**:

1. Settings Design / DesignSlot cannot accept **4** reference images (cover·midA·midB·cta), **or**
2. Upload still forces single-image deconstruct only (no grid mode entry).

Otherwise Frontend = **SKIP**. No Create/Razbor chrome work. Seed may use filesystem/API without UI for this wave.

---

## 10. Out of scope

- AppShell / nav IA / Studio module chrome redesign  
- Create modal parity / Razbor UI  
- Scout/Apify / feed cards  
- Social Meta publish  
- OCR remake vision ON  
- Parallel `correct_pipeline` type-on-PNG ship path  
- Monolithic coder replacing AI Bridge + Backend  
- VPS/prod deploy  
- Product code in Architect turn  
- Pixel-clone of etalon (taste invent OK)

---

## 11. Acceptance summary

Волна **DONE** when:

1. Body `secondary_copy` enforces ≥220 chars **and** ≥5 clauses.  
2. 4-ref DesignSlot deconstruct writes colors/fonts/sizes **+ layoutMap**; gen mirrors grammar; numbering omit when absent.  
3. Presets 01/02/03 seeded; **01 active**; 04 in Landscapes as conductor.  
4. Dual smoke 2×6 on **different** useful topics: A `in_image`, B `overlay_cutout` (cover+last).  
5. Character reads as conductor speaking slide text (both paths).  
6. shell_freeze intact; no social publish; no remake loop.

---

## 12. Architect verdict

```
🏗️ АРХИТЕКТОР: spec+chain ready for wave 2026-10-18-layout-copy-dual-char
Locks: secondary_copy_wide · grid_layout_map · seed_three_designs_plus_char ·
       dual_smoke_paths · conductor_role · numbering_mirror
Chain: AI Bridge → Backend (deconstruct seeds + dual gen) → Tester
Frontend: omit unless §9 (4-up upload)
Product code this turn: none
Etalon: generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/
Next: Orchestrator → AI Bridge (step 2)
```
