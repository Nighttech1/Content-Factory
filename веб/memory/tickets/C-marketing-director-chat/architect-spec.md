# Architect spec — C-marketing-director-chat

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-14-carousel-ui-marketing`.  
> Canon: `content-factory-ui` § Marketing Director S47; `ai-bridge/marketing-director-prompt.md`; `frontend.mdc` §21.  
> Shared chain: `memory/waves/W-2026-10-14-carousel-ui-marketing/chain.md`.

## Goal

Новая секция **Маркетинг-директор**: ChatGPT-like UI (projects rail + chat), AIInput, Haiku + GraphQL/search tools.

## Covers

| Item | Lock |
|------|------|
| IA | Route **`/marketing`**; entry from Studio («Маркетинг-директор»); sidebar C-136 unchanged |
| Layout | Left **projects** rail; right chat; welcome center → after first send **composer sinks** down |
| Composer | Adapt **AIInput** (user/21st) → `components/ui/ai-input.tsx`; Dark Luxury + Century Gothic |
| LLM | **Haiku 5.5** (+ thinking) via Polza aggregator — same catalog as Scriptwriter |
| Tools | **`app_graphql`** + **`app_search`** (Backend); AI Bridge schemas; no fake «я погуглил» |
| HITL | Mutating tools require confirm; no social publish bypass |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-IA-1** | `/marketing` App Router page (see wave chain) |
| **D-tools-1** | Exact tool names `app_graphql` / `app_search` |
| **D-chat-1** | Payload parity C-155: `user` = raw only; `system` = Marketing Director systemPrompt |
| **D-chat-2** | Projects persist: localStorage key `cf.marketing.projects` (v1) until Backend projects API exists |
| **D-chat-3** | Motion owns sink animation 120–200ms after FE shell |

## In scope

| Path | Owner |
|------|--------|
| `app/marketing/**` (page + layout shell) | Frontend |
| `components/marketing/**` (rail, chat, welcome) | Frontend |
| `components/ui/ai-input.tsx` | Frontend |
| Studio entry link/tile to `/marketing` | Frontend |
| API routes / tool executors for graphql+search | Backend |
| System prompt + tool wiring Haiku | AI Bridge |

## Out of scope

- Feed / Razbor / Create chrome tickets
- Replacing Scriptwriter/Designer pipeline
- Prod/VPS

## Layers / owners

| Layer | Role | Order |
|-------|------|-------|
| Shell UI | Frontend | After C-razbor-create |
| Sink motion | Motion | After FE |
| Tool endpoints | Backend | Before or with AI Bridge |
| Prompt + tools | AI Bridge | After tool names stable |

## Acceptance criteria (S47.D)

1. Открыл Маркетинг-директор @1440 — projects left, welcome center, AIInput.
2. После первого send input уходит вниз; Century Gothic everywhere.
3. Ответ идёт через Haiku; tool call GraphQL/search реален (не mock-only).

## Risks

- Sidebar IA creep — **forbid** new root nav item without Client.
- Tool over-permission — default read-only.

## Mid-flight escalation

Route/IA change → стоп → Architect updates **D-IA-1**.
