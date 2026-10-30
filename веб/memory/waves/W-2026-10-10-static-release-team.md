# Wave W-2026-10-10 Static Release Team

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-10-static-release-team` |
| **Date** | 2026-10-10 |
| **Status** | open |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **full-queue** (не 3) |
| **Trainer grade** | A — `memory/trainer/2026-10-10-static-release-team-grade.md` |
| **Эталон** | `c:\Users\alexk\Downloads\code_artifact.html` |
| **Skills** | `xyflow-agent-mesh` (**C-138/C-139 STATIC**), `content-factory-ui`, `web-motion-engine` (dashflow + accordion), `client-scenarios` **S37** |

## Intent

Полный рефакторинг «Команда выпуска» по user TZ + эталон `code_artifact.html`:

1. **C-138** — снять MultiButton / MeshPipelineSwitcher; top bar = title + subtitle + «Скопировать ТЗ для Cursor».
2. **C-139** — заменить xyflow v2 (`ReleaseTeamFlowchart` ReactFlow) на **STATIC** HTML/CSS/SVG flowchart; User accordion in-place; Designer `design.md` chip; drawer 3 tabs; persist в zustand (plugins/mcp).

Route остаётся **`/studio/[moduleId]/mesh`** (OWNER). C-137 xyflow engine **superseded**.

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| C-138 | P0 | `memory/tickets/C-138-mesh-no-multibutton/` | pending |
| C-139 | P0 | `memory/tickets/C-139-static-flowchart/` | pending |

## Path lock (один mesh path — НЕ parallel)

| Order | Tickets | Notes |
|-------|---------|-------|
| 1 | **C-138 → C-139** | Один Frontend pass на `components/mesh/**` + page; C-138 chrome можно закрыть внутри того же FE PR что C-139 |
| 2 | Motion | dashflow SVG + User accordion; **не** PulseEdge / xyflow |
| 3 | Tester → Fixer → Deployer → Client | **S37 HARD** static+tabs |

**Запрет:** параллелить двух FE на mesh; оставлять ReactFlow «на всякий случай»; возвращать MultiButton на release-team.

## Wave chain (roles)

```text
Тренер (done, A) → Архитектор (этот артефакт + tickets)
  → Frontend: C-138 + C-139 (one mesh path; delete Multibutton + xyflow v2)
  → Motion: dashflow + accordion
  → Tester → Fixer → Deployer → Client (S37 HARD)
```

**Исключение лимита:** full-queue — не резать на пачки по 3; закрыть C-138→C-139 с guards одним проходом.

## Supersedes

| Prior | By |
|-------|-----|
| C-137 xyflow `ReleaseTeamFlowchart` / `FlowEdge` / `FlowAgentNode` | **C-139** STATIC HTML/CSS/SVG |
| C-83 / C-88 MultiButton on mesh chrome | **C-138** delete switcher |
| C-124 / C-125 / C-129 intent (dual-lane, dashed) | retained in **C-139** static layout |
| S37 acceptance under xyflow/C-137 fields | **S37** static+tabs (client-scenarios + client.mdc Hard REJECT §8) |

## Delete-list (Frontend must execute)

| Path / symbol | Action |
|---------------|--------|
| `components/mesh/MeshPipelineSwitcher.tsx` | **DELETE** if orphaned after unmount |
| MultiButton usage on `/studio/[moduleId]/mesh` | **REMOVE** |
| `CanvasTopBar` MultiButton/`extra` pipeline switcher | strip; top bar = title + subtitle + Copy TZ only |
| `components/mesh/v2/ReleaseTeamFlowchart.tsx` (ReactFlow) | **REPLACE** with static shell (or delete + new component) |
| `components/mesh/v2/FlowEdge.tsx` | **DELETE** / stop using |
| `components/mesh/v2/FlowAgentNode.tsx` | **DELETE** / stop using |
| `lib/mesh/flowchart-graph.ts` xyflow node/edge seed | gut or replace with static layout constants |
| MiniMap / Controls / Dots / free pan-zoom | **ban** on this page |

Keep (adapt): `lib/mesh/agent-store.ts`, `types/mesh-agent.ts` (extend), `AgentInspectorDrawer` (rewrite tabs), `lib/mesh-roles.ts`, RBAC page shell.

## Chain.md index

| Ticket | chain |
|--------|-------|
| C-138 | `memory/tickets/C-138-mesh-no-multibutton/chain.md` |
| C-139 | `memory/tickets/C-139-static-flowchart/chain.md` |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** Architect done → Frontend C-138+C-139 → Motion → Tester → Fixer → Deployer → Client S37

**Full-queue:** не останавливаться после одного тикета — закрыть всю очередь с guards.
