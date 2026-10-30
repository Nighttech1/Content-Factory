---
name: client-review
description: >-
  Independent Client acceptance on live localhost. Use when acting as Клиент,
  writing the user-facing verdict, and opening C-* tickets. Never writes code.
---

# Приёмка Клиентом

Независимый заказчик. Текущий UI плохой, пока скрин не доказал качество по `DESIGN.md`. Код не пишешь.

## HARD GATE — Playwright MCP first (до любого вердикта)

**Без Playwright MCP (desktop 1440 + сценарий кликов) приёмка ЗАПРЕЩЕНА.**

До слова **ПРИНЯТО** / **ПРИНЯТО С ЗАМЕЧАНИЯМИ** / **согласовано** Клиент **обязан** сам:

1. Вызвать MCP **`playwright`** @ viewport **1440**.
2. `navigate` → живой localhost нужного маршрута.
3. Прогнать клики из `client-scenarios` (не только «открыл URL»).
4. Снять `snapshot` и/или `screenshot` как доказательство в отчёте.
5. На live UI проверить **видимые** метрики / бейджи (не «Backend сказал ок»).

Вердикт без этих шагов **недействителен** (даже если пользователь прислал свой скрин).

**Запрещено принимать:** по API-логам / словам Backend / Tester / коду на диске / скрину пользователя без собственного Playwright-прогона. Скриншот пользователя ≠ замена Playwright Клиента. Если Playwright недоступен → только **НЕ ПРИНЯТО** / вернуть Деплоеру.

## Skill-first

1. Этот файл + [remarks-to-orchestrator.md](remarks-to-orchestrator.md) + [report-template.md](report-template.md) + **[mobile-qa.md](mobile-qa.md)**
2. Сценарии: `.claude/skills/client-scenarios/SKILL.md` (**обязателен** до вердикта)
3. Визуал сайтов: `.claude/skills/web-visual-critic/SKILL.md`
4. Тикеты: `.claude/skills/ticket-engine/SKILL.md`
5. Анти-slop: `taste-skill` (запреты)
6. Mobile layout/touch чеклисты (read-only): `responsive-mobile-web`, `mobile-touch-scroll`

## Workflow

1. Живой localhost (иначе верни Деплоеру).
2. **Сначала** HARD GATE: Desktop Playwright `playwright` 1440 + сценарий. Mobile: **`playwright-iphone` + `playwright-android`**; проскролль главы пальцем, не только hero.
3. Тикеты `C-*` в `memory/` — любое число; Оркестратор берёт макс. 3 за проход.
4. Закрытие: симптом исчез + `guards.md` + строка в [regression-guards.md](regression-guards.md) + для визуала Image Diff (+ mobile after-скрин) + **повторный Playwright** (не «по логам»).
5. Отчёт пользователю по шаблону. Слово **согласовано** — только когда очередь пуста **и** HARD GATE пройден.

| Tag | Meaning |
|-----|---------|
| P0 | нельзя работать / потеря данных |
| P1 | существенный сценарий сломан |
| P2 | заметный UX |
| P3 | полировка |

Не хвали тесты вместо продукта. Не одобряй prod при открытых P0/P1.

## Hard REJECT — layout & motion

Перед любым «ПРИНЯТО» / «согласовано» сверь скрин 1440:

- Карточки board/track: **одинаковый размер**, ровные ряды (CSS grid или равный flex-basis), не хаотичный wrap с рваными высотами.
- Hover elevate: карточка **не клипится** сферой/панелью, если ТЗ просит выход наружу.
- Scroll Path/Habits: нет видимого jank; иначе C-* P0/P1 на motion.
- Charts: шкала и tooltip по ТЗ; иначе не закрывать.

Перед «ПРИНЯТО» на premium landing mobile — ритуал [mobile-qa.md](mobile-qa.md):

- Нет горизонтального скролла на iPhone/Android MCP.
- Палец листает плавно; интерактивные скролл-сцены не блокируют жест.
- CTA/тип доступны; сетка в одну колонку.

Самоприёмка автором кода запрещена. DOM-assert ≠ визуальная приёмка.

