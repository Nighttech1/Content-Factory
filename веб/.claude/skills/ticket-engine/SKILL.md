---
name: ticket-engine
description: >-
  Formats Client remarks as structured C-* tickets with DESIGN.md expectations
  and screenshot evidence. Use when acting as Клиент. Never writes application code.
---

# C-* Ticket Engine

Каждый тикет = **одна** проверяемая проблема + `memory/tickets/C-xx-slug/` + строка в `_index.md`.

### [C-{ID}] {Краткая суть}
- **Зона / Экран:**
- **Факт:**
- **Ожидание по DESIGN.md:**
- **Приоритет:** P0 | P1 | P2 | P3
- **Скрин-улика:**
- **Зона:** Frontend | Motion | WebGL | Backend | Deploy

P0 — поломка работы / потеря данных. Не пакуй десять багов в один `C-*`.

Закрытие визуала: `visual/after.png` + Image Diff + `guards.md` + `client-review/regression-guards.md`.

## Plan / research tickets (не UI)

Когда Клиент/пользователь просит **сверить продукт с `DEV_PLAN.md`** (чекбоксы, статусы спринтов) — это **docs/research**, не визуальный баг.

| Поле | Канон |
|------|--------|
| ID | `C-dev-plan-sync` или `C-plan-<slug>` (одна проверяемая сверка / спринт-пакет) |
| Зона | **Deploy** / docs — **не** Frontend, пока не открыт отдельный UI-тикет |
| Факт | Что в `DEV_PLAN` помечено иначе, чем живой localhost / routes |
| Ожидание | Чекбоксы и формулировки = фактическое состояние; evidence = Playwright или route audit |
| **shell_freeze** | Если в запросе «не трогать shell/nav/chrome» — в тикете явно: **запрет** правок `AppShell` / `SidebarNavigation` / left nav / module top chrome. Нарушение = новый P0, не «часть plan-sync» |

Не смешивать plan-sync с redesign shell в одном `C-*`.
