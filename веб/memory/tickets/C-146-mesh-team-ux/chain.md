# Chain — C-146…C-153 (Mesh Team UX)

> **full-queue** — не резать на пачки по 3.  
> **Запрет** parallel FE на `components/mesh/v2/**` / `CanvasTopBar.tsx`.  
> Spec: `architect-spec.md`. Trainer: `memory/trainer/W-2026-10-11-mesh-team-ux-grade.md`.

**One-liner:** Frontend → Backend (upload if needed) → AI Bridge (prompts) → Tester → Deployer localhost → Client Playwright

| # | Role | Paths / work | Done | Notes |
|---|------|--------------|------|-------|
| 1 | **Frontend** | **C-146** delete reset + hints (`ReleaseTeamFlowchart`); **C-147** `CanvasTopBar` + page `sr-only` title via `pipelineId` → `MESH_PIPELINE_LABELS`; **C-150** remove Scout MultiButton types; **C-148/C-149** inspector upload UI + MCP cards (FileReader OK if no API yet); seed label display for C-151 if touching flowchart cards | [x] | skills `xyflow-agent-mesh`, `content-factory-ui`; sequential chrome→inspector; `decisions.md` 21st reuse; FileReader MVP (no upload API) |
| 2 | **Backend** | **C-148** optional `POST /api/settings/agent-packs/upload` if FE chose server store; **C-153** write `docs/ENV_FIRST_CAROUSEL.md` (RU: `AGGREGATOR_API_KEY`, `IG_SCRAPER_*`, carousel key cross-link) — **no secrets** | [ ] | skip upload route if FE FileReader-only; still do C-153 docs |
| 3 | **AI Bridge** | **C-151** `PIPELINE_COPY` custom-reels Сценарист/Монтажёр + raw-video montage prompts; **C-152** audit uniqueness matrix for all modules; handoff `promptForMontage` | [ ] | `content-pipeline-agents`, `prompt-engineering`; may edit `lib/mesh/agent-defaults.ts` after FE chrome done |
| 4 | **Tester** | Guards per C-146…C-153; extend S37/S39 scenarios (title, no reset/hints, upload filenames, MCP website, Scout no MultiButton, reels labels) | [ ] | `memory/tickets/C-146-mesh-team-ux/guards.md` |
| 5 | **Fixer** | _(если красное)_ surgical only | [ ] | no arch rewrite |
| 6 | **Deployer** | localhost refresh API/app for Client | [ ] | no VPS |
| 7 | **Client** | Playwright MCP @1440 — navigate mesh per module, clicks, snapshot/screenshot | [ ] | HARD GATE; verdict only with live UI |

## Path order inside Frontend (#1)

1. C-146 → C-147 (User card + top bar / page)  
2. C-150 (Scout inspector)  
3. C-148 → C-149 (drawer Skills/Plugins/MCP) — after Backend upload route **if** server path chosen; else FileReader first then Backend docs-only  

## Path order after Frontend

- Backend (#2) upload **before** FE finishes C-148 **only if** API chosen; else Backend = C-153 docs after or during AI Bridge.  
- AI Bridge (#3) C-151→C-152 after FE labels stable (or same wave after FE mesh chrome).  
- Tester → Fixer? → Deployer → Client.

## Overlap bans

- Do not parallel Frontend + AI Bridge on `agent-defaults.ts` — AI Bridge owns C-151/C-152 seeds; FE may pass role label display if already seeded.  
- Do not reintroduce MultiButton / xyflow / Copy TZ / Settings Разведка.
