# Wave W-2026-10-10 Mesh labels (C-129)

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-10-mesh-labels` |
| **Date** | 2026-10-10 |
| **Status** | open |
| **Parent** | follow-up `W-2026-10-10-vernatun-ui` (Клиент: ПРИНЯТО С ЗАМЕЧАНИЯМИ) |
| **Max tickets** | **1** (C-129 only; soft limit ≤3) |
| **Trainer grade** | B — `memory/trainer/2026-10-10-mesh-labels-gap-grade.md` |
| **Skills** | `xyflow-agent-mesh` § C-129 HARD, `web-motion-engine`, `client-scenarios` S33 |

## Intent

Дочистить handoff-подписи на `/admin/mesh`: label bbox **никогда** не пересекает node bbox @1440; short RU в gutter на solid; mid-edge labels **скрыты** на dashed Trainer→release (title/aria OK).

## Tickets

| ID | P | Folder | Result |
|----|---|--------|--------|
| C-129 | P0 | `memory/tickets/C-129-mesh-labels/` | pending |

## Architect D2

**gutter + hide dashed** (не легенда в этой волне).

## Wave chain

```text
Тренер (done, B) → Архитектор (done)
  → Frontend → Motion → Tester → Fixer(if) → Deployer → Client HARD
```

## Chain.md index

| Ticket | chain |
|--------|-------|
| C-129 | `memory/tickets/C-129-mesh-labels/chain.md` |

## Stop report

_(Оркестратор после прохода)_
