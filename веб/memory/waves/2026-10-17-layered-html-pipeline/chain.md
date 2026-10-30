# Chain — 2026-10-17 LAYERED HTML pipeline (S57)

> **ticket_limit:** `default≤3`  
> **shell_freeze:** `true` (AppShell/nav freeze; draw/composite **in scope**)  
> **Client gate:** **S57 HARD** (supersedes S53 overlay-fail + correct_pipeline type-on-PNG ship)  
> Wave spec: `memory/waves/2026-10-17-layered-html-pipeline/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-17-layered-html-pipeline-grade.md` (grade A)  
> Card: `plugins/trainer/carousel-layered-html-pipeline.md`  
> **plan_then_act:** на каждом шаге роль пишет план → действие  
> **Frontend:** OMIT unless mid-flight Architect arms font-path UI

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade + skills/rules Phase7 / S57 | [x] | Grade A; card + client S57 ready |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **AI Bridge** | `lib/studio/create-carousel-prompts.ts`; `lib/studio/carousel-json-contract.ts` (zod: `secondary_copy` **required**); `lib/studio/carousel-critic-05.ts` if copy rules need align; `lib/studio/create-carousel-prompts-notes` / skill notes only if runtime reads them; `lib/mesh/agent-defaults.ts` **carousel-engine scriptwriter/designer keys only**; workers `script-writer` / `designer-carousel` SKILL align to Layered Visual Engine; prompt-trace contract notes. **Не** `carousel-html-renderer.ts` Puppeteer impl; **не** SettingsShell; **не** AppShell | [x] | Overlays: scene-only `visual_prompt` + HARD bg ban; secondary_copy required; primary short; auto-7 «N способов»; swipe meta; CTA 1–4 for HTML; vision OFF wording; deprecate type-on-PNG / `correct_pipeline` as ship; report `ai-bridge-report.md` |
| 3 | **Backend** | `lib/studio/carousel-html-renderer.ts` (**rebrand primary `layered_html`**; kill correct as default); vision call sites off on product path; font resolve+download from DESIGN.md → factory store; Brand + Персонажи cut-outs in composite; `lib/intake/correct-pipeline-job.ts` (+ Create draw entry / env `CAROUSEL_PIPELINE` default layered); FORCE bg ban in code; **DELETE** `docs/карусель тест/smoke-useful-51-1-17/`; gen **ONE** 4-slide → that path **or** `docs/карусель тест/layered-smoke-4/` + `generatedMedia/` mirrors; update/retire `scripts/smoke-useful-51-1-17.ts` for layered 1×4. **Не** rewrite prompt prose owned by step 2 (except env/default wire); **не** AppShell / Settings JSX | [x] | Default product = layered Puppeteer 1080×1350; vision off; fonts wired; old smoke deleted; one 4-slide deliverable; `backend-report.md` with smoke path |
| 3b | **Frontend** | Settings font path UI **only if** Backend cannot download/resolve fonts without UI | [skipped] | Architect default: **omit**. Re-arm only via mid-flight Architect note |
| 4 | **Tester** | Guards under `memory/waves/2026-10-17-layered-html-pipeline/guards.md` (+ tickets if needed): single `layered_html` default; vision disabled; secondary_copy zod; bg ban prompt+code hooks; CTA HTML / swipe meta; auto-7 unit/smoke; smoke folder rewrite asserts | [ ] | Guards green; Fixer only if red |
| 5 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [ ] | Skip if Tester GREEN |
| 6 | **Deployer** | Localhost API refresh + app ready for Client S57 | [ ] | Live localhost; `deployer-report.md` |
| 7 | **Client** | Playwright MCP @1440 **S57.A–C** + taste vs etalon `#3` | [ ] | Вердикт; bake-off S54 / type-on-PNG S55 paint **not** required |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend** sequential. AI Bridge owns prompts/zod; Backend owns renderer/job/smoke.  
3. **One writer** on `create-carousel-prompts.ts` / `carousel-json-contract.ts` (AI Bridge step 2; Fixer later if needed).  
4. **One writer** on `carousel-html-renderer.ts` + intake job (Backend step 3).  
5. **Do not** parallel AI Bridge + Backend on the same file. Prefer: AI Bridge finishes overlays → Backend switches default pipeline + composite.  
6. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
7. **Frontend omitted** — do not open Settings redesign «на всякий случай».  
8. **Smoke DELETE** is Backend-owned and user-explicit — do not keep old 51/1/17 timelines.  
9. **Budget:** ONE Client-score carousel × 4 finals (≤8 without stop-report).

## Tickets mapping

| Ticket | Steps |
|--------|-------|
| **C-s57-ai-bridge-layered** | 2 |
| **C-s57-backend-composite** | 3 (+ 3b only if armed) |
| **C-s57-guards-client** | 4 → 5 → 6 → 7 |

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · S54 bake-off scripts · S56 12-PNG revival · monocoCoder replacing AI Bridge+Backend · AppShell chrome.

## Next executor

**Tester** — step 4: C-s57-guards-client (guards for layered_html default, vision OFF, smoke rewrite). Spec: `architect-spec.md`. Backend report: `backend-report.md`.
