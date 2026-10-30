# Chain — W-2026-10-12-carousel-studio-handoff (единый для пачки)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` на `CreateCarouselModal` / agent-chat route.  
> Тикеты: **C-carousel-chrome → C-carousel-agents → C-carousel-publish** (FE sequential на одном modal).

**One-liner:** Architect (done) → AI Bridge (agent-start + designer SM) → Backend (modes + draw + no-mock error) → Frontend (chrome→agents→publish) → Tester → Fixer → Deployer → Client **S41**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | `memory/waves/W-2026-10-12-carousel-studio-handoff.md`; `memory/tickets/C-carousel-*/architect-spec.md`; этот `chain.md` | [x] | Только memory; **no** `app/` / `components/` prod-code |
| 1 | AI Bridge | `lib/studio/agent-chat-soft-ack.ts`; prompt/bundle helpers (new under `lib/studio/` or `lib/llm/` per Backend); Designer describe/draw prompts; agent-start assembly (request/context/rules/skills/plugins/MCP summary); **no secrets in logs** | [x] | Skills: `ai-bridge`, `prompt-engineering`, `content-pipeline-agents`, `carousel-studio-handoff`. Lock: C-155 user turns = raw only; bundle ≠ glue into live user. Done: `agent-start-bundle.ts`, `create-carousel-prompts.ts`, soft-ack Create no-mock + `createCarouselErrorMessage`, mesh carousel-engine copywriter/designer markdown+no-auto-handoff+describe-first |
| 2 | Backend | `app/api/studio/agent-chat/route.ts`; `lib/studio/agent-chat-client.ts`; `app/api/studio/carousel-engine/generate-slides/route.ts`; mesh read `lib/mesh/agent-defaults.ts` (rules/skills/plugins/MCP bindings); soft-ack path | [x] | Extend modes: `chat \| handoff \| describe \| draw` (or `agent-start`). **Fail → `source: "error"`**, NOT mock success. Draw → last agreed description → generate-slides. Skills: `backend`. Done: modes+surface on agent-chat (bundle handoff/describe, draw→`runGenerateCarouselSlides` no-mock), client create-path no soft-ack, generate-slides `surface`/`noMock`/`description`, helper `create-carousel-publish.ts` |
| 3 | Frontend | **Sequential pass A→C on one modal path** (не parallel writers): | [x] | Skills: `carousel-studio-handoff`, `content-factory-ui`, `21st-ui-catalog` |
| 3a | Frontend — **C-carousel-chrome** | `components/studio/workspace/CreateCarouselModal.tsx`; `components/studio/workspace/AgentChatComposer.tsx`; `components/ui/chatgpt-prompt-input.tsx`; **new** `components/ui/button.tsx` (+ `@radix-ui/react-slot`, `class-variance-authority`); **new** segment chrome component (e.g. `components/studio/workspace/CreateCarouselSegment.tsx` or `components/ui/…`) | [x] | Remove bottom handoff/tools; top segment Сценарист\|Дизайнер\|Публикация; Vernatun token map only |
| 3b | Frontend — **C-carousel-agents** | Same modal + composer; wire agent-start / handoff / describe / draw; markdown renderer for agent bubbles; Designer state machine UI; labels «Передать задание» / «Нарисовать» / «Передать на публикацию» | [x] | After Backend modes live. No auto-handoff scriptwriter. Checkmark on segment only after successful handoff |
| 3c | Frontend — **C-carousel-publish** | Same modal Publication step; pattern `components/studio/workspace/RazborPublisherPane.tsx` (**read-only sample**); `lib/studio/carousel-drafts-store.ts`; `lib/schedule/storage.ts` | [x] | **Do not edit** `RazborModal.tsx` / do not break RazborPublisherPane contract. No Publisher agent/chat in Create. «Опубликовать» → draft Ours + schedule slot |
| 4 | Тестировщик | `memory/tickets/C-carousel-*/guards.md`; smokes for agent-chat modes + generate-slides + publish draft/schedule | [x] | Skill `tester`; assert `source: "error"` on fail; no mock success path in Create. Done: guards×3 + regression-guards + static greps + anti_slop OK; no Fixer items |
| 5 | Фиксер | Только red paths from Tester | [x] | No red items from Tester |
| 6 | Деплоер | localhost Studio `/studio/carousel-engine` + `/schedule` | [x] | localhost HTTP 200 @ /studio/carousel-engine |
| 7 | Клиент | Playwright MCP @1440 — **S41** full | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ — `memory/waves/W-2026-10-12-carousel-studio-handoff-client.md` |

## Ticket pointer chains

Каждый тикет ссылается на **этот** файл как канон:

- `memory/tickets/C-carousel-chrome/chain.md` → pointer
- `memory/tickets/C-carousel-agents/chain.md` → pointer
- `memory/tickets/C-carousel-publish/chain.md` → pointer

## Overlap ban

| Surface | Rule |
|---------|------|
| `CreateCarouselModal.tsx` | Один Frontend writer; chrome → agents → publish |
| `app/api/studio/agent-chat/route.ts` | AI Bridge + Backend до FE wire; не parallel FE rewrite route |
| `RazborModal.tsx` / Razbor publisher chat | **Out of scope** — не трогать |
| Pattern copy to other Create modules | **Out of scope** this wave |

## Acceptance gate (Client)

Закрытие волны только после **S41** + guards на все три тикета.
