# Wave plan — 2026-10-16 design-razbor-quality (S52)

> **Trainer grade:** B — `memory/trainer/2026-10-16-design-razbor-quality-grade.md`  
> **Plugin:** `plugins/trainer/s52-design-razbor-quality.md`  
> **Architect:** this plan + `chain.md` + tickets `C-design-tokens-only` · `C-razbor-draft-edit` · `C-carousel-quality-etalon`  
> **Product code:** none in Architect step

## Intent (one sentence)

Settings Design becomes **tokens-only** (colors + type / text-block / small-element — Atelier Synth, not button kits); Razbor opens an **editable draft** with RIGHT preview and Create-parity agents; live carousel quality is judged against **`generatedMedia/эталон карусели/`** with **9 PNG** Armenian-themed image slides — without touching AppShell / left nav.

## Locks (HARD)

| Lock | Value |
|------|-------|
| `ticket_limit` | **≤3** (exact pack = these three tickets) |
| `shell_freeze` | `true` — **no** AppShell / `SidebarNavigation` / left Studio nav IA |
| UI in scope | **Settings Design** chrome + **Razbor modal** (user-explicit) |
| `upgrade_only` | `true` — patch in place; no new Create/Razbor agent |
| `no_pipeline_break` | `true` — preserve **Razbor → Scriptwriter → Designer → Draft** (+ Create Scriptwriter→Designer→Draft) |
| `validation_budget_png` | **9** (3 carousels × 3 slides) **with images** |
| `etalon_folder` | `generatedMedia/эталон карусели/` |
| `no social publish` | `true` |
| modules | `carousel-engine` primary; `custom-reels` only if Fixer finds shared prompt regression |

## Evidence baseline (Architect read)

| Finding | Source | Ticket |
|---------|--------|--------|
| Embla primary = `SlicedSlotPreview` COVER/BODY/CTA strip | `DesignLibraryCarousel.tsx` ~L407–415; `SlicedSlotPreview.tsx` FRAMES | **C-design-tokens-only** |
| Coffee Doctrine mock copy in sliced frames | `SlicedSlotPreview.tsx` ~L126–127 | **C-design-tokens-only** |
| Brandbook still shows **Buttons** kit (Primary/Ghost/CTA) | `BrandbookBoard.tsx` `brandbook-buttons-card` | **C-design-tokens-only** |
| Toolbar `justify-end` (S51 top-right) collides Settings nav | `DesignLibraryCarousel.tsx` ~L217–220; S52 supersede → **LEFT** | **C-design-tokens-only** |
| Agent inject still «COLORS ONLY» JSON; missing type/text-block/small-element; draw overlay still role kits | `formatActiveDesignMdForPrompt`; `create-carousel-prompts.ts` | **C-design-tokens-only** |
| Open draft: `setCarouselSide("competitor")`; RIGHT shows competitor until flip | `RazborModal.tsx` ~L367–370 | **C-razbor-draft-edit** |
| «Начать разбор» still when `showWelcomeCta` even with `previewDraft` | `RazborModal.tsx` ~L980–981, L1238–1253 | **C-razbor-draft-edit** |
| No «Выбрать» / comparison square | `RazborCarouselToggle.tsx` labels only | **C-razbor-draft-edit** |
| Upsert identity = `draft.id` (Prisma `where: { id }`); Razbor id = `draft-razbor-${post.id}` | `drafts-repository.ts`; `razbor-pipeline.ts` `buildCarouselDraft` | **C-razbor-draft-edit** |
| COMBAT carousel = coffee/club audience lock | `agent-defaults.ts` COMBAT `carousel-engine` | **C-carousel-quality-etalon** |
| live-gen scripts coffee-ritual topics | `scripts/live-gen-*.ts`, `live-gen-audit-fix.ts` | **C-carousel-quality-etalon** |
| Etalon folder **missing** on disk | `generatedMedia/` has wave-* only | **C-carousel-quality-etalon** |

## Phases

### Phase 1 — Settings Design tokens-only (**C-design-tokens-only**)

**Goal:** Design cards + agent payload = tokens only; no layout prefs.

| Decision ID | Lock |
|-------------|------|
| **D-tok-1** | **Remove** `SlicedSlotPreview` from Settings Design surfaces (`DesignLibraryCarousel`, `QuickThemeTuner`). Create/feed N×4:5 sliced preview **stays** elsewhere. |
| **D-tok-2** | Primary Embla card = **BrandbookBoard** (or successor) showing **only**: colors · typography · text-block · small-element (Atelier Synth). **Delete** button-kit tile (`brandbook-buttons-card` Primary/Ghost/CTA chrome). Bars/layout samples that imply fixed kits → remove or reduce to token swatches. |
| **D-tok-3** | Dedup Coffee Doctrine: one slot per preset; strip Doctrine mock strings from Settings; no HY twin duplicate cards. |
| **D-tok-4** | Toolbar **LEFT** of Design header row (clear of right `SettingsQuickNav`). One row: **референс** · **новый дизайн**+icon · eye **«код дизайн мд»**. No preview-DESIGN.md button (S51 keep). Supersedes S51 «must be top-right». |
| **D-tok-5** | `formatActiveDesignMdForPrompt` / designer agent-start: inject **only** `{ colors, typography, textBlock, smallElement, cssVarOverrides, id, preset }` — **no** COVER/BODY/CTA markup, no layout grid, no button kits. LLM invents layout on draw. |
| **D-tok-6** | Aspect: keep brandbook cards **3:5** horizontal Heritage (S50) unless visual critic requires tweak — do **not** reintroduce sliced strip. |

