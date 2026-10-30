---
name: cortana-retrieval
description: >-
  Cortana context: structured filter-first by user question, multi-entity union,
  LLM sufficiency signal, then entity vector search. Use for TZ §5–9, ContextRouter,
  StructuredFilter, need_vector_search, anti-hallucination prompts.
---

# Cortana Retrieval (filter → vector)

Источник ТЗ: `ТЗ на Кортану` §2.1, §5–9.  
Роли: **AI Bridge** (основной), Архитектор (spec), Backend (upsert индекса), Тестировщик (guards).

## Обязательный порядок

```
load full context (API)
  → ContextRouter(entities[])     # multi-entity OK
  → StructuredFilter              # FILTERED_CONTEXT + facts_refs
  → LLM (+ anti-hallucination §2.1 every turn)
       ├─ context_sufficient=true → answer / propose HITL
       └─ need_vector_search=true → vector_search_entities (max 1)
            → VECTOR_HITS ∪ filter → LLM #2
                 ├─ hits → answer
                 └─ empty → «в данных Спутника этого нет» (no invention)
```

**Запрещено на старте:** GraphRAG, полный dump как единственный контекст, смешивать dialog-Chroma (`cortana_rag/`) с entity-index.

## Entity codes

`objectives` | `path` | `biometrics` | `dreams` | `temporal` | `coach_notes` | `meta_schema`

Multi-screen question → **union** of all needed slices (never drop a requested entity).

## SufficiencySignal (parse strictly)

```json
{
  "context_sufficient": false,
  "need_vector_search": true,
  "missing_entities": ["objectives", "path"],
  "missing_hints": ["..."],
  "answer": null
}
```

Final user answer only if `context_sufficient=true` **or** vector round already ran.

## Prompt every turn

Insert TZ §2.1 block: no inventing goals/path/habits/events; signal vector when underfed; after empty vector — honest absence, no «скорее всего».

Template: `.cursor/skills/prompt-engineering/templates.md` § Cortana sufficiency.

## Code map (target)

```
cortana_service/
  services/context_router.py
  services/structured_filter.py
  services/entity_vector.py      # separate collection from dialog memory
  schemas/retrieval.py           # FilteredContext, SufficiencySignal
  agent/graph.py                 # filter_context → coach → vector? → coach_final
```

Schema canon: `sputnik-data-schema`. Stack shell: `cortana-stack`. Store pick: `rag-stack` (default entity index = **chroma-local**, separate collection).

## Tester gates

See `.cursor/skills/tester/cortana-retrieval-guards.md`.

`🔎 **CORTANA RETRIEVAL:** [router entities; filter/vector; sufficiency; risks]`
