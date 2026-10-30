# Маршрутизатор реализации

> On-demand. Кросс-стек раскидывается в профильные роли, не один монолитный кодер.

- UI / тип / материалы → Frontend (`luxury-web-craft`)
- Анимации / скролл → Motion (`web-motion-engine`)
- WebGL → `three-webgl-craft` по chain
- API / БД → Backend (`backend` + `safe-db-migrations`)
- Промпты / tools → AI Bridge + `.claude/skills/prompt-engineering/SKILL.md`
- LangGraph / RAG в chain → `.claude/skills/rag-stack/SKILL.md`, затем langgraph-скиллы
- Cortana контекст / filter / vector → **не монолитный кодер**: AI Bridge + `cortana-retrieval`
- Общая серверная логика без UI → `coder` + при схемах `pydantic-v2`; вызов LLM → `prompt-engineering`
