# C-137 — Mesh clean-slate rewrite (flowchart + Agent inspector)

| Field | Value |
|-------|-------|
| **ID** | `C-137` |
| **Priority** | P0 |
| **Area** | mesh |
| **Wave** | `W-2026-10-10-nav-mesh-rewrite` |
| **Status file** | pending |
| **[MKT]** | Команда выпуска с нуля: схема + инспектор агента |

## Repro

1. Открыть «Команда выпуска» (после C-136 — `/studio/[moduleId]/mesh`).
2. Legacy `AgentMeshCanvas` / static-picture patch / playground feel; нет typed Agent inspector (systemPrompt / skills / rules / modelConfig).

**URL:** `http://127.0.0.1:8787/studio/<moduleId>/mesh` (OWNER)

## Expected

DELETE legacy canvas path. New page: flowchart (fresh xyflow OK) + Inspector drawer. Agent type fields; dual-lane User→…→Publisher + Scout/Analyst/Trainer dashed; Save mutates state; Esc/outside close. Client **S37 HARD**.

## Actual

C-124/C-125/C-129 patch legacy xyflow — superseded.

## Notes for Orchestrator

**AFTER C-136.** Frontend + Motion; Backend Agent types optional same path. No parallel FE on mesh files. Supersedes C-124/C-125/C-129.
