# Chain — 2026-10-18 pipeline-practice-higven-3

> **ticket_limit:** `full-queue`  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> **Frontend:** **omit**  
> Wave spec: `memory/waves/2026-10-18-pipeline-practice-higven-3/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-pipeline-practice-higven-3-grade.md` (grade **A**)  
> Card: `plugins/trainer/pipeline-practice-higven-3.md`  
> Canon: `plan.md`  
> Etalon: `docs/карусель тест/эталон/pipeline-practice-2026-10-18/01-higven-heavy-lifting-grid.png` (+02 inactive OK)  
> **User chain (HARD):** Architect → **AI Bridge → Backend (seed+smoke) → Tester → Fixer if needed (≤3) → Deployer → Client**  
> **VPS / social / DB wipe:** **FORBIDDEN**  
> **Carousel attempts:** ≤**3** then STOP

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when (DoD) |
|------|------|----------------------------------------|--------|-----------------|
| 0 | Trainer | grade A + card HIGVEN-3 | [x] | Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` — HIGVEN-3 parallel pack overlay: N=3; `characterPaint=none`; no conductor/girl; ONE reply `image_prompt`+`html_layout`; ban second logo.textColor call (may set from etalon zone in same pack); industrial grammar (dark/orange/hierarchy); Scriptwriter Haiku path for N=3. Optional `designer-variant-a-pack.ts` HIGVEN hardcopy fallback (not RE-orange plates). **Не** AppShell; **не** seed I/O; **не** smoke folders | [x] | Prompts live; `ai-bridge-report.md` |
| 3 | **Backend** | **(a)** `lib/settings/design-presets/higven-seeds.ts` + `scripts/seed-pipeline-practice-higven-3.ts`: clear layout-copy/RE-orange/other etalon presets; upsert 01 HIGVEN **active** + 02 SUA **inactive**; mirror etalon → `generatedMedia/…/pipeline-practice-2026-10-18/`. **(b)** Brand force `/brand/vernatun-logo.png`. **(c)** `style-copy-slots.ts`: pack `higven_01` + 4×2 cell slice. **(d)** Smoke `scripts/smoke-pipeline-practice-higven-3.ts` → `docs/карусель тест/pipeline-practice-higven-3/` (3 PNG + timeline + meta); slides=3; characterPaint=none; styleCopyMode=vision_ref; pack higven_01; no forceHero. **Не** prompt prose owned by step 2; **не** VPS/publish/DB wipe | [x] | Seed+smoke GREEN; `backend-report.md` |
| 4 | **Frontend** | **SKIP** | [x] skip | shell_freeze |
| 5 | **Tester** | Guards G1–G7 (N=3, HIGVEN active, none, full logo, parallel fields, AD no remake) | [x] | GREEN · `guards.md` + `tester-report.md` |
| 6 | **Fixer** | If attempt 1 visual weak → strengthen prompts; re-smoke; max attempt **3** then STOP | [x] | attempt 2 done; STOP (no #3) |
| 7 | **Deployer** | Copy smoke PNG → `public/pipeline-practice-higven-3/`; localhost:3000 serves | [x] | `deployer-report.md` · HEAD 200 ×3 |
| 8 | **Client** | Playwright @1440 · navigate slide_01–03 · screenshots · verdict | [x] | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** · `client-verdict.md` |

## Path locks (HARD)

1. Architect done before product code.  
2. AI Bridge → Backend sequential (no parallel writers on prompts vs seed/smoke).  
3. shell_freeze AppShell.  
4. Budget: ONE 3-slide carousel per attempt · ≤3 attempts.  
5. No social · no VPS · no DB wipe · secrets stay in `.env`.

## Next executor

**DONE** — Tester → Deployer → Client closed. Wave practice acceptance: **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (cover logo clips text).