**Acceptance (Client S52.A):** no COVER/BODY/CTA strip; tokens only; no duplicate Doctrine; toolbar left of nav; payload tokens-only.

### Phase 2 — Razbor draft edit (**C-razbor-draft-edit**)

**Goal:** Existing draft = discuss/edit surface, not a fresh analysis gate.

| Decision ID | Lock |
|-------------|------|
| **D-rb-1** | When `previewDraft` present on open: RIGHT column shows **that** draft carousel immediately (`carouselSide = "ours"` or dedicated draft preview). Empty/wrong competitor-only RIGHT = FAIL. |
| **D-rb-2** | When opening **existing draft** (`previewDraft` with slides **or** known `draft.id`): **hide** «Начать разбор». Chat usable on Scriptwriter/Designer (+ Create-parity tabs). New competitor analysis without draft may keep start CTA. |
| **D-rb-3** | Chat/system for Create-parity agents on draft-edit: inject **carousel context** (Dramaturgy JSON + slide image URLs / scenario) into LLM — not empty welcome. |
| **D-rb-4** | Competitors: control **«Выбрать»** + empty **square top-right** → pick competitor screen for comparison (wire to existing feed picker or minimal modal). |
| **D-rb-5** | **Upsert key (canonical):** `draft.id` + API `moduleId: "carousel-engine"`. Razbor drafts keep `id = draft-razbor-${post.id}` (`buildCarouselDraft`). Create session keeps stable `draftIdRef`. Edit/redraw → **same id** via `upsertDraft` / `PATCH /api/studio/drafts/[id]` — **forbid** spam new Черновики rows. Secondary fields: `sourceCompetitorId`, `competitorId`, `slides`, `scenario`, `status`, `brand`, timestamps. **No** `sourcePostId`. |

**Acceptance (Client S52.B):** open draft → RIGHT = that carousel; no start CTA; Выбрать+square; same id after redraw.

### Phase 3 — Quality + etalon + 9 PNG (**C-carousel-quality-etalon**)

**Goal:** Theme freedom + visual bar vs user etalon; budget hard-stop at 9.

| Decision ID | Lock |
|-------------|------|
| **D-q-1** | Strip **coffee/club theme lock** from COMBAT + Create overlays + live-gen scripts. Brand **Vernatun** OK; **topic = user / random Armenian pool** only (ritual/city/heritage/food/language/…). Golden fixtures (e.g. dark_notes coffee) = craft examples, not product lock. |
| **D-q-2** | Deployer creates `generatedMedia/эталон карусели/` — copy/link prior user reference carousels (from prior chat refs / wave artifacts user pointed). README with compare instructions. |
| **D-q-3** | LIVE smoke: **3 carousels × 3 slides = 9 PNG**, Armenian **random** themes, backgrounds via **`openai/gpt-5.4-image-2`** (HTML-first text OK; slides must have real images, not text-only). Write under wave folder + upsert drafts with **overwrite**. |
| **D-q-4** | Overspend >9 → stop-report; no social publish. Client compares smoke vs etalon (S52.C). |

**Acceptance (Client S52.C):** etalon folder exists; ≤9 PNG with images; no coffee-only lock; side-by-side quality judgment.

## Ticket map

| ID | Title | Priority | Primary roles |
|----|-------|----------|---------------|
| **C-design-tokens-only** | Settings Design tokens + toolbar LEFT + agent payload | P0 | Frontend → AI Bridge |
| **C-razbor-draft-edit** | Draft RIGHT preview / hide start / Выбрать / upsert | P0 | Frontend → AI Bridge → Backend |
| **C-carousel-quality-etalon** | Theme unlock + etalon + LIVE 9 PNG | P0 | AI Bridge → Backend → Deployer |

## Out of scope

- AppShell / left Studio nav / module top-nav redesign  
- Social publish / VPS / prod  
- Raising PNG budget above 9  
- Parallel writers on same Settings Design or RazborModal files  
- Soft-mock success on bad JSON / silent mock Razbor for **new** analysis (S48 still applies to fresh start)

## Validation budget detail

| Run | Theme | Slides | PNGs |
|-----|-------|--------|------|
| Carousel A | Armenian random #1 | 3 | 3 |
| Carousel B | Armenian random #2 | 3 | 3 |
| Carousel C | Armenian random #3 | 3 | 3 |
| **Total** | | | **9** |

Artifacts: `generatedMedia/wave-design-razbor-quality/` (or script default) + drafts visible in Studio Ours → Черновики; etalon in `generatedMedia/эталон карусели/`.

## Skills for executors

`content-factory-ui` **S52** · `content-pipeline-agents` **S52** · `carousel-json-contract` (+ create-carousel-prompts-notes) · `ai-bridge` · `workers/designer-carousel` · `backend` · `tester` · `client-scenarios` **S52.A–C** · `client.mdc` §18 · `deployer`

## Done when

All three tickets have localhost fix + `guards.md`; Tester green on S52.A–C contracts; Deployer localhost + etalon folder; Client Playwright S52 HARD without shell churn.
