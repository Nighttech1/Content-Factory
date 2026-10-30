# Chain — C-155 (live agent chat)

> Path lock: **Backend → AI Bridge → Frontend → Tester → Client** (no parallel overlap on modal/API files).  
> Spec: `architect-spec.md` locks **D1–D6**.

**One-liner:** Live `POST /api/studio/agent-chat` (seed prompt + optional override, no brief glue) → wire Create/Razbor → PromptBox + Thinking + drafts persist + Create upsert.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Architect | `architect-spec.md` + this `chain.md` | [x] | D1–D6 locked |
| 2 | Backend | `app/api/studio/agent-chat/route.ts`; `lib/llm/*` chat helper via aggregator; soft-fail mock when no key; never log secrets | [x] | D1: `aggregator-chat.ts` + route (`agentId`/`userMessage`/`history`, soft-fail mock); D4: drafts persist `cf.carousel.drafts.v1`; smoke `scripts/smoke-c155-agent-chat.ts` |
| 3 | AI Bridge | Role→seed map; systemPrompt resolve (seed + client override); sanitize history; **forbid** combat-brief glue; soft-ack copy; prompt hygiene | [x] | D1 route aligned to `{agentRole,messages,systemPrompt}` → `{reply,source}`; soft-ack `agent-chat-soft-ack.ts`; no brief glue |
| 4 | Frontend | `CreateCarouselModal`, `RazborModal` live fetch; remove mock setTimeout when live; `AgentChatComposer` + `components/ui/chatgpt-prompt-input.tsx` PromptBox; stop `composeTopicWithBrief`; `ThinkingIndicator`; `carousel-drafts-store` persist `cf.carousel.drafts.v1`; Create upsertDraft after designer | [x] | 21st id=3035 PromptBox Dark Luxury; D2/D3/D5/D6 + D4 persist; soft-fail stub to `/api/studio/agent-chat` |
| 5 | Tester | `guards.md` + smoke: live/mock paths, no brief glue, persist key, upsert Create, Thinking visible contract | [x] | route smoke live `openai/gpt-4o`; localhost POST `{reply,source:live}`; guards.md |
| 6 | Fixer | _(only if Tester red)_ | [ ] | surgical; no arch change |
| 7 | Deployer | localhost after green | [x] | localhost:3000 already live; route hot-reloaded; no VPS |
| 8 | Client | Playwright MCP @1440 — CreateCarousel + Razbor live/soft-fail, PromptBox, Thinking, drafts persist, Create upsert | [x] | Create live scriptwriter/designer/publisher; Thinking…; drafts «Создать карусель»; no brief glue; PromptBox |

**Handoff rule:** Backend lands route contract first → AI Bridge fills prompt/role resolve → Frontend wires UI → Tester → Client.
