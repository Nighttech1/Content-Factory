# PLUGINS / MCP — HITL Gate

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| Postgres / Prisma job status | `AWAITING_APPROVAL` ↔ approve | `DATABASE_URL` |
| SSE notify | Обновить Inspector / Drawer | нет |
| Auth/RBAC check | Только ADMIN/OWNER | session |

## Не подключать

- Social publish MCP (только после approve → Publisher)
- Авто-approve боты
- LLM, который «одобряет сам себя»

## Guard

Любой путь в Publisher без HITL-флага = баг P0.
