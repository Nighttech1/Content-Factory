---
name: sputnik-data-schema
description: >-
  Канон данных Sputnik Life OS для Cortana: сферы, годовые/месячные/недельные/дневные
  цели, Path, привычки. Читать перед filter, digest, tools, TG Q&A по целям.
---

# Sputnik data schema (Cortana)

Источник правды: sync dump в `sputnik_data.db` (JSON сфер) через `/api/sync` и `/api/cortana/context`.

Иерархия Objectives:

```
Sphere (id, name)
  yearlyGoalsArray[YYYY][]  → YearlyGoalItem {id, text, progress, notes}
  months[YYYY-MM].goals[]   → Goal {id, text, progress, note, yearlyGoalId, weeks[]}
    weeks[] → WeekTask {id, text, days[]}
      days[] → DayTask {id, text, done}
```

Связь: `Goal.yearlyGoalId` = `YearlyGoalItem.id`.

Path: `milestones[age].spherePaths[sphereId]` — текст вехи.  
Biometrics: `habits[]` с `completedDays`.  
Dreams: `dreams[]`.

## Правила ответа Cortana (retrieval era)

1. Отвечать **только** по `FILTERED_CONTEXT` и (если был раунд) `VECTOR_HITS` — не по «полной памяти модели».
2. Называть уровень: годовая / месячная / неделя / день.
3. Нехватка фактов → **не додумывать**; сигнал `need_vector_search` (см. `cortana-retrieval`, ТЗ §2.1).
4. После пустого vector → «в Спутнике этого нет» / уточняющий вопрос.
5. Multi-entity вопросы → StructuredFilter обязан отдать **union** нужных веток схемы.

Код: `cortana_service/services/sputnik_schema.py`, `sputnik_digest.py` (helper внутри filter),  
плагин `plugins/ai-bridge/sputnik_schema.py`.  
Контракт retrieval: `plugins/ai-bridge/cortana_retrieval_contract.py`.
