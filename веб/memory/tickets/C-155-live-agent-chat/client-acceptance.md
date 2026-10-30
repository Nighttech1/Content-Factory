# Client acceptance — C-155

**Вердикт: ПРИНЯТО** (Playwright MCP @1440, localhost:3000)

## Доказательства

1. **Live chat** — CreateCarousel: сценарист / дизайнер / публицист → `POST /api/studio/agent-chat` `source:live`, ответы не mock-ack.
2. **System prompt из mesh** — request body `systemPrompt` из настроек агента (`Пиши тексты слайдов…`), user message без `Бриф:`.
3. **PromptBox** — Attach / Tools / Mic / Send в composer.
4. **Thinking…** — status + indicator во время ответа дизайнера.
5. **Черновики** — после handoff дизайнеру вкладка «Черновики» показывает «Создать карусель»; `localStorage` `cf.carousel.drafts.v1` count=1, 3 slides.

Скрины: `accept-create-live.png`, `accept-drafts.png`.
