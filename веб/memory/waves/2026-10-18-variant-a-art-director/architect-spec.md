# Architect Spec — 2026-10-18 Variant A `html_layout` + Art Director

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** Designer → structured **`html_layout`** (Variant A) → `carousel-layered-composite` **executes**; then NEW pipeline agent **Art Director** (remarks \| approve; **NO auto-remake**); mesh/Team + inspector Logs/review; smoke **ONE** 4-slide + AD text  
**Client gate:** optional (UI acceptance only if Orchestrator asks); product keep **S57** layered HTML  
**ticket_limit:** `default≤3`  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** redesign)  
**upgrade_only:** `true` (insert AD after composite; patch Designer contract + composite; do **not** rewrite Create chrome)  
**Trainer:** `memory/trainer/2026-10-18-variant-a-art-director-grade.md` (grade **B**)  
**Canon card:** `plugins/trainer/variant-a-art-director.md`  
**Skills:** `art-director` (+ `html-layout-variant-a` · `critique-checklist`) · `carousel-json-contract` Phase 7 · `carousel-layered-html-pipeline` · `content-pipeline-agents` · `ai-bridge` · `backend` · `xyflow-agent-mesh` · `content-factory-ui` · `tester` · `deployer`  
**Код продукта в этом ходе Архитектора:** **нет** — только `architect-spec.md` + `chain.md`.

**Chain:** `memory/waves/2026-10-18-variant-a-art-director/chain.md`

---

## 1. Зачем (простым языком)

Сейчас фон рисует нейросеть, а текст кладётся HTML-слоем — это уже канон S57. Но **как** именно сверстать слайд (где заголовок, какие слова выделить цветом, где логотип и персонаж) код во многом **угадывает сам** по роли слайда (`layout_variant` ≈ cover/body/cta).

Волна **Variant A** меняет договор:

1. **Дизайнер (LLM)** выдаёт на каждый слайд понятную схему **`html_layout`** — шаблон из закрытого списка, якорь текста, выделения фраз, подсказки куда поставить лого / персонажа / CTA.
2. Код **`carousel-layered-composite`** эту схему **выполняет** (выбирает CSS-шаблон, оборачивает accent-фразы, ставит chrome) — **без** сырого HTML/CSS из LLM.
3. Когда карусель уже собрана в PNG, появляется новый агент **«Арт-директор»**: смотрит последовательность (vision и/или LLM) и пишет либо **«принято»**, либо **замечания**. Он **никогда** сам не перерисовывает и не запускает новый цикл.

Для проверки волны: **одна** 4-слайдовая карусель + текстовый отзыв Арт-директора. Даже если есть замечания — **стоп**, без remake-петли.

---

## 2. Жёсткие замки (HARD · user + trainer)

| # | Lock | Значение |
|---|------|----------|
| 1 | `variant_a_html_layout` | Designer outputs **per-slide** `html_layout`: closed **`template`** catalog; **`text_block`** `anchor`/`align`; **`primary`/`secondary`** with `highlights[{phrase, style:"accent"}]`; **logo / character / cta** placement hints. No raw HTML/CSS strings from LLM as product path. |
| 2 | `composite_executes` | `carousel-layered-composite` **executes** layout: map `template` → CSS block; wrap accent spans from highlights; apply placement hints. Escape all text. Raster **1080×1350** Puppeteer. |
| 3 | `art_director_post_ready` | After carousel finals ready → AD **vision and/or LLM** critique → `verdict: "approve" \| "remarks"`. **NEVER auto-remake** (no redraw / re-composite / Designer re-enqueue from AD). |
| 4 | `ui_ad_mesh_inspector` | Show **«Арт-директор»** on Team / mesh flowchart **+** inspector **Logs / review** tab with last verdict + remarks text. |
| 5 | `smoke_one_plus_ad_text` | Smoke = **ONE** ~4-slide layered carousel + **one** AD text artifact. **No remake loop.** Budget ≤8 finals without stop-report. |
| 6 | `shell_freeze` | AppShell / nav chrome freeze. Mesh node + inspector panel text **in scope**; no shell redesign. |

