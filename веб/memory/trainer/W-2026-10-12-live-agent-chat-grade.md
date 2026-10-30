# Trainer grade — W-2026-10-12-live-agent-chat

## План хода

- Запрос: Live Polza chat (Scriptwriter / Designer / Publisher) — user raw, systemPrompt from mesh only; zustand persist carousel drafts; PromptBox (chatgpt-prompt-input); Thinking 9-cube + shimmer.
- Режим: Backend + AI Bridge + UI/Motion composer; Client Playwright S40
- Роли по chain: Архитектор → Backend → AI Bridge → Frontend → Тестировщик → Клиент (Playwright)
- Конфликт знания до хода: C-140 требовал brief+topic в каждом agent chat — **ломает** C-155
- `ticket_limit: default≤3` (P0 pack ниже); full backlog C-155…C-158 — снять лимит по явной фразе пользователя

## Грейд: B

До патчей skills: **C** (C-140 vs raw-user; frontend.mdc lock на AgentChatComposer; нет PromptBox / zustand drafts / 9-cube контрактов).  
После патчей этого хода: **B** — команда может идти в Архитектора; exact persist key + Thinking RU/EN label — lock в spec.

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| AI Bridge + pipeline | B | C-155 message shape зафиксирован |
| Backend Polza proxy | B | live chat wire + no brief append |
| Frontend + 21st PromptBox | B | C-157 canon; mic preserved |
| Motion Thinking | B | C-158 9-cube + shimmer |
| Client scenarios S40 | B | HARD Playwright path |
| MCP Playwright / free stack | A | без платных MCP |
| Env Polza | B | `AGGREGATOR_*` уже канон; live path должен использовать |

## Пробелы (закрыты этим ходом в skills/rules)

| # | Пробел | Роль | Слой | P |
|---|--------|------|------|---|
| 1 | C-140 клеил brief в каждый chat user | AI Bridge / Pipeline | skill | P0 |
| 2 | Нет server contract «systemPrompt only» | Backend | skill | P0 |
| 3 | frontend.mdc = только AgentChatComposer | Frontend | rule | P0 |
| 4 | Нет 21st chatgpt-prompt-input → PromptBox | Frontend | skill | P0 |
| 5 | Нет zustand persist drafts | Frontend | skill | P1 |
| 6 | Нет Thinking 9-cube + shimmer | Motion / FE | skill | P1 |
| 7 | Нет Client S40 | Client | skill | P0 |

## Что добавлено этим ходом

- `.cursor/skills/ai-bridge/SKILL.md` — C-155 Polza roles
- `.cursor/skills/content-pipeline-agents/SKILL.md` — C-140 superseded for live chat; C-155 table
- `.cursor/skills/backend/SKILL.md` — live agent chat proxy row
- `.cursor/skills/content-factory-ui/SKILL.md` — PromptBox, persist drafts, Thinking
- `.cursor/rules/frontend.mdc` — C-155…C-158 composer canon
- `.cursor/skills/21st-ui-catalog/SKILL.md` — chatgpt-prompt-input search tips
- `.cursor/skills/web-motion-engine/SKILL.md` — 9-cube + shimmer
- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — brief wire vs live chat
- `.cursor/skills/architect/SKILL.md` — C-155…C-158 locks + chain
- `.cursor/skills/client-scenarios/SKILL.md` — **S40**
- `.cursor/skills/tester/SKILL.md` + `client-review/regression-guards.md`
- `gap-playbook.md` + `plugins/trainer/PLUGINS.md`

## Proposed tickets (**C-155+**)

| ID | Scope | P |
|----|--------|---|
| **C-155** | Live Polza chat Scriptwriter/Designer/Publisher: user raw; system = mesh `systemPrompt` only; no brief in user role | P0 |
| **C-156** | Carousel drafts: zustand `persist` (survive F5) | P1 |
| **C-157** | Replace AgentChatComposer → 21st chatgpt-prompt-input `PromptBox` (Dark Luxury) | P0 |
| **C-158** | Thinking: 9-cube assemble + shimmer «Thinking...» | P1 |

**Default pack (≤3):** C-155 → C-157 → C-158 (live path + composer surface).  
**Next:** C-156 (persist drafts).  
**Full-queue:** C-155…C-158 одним проходом при явной фразе пользователя.

## Chain (one-liner)

`Архитектор → Backend → AI Bridge → Frontend → Тестировщик → Клиент Playwright (S40)`

## Вердикт

Команда готова к волне: **да** (грейд B; сначала Архитектор spec + `chain.md`, без product-кода от Тренера)
