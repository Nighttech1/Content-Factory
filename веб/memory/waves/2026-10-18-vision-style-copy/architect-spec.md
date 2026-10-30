# Architect Spec — 2026-10-18 vision style-copy

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-vision-style-copy`  
**Цель:** Product path **`styleCopyMode=vision_ref`**: эталонный кадр → **image reference** в Designer/draw; hard-copy композиции с картинки; **без** FULL DESIGN TOKEN CARD / stock Manrope·Cormorant / `typography.scale`; product default **`characterPaint=in_image`**; partial/inset bg; smoke **ONE × 6** (Variant A); S57 layered HTML KEEP  
**Client gate:** later (Orchestrator); not this Architect turn  
**ticket_limit:** `full-queue`  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**upgrade_only:** `true` (patch prompts + draw wire + composite bgFit; **не** rewrite Create chrome)  
**Frontend:** **omit** unless §9 (4-frame style-copy pack UI missing)  
**Trainer:** `memory/trainer/2026-10-18-vision-style-copy-grade.md` (grade **B**)  
**Canon card:** `plugins/trainer/vision-style-copy.md`  
**Prior wave (partial supersede):** `memory/waves/2026-10-18-layout-copy-dual-char/architect-spec.md`  
**Skills:** `create-carousel-prompts-notes` § VISION STYLE-COPY · `carousel-json-contract` Phase 7 vision_ref exception · `art-director/html-layout-variant-a` · `workers/designer-carousel` § Vision style-copy · `ai-bridge` · `content-pipeline-agents` · `carousel-prompt-trace` · `backend` · `tester` · `prompt-engineering`  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-vision-style-copy/chain.md`

**Etalon SoT (на диске):**  
`generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`

| File | Role in wave |
|------|----------------|
| `01-real-estate-orange-grid.png` | **ACTIVE** style-copy pack for smoke — 4-frame grid (cover · midA · midB · cta) |
| `02-luma-coffee-grid.jpg` | Alternate pack (library / selected slot) |
| `03-omkopa-teal-character-grid.png` | Alternate pack (library / selected slot) |
| `04-vernatun-girl-character-sheet.jpg` | **Character sheet only** — Landscapes conductor; **not** a 4th style slot |

---

## 1. Зачем (простым языком)

Предыдущая волна учила копировать раскладку через `layoutMap` (парсер сетки) и вливала в промпт огромную таблицу шрифтов Manrope/Cormorant. Модель часто «применяла таблицу», а не зеркалила эталон глазами.

Эта волна — **эксперимент**: показать модели **картинку эталона** как reference и сказать «скопируй композицию с фото». Таблицу токенов на этом пути **не давать**. Текст и кнопки Vernatun — наши. Девочка-проводник рисуется **внутри фона** (`in_image`). Если на эталоне фото не на весь кадр — так и оставляем (не форсим full-bleed cover).

`layoutMap` остаётся **legacy / optional** — чинить парсер как единственный путь успеха **запрещено**.

---

## 2. User locks (HARD)

