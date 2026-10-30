---
name: safe-db-migrations
description: >-
  Non-destructive SQLite/PostgreSQL migrations: no DROP without two-phase
  deprecate, backup before DDL, integrity check after. Use when Backend or
  Architect changes schema, Alembic, user_version, or installer upgrades.
---

# Safe DB Migrations

Для **Backend** и **Архитектора**. Не пишет UI. Не трогает живую БД без бэкапа.

## Жёсткие правила

1. **Запрет DROP TABLE/COLUMN** в том же релизе, что убирает чтение. Сначала dual-read, потом Архитектор явно разрешает удаление в spec.
2. **Бэкап перед DDL** рядом с данными (не в git).
3. **Только additive DDL** в шаге: nullable-колонки, дефолты, новые таблицы. Перенос строк — в той же транзакции, что bump версии схемы.
4. После миграции: `PRAGMA integrity_check` = ok; изоляция A/B жива; старые ключи читаются.
5. Если версия файла **новее** кода — не даунгрейдить схему, обновить программу.
6. PostgreSQL: те же правила + не ломать RLS. Инспекция — MCP postgres **read-only**.

## Sprint 8 (Content Factory)

Additive tables only: `Draft` / `Board` / `ScheduleSlot` / `DesignSlot` (+ optional FKs). No DROP of `User`/`ContentJob`/`PostAnalytics`. Backup before DDL on shared. After migrate: isolation by `userId` still holds (Tester 8.7).

## Порядок

1. Архитектор: шаг Backend + этот скилл в `chain.md`.
2. Backend: MCP sqlite/postgres read-only as-is → миграция.
3. Тестер: retention + isolation + строка в `guards.md`.

## Антипаттерны

- DROP «чтобы было чисто».
- Миграция без транзакции / без версии схемы.
- Писать DDL через MCP.
- Менять смысл ключа без dual-read периода.
