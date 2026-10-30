# Wave W-2026-10-10 Team / Settings / Perf

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-10-team-settings-perf` |
| **Date** | 2026-10-10 |
| **Status** | open |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **full-queue** (не 3) |
| **Trainer grade** | A — `memory/trainer/2026-10-10-team-settings-perf-grade.md` |
| **Skills** | `xyflow-agent-mesh`, `content-factory-ui`, `web-perf-motion`, `web-motion-engine` (pan), `content-pipeline-agents`, `backend` (C-145 audit), `client-scenarios` **S37+S39** |

## Intent

Довести «Команда выпуска» + Settings + cold load студии после C-138/C-139:

1. **Editable combat brief** per pipeline → Razbor/composer (topic + brief).
2. **Pan** canvas + **center ports** + **remove** Copy TZ from top bar.
3. **Studio module** first paint без блокировки на Apify.
4. Settings: **Design preview panel**; **убрать** Разведка / Агенты / LLM blocks; Scout → Team drawer.
5. **Memory-only audit:** content gen vs `lib/llm/aggregator` (Polza).

## ID map (Orchestrator lock — canonical for this wave)

Trainer/skills temporarily listed C-141=pan-only, C-142=ports, C-143=delete-TZ, C-144=perf, C-145=settings+Polza.  
**This wave uses the Orchestrator remap below.** Frontend/Tester follow **ticket folders**, not the old skill row numbers.

| ID | Scope (this wave) |
|----|-------------------|
| **C-140** | Editable user brief per `MeshPipelineId` → zustand/localStorage; combat templates; wire topic+brief |
| **C-141** | (a) pan LMB/touch (b) center ports (c) **REMOVE** Copy TZ from `CanvasTopBar` |
| **C-142** | Perf `studio/[moduleId]`: fixtures first, Apify background; split dynamic imports |
| **C-143** | Settings Design: right preview panel (toggle/drag/resize); keep upload |
| **C-144** | SettingsShell: REMOVE Scout / Agents / Rules·LLM UI; Scout params → Team Scout drawer |
| **C-145** | **Audit only (memory):** Polza / `lib/llm/aggregator` vs mock — no secrets |

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| C-140 | P0 | `memory/tickets/C-140-editable-combat-brief/` | pending |
| C-141 | P0 | `memory/tickets/C-141-mesh-pan-ports-no-copy-tz/` | pending |
| C-142 | P0 | `memory/tickets/C-142-studio-module-perf/` | pending |
| C-143 | P1 | `memory/tickets/C-143-settings-design-preview/` | pending |
| C-144 | P0 | `memory/tickets/C-144-settings-shell-trim/` | pending |
| C-145 | P1 | `memory/tickets/C-145-polza-aggregator-audit/` | pending (audit doc) |

## Path lock (NO overlapping parallel writers)

| Order | Tickets | Surface | Notes |
|-------|---------|---------|-------|
| **1** | **C-141 + C-140** | mesh / release-team | **One Frontend pass** on `components/mesh/**` + User brief store + Razbor/composer wire. Same path OK. |
| **2** | **C-142** | `app/studio/[moduleId]` workspace | After mesh pass; do not touch mesh files. Measure before/after in status/guards. |
| **3** | **C-144 → C-143** | `SettingsShell` | Sequential: trim sections first, then Design preview panel. Scout UI moves to Team (`AgentInspectorDrawer` scout) — may touch mesh inspector **only after** path 1 done. |
| **4** | **C-145** | memory audit | Backend + Architect evidence in ticket; **no app code** required to close audit. Wire gaps → follow-up tickets if Orchestrator asks. |

**Запрет:** parallel FE on mesh + SettingsShell shared helpers; parallel C-142 with heavy mesh rewrite of same studio layout chunks.

## Wave chain (roles)

```text
Тренер (done, A) → Архитектор (этот артефакт + tickets)
  → Frontend: C-141+C-140 (one mesh pass)
  → Motion (optional): pan affordance / reduceMotion
  → Frontend: C-142 studio perf
  → Frontend: C-144 → C-143 settings
  → Backend: C-145 Polza audit confirm / gap list (memory only)
  → Tester → Fixer → Deployer → Client (S37+S39 HARD)
```

**Full-queue:** не резать на пачки по 3; закрыть C-140…C-145 с guards одним проходом (C-145 = audit doc + status).

## Supersedes

| Prior | By |
|-------|-----|
| C-138 Copy TZ CTA as required top-bar chrome | **C-141** DELETE Copy TZ — top bar title+subtitle **only** |
| C-139 User accordion mock jazz-only brief | **C-140** editable combat brief per pipeline |
| C-104 Settings «Разведка» | **C-144** remove; Scout on Team |
| Settings Agents / LLM aggregator UI (C-81/C-87) | **C-144** remove; model pick on Team drawer |
| C-85 Design «filename + upload only» | **C-143** + preview panel |

## Chain.md index

| Ticket | chain |
|--------|-------|
| C-140 | `memory/tickets/C-140-editable-combat-brief/chain.md` |
| C-141 | `memory/tickets/C-141-mesh-pan-ports-no-copy-tz/chain.md` |
| C-142 | `memory/tickets/C-142-studio-module-perf/chain.md` |
| C-143 | `memory/tickets/C-143-settings-design-preview/chain.md` |
| C-144 | `memory/tickets/C-144-settings-shell-trim/chain.md` |
| C-145 | `memory/tickets/C-145-polza-aggregator-audit/chain.md` |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** Architect done → FE mesh (C-141+C-140) → Motion? → FE C-142 → FE C-144→C-143 → Backend C-145 audit → Tester → Fixer → Deployer → Client S37+S39

**Full-queue:** не останавливаться после пачки — закрыть всю очередь с guards.