| # | Lock id | Acceptance (языком Клиента / Tester) |
|---|---------|--------------------------------------|
| 1 | `style_copy_vision_ref` | Job / draw carries `styleCopyMode=vision_ref`. Etalon slide PNG attached as **image reference** (vision / i2i / reference-first). Trace proves attach. |
| 2 | `character_default_in_image` | Product / smoke / settings default: `characterPaint` / `character_paint` = **`in_image` ONLY**. `overlay_cutout` = legacy OK, **not** smoke default, **not** settings default. |
| 3 | `ban_full_token_card` | On `vision_ref`: **no** FULL DESIGN TOKEN CARD, **no** stock `typography.scale` table, **no** Manrope·Cormorant inject in Designer system/user. Timeline dump of **full** prompt proves absence. |
| 4 | `etalon_image_ref_wire` | Per-slide reference selected from active 4-slot pack → Backend draw (`referenceImageUrl` \| `referenceImagePath` \| base64). |
| 5 | `hard_copy_prompt` | Prompt orders hard-copy: composition, text zones, hierarchy, accents, logo/CTA/numbering (or absent), photo-vs-plate frame share. |
| 6 | `partial_bg_fit` | Composite supports non–full-bleed: `bgFit` modes (cover / contain-letterbox / mask-inset). Etalon partial photo → not forced cover. |
| 7 | `keep_pipeline` | KEEP: Scriptwriter wide body (≥220 / ≥5 clauses), conductor role, S57 layered HTML, CTA 1–4, swipe meta, `shell_freeze`. |
| 8 | `not_layoutmap_sole` | Wave PASS **must not** depend on «fix layoutMap parser only». `vision_ref` is the experiment path. |
| 9 | `etalon_pack_so_t` | Packs from `layout-copy-refs-2026-10-18/`; smoke active **01** (or selected slot). |
| 10 | `smoke_a_six` | **ONE** 6-slide carousel, Variant A `in_image`, artifacts under `docs/карусель тест/…` + timeline with full prompt. |
| 11 | `no_publish_no_vps_no_wipe` | No social publish, no VPS, no DB wipe. |

### Product enum (HARD)

```ts
type StyleCopyMode = "vision_ref" | "token_card";
```

| Value | Meaning |
|-------|---------|
| **`vision_ref`** | **NEW product path (this experiment).** Style SoT = etalon image reference. Skip FULL token card. |
| **`token_card`** | **Legacy.** FULL DESIGN TOKEN CARD + optional `layoutMap` grammar (prior waves design-inject / layout-copy). Default for non-experiment jobs until product flips. |

**Skill alias note:** `html-layout-variant-a` may still say `tokens` / `layout_map` as finer `layoutMapSource`. Product **job flag** for this wave is the binary above. Mapping:

| `styleCopyMode` | `layoutMapSource` (html_layout) | FULL TOKEN inject |
|-----------------|----------------------------------|-------------------|
| `vision_ref` | `vision_ref` | **OFF** |
| `token_card` | `preset` if layoutMap present, else invent/`tokens` | **ON** (prior canon) |

### Naming aliases

| User / smoke | Runtime / JSON |
|--------------|----------------|
| `character_path` | `characterPaint` / `character_paint` / `html_layout.characterPaint` |
| Style pack slots | `cover` · `midA` · `midB` · `cta` |
| Image ref | `referenceImageUrl` \| `referenceImagePath` \| `referenceImageBase64` |

### Keep from prior waves (do not reopen)

| Keep | Rule |
|------|------|
| `secondary_copy_wide` | Body ≥220 chars **AND** ≥5 clauses |
| `conductor_role` | Character presents / speaks slide text; to-camera; not story actor |
| `s57_layered` | image bg + HTML/CSS Puppeteer @ 1080×1350; OCR remake vision **OFF** |
| `variant_a` | `html_layout` closed templates; composite executes |
| `cta_1_4` / `swipe_meta` | CTA catalog 1–4 on HTML; `swipe_trigger` meta only |
| `shell_freeze` | no AppShell / nav redesign |
| `no_silent_social` | no Meta/IG publish |
| `secrets` | never in memory / skills / reports |
| `ad_no_remake` | AD `approve` \| `remarks` only |

### Supersede (narrow · this experiment)

| Prior (layout-copy / design-inject) | This wave |
|-------------------------------------|-----------|
| layoutMap = **primary** style-copy path | **`vision_ref` primary**; layoutMap optional legacy |
| FULL DESIGN TOKEN CARD **every** draw | **Exempt** when `styleCopyMode=vision_ref` |
| Dual smoke primary RE = `overlay_cutout` | Product / smoke default → **`in_image`**; cutout legacy only |
| Always full-bleed cover bg | Honor etalon geometry via `bgFit` |

---

## 3. Target flow (patched)

