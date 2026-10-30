# Chain — 2026-10-18 Phase 1 · Vernatun wordmark HTML logo

> **ticket_limit:** `full-queue` (single-phase — не резать)  
> **shell_freeze:** `true`  
> **upgrade_only:** `true`  
> **Frontend / Motion / AI Bridge:** **omit** (prompt hint = Backend)  
> Wave spec: `memory/waves/2026-10-18-phase1-logo-html/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-phase1-logo-grade.md` (grade **C→B**)  
> Card: `plugins/trainer/phase1-logo-wordmark-html.md`  
> Brief: `memory/waves/2026-10-18-phase1-logo-html/brief.md`  
> Skills: `carousel-json-contract` § Logo HARD · `backend` · `tester`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** omit unless Orchestrator arms  
> **VPS / publish / DB wipe:** forbidden

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade C→B + `phase1-logo-wordmark-html.md` + gap supersede name-beside | [x] | Grade B; Architect may enter |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **Backend** | (1) Copy source PNG → `public/brand/vernatun-logo.png`. (2) `lib/settings/brand-store.ts` — `DEFAULT_LOGO_REF = "/brand/vernatun-logo.png"`; keep svg file as legacy asset; optional migrate default-only entries in `data/local/brand-settings.json` (never wipe user uploads). (3) `lib/studio/carousel-layered-composite.ts` — when `logoUrl` → emit **only** `<img>`; **never** `.brand-name`; when no `logoUrl` → `brandName` text OK. Keep bottom-RIGHT + enlarged constants. (4) `lib/studio/carousel-html-renderer.ts` — ensure resolved `logoUrl` still from raw dual-path; no forced name chrome when logo present. (5) Thin prompt hint in `lib/studio/create-carousel-prompts.ts` — omit «name right of logo» for wordmark/logo-present. **KEEP** `lib/intake/placeholders.ts` dual-path. **Не** AppShell; **не** Phase 2 fonts; **не** Phase 3 character; **не** bake logo into image model | [x] | DoD §7 architect-spec; `backend-report.md` |
| 3 | **Tester** | Guards G1–G6 → `memory/waves/2026-10-18-phase1-logo-html/guards.md` (file exists, default PNG, logoUrl→img-only, no-logo→name OK, gated branch, prompt hint). Prefer unit/fixture + grep; optional script `scripts/verify-phase1-logo-wordmark-guards.ts` | [x] | Guards green; `guards.md` + `tester-report.md` · **6/6 PASS** |
| 4 | **Fixer** | Only failing paths from Tester (same path locks as Backend) | [x] | **Skip** — Tester GREEN |
| 5 | **optional re-smoke** | If easy: re-composite **1 slide** (or short set) on **existing** vision/smoke bg PNGs — no new paid image gen. Spot-check: wordmark img bottom-RIGHT, no Vernatun text chrome. Else skip and note in report | [x] | Optional PASS — `docs/карусель тест/phase1-logo-html-smoke/` ×6 |
| 6 | **Deployer** | Localhost API refresh only if Backend/Tester need live composite | [ ] | Armed if needed |
| 7 | **Client** | Playwright @1440 | [ ] | **omit** unless Orchestrator asks |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **Backend → Tester → (optional smoke)** sequential.  
3. **One writer** on `carousel-layered-composite.ts` + `brand-store.ts` + thin `create-carousel-prompts.ts` brand-hint lines (Backend step 2).  
4. **No** AI Bridge / Frontend / Motion unless BrandPanel persist broken (escalation architect-spec §9).  
5. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA.  
6. **S57 KEEP:** layered HTML only; no logo in image-model bg.  
7. **No** Phase 2 fonts / Phase 3 character.  
8. **Secrets:** never commit `.env` keys; do not commit huge unrelated binaries beyond the one brand PNG.  
9. **data-safety:** no DB wipe / no publish / no volume delete.

## Tickets → steps

| Ticket | Steps |
|--------|-------|
| **C-phase1-logo-png-install** | 2 |
| **C-phase1-logo-composite-omit-name** | 2 |
| **C-phase1-logo-prompt-hint** | 2 |
| **C-phase1-logo-guards** | 3 |
| **C-phase1-logo-resmoke** | 5 (optional) |

## Backend DoD (copy for specialist)

See **architect-spec.md §7**. Short form:

1. `public/brand/vernatun-logo.png` installed from locked source  
2. Default `logoRef` = `/brand/vernatun-logo.png` (svg legacy OK on disk)  
3. `logoUrl` → img only, never `.brand-name`  
4. no `logoUrl` → `brandName` text OK  
5. dual-path raw KEEP; S57 HTML only  
6. thin prompt omit name-right  
7. shell_freeze; no Phase 2/3  
8. `backend-report.md`

## Out of chain

- AI Bridge full overlay rewrite  
- Frontend Brand redesign  
- Motion / Mesh  
- Phase 2 fonts / Phase 3 Pixar  
- VPS / social publish / DB wipe  
- paid MCP  

## Handoff next

**Backend** starts step 2 with architect-spec §4–§7 open. After Backend GREEN → Tester step 3.
