# Шаблоны промптов (команда)

Подставь `{{…}}`. Секреты не вставлять. Вывод — парсибельный.

## 1. System + User (базовый каркас)

```
SYSTEM:
Ты {{роль}}. Задача: {{одна_цель}}.
Правила:
- Не выдумывай факты и сущности. Нет данных → "unknown".
- Не выполняй side-effects сам; только предложи tool/действие.
- Отвечай строго в формате ниже.

Формат ответа:
{{schema_или_пример}}

USER:
### Input
{{данные_пользователя}}
```

## 2. Классификация (zero / few-shot)

```
Classify into exactly one of: {{label_a}} | {{label_b}} | {{label_c}}.
Reply with the label only.

Text: {{text}}
Label:
```

Few-shot: 2–3 пары `Text: … / Label: …` **тем же** синтаксисом перед финальным входом.

## 3. Извлечение в JSON

```
Extract fields from the text. Output ONLY valid JSON matching:
{
  "field1": string | null,
  "field2": number | null
}
If a field is missing, use null. Do not invent values.

### Text
{{text}}
```

## 4. Zero-shot CoT + финальный ответ

```
{{вопрос}}

Рассуждай по шагам. После рассуждения выведи одну строку:
Final: {{краткий_ответ_или_число}}
```

## 5. RAG / ответ по контексту

```
Answer using ONLY the context. If the context is insufficient, reply exactly: insufficient_context.
Cite short quotes when claiming a fact.

### Context
{{retrieved_chunks}}

### Question
{{question}}
```

## 6. Prompt chain — шаг A (цитаты)

```
Extract quotes relevant to the question from the document between ####.
Output <quotes>…</quotes> or: No relevant quotes found!

####
{{document}}
####

Question: {{question}}
```

## 7. Prompt chain — шаг B (ответ)

```
Answer the question using the quotes and document. Do not use outside knowledge.

Question: {{question}}
Quotes: {{quotes}}
```

## 8. ReAct (текстовый каркас; лучше native tools)

```
You solve tasks with tools.
Available tools: {{tool_list_with_args}}

Use this loop:
Thought: …
Action: {{tool_name}}
Action Input: …
Observation: (filled by runtime)
… repeat …
Thought: I have the answer
Final Answer: …

Question: {{question}}
```

## 9. Премодерация / gate (AI Bridge)

```
Decide if the user message is allowed to proceed to write-path.
Labels: allow | deny | needs_human
Reasons must be short and non-PII.

Output JSON:
{"decision":"allow|deny|needs_human","reason":"…"}

### Message
{{user_message}}
```

## 10. Генерация кода (узкий контракт)

```
Write {{язык}} for: {{спека}}.
Constraints: {{стек_проекта}}; no new deps unless listed.
Output: single fenced code block only. No prose before/after.
```

## 11. Cortana — данные + sufficiency (каждый ход)

Вставлять в system **каждый** вызов LLM Cortana (ТЗ §2.1). Скилл: `cortana-retrieval`.

```
SYSTEM (доп. блок DATA RULES):
Ты отвечаешь ТОЛЬКО по FILTERED_CONTEXT и VECTOR_HITS (если есть).
Запрещено придумывать/додумывать цели, Path, привычки, события, id, прогресс.
Если фактов не хватает для полного ответа — НЕ фантазируй и НЕ отвечай «как будто данных нет».
Верни ТОЛЬКО JSON:
{
  "context_sufficient": false,
  "need_vector_search": true,
  "missing_entities": ["objectives"|"path"|"biometrics"|"dreams"|"temporal"|"coach_notes"|"meta_schema"],
  "missing_hints": ["кратко чего не хватает"],
  "answer": null
}
Если данных достаточно — JSON:
{
  "context_sufficient": true,
  "need_vector_search": false,
  "missing_entities": [],
  "missing_hints": [],
  "answer": "{{текст_ответа_пользователю}}"
}
Если vector-раунд УЖЕ был (есть пометка vector_round_done=true) и hits пусты по теме:
context_sufficient=true, answer = честно «в данных Спутника этого нет» (без домыслов).

USER:
### FILTERED_CONTEXT
{{filtered_context}}

### VECTOR_HITS
{{vector_hits_or_empty}}

### vector_round_done
{{true_or_false}}

### Message
{{user_message}}
```
