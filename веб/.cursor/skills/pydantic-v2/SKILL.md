---
name: pydantic-v2
description: >-
  Strict Pydantic v2 and FastAPI schemas, validators, LLM JSON parsing.
  Use when writing schemas, field_validator, model_validate, or API contracts.
---

# Pydantic v2

Перед схемой ответа LLM открой `.cursor/skills/prompt-engineering/SKILL.md` (индикатор вывода должен совпадать со schema).

- `model_config = ConfigDict(from_attributes=True, populate_by_name=True)`
- v2: `@field_validator`, `model_validate()` — не v1 `@validator` / `from_orm()`
- Пустые поля для UI — явная строка «нет данных», не тихий `None`, если контракт ждёт текст
- Жёсткая схема на выход LLM: не пропускай произвольный JSON в хранилище
