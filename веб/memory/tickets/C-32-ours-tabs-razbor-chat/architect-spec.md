# Architect spec — C-32

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

В панели **Ours** заменить popup `DraftsPanel` на **inline-вкладки** «Черновики | Опубликовано»; Analyst в Razbor — только детальный разбор карусели (без «предлагаю сценарий»); в каждом agent-pane — текстовый ввод + голос (Web Speech API) для правок агенту.

## Depends

- **C-30** done (Razbor cascade + drafts store). Keep cascade intact; change analyst copy + UI only.
- Wave order: **C-32 → C-33 → C-34**.

## In scope

### 1. Ours inline tabs (replace DraftsPanel popup)

1. Remove / stop using `DraftsPanel` as `role="dialog"` overlay popup over the Ours grid.
2. In `VerticalPostCarousel` (Ours only): header tabs **«Черновики»** | **«Опубликовано»** (`data-testid`: `ours-tab-drafts`, `ours-tab-published`).
3. Tab body replaces the post-grid area **inline** (same panel bounds) — not a mini dialog, not absolute floating card.
4. **Черновики:** list/preview of `CarouselDraft` from `carousel-drafts-store` (reuse list/edit UX from current DraftsPanel content, without modal chrome/close-as-dialog).
5. **Опубликовано:** show existing Ours feed posts (`posts` prop) — current grid behaviour when tab = published.
6. Default tab: `drafts` if drafts.length > 0, else `published` (or keep last user choice in component state — OK either way; lock in decisions).

### 2. Analyst analysis-only

1. In `lib/studio/razbor-pipeline.ts`:
   - Remove / stop calling `proposeScenario` from **analyst** message build.
   - Analyst messages: detailed carousel breakdown only (metrics, slide rhythm, hook strength, CTA, swipe-depth) — enough for Scriptwriter to act.
   - Explicit: **no** phrases like «предлагаю сценарий» / scenario template dump in analyst bubbles.
2. Keep `proposeScenario` only if still needed internally for Scriptwriter cascade seed — **or** move scenario seed into Scriptwriter builder; Analyst must not surface it.
3. Do **not** break C-30 cascade order: Analyst auto → Scriptwriter user action → Designer/Renderer → draft.

### 3. AgentChatComposer (text + voice)

1. New shared component e.g. `components/studio/workspace/AgentChatComposer.tsx`:
   - Textarea / input + Send.
   - Mic button → Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) → transcript appended into input (user edits before send).
   - Fallback when Speech API unavailable: mic disabled + short hint (no crash).
2. Wire into **every** Razbor agent pane (Analyst, Scriptwriter, Designer) under message list.
3. On send: append user message to that pane; optional mock agent ack (deterministic one-liner). Does **not** need live LLM this wave. Scriptwriter send may still also trigger cascade CTA if product keeps primary «Написать сценарий» — composer is for corrections; do not remove cascade CTA unless FE finds them redundant (prefer keep both: CTA = start cascade, composer = free-text correction).

## Out of scope

- Real multi-agent LLM reply to corrections (mock ack OK).
- Brand Kit / DESIGN.md load → **C-33**.
- Settings / aggregator / `agents/` pack → **C-34**.
- CapCut / social publish / DB / migrate reset.
- Changing GenerationDrawer global contract.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Analyst copy + pipeline tweak | Backend | `razbor-pipeline.ts` only; no Prisma |
| Ours tabs + Drafts inline + composer | Frontend | VerticalPostCarousel, DraftsPanel refactor/replace, RazborModal panes |
| Tab / composer micro-motion | Motion | Optional; reduced-motion safe |
| Guards | Tester | Inline tabs + no proposeScenario in analyst + composer present |

## Contracts

### Tabs

| Rule | Value |
|------|-------|
| Location | Inside Ours `VerticalPostCarousel` only |
| Popup | Forbidden (`DraftsPanel` dialog overlay removed) |
| Drafts source | Existing zustand `carousel-drafts-store` |
| Published source | Existing `posts` feed |

### Analyst

| Rule | Value |
|------|-------|
| Content | Analysis only |
| `proposeScenario` in analyst UI text | Forbidden |
| Cascade | Unchanged after Scriptwriter action |

### Composer

| Input | text and/or speech transcript |
| Output | user bubble in that agent pane (+ optional mock ack) |
| Speech | Web Speech API; graceful degrade |

### Invariants

- C-30 cascade still ends in unpublished draft.
- CapCut never from Ours drafts/published tabs.
- No secrets; no DB wipe.

## Acceptance criteria (язык Клиента)

1. В Ours рядом с «Черновики» есть «Опубликовано»; переключение меняет содержимое **внутри** панели, без всплывающего мини-окна.
2. После «Разбор» Analyst пишет подробный разбор карусели и **не** предлагает сценарий.
3. В каждом чате агента есть поле текста и кнопка микрофона; голос попадает в поле и можно отправить правку.
4. Guard: source/UI checks; safety: no DB wipe, no real keys.

## Risks

- Speech API только Chromium/Safari — must degrade, not block acceptance on Firefox.
- Refactor DraftsPanel: regress draft select/edit → re-test C-30 drafts path.
- Accidental removal of cascade CTA while adding composer.

## Mid-flight escalation

Если нужен live LLM на composer или смена статуса draft→published в tab — **стоп** → Architect updates spec (likely spill to C-34 / later ticket).
