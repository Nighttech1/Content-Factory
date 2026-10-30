---
name: cortana-stack
description: >-
  Маршрутизатор Cortana: Telegram (Aiogram), Google Calendar, SQLite sync tools,
  LangGraph HITL, брифы, filter-first retrieval. Use when AI Bridge builds/fixes Cortana.
---

# Cortana Stack (маршрутизатор)

Для **AI Bridge** и **Backend** по `ТЗ на Кортану` и `knowledge/area_sputnik/`.

## Архитектура (актуальная)

```
Telegram (Aiogram 3.x)
  → Cortana Agent (LangGraph)
       → ContextRouter + StructuredFilter   # read
       → LLM (± entity vector, max 1)       # read
       → propose_plan_changes → HITL TG
       → apply → SQLite sync + GCal         # write only after approve
```

**Source of truth sync:** `sputnik_data.db` (SQLite) через Node `/api/cortana/*` и `/api/sync`.  
Postgres dual-write — опционально; не путать с SoT в домене (см. `area_sputnik/_index.md`).

## Компоненты → скиллы

| Зона | Скилл | Задача |
|------|-------|--------|
| **Retrieval §5–9** | **`cortana-retrieval`** | Router, filter, sufficiency, entity vector |
| Схема целей | `sputnik-data-schema` | Иерархия sphere→year→month→week→day |
| Agent graph / HITL | `langgraph-*`, `langgraph-human-in-the-loop` | interrupt/resume, proposals |
| Промпты | `prompt-engineering` (+ templates Cortana) | persona + §2.1 anti-hallucination |
| Telegram | этот файл § Telegram | Aiogram, inline, Whisper |
| Calendar | этот файл § GCal | OAuth2, CRUD after approve |
| DB / sync API | `backend`, `safe-db-migrations` | proposals, audit, dump |
| Vector store pick | `rag-stack` → `chroma-local` (entity collection) | не dialog Chroma |

## Retrieval (обязательно читать)

Перед любой правкой контекста LLM:

1. `.cursor/skills/cortana-retrieval/SKILL.md`
2. `ТЗ на Кортану` §2.1, §5–9
3. Не возвращаться к «всегда полный `build_sputnik_digest`» как единственному пути (digest — helper внутри срезов filter).

## Telegram (Aiogram 3.x)

- **Вход:** текст + voice → Whisper → text
- **Выход:** сообщения + `InlineKeyboardMarkup`
- **Callbacks:** `approve:{id}`, `reject:{id}`, `edit:{id}`
- **Брифы:** `/brief` — агрегат из **того же** filter/context API (не обходить router без нужды)
- Схема: `sputnik-data-schema` + `plugins/ai-bridge/sputnik_schema.py`

```
cortana_service/
  bot/  agent/  clients/  services/  schemas/
```

## Google Calendar

- Tools: `gcal_list_events`, `gcal_create_event`, `gcal_patch_event`, `gcal_delete_event`
- **Запрет:** запись без `apply_pending_proposal` после approve

## DB tools (через Backend / API)

AI Bridge **не пишет** в SQLite напрямую:

- `toggle_habit`, `update_objective_progress`, `log_coach_note` — только внутри proposal → apply
- `propose_plan_changes` / `apply_pending_proposal` / reject
- MCP sqlite — SELECT only

## Чистый код

- Pydantic v2: tools + `FilteredContext` / `SufficiencySignal`
- Idempotent `action_id` на мутациях; audit на apply
- Секреты в `.env`
- Тесты: HITL + **cortana-retrieval-guards**

## Связь с `cortana_rag/`

Диалоговая память (Chroma) — **отдельно** от entity-index. Не дублировать hitl/tools в `cortana_rag/`; расширять `cortana_service/`.

`🤖 **CORTANA STACK:** [компонент; retrieval/HITL; риски]`
