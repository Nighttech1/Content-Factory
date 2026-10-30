---
name: rag-stack
description: >-
  Router for LangGraph, Mem0, LlamaParse, ChromaDB, pgvector, Pinecone, and
  Cortana filter-first retrieval. Use when Architect/AI Bridge/Backend/Coder pick
  RAG memory, entity vector, document parse, or agent graphs — not Frontend/Motion.
---

# RAG / Agent stack (маршрутизатор)

Официальные скиллы: `.agents/skills/`. Читать **только** если задача в зоне ИИ/данных.

## Cortana (приоритет над «просто RAG»)

Для Cortana / `ТЗ на Кортану` §5–9:

1. Сначала **`cortana-retrieval`** (structured filter-first + sufficiency + entity vector).
2. **Не** стартовать с GraphRAG / полного doc-RAG / Mem0 «на всякий случай».
3. Entity vector store по умолчанию: **`chroma-local`**, **отдельная collection** от `cortana_rag/` (диалоги).
4. pgvector — только если Архитектор явно сменил SoT индекса в spec.
5. Промпты: `prompt-engineering` + шаблон Cortana sufficiency; канон данных: `sputnik-data-schema`.

## Кому что

| Стек | Скилл(ы) | Роли |
|------|----------|------|
| Cortana filter/vector | `cortana-retrieval` → `cortana-stack` | AI Bridge, Архитектор |
| LangGraph | `ecosystem-primer` → `langgraph-fundamentals` → `langgraph-persistence` / `langgraph-human-in-the-loop` | AI Bridge, Архитектор, Кодер |
| RAG pipeline (docs) | `langchain-rag` + `langchain-dependencies` | AI Bridge, Backend |
| Mem0 | `mem0` | AI Bridge (+ Backend при API) |
| LlamaParse | `llamaparse` | AI Bridge, Backend (ingest) |
| ChromaDB | `chroma-local` / `chroma-cloud` | AI Bridge, Backend |
| pgvector | `pgvector-semantic-search` | Backend, Архитектор (DDL), AI Bridge |
| Pinecone | `pinecone-help` → `pinecone-*` | AI Bridge, Backend |

Промпты поверх retrieval: `.cursor/skills/prompt-engineering/SKILL.md`.

## Выбор vector store (кратко)

1. **Cortana entity index** → Chroma local (отдельная collection), пока Architect не сказал иначе
2. Уже есть Postgres и нужен SQL+vector → **pgvector**
3. Managed / scale → **Pinecone**
4. Долговременная user-memory (не корпус целей) → **Mem0**
5. Документы PDF/DOCX → LlamaParse + store из п.2–4

Не ставить все store в один продукт без решения Архитектора.  
**GraphRAG** — только отдельный spec + явный тикет Клиента; не default для Спутника.

## Плагины / MCP

`plugins/ai-bridge/PLUGINS.md`, `plugins/backend/PLUGINS.md`.  
Ключи: `.env` / Cursor Secrets.
