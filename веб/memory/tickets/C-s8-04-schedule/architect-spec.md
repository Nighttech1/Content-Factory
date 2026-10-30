# Architect spec — C-s8-04-schedule (P0)

> DEV_PLAN **8.4** · Wave `W-2026-10-15-sprint8-postgres`  
> Depends on: **C-s8-01**, drafts ideally **C-s8-02**  
> `shell_freeze: true`

## Goal

Календарные слоты живут в Postgres и связываются с Draft / ContentJob. HITL «одобрить» → статус **draft/scheduled queue only** — без публикации в соцсети.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-04-routes** | `GET/POST /api/schedule/slots`, `PATCH/DELETE …/[id]`, `POST /api/schedule/slots/approve` |
| **D-s8-04-legacy** | Client `postId` сохраняется; unique `(userId, postId)` |
| **D-s8-04-link** | Optional `draftId` / `contentJobId`; resolve draft by postId when possible |
| **D-s8-04-status** | `DRAFT` \| `SCHEDULED` only |
| **D-s8-04-hitl** | `approve` → `SCHEDULED` (+ Draft `SCHEDULED` если связан). **Запрет** Meta/IG/TG publish clients |
| **D-s8-04-chrome** | Не импортировать/не серверить `cf.schedule.popup.pos` / rail width |

## Map from `ScheduleSlotV1`

| Client | DB ScheduleSlot |
|--------|-----------------|
| `postId` | `postId` |
| `moduleId` | `moduleId` |
| `startsAt` ISO | `startsAt` DateTime |
| `platformId?` | `platformId` |
| (approve) | `status = SCHEDULED` |

## Acceptance

- [ ] GET slots после F5/API restart = данные из БД
- [ ] Approve не дергает social APIs (guard/assert в коде или smoke)
- [ ] Isolation по userId

## Skills

`backend` § Sprint 8 · HITL no-publish
