# Architect Spec — 2026-10-18 FULL DESIGN inject + logo BR + rich SW + layout variety

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-design-inject-logo-br`  
**Цель:** закрыть 8 user locks (FULL DESIGN tokens → Designer; optional motifs; logo chrome bottom-RIGHT enlarged + name beside; slide-num own slot; secondary_copy 2–3× richer; fontFit reduce-only; deconstruct→DESIGN→inject verify; layout variety) + smoke **ONE×6**  
**Client gate:** optional (Orchestrator); product keep **S57** + Variant A + prior Gemini AD / logo dual-path  
**ticket_limit:** `full-queue` (locks 1–8 + smoke одним проходом; лимит ≤3 **не** режет)  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**upgrade_only:** `true` (patch prompts + tokens payload + composite chrome + variety; **не** rewrite Create chrome)  
**Frontend:** **omit** unless Brand / Settings Design deconstruct upload UI broken (escalation §9)  
**Trainer:** `memory/trainer/2026-10-18-design-inject-logo-br-grade.md` (grade **A**)  
**Canon card:** `plugins/trainer/design-inject-logo-br.md`  
**Skills:** `carousel-json-contract` Phase 7 + `create-carousel-prompts-notes` § FULL DESIGN · `art-director/html-layout-variant-a` · `critique-checklist` · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester` · `prompt-engineering`  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-design-inject-logo-br/chain.md`

---

## 1. Зачем (простым языком)

Карусель уже собирается по схеме S57: нейросеть рисует **только фон**, текст/лого/номер/CTA — **HTML-слой**. Предыдущая волна починила dual-path лого и привязку размеров к `typography.scale`. Но остаются дыры вкуса и контракта:

1. В Designer уходит «урезанный» JSON токенов (семьи + scale), без **явной таблицы роль → цвет + размер + шрифт**, и в промпте ещё живут **негативные** фразы «не предполагай 64px» вместо **позитивной** шкалы. Цвета палитры не направляют **настроение фона**.
2. В `visual_prompt` всё ещё **чеклист** армянских мотивов (khachkar / apricot / …) → одни и те же символы на каждом посте.
3. Логотип на кадре: маленький, часто **верх-лево**, с полупрозрачной «плиткой» под иконкой; имя может уезжать не в ряд **справа от иконки**.
4. Номер слайда есть как `.slide-num`, но токены/формат должны жёстко = **body paragraph** + pretty **`N / M`**.
5. `secondary_copy` формально «2–3 предложения», но на практике тонкий stub — нужно **в 2–3 раза богаче** (ценность / пример / микро-история).
6. Нет контракта **fontFit reduce-only**: композит/LLM могут «на глаз» увеличить кегль выше DESIGN.
7. Путь Settings upload → deconstruct → DESIGN.md → FULL inject **не зафиксирован** в chain с проверкой Backend/AI Bridge — риск, что Embla пресет без sizes/colors.
8. `html_layout` / fallback якоря часто **всегда top-left / center** — нет ритма bottom/right/center между соседними слайдами.

Волна чинит **контракты и runtime** (AI Bridge → Backend → Tester → smoke). UI Brand/Design трогаем **только** если upload/deconstruct реально сломан (§9).

---

## 2. User locks (HARD)

| # | Lock id | Acceptance (языком Клиента / Tester) |
|---|---------|--------------------------------------|
| 1 | `full_design_inject` | Каждый Designer draw получает **полную** таблицу active DESIGN / DesignPreset: per role **family + size + color** (title/body/content/accent/slideNumber/CTA/brand). Positive scale only. Colors drive HTML **and** bg mood. `buildDesignTokensPayload` + overlay print full role table. Remove «do not assume 64px» negatives. |
| 2 | `motifs_optional` | Scriptwriter `visual_prompt`: ≥3 concrete scene elements; Armenian/Vernatun motifs **optional** taste — **no** mandatory laundry list (khachkar/apricot/pomegranate every post). |
| 3 | `logo_chrome_br` | Brand chrome: **enlarged** icon; **bottom-RIGHT**; **transparent** icon bg (no solid plate); club name **right of icon** in one row (not under). Keep dual-path raw `logoRef` for Puppeteer. Name-only when logo set = FAIL. |
| 4 | `slide_num_own_slot` | `.slide-num` = **separate** HTML block; family/color/size = **body** tokens (or slideNumber→body fallback); pretty `N / M` (zero-pad OK: `03 / 06`). |
| 5 | `secondary_copy_rich` | Scriptwriter: `secondary_copy` **2–3× richer** than thin 1–2 sentence air — value beat / example / micro-story. Thin = FAIL (prompt + AD remarks + Tester sample). |
| 6 | `font_fit_reduce_only` | Start at DESIGN scale; may **REDUCE** only on overflow; **never enlarge** above DESIGN; document delta in `html_layout.fontFit` / overlay meta. |
| 7 | `deconstruct_verify` | Documented path Settings Design upload → deconstruct → DESIGN.md (colors/fonts/sizes) → Embla active → FULL inject. AI Bridge + Backend verify wire; Tester guard. Frontend only if UI broken. |
| 8 | `layout_variety` | Adjacent slides vary `anchor.x` / `anchor.y` (and templates). Forbidden: every slide top-left primary. Prefer top\|middle\|bottom × left\|center\|right rhythm. |
| 9 | `smoke_one_x6` | Smoke = **ONE** **6-slide** layered carousel + pretty numbering under wave path (AD optional if still wired). |

### Keep from prior waves (do not reopen)

| Keep | Rule |
|------|------|
| `s57_layered` | image bg + HTML/CSS Puppeteer @ 1080×1350; OCR remake vision **OFF** |
| `variant_a` | `html_layout` closed templates; composite executes; no raw HTML from LLM |
| `logo_dual_path` | sanitized `logoRef` → LLM only; `logoRefRaw` / fresh Brand → composite `<img>` |
| `type_scale_sot` | composite CSS sizes from DESIGN `typography.scale` (this wave **extends** with full colors + positive print) |
| `ad_no_remake` | AD `approve` \| `remarks` only; never enqueue Designer redraw |
| `cta_1_4` / `swipe_meta` | CTA catalog 1–4 on HTML; `swipe_trigger` meta only |
| `shell_freeze` | no AppShell / nav redesign |
| `no_silent_social` | no Meta/IG publish this wave |
| `secrets` | never in memory / skills / reports |

### Supersede within this wave

| Prior wording | New lock |
|---------------|----------|
| Forced Armenian motif list in Scriptwriter overlay | Motifs **optional** (`motifs_optional`) |
| Negative «do not assume 64px» as primary type guidance | **Positive** FULL DESIGN table (`full_design_inject`) |
| Brand chrome default top-left / tiny / plate bg | bottom-RIGHT enlarged transparent + name-inline-right (`logo_chrome_br`) |
| secondary_copy «2–3 sentences» soft | **2–3× richer** HARD (`secondary_copy_rich`) |

---

## 3. Target flow (patched)

```text
Settings Design (verify path · lock 7)
  upload liked slide/reel/image
  → POST /api/settings/design-deconstruct
  → deconstructStyle (lib/studio/deconstruct-style + lib/agents/deconstructStyle)
  → DesignPresetFile + DESIGN.md (colors + fonts + sizes per role)
  → Embla activeId / DesignSlot
  → next Designer draw reads active preset

