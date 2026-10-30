# Architect spec — C-s8-01-schema (P0)

> DEV_PLAN **8.1** · Wave `W-2026-10-15-sprint8-postgres`  
> Shared: `memory/waves/W-2026-10-15-sprint8-postgres/architect-spec.md`  
> **No product code from Architect.** · `shell_freeze: true`

## Goal

Добавить в Postgres четыре сущности: **Draft**, **Board**, **ScheduleSlot**, **DesignSlot** — только additive migration. Существующие `User` / `ContentJob` / `PostAnalytics` не ломать.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s8-01-additive** | Только CREATE TABLE / nullable FK / indexes. **Запрет** DROP, `migrate reset`, wipe volumes |
| **D-s8-01-names** | Модели как в wave spec §6 |
| **D-s8-01-fk** | `userId` → User обязателен; `contentJobId` / `draftId` на слотах — optional |
| **D-s8-01-backup** | На shared — бэкап перед DDL (не в git) |
| **D-s8-01-seed** | При необходимости upsert seed User `user_seed_admin_c16` — без удаления jobs |

## In scope

- `prisma/schema.prisma`
- `prisma/migrations/<timestamp>_sprint8_sot/`
- optional: `prisma/seed.ts` upsert User only

## Out of scope

- API routes (C-s8-02+)
- Frontend
- Social publish
- Shell UI

## Acceptance

- [ ] `prisma migrate deploy` (или dev) применяет migration без wipe
- [ ] Четыре таблицы + enums видны в schema
- [ ] Старые таблицы/данные User/ContentJob/PostAnalytics целы
- [ ] Нет DROP в SQL migration

## Skills

`prisma-content-schema` · `safe-db-migrations` · `backend`
