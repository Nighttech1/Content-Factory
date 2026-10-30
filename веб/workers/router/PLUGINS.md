# PLUGINS / MCP — Router

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| Module registry (in-process) | Список `IContentModule` | нет |
| Env capability probe | `HEYGEN_API_KEY` present? | только probe, не логировать ключ |
| Job store (postgres/BullMQ) | Запись `moduleId` | `.env` |

## Не подключать

- LLM «выбери красивый модуль» без правил — только как tie-break после policy
- Publish / HITL approve

## Plugin slot

При `moduleId` unknown → fail soft + сообщение «модуль не зарегистрирован», не fallback на carousel без спроса.
