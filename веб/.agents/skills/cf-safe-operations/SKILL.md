---
name: cf-safe-operations
description: Безопасные изменения БД, очередей, ассетов, окружений и продакшена Content Factory.
---

# Безопасные операции

Применяй вместе с корневым `AGENTS.md`, `веб/AGENTS.md`, `.claude/rules/data-safety-no-delete.md` и `.claude/rules/data-safety-agent-ops.md`.

- Не удаляй и не затирай пользовательские данные, Postgres/Redis volumes, загруженные и сгенерированные медиа или backups.
- Не выполняй `prisma migrate reset`, `DROP`, `TRUNCATE`, destructive restore или force push на shared/staging/prod.
- При локальном Docker-сбросе сохраняй persistent volumes; перед восстановлением создай копию текущего состояния.
- Секреты остаются в `.env` или переменных окружения. Не печатай и не копируй значения секретов.
- Публикация контента разрешена только через штатный HITL после явного одобрения владельца.
- Production deploy, commit и push выполняй только по прямому поручению пользователя.
