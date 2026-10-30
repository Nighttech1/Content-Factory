# Chain — 2026-10-17 carousel correct pipeline

> **ticket_limit:** `full-queue`  
> **shell_freeze:** `true` (AppShell/nav freeze; Settings Brand/Landscapes + Logs/RED **in scope**)  
> **full_pipeline_replace:** `true`  
> **S55** Client (supersedes S54 bake-off acceptance for this wave)  
> Wave spec: `memory/waves/2026-10-17-carousel-correct-pipeline/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-17-carousel-correct-answers-grade.md`  
> Sheet schema: `docs/карусель тест/correct/01_sheet_schema.md.txt`  
> **plan_then_act:** на каждом шаге роль пишет план → действие

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade + skill gaps Phase6 | [x] | Answers locked; card ready |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` + `01_sheet_schema.md.txt` | [x] | Spec+chain+schema; **no product code** |
| 2 | **AI Bridge** | `docs/карусель тест/correct/02_*.md.txt`…`06_*.md.txt` (**draft** prompts/rules — not empty paste); `lib/studio/create-carousel-prompts.ts`; `lib/studio/carousel-json-contract.ts`; `lib/studio/carousel-quality-critic.ts` (+ new critic-05 module if needed); vision helper under `lib/studio/*` or `lib/llm/*vision*`; `lib/mesh/agent-defaults.ts` **carousel-engine scriptwriter/designer keys only**; `workers/script-writer/SKILL.md` + `workers/designer-carousel/SKILL.md` (align no-invention); prompt-trace notes. **Не** SettingsShell / sheet API routes | [ ] | Overlays STRICT correct; critic⊃zod; vision≤2→needs_review; CTA/swipe KEEP; Designer image_prompt-only; 02–06 non-empty drafts |
| 3 | **Backend** | `app/api/intake/sheet/**` (new); sheet client `lib/intake/**`; schedule→drafts cron/job; Draft payload flags; Brand/Landscapes API `app/api/settings/brand/**` + `landscapes/**`; agent logs API; Publicist schedule wire on existing Drafts/ScheduleSlot; prisma **additive** migration; `.env.example` sheet/vision keys (**no secrets in git**). **Не** `create-carousel-prompts.ts` / critic text; **не** SettingsShell JSX | [x] | Preflight green; rows normalized; gen→Draft; status machine; write-back or mirror; Publicist auto\|manual API — see `backend-report.md` |
| 4 | **Frontend** | `components/settings/SettingsShell.tsx` (+ Brand / Landscapes panels); Team agent drawer **Логи** tab; mesh/agent card **RED** perimeter; Publicist time chrome if missing on drafts/schedule. **Не** `lib/studio/*prompts*` / sheet sync libs; **не** AppShell/Sidebar IA | [x] | S55.A UI live; Logs+RED; Brand after Design; Landscapes below Brand — `frontend-report.md` + `decisions.md` |
| 5 | **Tester** | guards under `memory/tickets/` or `memory/waves/.../guards*`; smoke sheet preflight + Create still works; critic retry; vision cap; CTA/swipe asserts | [x] | Guards green — `guards.md`; Fixer none; localhost was DOWN (Deployer) |
| 6 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] | Skipped — Tester GREEN, no Fixer tasks |
| 7 | **Deployer** | localhost API refresh + app ready for Client | [x] | Live localhost:3001; sheet «Кумовство» — `deployer-report.md` |
| 8 | **Client** | Playwright MCP @1440 **S55.A–C** | [ ] | Вердикт; bake-off S54 **not** required |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **AI Bridge → Backend → Frontend** sequential (user lock). AI Bridge prompts/critic/vision **before** Backend wires jobs to them; Backend APIs **before** Frontend binds Brand/Landscapes/Logs.  
3. **One writer** on `create-carousel-prompts.ts` / `carousel-json-contract.ts` / `carousel-quality-critic.ts` (AI Bridge only in step 2; Fixer may patch same files later if Tester fails).  
4. **One writer** on `SettingsShell` + Brand/Landscapes (Frontend step 4 only).  
5. **Backend** owns sheet/schedule/drafts/publicist API — Frontend only consumes.  
6. **No parallel** AI Bridge + Backend on `agent-chat/route.ts` — if both need it: AI Bridge contract first, Backend wires status/flags second (Fixer resolves conflicts). Prefer AI Bridge touch overlays; Backend touch route only for `needs_review` persistence / sheet entry enqueue.  
7. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
8. **Do not** parallel Frontend Settings with Backend settings API **writers on same file** — API first (step 3), UI second (step 4).

## Out of chain

Motion · WebGL · Razbor redesign · Scout/Apify · social Meta publish · S54 bake-off scripts · monocoCoder replacing FE+BE+AI Bridge.

## Next executor

**Client** — step 8: Playwright MCP @1440 **S55.A–C**. Localhost: http://localhost:3001 · see `deployer-report.md`.
