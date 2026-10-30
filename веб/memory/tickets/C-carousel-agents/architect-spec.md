# Architect spec — C-carousel-agents (1.4, 1.5, 1.8)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-studio-handoff`.  
> Canon: `.cursor/skills/carousel-studio-handoff/SKILL.md` + `ai-bridge` § Agent-start.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-studio-handoff/chain.md`.  
> Depends on: **C-carousel-chrome** chrome shell; Backend/AI Bridge modes before FE live wire.

## Goal

Живые LLM-агенты Create (Сценарист → Дизайнер): explicit handoff top-right; **agent-start bundle**; Designer **describe→draw** state machine; markdown в чате; **no auto-handoff**; при fail — `source: "error"`, не mock.

## Covers

| Item | Lock |
|------|------|
| **1.4** | Top-right «Передать задание» (Сценарист); Designer handoff = «Передать на публикацию»; checkmark only after success |
| **1.5** | Designer flow: ack → описание → правки описания → «Нарисовать» → preview |
| **1.8** | Markdown paragraphs in agent replies; Scriptwriter **asks** for edits — **no** auto-handoff |

## Designer state machine (lock)

```text
awaiting_brief → describing → drawing → ready → publication
```

| State | Meaning | UI |
|-------|---------|-----|
| `awaiting_brief` | Нет handoff от Сценариста | Preview empty; Designer waiting |
| `describing` | LLM пишет/правит план кадров | Chat bubbles; **«Нарисовать»** enabled when description present |
| `drawing` | generate-slides in flight | Thinking / disabled draw; no mock slides |
| `ready` | Слайды в preview | Per-slide edits OK; **«Передать на публикацию»** enabled |
| `publication` | Step switch to Публикация | Owned by publish ticket after handoff |

**Transitions:**

1. Scriptwriter successful «Передать задание» → Designer enters `describing` (+ agent-start).
2. User edits → stay `describing` (update last agreed description).
3. «Нарисовать» → `drawing` → on success `ready` (preview right); on fail stay `describing`, show error (no fake images).
4. «Передать на публикацию» (only from `ready`, or allow from `describing` if product allows empty preview? **Lock: only from `ready`** after at least one successful draw) → `publication` step.

## Agent-start bundle contract (lock)

При **старте** LLM-агента (после handoff / first open of that agent step) приложение шлёт в aggregator как **system/context** (не как live user turn):

| # | Part | Content |
|---|------|---------|
| 1 | **request** | Задача шага / handoff brief |
| 2 | **context** | Диалог + артефакты предыдущего шага |
| 3 | **rules** | mesh/Team rules for `(agent, contentType=carousel)` |
| 4 | **skills** | bound/uploaded skill pack names + summaries |
| 5 | **plugins** | bound plugins |
| 6 | **MCP summary** | website/tools bindings — **имена** env keys / tool ids, **без секретов** |

**C-155 invariant:** live user turns = **raw only**. Bundle **не** клеить в каждый `user` message.

### API preference

Расширить `POST /api/studio/agent-chat`:

```ts
mode?: "chat" | "handoff" | "describe" | "draw" | "agent-start"
// Prefer: chat | handoff | describe | draw
// agent-start may alias handoff/first-open bundle assembly
```

| Mode | Behavior |
|------|----------|
| `chat` | Existing C-155 chat (raw user + mesh systemPrompt) |
| `handoff` / `agent-start` | Build full bundle → system/context; kick agent |
| `describe` | Designer plan pass (text only) |
| `draw` | Use **last agreed description** → call generate-slides path; reply bubble «готово…» |

**Fail contract (Create supersedes C-155 soft mock for this surface):**

```ts
type AgentChatResponse = {
  reply?: string;
  model?: string;
  source: "live" | "error"; // NO "mock" success for Create carousel modes
  error?: { code: string; message: string }; // user-safe RU message
};
```

- Aggregator missing / upstream fail / draw fail → `source: "error"` + explicit UI error.  
- **Запрет:** lorem «успех», fake carousel, soft-ack disguised as success.

### Soft-ack note

Fixed Designer ack bubble «получил задание…» **allowed** as **UI-local** first line **or** first live `handoff` reply — lock for implementers: prefer **one** live handoff response that includes ack + short description; if network fail → error, not mock ack that pretends LLM ran.

## Labels (lock)

| Surface | Exact copy |
|---------|------------|
| Scriptwriter top-right | **«Передать задание»** |
| Designer top | **«Нарисовать»** + **«Передать на публикацию»** |
| Steps | **Сценарист \| Дизайнер \| Публикация** |
| Publication CTA | **«Опубликовать»** (publish ticket) |
| Forbidden | «Публицист» agent; «передать публицисту» |

## Decision locks (continued)

| Lock | Decision |
|------|----------|
| **D-agents-1 No auto-handoff** | Scriptwriter never advances to Designer without user click «Передать задание». After reply, ask liked/edits. |
| **D-agents-2 Checkmark** | Segment check on outgoing step only after **successful** handoff (API `source: "live"`). |
| **D-agents-3 Markdown** | Render Scriptwriter + Designer **text** bubbles as markdown (headings/lists/bold OK). Prefer `react-markdown` (+ `remark-gfm` if needed). Ban single solid block without paragraph spacing. |
| **D-agents-4 Draw path** | `draw` mode → `POST /api/studio/carousel-engine/generate-slides` with last agreed description (+ pipeline/module context). Reuse C-154 wire; no picsum mock when keys present. Fail → error source. |
| **D-agents-5 Preview** | Right pane empty until first successful draw. Then L/R beside preview (existing C-131 crossfade OK). |
| **D-agents-6 Mesh defaults** | Read rules/skills/plugins/MCP from `lib/mesh/agent-defaults.ts` (+ client mesh store overrides if hydrated). |

## In scope

| Path | Owner |
|------|--------|
| `app/api/studio/agent-chat/route.ts` | Backend (+ AI Bridge prompts) |
| `lib/studio/agent-chat-client.ts` | Backend/FE shared client modes |
| `lib/studio/agent-chat-soft-ack.ts` | AI Bridge — Create must not treat as success; error path |
| `app/api/studio/carousel-engine/generate-slides/route.ts` | Backend (draw) |
| `lib/mesh/agent-defaults.ts` | AI Bridge/Backend read for bundle (minimal edits) |
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| `components/studio/workspace/AgentChatComposer.tsx` | Frontend |
| `components/ui/chatgpt-prompt-input.tsx` | Frontend if needed |
| Markdown bubble component (new OK) | Frontend |

## Out of scope

- Chrome segment primitive (done in **C-carousel-chrome**; wire labels/CTAs here)
- Draft + schedule publish (**C-carousel-publish**)
- RazborModal Publisher agent changes
- Silent Instagram post (HITL unchanged)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Bundle + prompts + no-mock semantics | **AI Bridge** | First in chain |
| Route modes + generate-slides + error source | **Backend** | After AI Bridge |
| State machine UI + markdown + CTAs | **Frontend** | After Backend |

## Contracts (request sketch)

```ts
type AgentChatMode = "chat" | "handoff" | "describe" | "draw";