Scriptwriter
  → Dramaturgy JSON
  → visual_prompt RICH ≥3 elements; motifs OPTIONAL (no laundry list)  [AI Bridge]
  → secondary_copy 2–3× richer on body slides                               [AI Bridge]

Designer
  → system: FULL DESIGN TOKENS table (family+size+color per role)         [AI Bridge + design-library]
  → palette → bg mood harmony
  → html_layout = placement + brandChrome bottom-right + fontFit reduce-only
  → adjacent anchors VARY (not always top-left)
  → bg prompts scene-only (S57)

Image model → bg plates

Placeholders
  → logoRef sanitized → LLM
  → logoRefRaw → composite <img>                                          [Backend KEEP]

carousel-layered-composite
  → CSS from FULL DESIGN (scale + colors)
  → .brand: bottom-RIGHT; enlarged; transparent; flex row icon→name
  → .slide-num: own slot; body tokens; pretty "N / M"
  → fontFit: shrink only; never grow above DESIGN
  → variety: execute anchors; validate adjacent differ (or soft-fail + AD)
  → Puppeteer → slide_01.png … slide_06.png

Art Director (if still in pipeline)
  → remarks: thin secondary_copy / logo wrong corner / all top-left / ignored colors
  → STOP — NO remake

Draft / HITL unchanged
```

---

## 4. Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Frontend: OMIT (unless §9 Brand/deconstruct UI broken)       │
│ shell_freeze AppShell                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ (optional escalate only)
┌──────────────────────────▼───────────────────────────────────┐
│ AI Bridge: FULL DESIGN overlay; remove 64px negatives;       │
│ Scriptwriter secondary_copy + motifs optional;               │
│ Designer variety + fontFit; AD checklist sync;               │
│ deconstruct agent output includes colors/fonts/sizes         │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Backend: buildDesignTokensPayload full role table;           │
│ composite logo BR chrome; slide-num body tokens;             │
│ fontFit reduce-only; variety validate; smoke ONE×6;          │
│ deconstruct persist → DesignPreset with scale+colors         │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Tester: guards G1–G10 + smoke ONE×6 pretty N/M               │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — FULL DESIGN positive block; strip/replace «do not assume 64px»; Scriptwriter `secondary_copy` richness + motifs optional; Designer variety + fontFit wording; `lib/studio/art-director-review.ts` checklist (logo BR, variety, secondary_copy, FULL colors); `lib/agents/deconstructStyle.ts` — ensure parsed preset emits colors/fonts/sizes; optional `lib/mesh/agent-defaults.ts` deltas | Composite CSS impl; AppShell; BrandPanel JSX (unless §9) |
| **Backend** | `lib/settings/design-library.ts` — `buildDesignTokensPayload` / `formatActiveDesignMdForPrompt` **full role table**; `lib/studio/carousel-layered-composite.ts` — brand BR + enlarge + transparent + name row; slide-num body tokens + `N / M`; fontFit reduce; variety validation; `lib/intake/placeholders.ts` keep dual-path; deconstruct route persist (`app/api/settings/design-deconstruct/route.ts` + `lib/studio/deconstruct-style.ts`) so DesignPreset has scale+colors; smoke folder | Prompt prose invent beyond thin wire; Create modal; AppShell |
| **Frontend** | **Skip by default.** §9 only: Settings Design upload / deconstruct trigger / Brand logo upload so path has data | AppShell; Create redesign; mesh geometry |
| **Tester** | Guards + smoke presence (6 PNG + pretty nums); grep/fixture asserts | Product invent |
| **Deployer** | Localhost refresh before smoke if Orchestrator arms | Prod/VPS |
| **Smoke** | ONE 6-slide; stop even if AD remarks | Remake loop |

---

## 5. Contracts by lock

### 5.1 FULL DESIGN inject (`full_design_inject`) — P0

**SoT:** active DesignPreset / DESIGN.md.

**Payload shape (target — Architect names; AI Bridge/Backend implement):**

```text
roles:
  title:   { family, weight?, sizePx, lineHeight?, color }
  body:    { family, weight?, sizePx, lineHeight?, color }
  content: { family, weight?, sizePx, lineHeight?, color }
  accent:  { color }
  muted:   { color }
  slideNumber: { family, sizePx, color }  // defaults → body
  brandName:   { family, sizePx, color }  // content family OK
  cta:     { … } when present
