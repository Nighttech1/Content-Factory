# Client Scenarios — живые пользовательские сценарии (не только скриншоты)

## When

Роль **Клиент** принимает Studio / Mesh / Inspector / Analytics / Schedule.  
Нужно: кликать, вводить текст, ждать смену экрана, проверять drawer/прогресс — не только «сфоткать».

## Какой MCP использовать

| MCP | Уже в проекте? | Что умеет для сценариев |
|-----|----------------|-------------------------|
| **`playwright`** (+ iphone/android) | ✅ да | `navigate`, `click`, `type`/`fill`, `press`, `select`, `snapshot` (дерево доступности = «что сейчас на экране»), `screenshot`, wait |
| **`chrome-devtools`** | ✅ да | сеть, консоль, perf — *почему* сломалось |
| **`image-compare`** | ✅ да | before/after визуал |
| **Stagehand MCP** (`@browserbasehq/mcp-stagehand` или аналог) | ❌ опционально | `act` / `extract` / `observe` на естественном языке, если DOM «плывёт» |
| **Browser-Use MCP** | ❌ не нужен по умолчанию | тяжёлый автопилот для чужих сайтов |

**Вывод:** отдельный «MCP только для кликов» не обязателен — **Playwright MCP уже сценарийный**. Нужно **обязать Клиента** гонять сценарии, а не только screenshot.

## Live competitors / IG feed — обязательное доказательство Playwright

Приёмка колонки **«Конкуренты»** (live Apify / scraper wave, `carousel-engine`, `custom-reels`) **запрещена** без Playwright-сценария S*, который на **живом localhost** доказывает хотя бы одно:

- на карточках видны **live usernames** (S47/S48: top-left black plaque **≈1.5×**, white Century Gothic + followers `Nк` справа) и **читаемые engagement ≈2×** bottom-center на фото: views · likes · comments · shares · saves;
- **не** требовать бейдж **«Онлайн · Instagram»** на карточке (**S47** supersedes badge-only proof).

Tiny 2-up cards без метрик / «как mock» / caption+tags chrome вместо S47/S48 → сценарий **провален** → вердикт только **НЕ ПРИНЯТО**. Скрин пользователя, API-логи, слова Backend **не** заменяют Playwright. См. HARD GATE в `client.mdc` + `client-review`.

Ориентир: **S7** / **S10** / **S21** + **S47–S51 HARD** (S51: Design top-right · no preview MD btn · eye «код дизайн мд» · blue neon active · Boards **from «Доски» segment** · no UI jump · Upload icon always). S43–S50 — предыдущие волны.

## Ритуал сценария (каждый C-* на UX)

1. **Открыть** localhost нужного маршрута.
2. **Snapshot** (accessibility tree) — прочитать роли/имена кнопок (не угадывать селекторы вслепую).
3. **Действие** — click / type / fill / keyboard.
4. **Wait** — дождаться текста/роли/URL (drawer открылся, статус сменился, inspect/:id).
5. **Assert по snapshot** — нужный текст/кнопка/бейдж появился или исчез.
6. **Screenshot** — визуальное доказательство в тикет.
7. При сомнении — **image-compare** before/after.

Без шагов 3–5 вердикт «ПРИНЯТО» по UI-сценарию **запрещён**.

## Сценарии Content Factory (чеклист)

### S1 — Studio Launchpad: запуск черновика

1. `/studio` → snapshot: 4 модуля + слот Add.
2. Click модуль «Карусель».
3. Fill Command Bar темой (напр. «Ереванский сленг для новичков»).
4. Click чип-пресет (опц.) → Click **Generate Draft**.
5. Assert: GenerationDrawer виден; есть шаг Researcher/Hook/…; прогресс меняется.
6. Screenshot drawer mid + end.

### S2 — Inspector HITL

1. Открыть `/studio/inspect/:id` после draft.
2. Assert: Left Deck (carousel или 9:16) + Right panel Hook Score.
3. Click альтернативный хук → Assert текст хука сменился на snapshot.
4. (Carousel) DnD слайд / reroll slide → Assert порядок/контент изменился.
5. Click **Approve & Schedule** → Assert статус/тост подтверждения.

### S3 — RBAC Mesh

1. Под ADMIN: `/admin/mesh` → Assert redirect/403 или пункта Canvas нет в nav.
2. Под OWNER: Холст открыт; видны **раздельные** пайплайны по видам контента Студии (не один universal graph). Snapshot.

### S4 — Analytics

1. `/analytics` → KPI видны; клик по insight (если интерактив) → Assert деталь/фильтр.

### S5 — Mobile smoke

Повторить S1 на `playwright-iphone` и `playwright-android`: нет горизонтального скролла, CTA доступен, drawer не ломает layout.

### S6 — Расписание (C-54 + wave 2)

1. `/schedule` → snapshot: календарь (не EN placeholder) + правый список модулей.
2. Под модулем видны посты «готовы к публикации»; если слот есть — дата/время справа/под постом.
3. Nav chrome RU: Холст / Расписание / Аналитика / Настройки / Студия — **без** Brand Kit / Бренд-кит / Canvas/Schedule/Launchpad латиницей.

### S7 — Dual feed без моргания + graphics (C-52)

1. Открыть модуль с заполненной колонкой конкурентов → topic/search refetch.
2. Assert snapshot: карточки **остаются** (не pulse-скелетоны на весь столбец).
3. `/studio/aesthetic-graphics`: нет Play на статичных картинках; видны комментарии и репосты.

### S8 — Черновики и Разбор на всех модулях (C-53)

1. Пройти ≥2 moduleId кроме `carousel-engine`.
2. Assert: Опубликовано/Черновики слева; Разбор на карточке конкурента; welcome + «Начать разбор».

### S9 — Сайдбар MenuVertical (C-57 + C-60)

1. `/studio`: нет «Ничего не выбрано» / «1 выбран».
2. Сайдбар: hover-стрелка MenuVertical, кегль ~sm. **Нет** выпадающих модулей Студии (C-60). Drag handle меняет ширину; после reload ширина та же (`cf.sidebar.width`). Snapshot.

### S10 — Холст просмотр + счётчик фида (C-58)

1. OWNER `/admin/mesh`: switcher сверху; нет «Добавить модуль»; ноды не таскаются, connect нет, ряд горизонтальный.
2. Workspace конкуренты: refetch topic/search — число в шапке **не** прыгает в «…».

### S11 — Голос, дизайнер карусели, дерево расписания (C-59 → wave 2)

1. Razbor `carousel-engine`: Analyst → Scriptwriter → Designer → Publisher; у каждого чат + **«передать задание»**; публицист **с чатом** + день/время (C-59 «без чата» superseded). Handoff — **S14/S18**.
2. Razbor другого модуля: **нет** Designer-панели (C-51).
3. Каждый AI composer: mic `agent-chat-mic` (reuse).
4. `/schedule` rail: animated file-tree модулей Студии.

### S12 — Сайдбар ширина (C-60)

1. Потянуть правый край aside. Reload. Ширина сохранилась. Модулей Студии в дереве нет.

### S13 — Workspace без blink / Создать / nested scroll (C-61)

1. Нет `// Рабочая страница модуля`.
2. Поиск конкурентов / topic refetch: заголовок «Конкуренты» и count **не** fade/pulse.
3. «Создать» glow справа сверху на ≥2 moduleId.
4. Wheel/touch крутит только колонку под курсором (`overscroll-contain`).

### S14 — Razbor handoff + черновики (C-62)

1. `carousel-engine` Razbor: сценарист **«отправить дизайнеру»** (не публицисту); дизайнер снизу → публицист.
2. Тумблер Конкуренты/Наши — белый текст; Наши серый disabled до draft.
3. Чат: scrollbar скрыт, скролл живой.
4. Вкладка Черновики: карточки = размер published; дата слота под карточкой (L/R на feed-карточке — см. **S15**, superseded).

### S15 — Nav speed + карусель ×0.5 + Создать карусель (UX wave 2)