type AgentChatRequest = {
  agentRole: "scriptwriter" | "designer"; // Create: no publisher
  pipelineId: string;
  mode: AgentChatMode;
  messages: Array<{ role: "user" | "assistant"; content: string }>; // raw history for chat
  moduleId?: "carousel-engine";
  // handoff / agent-start:
  handoffBrief?: string;
  priorArtifacts?: { script?: string; description?: string; slideUrls?: string[] };
  // describe/draw:
  agreedDescription?: string;
  systemPrompt?: string;
  modelConfig?: { model: string; temperature?: number; maxTokens?: number };
};
```

Server builds system block from bundle parts when `mode` ∈ `handoff|describe|draw` (and first-open).  
Secrets never in response/logs.

## Acceptance criteria (язык Клиента / S41)

1. Сценарист отвечает **с абзацами/markdown**, не сплошным блоком.
2. Без клика «Передать задание» шаг **не** прыгает на Дизайнера; агент спрашивает правки.
3. После handoff — Дизайнер: bubble про получение задания + описание кадров; видны **«Нарисовать»** / **«Передать на публикацию»**.
4. «Нарисовать» → справа реальные кадры (не mock lorem-only); при ошибке — явная ошибка, не фейковый успех.
5. Галка на сегменте исходящего шага — только после успешного handoff.

## Risks

- C-155 soft `source: "mock"` still on route — Create modes must branch to `error`; Razbor may keep soft-fail until own ticket (do not silently break Razbor chat).
- Bundle size / token limits — summarize skills/plugins/MCP; truncate history with explicit policy in Backend notes.
- Markdown XSS — sanitize / safe react-markdown defaults.

## Mid-flight escalation

Если mode enum / state machine / fail source спорят с C-155 Razbor → стоп → Архитектор уточняет dual-path (Create strict error vs Razbor soft) в spec → продолжение.
