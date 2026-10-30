# Chain — 2026-10-18 layout-copy + dual character

> **ticket_limit:** `full-queue` (locks 1–5 + dual smoke / tickets C-* одним проходом)  
> **shell_freeze:** `true` (AppShell / nav freeze)  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> **Frontend:** **omit** unless architect-spec §9 (4-up DesignSlot upload missing)  
> Wave spec: `memory/waves/2026-10-18-layout-copy-dual-char/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-layout-copy-dual-char-grade.md` (grade **B**)  
> Card: `plugins/trainer/layout-copy-dual-char.md`  
> Etalon: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/` (01 RE · 02 luma · 03 omkopa · 04 girl sheet)  
> Skills: `carousel-json-contract` Phase 7 · `create-carousel-prompts-notes` § LAYOUT MAP / MUCH WIDER / DUAL CHAR · `workers/designer-carousel` · `art-director/html-layout-variant-a` · `critique-checklist` · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** optional (Orchestrator arms)  
> **VPS checklist:** Orchestrator **after** dual smoke — not specialist steps  
> **User chain (HARD):** Architect → **AI Bridge → Backend (deconstruct seeds + dual gen) → Tester**

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade B + skills layoutMap / MUCH WIDER / dual char / numbering mirror | [x] | Grade B; Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — Scriptwriter **MUCH wider** body (`secondary_copy` ≥220 chars **AND** ≥5 clauses); LayoutMap inject into Designer (copy grammar; invent content+bg+CTA only); dual **`character_path` / `characterPaint`**: `in_image` (paint girl **WITH** scene, conductor to-camera, not story actor) \| `overlay_cutout` (bg without char; cutout speaks text; cover+last mandatory); conductor role wording lock 5. `lib/agents/deconstructStyle.ts` — 4-ref grid emit **colors+fonts+sizes+layoutMap** (schema from card). `lib/studio/art-director-review.ts` — checklist: thin secondary, grammar fight, numbering when absent, wrong paint path, non-conductor. Optional: `lib/mesh/agent-defaults.ts` deltas. Align notes only if runtime reads them. **Не** composite CSS; **не** seed file I/O / Landscapes write; **не** AppShell; **не** DesignSlot JSX | [x] | Overlays+deconstruct agent+checklist live; report `ai-bridge-report.md` |
| 3 | **Backend** | **(a) Deconstruct + seeds:** `lib/studio/deconstruct-style.ts` + `app/api/settings/design-deconstruct/route.ts` — 4-up grid mode persist `layoutMap` on DesignPreset. Seed from etalon: presets **01 RE orange** · **02 luma** · **03 omkopa** (each with layoutMap); **activate 01** for smokes. Sheet **04** → `lib/settings/landscapes-store.ts` conductor entry. `lib/settings/design-library.ts` — resolve layoutMap + FULL tokens. **(b) Composite + contract:** `lib/studio/carousel-layered-composite.ts` — honor `numberingGlobal: absent` (omit `.slide-num`); mirror map chrome; dual paint modes (in_image vs overlay cutout HTML). Zod/critic: `lib/studio/carousel-json-contract.ts` + `carousel-critic-05.ts` enforce ≥220+≥5 (**after** step 2). **(c) Dual gen smoke:** TWO × 6 layered carousels, **different** useful-sheet topics (e.g. 17 kitchen vs 13 remote / 51 meeting): **A** `character_path=in_image` → `docs/карусель тест/layout-copy-dual-char-smoke-A-in_image-6/`; **B** `overlay_cutout` → `…-B-overlay_cutout-6/` (cover+last cutout). Active design **01**. **Не** rewrite Create chrome; **не** AppShell; **не** prompt prose owned by step 2 (thin wire OK) | [x] | Seeds+layoutMap persist+composite+dual smoke GREEN; `backend-report.md` |
| 4 | **Frontend** | **SKIP by default.** Arm only if §9: DesignSlot cannot upload **4** refs / no grid deconstruct entry | [ ] skip | Skip unless §9 armed |
| 5 | **Tester** | Guards → `memory/waves/2026-10-18-layout-copy-dual-char/guards.md`: G1–G12 from architect-spec §8 (wide SW, zod/critic, layoutMap emit, numbering omit, grammar mirror, 3 presets+active 01, Landscapes 04, enum paths, conductor wording, smoke A, smoke B topics differ, shell_freeze). Prefer unit/fixture + grep; script e.g. `scripts/verify-layout-copy-dual-char-guards.ts` | [x] | Guards green; report · **33/33 PASS** |
| 6 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] | Smoke B cutout: single pose+knockout (see `fixer-note.md`); A untouched |
| 7 | **Deployer** | Localhost API refresh before smoke if needed | [x] skip | **No deploy** (user / Orchestrator) |
| 8 | **dual smoke** | Confirm both smoke dirs have **6** PNG each; T1 ≠ T2; A in_image girl-in-frame; B cutout cover+last; layoutMap grammar + wider copy spot-check; **STOP** (no remake) | [x] | 12 slides total; A17+B13 · no second draw |
| 9 | **Client** (optional) | Playwright @1440 only if Orchestrator asks — taste vs etalon invent OK | [ ] | Armed only |
| 10 | **Orchestrator** | VPS checklist artifact (end of wave) | [ ] | Checklist file; **not** auto-prod |

## Seed + deconstruct path (locks 2–3 · named for Backend/AI Bridge)

```text
Etalon folder (SoT):
  generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/
    01 → DesignPreset RE orange + layoutMap   [ACTIVE]
    02 → DesignPreset luma coffee + layoutMap
    03 → DesignPreset omkopa teal + layoutMap
    04 → Landscapes catalog conductor sheet

