# Prisma Content Schema

## When

Модели из `ARCHITECTURE.md` §6 + **Sprint 8** Postgres SoT (`DEV_PLAN` 8.1–8.5).

## Rules (core)

1. PostgreSQL + Prisma ORM; миграции через `safe-db-migrations`.
2. `Role.OWNER` | `Role.ADMIN` — RBAC для `/admin/mesh`.
3. `rawScript`, `generatedMedia`, `feedbackLogs` — Json с документированной формой.
4. Не удалять published jobs без soft-flag / архива.
5. Индексы: `userId`, `status`, `moduleId`, `createdAt`.

## Sprint 8 — additive models (SoT; не wipe)

Сейчас в `prisma/schema.prisma` есть `User` / `ContentJob` / `PostAnalytics`. **8.1** добавляет четыре сущности (имена финалит Архитектор в spec; ниже — канон волны):

| Model | Назначение | Ключевые поля (минимум) |
|-------|------------|-------------------------|
| **Draft** | Черновик карусели (Create/Razbor → Ours/Черновики) | `id`, `userId`, `moduleId`, `status` (`unpublished`/`scheduled`/…), `slides` Json, `payload` Json?, `contentJobId`?, timestamps; `@@index([userId, moduleId])` |
| **Board** | Доска референсов (Competitors\|Доски) | `id`, `userId`, `title`, `slideUrls` Json (или relation MediaAsset), timestamps; `@@index([userId])` |
| **ScheduleSlot** | Календарный слот ↔ job/draft | `id`, `userId`, `moduleId`, `startsAt`, `draftId`? / `contentJobId`?, `platformId`?, `status` (`draft`/`scheduled`/… — **не** social-published); `@@index([userId, startsAt])` |
| **DesignSlot** | Библиотека дизайна ≤**10** на user/workspace | `id`, `userId`, `label`, `brandbook` Json / markdown ref, `isActive` Bool, `sortOrder`, timestamps; enforce ≤10 в API; active → draw path (`design-active`) |

### Миграции

- Только **additive** таблицы/nullable FK; **запрет** `migrate reset` / DROP на shared.
- Связь `ScheduleSlot` ↔ `ContentJob` / `Draft` — FK optional сначала, dual-read если нужно.
- Media для Boards: файлы в storage bucket / `generatedMedia` path; в БД — URL/refs, не base64 в Postgres как SoT.

### Isolation

Все Sprint-8 сущности **scoped** `userId` (или workspace id из spec). List/GET другого профиля = пусто / 403 — не leak.

### Out of scope Sprint 8

- Social publish / Meta Graph push (спринт 22+).
- Mesh agent prompts (`cf.mesh.agents.*`) — остаются client/local пока отдельный тикет.
- Marketing projects store — не в 8.1–8.7.
