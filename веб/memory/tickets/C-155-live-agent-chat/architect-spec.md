# Architect spec — C-155 (live agent chat)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Closes C-145 wire gap #1 (Razbor / agent chat → aggregator).  
> **Supersedes C-140 D4** for agent-chat send paths: user message **must not** glue combat brief.

## Goal

Подключить живой LLM-чат агентов Студии (CreateCarousel + Razbor) через `POST /api/studio/agent-chat` → Polza/OpenAI-compatible aggregator; убрать mock `setTimeout` replies при наличии ключа; обновить composer (PromptBox, без brief glue); persist черновиков карусели; ThinkingIndicator на ожидании; CreateCarousel upsert draft после дизайнера.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 API** | `POST /api/studio/agent-chat` body: `{ agentRole: "scriptwriter" \| "designer" \| "publisher" \| "analyst" \| "razbor", pipelineId, messages: ChatMessage[], moduleId?: string, systemPrompt?: string, modelConfig?: { model, temperature, maxTokens } }`. Server resolves baseline `systemPrompt` + `modelConfig` from **mesh seed** (`seedAgentsForPipeline(pipelineId)` + role→agentId map). Client **may** send `systemPrompt` and/or `modelConfig` overrides (edited Team inspector / local store snapshot). Prefer: seed baseline + allow **override `systemPrompt`** (and model fields if sent) from client. **User `messages[].content` NEVER includes combat-brief glue** (`composeTopicWithBrief` / `---\nБриф:`). Secrets never logged. |
| **D2 Live modals** | `CreateCarouselModal` + `RazborModal` call live chat for those agents. **Remove** mock `setTimeout` agent replies when aggregator configured (`AGGREGATOR_API_KEY` / resolveAggregatorEnv). Soft-fail: if no key or LLM error → short mock ack (existing MOCK_ACK tone OK), UI stays usable. Do not throw blank chat. |
| **D3 Composer** | `AgentChatComposer`: **stop** `composeTopicWithBrief` on agent-chat sends (`moduleId` no longer appends brief). Replace input chrome with **PromptBox** from `components/ui/chatgpt-prompt-input.tsx` (create/adapt from 21st if missing; retokenize Dark Luxury). Keep product contracts: send + mic (Web Speech) + handoff («Передать задание»); stable testids `agent-chat-composer` / `agent-chat-input` / `agent-chat-actions` (or documented aliases). Mesh User combat brief remains on Team User card only — not glued into agent user turns. |
| **D4 Drafts persist** | `carousel-drafts-store`: zustand **persist** → `localStorage` key **`cf.carousel.drafts.v1`**. Hydrate safely (no wipe of existing session drafts; SSR-safe). |
| **D5 Thinking** | New `ThinkingIndicator` component: **9-cube** grid assemble/disassemble loop + shimmer label **«Thinking...»** to the **left** of cubes. Show in chat pane **while awaiting** LLM response (live fetch in flight). `prefers-reduced-motion` → static cubes or label-only OK. |
| **D6 Create upsert** | `CreateCarouselModal` **must** `upsertDraft` after designer produces slides (parity with `RazborModal` designer path). Draft appears under «Наши» / drafts rail after designer success. |

## Role → seed agent map

| `agentRole` (API) | Mesh seed id | Notes |
|-------------------|--------------|-------|
| `scriptwriter` | `copywriter` | Carousel / Razbor сценарист |
| `designer` | `designer` | |
| `publisher` | `publisher` | Chat OK (wave2); schedule pane unchanged |
| `analyst` | `analyst` | Razbor lane / analytics naming — not Разборщик |
| `razbor` | `razbor` | Разборщик; only when pipeline has razbor seed |

Unknown `agentRole` / missing seed agent → `400`. Invalid `pipelineId` → `400`.

## Contracts

```ts
// Request
type AgentChatRole =
  | "scriptwriter"
  | "designer"
  | "publisher"
  | "analyst"
  | "razbor";

type AgentChatMessage = {
  role: "user" | "assistant" | "system"; // client sends user/assistant history only; server injects system
  content: string;
};

type AgentChatRequest = {
  agentRole: AgentChatRole;
  pipelineId: string; // MeshPipelineId
  messages: AgentChatMessage[]; // conversation turns; NO brief glue in user content
  moduleId?: string; // optional studio module context (logging / future tools) — NOT brief glue
  systemPrompt?: string; // override edited inspector prompt
  modelConfig?: {
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
};

// Response
type AgentChatResponse = {
  reply: string;
  model: string;
  source: "live" | "mock";
};
```

### Server algorithm (Backend + AI Bridge)

