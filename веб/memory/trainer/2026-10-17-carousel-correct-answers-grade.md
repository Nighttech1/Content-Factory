# Trainer grade — 2026-10-17 — carousel-correct-answers

`ticket_limit: default≤3` (полная очередь correct — после Architect; UI+Bridge+Backend могут идти одной волной если user скажет «до конца»)

## План хода

1. Запрос: пользователь ответил на **10 Q** по correct carousel pipeline → перегрейд + усиление skills/rules (не prod app/).
2. Зафиксировать locks из ответов (sheet⊕Create, Brand+Пейзажи, hero, Logs+RED, Publicist, vision≤2, critic+zod, full replace, S55 supersede S54 bake-off, CTA/swipe KEEP).
3. Clarification для Оркестратора: что писать в **01–06** (таблица из README) — юзер не понял.
4. Preflight: **подтвердить видимость Google Sheet** до localhost fill-тестов.
5. Proposed chain: Architect → Frontend + AI Bridge + Backend → Tester → Fixer → Deployer → Client (S55).
6. Артефакт этого файла + обновления skills/plugins/gap-playbook/client.

## Аудит готовности

| Слой | Статус | Заметка |
|------|--------|---------|
| 10 answers | **LOCKED** | см. card § User answers |
| `01`–`06` correct files | **EMPTY** | P1 — fill via Orchestrator Clarification; не paste empty |
| Live Sheet URL | given | visibility **unconfirmed** this turn (WebFetch timeout) → Backend preflight |
| Phase 6 skills | **updated** | answers-locked |
| Frontend Brand/Landscapes/Logs | skill ready | code = next wave |
| MCP Playwright | OK | Client S55 |
| Env / secrets | n/a | sheet key только `.env` |

## Грейд: **B**

Ответы снимают freeze на Architect/spec. Остаётся P1: пустые 01–06 + неподтверждённая видимость Sheet. Можно идти в волну с plan-then-act; промпты 02–04 не копировать из нулевых файлов.

## Пробелы

| # | Пробел | Роль | Слой | P |
|---|--------|------|------|---|
| 1 | `01`–`06` = 0 bytes; юзер не понял содержимое | Orchestrator → user / AI Bridge draft | docs | P1 |
| 2 | Sheet visibility не подтверждена агентом | Backend / Architect | env/api | P0 preflight |
| 3 | Prod ещё на старом invent draw | AI Bridge + Backend | code (next) | P0 after spec |
| 4 | Settings Brand / Landscapes / Logs / RED отсутствуют в UI | Frontend | code (next) | P0 after spec |

## Что добавлено этим ходом

- `plugins/trainer/carousel-correct-pipeline.md` — answers locked + Clarification 01–06 + chain
- `carousel-json-contract` Phase 6 — answers locked / S55 supersede / Brand·hero·Publicist
- `gap-playbook.md` — новые строки Phase6
- `ai-bridge` · `content-pipeline-agents` · `create-carousel-prompts-notes` Phase6
- `content-factory-ui` — Settings **Бренд** + **Пейзажи**
- `xyflow-agent-mesh` — tab **Логи** + RED perimeter + Publicist auto\|manual
- `backend` — Phase6 sheet sync / schedule / status + visibility preflight
- `client-scenarios` **S55** · `client.mdc` §21
- `plugins/trainer/PLUGINS.md` + e2e/bakeoff cards note

## Clarification text (Оркестратор → пользователь, Q2)

> В папке `docs/карусель тест/correct/` сейчас заполнен только **00_README** (общая схема). Файлы **01–06** пустые — это не «ещё шесть README», а **готовые тексты**, которые команда потом вставит в код и в ИИ-агентов. Нужно (вами или черновиком команды на ревью) заполнить:
>
> 1. **01_sheet_schema** — какие колонки в Google-таблице, две вкладки meetings/useful, статусы, slides, cta_type, колонка **hero**, темы и флаги (снять со [живой таблицы](https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls)).
> 2. **02_scriptwriter_prompt** — системный промпт Сценариста + два режима.
> 3. **03_designer_prompt** — системный промпт Дизайнера + формат `image_prompt` (ничего от себя).
> 4. **04_text_check_prompt** — промпт vision-проверки текста на картинке.
> 5. **05_critic_rules** — правила для **кода** (не ИИ), дополняют строгую проверку JSON.
> 6. **06_brand_and_palette** — название бренда, логотип, цвета bg/text/accent/muted.
>
> Если промпты писать не хотите — скажите «черновик команде», AI Bridge набросает 02–04/06, вы только подтвердите.

## Proposed chain

```text
🎓 Тренер (done — grade B)
→ 🏗️ Архитектор (spec: full correct replace; Brand→Landscapes; Logs+RED; Publicist; sheet⊕Create; status; chain.md; plan-then-act)
→ 🎨 Frontend (Settings Бренд after Дизайн; Пейзажи; Team agent вкладка Логи; RED perimeter)
→ 🤖 AI Bridge (02/03/04 STRICT correct; critic supplements zod; vision≤2→needs_review; CTA 1–4 + swipe KEEP; fill/draft 01–06)
→ ⚙️ Backend (confirm Sheet visible FIRST → sync; schedule→drafts; status machine; Publicist auto|manual)
→ 🧪 Тестировщик (guards: critic+zod, vision≤2, needs_review, hero, Logs/RED, S55)
→ 🔧 Фиксер → 🚀 Деплоер (localhost) → 🧑‍💼 Клиент (Playwright S55; type-on-PNG; S54 bake-off waived)
```

Не параллелить overlapping paths без Architect. Motion omit unless Architect opens motion ticket.

## Вердикт

Команда готова к **Architect + волне имплементации**: **да** (грейд B)  
Команда готова **paste пустых 01–06 в prod**: **нет**  
**Обязательно до fill-тестов:** подтвердить видимость Google Sheet.