1. Cold/warm клики сайдбар: Студия → Расписание → Аналитика → Настройки → Холст (OWNER) → Студия. Assert: **нет** blank/`opacity:0`; shell остаётся. **Записать мс** (Playwright + chrome-devtools) в guards — цель perceived ≤300–500ms до chrome маршрута.
2. `/studio/carousel-engine`: 9:16 stack; карточки **≈×0.5** vs wave1; нет сток; **нет** L/R на feed-карточке.
3. **«Разбор»** виден без hover → Razbor welcome.
4. **«Создать карусель»** → modal: чаты Сценарист→Дизайнер→Публицист с **«передать задание»**; превью пусто до генерации; **нет** «Слайд N/N»; L/R **сбоку**; смена слайда — см. **S21** (wave3 instant, без fade; wave2 «плавная» **superseded**). Snapshot.
5. Stack/modal preview: styled scrollbar; чат — hide.

### S16 — Команда выпуска + editable AgentProperties (UX wave 2)

1. OWNER `/admin/mesh`: title **«Команда выпуска»**; нет `// Только владелец · Сетка агентов`.
2. В ряду — **только агенты с реальным чатом** (не чистый Router/Queue без chat).
3. Click agent → **AgentPropertiesPanel**: имя/роль + **editable prompt** + **editable rules**. Сохранить → значение держится. Esc/close. Nodes не draggable / connect нет (C-58).

### S17 — Расписание DnD + дата в углу (UX wave 2)

1. `/schedule`: папки справа **свёрнуты**; wrap названий; **нет** day-strip; стрелки у title месяца.
2. В **углу** day-cell видна дата/число.
3. DnD пост/модуль из rail **в** ячейку → слот создан; дата/время **справа** после drop.
4. Hover по слоту → popup превью. Snapshot.

### S18 — Razbor handoff wave 2 + Create preview empty

1. Razbor `carousel-engine`: Analyst → … → Publisher; каждая кнопка **«передать задание»** меняет активный чат на snapshot.
2. Превью: пусто до генерации; после — L/R сбоку, без «Слайд N/N».
3. CreateCarouselModal: тот же handoff **без** Analyst в цепочке.

### S19 — Brand Kit removed + Settings DESIGN.md / агенты

1. Сайдбар: **нет** пункта Бренд-кит / Brand Kit; `/brand-kit` → 404 или redirect на Settings.
2. `/settings`: блок **Дизайн** показывает/грузит **DESIGN.md** (токены/правила).
3. `/settings`: блок **Агенты** — правила / промпты / скиллы / плагины (editable). Snapshot.

### S20 — Sidebar cleanup + ban mono eyebrows (UX wave 3)

1. Сайдбар: **нет** «Пайплайны и ноды»; **нет** «Բարև · Vernatun».
2. `/settings` (и Studio / Schedule / Mesh / Analytics): **нет** `// Настройки` и любых mono `// …` eyebrows над title. Snapshot.

### S21 — Dual carousel row + instant slide (UX wave 3)

1. Desktop `/studio/carousel-engine`: Ours + Competitors **в одном ряду**.
2. Mobile viewport: колонки **по одной** (не две узкие side-by-side).
3. Смена слайда в feed / Razbor / Create preview: **мгновенная**, **без** dark fade. Snapshot до/после клика L/R.

### S22 — Razbor MultiButton + handoff check + carousel brief + draft/calendar (UX wave 3)

1. Razbor: «Начать разбор» **ровно над** chat input; **нет** «Аналитик готов…».
2. Footer чата = `MultiButton` (send / mic / handoff); высота input+кнопок выровнена.
3. Таб агента: **без** галки до «передать задание»; после handoff — галка на сдавшем агенте.
4. Сценарист карусели: output = idea/prompt + тексты/цвета слайдов; handoff содержит «карусель N + текст + цвета» (не reels roles/plot).
5. После дизайна + дата/время у публициста → черновик в Ours + событие на `/schedule` выбранной даты. Snapshot.

### S23 — Launchpad каналы + одна описательная часть (UX wave 4)

1. `/studio` → snapshot: в «Каналы рендера» есть плитки **«Статьи на сайт»** и **«Статьи в TG»**.
2. **Нет** текста «Выберите модуль…» / «откроется рабочая страница…».
3. Есть **ровно одна** описательная часть (человеческий RU) + сетка. Screenshot.

### S24 — Mission Control CompactMultiButton + разборщик/аналитик (UX wave 4)

1. Зона команды запуска сверху: **`CompactMultiButton` / MultiButton** (`multi-button.tsx`), не ряд workflow-кнопок.
2. В UI агентов: **«Разборщик»** = разбор чужого; **«Аналитик»** связан с `/analytics` (не синоним Razbor). Snapshot.

### S25 — Analytics Self-learning dashboard (UX wave 4)

1. `/analytics` → title RU **«Самообучающаяся диагностика»** (или эквивалент без EN Analytics-only).
2. Видны блоки: **Scout**, **Outliers**, **Retention**, **RL feed**, **Telemetry** — подписи на русском.
3. Клик outlier/insight (если интерактив) → деталь. Нет EN caption у Retention вроде «Cross-platform…». Screenshot.

### S26 — Schedule sticky popup + date↔date + без хелпа (UX wave 4)

1. `/schedule`: hover слот → popup; **перевести курсор на popup** — popup **остаётся**; можно сменить время в popup.
2. DnD слота с одной даты на другую → `startsAt` день обновился; rail синхронен.
3. **Нет** нижнего хелпа «Нажмите день — слот сохранится…» / «Сначала выберите готовый пост…».
4. (Если в scope тикета) параметр/бейдж **площадка** на слоте. Snapshot.

### S27 — Settings Design upload + LLM aggregator + площадки (UX wave 4)

1. `/settings` → Дизайн: кнопка **загрузки DESIGN.md**; после file choose текст в редакторе.
2. LLM: поля **URL провайдера** + **API key** агрегатора; список моделей **>4** или динамический (не только 4 стока).
3. Блок **Площадки**: create → list (masked key) → edit/delete. В Create/Publisher — **picker площадки**. Secrets не в snapshot текста. Screenshot UI без ключей.

> **UX-5 supersede части S27:** Design = только filename + upload (без textarea/Save/Reset) — см. **S29**. Platforms status — **S30**. Agents MultiButton — **S31**.

### S28 — Studio no gray hover + Mesh MultiButton (UX wave 5)

1. `/studio`: hover плитки модуля — **нет** серого stock outline/ring; hover = токен Dark Luxury.
2. OWNER `/admin/mesh`: **`MultiButton` раскрытый** (не Compact); блок **по центру**; title **«Команда выпуска»** визуально как **«Студия»**. Snapshot.

### S29 — Schedule sticky modal + rail badges (UX wave 5)

1. `/schedule`: DnD **не** плодит несколько floating popups.
2. Rail модулей: **нет** badge tags `4:5 · PNG` / подобных format chips.
3. Открыть sticky popup слота: фон **непрозрачный**; клик time / platform **не** закрывает; закрытие только **Save** / **Cancel**. Snapshot.

### S30 — Settings Design filename+upload + Floating TOC (UX wave 5)

1. `/settings` → Дизайн: видно **имя текущего md** + **upload**; **нет** textarea + Save/Reset.
2. Справа — **Floating Motion TOC** (Dark Luxury), якоря к секциям. Screenshot.

### S31 — Platforms ping + Agents dual MultiButton (UX wave 5)

1. Площадки: кнопка **«Проверить подключение»**; статус **green/red** (нет enabled checkbox как единственный UX).
2. Агенты: **две** MultiButton — content-type + agent; **нет** tab pills. Snapshot без секретов.

### S32 — Brand Vernatun + Studio без «нового модуля» (C-122 / C-123)

1. Сайдбар @1440: виден **PNG логотип** + слово **Vernatun** **справа** (не под логотипом). Snapshot.
2. `/studio`: **нет** CTA / dashed «создание нового модуля» / RegisterModule entry. Сетка каналов остаётся. Screenshot.

### S33 — Команда выпуска: static picture + density + panel roles (C-124 / C-125) — HARD

