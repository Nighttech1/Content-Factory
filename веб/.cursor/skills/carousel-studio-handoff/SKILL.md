---
name: carousel-studio-handoff
description: >-
  Create Carousel modal: agent segment chrome, explicit handoff, Designer
  describe→draw, Publication step (no Publisher agent), markdown chat, no-mock LLM.
  Pattern for later modules. Use on C-carousel-* / CreateCarouselModal waves.
---

# Carousel Studio Handoff (Create modal pattern)

## When

Окно **«Создать карусель»** (`CreateCarouselModal` / `carousel-engine`). Паттерн потом копировать на другие модули Create.

**S47 Create parity (с Razbor):** modal scroll/capture = dialog not background; placeholder «Сообщение»; no Tools; handoff arrow+agent logo; top **4 rounded people icons** (Architect locks vs Button-segment); preview crop + index `N/M` Century Gothic; short welcome. Канон UI: `content-factory-ui` § Create S47 + Client **S47.C**.

**S50 Create = Razbor UI:** visual chrome **identical** to Razbor except **start agent = Scriptwriter**; Competitors/Ours (source) toggle **higher**; preview **≈1.5×** restored. Client **S50.C**. Prompt quality: `ai-bridge/s50-prompt-hardening.md`.

Skills-пара: `content-pipeline-agents`, **`carousel-json-contract`**, `content-factory-ui`, `ai-bridge`, `21st-ui-catalog`, `client-scenarios` **S41** + **S42** + **S50**.

## Workflow (канон волны)

| Step | UI label | Агент LLM? | Роль |
|------|----------|------------|------|
| 1 | **Сценарист** | да | **Dramaturgy & Hook Engine** → strict JSON (`carousel-json-contract`); markdown chat + fenced JSON; `requested_slide_count` **только** из user N |
| 2 | **Дизайнер** | да | **Layout & Visual Engine** → parse `slides[]` any length; describe→«Нарисовать»→ HTML/Tailwind + PNG; preview |
| 3 | **Публикация** | **нет** (шаг UI) | дата/площадка + **«Опубликовать»** → draft Ours + `/schedule`; metadata caption/hashtags/alt from JSON |

**Удалить агента-публициста** из Create (и из product chrome этого окна). HITL-публикация в соцсеть по-прежнему только после апрува админа — слот календаря ≠ silent IG post.

## Chrome (1.1–1.4)

| Нужно | Запрещено |
|-------|-----------|
| Сверху: **segment** агентов/шагов в стиле shadcn/`Button` variants (реф 21st button variants) | MultiButton / CompactMultiButton как **единственный** agent switcher в Create |
| Справа сверху: отдельная **«Передать задание»** (тот же стиль) | CTA «передать…» **справа снизу** в окне |
| Composer = PromptBox (send + mic) | Кнопка **тулзов** слева снизу; handoff внутри MultiButton footer |
| `components/ui/button.tsx` + deps `@radix-ui/react-slot`, `class-variance-authority` при необходимости | Залить весь `--hu-*` / чужой theme поверх Vernatun Dark Luxury без адаптации токенов |

Токены: map variants → Canvas/Glass/Cobalt/Gold из `content-factory-ui` / `ARCHITECTURE.md`. Tailwind v4 — аккуратно, без global CSS reset бренда.

## Handoff rules (1.4 + 1.8)

| Агент | «Передать задание» | Без кнопки |
|-------|-------------------|------------|
| **Сценарист** | Формирует brief → стартует **Дизайнера** (см. agent-start) | **Не** авто-handoff. Только спросить: понравилось ли / что поправить |
| **Дизайнер** | Кнопка handoff = **«Передать на публикацию»** (не «публицисту») → шаг **Публикация** | Правки описания/слайдов без смены шага |
| **Публикация** | Нет LLM-handoff; есть **«Опубликовать»** | — |

Галка на сегменте исходящего шага — только после успешного handoff (как wave3 tab check).

