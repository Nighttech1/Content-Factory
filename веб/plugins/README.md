# plugins/ — плагины и расширения для агентов

Сюда **вы** загружаете материалы плагинов (Cursor Marketplace, MCP, локальные тулы), чтобы роли знали, чем пользоваться.

Не путать с:
- `knowledge/` — учебники/законы по блокам отчёта
- `.cursor/skills/` — скиллы ролей (как работать)
- `memory/` — журнал тикетов C-*

## Структура

| Папка | Агент |
|-------|--------|
| `orchestrator/` | Оркестратор |
| `architect/` | Архитектор |
| `ai-bridge/` | AI Bridge (RAG / Mem0 / vector MCP) |
| `geo-analyst/` | Геоаналитик (OSM / Mapbox / market skills) |
| `backend/` | Бекендер (pgvector / ingest) |
| `coder/` | Кодер |
| `tester/` | Тестировщик |
| `fixer/` | Фиксер |
| `client/` | Клиент (приёмка) |
| `report_lead/` | Report Lead |
| `block0_passport/` … `block9_roadmap/` | Доменные агенты разделов |

## Что класть в папку агента

1. **Ссылка / карточка плагина** — `PLUGINS.md` (название, URL Marketplace/MCP, зачем, когда включать).
2. **Конфиг** — фрагменты MCP (`mcp.json` snippet), env-имена (без секретов!), примеры вызовов.
3. **Локальные ассеты** — скрипты, WASM, CLI-обёртки, если плагин тащит файлы в репо.
4. **Запреты** — что агенту нельзя ставить/вызывать без спроса.

Секреты API-ключей плагинов — только в `.env`, не сюда.

## Как агент должен читать

Перед работой роли: открыть `plugins/<role>/PLUGINS.md` (если есть записи).

Локальные CLI-утилиты кодера лежат в корне `plugins/`:

- `plugins/image_optimizer.py`
- `plugins/excel_guard.py`
- `plugins/vri_classifier.py`
- `plugins/data/vri_p0412.json`

Установка системных Cursor-плагинов на машину — через CLI `cursor --install-extension …` и рекомендации в `.vscode/extensions.json`.

