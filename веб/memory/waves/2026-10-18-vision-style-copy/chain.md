# Chain — 2026-10-18 vision style-copy

> **ticket_limit:** `full-queue`  
> **shell_freeze:** `true` (AppShell / nav freeze)  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> **Frontend:** **omit** unless architect-spec §9 (4-frame pack / mode UI missing)  
> Wave spec: `memory/waves/2026-10-18-vision-style-copy/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-vision-style-copy-grade.md` (grade **B**)  
> Card: `plugins/trainer/vision-style-copy.md`  
> Prior (partial supersede): `memory/waves/2026-10-18-layout-copy-dual-char/`  
> Etalon: `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/` (01 ACTIVE · 02 luma · 03 omkopa · 04 girl sheet ≠ style slot)  
> Skills: `create-carousel-prompts-notes` § VISION STYLE-COPY · `carousel-json-contract` Phase 7 · `html-layout-variant-a` · `workers/designer-carousel` · `ai-bridge` · `content-pipeline-agents` · `carousel-prompt-trace` · `backend` · `tester`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** later (Orchestrator arms)  
> **VPS / social / DB wipe:** **FORBIDDEN**  
> **User chain (HARD):** Architect(done) → **AI Bridge → Backend → (Frontend only if needed) → Tester → smoke → Deployer localhost if needed → Client later**

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when (DoD) |
|------|------|----------------------------------------|--------|-----------------|
| 0 | Trainer | grade B + skills vision_ref / ban FULL TOKEN / in_image default / partial bg | [x] | Grade B; Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — wire `styleCopyMode=vision_ref` vs `token_card`; on vision_ref: **skip** FULL `buildDesignTokensPayload` / typography.scale / Manrope·Cormorant; inject HARD-COPY vision block (composition, zones, hierarchy, accents, logo/CTA/numbering or absent, photo-vs-plate); Brand Vernatun text+CTA 1–4 (+ optional logo) only; default `characterPaint` / `character_paint` = **`in_image`**; `html_layout.layoutMapSource=vision_ref` + instruct emit `bgFit`; KEEP wide SW ≥220+≥5 + conductor. `lib/studio/art-director-review.ts` — fail FULL TOKEN on vision_ref, fail forced full-bleed, fail overlay default. Optional `lib/mesh/agent-defaults.ts`. Align notes only if runtime reads them. **Не** composite CSS; **не** grid slice I/O; **не** AppShell; **не** Settings JSX; **не** «fix layoutMap parser» as sole work | [x] | Overlays+defaults+checklist live; report `ai-bridge-report.md` with sample prompt proving BAN strings absent |
| 3 | **Backend** | **(a) Mode + slots:** accept `styleCopyMode` on draw/job; resolve pack path (default **01** grid) → slice/cache **4** slots cover·midA·midB·cta; `mapSlideToRefSlot` for N=6. **(b) Image ref wire:** `lib/llm/aggregator-images.ts` (+ draw callers) — pass `referenceImagePath` \| `Url` \| base64 as **multimodal/reference** input per slide. **(c) Defaults:** job default `characterPaint=in_image`. **(d) Composite:** `lib/studio/carousel-layered-composite.ts` — honor `bgFit` `cover` \| `contain` \| `mask` (+ optional `photoZone`). **(e) Smoke:** ONE × 6 layered → `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/` + `meta.json` + **`timeline-prompt-full.md`** (full Designer prompts). Useful topic **#17 kitchen** (or document alternate). Pack **01**. **Не** Create chrome; **не** AppShell; **не** prompt prose owned by step 2 (thin wire OK); **не** VPS/publish/DB wipe | [x] | Wire+bgFit+smoke GREEN; `backend-report.md` |
| 4 | **Frontend** | **SKIP by default.** Arm only if §9: cannot activate 4-frame pack / mode without UI and no API/fs path | [x] skip | Skip (API/fs path exists) |
| 5 | **Tester** | Guards → `memory/waves/2026-10-18-vision-style-copy/guards.md`: G1–G14 from architect-spec §8 (enum, skip FULL inject, prompt ban grep, image ref attach, slot map fixture, hard-copy wording, in_image default, smoke meta, bgFit, 6 PNG, KEEP SW/CTA/swipe/layered, layoutMap not required, shell_freeze). Prefer unit/fixture + grep; script e.g. `scripts/verify-vision-style-copy-guards.ts` | [x] | Guards green; report `tester-report.md` · 14/14 PASS · Fixer NO |
| 6 | **Fixer** | Client visual FAIL: fallback_synth → plate hardcopy; bgFit contain; etalon_mirror fonts; plate image prompts; re-smoke | [x] | `fixer-report.md` · re-smoke GREEN · `vision_ref_hardcopy` |
| 7 | **Deployer** | Localhost API refresh **if needed** after Backend for smoke/Client | [ ] | Localhost ready or skip-noted |
| 8 | **smoke** | Confirm dir has **6** PNG; meta `in_image` + `vision_ref` + pack 01; timeline proves no Manrope/scale/FULL TOKEN; spot-check partial bg not forced cover; **STOP** (no remake) | [x] | 6 PNG · contain · etalon_mirror · plates (Fixer re-smoke) |
| 9 | **Client** | Playwright @1440 later — Orchestrator arms | [ ] | Armed only |
| 10 | **Orchestrator** | No VPS; no social; close wave notes | [x] | `orchestrator-close.md` · Client later |

