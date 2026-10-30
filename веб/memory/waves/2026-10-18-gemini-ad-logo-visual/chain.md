# Chain — 2026-10-18 Gemini AD + logo dual-path + type scale + rich visual + 6-slide smoke

> **ticket_limit:** `full-queue` (bugs 1–6 / tickets C-* одним проходом)  
> **shell_freeze:** `true` (AppShell / nav freeze)  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> **Frontend:** **omit** unless Brand logo upload broken (§9 architect-spec)  
> Wave spec: `memory/waves/2026-10-18-gemini-ad-logo-visual/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-gemini-ad-visual-logo-grade.md` (grade **A**)  
> Cards: `plugins/trainer/variant-a-art-director.md` · `create-carousel-prompts-notes`  
> Skills: `art-director` · `html-layout-variant-a` · `critique-checklist` · `carousel-json-contract` Phase 7 · `ai-bridge` · `content-pipeline-agents` · `backend` · `tester`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** optional (Orchestrator arms)  
> **VPS checklist:** Orchestrator **after** smoke — not specialist steps

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade A + skills TYPE SCALE / LOGO dual-path / AD Gemini / rich VP / smoke 6 | [x] | Grade A; Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — print **TYPE SCALE** numerics every Designer draw; Scriptwriter **visual_prompt RICHNESS** (≥3 elements + Armenian/Vernatun motifs) FAIL wording; Designer «html_layout = placement only / no invent px». `lib/studio/art-director-review.ts` — sync `ART_DIRECTOR_CHECKLIST_COMPRESSED` + system (virality+design+**content completeness**, thin slides, type-scale mismatch, missing logo img, pretty `N/M` awareness); Gemini vision wording + **NO remake**. Optional: `lib/mesh/agent-defaults.ts` Scriptwriter/Designer/AD prompt deltas if overlays alone insufficient. Align worker notes only if runtime reads them. **Не** `carousel-layered-composite.ts` CSS; **не** `placeholders.ts` split impl; **не** AppShell; **не** BrandPanel | [x] | Overlays+checklist live; report `ai-bridge-report.md` |
| 3 | **Backend** | `lib/intake/placeholders.ts` — dual-path: keep sanitized `logoRef` for LLM; add **`logoRefRaw`** (raw Brand logo). Call sites: `carousel-layered-composite` / `carousel-html-renderer` / `correct-pipeline-job` / designer pack — composite uses **raw** only. `lib/studio/carousel-layered-composite.ts` — `templatePrimarySize` **yields** to `typography.scale` map (§5.1); pass `slideCount`; `.slide-num` → pretty **`01/06`**; document `.brand-name` → `--cf-font-content` (optional display only if agreed). `lib/studio/art-director-run.ts` — default `ART_DIRECTOR_VISION_MODEL` → **`google/gemini-2.5-flash`** (alt `google/gemini-2.0-flash`); env `ART_DIRECTOR_MODEL` wins; **never** silent gpt-4o when PNGs exist. Smoke → **ONE** 6-slide + AD artifacts under `docs/карусель тест/gemini-ad-logo-visual-smoke-6/`. **Не** rewrite Create chrome; **не** AppShell; **не** prompt prose owned by step 2 (thin wire OK) | [x] | Scale+logo+num+Gemini default+smoke GREEN; `backend-report.md` |
| 4 | **Frontend** | **SKIP by default.** Arm only if §9: Brand upload/persist broken so raw logo never exists — then Frontend-minimal Brand panel only | [x] skip | Backend: Brand data-URL logo renders via dual-path; §9 not armed |
| 5 | **Tester** | Guards → `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`: G1–G9 from architect-spec §8 (scale CSS, prompt inject, Gemini default, no remake, logo dual-path, brand font doc, rich VP string, `03/06` pretty, smoke 6+AD). Unit/fixture preferred; grep OK for model default + sanitize split | [x] | Guards green; Fixer only if red · `scripts/verify-gemini-ad-logo-visual-guards.ts` **25/25 PASS** |
| 6 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] skip | Skip if Tester GREEN |
| 7 | **Deployer** | Localhost API refresh before smoke if needed | [ ] | Live localhost; `deployer-report.md` (Orchestrator arms) |
| 8 | **smoke** | Run **ONE** 6-slide layered carousel → Gemini AD review text → **STOP** (no remake). Confirm `docs/карусель тест/gemini-ad-logo-visual-smoke-6/` has 6 PNG + AD md/json; spot-check logo `<img>` + type sizes + `01/06`…`06/06` | [x] Backend ran | 6 slides + AD artifact; no second draw |
| 9 | **Client** (optional) | Playwright @1440 only if Orchestrator asks (Team AD / Create preview) | [ ] | Armed only |
| 10 | **Orchestrator** | VPS checklist artifact (end of wave) | [ ] | Checklist file; **not** auto-prod |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Tester → smoke** sequential (user chain). Do **not** parallel AI Bridge + Backend on shared prompt/zod files.  
3. **One writer** on `create-carousel-prompts.ts` + `art-director-review.ts` (AI Bridge step 2).  
4. **One writer** on `carousel-layered-composite.ts` + `placeholders.ts` + `art-director-run.ts` + smoke folder (Backend step 3).  
5. **Frontend omit** unless escalation §9.  
6. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
7. **NO AUTO-REMAKE:** Backend must not wire AD→Designer; smoke must not loop.  
8. **Budget:** ONE Client-score carousel × **6** finals.  
9. **S57 KEEP:** layered HTML product; OCR remake vision stays OFF; AD Gemini critique vision allowed.  
10. **Secrets:** never commit `.env` keys; document model id strings only.

## Tickets → steps

| Ticket | Steps |
|--------|-------|
| **C-type-scale-sot** | 2 → 3 |
| **C-ad-gemini-vision** | 2 → 3 |
| **C-logo-dual-path** | 3 (+ type field glue in 2 if needed) |
| **C-brand-name-font-doc** | 3 (report) |
| **C-visual-prompt-rich-hy** | 2 |
| **C-smoke-6-pretty-num** | 3 → 5 → 8 |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · Create chrome redesign · mesh geometry rewrite · monocoCoder replacing AI Bridge+Backend · VPS apply (checklist only) · Frontend (unless §9).

## Next executor

**Orchestrator** — step 10 VPS checklist only if armed; **Deployer skipped** (user: no deploy). Fixer skipped (Tester GREEN). Client optional.