**Клиент ранее халтурил mesh — этот сценарий обязателен целиком. Скрин ≠ замена кликам.**

1. OWNER `/admin/mesh`: экран = **картинка пайплайна**, не playground (нет ощущения free-drag board / MiniMap-редактора). Snapshot.
2. Assert layout: **нет overlap** блоков; линии **плотные/читаемые** (не каша). При overlap → **НЕ ПРИНЯТО**.
3. **C-129 labels HARD @1440:** assert **Playwright bbox** — handoff labels **не** пересекают bounding boxes нод (и не читаются «сквозь» карточку агента). Mid-edge clutter на **пунктире Тренера** — скрыт или вынесен в gutter; короткие RU OK. Только «сдвинули %along» без bbox → **НЕ ПРИНЯТО**.
4. Виден блок **«Пользователь»** → ветка к Сценаристу (или Разборщик→Сценарист). Отдельная линия **Scout→Аналитик→Тренер** + **пунктир** к агентам выпуска.
5. На логотипе **Тренера** — значок **штанги** справа снизу.
6. Click **Scout** → panel: только **info/сбор** (нет списка «предложений правок»).
7. Click **Тренер** → panel: **предложения/изменения** skills·rules (не путать со Scout).
8. Nodes не draggable; connect нет. Esc закрывает panel. Screenshot panel + full picture.

### S34 — Schedule popupPos persist (C-126)

1. `/schedule`: открыть popup слота; **перетащить** окно в заметное место.
2. Переключить на **другой слот** — позиция окна **та же** (не прыжок к новой ячейке).
3. Refresh / remount страницы — позиция **сохранена**. Snapshot до/после.

### S35 — Analytics menu + RL HITL + Retention 15s (C-127 / C-128)

1. `/analytics` **или** module-scoped analytics (после **C-136** — entry с module top nav): меню / переключатель **как у Студии** (метрики **per module**). Snapshot.
2. Лента самообучения: предложения от **Тренера**; кнопка **«Согласовано»**; до клика skills/rules **не** applied (assert status pending).
3. Retention: виден **% на 15-й секунде через дробь** (напр. `62% (31/50)`). Screenshot.

### S36 — Brand emblem + nav IA + hydration + typography (C-130…C-136)

1. Сайдбар @1440: **круглая эмблема без wordmark** слева + текст **VERNATUN** справа (не PNG с запечённым текстом). Snapshot.
2. Сайдбар пункты **только**: Студия · Расписание · Настройки. **Нет** Холст/Mesh, **нет** Аналитика в sidebar.
3. Console: **0** React hydration mismatch на load `/studio` (C-133).
4. `/studio/[moduleId]`: top nav кнопки **«Команда выпуска»** + **«Аналитика»** ведут в scope модуля. Snapshot.
5. Feed card meta = Century Gothic white **12px**; Razbor/system titles = Century Gothic white **16px**.

### S37 — Команда выпуска STATIC (C-138 / C-139) — HARD (supersedes S33 + C-137 xyflow inspector)

**Эталон `code_artifact.html`. Не принимать ReactFlow/xyflow canvas и не принимать MultiButton chrome.**

1. OWNER: module top nav → **«Команда выпуска»**. Top bar = **title + subtitle only** (**нет** «Скопировать/загрузить ТЗ» — **C-143**); **нет** MultiButton / MeshPipelineSwitcher. Snapshot.
2. Схема = **static** HTML/CSS/SVG (не infinite ReactFlow). Dual-lane; gaps читаемы; **0 overlap** @1440. Solid = short labels; **dashed** Trainer→release **без** mid-text labels.
3. Click **User** → accordion brief **in-place**; drawer **не** открывается.
4. Designer card: виден chip **`design.md`**.
5. Click **агента** → drawer **3 tabs**: Инструкция (prompt only, **нет** отдельного rules); Скиллы & Инструменты (Skills / Plugins / MCP); Модель & Параметры (LLM, temperature, maxTokens — **нет timeout**).
6. Esc закрывает drawer. ADMIN не видит/не открывает. Screenshot flowchart + drawer tabs.

### S39 — Team brief / pan / ports + Settings trim (C-140…C-145) — HARD

1. **C-140:** User accordion — **редактируемый** brief (не lorem-mock); сохранить; при следующем чате/генерации brief+topic уходят в AI path (доказательство: request payload / UI confirm / stub log — Архитектор). Snapshot edit.
2. **C-141:** LMB drag (и touch если доступен) **панорамирует** схему; клик по карточке всё ещё открывает drawer/accordion.
3. **C-142:** стрелки визуально из **центра** боковой грани карточек (не из верха). Snapshot @1440.
4. **C-143:** top bar **без** кнопки Скопировать/Загрузить ТЗ.
5. **C-144:** cold open module с Launchpad — замер мс в guards; после фикса — регресс быстрее / skeleton без blank.
6. **C-145:** `/settings` — design.md **preview panel** справа: open/close/drag/resize. **Нет** блоков «Разведка» / «Агенты» / «LLM». Scout: настройки на Team у **каждого** Scout. Snapshot Settings + Scout drawer.

### S38 — Carousel crossfade + Razbor composer (C-131 / C-135)

1. Feed / Razbor / Create preview: клик L/R — **smooth crossfade**, **без** чёрной вспышки между кадрами. Snapshot до/после (или video frame assert).
2. Razbor composer: **длинный** input + **3** кнопки **справа**; close = **круглая красная X**. Snapshot.

### S40 — Live Polza chat + PromptBox + drafts persist (C-155…C-158) — HARD

1. **C-157:** Razbor/Create panes Scriptwriter · Designer · Publisher — composer = **PromptBox** (не legacy AgentChatComposer chrome). Snapshot @1440. **Create после C-carousel:** panes = Сценарист · Дизайнер · **Публикация** (не Publisher agent).
2. **C-155:** ввести **уникальный raw** текст (без brief); send → live ответ (или явная ошибка aggregator). В network/payload: `user` = raw only; `system` = mesh agent systemPrompt (не brief+message). Snapshot thinking → reply.
3. **C-158:** после send виден **9-cube assemble** + shimmer **Thinking...**; статус снимается на ответ/ошибку. Reduced-motion smoke optional.
4. **C-156:** создать/получить carousel draft → F5 → draft **остаётся** (zustand persist). Snapshot до/после.

Hard REJECT: brief в user role; mock «успех» без Polza; spinner-only без 9-cube; drafts пропали после refresh; старый AgentChatComposer как единственный composer.

### S41 — Create carousel handoff wave (**C-carousel-***) — HARD

