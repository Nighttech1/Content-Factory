# C-129 — Mesh handoff labels polish

| Field | Value |
|-------|-------|
| **ID** | `C-129` |
| **Priority** | **P0** (после недовольства пользователя) |
| **Area** | mesh_team_release |
| **Wave** | `W-2026-10-10-mesh-labels` (mini; follow-up Vernatun UI) |
| **Trainer** | `memory/trainer/2026-10-10-mesh-labels-gap-grade.md` |
| **Skill** | `.cursor/skills/xyflow-agent-mesh/SKILL.md` § Edge labels polish C-129 HARD |
| **Status file** | pending |

## Repro

1. OWNER → `/admin/mesh` @**1440**.
2. Смотреть handoff-подписи на solid Lane A/B и на **пунктирных** Trainer→release.
3. Labels **наезжают** на карточки агентов и/или линии (после Fixer-сдвига ~64% along / −34…−42px — всё ещё недостаточно для демо).

**URL:** `http://127.0.0.1:8787/admin/mesh` (OWNER)

## Expected

- Label bbox **никогда** не пересекает node bbox @1440 (Playwright measure).
- Solid Lane A/B: короткие RU labels (2–3 слова) в **gutter** над/под ребром, clear ≥8px от node box.
- Dashed Trainer→release: **без mid-edge labels** (tooltip/title на edge OK).
- Dual-lane C-124/125, panel click, barbell, no MiniMap — без регрессий.
- Handoff meaning (C-107) сохранён: короткий label **или** aria/title.

## Actual

Клиент Vernatun UI — **ПРИНЯТО С ЗАМЕЧАНИЯМИ**; пользователь: «дочисти подписи…». Offset %/px ≠ приёмка.

## Notes for Orchestrator

Единственный тикет волны. Path: mesh only (`PulseEdge` / `mesh-seed` / canvas). Не parallel с другими FE path. Chain: Frontend → Motion → Tester → Fixer(if) → Deployer → Client HARD S33 + bbox.
