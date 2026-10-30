# Chain — 2026-10-17 useful-smoke 51 / 1 / 17

> **ticket_limit:** `default≤3` (focused mini-wave)  
> **shell_freeze:** `true` (AppShell/nav freeze; Settings Brand/Персонажи rename+width **in scope**)  
> **useful_only:** gid=`902078005` — meetings ignore  
> **budget:** 12 PNG (3×4) — user explicit  
> **S55 + S56** Client  
> Wave spec: `memory/waves/2026-10-17-useful-smoke-51-1-17/architect-spec.md`  
> Trainer: `memory/trainer/2026-10-17-useful-smoke-51-1-17-grade.md`  
> Card: `plugins/trainer/useful-smoke-51-1-17.md`  
> Trace folder: `docs/карусель тест/smoke-useful-51-1-17/`  
> **plan_then_act:** на каждом шаге роль пишет план → действие

| Step | Role | Paths (lock — no overlapping writers) | Status | Done when |
|------|------|----------------------------------------|--------|-----------|
| 0 | Trainer | grade + useful-smoke skill gaps | [x] | Grade B; card `useful-smoke-51-1-17.md` ready |
| 1 | **Architect** | `architect-spec.md` + this `chain.md` | [x] | Spec+chain; **no product code** |
| 2 | **Frontend** | `components/settings/SettingsQuickNav.tsx`; `components/settings/LandscapesPanel.tsx` (heading/aria/copy → **Персонажи**); `components/settings/BrandPanel.tsx` (+ LandscapesPanel) field wrappers `max-w-[50%]` / ~50vw; optional comment-only in `SettingsShell.tsx`. **Не** `lib/intake/**`; **не** prompts; **не** AppShell/Sidebar | [x] | UI «Персонажи»; Brand+Персонажи half-width; `frontend-report.md` |
| 3 | **Backend + AI Bridge** *(one agent OK)* | **Backend:** `lib/intake/sheet-client.ts`; `lib/intake/sheet-config.ts`; `lib/intake/correct-pipeline-job.ts`; `lib/intake/normalize.ts` (if needed); `app/api/intake/sheet/**` (sync/generate/preflight/cron — default **useful-only**); smoke script under `scripts/` if used. **AI Bridge:** prompt-trace dump into `docs/карусель тест/smoke-useful-51-1-17/`; ensure generate path uses correct overlays + `slides=4` for rows **51, 1, 17**; `carousel-prompt-trace` / `CAROUSEL_PROMPT_TRACE`; touch `lib/studio/*prompt*` / critic **only if** trace hook missing. PNG → `generatedMedia/`. **Не** Settings JSX; **не** AppShell | [x] | Preflight useful OK; 3×4 PNG ≤12; MD timelines complete; meetings not polled; `backend-ai-bridge-report.md` |
| 4 | **Tester** | guards under `memory/waves/2026-10-17-useful-smoke-51-1-17/guards.md` (or tickets); assert useful-only gid; no «Пейзажи» in Settings product strings; half-width class present; 3 rows × 4 slides; MD files exist; budget ≤12 | [x] | Guards green — `guards.md` GREEN; Fixer skip |
| 5 | **Fixer** | Only failing paths from Tester (same path locks as owning role) | [x] | Skipped — Tester GREEN |
| 6 | **Deployer** | localhost API refresh + app ready for Client | [x] | `deployer-report.md` — :3001 · /settings 200 |
| 7 | **Client** | Playwright MCP @1440 **S55** (no regress) + **S56** (useful-smoke HARD); read MD timelines | [x] | **ПРИНЯТО** — `client-verdict.md` |

## Path locks (HARD)

1. **Architect done** before any product code.  
2. **Frontend → Backend+AI Bridge** sequential (FE Settings first; then intake+gen+trace).  
3. **One writer** on Settings Brand/Landscapes/QuickNav (Frontend step 2 only).  
4. **One writer** on `lib/intake/**` + sheet API + smoke gen + MD dump (Backend+AI Bridge step 3).  
5. Backend+AI Bridge **may be one agent** because FE paths are exclusive; do **not** split two writers on the same intake file.  
6. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA edits.  
7. Force smoke: rows **51, 1, 17** · `slides=4` · CTA from СТА (51→3, 1→1, 17→2).  
8. Row 51 `flag=meetings` is still **useful-tab** row — do not open meetings gid.  
9. Budget **12 PNG**; overspend → stop-report, no silent continue.  
10. Secrets never in MD / memory tickets.

## Smoke matrix (executor checklist)

| Order | № | topic (excerpt) | СТА | slides |
|-------|---|-----------------|-----|--------|
| 1 | 51 | Последствия скромности | 3 | 4 |
| 2 | 1 | Как научить ребёнка армянскому без ссор… | 1 | 4 |
| 3 | 17 | Армянская кухня за неделю… | 2 | 4 |

## Out of chain

Motion · WebGL · Mesh redesign · Scout/Apify · Razbor redesign · S54 bake-off · dual meetings poll · monocoCoder replacing FE+BE+AI Bridge · prod/VPS.

## Next executor

**Deployer** — step 6: localhost API refresh + app ready for Client S55+S56. Spec: `architect-spec.md` §7 / S56. Guards: `guards.md` (GREEN).
