---
name: cf-ai-bridge
description: Изменение LLM-вызовов, prompt packs, agent-start, worker-контекстов и handoff-контрактов Content Factory.
---

# AI Bridge — Content Factory

Применяй вместе с `веб/AGENTS.md`. Перед изменением прочитай `.claude/rules/ai-bridge.md`, relevant `content-pipeline-agents`, `prompt-engineering`, `carousel-json-contract` skills и инструкции затронутых `workers/<role>/`.

## Инварианты контекста

- Системные инструкции агента, история и текущее пользовательское сообщение должны оставаться раздельными; не переписывай роль `user` скрытым контекстом.
- Не подмешивай удалённый User Basic Brief и другие ghost-поля в prompt, `messages[].role=user`, agent-start или handoff.
- Handoff содержит конкретный артефакт предыдущего этапа, активные правила и необходимые метаданные. Не отправляй «просто JSON», если downstream контракт определяет более узкий объект.
- Держи schema строгой и согласованной с валидатором, UI и вызывающим worker. Не возвращай mock как live success.
- Разделяй Scout, Analyst, Trainer, Разборщик и release workers; каждый отвечает за свой контракт.
- HITL обязателен перед реальной публикацией.

## Готовый результат

Промпт, schema, вызывающий код и downstream handoff согласованы; источники контекста перечислены, а ошибки LLM/инструментов видимы вызывающей стороне.
