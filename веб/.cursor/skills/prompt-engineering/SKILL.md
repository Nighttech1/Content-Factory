---
name: prompt-engineering
description: >-
  Craft and harden LLM prompts (system/user, zero/few-shot, CoT, chaining,
  ReAct, RAG). Use when writing or revising prompts for models, AI Bridge
  system prompts, tool-calling agents, classification, extraction, code gen,
  or when an agent must prompt another LLM.
---

# Prompt Engineering

Источник канона: [Prompt Engineering Guide](https://www.promptingguide.ai/ru) (DAIR.AI).  
Путь: `.cursor/skills/prompt-engineering/` (`SKILL.md`, `techniques.md`, `templates.md`).

**Обязательно открыть** перед работой с LLM I/O:
- **AI Bridge** — всегда
- **Архитектор** — если в chain есть AI Bridge / контракт промпта / tools / RAG
- **Backend / Кодер** — если код шлёт запрос в LLM или парсит ответ
- **Тестировщик** — если guard/тест на контракт ИИ
- **Фиксер** — если падение в зоне промпта / parse / tools

## Когда читать дальше

| Нужно | Файл |
|-------|------|
| Выбор техники (CoT, ReAct, RAG…) | [techniques.md](techniques.md) |
| Готовые каркасы под наши задачи | [templates.md](templates.md) |

## Алгоритм (всегда)

1. **Цель одной фразой** — что модель должна сделать и чего не должна.
2. **Собери 4 элемента** (не все обязательны, но проверь каждый):
   - **Инструкция** — задача и ограничения
   - **Контекст** — факты, схема, домен (без секретов)
   - **Вход** — вопрос / данные пользователя
   - **Индикатор вывода** — формат (JSON schema, теги, «только метка»)
3. **Выбери режим** (эскалация):
   - простая задача → **zero-shot**
   - нужен формат/тон/класс → **few-shot** (2–5 примеров, тот же формат)
   - многошаговое рассуждение → **CoT** / «Let's think step by step»
   - внешние факты → **RAG** (контекст из retrieval, не выдумывать)
   - tools / поиск / API → **ReAct** (Thought → Action → Observation)
   - слишком большой промпт → **prompt chaining** (подзадачи по цепочке)
4. **Зафиксируй контракт вывода** — парсибельный формат + что делать при неизвестности.
5. **Прогони чеклист** ниже; для прод-промптов — тест/guard (см. `tester`).

## Sprint 9 — upgrade-only / no-pipeline-break (HARD)

`DEV_PLAN` **9.1–9.11** (carousel + reels quality like Claude Code). Промпты/packs/few-shots/critic — **апгрейд на месте**.

| Lock | Правило |
|------|---------|
| **UPGRADE ONLY** | Править существующие system/user packs, few-shots, critic checks, agent-defaults — **не** писать новый пайплайн с нуля |
| **NO PIPELINE BREAK** | Сохранить порядок **Razbor → Scriptwriter → Designer → Draft** (carousel) и **Scriptwriter → Montage/render path** (custom-reels). Не удалять шаги, не схлопывать агентов, не «один мега-промпт вместо mesh» |
| **Scope** | Только `carousel-engine` + `custom-reels`. HeyGen / cartoon / aesthetic / articles / clips-to-reels → **Sprint 23** |
| **No UI shell** / **shell_freeze** | Prompt packs **не** требуют redesign Create/Razbor/Team chrome |
| **No social publish** | Critic/pass-fail → Draft/HITL only; **запрет** publish side-effect |
| **Claude-Code bar (9.8)** | Один сильный pack на карусель + один на рилс; few-shot из golden; optional critic reject: weak hook / empty CTA / purple slop — **fail before Draft**, не soft-mock |
| **Contracts** | Carousel = `carousel-json-contract`; reels = `reels-scriptwriter` — не смешивать JSON |

## Carousel audit reconstruction (2026-10-16) — HARD

Источник: `docs/PROMPT_AUDIT_CAROUSEL_FULL.md` (+ Gemini research). Цель — убрать «лажу» vs Claude-chat без ломки Create shape.

### Phase 1 — prompt hygiene (do first / with AI Bridge)

| Fix | Rule |
|-----|------|
| **Dedupe agent-start** | Request / Context / Rules / mesh systemPrompt / Create overlay **не** повторяют одни HARD-правила 3–4 раза (audit §14 / P5). Один канон-блок + короткие pointers |
| **Paired invariants** | Scriptwriter JSON fields ↔ Designer paint rules в **одной** paired checklist (hook / swipe meta / CTA / visual_prompt / N) — не расходиться между overlay и mesh |
| **CTA sync** | `COMBAT_USER_BRIEFS` CTA **=** catalog **1–4** (comments / subscribe / TG / like+save). **Запрет** «бронь стола / сторис» как боевой CTA (audit P4) |
| **Full JSON few-shots** | Embed **полный** golden JSON (2–3 fixtures) в agent-start / pack — **не** только имена `dark_notes_coffee` (audit P3) |
| **upgrade_only** | Правки в `create-carousel-prompts.ts`, `sprint9-carousel-pack.ts`, `agent-start-bundle.ts`, `agent-defaults.ts` — in place |

### Phase 4 — E2E diffusion render (priority · supersedes Phase3 HTML/CSS-first)

| Fix | Rule |
|-----|------|
| **E2E diffusion** | Primary slide = **image-2** paints **full** 1080×1350: scene **+** readable typography **+** CTA **ON the PNG** |
| **LLM→image inputs** | **Only** Scriptwriter JSON (scenario copy + `visual_prompt`) + **approx** brandbook colors/tokens — no layout markup dump |
| **KILL HTML-overlay-primary** | Playwright/HTML text layer as the main type path = **FAIL** (Client **S53**). Legacy fallback only behind Architect flag |
| **Align craft↔runtime** | Designer overlays must say «bake copy into image prompt» — never «leave blank for HTML later» |

### Model routing (prompt packs must match code)

| Mode | Model |
|------|-------|
| Scriptwriter chat | **Sonnet** (upgrade from Haiku) |
| Designer describe/chat | **Sonnet text** — never image-model id → mini fallback |
| Designer pixels | `openai/gpt-5.4-image-2` only |

### Budget (validation waves)

| Wave | Max new PNG |
|------|-------------|
| Phase4 / S53 | **2 × 3 = 6** |
| Phase5 bake-off / S54 | **3 × 3 = 9** |

Stop + report if overspend. (S44 ≤40 remains absolute ceiling.)

### Phase 5 — Anchor-ref + bake-off (2026-10-17)

| Fix | Rule |
|-----|------|
| **anchor_ref_pipeline** | Cover first → slides 2–N with cover as **reference image**; same visual world |
| **Inject** | `ANCHOR REF` block from `create-carousel-prompts-notes.md` |
| **Compare paths** | `generatedMedia/compare-carousel-bakeoff/{etalon\|e2e_diffusion\|anchor_ref_pipeline\|html_overlay}/…` |
| **Themes** | Armenian **LANGUAGE** topics (different per carousel) |
| **Client** | **S54** — which labeled pipeline closest to etalon |
| **Locks** | `shell_freeze` · `upgrade_only` · `no_pipeline_break` · still Phase4 type-on-PNG |

### Prompt-trace diagnostic (2026-10-16) — Client weak-link

Skill: **`carousel-prompt-trace`**. Folder: **`docs/карусель тест/`** (+ `_templates/`).

| Dump | Must capture |
|------|----------------|
| Scriptwriter | user request · **full** system · **full** user · LLM reply · optional correction · final JSON→Designer |
| Designer | handoff intake · rules/skills · **EXACT** per-slide image prompts (**must** include typography; not HTML-primary skip) · `html_overlay: none` · PNG paths |

**Viral craft:** schema-valid JSON with flat cover/body = FAIL — inject VIRAL CRAFT block from `create-carousel-prompts-notes.md`. Locks: `shell_freeze` · `upgrade_only` · `no_pipeline_break`. Optional env `CAROUSEL_PROMPT_TRACE=1` (Architect). No secrets in MD.

## Жёсткие правила команды

- Нет данных → сказать «неизвестно», не выдумывать сущности.
- Side-effects только через **tools** + подтверждение пользователя (`ai-bridge`).
- Секреты, ключи, PII — не в промпт и не в логи.
- Запись в БД не через «модель решила» — через Backend / премодерацию.
- Для структурированного ответа — schema (Pydantic / JSON Schema), не свободный текст.

## Чеклист качества промпта

- [ ] Явная роль/задача в первой строке инструкции
- [ ] Границы: что запрещено (домыслы, действия вне tools)
- [ ] Разделители для данных (`###`, XML-теги, markdown fences)
- [ ] Формат вывода задан примером или schema
- [ ] Few-shot: примеры **того же формата**, что ожидаешь на инференсе
- [ ] При рассуждении: CoT или цепочка; финальный ответ отделён (например `Final:`)
- [ ] При RAG: «отвечай только по контексту»; цитаты/источники если нужно
- [ ] Температура/режим: детерминизм для классификации/извлечения; выше — для креатива
- [ ] Инъекция: пользовательский ввод — **данные**, не инструкции (см. risks в techniques)

## Анти-паттерны

| Плохо | Лучше |
|-------|--------|
| «Сделай хорошо» | Конкретный критерий успеха + формат |
| Свалка всего в один промпт | Chaining: extract → reason → format |
| Примеры другого формата, чем вывод | Один канонический шаблон I/O |
| «Будь креативен» на классификации | Zero/few-shot + закрытый набор меток |
| Факты «из головы» модели | RAG / tool / «неизвестно» |

## Выход агента

При правке/создании промпта коротко зафиксируй:

```
🤖 **PROMPT:** [техника] · цель · формат вывода · как проверить
```

Путь к файлу промпта + 1–2 критерия приёмки (пример входа → ожидаемый выход).
