# Chain — 2026-10-18 Variant A `html_layout` + Art Director

> **ticket_limit:** `default≤3`  
> **shell_freeze:** `true` (AppShell/nav freeze; mesh node + inspector review **in scope**)  
> **upgrade_only:** `true`  
> **NO auto-remake:** HARD  
> Wave spec: `memory/waves/2026-10-18-variant-a-art-director/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-18-variant-a-art-director-grade.md` (grade **B**)  
> Card: `plugins/trainer/variant-a-art-director.md`  
> Skills: `art-director` · `html-layout-variant-a` · `critique-checklist` · `carousel-json-contract` Phase 7 · `content-pipeline-agents` · `xyflow-agent-mesh`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Client:** optional (Orchestrator arms)  
> **VPS checklist:** Orchestrator **after** smoke — not in specialist steps

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade + stubs art-director / html-layout-variant-a / registry | [x] | Grade B; team may enter Architect |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts` (Designer: emit `html_layout` per §5); `lib/studio/carousel-json-contract.ts` **or** new sibling schema module for `HtmlLayout` + `ArtDirectorVerdict` (export for Backend); `lib/mesh/agent-defaults.ts` — seed **carousel-engine** `art-director` systemPrompt/skills/rules + Designer prompt delta (Variant A); workers `designer-carousel` / new `art-director` prompt.md align; notes under `.cursor/skills/art-director/` only if runtime reads them. **Не** `carousel-layered-composite.ts` CSS impl; **не** AppShell; **не** flowchart JSX | [x] | Designer overlays require `html_layout`; AD system+checklist+JSON force; no-remake wording; report `ai-bridge-report.md` |
| 3 | **Backend** | `lib/studio/carousel-layered-composite.ts` (template map · accent wrap · logo/character/cta/scrim); wire `html_layout` into `LayeredSlideIn` + callers (`carousel-html-renderer.ts` / intake/Create job); STRICT validate; create `workers/art-director/`; job step **after** composite → AD once → persist verdict; **forbid** remake enqueue on remarks; smoke → **ONE** 4-slide + `art-director-review.md|.json` under chosen canon path (`docs/карусель тест/variant-a-ad-smoke-4/` **or** `generatedMedia/variant-a-ad-smoke-4/`). **Не** rewrite Create chrome; **не** AppShell; **не** prompt prose owned by step 2 (except thin wire) | [x] | Composite executes layouts; AD persists; smoke artifacts; `backend-report.md` with paths |
| 4 | **Frontend** | `components/mesh/v2/ReleaseTeamFlowchart.tsx` (+ path/geometry helpers if any) — node **«Арт-директор»** after Designer; `lib/mesh/agent-defaults.ts` / store types **only if** AI Bridge left FE-facing gaps (prefer consume AI Bridge seed); `AgentInspectorDrawer.tsx` — Logs pin **or** tab **«Ревью»** for AD verdict; avatar key; `data-testid="node-art-director"`. **Не** AppShell / SidebarNavigation / Create modal redesign; **не** remake CTA | [x] | Node visible on Team; inspector shows verdict/remarks; `frontend-report.md` |
| 5 | **Tester** | Guards under `memory/waves/2026-10-18-variant-a-art-director/guards.md` (+ tickets if needed): template enum reject; orphan highlight fail; AD output zod; **no remake** assert (job graph / code grep / unit); smoke folder has 4 PNG + AD text; mesh testid if cheap | [x] | Guards green; Fixer only if red |
| 6 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] | Skip if Tester GREEN |
| 7 | **Deployer** | Localhost API refresh + app ready for smoke UI + optional Client | [ ] | Live localhost; `deployer-report.md` |
| 8 | **smoke+AD** | Run ONE carousel (layered + Variant A) → AD review text only → **STOP** (no remake). Confirm artifacts on disk + Team UI shows verdict if FE live | [ ] | 4 slides + AD artifact; no second draw |
| 9 | **Client** (optional) | Playwright @1440 Team → open Арт-директор → review visible | [ ] | Only if Orchestrator arms |
| 10 | **Orchestrator** | VPS checklist artifact (end of wave) | [ ] | Checklist file; **not** auto-prod |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Frontend** sequential (user chain). Do **not** parallel AI Bridge + Backend on `carousel-json-contract` / prompts.  
3. **One writer** on prompts + zod shapes (AI Bridge step 2; Fixer later if needed).  
4. **One writer** on `carousel-layered-composite.ts` + AD worker/job (Backend step 3).  
5. **One writer** on ReleaseTeamFlowchart + AgentInspectorDrawer (Frontend step 4). If `agent-defaults.ts` touched by both AI Bridge and Frontend: AI Bridge owns seed content first; Frontend only consumes / minimal type glue after.  
6. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
7. **NO AUTO-REMAKE:** Backend must not wire AD→Designer; smoke must not loop.  
8. **Budget:** ONE Client-score carousel × 4 finals (≤8 without stop-report).  
9. **S57 KEEP:** layered HTML product path; OCR remake vision stays OFF; AD critique vision allowed.

## Tickets mapping

| Ticket | Steps |
|--------|-------|
| **C-variant-a-html-layout** | 2 → 3 (prompts + zod + composite execute) |
| **C-art-director-agent** | 2 → 3 (AD prompt + worker + persist + no remake) |
| **C-art-director-ui-smoke** | 4 → 5 → 6 → 7 → 8 (+ optional 9) |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · highlight styles beyond `accent` · AppShell chrome · monocoCoder replacing AI Bridge+Backend+Frontend · VPS apply (checklist only).

## Next executor

**Deployer** — step 7 (when armed): localhost API refresh. Tester GREEN; Fixer skipped. User asked no deploy this Tester turn.