paletteMood: short guidance string from colors → bg lighting
```

**Wire:**
- Expand `buildDesignTokensPayload` in `lib/settings/design-library.ts` to print **role table** (not only nested `colors` + `typography.scale` blobs).
- `formatActiveDesignMdForPrompt` + Designer overlay in `create-carousel-prompts.ts` paste **positive** scale sentences.
- **Remove** primary reliance on negatives: «Do NOT assume 64px», «do not invent Instagram-huge type» as the main type rule (replace with printed px + colors).
- Bg prompt / Designer system: «match scene mood to type colors» (e.g. lavender type → cool mist / dusk violet — not flat black mud).

**FAIL:** scale-only inject without per-role colors; negatives remain as sole guidance; Designer invents parallel type system ignoring payload.

### 5.2 Motifs optional (`motifs_optional`) — P0

**Wire:** `create-carousel-prompts.ts` Scriptwriter overlay — keep ≥3 scene elements; rewrite Armenian block to **optional cultural taste when topic fits**; ban laundry-list force.

**FAIL:** every slide forced khachkar/apricot/pomegranate checklist.

### 5.3 Logo chrome bottom-RIGHT (`logo_chrome_br`) — P0

**Evidence of gap (as of Architect read):**
- `carousel-layered-composite.ts`: default `brandChrome` falls back toward **top-left**; `.brand` uses `top:` positioning; `.brand img` = **52px** + `background: rgba(0,0,0,0.25)` plate.

**Target CSS/behavior:**
- Default `brandChrome` = `bottom-right`.
- `.brand` anchored **bottom-RIGHT** inside safe-zone.
- Icon **enlarged** (Architect bar: ≥ **72–88px** side; pick one in Backend report — not tiny 52).
- `background: transparent` on icon (no solid plate).
- Flex **row**: `[img] [brand-name]` — name **right of** icon, never column-under.
- Dual-path KEEP: `logoRefRaw` → `<img>`.

**FAIL:** top-left default; name under icon; plate bg; name-only when logo set.

### 5.4 Slide number own slot (`slide_num_own_slot`) — P1

**KEEP** separate `.slide-num` div (already in composite).

**Tighten:**
- Tokens = **body** paragraph (family + color + size from FULL DESIGN / `typeScale.slideNum` mapped to body).
- Pretty format with spaces: `01 / 06` (or `1 / 6` — Backend picks one; Tester asserts consistent). Prefer **`NN / MM`** zero-pad.

**FAIL:** fused into headline; wrong token role (title size); bare `01` without total.

### 5.5 secondary_copy richer (`secondary_copy_rich`) — P0

**Wire:**
- Scriptwriter system/user overlays: HARD «2–3× richer than thin stub» + examples (value beat / concrete example / micro-story).
- Zod / critic: reject empty or trivially short body `secondary_copy` (Architect: min ~ **120–180 chars** OR ≥3 substantive clauses — Backend/AI Bridge pick measurable bar in report).
- AD checklist flags thin air as P1 content completeness.

**FAIL:** 1–2 vague sentences on body slides as ship quality.

### 5.6 Font fit reduce-only (`font_fit_reduce_only`) — P1

**Wire:**
- Designer may emit `html_layout.fontFit: { role, deltaPx: negative, reason }`.
- Composite applies shrink; **clamp** so computed size ≤ DESIGN scale for that role.
- Document in overlay meta / trace.
- **Ban** positive enlarge above DESIGN.

**FAIL:** enlarge-on-fit; silent grow; no documentation of reduce.

### 5.7 Deconstruct verify path (`deconstruct_verify`) — P1 · Architect named

**Canonical path (HARD — verify end-to-end):**

```text
1. UI: Settings → Design → upload liked slide / reel / image
2. API: POST app/api/settings/design-deconstruct/route.ts
        (related: design-razbor may share deconstructStyle — do not break)
