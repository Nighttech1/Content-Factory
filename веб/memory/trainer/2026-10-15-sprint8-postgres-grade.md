# Trainer grade — 2026-10-15 — Sprint 8 Postgres SoT

## План хода

- Запрос: полный **Sprint 8** (`DEV_PLAN` **8.1→8.7**) по порядку; **UI shell freeze**; **без** social publish.
- Режим: **backend** + Frontend-minimal persist swap (не UI redesign).
- Роли по chain: Architect → Backend → Frontend-minimal → Tester → Fixer → Deployer → Client.
- `ticket_limit: full-queue` (пользователь: full sprint / in order).
- Out of scope: Motion, full Frontend redesign, AI Bridge (unless Architect finds blocker), mesh/marketing localStorage, sprint 22 publish.

## Грейд: **B** (волна готова после закрытия skill-gaps этим ходом)

| Роль | Грейд | Комментарий |
|------|-------|-------------|
| **Backend** (prisma + safe-db-migrations) | **B→A*** | Skills усилены; schema ещё без Draft/Board/… — это работа 8.1, не пробел знания |
| **Frontend-minimal** | **B** | Контракт shell freeze + API wire задокументирован; точные route paths — Architect lock |
| **Tester** | **B** | 8.7 F5 / cross-profile / no-publish / ≤10 / idempotent import — в skill |
| **Architect** | **A** | shell_freeze + sequential 8.1–8.7 + proposed chain в skill |
| **Motion / AI Bridge** | N/A | Не в chain этой волны |

\*После spec с exact field shapes Backend = **A** на исполнение.

**До апгрейда skills:** критичный пробел (**C**) — `prisma-content-schema` только User/ContentJob; FE skills держали localStorage как SoT; Tester без 8.7 isolation/refresh.

## Пробелы (до этого хода)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет моделей Draft/Board/ScheduleSlot/DesignSlot в prisma skill | Backend | skill | P0 |
| 2 | Backend skill без Sprint 8 CRUD / HITL-no-publish / import map | Backend | skill | P0 |
| 3 | content-factory-ui: C-156 = localStorage SoT; нет Frontend-minimal | Frontend-minimal | skill | P0 |
| 4 | Tester: нет guards F5 + cross-profile + no social | Tester | skill | P0 |
| 5 | Architect без sequential Sprint 8 chain lock | Architect | skill | P1 |
| 6 | gap-playbook без симптомов «пропало после F5» / shell redesign | Trainer | skill | P1 |

## Что добавлено этим ходом

- `.cursor/skills/prisma-content-schema/SKILL.md` — § Sprint 8 models
- `.cursor/skills/backend/SKILL.md` — § Sprint 8 SoT + legacy key map + bans
- `.cursor/skills/safe-db-migrations/SKILL.md` — Sprint 8 additive note
- `.cursor/skills/content-factory-ui/SKILL.md` — C-156 supersede + § Frontend-minimal
- `.cursor/skills/tester/SKILL.md` — § Sprint 8.7 guards
- `.cursor/skills/architect/SKILL.md` — § Sprint 8 full-queue chain
- `.cursor/skills/trainer/gap-playbook.md` — 5 строк SoT/shell/publish
- `plugins/trainer/sprint8-postgres-sot.md` + строка в `PLUGINS.md`

## As-is product (audit, не код)

- `prisma/schema.prisma`: User / ContentJob / PostAnalytics only.
- Client SoT сегодня: `cf.carousel.drafts.v1`, `cf.studio.boards.v1`, `cf.schedule.v1`, `cf.settings.design.library.v1` + activeId; server partial `design-active.json`.

## Proposed chain hint

```
Trainer ✅
→ Architect (architect-spec + chain.md; shell_freeze: true; 8.1→8.7 sequential; no social publish)
→ Backend 8.1 (Prisma + safe-db-migrations)
→ Backend 8.2 Drafts API
→ Backend 8.3 Boards + storage
→ Backend 8.4 ScheduleSlot ↔ ContentJob (HITL → draft/scheduled only)
→ Backend 8.5 DesignSlot ≤10 + active
→ Frontend-minimal 8.6 (+ wire stores 8.2–8.5 to API; no shell redesign)
→ Tester 8.7 (F5 + cross-profile + idempotent import + no publish + shell freeze diff)
→ Fixer → Deployer (localhost) → Client (persistence smoke; not UI redesign accept)
```

Не параллелить overlapping Backend schema/API paths. Лимит 3 **снят** (full-queue).

## Вердикт

Команда готова к волне: **да** (грейд **B**; можно звать Архитектора).