```text
ACTIVE PACK (smoke default = 01 RE orange grid)
  grid file → slice / resolve 4 slots:
    cover · midA · midB · cta
  (02 / 03 = alternate packs; 04 = character sheet only)

Scriptwriter                                              [AI Bridge · KEEP]
  → Dramaturgy JSON
  → secondary_copy ≥220 + ≥5 clauses
  → conductor role
  → visual_prompt scene-only letters ban (S57)

Designer job                                              [AI Bridge + Backend]
  styleCopyMode = vision_ref
  characterPaint = in_image   ← product + smoke default
  per slide N:
    refSlot = mapSlideToRefSlot(N, total=6)
    attach reference image (URL | path | base64)
  system/user prompt:
    HARD-COPY composition/zones/hierarchy/accents/
    logo·CTA·numbering (or absent) / photo-vs-plate share
    Brand Vernatun content swap (text + CTA 1–4 + optional logo)
    BAN: FULL TOKEN CARD · typography.scale · Manrope·Cormorant
  html_layout.layoutMapSource = vision_ref
  emit bgFit hint from etalon geometry (cover|contain|mask)

Image model (reference-first / i2i)
  → scene (+ conductor in pixels when in_image)
  → composition follows attached etalon slide

carousel-layered-composite                                [Backend]
  → S57 HTML overlay (CTA 1–4, swipe meta, logo if etalon shows)
  → bgFit: cover | contain (letterbox) | mask (inset zone)
  → Puppeteer 1080×1350 → slide_01…06

Art Director (if wired)
  → remarks only — NO remake

SMOKE (lock 10)
  ONE × 6 · useful topic · path A in_image · pack 01
  → docs/карусель тест/… + timeline FULL prompt
```

---

## 4. Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ Frontend: OMIT (unless §9 — 4-frame pack / mode UI missing)  │
│ shell_freeze AppShell                                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ (optional escalate only)
┌──────────────────────────▼───────────────────────────────────┐
│ AI Bridge: vision_ref prompts; BAN FULL TOKEN inject;        │
│ hard-copy wording; skip buildDesignTokensPayload FULL table; │
│ default characterPaint=in_image; map slots→slide wording;    │
│ AD checklist sync; trace fields                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Backend: styleCopyMode on job; resolve 4 slots from grid;    │
│ draw image-ref wire; default in_image; bgFit composite;      │
│ smoke ×6 + timeline dump                                     │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Tester: guards G1–G14 + smoke presence + prompt ban grep     │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — vision_ref overlays; skip FULL `buildDesignTokensPayload` when mode=vision_ref; hard-copy + BAN stock fonts/scale; default `in_image`; Brand Vernatun channel only; `lib/studio/art-director-review.ts` checklist; optional `lib/mesh/agent-defaults.ts`; align notes if runtime reads them | Composite CSS; grid slice I/O; AppShell; Settings JSX (unless §9) |
| **Backend** | Job/draw accept `styleCopyMode` + per-slide ref; slice/resolve 4 slots from pack grid; `lib/llm/aggregator-images.ts` wire (path/url/base64); default `characterPaint=in_image`; `carousel-layered-composite` `bgFit`; smoke folder + timeline artifact | Prompt prose invent beyond thin wire; Create modal; AppShell |
| **Frontend** | **Skip by default.** §9 only: Settings 4-frame style-copy pack picker / mode toggle if missing | AppShell; Create redesign |
| **Tester** | Guards + smoke 6 PNG + full-prompt ban assert | Product invent |
| **Deployer** | Localhost refresh if Orchestrator arms | Prod/VPS |
| **Smoke** | ONE × 6; stop; no remake loop | Second draw after AD |

---

## 5. Contracts by lock

### 5.1 `styleCopyMode` enum — P0

