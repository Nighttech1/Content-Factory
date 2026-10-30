# C-144 — SettingsShell trim: remove Scout / Agents / LLM

| Field | Value |
|-------|-------|
| **ID** | `C-144` |
| **Priority** | P0 |
| **Area** | settings / Team scout home |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Status file** | pending |
| **[MKT]** | Настройки без «Разведки» и списка агентов — разведка живёт в Команде |

## Repro

1. Open `/settings`.
2. Still shows blocks: **Разведка** (`ScoutSettingsPanel`), **Агенты** (prompts/rules), **LLM** aggregator UI.
3. Scout search params not owned by Team Scout inspector per pipeline.

**URL:** `http://127.0.0.1:8787/settings` + `/studio/<moduleId>/mesh`

## Expected

- **REMOVE** from `SettingsShell`: Scout (разведка), Agents, Rules/LLM aggregator UI blocks.
- **Keep** as needed: Design, Platforms, Schedule-related, Reels (and any other non-agent blocks already product-required).
- Scout search params → **`AgentInspectorDrawer` for scout agent on Team** (per pipeline / content-type).
- Then **C-143** adds Design preview on the trimmed shell.

## Actual

`SettingsShell` still mounts Scout + Agents + LLM sections.

## Notes for Orchestrator

Path 3 first ticket. Frontend; may touch mesh Scout drawer **only after** path 1 (C-141+C-140) done. Skill «C-145 settings trim» → **this ticket is C-144**.
