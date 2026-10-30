# Плагины — Backend (vector / RAG storage)

| Name | Type | Path | When |
|------|------|------|------|
| pgvector-semantic-search | skill | `.agents/skills/pgvector-semantic-search/` | embeddings в Postgres, HNSW/IVFFlat, RAG |
| chroma-local / chroma-cloud | skill | `.agents/skills/chroma-*` | коллекции / persist |
| pinecone-docs / pinecone-mcp | skill | `.agents/skills/pinecone-*` | managed index |
| langchain-rag | skill | `.agents/skills/langchain-rag/` | ingest pipeline |
| llamaparse | skill | `.agents/skills/llamaparse/` | document → text/markdown перед chunking |
| safe-db-migrations | skill | `.cursor/skills/safe-db-migrations/` | DDL для `vector` / extension |
| Router | skill | `.cursor/skills/rag-stack/SKILL.md` | выбор store |

MCP Postgres (уже в проекте): read-only gate — не для массового upsert векторов через MCP; запись через приложение / миграции.

Env: `DATABASE_URL` / postgres gate; `PINECONE_API_KEY`; `LLAMA_CLOUD_API_KEY`; Chroma cloud keys — только `.env`.