## Agent-start → LLM (no mock)

При **старте** каждого LLM-агента (вход в шаг / после handoff) приложение шлёт в aggregator:

1. **Запрос** (задача шага / handoff brief)
2. **Контекст** диалога + артефакты предыдущего шага
3. **Правила** агента (mesh/Team rules для content-type)
4. **Skills** агента (uploaded / bound packs)
5. **Plugins** агента
6. **MCP** bindings (website/tools summary — **без** секретов)

Сборка system/context — по спеке Архитектора + `ai-bridge` § Agent-start bundle.  
**Live user turns** в чате по-прежнему: `user` = raw only (`C-155`). Bundle ≠ клеить brief в каждый user turn.

**Запрет:** mock-ответы / lorem «успех» в окне Create, когда aggregator доступен. Soft-fail без ключа → явная ошибка UI, не fake carousel.

## Scriptwriter → Designer artifact (JSON wave)

Handoff brief **must** carry machine-readable carousel JSON per **`carousel-json-contract`** (swipekit-style slides + open-carrusel safe-zone + upload-post metadata). Wave3 one-liner `карусель N · текст · цвета` — недостаточно как единственный контракт.

| HARD | |
|------|--|
| Dynamic N | `requested_slide_count` = user request **only** — never hardcode |
| Vernatun | no infobusiness water; cultural hooks; `swipe_trigger` per slide; cover ≤6–8 words |
| Designer | parses `slides` of **any** length; export `slide_01.png`… |

## Designer flow (1.5)

1. При получении задания от сценариста — **сразу** bubble: «получил задание…» (живой LLM или фиксированный ack + LLM follow-up — lock в spec).
2. LLM получает задачу **что рисовать** = handoff JSON (`slides[]` + `visual_prompt`s), не только prose.
3. Сначала: **краткое описание** что будет на изображениях карусели + предложение нарисовать.
4. Правки пользователя → правим **описание / JSON fields**, не прыгаем сразу в draw.
5. Сверху у Дизайнера (стиль segment/Button): **«Нарисовать»** | **«Передать на публикацию»**.
6. **«Нарисовать»** → Layout engine: HTML/Tailwind frames 1080×1350 (safe Top≥120 Bottom≥160 Sides≥80) → backgrounds from `visual_prompt` → text via HTML fonts → PNGs → bubble «готово…» + **видимые** кадры в **preview справа**.
7. Дальше — правки **по конкретным слайдам**.

### P0 — «готово» + чёрный preview (`C-carousel-preview-black`)

Если LLM/API уже отдал images, а preview чёрный/пустой — **баг wire Frontend** (не «ок, текст есть»). Text-only «готово» ≠ успешный draw. См. `carousel-json-contract` § P0 + Tester **S42**.

## Publication (1.6–1.7)

- Шаг **Публикация** (не агент): выбор даты/площадки по канону schedule/platforms.
- **«Опубликовать»** → карточка карусели в **Черновиках** (Ours) **и** слот в **`/schedule`**.
- **`C-drafts-always` HARD:** черновик **обязан** появиться во вкладке Черновики сразу (persist C-156). Пустой rail после успешного Create = FAIL. Architect может также draft-on-successful-draw — но Publication path **never** optional for drafts.
- Designer render использует **active DESIGN.md** из Settings Embla library (не orphan default).
- Не монтировать pane/чат «Публицист» в Create.
- Live chat Scriptwriter/Designer: **C-155** — `user` = raw only; **не** клеить Team combat brief / baseline «Задание».

## Markdown chat (1.8)

Ответы Сценариста (и Дизайнера-текст) рендерить как **markdown** с абзацами (heading/list/bold OK). Запрет: один сплошной блок без переносов/`\n\n` spacing в UI.

## Pattern for other modules

После приёмки Create carousel: тот же chrome (segment + top-right handoff + no bottom tools/handoff) + module-specific middle agent + terminal **Публикация** step. Не копировать Publisher-агента обратно.
