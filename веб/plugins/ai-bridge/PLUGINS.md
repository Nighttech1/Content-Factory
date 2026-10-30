# Плагины — AI Bridge

RAG / memory / parse / vector / Cortana retrieval. Секреты — только `.env` / Cursor Secrets.

## Реестр

| Name | Type | URL / path | When to use | Notes |
|------|------|------------|-------------|-------|
| Cortana retrieval | skill | `.cursor/skills/cortana-retrieval/SKILL.md` | filter-first, sufficiency, entity vector (ТЗ §5–9) | **читать первым** на context-тикетах |
| Cortana retrieval contract | plugin | `plugins/ai-bridge/cortana_retrieval_contract.py` | FilteredContext / SufficiencySignal shapes | зеркало схем для агентов |
| Cortana stack | skill | `.cursor/skills/cortana-stack/SKILL.md` | Telegram, GCal, HITL, брифы | |
| Sputnik schema | skill + plugin | `.cursor/skills/sputnik-data-schema/SKILL.md`, `plugins/ai-bridge/sputnik_schema.py` | иерархия целей | |
| Mem0 MCP | MCP | `https://mcp.mem0.ai/mcp/` | persistent user/agent memory | Header `Authorization: Token ${MEM0_API_KEY}` |
| Pinecone MCP | MCP | `@pinecone-database/mcp` | indexes, upsert, search | Env `PINECONE_API_KEY` |
| Mem0 skill | skill | `.agents/skills/mem0/` | SDK memory layer | |
| LlamaParse skill | skill | `.agents/skills/llamaparse/` | PDF/DOCX/PPTX parse | `LLAMA_CLOUD_API_KEY` |
| LangGraph skills | skill | `.agents/skills/langgraph-*`, `ecosystem-primer` | agent graphs, HITL, persistence | |
| langchain-rag | skill | `.agents/skills/langchain-rag/` | loaders → embeddings → vector store | не путать с Cortana filter-first |
| Chroma skills | skill | `.agents/skills/chroma-local/`, `chroma-cloud/` | local or cloud collections | entity ≠ dialog collection |
| Pinecone skills | skill | `.agents/skills/pinecone-*` | docs, MCP tools, query | |
| Router | skill | `.cursor/skills/rag-stack/SKILL.md` | выбор store + Cortana priority | |

## Env (имена, не значения)

```
MEM0_API_KEY=
PINECONE_API_KEY=
LLAMA_CLOUD_API_KEY=
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
# Cortana entity index (local path example)
# CORTANA_ENTITY_CHROMA_PATH=cortana_service/data/entity_chroma
```

## Запреты

- Не коммитить API keys.
- Не писать в БД из LLM в обход Backend / HITL.
- Не подключать Mem0/Pinecone MCP «на всякий случай» без задачи в chain.
- Не смешивать dialog Chroma (`cortana_rag/`) с entity-index collection.
- Не начинать GraphRAG без отдельного spec Архитектора.
