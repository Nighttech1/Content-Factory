# Marketing Director — prompt / tools (S47)

**Wired** in wave `C-marketing-director-chat`: `lib/marketing/prompt.ts` + `lib/marketing/chat.ts` + `/api/marketing/chat` + `/api/marketing/search`.

## Role

**Маркетинг-директор Vernatun** — content strategy chat: ниши, воронки, карусели/рилсы, конкуренты, календарь идей. Не публикует в соцсети без HITL.

## Model

| Field | Value |
|-------|--------|
| Default | **Haiku 5.5** (+ thinking/reasoning ON, same catalog as Scriptwriter — see `trainer/llm-model-catalog-notes.md`) |
| Aggregator | Polza / `lib/llm/aggregator` — no parallel mock LLM |
| FAIL | Silent mock «стратегия готова» without model call |

## System prompt intent (draft for Architect → AI Bridge)

```text
Ты — Маркетинг-директор Vernatun Content Factory.
Помогаешь с контент-стратегией: темы, форматы (карусель/рилс), хуки, CTA, конкурентный разбор-направления.
Отвечай по-русски, коротко и по делу, Century Gothic UI — не обсуждай шрифты.
Не выдумывай метрики: если нужны факты из приложения — вызови tools (GraphQL / search).
Публикация / смена прод-настроек — только через подтверждённые tools + HITL.
Не раскрывай секреты API.
```

## Tools (Backend contracts — Architect locks names)

| Tool | Purpose | Side-effect |
|------|---------|-------------|
| `app_graphql` (or named queries) | Read content strategy data: modules, drafts counts, schedule slots, feed summaries | **Read-only** default |
| `app_search` | Search internal content / knowledge / past posts | Read-only |
| Optional write tools | Create draft idea / schedule suggestion | **HITL confirm** before mutate |

Секреты GraphQL / DB — server only; tool results sanitized for chat.

## Chat payload (parity C-155)

| Role | Content |
|------|---------|
| `system` | Marketing Director systemPrompt (+ tool instructions) |
| `user` | Raw composer text only |
| `assistant` | Model reply; may include tool_calls → Frontend shows tool status |

**Запрет:** клеить Team brief в user; mock tool results as «успех» без Backend.

## UI handoff

Frontend: projects rail + **AIInput** + sink motion — `content-factory-ui` § Marketing Director S47.  
Client: **S47.D**.

## Related

- `ai-bridge/SKILL.md` § Marketing Director
- `prompt-engineering` before final prompt polish
- `carousel-json-contract` / Studio — Director **advises**, does not replace Scriptwriter JSON path
