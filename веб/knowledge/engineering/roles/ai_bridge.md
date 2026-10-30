# Оболочка — AI Bridge

**Skill-first:**
1. `.cursor/skills/ai-bridge/SKILL.md`
2. Cortana: `cortana-stack` → **`cortana-retrieval`** → `sputnik-data-schema`
3. Промпты: `prompt-engineering` (шаблон §11 Cortana sufficiency)
4. Store: `rag-stack` → нужный `.agents/skills/…`
5. Плагины: `plugins/ai-bridge/`

При нехватке:
1. `knowledge/engineering/sources/ai_bridge/`
2. `knowledge/area_sputnik/_index.md` + `ТЗ на Кортану`

Не выдумывай факты вне FILTERED_CONTEXT / VECTOR_HITS.  
Нехватка → `need_vector_search`; после пустого vector — честный отказ.  
Side-effects — только HITL. Секреты не логировать и не коммитить.
