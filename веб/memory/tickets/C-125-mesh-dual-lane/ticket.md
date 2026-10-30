# C-125 — Mesh dual-lane + Trainer barbell + Scout≠Trainer

| Field | Value |
|-------|-------|
| **ID** | `C-125` |
| **Priority** | P0 |
| **Area** | mesh_team_release |
| **Wave** | `W-2026-10-10-vernatun-ui` |
| **Status file** | pending |

## Repro

1. OWNER → `/admin/mesh`.
2. Нет блока «Пользователь»; нет отдельной линии Scout→Analyst→Trainer с пунктиром ко всем release agents.
3. Scout panel может выглядеть как «улучшения»; у Тренера нет barbell badge.

**URL:** `http://127.0.0.1:8787/admin/mesh` (OWNER)

## Expected

Dual-lane: (A) User→Сценарист \| Разборщик→Сценарист; (B) Scout→Analyst→Trainer + dashed ко всем A; Trainer barbell; Scout=collect info; Trainer=proposals.

## Actual

Один ряд / Scout как author patches / нет User / нет dashed B→A.

## Notes for Orchestrator

Тот же mesh path что **C-124** — один Frontend проход. Не parallel.