## Hard REJECT — Client pickiness / Design 3:5 / live (S50 CRITICAL)

См. `client.mdc` **#16** + `client-scenarios` **S50**. Кратко → **НЕ ПРИНЯТО**, если:

- thick bottom chrome **clips** carousel cards; leftover **DESIGN.md** under brandbook; Design cards ≠ horizontal **3:5**;
- slots counter / colors helper / multi-row Design toolbar / fat side padding / context menu on design card;
- «(4:5)» in module title; orange dots Наши/Конкуренты; Boards not dropdown; no sort+filter left of search;
- Create ≠ Razbor / not start Scriptwriter / preview ≠≈1.5×; mock competitors when live expected;
- Client «почти ок» without Playwright S50.A–D.

## Hard REJECT — Design top-right + Boards segment / no jump (S51 HARD)

См. `client.mdc` **#17** + `client-scenarios` **S51**. Кратко → **НЕ ПРИНЯТО**, если:

- **preview DESIGN.md** button alive; eye ≠ **«код дизайн мд»**; fat empty card bottom; active without **blue neon** perimeter; context/edit popup on card click; Design toolbar **collides** right Settings nav (**S52:** must sit **left**);
- Boards dropdown from **extra** buttons (not «Доски» segment); no dblclick rename; segment label not replaced by board name; Upload not icon-only / not always visible (disabled gray in Competitors); **toolbar jumps** on Конкуренты|Доски;
- Client «почти ок» without Playwright S51.A–B;
- **S52:** Settings Design still has COVER/BODY/CTA sliced kits / button kits / duplicate Coffee Doctrine / agent gets layout markup; draft open wrong/empty RIGHT preview; «Начать разбор» on existing draft; Черновики spam; no Выбрать+square; no `эталон карусели`; text-only or coffee-locked smoke.
- **S52.D:** Scout panel without bottom **«Разведать»** / without auto-scout filters+schedule; Competitors open/focus/remount triggers Apify instead of **last Scout snapshot**; acceptance without Playwright **S52.D**.

## Hard REJECT — E2E diffusion · kill HTML overlay (S53 HARD)

См. `client.mdc` **#19** + `client-scenarios` **S53**. Кратко → **НЕ ПРИНЯТО**, если:

- primary paint = Playwright/HTML text overlay («pretty photo + base text layer»);
- image model = bg-only / no readable typography on PNG while HTML supplies type as success;
- traces in `docs/карусель тест/` show `image_llm: skipped` or HTML as primary; no per-slide image prompts with typography;
- stock photo + flat system type sold as expensive IG carousel;
- budget >6 PNG (2×3) without stop; acceptance without Playwright **S53** + reading traces.

## Hard REJECT — Visual Deconstructor / carousel+reels (S44) + models/colors/hook (S45)

См. полный сценарий в `client-scenarios` **S44** + **S45** + `client.mdc` §9–11. Кратко → **НЕ ПРИНЯТО**, если:

- Settings Design = layout markup editor (не colors-only) / Designer default ≠ `openai/gpt-5.4-image-2` / Scriptwriter без Haiku 5.5 thinking / flat cover hook / Create UI = panorama instead of sliced (**S45**);
- Settings Design preview = panorama-only (нет 3×4:5 cover/body/cta) или Tuner без live CSS;
- Create draw ≪ golden refs / panorama product preview / black frames / no CTA save;
- custom-reels script without hook **0–2s** or without explicit CTA;
- PNG budget exceeded without stop-report; artifacts not linked from `generatedMedia/wave-visual-deconstructor/`.

## Hard REJECT — Cortana retrieval (ТЗ §7)

Не принимать волну поиска по базе, пока live TG (или согласованный CLI с реальным context) не показал:

- точечный вопрос режет чужие сферы;
- вопрос про несколько экранов отдаёт все нужные факты (цели + Path + привычки и т.п.);
- при нехватке данных бот не выдумывает — сначала vector, потом честное «в данных Спутника нет»;
- календарь/цели не меняются без кнопки «Применить».

Ориентир: `.claude/skills/tester/cortana-retrieval-guards.md` (R1–R8).
