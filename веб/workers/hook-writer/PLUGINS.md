# PLUGINS / MCP — Hook Writer

## Рекомендуемые tools

| Tool / MCP | Зачем | Секреты |
|------------|-------|---------|
| LLM via AI Bridge | Генерация и скоринг хуков | LLM key в `.env` |
| Schema validator (Zod) | Формат 10/3/1 | нет |
| (опц.) Analyst read-only hints | «что работало» | postgres read |

## Не подключать

- Media render, HeyGen, Publisher
- Автозапись prod system-prompt без версии

## Prompt versioning

Имя промпта: `hook-writer@vN`. Analyst может предложить `vN+1`, не затирая текущий.
