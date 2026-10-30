# PLUGINS / MCP — Analyst

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| Postgres metrics / job history | KPI, retention joins | `DATABASE_URL` |
| Platform insights APIs | Views, saves, CTR | tokens `.env` |
| (опц.) RAG read | База прошлых инсайтов | отдельная collection |
| LLM summarize | Карточки «what worked» | LLM `.env` |

## Не подключать

- Write в prod system prompts без version workflow
- Publisher
- GraphRAG «на всякий случай» — только если spec явно просит

## Prompt versioning

Предложения класть в `feedbackLogs.analyst.promptProposals[]`; применение — отдельный Owner flow.
