# C-140 — Editable combat brief per pipeline

| Field | Value |
|-------|-------|
| **ID** | `C-140` |
| **Priority** | P0 |
| **Area** | mesh / Razbor / composer |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | User card = живой боевой бриф модуля, не джаз-мок |

## Repro

1. OWNER: `/studio/<moduleId>/mesh` → карточка User.
2. Brief = статичный mock (`MOCK_USER_BRIEF` jazz/audience) — не редактируется как combat prompt.
3. Send из Razbor / `AgentChatComposer` уходит без привязки brief+topic к payload.

**URL:** `http://127.0.0.1:8787/studio/<moduleId>/mesh` (+ Razbor из studio workspace)

## Expected

- Editable **combat-system brief** per `MeshPipelineId` / module (carousel, reels, heygen, articles…).
- Persist: zustand + localStorage (pattern рядом с mesh agent store).
- User card: **textarea** (accordion OK) — edit in-place, **no** agent drawer for User.
- Defaults = combat templates per module type — **not** mock jazz-only.
- Wire: Razbor / `AgentChatComposer` send → message payload includes **topic + brief**.
- Same Frontend pass as **C-141** (path lock 1).

## Actual

Mock brief / copy-only accordion; no per-pipeline editable store; composer not wired to brief.

## Notes for Orchestrator

Path 1 with C-141. Frontend primary. Skills: `xyflow-agent-mesh`, `content-pipeline-agents`. Client **S37+S39**.