## Slot map (lock · Backend + Tester)

```text
Pack SoT (smoke):
  generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/01-real-estate-orange-grid.png
  → slots: cover · midA · midB · cta

N=6 slide → ref:
  1→cover  2→midA  3→midB  4→midA  5→midB  6→cta

04-vernatun-girl-character-sheet.jpg → Landscapes / conductor only (NOT a style slot)
```

## Smoke matrix (lock 10)

| Arm | styleCopyMode | characterPaint | Pack | Topic | Output dir | Mandatory |
|-----|---------------|----------------|------|-------|------------|-----------|
| **A only** | `vision_ref` | `in_image` | **01** RE orange | useful **#17** kitchen (or documented alt) | `docs/карусель тест/vision-style-copy-smoke-A-in-image-6/` | 6 PNG + full prompt timeline; no Manrope/scale; image refs attached |

**No arm B** this wave (`overlay_cutout` legacy — out of smoke).

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Tester → smoke** sequential. Do **not** parallel AI Bridge + Backend on shared prompt/draw files.  
3. **One writer** on `create-carousel-prompts.ts` + `art-director-review.ts` (AI Bridge step 2).  
4. **One writer** on aggregator-images + composite + job routes + smoke folders (Backend step 3).  
5. **Frontend omit** unless escalation §9.  
6. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
7. **NO AUTO-REMAKE:** AD must not wire Designer redraw; smoke must not loop.  
8. **Budget:** **ONE** Client-score carousel × **6** finals.  
9. **S57 KEEP:** layered HTML product; OCR remake vision stays OFF.  
10. **vision_ref primary:** do not gate PASS on layoutMap parser fix.  
11. **Secrets:** never commit `.env` keys.  
12. **No** social publish · **no** VPS · **no** DB wipe.

## Tickets → steps

| Ticket | Steps |
|--------|-------|
| **C-vision-style-mode** | 2 → 3 (job flag) |
| **C-vision-image-ref-wire** | 2 (attach wording) → 3 (multimodal) |
| **C-vision-bg-fit** | 2 (emit hint) → 3 (composite) |
| **C-char-default-in-image** | 2 → 3 |
| **C-vision-smoke-a6** | 3 → 5 → 8 |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · Create chrome redesign · mesh geometry rewrite · layoutMap-parser-only fix · dual smoke B · monoCoder replacing AI Bridge+Backend · VPS apply · Frontend (unless §9) · Client until Orchestrator.

## Next executor

**Tester done (14/14 PASS)** → smoke confirm (step 8) / Deployer localhost if needed → Client later.
