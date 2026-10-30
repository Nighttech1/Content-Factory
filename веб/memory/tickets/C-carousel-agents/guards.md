# Guards — C-carousel-agents

Wave: `W-2026-10-12-carousel-studio-handoff` · Scenario: **S41** (agents / describe→draw)

## G1 — Top CTAs only (no auto-handoff)

| Step | Top CTA | Testid |
|------|---------|--------|
| Сценарист | **Передать задание** | `create-handoff-designer` |
| Дизайнер (after describe) | **Нарисовать** | `create-draw-button` |
| Дизайнер (ready + slides) | **Передать на публикацию** | `create-handoff-publication` |

- Scriptwriter does **not** auto-advance to Designer without «Передать задание».
- Composer: `hideTools` + `hideHandoff` (handoff lives in header only).
- Segment checkmark (`create-tab-check-*`) only after successful handoff.

**Live S41:** chat without handoff click → stays on Сценарист; handoff → Designer bubble + describe.

## G2 — No picsum auto on handoff; draw = live API; Create fail = `source:"error"`

- Create calls `postStudioAgentChat` with `surface: "create-carousel"` and modes `chat | handoff | describe | draw`.
- Handoff / draw treat non-`live` as failure (UI error); **no** soft-mock success path in Create.
- Client: `lib/studio/agent-chat-client.ts` — create surface → `source: "error"` on fail (not soft-ack mock).
- Draw → agent-chat `mode: "draw"` → generate-slides with `noMock` / `surface=create-carousel` (see `app/api/studio/agent-chat/route.ts`, `generate-slides/route.ts`).
- `CreateCarouselModal.tsx` must **not** import or embed `picsum.photos` URLs.

**Static:** no `picsum` in CreateCarouselModal; create path `noMock` / `source:"error"` in client + routes.  
**Live S41:** «Нарисовать» → real preview frames (not lorem-only / picsum mock success).

## G3 — Markdown bubble component

- `components/studio/workspace/AgentMarkdownBubble.tsx` exists.
- Testid: `agent-markdown-bubble`.
- Agent messages in Create use `AgentMarkdownBubble` (paragraphs / bold / lists), not a single plain text blob.

**Static:** file + import in CreateCarouselModal.  
**Live S41:** agent reply shows paragraph breaks / markdown structure.

## Class of defect

Regression = auto-handoff scriptwriter, bottom handoff, picsum/mock success on Create draw, or plain-text-only agent bubbles.