| Доп. | Значение |
|------|----------|
| `s57_keep` | Image bg + HTML overlay; ban letters on bg; CTA 1–4 HTML; product **OCR vision remake OFF** (AD critique vision ≠ remake loop). |
| `copy_sot` | Slide copy SoT remains `primary_copy` / `secondary_copy` (Dramaturgy). `html_layout` highlights **must be substrings** of those fields. |
| `layout_variant_compat` | Keep `layout_variant` (cover / body / cta role) for role/CTA rules. `html_layout.template` drives **visual template**; do not collapse role into template invent. |
| `hitl_publish` | AD `approve` ≠ social publish. Publicist / HITL unchanged. |
| `ad_not_client` | Pipeline AD ≠ Cursor Клиент Playwright acceptance. |
| `no_silent_social` | No Meta/IG publish in this wave. |
| `secrets` | Never in memory / skills / reports. |
| `vps_checklist` | Orchestrator artifact **at end** of wave (not Architect / not Trainer). |

---

## 3. Target flow

```text
Scriptwriter → Dramaturgy JSON (KEEP S57: scene visual_prompt, secondary_copy, swipe meta, CTA 1–4)
  → Designer (Variant A)
       (a) bg prompts = scene only
       (b) emit html_layout[] per slide (template + text_block + highlights + placement hints)
       (c) does NOT invent free-form HTML/CSS strings
  → Image model → bg plates
  → carousel-layered-composite
       validate html_layout (zod STRICT)
       map template → CSS; wrap accent spans; place logo/character/cta
       Puppeteer → slide_0N.png @ 1080×1350
  → Art Director (ONCE)
       vision/LLM critique of finals (+ optional html_layout JSON)
       → persist { verdict, summary, remarks[] }
       → UI mesh/Team + inspector review
       → STOP (even if remarks) — NO remake
  → Draft / HITL (unchanged)
```

---

## 4. Layers

```text
┌──────────────────────────────────────────────────────────────┐
│ FE Team/mesh: node «Арт-директор» + inspector Logs/review    │
│ shell_freeze AppShell — no redesign                          │
└──────────────────────────┬───────────────────────────────────┘
                           │ display verdict only
┌──────────────────────────▼───────────────────────────────────┐
│ AI Bridge: Designer html_layout prompt + AD system/checklist │
│ zod field shapes (shared with Backend)                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│ Backend: zod STRICT; composite execute; workers/art-director │
│ persist AD verdict; smoke ONE + AD artifact; NO remake wire  │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **AI Bridge** | Designer overlays: emit `html_layout`; AD system prompt + checklist binding; agent-defaults seed for `art-director` (carousel-engine); skill notes align | Puppeteer CSS map impl; AppShell; mesh JSX layout geometry |
| **Backend** | Zod STRICT for `html_layout` + AD output; `carousel-layered-composite` template map + accent wrap + placement; job step after composite; `workers/art-director/` stub; persist verdict on draft/job; smoke script + artifacts; **forbid** remake enqueue from AD | Prompt prose invent beyond wire; AppShell; Create modal redesign |
| **Frontend** | Static flowchart node **«Арт-директор»** after Designer (before Publisher/Draft); inspector Logs **+ review** surface for AD verdict/remarks; wire read from Backend API/store | AppShell/Sidebar; redesign Create; invent new MultiButton chrome |
| **Tester** | Guards: template enum; orphan highlight reject; AD no-remake; smoke artifact presence | Product invent |
| **Deployer** | Localhost refresh for smoke + optional Client | Prod/VPS |
| **Smoke+AD** | ONE 4-slide + AD markdown/JSON text; stop | Remake loop |
| **Orchestrator (end)** | VPS checklist artifact | Trainer body |

---

## 5. Schema — Variant A `html_layout` (Architect zod · FINAL)

### 5.1 Closed template catalog

```ts
const HtmlLayoutTemplate = z.enum([
  "cover_center",
  "body_left",
  "body_split",
  "cta_bottom",
  "tip_card",
  "quote_band",
]);
```

| Template | Intent (composite CSS) | Typical role |
|----------|------------------------|--------------|
| `cover_center` | Centered hero type; large primary; soft/heavy scrim OK | cover |
| `body_left` | Left-anchored primary+secondary; room for right cut-out | body |
| `body_split` | Two-column feel (type left, visual weight right) | body |
| `cta_bottom` | Type mid/upper; CTA button bottom safe; center bias | cta_slide |
| `tip_card` | Card/panel chrome around type (tip/checklist energy) | body |
| `quote_band` | Quote/band emphasis; large secondary optional | body / cover rare |

**Forbidden:** unknown template string; LLM inventing 7th template without Architect + composite map update.

### 5.2 Per-slide object

```ts
const Highlight = z.object({
  phrase: z.string().min(1),           // exact substring of primary_copy or secondary_copy
  style: z.literal("accent"),          // wave lock: accent only (marker/bold deferred)
});

