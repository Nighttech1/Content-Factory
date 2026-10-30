# Wave W-2026-10-10 Vernatun UI

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-10-vernatun-ui` |
| **Date** | 2026-10-10 |
| **Status** | open |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **full-queue** (не 3) |
| **Trainer grade** | A — `memory/trainer/2026-10-10-vernatun-ui-wave-grade.md` |
| **Skills** | `content-factory-ui`, `xyflow-agent-mesh` (static picture), `content-pipeline-agents`, `content-factory-analytics`, `web-motion-engine`, `client-scenarios` S32–S35 |

## Intent

Один проход Vernatun UI: бренд PNG+имя справа; Studio без RegisterModule; Mesh = static pipeline picture + dual-lane; Schedule popupPos persist; Analytics menu like Studio + RL Trainer HITL + Retention %@15s дробь.

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| C-122 | P0 | `memory/tickets/C-122-brand-logo/` | static PASS → Client |
| C-123 | P0 | `memory/tickets/C-123-studio-no-register/` | static PASS → Client |
| C-124 | P0 | `memory/tickets/C-124-mesh-static-picture/` | static PASS → Client S33 |
| C-125 | P0 | `memory/tickets/C-125-mesh-dual-lane/` | static PASS → Client S33 |
| C-126 | P0 | `memory/tickets/C-126-schedule-popup-pos/` | static PASS → Client S35 |
| C-127 | P0 | `memory/tickets/C-127-analytics-menu-rl-hitl/` | static PASS → Client S34 |
| C-128 | P1 | `memory/tickets/C-128-retention-15s/` | static PASS → Client S34 |
| **C-129** | **P0** | `memory/tickets/C-129-mesh-labels/` | **follow-up mini-wave** `W-2026-10-10-mesh-labels` — labels∩nodes = 0 @1440 |

> **C-129:** после Клиент «ПРИНЯТО С ЗАМЕЧАНИЯМИ» + пользователь «дочисти подписи». Не часть исходного full-queue Vernatun; отдельная mini-wave. Spec D2: gutter short RU (solid) + hide mid-edge on dashed Trainer→release.

## Path lock (последовательность — НЕ parallel overlap)

1. **C-122** — shell / `SidebarNavigation` brand  
2. **C-123** — Studio Launchpad (`ModuleSelectorGrid`)  
3. **C-124 + C-125** — один mesh path (`AgentMeshCanvas` / `mesh-seed` / panel / `AgentNode`) — **один Frontend проход**  
4. **C-126** — schedule calendar popup  
5. **C-127 → C-128** — analytics shell (последовательно в `AnalyticsShell`)  

Затем: **Motion** (mesh dashed + density + barbell) → **Tester** → **Fixer** → **Deployer** (localhost) → **Client** (Playwright HARD S33 mesh; S32/S34/S35).

## Wave chain (roles)

```text
Тренер (done, A) → Архитектор (этот артефакт + tickets)
  → Frontend (C-122 → C-123 → C-124+C-125 → C-126 → C-127 → C-128)
  → Motion (mesh)
  → Backend (опц. RL HITL mock / retention at15 types)
  → Tester → Fixer → Deployer → Client
```

**Запрет:** параллелить overlapping paths (особенно mesh C-124∥C-125 как два FE; analytics C-127∥C-128).  
**Исключение лимита:** full-queue — не резать на пачки по 3.

## Chain.md index

| Ticket | chain |
|--------|-------|
| C-122 | `memory/tickets/C-122-brand-logo/chain.md` |
| C-123 | `memory/tickets/C-123-studio-no-register/chain.md` |
| C-124 | `memory/tickets/C-124-mesh-static-picture/chain.md` |
| C-125 | `memory/tickets/C-125-mesh-dual-lane/chain.md` |
| C-126 | `memory/tickets/C-126-schedule-popup-pos/chain.md` |
| C-127 | `memory/tickets/C-127-analytics-menu-rl-hitl/chain.md` |
| C-128 | `memory/tickets/C-128-retention-15s/chain.md` |
| C-129 | `memory/tickets/C-129-mesh-labels/chain.md` (wave: `W-2026-10-10-mesh-labels.md`) |

## Stop report (заполняет Оркестратор)

**Tester (2026-10-10):** guards.md для C-122…C-128; static/grep **PASS** по всем 7. Playwright localhost **не прогонялся** (→ Client S32–S35). `npx tsc --noEmit` — **FAIL** 3 ошибки вне волны (`animated-file-tree.tsx`, smoke scripts). `npm test` / vitest — **нет** в проекте.

| Ticket | Static | Live UI |
|--------|--------|---------|
| C-122 | PASS | pending Client S32 |
| C-123 | PASS | pending Client S32 |
| C-124 | PASS | pending Client S33 overlap |
| C-125 | PASS | pending Client S33 |
| C-126 | PASS | pending Client S35 |
| C-127 | PASS | pending Client S34 |
| C-128 | PASS | pending Client S34 |

**Закрыто (Client+guard):** —

**Осталось:** Fixer (tsc infra опц.) → Deployer localhost → Client Playwright HARD

**Full-queue:** не останавливаться на пачке из 3 — закрыть всю очередь с guards.