```ts
type StyleCopyMode = "vision_ref" | "token_card";

interface StyleCopyJobFields {
  styleCopyMode: StyleCopyMode;
  /** Active pack id or absolute/relative path to grid (01/02/03). */
  styleCopyPackId?: "re_orange_01" | "luma_02" | "omkopa_03" | string;
  styleCopyPackPath?: string; // e.g. …/01-real-estate-orange-grid.png
  /** Resolved after slice — Backend fills before per-slide draw. */
  styleCopySlots?: StyleCopySlotPack;
}

interface StyleCopySlotPack {
  cover: ImageRef;
  midA: ImageRef;
  midB: ImageRef;
  cta: ImageRef;
}

type ImageRef =
  | { kind: "path"; path: string }
  | { kind: "url"; url: string }
  | { kind: "base64"; mime: "image/png" | "image/jpeg"; data: string };
```

**FAIL:** job runs smoke without `vision_ref`; silent fallback to `token_card` inject.

### 5.2 Four etalon slots → slide N reference selection — P0

**Source:** active pack grid (smoke = **01**). Backend slices (or loads pre-sliced cache) into four roles:

| Slot id | Role | Typical content on RE orange |
|---------|------|------------------------------|
| `cover` | First frame of grid | Hook / hero composition |
| `midA` | Second | Body rhythm A |
| `midB` | Third | Body rhythm B |
| `cta` | Fourth | CTA chrome frame |

**Character sheet `04`:** never used as style slot; only Landscapes / conductor identity for `in_image` prompt.

**Mapping for N-slide carousel (HARD · N=6 smoke):**

```text
function mapSlideToRefSlot(slideIndex1Based: number, N: number): SlotId {
  if (slideIndex1Based === 1) return "cover";
  if (slideIndex1Based === N) return "cta";
  // body slides 2..N-1 alternate midA / midB
  const bodyOrdinal = slideIndex1Based - 2; // 0-based among body
  return bodyOrdinal % 2 === 0 ? "midA" : "midB";
}
```

| Slide (N=6) | Role | Ref slot |
|-------------|------|----------|
| 1 | cover | **cover** |
| 2 | body | **midA** |
| 3 | body | **midB** |
| 4 | body | **midA** |
| 5 | body | **midB** |
| 6 | cta | **cta** |

**Selected slot packs:** if user/Orchestrator selects 02 or 03, same mapping applies to that grid. Smoke default = **01**.

**FAIL:** every slide uses the same full grid PNG without slice; cta slide gets cover ref; 04 used as style ref.

### 5.3 What is OMITTED from LLM prompt on `vision_ref` — P0

**OMIT (HARD) from Designer system + user on this path:**

| Omit | Why |
|------|-----|
| FULL DESIGN TOKEN CARD / `buildDesignTokensPayload` full role dump | Forces spreadsheet apply |
| Stock / default **Manrope** · **Cormorant** (and forced family inject) | Stock type look |
| `typography.scale` positive table («Title = Npx …») | Same |
| Colors-per-role hex spreadsheet as style SoT | Style from picture instead |
| Instructions that require `layoutMap` for PASS | Experiment = vision primary |
| «Always full-bleed cover background» | Conflicts with partial etalon |

**STILL INCLUDE (allowed):**

| Include | Notes |
|---------|-------|
| HARD-COPY vision instructions (§5.5) | Primary |
| Attached etalon image ref (multimodal) | Required |
| Brand Vernatun: headline / body / secondary_copy / CTA 1–4 | Content swap |
| Optional Settings Brand **logo** channel (raw for composite; sanitized for LLM if needed) | Chrome may mirror etalon presence |
| `character_paint=in_image` + conductor wording | Default |
| S57 scene-only ban (no letters/logos/watermarks in **bg** pixels) | KEEP |
| Dramaturgy JSON / slide roles | KEEP |
| Trace markers: `styleCopyMode=vision_ref` + `FULL inject skipped` | Required |

**Trace FAIL strings (grep must find ZERO in vision_ref Designer prompt dump):**