const TextBlock = z.object({
  anchor: z.enum(["left", "center", "right"]),  // block position in safe zone
  align: z.enum(["left", "center", "right"]),   // text-align inside block
  safe: z.boolean().default(true),              // clamp ≥120/160/80
});

const HtmlLayout = z.object({
  template: HtmlLayoutTemplate,
  text_block: TextBlock,
  primary: z.object({
    highlights: z.array(Highlight).max(4).default([]),
  }),
  secondary: z.object({
    highlights: z.array(Highlight).max(6).default([]),
  }),
  logo: z.object({
    placement: z.enum(["top-left", "top-right", "none"]),
  }).default({ placement: "top-left" }),
  character: z.object({
    placement: z.enum(["none", "right-cutout", "left-cutout"]),
  }).default({ placement: "none" }),
  cta: z.object({
    placement: z.enum(["none", "bottom", "inline"]),
  }).default({ placement: "none" }),
  scrim: z.enum(["none", "soft", "heavy"]).default("soft"),
});
```

**Slide handoff (delta):**

```ts
// existing slide fields KEEP
primary_copy: z.string()…
secondary_copy: z.string()…   // REQUIRED (S57)
layout_variant: z.string()…   // role: cover | body_slide | cta_slide (compat)
visual_prompt: z.string()…    // scene only
html_layout: HtmlLayout       // NEW REQUIRED on Designer emit for carousel-engine
```

### 5.3 Validation rules (STRICT · fail job)

| Rule | Behavior |
|------|----------|
| Unknown `template` | Fail zod / job |
| Highlight `phrase` not found in corresponding `primary_copy` / `secondary_copy` | Fail (orphan highlight) |
| `style` ≠ `"accent"` | Fail (this wave) |
| `cta.placement` ≠ `none` on non-`cta_slide` | Fail or coerce to `none` (Backend: **fail** preferred) |
| `cta.placement === "none"` on `cta_slide` when `cta_type` 1–4 set | Fail — CTA must be HTML button |
| Raw HTML/CSS fields from LLM | Reject / strip — not in schema |
| Missing `html_layout` on Designer success path | Fail (Variant A required for carousel-engine) |

### 5.4 Migration / default when legacy slides lack `html_layout`

Backend **may** synthesize a deterministic fallback **only** for archaeology / mid-flight old drafts:

| `layout_variant` role | Fallback template | text_block | character | cta |
|-----------------------|-------------------|------------|-----------|-----|
| cover | `cover_center` | center/center | none (or right if cut-out opted) | none |
| body | `body_left` | left/left | none | none |
| cta | `cta_bottom` | center/center | none | bottom |

Smoke + new Create draw **must** use real Designer-emitted `html_layout` (no silent forever-fallback as product success).

---

## 6. Composite execution map (`carousel-layered-composite`)

### 6.1 Duties

1. Accept `html_layout` on `LayeredSlideIn` (extend type beyond today’s `layout_variant`-only).
2. Validate (shared zod module — prefer `lib/studio/carousel-json-contract.ts` or sibling `html-layout-variant-a.ts` exported for both AI Bridge + Backend).
3. **Pick CSS template** by `template` enum (dedicated class blocks / data-template attr).
4. Apply `text_block.anchor` → flex justify/align of `.safe` content; `align` → `.primary`/`.secondary` `text-align`.
5. **Wrap accent spans:** for each highlight, escape + replace first exact occurrence of `phrase` inside primary/secondary with `<span class="accent-word">…</span>` (reuse existing accent class from layered/html renderer). No `*accent*` markdown required when highlights present; if both exist, highlights win.
6. Logo: `top-left` / `top-right` / `none` (Brand Settings still supplies name+logo assets).
7. Character: `right-cutout` / `left-cutout` / `none` — cut-out **OVER** bg (S57); respect Персонажи catalog when placement ≠ none.
8. CTA: only on `cta_slide`; catalog labels 1–4; placement `bottom` (default) or `inline`.
9. Scrim: map `none|soft|heavy` → existing gradient opacity tiers.
10. Raster Puppeteer **1080×1350**; safe clamps when `safe: true`.

### 6.2 Today → tomorrow (path)

| Today | Tomorrow |
|-------|----------|
| `layout_variant` → role → hardcoded center/left/cta justify | Role KEEP for CTA/character heuristics; **visual** from `html_layout.template` |
| Plain `escapeHtml(primary)` | Escape + accent wrap from highlights |
| Brand always top-left-ish | `logo.placement` |
| Character fixed right | `character.placement` |

**File lock:** `lib/studio/carousel-layered-composite.ts` (+ callers in `carousel-html-renderer.ts` / intake job if they construct `LayeredSlideIn`).

---

## 7. Art Director agent

### 7.1 Identity

| Item | Value |
|------|-------|
| id | `art-director` |
| UI name | **Арт-директор** |
| Worker | `workers/art-director/` (Backend creates; skill stubs already in `.cursor/skills/art-director/`) |
| Mesh node | After Designer composite ready, before Publisher / Draft display |
| Trigger | Carousel finals (`slide_0N.png`) exist for the job/draft |
| Inputs | Final PNGs (required); optional `html_layout[]` + Dramaturgy summary |
| Engine | Vision multimodal **and/or** LLM text critique (Architect: prefer vision-on-PNGs when aggregator supports; else LLM with slide metadata + checklist). **Not** OCR remake loop. |
| Output | Zod below — persist on draft/job |
| Side effects | **None** that enqueue Designer/Image/composite |

### 7.2 Output contract (zod)

```ts
const ArtDirectorRemark = z.object({
  slideIndex: z.number().int().min(1),
  category: z.enum([
    "hook", "continuity", "hierarchy", "safe_zone", "contrast",
    "cta", "brand", "slop", "copy", "missing_assets", "layout",
  ]),
  severity: z.enum(["P0", "P1", "P2"]),
  note: z.string().min(8), // concrete fix hint
});

