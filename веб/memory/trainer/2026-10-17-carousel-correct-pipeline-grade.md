# Trainer grade — 2026-10-17 — carousel-correct-pipeline

`ticket_limit: default≤3` (код ещё не стартовал; сначала 10 Q)

## План хода

1. Запрос: принять correct-пайплайн из `docs/карусель тест/correct/`, **до кода** — 10 уточняющих вопросов; улучшить агентов; plan→act; на шаге писать роль; учесть `@promts`.
2. Режим: усиление команды (skills/rules) + подготовка merge carousel pipeline (Scriptwriter→Designer→diffusion, S53/S54).
3. Не писать prod `app/` на этом шаге.
4. Аудит ролей/skills vs README + пустые 01–06.
5. Грейд; закрыть пробелы skills/plugins.
6. Артефакт grade; proposed chain **после** ответов пользователя.
7. Оркестратор следующий: задать 10 Q пользователю (карточка Trainer).

## Аудит готовности

| Слой | Статус | Заметка |
|------|--------|---------|
| Агенты (registry) | OK | Architect, AI Bridge, Backend, Tester, Fixer, Deployer, Client — есть |
| `carousel-json-contract` S53/S54 | OK | Phase4/5 сильные; **Phase 6** добавлен этим ходом |
| `ai-bridge` / `content-pipeline-agents` | OK→усилены | Correct-doc gate + HITL |
| Critic (05) / vision (04) / sheet (01) | **GAP** | Нет в skills до Phase 6; files **0 bytes** |
| Designer «no invention» | **GAP** | Конфликт с богатыми overlays — Q6 |
| MCP Playwright | OK | Client приёмка без платного MCP |
| Env | n/a | Секреты не трогаем |
| `@promts` / cycle | OK | Клиент финалит «согласовано» |

## Грейд: **C**

Критичный пробел знания: канон 01–06 пустой; семантика correct README расходится с Create-chat / CTA / swipe / panorama skills; код запрещён до 10 ответов.

## Пробелы

| # | Пробел | Роль | Слой | P |
|---|--------|------|------|---|
| 1 | `01`–`06` correct = 0 bytes | Architect / AI Bridge | skill/docs | P0 |
| 2 | Sheet SoT vs Create chat не задокументирован в pipeline skills (до Phase 6) | Architect | skill | P0 |
| 3 | Code critic + vision regen loops отсутствовали | Backend + AI Bridge | skill | P0 |
| 4 | Designer no-invention vs VIRAL/safe-zone overlays | AI Bridge | skill | P1 |
| 5 | Status `needs_*` / `ready` vs Drafts HITL | Architect + Frontend (later) | skill | P1 |
| 6 | S53/S54 merge policy без ответа user | Architect + Client | process | P1 |

## Что добавлено этим ходом

- `plugins/trainer/carousel-correct-pipeline.md` — flow, locks, **10 Q**, chain hint
- `carousel-json-contract` § **Phase 6 Correct-doc** + divergence checklist
- `gap-playbook.md` — 7 строк correct-pipeline
- `plugins/trainer/PLUGINS.md` — карточка
- `ai-bridge/SKILL.md` — Phase6 gate
- `content-pipeline-agents/SKILL.md` — Phase6 row

## 10 вопросов (для Оркестратора → пользователь)

См. полный список в `plugins/trainer/carousel-correct-pipeline.md` § 10 clarifying questions.

## Proposed chain (после ответов на 10 Q)

```text
🎓 Тренер (re-grade если 01–06 заполнены) 
→ 🏗️ Архитектор (spec merge correct + S53/S54; chain.md; plan-then-act; кто на шаге)
→ 🤖 AI Bridge (02/03/04 overlays, placeholders, Designer no-invention per Q6)
→ ⚙️ Backend (sheet/status/critic/vision retries — если в spec)
→ 🧪 Тестировщик (guards critic≤2, vision≤2, needs_review, no auto-publish, S53 traces)
→ 🔧 Фиксер → 🚀 Деплоер (localhost) → 🧑‍💼 Клиент (Playwright; S53; S54 если Q9=да)
```

Frontend/Motion: omit при `shell_freeze`, кроме UI sheet/status если Архитектор откроет.

## Вердикт

Команда готова к **фазе вопросов + плану**: **да**  
Команда готова к **правке prod-кода**: **нет** (ждут ответы + непустые 01–06 или pasted canon)

## Ключевые расхождения correct-doc vs текущие skills

1. Вход: sheet `meetings|useful` + `status=new` vs Create-чат + `requested_slide_count`
2. Есть code-critic + vision text-check loops vs только zod + one-shot draw
3. Designer «только translate» vs rich prompt inject / panorama→slice
4. Статусы `needs_input` / `needs_review` / `ready` vs Drafts vocabulary
5. CTA 1–4 + `swipe_trigger` meta + S54 anchor_ref — в skills есть, в correct README нет (нужен явный merge)
6. Placeholders BRAND/LOGO/CHARACTER/MODE — в correct есть, в skills слабо формализованы до Phase 6
