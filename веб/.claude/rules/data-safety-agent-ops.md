# Data Safety: Операции агента — Content Factory

> Always-apply (суть в корневом `CLAUDE.md`).

При любых действиях с данными (баги, деплой, Docker, миграции) я обязан:

1. **Не перезаписывать и не удалять** без явной просьбы пользователя:
   - PostgreSQL volume / dump фабрики
   - Redis persistence очередей BullMQ
   - загруженные/сгенерированные медиа (`generatedMedia`, storage bucket)
   - бэкапы БД

2. **При пересоздании Docker** сохранять тома Postgres и Redis; не поднимать «чистый» prod/staging без бэкапа.

3. **Перед restore из бэкапа** — копия текущего состояния (`*.bak.YYYYMMDD`), затем подмена.

4. **Не выполнять** `truncate`, `prisma migrate reset` на shared, `force push` медиа в соцсети без HITL.

5. Секреты (`DATABASE_URL`, Redis, HeyGen, LLM) — только `.env`, не в чат-логи и не в memory tickets.