```text
FULL DESIGN TOKEN
typography.scale
Manrope
Cormorant
Title = .*px
buildDesignTokensPayload
```

(Case-insensitive where sensible; allow mentioning «do NOT inject Manrope» only inside BAN lines — prefer zero family names.)

### 5.4 Image ref wire (Backend contract) — P0

Reuse / extend existing aggregator image input:

```ts
// lib/llm/aggregator-images.ts — extend if needed
interface DrawReferenceInput {
  referenceImagePath?: string;   // local fs absolute/workspace-relative
  referenceImageUrl?: string;    // http(s) or data: URL
  // NEW if missing today:
  referenceImageBase64?: string; // raw base64 without data: prefix
  referenceImageMime?: "image/png" | "image/jpeg";
}
```

**Per-slide draw call (vision_ref):**

1. Resolve `slot = mapSlideToRefSlot(i, N)`.
2. Load `ImageRef` from `styleCopySlots[slot]`.
3. Prefer **path** (local etalon slice) → else url → else base64.
4. Pass into image model as **reference / i2i / vision** input (provider-native), not only as text path string.
5. Designer **describe** (if used) also receives the same ref for zone reading.
6. Log in timeline: `styleCopyMode`, `slot`, `refKind`, `refPath|urlHash`, `FULL inject skipped: true`.

**Size note:** slices should be publish-ish 4:5 crops from the grid; if grid is 2×2, Backend documents slice math once in `backend-report.md`.

**FAIL:** prompt mentions path but API call has no image part; base64 dumped into text prompt as megabytes of ASCII without multimodal part.

### 5.5 Hard-copy prompt contract (AI Bridge) — P0

```text
VISION STYLE-COPY (styleCopyMode=vision_ref):
- The attached image is the STYLE + COMPOSITION source of truth.
- HARD-COPY from the picture:
  · overall composition and balance
  · text zones (where type lives) and hierarchy (title > body > accents)
  · accent treatments (highlights, chips, underlines — as visible)
  · logo presence + placement OR absence
  · CTA chrome presence + placement OR absence
  · numbering presence + style OR absence
  · photo-vs-plate / frame share (how much of the canvas is photo vs solid/plate)
- Swap ONLY Vernatun content: our headline, body, secondary_copy, CTA catalog 1–4
  (+ optional Brand logo asset). Do not invent a new layout system from tokens.
- character_paint=in_image (product default): conductor may appear IN scene pixels;
  pose to-camera; speaks slide text; not a story actor inside the scene.
- BAN: FULL DESIGN TOKEN CARD · stock typography.scale · Manrope/Cormorant defaults.
- BAN: always full-bleed cover when the reference shows partial/inset photo.
- Emit html_layout with layoutMapSource=vision_ref and bgFit matching the reference
  (cover | contain | mask).
- layoutMap JSON is NOT required for PASS on this path.
```

### 5.6 Composite `bgFit` modes (partial bg) — P0

When etalon is not full-bleed photo, composite **must** support:

| `bgFit` | Behavior | When |
|---------|----------|------|
| **`cover`** | Image fills 1080×1350 (object-fit: cover; may crop) | Etalon photo is full-bleed |
| **`contain`** | Letterbox / pillarbox — full image visible; plate/fill in gaps | Etalon shows photo with clear margins / plate |
| **`mask`** | Image drawn only inside a rectangular (or rounded) **inset zone**; rest = plate/solid from html_layout | Etalon has clear photo window + type plate |

```ts
type BgFit = "cover" | "contain" | "mask";

interface BgFitHint {
  bgFit: BgFit;
  /** Normalized 0..1 rect for mask / contain placement; optional for cover */
  photoZone?: { x: number; y: number; w: number; h: number };
  /** CSS-ish object-position when useful */
  objectPosition?: string; // e.g. "center top"
}
```

**Source of `bgFit`:** Designer `html_layout` (from vision read) **or** Backend heuristic from slot metadata; composite executes. Default when uncertain: prefer **`contain`** over wrong full-bleed cover if plate margins visible on ref.

