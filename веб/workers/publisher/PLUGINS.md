# PLUGINS / MCP — Publisher

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| Instagram Graph / content API | Публикация карусели/reels | token `.env` |
| TikTok Content Posting | Video | token `.env` |
| YouTube Data API | Upload | OAuth `.env` |
| Telegram Bot API | Канал клуба | bot token `.env` |
| Postgres | Статус, post ids | `DATABASE_URL` |

## Не подключать

- Любой publish path без проверки HITL approve
- Хранение токенов в `workers/` или memory tickets
- LLM «улучши пост перед отправкой» без апрува новой версии

## Order

1. Assert HITL approved  
2. Load platform credentials from env  
3. Upload  
4. Persist ids  
5. Notify Analyst hook (job published)