3. Studio: lib/studio/deconstruct-style.ts
4. Agent parse: lib/agents/deconstructStyle.ts
   → MUST produce DesignPresetFile with:
      - colors (title/body/accent/muted/…)
      - typography.display / body / mono (+ armenianSafe)
      - typography.scale (title/body/content sizes)
5. Persist → DesignSlot / Embla activeId (existing Settings Design store)
6. Resolve active: design-library active resolve
7. Designer draw: formatActiveDesignMdForPrompt / buildDesignTokensPayload
   → FULL role table inject (lock 1)
```

**AI Bridge check:** deconstruct model prompt + parser emit fonts/sizes/colors (not colors-only stub).  
**Backend check:** persisted preset round-trips into `buildDesignTokensPayload` with non-null scale + colors.  
**Tester guard:** fixture or integration assert path 2→7 fields present.  
**Frontend:** only if upload button / Embla active set broken (§9).

**FAIL:** deconstruct writes palette without sizes; inject still scale-less; path undocumented.

### 5.8 Layout variety (`layout_variety`) — P0

**Wire:**
- Designer HARD: adjacent slides must differ in `anchor.x` and/or `anchor.y` (and preferably `template`).
- Backend: validate carousel pack — if all anchors equal top-left (or identical), **fail job** OR attach warning + AD remarks (prefer **hard fail** for smoke/strict; soft + AD for live chat — Backend chooses; document in report). Prefer hard fail for smoke script.
- Fallback `synthesizeFallbackHtmlLayout` must also rotate anchors across slide indices (not always center/left).

**FAIL:** 6/6 top-left; identical anchors every slide.

### 5.9 Smoke (`smoke_one_x6`) — P1

**Budget:** ONE Client-score carousel × **6** finals.  
**Path (proposed):** `docs/карусель тест/design-inject-logo-br-smoke-6/`  
**Assert:** 6 PNG; pretty `N / M` on frames; logo BR chrome; variety visible; secondary_copy not thin (spot-check JSON or AD notes).  
**NO remake loop.**

---

## 6. Tickets (full-queue · one pass)

| ID | Locks | Primary role |
|----|-------|--------------|
| **C-full-design-inject** | 1, 7 (payload half) | AI Bridge + Backend (`design-library`) |
| **C-motifs-optional-sw** | 2 | AI Bridge |
| **C-logo-chrome-br** | 3 | Backend (+ AI Bridge brandChrome default wording) |
| **C-slide-num-body** | 4 | Backend |
| **C-secondary-copy-rich** | 5 | AI Bridge (+ zod Backend if needed) |
| **C-font-fit-reduce** | 6 | AI Bridge schema + Backend composite |
| **C-deconstruct-verify** | 7 | AI Bridge agent + Backend persist + Tester |
| **C-layout-variety** | 8 | AI Bridge + Backend |
| **C-smoke-design-inject-6** | 9 | Backend smoke + Tester |

Path order = chain steps (no parallel overlapping writers).

---

## 7. File path locks (no overlapping writers)

| Path | Owner step |
|------|------------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/art-director-review.ts` | AI Bridge |
| `lib/agents/deconstructStyle.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` (optional deltas) | AI Bridge |
| `lib/settings/design-library.ts` | Backend |
| `lib/studio/carousel-layered-composite.ts` | Backend |
| `lib/intake/placeholders.ts` | Backend (KEEP dual-path; thin edits only) |
| `lib/studio/deconstruct-style.ts` + `app/api/settings/design-deconstruct/route.ts` | Backend (persist/fields) |
| `lib/studio/carousel-json-contract.ts` (zod secondary_copy / html_layout.fontFit if needed) | Backend after AI Bridge prompt lock — **sequential**, not parallel |
| Smoke folder under `docs/карусель тест/` | Backend |
| Guards script under `scripts/` | Tester |
| AppShell / Sidebar / Create chrome | **FORBIDDEN** |
| Brand / Design Settings UI | Frontend **only** if §9 armed |

