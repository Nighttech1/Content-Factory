# Chain — C-20

> Оркестратор зовёт **после** Architect Done **и** C-19 Client/guards green (или Orchestrator waiver в wave).  
> **Запрет:** Plugin Slot (C-21), live social publish, `migrate reset`, secrets in git/memory, GPU-required default path.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `src/modules/carousel-engine/**`, `src/modules/aesthetic-graphics/**`, `src/modules/cartoon-reels/**`, `src/modules/heygen-reels/index.ts` (adapter shell calling gateway), `src/modules/_shared/**`, `lib/modules/run-module.ts` и/или `app/api/modules/[moduleId]/generate/route.ts`, `app/api/modules/[moduleId]/render/route.ts` (опц.), `app/api/modules/[moduleId]/regenerate/route.ts` (опц.), `.env.example` | [x] | Skills: `content-module-sdk`, `backend`, `remotion-pipeline`, `bullmq-job-queue`. Mock-first Remotion. Не коммитить `.env`. **status: backend_done** — mock adapters + gateway stub + API facade; AI Bridge owns live HeyGen. |
| 2 | AI Bridge | `lib/ai/heygen-gateway.ts`, `lib/ai/prompts/heygen-*.ts` (и опц. prompts M1–M3 draft), `workers/designer-heygen/**` (prompt/PLUGINS only), touch `src/modules/heygen-reels/**` только для wire gateway | [x] | Skills: `heygen-avatar`, `prompt-engineering`, `content-pipeline-agents`. Нет ключа → mock. Не логировать API key. **status: ai_bridge_done** — live gateway + prompts + heygen-reels wire. |
| 3 | Frontend | `lib/studio-store.ts` / `components/studio/FloatingCommandBar.tsx` — **только** если Generate ещё не вызывает module facade; иначе skip с note в decisions | [x] | Skills: `content-factory-ui`. Без Plugin Slot. **status: frontend_done** — Generate Draft → `POST /api/modules/{canonicalId}/generate` `{ topic, render: true }`; drawer steps + success/error + draftId/assets in store. |
| 4 | Tester | `memory/tickets/C-20-module-adapters/guards.md` | [x] | **tester_red** — smoke+isolation GREEN; `/studio` 500: `brand-context` `node:fs` via registry→client. Fixer P0. |
| 5 | Fixer | Backend + AI Bridge (+ FE if touched) | [x] | **fixer_done** — Studio → `@/modules/manifests`; `_index` strips registry re-export; SMOKE_OK; GET /studio 200; generate ok |
| 6 | Deployer | localhost | [x] | **deployed_localhost** 2026-09-19 — Next `:3000` left running; GET `/studio` 200; `smoke-c20-adapters` SMOKE_OK; POST carousel generate 200 mock; VPS not deployed |
| 7 | Client | приёмка C-20 | [x] | **ПРИНЯТО** 2026-09-19 — M1–M4 generate mock; HeyGen no-key mock; `/studio` 200 (no fs crash); S1 API+drawer wiring. Playwright MCP gap. |

Порядок: **Backend → AI Bridge → Frontend(optional) → Tester → Fixer → Deployer → Client**.  
Не параллелить Backend и AI Bridge на `src/modules/heygen-reels/**` — AI Bridge после shell Backend **или** Backend оставляет TODO call-site, AI Bridge заполняет gateway первым файлом затем Backend wire (предпочтение: **Backend shell → AI Bridge gateway → Backend final wire** в одном Backend-pass после AI Bridge). Практическое правило Оркестратора: шаг 1 Backend без live HeyGen client; шаг 2 AI Bridge добавляет gateway; при необходимости короткий Fixer/Backend touch только `heygen-reels` import.

Depends on: **C-19**.  
Blocks: C-21 приёмка «M1–M4 already selectable» (soft — C-21 может стартовать UI после C-19, но Client C-21 ждёт C-20 mock adapters).  
Overview: `memory/tickets/_sprint6-sdk-overview.md`