1. `/studio/carousel-engine` → **«Создать карусель»** @1440. Snapshot.
2. **Chrome:** сверху segment Сценарист/Дизайнер/**Публикация** (Button-style); справа сверху **«Передать задание»** (на Сценаристе/Дизайнере). **Нет** bottom-right «передать…»; **нет** bottom-left tools; **нет** агента «Публицист».
3. Сценарист: live ответ с **абзацами/markdown** (не сплошной блок). Без клика «Передать задание» — агент **не** уходит к Дизайнеру; спрашивает правки.
4. «Передать задание» → Дизайнер: bubble «получил задание» + описание кадров; кнопки **«Нарисовать»** / **«Передать на публикацию»**.
5. «Нарисовать» → preview справа с кадрами (не mock lorem-only). Snapshot.
6. Шаг Публикация → **«Опубликовать»** → карточка в **Черновиках** + слот на **`/schedule`**. Snapshot.

Hard REJECT: Publisher agent в Create; bottom handoff/tools; auto-handoff сценариста; mock-only дизайнер; сплошной текст без абзацев; нет draft/schedule после Опубликовать.

### S42 — Carousel JSON Dramaturgy + dynamic N + preview not black (**C-carousel-json-*** / **C-carousel-preview-black**) — HARD

1. `/studio/carousel-engine` → **«Создать карусель»** @1440. В запросе пользователю явно указать **N** (напр. «сделай карусель из **7** слайдов» — не 5 и не 8 «по умолчанию»).
2. Сценарист: в ответе / handoff artifact есть JSON с `requested_slide_count === N` и `slides.length === N`; cover ≤6–8 слов; у слайдов есть `swipe_trigger` (**meta** engagement QA, не on-slide); есть `caption`/`hashtags`/`alt_text` (или явный follow-up до handoff). Snapshot чата. (Полный CTA 1–4 + «?» — **S46**.)
3. «Передать задание» → Дизайнер → описание → **«Нарисовать»**.
4. После bubble «готово»: preview справа показывает **видимые** кадры (не сплошной чёрный / empty). Assert: img/src или canvas frames с ненулевым размером; число кадров = N. Snapshot @1440.
5. (Опц.) Повторить с другим N (напр. 4) — тот же пайплайн, **без** хардкода прежней длины.

Hard REJECT: fixed slide count ignoring user N; «готово» + чёрный/пустой preview при наличии generate; нет dramaturgy fields; Designer падает / режет до fixed length.

### S43 — Drafts always + Settings Design Embla + Team «Задание» + no «N» (**C-drafts-always** / **C-settings-design-md-carousel** / **C-team-brief-n-indicator**) — HARD

1. **Drafts P0:** `/studio/carousel-engine` → Create → дойти до успешного **«Опубликовать»** (или Architect lock: после successful draw) → закрыть модалку → тумблер **Черновики** → assert: **новая карточка видна** (без F5). Snapshot @1440. Hard REJECT: пустой rail / только schedule без drafts.
2. **Settings Design Embla:** `/settings` → блок Дизайн → Embla/carousel ≤10 слайдов; на слайде preview + chip **DESIGN.md** top-right; выбрать слот → assert `active` (aria/selected). Snapshot.
3. **Preview close:** открыть панель превью MD → **Close** → assert panel **gone** (snapshot: нет overlay/panel). Hard REJECT: окно не закрывается.
4. **Разборщик CTA:** видна **«Добавить новый дизайн»**; (smoke) upload image path exists / file input. Full parse MD+HTML → Client re-check after Backend/AI Bridge.
5. **Team «Задание»:** OWNER `/admin/mesh` (Команда выпуска) → User accordion: label **«Задание»**, **пустое** поле (нет baseline lorem). Snapshot.
6. **C-155 verify:** Create/Team live chat Scriptwriter или Designer — send unique raw; network: `user` = raw **only**, **нет** Team brief text в payload.
7. **Mystery «N»:** @1440 на `/studio` и `/settings` — **нет** кнопки/бейджа **«N»** bottom-left shell; cold nav без тяжёлого indicator jank (chrome-devtools optional).

Hard REJECT: Create без Черновиков; Embla library отсутствует; Close preview fail; baseline brief на Team; brief в user chat; «N» bottom-left остаётся.

### S44 — Visual Style Deconstructor + premium sliced carousel + reels script (**C-visual-style-deconstructor** / **C-design-slot-sliced-preview** / **C-carousel-css-vars-builder** / **C-reels-scriptwriter-upgrade**) — HARD

**Бюджет:** волна ≤ **40 PNG**. Если качество ниже рефов при исчерпанном бюджете → **НЕ ПРИНЯТО** + отчёт (что усилили в агентах + sliced скрины) — **без** дальнейшей генерации.

**Артефакты Create draw:** Deployer/Client кладут нарезанные PNG в  
`generatedMedia/wave-visual-deconstructor/`  
и **линкуют пути** в финальном отчёте приёмки.

#### A) Settings Design — sliced 3×4:5 + Tuner + Deconstructor

1. Playwright @1440 → `/settings` → блок **Дизайн**.
2. Embla slot: assert **три** интерактивных кадра **4:5** (cover / body / cta sample) — **не** одна панорама как единственный preview. Snapshot.
3. Swatches / **Quick Theme Tuner**: сменить accent → live CSS vars на sliced preview (видимое изменение). Snapshot before/after.
4. Chip **DESIGN.md** top-right; Close preview panel works (S43 parity).
5. CTA **«Создать из референса»** / «Добавить новый дизайн»: upload path exists; (smoke) deconstruct → slot append ≤10 + set current. Full golden map dark_notes + bento_glass → Client re-check after AI Bridge/Backend.

Hard REJECT (Settings): panorama-only slot preview; нет тройки cover/body/cta; Tuner без live CSS; нет Create-from-ref path.

#### B) Create draw — marketing-save vs golden refs

1. `/studio/carousel-engine` → Create → active preset **dark_notes** (или golden slot) → N≥3 → Scriptwriter JSON → Designer → **«Нарисовать»**.
2. After «готово»: preview = **нарезанные** 4:5 frames count = N; **не** чёрный; **не** panorama-only. Snapshot @1440.
3. Visual checklist vs ref **dark_notes**: marker-yellow highlights **or** doodle/checklist **or** seamless bridge arrows; CTA save; Vernatun mark; safe-zone OK; Armenian glyphs not broken.
4. Repeat (budget permitting) with **bento_glass / dark_editorial**: glass cards **or** telemetry **or** gold/amber CTA button visible.
5. Copy sliced PNGs → `generatedMedia/wave-visual-deconstructor/` + link in Client report.

Hard REJECT (Create): quality ≪ refs (flat mock / stock Inter / purple slop); panorama-only product preview; no cover hook / no CTA save; missing preset primitives; black preview; silent overspend past 40 PNG without stop-report.

#### C) Reels Scriptwriter — hook 0–2s + CTA

1. `/studio/custom-reels` (или Team mesh custom-reels) → открыть чат **Сценариста** (не Copywriter label).
2. Запросить сценарий рилса 15–30с. Snapshot ответа.
3. Assert в артефакте/тексте: **hook в 0–2с**; ≥2 value beats; **явный CTA** (on-screen и/или caption); `promptForMontage` (или эквивалент handoff Монтажёру).
4. Assert **нет** carousel Dramaturgy `slides[]` 4:5 как основного deliverable.

Hard REJECT (Reels): нет хука 0–2с; плоский VO без битов; нет CTA; карусельный JSON вместо reels script.

### S45 — Designer model + Scriptwriter thinking + colors-only Design + panorama→slice + captivating hook (**HARD**)

Wave: Designer default `openai/gpt-5.4-image-2`; Scriptwriter **Haiku 5.5 + thinking/reasoning**; Settings Design **colors only**; Designer draw = panorama→slice; Create preview = sliced publish-ready; Scriptwriter hook captivating.

#### A) Settings — models + colors-only

1. Playwright @1440 → `/settings` (и/или Team drawer Model для mesh agents — Architect lock which surface owns defaults).
2. Assert **Designer** default model id/label includes **`openai/gpt-5.4-image-2`** (or catalog alias resolving to that id). Snapshot.
3. Assert **Scriptwriter** default = **Haiku 5.5** (aggregator id per Architect) **with thinking/reasoning enabled** (toggle/flag/API field visible or documented in network). Snapshot.
4. `/settings` → **Дизайн**: assert UI = **colors / type / text-block tokens** (swatches / Quick Theme Tuner) — **нет** layout markup editor / grid builder / drag-layout pane. Snapshot.
5. **S52 supersede S44 Settings sample:** **нет** COVER/BODY/CTA sliced layout strip in Design prefs. Live CSS on color change OK. (Create product preview remains N×4:5 — see B.)

Hard REJECT (Settings): wrong Designer default; Scriptwriter without thinking per catalog; layout markup editor present; Settings sliced role kits (**S52**).

#### B) Create — panorama craft → sliced preview + captivating cover

1. `/studio/carousel-engine` → Create → N≥3 → Scriptwriter JSON.
2. Assert cover/`hook` / first headline = **captivating** (pattern interrupt) — not flat «О клубе» / «5 советов». Snapshot chat/artifact.
3. Designer → **«Нарисовать»** → after «готово»: preview = **N× нарезанных 4:5** publish-ready — **не** одна панорама в UI. Snapshot @1440.
4. Visual: bridges/elements may cross cuts (dark_notes arrows OK) — proves panorama-first craft when preset uses bridges.
5. (Optional network/logs) confirm draw path used panorama master then slice — not N isolated stock cards.

Hard REJECT (Create): flat hook; panorama-only product preview; black frames; quality ≪ golden; Settings colors ignored on draw.

#### C) Reels hook strengthen (parity)

1. custom-reels Scriptwriter → script 15–30с.
2. Assert captivating hook **0–2s** + CTA (S44.C + stronger FAIL on soft intro).

### S46 — Scriptwriter swipe meta + CTA catalog 1–4 + «?» hint (**HARD**)

Wave: `swipe_trigger` = **meta engagement QA** (not on-slide); CTA catalog **1–4** HARD; Create Scriptwriter **«?»** cheat sheet top-right.

#### A) UI hint

1. Playwright @1440 → `/studio/carousel-engine` → **«Создать карусель»** → шаг **Сценарист**.
2. Assert кнопка **«?»** top-right чата (`create-scriptwriter-cta-hint`). Click → panel with CTA **1–4** cheat sheet visible. Snapshot.
3. Assert hint **не** на Дизайнер/Публикация как primary.

Hard REJECT (UI): нет «?»; panel пустой / без 1–4; hint только в Settings.

#### B) JSON meta + CTA apply

1. В brief: N≥3 + явный **«CTA 2»** (или другой номер 1–4).
2. Scriptwriter artifact: каждый слайд имеет `swipe_trigger` (META sense); cover/`hook` captivating (S45 parity).
3. Assert `cta_type ===` выбранному номеру; `cta_slide` headline/body = intent каталога (2→подписка и т.д.). Snapshot chat/JSON.
4. Assert **нет** признака, что `swipe_trigger` ушёл в on-slide paint brief Дизайнеру как primary copy (human brief may mention meta separately — on-slide fields = headline/body only).

Hard REJECT: wrong/missing `cta_type`; invented 5th CTA; empty `swipe_trigger`; `swipe_trigger` used as painted subtitle; ignore user CTA number.

#### C) Optional Designer smoke

1. Handoff → Designer describe: on-slide plan uses headline/body/CTA control — **not** painting `swipe_trigger` strings on frames.

### S47 — Feed card chrome + Razbor/Create modal UX + Marketing Director (**HARD**)

Wave: clean feed cards; Razbor+Create modal parity (scroll capture, chrome); new Marketing Director chat.

#### A) Carousel feed cards

1. Playwright @1440 → `/studio/carousel-engine` (ours + competitors columns).
2. Assert на карточке: **нет** текста «Онлайн · Instagram» / «Демо-данные» badge-on-card; **нет** tags «Конкуренты»/«Наши» на карточке; **нет** bottom caption/post text под фото.
3. Assert top-left **black plaque** + **white** Century Gothic **account name**.
4. Assert bottom-center **на фото** icons+counts: views · likes · comments · shares · saves (Century Gothic). Snapshot.

Hard REJECT: old badge/tags/caption; metrics only under card; Inter on username/metrics.

#### B) Razbor modal

1. Open **Разбор** на competitor card @1440. Snapshot: modal fills assert frame (не «скрин фона студии»).
2. Scroll inside modal chat/preview — **background feed не едет**. Screenshot = modal content dominant.
3. Assert **нет** «Карусель конкурента»; welcome **короткий**; placeholder **«Сообщение»**; **нет** Tools.
4. Preview: crop OK (не сломанный aspect); index **`N/M`** (напр. 5/8) Century Gothic.
5. Handoff control = **arrow + scriptwriter/agent logo** (mic-like). Top = **4 rounded people icons** MultiButton (release team). Snapshot.

#### C) Create carousel — same 2.x

1. **«Создать карусель»** — те же scroll/capture, placeholder «Сообщение», no Tools, handoff arrow+logo, 4 people icons, preview crop + `N/M` CG. Snapshot.

Hard REJECT (B/C): wheel scrolls studio behind modal; screenshot is background; Tools remain; text-only handoff without logo; no 4 icons; missing `N/M`.

#### D) Marketing Director AI chat

1. Navigate Marketing Director section (Architect route). Snapshot: **projects left**, welcome center, **AIInput** composer, Century Gothic.
2. Send first message → welcome clears / input **sinks down**. Snapshot before/after.
3. Assert live Haiku path (or explicit aggregator error — not silent mock). Tools: GraphQL/search available in agent path (network or UI tool chip — Architect).

Hard REJECT: no projects rail; Inter-only; composer not AIInput; input never sinks; mock-only strategy without tools wire.

### S48 — Директор nav + feed chrome scale + Razbor live/Boards + module parity (**HARD**)

Wave: left nav Marketing; feed plaque/metrics scale; slide preload + expensive L/R; Razbor/Create live Haiku + Boards; apply carousel UI to all studio modules.

#### A) Nav «Директор»

1. Playwright @1440 → любой Studio route. Snapshot sidebar: пункт **«Директор»**.
2. Click → URL **`/marketing`**. Snapshot Marketing Director (projects + AIInput OK).
3. Assert на `/studio` (Launchpad / module top-right): **нет** кнопки Marketing / «Маркетинг».

Hard REJECT: нет «Директор»; dual entry Studio top-right остался; `/marketing` 404.

#### B) Feed cards scale + «Разбор»

1. `/studio/carousel-engine` @1440. Snapshot competitor card.
2. Assert plaque **≈1.5×** S47 + **followers** compact RU справа (напр. `1564к`).
3. Assert engagement row **≈2×** + все **views·likes·comments·shares·saves** (не missing без причины).
4. Scroll к **нижним** карточкам — CTA **«Разбор»** **не clipped**. Snapshot.

Hard REJECT: tiny plaque/metrics; no followers; clipped «Разбор».

#### C) Preload + expensive horizontal motion

1. Open Razbor (или Create с слайдами). Wait open settle.
2. Rapid L/R через **несколько** слайдов — **нет** blank/hang/reload. Snapshot mid-swipe / after.
3. Assert motion = **horizontal L/R travel** (не только opacity flash; не black gap).

Hard REJECT: hang on swipe; black flash; no horizontal travel when claimed S48.

#### D) Razbor / Create S48 chrome + LIVE Haiku

1. Razbor: **нет** post title; preview **≈1.5×**; CTA labels **white**; handoff **inside** input chrome.
2. MultiButton **Конкуренты | Доски (Boards)** — Boards = **upload images** → разбор.
3. Click **«Начать разбор»** → **live Haiku** path (network / first tokens; **не** silent mock). Assert analysis covers **hook / mid / CTA** + virality brief + trainer tasks visible or in handoff artifact.
4. Handoff → Scriptwriter receives **insights** (snapshot chat / brief). Models: Razbor+Scriptwriter=Haiku; Designer=gpt image 2.0 (Team/Settings or network).

Hard REJECT: mock after start; no Boards upload; handoff empty; wrong models; post title; colored non-white primary labels.

#### E) Module parity

1. Open **≥2** non-carousel modules (напр. `custom-reels` + graphics). Assert same feed plaque/metrics/«Разбор» chrome patterns.
2. Snapshot proof shared UI — не «только карусели».

Hard REJECT: other modules stuck on pre-S47/S48 chrome.

### S49 — Feed plaque/toggle/Boards + Team brief gone + Design brandbook (**HARD**)

Wave: competitors plaque `name | followers`; Ours no plaque; Published/Drafts simple toggle + search same row; minimal feed bottom gap; Boards «Загрузить»; white labels; remove User brief forever; Settings Design = visual brandbook cards + upload→deconstruct.

#### A) Dual feed chrome

1. `/studio/carousel-engine` @1440 Playwright. Snapshot Competitors card.
2. Assert **one black plaque** with **`channel | Nк`** (followers **inside** plaque after `|`).
3. Ours / Published card: **no** name/followers plaque.
4. Top Ours: **toggle Опубликовано/Черновики** (not MultiButton) **left**; **search same row right**.
5. Labels **Опубликовано / Черновики / count** = **white**.
6. Assert feed bottom clip — **minimal gap** to shell bottom (no large dead band).

Hard REJECT: followers outside plaque; plaque on Ours; MultiButton Published/Drafts; gray labels; big bottom gap.

#### B) Boards

1. Razbor → **Доски**. Assert upload **«Загрузить»** same row as search.
2. Assert **no** copy «Локально · несколько кадров…».
3. Board cards: **no** engagement metrics overlays.

Hard REJECT: old helper copy; metrics on boards; upload not «Загрузить» / wrong row.

#### C) Team — brief removed

1. `/admin/mesh` or Team «Команда выпуска» (OWNER). Click User.
2. Assert **no** basic brief / «Задание» textarea.
3. Live chat Scriptwriter: send unique raw; network `user` = raw only; **no** ghost brief in payload (live + agent-start).

Hard REJECT: brief field remains; brief text in any agent task payload.

#### D) Settings Design brandbook

1. `/settings` → Дизайн. Assert **visual brandbook cards** (colors / type / buttons grid) — not textarea-only.
2. Upload reel or image → deconstruct → brandbook form updates for Designer.
3. Snapshot @1440.

Hard REJECT: raw MD only; deconstruct without brandbook UI; layout markup editor returns.

### S50 — Client visual pickiness + Design 3:5 + feed chrome + Create/live (**HARD · CRITICAL**)

Wave: user angry — Client must stop accepting UI slop. Thick bottom chrome clipping carousels; leftover DESIGN.md under cards; wrong aspect; mock competitors; Create ≠ Razbor; weak generation prompts.

**Клиент pickiness gate:** любой из пунктов ниже = вердикт только **НЕ ПРИНЯТО**. «Почти» / API-ok / скрин FE ≠ приёмка.

#### A) Carousel workspace — minimal bottom + chrome clean

1. `/studio/carousel-engine` @1440 Playwright. Screenshot full viewport (include bottom).
2. Assert **minimal** bottom bar — **no** thick black field clipping stack cards. Cards fully visible; gap to shell bottom = thin chrome only.
3. Module title: **no** «(4:5)» / aspect suffix.
4. Column headers **Наши** / **Конкуренты**: **no** orange dots / accent bullets left of labels.
5. **Both** columns: **sort + filter controls left of search** (same toolbar row).
6. **Доски / Boards:** control = **dropdown** of **all** boards + actions create/rename; badge/count **«1»** removed from Доски label.
7. Snapshot both columns + bottom edge.

Hard REJECT: thick bottom clipping; «(4:5)» in title; orange dots; no sort/filter left of search; Boards not dropdown; «1» on Доски.

#### B) Settings Design — 3:5 brandbook ONLY

1. `/settings` → Дизайн @1440.
2. Assert brandbook tiles = **horizontal 3:5** cards (Heritage Community photo style) — not square dump / wrong aspect / MD wall.
3. Assert **no** leftover raw **DESIGN.md** text / markdown chunks **under** cards.
4. Assert **no** slots counter copy («N слотов» / similar).
5. Toolbar **ONE row**: «дизайн.md» (icon-only or shortened icon label) · «референс» · «новый дизайн»+icon · preview = **icon only**.
6. Settings content: side padding **≈75% smaller** vs pre-S50 (wider content band) — visual assert.
7. Click a design card: **no** context menu / right-click chrome / overflow menu on primary click.
8. Assert **no** colors-only helper paragraph under brandbook.

Hard REJECT: wrong aspect; MD crumbs; slots counter; multi-row toolbar; fat side padding; context menu on click; helper paragraph alive.

#### C) Create modal = Razbor parity (start Scriptwriter)

1. Open **«Создать карусель»**. Assert UI chrome **matches Razbor** (4 people icons, handoff in input, white labels, no Tools, `N/M` CG).
2. Assert **starts on Scriptwriter** (not Razbor/Разборщик).
3. Competitors/Ours (or equivalent source) toggle sits **higher** in modal chrome than pre-S50.
4. Preview area **≈1.5×** again (S48 scale restored if regressed).
5. Snapshot.

Hard REJECT: Create looks older than Razbor; wrong start agent; toggle low; preview shrunk.

#### D) Live competitors + generation pipelines

1. Competitors column: assert **live** usernames + engagement (S47–S49 plaque/metrics) — **not** mock/fixtures when `sourceMode: live` expected.
2. Smoke Create Scriptwriter → handoff → Designer draw (or Razbor «Начать разбор» → insights): network shows live completion **or** explicit error — never silent mock success.
3. If hooks/CTA/visual flat — open P0/P1 on prompts (AI Bridge), **do not** ПРИНЯТО.

Hard REJECT: mock competitors as live; fake generation success; accepting weak scripts/draws without ticket.

### S51 — Settings Design top-right + Boards segment no-jump (**HARD**)

Wave: Design buttons cluster + Boards dropdown must open from **«Доски»** segment; no toolbar jump; Apify cost = Backend ticket (Client asserts no spam only if network visible).

#### A) Settings Design

1. `/settings` → Дизайн @1440.
2. Assert **all** Design action buttons sit **top-right** (user red-box zone) — not scattered left/center.
3. Assert **no** preview DESIGN.md button.
4. Assert eye control accessible name / visible label includes **«код дизайн мд»**.
5. Assert brandbook cards: **minimal** empty bottom (no fat dead padding under content).
6. Select a card: **blue neon glow** perimeter on active; **no** context menu / edit popup on click.
7. Snapshot.

Hard REJECT: buttons not top-right; preview MD button alive; eye unlabeled / wrong label; fat empty bottom; no neon active; popup on click.

#### B) Carousels Boards — segment source + stable toolbar

1. `/studio/carousel-engine` (or Razbor Competitors|Доски chrome) @1440.
2. Click **«Доски»** segment **next to Конкуренты** → dropdown opens **from that button** (no extra Boards buttons elsewhere in row).
3. Select a board → segment label shows **board name** (replaces «Доски»).
4. **Double-click** board name in list → rename flow.
5. Toggle Конкуренты ↔ Доски: Upload icon **always** visible **right of filter**; on Конкуренты = **gray disabled**; on Доски = active. Measure: toolbar width / positions **do not jump**.
6. Snapshot both modes side-by-side or sequential.

Hard REJECT: extra Boards buttons; dropdown not from segment; no dblclick rename; label stuck on «Доски»; Upload text-label or disappears; **UI jump** on mode switch.

### S52 — Design tokens-only + Razbor draft edit + themes + etalon (**HARD**)

Wave 2026-10-16. Supersedes Settings sliced COVER/BODY/CTA prefs + S51 «toolbar must be top-right» for Design (shift **LEFT** away from Settings nav).

#### A) Settings Design — tokens only + toolbar left

1. `/settings` → Дизайн @1440.
2. Assert **no** COVER/BODY/CTA sliced layout strip / button layout kits on Design cards.
3. Assert cards show **colors + typography / text-block / small-element** tokens only (Atelier-style).
4. Assert **no duplicate** Coffee Doctrine cards.
5. Assert Design toolbar **shifted left** — **does not collide** with right Settings nav.
6. Snapshot. Optionally inspect agent-start / describe payload: tokens only, no layout markup.

Hard REJECT: sliced role previews in Settings; button kits; duplicate Doctrine; toolbar under/over Settings nav; layout markup in prefs or agent payload.

#### B) Razbor — open draft + no «Начать разбор» + competitor pick

1. Черновики → open existing draft → Razbor/Create-parity modal @1440.
2. Assert **RIGHT preview** = **that** draft carousel (not empty / not wrong post).
3. Assert **no** «Начать разбор» (chat usable). Discuss/edit with Scriptwriter/Designer; LLM has carousel context.
4. Competitors toggle: **«Выбрать»** opens pick; empty square **top-right** for comparison pick.
5. Edit/redraw → assert **same draft** upserted (**no** spam new Черновики cards).

Hard REJECT: empty/wrong RIGHT preview; «Начать разбор» blocks draft chat; no Выбрать/square; duplicate drafts per iteration.

#### C) Quality + etalon folder

1. Confirm folder `generatedMedia/эталон карусели/` (or fixtures twin) has user reference carousels.
2. Smoke budget **≤9 PNG** (3×3), Armenian themes, **with images** (not text-only). Side-by-side vs etalon for Client.

Hard REJECT: text-only slides; coffee-only hardcoded theme lock; >9 PNG without stop; no etalon folder for compare.

#### D) Scout-only Apify + Competitors snapshot (**HARD** · cost)

Wave: Apify bound **only** to Scout. Competitors = last Scout snapshot. **НЕ prod.**

1. Team / «Команда выпуска» → open **Scout** panel @1440.
2. Assert bottom CTA **«Разведать»** visible.
3. Assert Scout settings include **auto-scout filters** (virality / likes / views / …) **and** **frequency schedule**.
4. Open Studio module → column **Конкуренты** (mount / remount / blur→focus if feasible).
5. Assert feed shows **last Scout snapshot** (or empty/mock soft-fail) — **no** paid scrape side-effect.
6. Evidence: Playwright + optional chrome-devtools / network — **no** Apify / `run-sync` / scraper POST on Competitors open; scrape only after click **«Разведать»** (or document schedule path via Backend/Tester counter = 0 on feed-open).

Hard REJECT: no «Разведать»; no filters/schedule in Scout settings; Competitors open triggers Apify / scraper; feed forces live scrape on focus/remount; AI Bridge/agent refresh scrapes Instagram.

### S53 — E2E diffusion carousel · kill HTML-overlay-primary (**HARD · LEGACY**)

> **SUPERSEDED for product ship by S57.** Do not FAIL layered-html ship for HTML overlay primary. Use only if wave explicitly claims S53/type-on-PNG arm.

Wave 2026-10-16. Supersedes Phase3 «HTML/CSS-first + optional diffusion bg». User carte blanche: image model paints **everything** including typography ON the PNG.

#### A) Create draw = integrated type (not HTML layer)

1. `/studio` → carousel Create @1440 → Scriptwriter topic (Armenian, N=3, CTA 1–4) → handoff → Designer → **«Нарисовать»**.
2. Assert RIGHT preview shows **3× 4:5** slides with **readable typography baked into pixels** (not a blank photo waiting for overlay).
3. Optional: inspect draw path / traces — primary = image-2 full paint; **not** Playwright HTML text raster as ship path.
4. Screenshot + snapshot.

Hard REJECT: pretty photo + base HTML/Playwright text layer as primary; text-only / black frames; stock+flat system type as «готово».

#### B) Prompt-trace evidence

1. Open `docs/карусель тест/` — Scriptwriter + Designer MD for the smoke.
2. Assert Designer per-slide prompts include **headline/body/CTA** typography instructions.
3. Assert post-process `html_overlay: none` (or explicit legacy_only + not claimed PASS).
4. Budget ≤ **6 PNG** (2×3).

Hard REJECT: no traces; `image_llm: skipped` as success; HTML overlay listed as primary paint; >6 PNG without stop.

### S54 — Carousel pipeline bake-off · etalon vs e2e vs anchor_ref (**HARD**)

Wave 2026-10-17. Client picks which **labeled** pipeline is closest to etalon. UI chrome frozen (`shell_freeze`).

#### A) Compare folder labeled

1. Open `generatedMedia/compare-carousel-bakeoff/` (or Architect twin).
2. Assert subfolders / path segments include clear labels: **`etalon`**, **`e2e_diffusion`**, **`anchor_ref_pipeline`** (and **`html_overlay`** if prior artifacts exist).
3. Each arm has **3 carousels × 3 slides** (or documented reuse of prior e2e / etalon) under Armenian **LANGUAGE** theme slugs.
4. Screenshot folder tree or list paths in Client report.

Hard REJECT: anonymous deliverables without pipeline type in name; mixed unlabeled dumps; coffee-only theme lock.

#### B) Side-by-side quality vs etalon

1. For each theme: view `etalon` (or `generatedMedia/эталон карусели/`) next to `e2e_diffusion` and `anchor_ref_pipeline` slides 1–3.
2. Score craft: hook read, integrated type on PNG (not HTML layer), Vernatun brand, set consistency (especially whether **anchor_ref** slides 2–N match cover world).
3. Verdict sentence: **which pipeline label is closest to etalon** (and why in 2–3 bullets). Optional: rank 2nd.

Hard REJECT: accept by API logs only; claim PASS without opening compare PNGs; >**9** new PNG without stop-report; HTML-overlay claimed as winner ship path without labeling it legacy.

#### C) Anchor-ref behavior (if that arm present)

1. Confirm slide_01 painted first; slides 02–03 share palette/light/type grammar with cover (visual, not just prompt text).
2. Optional: Designer traces mention cover as reference image.

Hard REJECT: `anchor_ref_pipeline` folder is actually independent one-shots with no visual continuity.

### S55 — Correct carousel pipeline acceptance (**HARD** · sheet/Brand/mesh; paint → S57)

Wave 2026-10-17 answers locked. Keep: sheet⊕Create, Brand+Персонажи, Logs+RED, Publicist, CTA+swipe. **Paint/render acceptance → S57** (layered HTML). Do **not** require type-on-PNG or vision.

#### A) Settings Brand + Персонажи

1. `/settings` @1440 → after **Дизайн** see **Бренд** (logo + brand fields).
2. Below Brand → **Персонажи** (not «Пейзажи»): name + multi-angle photos cells.
3. Brand + Персонажи field groups ≤ **~50% viewport width** (`max-w-[50%]`).
4. Snapshot.

Hard REJECT: Brand before Design; label still «Пейзажи»; no Персонажи; full-bleed field stacks; brand-kit route resurrected.

#### B) Sheet supplement + drafts schedule (API/UI evidence OK with Playwright)

1. Confirm Backend preflight: Sheet readable (Orchestrator/Deployer note in report).
2. Assert schedule/auto path lands in **Черновики**; publish time user-settable (Publicist auto\|manual).
3. Create-chat still works (sheet is supplement, not sole entry).

Hard REJECT: sheet replaces Create silently; fill tests without sheet visibility proof.

#### C) Critic + vision + Logs / RED

1. Team agent drawer has tab **Логи**.
2. Force/observe error → agent card **RED perimeter** @1440.
3. Vision path: after 2 gens, crooked text still delivers with `needs_review` (not infinite loop).
4. CTA catalog 1–4 + `swipe_trigger` meta still present in Create.

Hard REJECT: no Logs; error with idle chrome; vision blocks forever; CTA/swipe dropped; invent-heavy Designer still primary.

### S56 — Useful-only smoke 51 / 1 / 17 (**HARD · LEGACY**)

> **SUPERSEDED smoke folder by S57:** DELETE `docs/карусель тест/smoke-useful-51-1-17/` and put **ONE** new 4-slide layered carousel. Useful-only **gid** may still apply to sheet intake.

Locks (legacy): Trainer card `plugins/trainer/useful-smoke-51-1-17.md`.

#### A) Useful-only intake

1. Backend/Deployer evidence: gen sourced from sheet gid **`902078005`** («Полезные карусели») only — **no** meetings tab read.
2. Rows smoked: **51**, **1**, **17**; each carousel **4 slides**.

Hard REJECT: meetings tab polled; wrong gid; wrong row set; slide count ≠4 without stop-report.

#### B) Prompt-trace MD + PNG

1. Open `docs/карусель тест/` (or `useful-smoke-51-1-17/` subfolder).
2. For each of 3 carousels: timeline MD with **which LLM**, prompts **in/out** (Scriptwriter + Designer per-slide image prompts w/ typography).
3. Cap **12 PNG**; overspend → stop-report already present.

Hard REJECT: no MD / truncated system prompts / PNG-only without traces / secrets in MD.

#### C) Rename + half-width (Playwright @1440)

1. Settings: TOC/section label **«Персонажи»** — zero product chrome «Пейзажи».
2. Brand + Персонажи blocks visually capped ~half screen.

Hard REJECT: «Пейзажи» label alive; full-width Brand/Персонажи forms.

### S57 — LAYERED HTML carousel pipeline (**HARD** · supersedes S53 paint bar + S55 type-on-PNG + S56 smoke set)

Locks: `plugins/trainer/carousel-layered-html-pipeline.md`. Etalon: `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` (esp. **#3** cut-out).

#### A) Single layered render @1440

1. `/studio` → Create carousel → topic → Scriptwriter → Designer → draw/composite.
2. Assert product path = **bg image + HTML overlay** (Puppeteer) — **not** type-on-PNG / not `correct_pipeline` paint success.
3. RIGHT preview: **N× 4:5** finals; readable HTML type; CTA button on last/cta slide.
4. Snapshot + screenshot.

Hard REJECT: parallel paint modes as ship; type-on-PNG claimed ready; black/empty preview.

#### B) Bg ban + Brand + fonts + characters

1. Traces / bg assets: **no** letters/logos on image layer; logo from Settings Brand on HTML only.
2. Active DESIGN.md fonts used (title/body/content); missing fonts downloaded.
3. If hero/Персонажи: cut-out **over** bg, not in scene; split-across-slides not forced every set.
4. Vision text-check **OFF** (no OCR regen evidence).

Hard REJECT: baked text/logo in bg; characters in scene prompt; vision loop; missing Brand/fonts.

#### C) Smoke folder + etalon taste

1. Confirm old multi-row `smoke-useful-51-1-17/` **deleted**; folder holds **ONE** new **4-slide** carousel for score.
2. Open layered-html-refs (esp. #3); score craft (cut-out energy, invent layout OK — not pixel clone).
3. Budget ≤ **4** finals for Client score set (stop if runaway).

Hard REJECT: old 51/1/17 set still present; no 4-slide deliverable; accept without Playwright; ignore #3 taste bar.

#### D) Logo placement v2 (when wave claims `logo-placement-v2`)

Card: `plugins/trainer/logo-placement-v2.md`. After composite / Create preview @1440:

1. Logo = HTML `<img>` only — **no** Vernatun / club-name text beside.
2. Cover + last (cta): logo **TOP** (prefer top-left); body slides: **bottom-left**.
3. Size ≈ **2×** Phase1 (~176px); PNG transparent (no black matte plate).
4. Snapshot + screenshot evidence per role (cover / body / last).

Hard REJECT: bottom-right leftover; cover/cta still bottom; ~88px size; black plate; `.brand-name` returns; accept without Playwright.

## Mesh / Client Hard REJECT (усиление)

Вердикт mesh **НЕ ПРИНЯТО**, если:

- приняли только по hero-скрину без **S37** кликов (accordion User + 3-tab drawer);
- ReactFlow / xyflow infinite / `FlowAgentNode` всё ещё primary path (**C-139**);
- MultiButton / MeshPipelineSwitcher на «Команда выпуска» (**C-138**);
- блоки overlap или линии «каша»; mid-text на **dashed** Trainer→release;
- **solid** handoff labels пересекают card bbox @1440;
- User открывает drawer / нет accordion in-place;
- нет chip `design.md` на Designer;
- drawer: отдельный rules block / нет групп Skills·Plugins·MCP / есть **timeout**;
- top bar ≠ title + subtitle **only** / всё ещё есть «Скопировать/загрузить ТЗ» (**C-143**);
- User brief mock / не editable на Team (**C-140** UI); live chat клеит brief в user (**C-155** / **S40**);
- нет PromptBox / нет 9-cube Thinking / drafts не persist (**C-156…C-158** / **S40**);
- нет pan LMB/finger (**C-141**); ports не center (**C-142**);
- Settings всё ещё с Разведка/Агенты/LLM; нет design preview panel (**C-145**);
- Create без карточки в Черновиках / Design Embla нет / preview Close fail / Team baseline brief / bottom-left «N» (**S43**);
- Settings Design panorama-only как **единственный** product preview / Create draw ≪ golden refs / panorama product preview / слабый reels hook·CTA (**S44**); **S52 supersede:** Settings **не** обязан показывать 3×4:5 cover·body·cta strip — tokens-only prefs;
- Settings Design = layout markup editor / Designer default ≠ `openai/gpt-5.4-image-2` / Scriptwriter без thinking per catalog / flat carousel hook / Create показывает panorama вместо sliced (**S45**);
- Create Scriptwriter без «?» CTA 1–4 / `swipe_trigger` as on-slide / игнор номера CTA (**S46**);
- Feed card с «Онлайн · Instagram» / tags / caption; нет plaque+engagement на фото (**S47**);
- Razbor/Create: scroll/screenshot фона; «Карусель конкурента»; Tools; нет 4 people icons / arrow-logo handoff / `N/M` CG (**S47**);
- Marketing Director без projects / AIInput / sink / Haiku+tools (**S47**);
- нет left nav **«Директор»→/marketing** / Studio Marketing button остался; feed без plaque 1.5×+followers / metrics 2×; swipe hang; нет L/R horizontal; «Разбор» clipped; Razbor mock / нет Boards; другие модули без parity (**S48**);
- followers вне plaque / plaque на Ours; MultiButton вместо Published/Drafts; search не в ряду; серые labels; большой gap под feed; Boards без «Загрузить» / helper жив / metrics на boards; User brief field жив / brief в agent task; Design без brandbook visual / deconstruct не в brandbook (**S49**);
- thick bottom chrome clipping cards; leftover DESIGN.md under brandbook; wrong aspect (Design ≠ 3:5); slots counter / colors helper; Design toolbar not one row / fat side padding / context menu on card; «(4:5)» in title; orange dots Наши/Конкуренты; Boards not dropdown / «1» on Доски; no sort+filter left of search; Create ≠ Razbor / not start Scriptwriter / preview ≠1.5×; mock competitors when live expected; Client accepted slop without S50.A–D (**S50 CRITICAL**);
- Design preview DESIGN.md alive / eye ≠ «код дизайн мд» / fat card bottom / no blue neon active / edit popup on card; Boards dropdown from **extra** buttons / no dblclick rename / segment still «Доски» / Upload not icon-always / **UI jumps** Конкуренты|Доски (**S51 HARD**); **S52:** Design toolbar still collides right Settings nav (must shift **left**);
- Settings Design still has COVER/BODY/CTA sliced layout kits / button kits / duplicate Coffee Doctrine / agent gets layout markup; draft open without RIGHT preview / «Начать разбор» on existing draft / Черновики spam / no Выбрать+square / no etalon folder / text-only smoke / coffee-only theme lock (**S52 HARD**);
- Scout без «Разведать» / без filters+schedule; Competitors open/focus/remount fires Apify; feed ≠ last Scout snapshot (**S52.D HARD**);
- Create claims type-on-PNG as product / rejects layered HTML solely for overlay (**S53 LEGACY** — do not apply against S57 ship);
- Bake-off without labeled compare when wave claims S54 PASS (**S54**); waived for S55/S57 product accept;
- Correct chrome: no Brand-after-Design / no **Персонажи** / «Пейзажи» / full-width / no Logs / no RED / sheet fill without visibility / CTA·swipe dropped (**S55** chrome KEEP; paint → S57);
- Legacy useful-smoke 51/1/17 still present after S57 DELETE order / no ONE 4-slide replace (**S56→S57**);
- Layered wave: not bg+HTML Puppeteer / letters·logos on bg / swipe painted / CTA not HTML 1–4 / characters in bg / vision ON / ignore layered-html-refs #3 / not 1080×1350 / old smoke folder (**S57 HARD**);
- нет «Пользователь» / нет пунктира B→A;
- Scout panel показывает patches вместо info;
- Mesh/Analytics всё ещё **только** в sidebar (C-136 провален).

## Как формулировать в тикете C-*

```text
Сценарий: S1
Шаги: … (что кликнул/ввёл)
Ожидание: …
Факт (snapshot/скрин): …
P0/P1/…
```

## Не делать

- Принимать только по одному hero-скрину.
- Принимать live competitors / IG без Playwright-доказательства **S47** usernames (plaque) + engagement на фото (не badge «Онлайн» как must).
- Принимать по API-логам / словам Backend / скрину пользователя без собственного Playwright @1440.
- Путать DOM-assert без скрина (для визуала нужен оба).
- Логинить прод-соцсети через MCP Клиента.
