# Guards — C-125

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | User node + Lane B Scout→Analyst→Trainer; dashed Trainer→release agents | `lib/mesh-seed.ts` |
| static | Scout panel `agent-properties-scout` = collected info; Trainer `agent-properties-trainer` = proposals | `components/mesh/AgentPropertiesPanel.tsx` |
| static | Barbell badge `[data-testid="trainer-barbell-badge"]` | `components/mesh/nodes/AgentProfessionAvatar.tsx` |
| static | Dashed edges `strokeDasharray` + `data-dashed="true"` | `components/mesh/edges/PulseEdge.tsx` |
| localhost | S33: click Scout ≠ Trainer copy; Trainer has barbell; visible «Пользователь»; dashed lines Trainer→A | Playwright S33 HARD |

## Localhost asserts (Playwright / Client S33)

1. OWNER → `/admin/mesh` (`agent-mesh-canvas`)
2. Visible node label **Пользователь** with mock request text
3. Lane B: **Скаут** → **Аналитик** → **Тренер** (solid between them)
4. **Пунктирные** edges from Тренер to release agents (Разборщик/Сценарист/Designer/Публицист) — `path[data-dashed="true"]` or dashed stroke visible
5. Click **Скаут** → `[data-testid="agent-properties-scout"]` contains «Собранная информация»; **нет** skill patches list as primary
6. Click **Тренер** → `[data-testid="agent-properties-trainer"]` + `[data-testid="trainer-barbell-badge"]` on avatar
7. No node overlap @1440; not free playground (C-124)

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | User node in seed | PASS |
| G2 | dashed Trainer→release loop in seed | PASS |
| G3 | Scout≠Trainer panel testids + distinct copy | PASS |
| G4 | trainer-barbell-badge testid | PASS |
| G5 | PulseEdge dashed variant | PASS |
| G6 | Playwright S33 full clicks | pending Client |

## Mirror in Client skill

`| C-125 | mesh single row / Scout patches | dual-lane User+B dashed Trainer barbell | memory/tickets/C-125-mesh-dual-lane/guards.md |`
