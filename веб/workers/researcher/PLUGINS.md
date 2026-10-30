# PLUGINS / MCP — Researcher

## Рекомендуемые tools (позже)

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| WebSearch / URL fetch | Тренды, статьи (не IG HTML) | нет в репо |
| Graph / Business Discovery (Backend C-36) | Live IG carousels ours+competitors | token env names only: `INSTAGRAM_ACCESS_TOKEN` \| `INSTAGRAM_GRAPH_TOKEN` \| `IG_ACCESS_TOKEN` |
| Read-only postgres | История удачных тем клуба | `DATABASE_URL` в `.env` |
| (опц.) RAG read collection | База фактов клуба | отдельно от dialog memory |

## Не подключать

- Publish MCP (IG/TT/…)
- HeyGen / Remotion render
- Запись в prod prompt store
- Instagram HTML scrape / unofficial IG APIs / login-automation для ленты

## Логирование

Каждый вызов внешнего fetch → краткая запись в `feedbackLogs.researcher.toolCalls` (url, ok/fail), без API keys / access tokens.