**FAIL:** every slide forced `object-fit: cover` full-bleed despite etalon inset photo.

### 5.7 Character default `in_image` — P0

| Context | Value |
|---------|-------|
| Product default | `in_image` |
| This wave smoke | `in_image` |
| Settings default (if exposed) | `in_image` |
| `overlay_cutout` | Legacy switch only — **not** armed for smoke |

Conductor locks KEEP from prior wave (speaks text, to-camera, not kitchen helper).

### 5.8 KEEP pipeline bars — P0

Unchanged acceptance from prior:

- Scriptwriter body ≥220 + ≥5 clauses  
- Conductor role  
- S57 layered HTML @ 1080×1350  
- CTA catalog 1–4 on `cta_slide` HTML  
- `swipe_trigger` meta only (not painted)  
- `shell_freeze`  
- Vision OCR remake **OFF**

### 5.9 Smoke plan — P0

| Field | Value |
|-------|-------|
| Count | **ONE** carousel × **6** slides |
| Path | Variant A · `characterPaint=in_image` |
| Pack | **01** RE orange (or Orchestrator-selected 02/03) |
| Topic | Useful-sheet **#17 kitchen** (or Backend-chosen other useful ID — document in meta) |
| Output dir | `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/` |
| Brief alias | May also refresh/replace keep path `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` — prefer **wave-named** dir above; note alias in backend-report |
| Artifacts | `slide_01.png` … `slide_06.png` + `meta.json` + **`timeline-prompt-full.md`** (or `.json`) with **complete** Designer system+user (+ note image-ref attached) proving **no** Manrope / scale table |
| Stop | No AD remake loop; no second full gen |

**FAIL:** overlay_cutout smoke as default; missing timeline; Manrope/scale present in dump; ≠6 PNG.

---

## 6. Tickets (full-queue · one pass)

| ID | Locks | Primary role |
|----|-------|--------------|
| **C-vision-style-mode** | 1, 3, 5, 8 | AI Bridge (+ Backend job flag) |
| **C-vision-image-ref-wire** | 4, 9 | Backend (+ AI Bridge multimodal prompt attach) |
| **C-vision-bg-fit** | 6 | Backend composite (+ AI Bridge emit hint) |
| **C-char-default-in-image** | 2 | AI Bridge defaults + Backend job default |
| **C-vision-smoke-a6** | 7, 10, 11 | Backend gen + Tester |

Path order = chain steps (no parallel overlapping writers).

---

## 7. File path locks (no overlapping writers)