1. Validate body (role, pipelineId, messages non-empty last user turn).
2. `resolveAggregatorEnv()` — if null → `{ source: "mock", reply: softAck(role), model: "mock" }` **200** (soft-fail).
3. Load seed agent via map; baseline `systemPrompt` / `modelConfig`.
4. Apply client overrides: `systemPrompt` if non-empty string; model/temp/maxTokens if provided.
5. Build OpenAI-compatible messages: `[{ role: "system", content: resolvedSystem }, ...sanitizedHistory]` — strip any client `system` from history; do **not** append combat brief.
6. `POST` aggregator `/chat/completions` (reuse `lib/llm/aggregator` URL helpers; prefer thin shared helper — do **not** force `response_format: json_object` unlike Analyst insights).
7. Return `{ reply, model, source: "live" }`. On upstream failure → soft mock ack `source: "mock"` (or `502` only if product prefers hard fail — **default soft-fail 200 mock** for Studio UX parity with C-154 images).

### Client algorithm (Frontend)

1. On send: append user bubble with **raw topic text only** (no brief).
2. Show `ThinkingIndicator` in that agent pane.
3. `POST /api/studio/agent-chat` with role + pipelineId + messages history + optional overrides from mesh agent store (if hydrated client-side).
4. Append assistant reply; hide Thinking.
5. CreateCarousel designer success path → build `CarouselDraft` → `upsertDraft` (D6); Razbor already upserts — keep.

## In scope

| Path | Owner |
|------|--------|
| `app/api/studio/agent-chat/route.ts` (new) | Backend |
| Shared chat-completions helper under `lib/llm/` (optional extract from analyst) | Backend / AI Bridge |
| Prompt assembly / role map / no-brief invariant | AI Bridge |
| Soft-ack copy per role | AI Bridge (+ FE fallback strings OK) |
| `CreateCarouselModal.tsx` live wire + upsertDraft | Frontend |
| `RazborModal.tsx` live wire (replace MOCK_ACK/`setTimeout` when live) | Frontend |
| `AgentChatComposer.tsx` + `components/ui/chatgpt-prompt-input.tsx` | Frontend |
| `ThinkingIndicator` (+ wire in modals) | Frontend |
| `lib/studio/carousel-drafts-store.ts` persist `cf.carousel.drafts.v1` | Frontend |
| Guards + smoke | Tester |
| Playwright acceptance | Client |

## Out of scope

- Image generation (C-154) — keep separate `generate-slides`
- Mesh UI rewrite / inspector tabs (C-138…C-145)
- Re-introducing brief glue into agent user messages
- Prod/VPS deploy
- Prisma persistence of chat transcripts
- Settings LLM UI (keys stay env-only)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Route + aggregator call + soft-fail | **Backend** | `backend`, `safe-db-migrations` N/A (no DDL) |
| System prompt resolve, role map, message sanitize, no-brief | **AI Bridge** | `ai-bridge`, `prompt-engineering`, `content-pipeline-agents` |
| Modals, composer PromptBox, ThinkingIndicator, persist, upsert | **Frontend** | `content-factory-ui`, `21st-ui-catalog`, `web-motion-engine` (cubes micro only; no separate Motion role in chain) |
| Guards | **Tester** | |
| Live S-scenario | **Client** | Playwright MCP @1440 |

## Path lock (no parallel overlap)

**Sequential only:** Backend → AI Bridge → Frontend → Tester → Client.

- Backend owns `app/api/studio/agent-chat/**` + `lib/llm/**` chat helper.
- AI Bridge may edit prompt helpers / role map module under `lib/studio/` or `lib/mesh/` **after** Backend route skeleton exists; do not race Frontend on modals.
- Frontend owns modal/composer/store UI files; must not redefine API contract.
- Do **not** parallel second writer on `RazborModal` / `CreateCarouselModal` / `AgentChatComposer`.

## Acceptance (язык Клиента)

1. С ключом агрегатора: в Razbor / CreateCarousel отправка сообщения агенту даёт **живой** ответ (не фиксированный mock через ~300ms timeout).
2. Без ключа: короткий mock ack, чат не ломается; нет пустого экрана / необработанной ошибки.
3. В теле user-сообщения **нет** блока `Бриф:` / combat brief glue (проверить Network payload или UI bubble).
4. Composer выглядит как PromptBox (chatgpt-prompt-input), токены Dark Luxury; mic + «Передать задание» работают.
5. Пока ждём ответ — виден ThinkingIndicator (9 кубов + «Thinking...» слева).
6. После дизайнера в **CreateCarousel** черновик появляется в drafts / «Наши» (upsert), как в Razbor.
7. Reload страницы: carousel drafts восстанавливаются из `localStorage` ключа `cf.carousel.drafts.v1`.
8. Секреты ключа не в UI, не в memory tickets, не в логах.

## Risks

- C-140 guards expect `composeTopicWithBrief` — Tester must **update** guards: agent chats = no glue; mesh User brief store remains for Team card only.
- Seed `systemPrompt` may be placeholder (`Загрузка: …md`) — AI Bridge should prefer real prompt text from pack/defaults when seed is stubby; client override wins when inspector edited.
- Long LLM latency → ThinkingIndicator mandatory; abort on modal close.
- CreateCarousel still uses picsum/handoff slide gen unless wired to C-154 `generate-slides` — **out of scope** unless already present; D6 only requires upsert of whatever slides exist after designer step.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение. Не расширять в image-gen или mesh rewrite без нового тикета.
