# Плагины — architect

Каталог для загрузок и карточек плагинов этого агента.

## Как добавить

1. Положите файлы/скрипты плагина в эту папку (или `assets/`).
2. Добавьте строку в таблицу ниже.
3. Обновите `plugins/_index.md`.

## Реестр

| Name | Type (Cursor / MCP / CLI / other) | URL / path | When to use | Notes |
|------|-----------------------------------|------------|-------------|-------|
| rag-stack | skill | `.cursor/skills/rag-stack/SKILL.md` | выбор LangGraph / Mem0 / parse / vector store | до chain |
| ecosystem-primer | skill | `.agents/skills/ecosystem-primer/` | LangChain vs LangGraph | первый шаг |
| pgvector-semantic-search | skill | `.agents/skills/pgvector-semantic-search/` | embeddings в Postgres | DDL → Backend |
| geo-stack / Геоаналитик | skill | `.cursor/skills/geo-stack/`, `geo-analyst/` | локация+радиус market research | chain → Геоаналитик |

## Secrets

Ключи не хранить здесь — `.env` / Cursor Secrets.