| Path | Owner step |
|------|------------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/art-director-review.ts` | AI Bridge |
| `lib/mesh/agent-defaults.ts` (optional defaults) | AI Bridge |
| `lib/llm/aggregator-images.ts` | Backend |
| Draw / job routes under `app/api/**` that accept styleCopyMode + refs | Backend |
| Pack slice / slot resolve helper (new or under `lib/studio/` / `lib/settings/`) | Backend |
| `lib/studio/carousel-layered-composite.ts` (`bgFit`) | Backend |
| Smoke + timeline under `docs/карусель тест/` | Backend |
| Guards under `scripts/` + wave `guards.md` | Tester |
| AppShell / Sidebar / Create chrome | **FORBIDDEN** |
| Settings 4-frame pack / mode UI | Frontend **only** if §9 armed |

**Do not** treat `lib/agents/deconstructStyle.ts` layoutMap parser fix as the success path for this wave (optional touch only if shared types need `styleCopyMode` — prefer leave alone).

---

## 8. Tester guards (proposed G1–G14)

| ID | Assert |
|----|--------|
| G1 | Job/prompt path accepts `styleCopyMode` enum `vision_ref` \| `token_card` |
| G2 | On `vision_ref`, Designer overlay / builder **skips** FULL `buildDesignTokensPayload` dump |
| G3 | Full timeline prompt for smoke contains **no** Manrope / Cormorant / `typography.scale` / FULL DESIGN TOKEN CARD |
| G4 | Timeline / draw log shows **image reference attached** (path/url/base64 kind) per slide or per unique slot |
| G5 | Slot mapping fixture: N=6 → cover, midA, midB, midA, midB, cta |
| G6 | Hard-copy wording present (composition / zones / hierarchy / logo·CTA·numbering / photo-vs-plate) |
| G7 | Product default `characterPaint` / job default = `in_image` |
| G8 | Smoke meta: `character_paint=in_image` (not overlay_cutout) |
| G9 | `bgFit` enum honored in composite fixture (contain or mask path not identical to forced cover) |
| G10 | Smoke dir has **exactly 6** final PNG @ layered path |
| G11 | KEEP: secondary_copy bar still ≥220+≥5 in SW overlay / critic |
| G12 | KEEP: CTA 1–4 + swipe meta + `renderMode` layered_html markers |
| G13 | layoutMap parser fix **not** required: vision_ref smoke can PASS without layoutMap on preset |
| G14 | shell_freeze: no AppShell churn in wave diff |

---

## 9. Frontend escalation gate (§9)

Arm Frontend-minimal **only if** both:

1. Smoke/ops **cannot** select active pack 01 (or 02/03) / cannot supply 4-frame slots without UI, **and**  
2. No filesystem/API seed path exists for pack activation.

Otherwise Frontend = **SKIP**.  
**Do not** build AppShell, Create, or Razbor chrome.  
A Settings toggle «vision_ref vs token_card» is **nice-to-have**, not required for smoke if Backend env/job flag works.

**Architect decision for this wave:** Frontend **not needed** by default (`no`).

---

## 10. Out of scope

- AppShell / nav IA / Studio module chrome redesign  
- Create modal / Razbor UI parity work  
- Scout/Apify / feed cards  
- Social Meta publish  
- VPS / prod deploy  
- DB wipe / migrate reset  
- OCR remake vision ON  
- Parallel `correct_pipeline` type-on-PNG ship path  
- «Fix layoutMap parser» as sole experiment success  
- Dual smoke B (`overlay_cutout`) — **out** (legacy only)  
- Monolithic coder replacing AI Bridge + Backend  
- Product code in Architect turn  
- Pixel-clone of etalon as PASS bar (taste invent OK; composition hard-copy required)

---

## 11. Acceptance summary

Волна **DONE** when:

1. `styleCopyMode=vision_ref` wired end-to-end with etalon image refs per slide slot map.  
2. Designer prompts on that path omit FULL TOKEN CARD / scale / Manrope·Cormorant (timeline proof).  
3. Product + smoke default `characterPaint=in_image`.  
4. Composite supports `bgFit` cover | contain | mask for partial etalon photos.  
5. ONE × 6 layered smoke on pack **01**, useful topic, artifacts + full prompt timeline.  
6. KEEP bars (wide SW, conductor, S57, CTA 1–4, swipe meta, shell_freeze) intact.  
7. No social publish / VPS / DB wipe; layoutMap not sole PASS path.

---

## 12. Architect verdict

```
🏗️ АРХИТЕКТОР: spec+chain ready for wave 2026-10-18-vision-style-copy
Locks: style_copy_vision_ref · ban_full_token_card · character_default_in_image ·
       etalon_image_ref_wire · hard_copy_prompt · partial_bg_fit · keep_pipeline ·
       not_layoutmap_sole · smoke_a_six
Enum: styleCopyMode = vision_ref | token_card
Chain: Architect(done) → AI Bridge → Backend → Frontend SKIP → Tester → smoke
       → Deployer localhost if needed → Client later
Frontend: NO (unless §9)
Product code this turn: none
Etalon: generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/ (01 ACTIVE)
Next: Orchestrator → AI Bridge (step 2)
```