const ArtDirectorVerdict = z.object({
  verdict: z.enum(["approve", "remarks"]),
  summary: z.string().min(1), // 1–3 sentences RU
  remarks: z.array(ArtDirectorRemark).default([]),
  sequenceNotes: z.string().optional(),
});
```

| Condition | Verdict |
|-----------|---------|
| Any P0 | `remarks` (never approve) |
| Any P1 | `remarks` (this wave — no soft-approve) |
| Only soft P2 / zero fails | `approve` + short summary; `remarks` empty or P2-only if Architect soft-allow — **default: empty on approve** |
| Missing slide assets | `remarks` + `missing_assets` P0 — never fake approve |

### 7.3 NO AUTO-REMAKE (HARD)

Backend job graph **must not** contain:

- `art-director` → `designer` / `draw` / `composite` edge  
- auto-retry on `verdict === "remarks"`  
- “fix then re-AD” loops in smoke  

Remarks = human-readable text for operator / **next manual** wave.

### 7.4 Persist + API surface (Backend)

- Store last AD verdict on carousel draft / job artifact (JSON).  
- Expose read for FE: extend existing agent logs **or** dedicated field `artDirectorReview` on draft GET (Backend chooses one; document in `backend-report.md`).  
- Write AD log lines under agent id `art-director` for inspector Logs.

### 7.5 AI Bridge prompts

- System: role Art Director + `critique-checklist.md` compressed rules + S57 integrity + anti-slop + etalon taste (#3).  
- User payload: ordered slide image URLs/paths + short meta (roles, cta_type, template ids).  
- Force JSON = `ArtDirectorVerdict`.  
- Explicit line: **«Не запускай перерисовку. Только verdict.»**

---

## 8. Frontend (mesh / Team / inspector)

### 8.1 Flowchart

- Pipeline **carousel-engine** static diagram (`ReleaseTeamFlowchart` / related mesh v2): add node **«Арт-директор»** (`data-testid="node-art-director"`, agent id `art-director`) **after Designer**, before Publisher.  
- Edge label short solid (e.g. «ревью») — no mid-text on dashed trainer edges (C-139 KEEP).  
- Badge/chip: last verdict `approve` (green/neutral) \| `remarks` (amber) when data present.  
- **shell_freeze:** do not touch AppShell / SidebarNavigation / left IA.

### 8.2 Inspector

- Selecting AD opens existing `AgentInspectorDrawer`.  
- Tabs KEEP: Инструкция / Skills·Plugins·MCP / Model — plus **Logs**.  
- **Review surface (lock 4):** either  
  - **(A)** enhance **Логи** for `art-director` to pin latest structured verdict+remarks at top, **or**  
  - **(B)** add tab **«Ревью»** visible **only** for `art-director` showing summary + remark list.  
- Architect preference: **(B)** if cheap; else **(A)**. Frontend picks one and locks in `frontend-report.md`.  
- Do **not** add «Перерисовать» / remake button.

### 8.3 agent-defaults / store

- Seed `art-director` in `lib/mesh/agent-defaults.ts` for `carousel-engine` (name, systemPrompt stub from AI Bridge, skills list pointing at critique checklist).  
- Avatar: reuse profession avatar pattern (new icon key `art-director` or fallback `designer` — FE documents choice).  
- Other pipelines: **omit** AD node this wave (carousel-only).

---

## 9. Smoke deliverable (HARD)

| Item | Path / rule |
|------|-------------|
| Carousel | **ONE** 4-slide layered set under `docs/карусель тест/variant-a-ad-smoke-4/` **or** `generatedMedia/variant-a-ad-smoke-4/` (Backend picks **one** canon path in report) |
| AD artifact | Same folder: `art-director-review.md` **and/or** `art-director-review.json` (verdict + remarks) |
| Remake | **Forbidden** even if remarks |
| Budget | 4 finals (+ optional bg intermediates); stop-report if >8 finals |
| Traces | Optional `carousel-prompt-trace` snippet showing `html_layout` present |

---

## 10. Tickets (≤3)

| ID | Covers | Owner steps |
|----|--------|-------------|
| **C-variant-a-html-layout** | Designer emit `html_layout`; zod STRICT; composite template map + accent wrap + placements | AI Bridge → Backend |
| **C-art-director-agent** | Worker + prompts + job step + persist + **no remake** wire | AI Bridge → Backend |
| **C-art-director-ui-smoke** | Mesh/Team node + inspector review/Logs; smoke ONE + AD text; guards; localhost | Frontend → Tester → Deployer → smoke+AD |

---

## 11. Acceptance (языком оператора / Клиента)

1. Новая карусель из Create/intake содержит на каждом слайде валидный `html_layout`; composite не падает на enum.  
2. На PNG видны accent-выделения там, где Designer указал `highlights` (не «все слова радугой»).  
3. После готовности PNG появляется вердикт Арт-директора в Team/mesh и в inspector review/Logs.  
4. При `remarks` **нет** второго цикла отрисовки в том же job.  
5. В папке smoke лежит **одна** 4-слайдовая карусель + текстовый AD-артефакт.  
6. AppShell / левое меню **не** менялись.

Optional Client Playwright: open Team → select Арт-директор → see review text @1440 — only if Orchestrator arms Client step.

---

## 12. Out of scope

- Motion redesign · WebGL · Razbor UI rewrite · Scout/Apify · social publish  
- Extending highlight styles beyond `accent` (`marker`/`bold` — later wave)  
- Soft-approve with open P1  
- VPS deploy body (Orchestrator checklist only at end)  
- Monolith coder replacing AI Bridge + Backend + Frontend  
- AppShell / Create chrome redesign · MultiButton revival  

---

## 13. Mid-flight escalation

If composite cannot map a template without inventing free CSS from LLM → **stop** and ask Architect (do not open enum).  
If aggregator has no vision → AD LLM-only with PNG paths described / base64 if Backend already supports — still **no remake**.  
If mesh static SVG ports break after node insert → Frontend-only fix; do not reopen AppShell.

---

## 14. Evidence for next roles

| Role | Read first |
|------|------------|
| AI Bridge | This spec §5–7 · `art-director/*` · `carousel-json-contract` Phase 7 · `create-carousel-prompts` |
| Backend | This spec §5–6 · `carousel-layered-composite.ts` · `workers/_index.md` |
| Frontend | This spec §8 · `ReleaseTeamFlowchart.tsx` · `AgentInspectorDrawer.tsx` · `agent-defaults.ts` |
| Tester | §10–11 · guards no-remake + template enum |
| Deployer | localhost API refresh |
| Smoke | §9 |

`🏗️ **АРХИТЕКТОР:** Variant A html_layout zod + composite execute map; Art Director post-ready remarks|approve NO remake; mesh/Team + inspector review; smoke ONE+AD text; shell_freeze. Spec+chain ready — no product code.`