---

## 8. Tester guards (proposed G1–G10)

| ID | Assert |
|----|--------|
| G1 | `buildDesignTokensPayload` (or printed overlay) includes per-role **color + size + family** |
| G2 | Designer overlay has positive scale table; **no** sole reliance on «do not assume 64px» |
| G3 | Scriptwriter overlay: motifs **optional**; no forced laundry-list block |
| G4 | Scriptwriter: secondary_copy richness HARD wording present |
| G5 | Composite default brand = bottom-right; icon enlarged; transparent bg; flex row icon→name |
| G6 | `.slide-num` own block + pretty `N / M` + body token map |
| G7 | fontFit: reduce applied; enlarge above DESIGN impossible (unit/fixture) |
| G8 | Deconstruct fixture → preset has colors + typography.scale → payload non-empty role colors/sizes |
| G9 | Variety: adjacent anchors differ in fixture pack / fallback synthesizer rotates |
| G10 | Smoke dir has **6** PNG + numbering spot-check |

---

## 9. Frontend escalation gate (§9)

Arm Frontend-minimal **only if** one of:

1. Settings Design upload / deconstruct CTA does not call `POST design-deconstruct`.
2. Embla activeId not set after successful deconstruct (tokens never resolve).
3. Brand logo upload does not persist resolvable `logoRef` (dual-path has nothing raw).

Otherwise Frontend = **SKIP**. No Create/Razbor chrome work.

---

## 10. Out of scope

- AppShell / nav IA / Studio module chrome redesign  
- Create modal parity / Razbor UI  
- Scout/Apify / feed cards  
- Social Meta publish  
- OCR remake vision ON  
- Parallel `correct_pipeline` type-on-PNG ship path  
- Monolithic coder replacing AI Bridge + Backend  
- VPS/prod deploy (localhost only if Deployer armed)  
- Product code in Architect turn  

---

## 11. Acceptance summary

Волна **DONE** when:

1. Designer system shows FULL positive role table (fonts+sizes+colors) every draw.  
2. Motifs not forced laundry list.  
3. Logo chrome: larger, bottom-RIGHT, transparent, name right-of-icon.  
4. Slide num own slot, body tokens, pretty `N / M`.  
5. secondary_copy measurably richer.  
6. fontFit reduce-only documented.  
7. Deconstruct path verified (AI Bridge + Backend + Tester G8).  
8. Layout variety across adjacent slides.  
9. Smoke ONE×6 green.  
10. shell_freeze intact; no social publish.

---

## 12. Architect verdict

```
🏗️ АРХИТЕКТОР: spec+chain ready for wave 2026-10-18-design-inject-logo-br
Locks: full_design_inject · motifs_optional · logo_chrome_br · slide_num_own_slot ·
       secondary_copy_rich · font_fit_reduce_only · deconstruct_verify · layout_variety · smoke_one_x6
Chain: AI Bridge → Backend → Tester → smoke
Frontend: omit unless §9
Product code this turn: none
Next: Orchestrator → AI Bridge (step 2)
```