Runtime DesignSlot (ongoing):
  upload 4 refs (cover · midA · midB · cta)
  → POST /api/settings/design-deconstruct  (grid mode)
       app/api/settings/design-deconstruct/route.ts
  → lib/studio/deconstruct-style.ts
  → lib/agents/deconstructStyle.ts   [AI Bridge owns prompt/parser quality]
  → DesignPresetFile MUST include:
       colors.* · typography.* · typography.scale.* · layoutMap
  → persist DesignSlot / Embla activeId
  → design-library resolve → FULL inject + layoutMap grammar copy
  → create-carousel-prompts Designer system every draw
```

**AI Bridge check:** deconstruct emits layoutMap (not colors-only); SW/Designer dual paint + conductor.  
**Backend check:** seed 01–03 + Landscapes 04; active 01; composite numbering omit; dual smoke.  
**Tester:** G3–G7, G10–G11.  
**Frontend:** only if 4-up upload broken (§9).

## Dual smoke matrix (lock 4)

| Arm | character_path | Topic (example) | Output dir | Mandatory |
|-----|----------------|-----------------|------------|-----------|
| A | `in_image` | useful **17** kitchen (or chosen T1) | `docs/карусель тест/layout-copy-dual-char-smoke-A-in_image-6/` | Girl painted WITH scene; conductor to-camera |
| B | `overlay_cutout` | useful **13** remote **or** **51** meeting — **≠ T1** | `docs/карусель тест/layout-copy-dual-char-smoke-B-overlay_cutout-6/` | Cutout HTML; **cover + last** |

Both: design **01** active · S57 layered · layoutMap from 01 · secondary_copy wide · conductor speaks text.

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Tester → dual smoke** sequential (user chain). Do **not** parallel AI Bridge + Backend on shared prompt/zod files.  
3. **One writer** on `create-carousel-prompts.ts` + `art-director-review.ts` + `deconstructStyle.ts` (AI Bridge step 2).  
4. **One writer** on deconstruct route/persist + design-library + landscapes + composite + critic/zod + smoke folders (Backend step 3).  
5. `carousel-json-contract.ts` / critic edits only in Backend step **after** AI Bridge prompt lock.  
6. **Frontend omit** unless escalation §9.  
7. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
8. **NO AUTO-REMAKE:** AD must not wire Designer redraw; smoke must not loop.  
9. **Budget:** **TWO** Client-score carousels × **6** finals (12 PNG).  
10. **S57 KEEP:** layered HTML product; OCR remake vision stays OFF.  
11. **Numbering mirror:** no ref numbers → no gen numbers (supersedes always-pretty-N/M).  
12. **Secrets:** never commit `.env` keys.

## Tickets → steps

| Ticket | Steps |
|--------|-------|
| **C-sw-secondary-wide** | 2 → 3 (zod/critic) |
| **C-grid-layout-map** | 2 → 3 |
| **C-numbering-mirror** | 2 (wording) → 3 (composite) |
| **C-seed-designs-landscapes** | 3 |
| **C-dual-char-smoke** | 2 → 3 → 5 → 8 |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · Create chrome redesign · mesh geometry rewrite · monoCoder replacing AI Bridge+Backend · VPS apply (checklist only) · Frontend (unless §9).

## Next executor

**Tester GREEN (step 5)** — `guards.md` + `scripts/verify-layout-copy-dual-char-guards.ts` **33/33**. Deploy skipped. Next: Orchestrator (optional Client / VPS checklist).
