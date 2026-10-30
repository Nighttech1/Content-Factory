# Data safety — Content Factory (no-delete)

> Always-apply (суть в корневом `CLAUDE.md`).

Запрещено без явного запроса пользователя:
- Удалять/затирать PostgreSQL данные, volume Redis, загруженные медиа `generatedMedia`
- `prisma migrate reset` / drop database на shared/staging/prod
- Публиковать контент в соцсети в обход HITL-апрува

Разрешено: локальные seed/fixtures, пересоздание **пустой** local DB при явном согласии в тикете.

Секреты (`HEYGEN_API_KEY`, `API_KEY_21ST`, `DATABASE_URL`, Redis, LLM keys) — только `.env` / env ОС, никогда в skills/memory/git.
