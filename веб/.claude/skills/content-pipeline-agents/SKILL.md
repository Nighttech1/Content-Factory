---
name: content-pipeline-agents
description: >-
  Content-pipeline micro-agent prompts and orchestration (Researcher->Hook->Script->Designer->Art Director->HITL->Publisher->Analyst). Use when wiring the production pipeline, not the team roles.
---

# Content Pipeline Agents (HITL Factory)

## When

Промпты и оркестрация микро-агентов пайплайна (не путать с Cursor-ролями команды).

### DEV_PLAN / research waves

Сверка статусов Researcher→Hook→Script→Designer→HITL→Publisher→Analyst с живым продуктом для правок **`DEV_PLAN.md`**:

- Обновлять **только** знания о done/partial/missing в plan/spec.
- **Не** менять UI shell / nav / module chrome «под план» (`architect` § Research / DEV_PLAN sync · `shell_freeze`).
- Источник правды агентных имён/порядка: этот skill + live Create/Razbor/Team — не устаревшие EN labels из старого DEV_PLAN без проверки.

## Sprint 9 — upgrade-only / no-pipeline-break (HARD)

`DEV_PLAN` **9.1–9.11**. Фокус: качество **carousel-engine** + **custom-reels** как у сильного Claude Code-прогона.

| Lock | Правило |
|------|---------|
| **UPGRADE ONLY** | Усиливать промпты, contracts, golden fixtures, critic, scorecard **поверх** живого пайплайна. **Запрет** rewrite mesh / Create / Razbor «с чистого листа» |
| **NO PIPELINE BREAK** | Канон карусели: **Razbor → Scriptwriter → Designer → Draft** (Create без Razbor: Scriptwriter → Designer → Публикация-step → draft). Reels: **Scriptwriter → existing montage/render**. Не вырезать агентов, не менять handoff buttons на auto-skip |
| **Inventory (9.1)** | Таблица live vs chrome **только** Scriptwriter / Designer / Razbor / reels scriptwriter / render — другие moduleId = «→ Sprint 23» |
| **Modules** | Только `carousel-engine` + `custom-reels`. HeyGen, cartoon, aesthetic, articles, clips-to-reels → **Sprint 23** |
| **shell_freeze** | Нет UI shell / nav / module chrome redesign |
| **No social publish** | До green 9.9–9.10 — только Draft/HITL. Sprint 22 publish **blocked** |
| **Trainer proposals** | Razbor trainer tasks → только если правят prompts карусели/рилсов; иначе → Sprint 12 / 23 |
| **Skills** | `carousel-json-contract` · **`carousel-prompt-trace`** (MD dump `docs/карусель тест/`) · `reels-scriptwriter` · `prompt-engineering` § Sprint 9 + § Carousel audit · `ai-bridge` · `carousel-studio-handoff` (chrome already done — не ломать) |

## Carousel audit wave (2026-10-16) — Create shape freeze

| Lock | Meaning |
|------|---------|
| **no_pipeline_break** | Create stays **Scriptwriter → Designer → Draft** (Публикация step, not Publisher agent). Phase4 E2E diffusion = render upgrade **inside** Designer draw — not a new agent |
| **shell_freeze** | No AppShell / Create chrome / segment redesign — **draw path in scope** |
| **upgrade_only** | Patches to prompts, routing, **image draw path**, critic — not greenfield pipeline |
| **Models** | Scriptwriter **Sonnet**; Designer describe **Sonnet**; draw **`gpt-5.4-image-2`**; ban describe→mini via image id |
| **Phase1** | Dedupe agent-start; CTA COMBAT = catalog 1–4; full JSON few-shots |
| **Phase4** | **LEGACY** E2E type-on-PNG (**S53**) — not product ship after S57 |
| **Phase6 Correct-doc** | Sheet⊕Create; Brand+**Персонажи**; Logs+RED; Publicist; CTA+swipe; zod+critic **KEEP**. Paint/vision → **Phase7** |
| **Phase7 LAYERED HTML (S57 · product)** | Single render: image bg + HTML/CSS Puppeteer; FORCE no letters/logos on bg; CTA HTML; fonts×3 DESIGN.md; vision **OFF**; Персонажи cut-out OVER bg; etalon `layered-html-refs-2026-10-17/` (#3); DELETE old smoke folder → ONE 4-slide. Card: `carousel-layered-html-pipeline.md` |
| **Variant A + Art Director** | Designer emits **`html_layout`** (template/anchor/highlights) → composite executes; then **Art Director** (**Gemini vision**) reviews slides for virality+design+completeness → `approve` \| `remarks`; thin 2-sentence slides flagged; **NO auto-remake**; show on mesh/Team. Skills: `art-director` · card `variant-a-art-director.md` |
| **FULL DESIGN inject** | Complete DESIGN.md (fonts+sizes+**colors per role**) → Designer every draw; positive scale table; colors → HTML + bg mood. Card: `design-inject-logo-br.md`. **EXEMPT** when `styleCopyMode=vision_ref` |
| **Vision style-copy** | `styleCopyMode=vision_ref`: etalon PNG as **image ref** → hard-copy composition; **BAN** FULL TOKEN CARD / stock typography.scale; Brand Vernatun text+CTA separate; partial bg OK; layoutMap **not** sole path. Card: `vision-style-copy.md` |
| **Font fit** | Reduce-only from DESIGN scale if overflow; never enlarge; document in overlay. On vision_ref: sizes follow **ref look**, not stock scale table |
| **Logo dual-path + chrome** | Sanitize for LLM; **raw** for Puppeteer. Chrome: enlarged icon, **bottom-RIGHT**, transparent; name **beside** (right of icon). Name-only = FAIL. On vision_ref: chrome placement **mirrors etalon** |
| **Slide number slot** | Own HTML block; body paragraph tokens; pretty `N / M`. On vision_ref: present only if etalon shows numbers |
| **Layout variety** | Adjacent slides vary anchor — not always top-left. On vision_ref: **copy ref rhythm** (variety rule yields to etalon) |
| **secondary_copy richness** | Scriptwriter body detail **MUCH wider** (layout-copy): ≥220 chars AND ≥5 clauses on body — not 3 short sentences |
| **visual_prompt richness** | ≥3 scene elements; Armenian motifs **optional** (no khachkar/apricot laundry list every post) |
| **Deconstruct verify** | Upload liked → colors/fonts/sizes → FULL inject. **+ Grid:** 4 slides → **`layoutMap`** (optional legacy). **+ vision_ref:** image reference path primary for style-copy experiment |
| **Layout map copy** | When `layoutMap` present — copy anchors/chrome/numbering presence; invent content+bg+CTA only. No ref numbers → no gen numbers. **Not** the only style-copy path |
| **Dual character paint** | Product default **`in_image`**. `overlay_cutout` = legacy conductor OVER bg (OK switch, not default) |
| **Useful-only smoke** | gid=`902078005` may remain for intake; **S56 multi-row set SUPERSEDED** — S57 ONE 4-slide |
| **Smoke 2026-10-18 layout-copy** | Historical dual ×6. **Vision-style-copy wave:** keep smoke **A in_image ×6** under `docs/карусель тест/layout-copy-dual-char-smoke-A-in-image/` |
| **Phase5** | **LEGACY bake-off** — not required for S57 accept |
| **Budget** | **This wave:** dual 6-slide smokes + refs folder. Legacy S53/S54/S56 budgets N/A |

## Pipeline order (factory generate — полный HITL)

1. **Researcher** — тренды, источники, ниша (+ optional live IG observations; topic → hashtags)
2. **Hook Writer** — 10 → 3 → 1 хук + virality score
3. **Script Writer** — таймлайн / слайды (может получить real metrics context из cascade; не выдумывать)
4. **Dynamic Router** — выбор модуля 1–4 / custom
5. **Designer / Renderer** — Satori / Remotion / HeyGen / layered HTML (+ Variant A `html_layout`)
6. **Art Director** *(carousel; optional by chain)* — post-ready visual QA: `approve` \| `remarks`; **NO auto-remake** (skill `art-director`)
7. **HITL Gate** — пауза до апрува админа
8. **Publisher** — IG / TikTok / YT / TG
9. **Analyst (продукт)** — метрики → инсайты в `/analytics` (Self-learning dashboard). **Не** агент разбора чужого в Razbor.

> **Razbor ≠ полный factory generate.** C-51 убрал Designer; **C-59 возвращает Designer только для `carousel-engine`**, после Scriptwriter. **C-62:** сценарист шлёт в Designer, не в Publisher. **UX wave 2:** CreateCarouselModal + Razbor carousel = чаты с кнопками **«передать задание»**; Публицист **с чатом**. **UX wave 3:** сценарист карусели пишет **idea/prompt карусели** (не reels script); handoff дизайнеру = «карусель N + текст + цвета»; галка таба только после handoff; после дизайн+время → draft Ours + календарь; **per content-type** prompt/rules у каждого агента.
>
> ### **C-carousel-* (Create modal) — SUPERSEDES wave2/3 Publisher + footer handoff**
>
> Канон: skill **`carousel-studio-handoff`**. Только **CreateCarouselModal** (Razbor — отдельный тикет, пока не трогать без TZ).
>
> | Было (wave2/3 Create) | Стало |
> |----------------------|--------|
> | Сценарист → Дизайнер → **Публицист (агент+чат)** | Сценарист → Дизайнер → шаг **«Публикация»** (не LLM-агент) |
> | «передать задание» в MultiButton **снизу** + tools left | Segment сверху + **«Передать задание»** справа сверху; **без** bottom handoff/tools |
> | Сценарист может «сам» уйти к дизайнеру | **Без** кнопки handoff — только «понравилось? / что поправить»; **запрет** auto-handoff |
> | Дизайнер мокап / сразу картинки | Describe → согласие → **«Нарисовать»** → preview; правки описания сначала |
> | Mock bubbles OK | **No-mock** live LLM; agent-start = request+context+rules+skills+plugins+MCP |
> | Сплошной текст сценариста | **Markdown** абзацы в чате |

### UX wave 4 — Разборщик vs Аналитик

| RU label | Где | Делает |
|----------|-----|--------|
| **Разборщик** | Razbor modal / Mission Control режим разбора чужого | Каскад разбора конкурента (бывший UI-tab «Аналитик» в Razbor → переименовать в **Разборщик**) |
| **Аналитик** | `/analytics`, mesh/Settings agent `analyst`, RL proposals | Самообучающаяся диагностика, метрики, Scout/Outliers/… |

В коде id `analyst` для **продуктового** аналитика можно сохранить; **UI-строки Razbor** — «Разборщик». Не писать «Аналитик готов…» в Razbor (уже ban wave3).

### UX wave 7 — Разборщик summary для Analytics anomalies (C-103)

На `/analytics` карусель аномалий (top-15) сопровождается **человеческим RU summary от Разборщика** (не сырой JSON, не «цель» LLM). Источник: pipeline/script output Разборщика по выбранной теме Scout (`content-factory-analytics` C-103). Mock OK до live wire.

### UX wave 8 — Три разные роли: Разборщик ≠ Аналитик ≠ Тренер (продукт)

| RU label | Id (код, пример) | Где | Делает |
|----------|------------------|-----|--------|
| **Scout / Разведчик** | `scout` | `/analytics` Scout + mesh early node | Сбор + фильтр; **S52:** единственный owner Apify — «Разведать» / auto-scout → **snapshot** для «Конкуренты» (feed **не** scrape) |
| **Аналитик** | `analyst` | `/analytics`, mesh `analyst`, Settings | Анализ **по типу контента + площадке**, выводы/conclusions (не разбор чужого в Razbor) |
| **Тренер** (пайплайн) | `pipeline-trainer` / `trainer` | mesh «Команда выпуска», Settings Агенты | По выводам Аналитика ищет skills/plugins на internet/GitHub/HuggingFace **или** правит rules вручную для команды выпуска |
| **Разборщик** | `razborщик` / Razbor step 1 | Razbor modal / competitor cascade / **Settings Design CTA** | Разбор **чужого** контента **или** liked carousel **image → DESIGN.md + HTML** (`C-settings-design-md-carousel`). **Запрещено** подписывать «Аналитик» |

**Не путать с ролью команды «Тренер»** (грейд skills команды в `.claude/`): продуктовый **Тренер пайплайна** = агент выпуска на холсте/Team (Settings Agents UI **снят C-145**).

**Naming everywhere (C-105):** любая UI-строка Razbor / Mission Control / mesh / Settings, где имелся в виду разбор чужого → **«Разборщик»**, не «Аналитик». Аналитик остаётся только для analytics / analysis-node.

### User combat brief → AI — **S49 DELETE** (supersedes C-140 generate-path + empty «Задание»)

| Контур | Правило |
|--------|---------|
| **UI (S49)** | Поле client basic brief / «Задание» на Team User — **удалено**. Нет accordion, нет seed |
| **Generate / pipeline / agent-start / handoff** | **Запрет** подмешивать удалённый brief (и любой persisted ghost) как task / system context / «задание агенту» |
| **Live agent chat (C-155)** | **`user` = raw only**; **`system` = agent `systemPrompt` only**. **Запрет:** append brief / topic / combat / handoff blob в `messages[].role=user` |
| Scout settings | Per-Scout params на Team (**C-145**), не Settings «Разведка» |

**S49 HARD:** удалённый текст brief **никогда** не становится задачей для Scout / Разборщик / Сценарист / Дизайнер / Публицист / Тренер пайплайна.

### Release-team agent task sources (**S49**)

| Агент | Откуда task |
|-------|-------------|
| Scout | Team Scout settings + module sources |
| Разборщик | Media URLs (competitor / Boards) + `razbor-live-prompt` |
| Сценарист | Handoff insights / Dramaturgy request / raw chat / CTA 1–4 |
| Дизайнер | Dramaturgy JSON + **active brandbook / DESIGN.md tokens** (S49 visual → **S50 3:5** brandbook cards; no orphan MD crumbs in UI) |
| Публикация | Schedule + platform picker |
| Тренер (пайплайн) | Analyst conclusions → skill/plugin patches |

**Не** = User basic brief (удалён).

### Live Polza agent chat (**C-155**) + Create agent-start (**C-carousel-***)

| Поле | Канон |
|------|-------|
| Agents (Create) | Сценарист · Дизайнер — **без** Публициста (**C-carousel-***). Razbor может ещё иметь Publisher до отдельного тикета |
| Provider | Polza via `lib/llm/aggregator` (тот же `AGGREGATOR_*`) — не mock parallel client |
| Live turn `system` | `ReleaseAgent.systemPrompt` из mesh settings **only** (C-155) |
| Live turn `user` | Raw composer text **only** |
| **Agent-start / handoff** (не каждый user turn) | Bundle: request + dialog/context + rules + skills + plugins + MCP summary → system/context по spec Архитектора (`ai-bridge` § Agent-start). **Не** silent mock |
| History | Prior turns as sent; не переписывать user turns brief-ом |
| Запрет | `user: brief + "\n" + message`; mock «успех» в Create; auto-handoff сценариста без кнопки |

### UX wave 8 — Канон chain на каждом пайплайне (C-106)

На **каждом** content-type pipeline (mesh MultiButton + Settings):

1. **Scout** — collect + filter → handoff: **отфильтрованные посты / источники**
2. **Аналитик** — analysis per content-type + platform → handoff: **выводы / conclusions**
3. **Тренер (пайплайн)** — NEW: по conclusions находит/патчит skills·plugins·rules (WebSearch/GitHub/HF или manual) → handoff: **skill patches / rule updates**
4. Далее **существующие** агенты выпуска (Сценарист / копирайтер **per content-type**, Дизайнер, Публицист, …) без смены HITL.

| Правило | Деталь |
|---------|--------|
| Порядок | Scout → Аналитик → Тренер → release agents; не схлопывать Scout+Analyst в одну ноду |
| Копирайтер | **Свой** агент-копирайтер **на каждый** content-type (не один shared `copywriter` на все moduleId) — C-112 |
| Handoff labels | Конкретные RU/EN human labels на рёбрах mesh — см. `xyflow-agent-mesh` C-107 (не слово «json») |
| Mock | Trainer может предлагать mock skill patches до live HF/GitHub wire |

### UX Vernatun — Dual lane + User + Scout≠Trainer (C-125)

Mesh / product picture (`xyflow-agent-mesh` static):

| Lane | Chain |
|------|-------|
| **Выпуск (A)** | Блок **«Пользователь»** (текст запроса) → **Сценарист** **ИЛИ** **Разборщик → Сценарист** → Designer → … → Publisher |
| **Обучение (B)** | **Scout → Аналитик → Тренер**; от B **пунктирные** стрелки **ко всем** агентам A |

| Роль | Делает | Не делает |
|------|--------|-----------|
| **Scout** | Только **собирает info** (collect+filter) | Не предлагает и не вносит skill/rule patches |
| **Аналитик** | Выводы / conclusions | Не apply skills без Тренера+HITL |
| **Тренер** | **Предлагает и вносит** изменения (skills/rules/plugins) | Не подменять Scout-сбор; **без HITL «Согласовано»** не apply в prod (`content-factory-analytics` RL) |

**Запрет:** Скаут в UI свойств как author «улучшений»; один ряд без «Пользователь»; сплошные вместо пунктира B→A.

## Rules

- Каждый шаг пишет в `feedbackLogs`.
- Промпты версионировать; **Тренер** предлагает обновления + HITL «Согласовано»; не молча перезаписывать prod. Scout не author patches.
- Human-in-the-Loop обязателен до публикации.
- Секреты / IG access tokens — никогда в промптах, VERSION notes, skill text, `feedbackLogs`.

## Razbor competitor cascade — C-51 + C-59 → **S48 LIVE**

Modal разбора в Studio workspace. Файлы: `RazborModal`, `lib/studio/razbor-pipeline.ts` (± packs). Prompt: `ai-bridge/razbor-live-prompt.md`.

**C-53 + S48:** CTA «Разбор» на карточках конкурентов **во всех** модулях; UI chrome carousel-parity на всех modules (`content-factory-ui` § Module parity). Media: видео → play+scrubber; картинка → превью без Play.

**UX wave — видимость CTA «Разбор» (+ S48 clip fix):**

| Правило | Деталь |
|---------|--------|
| Always visible | Кнопка **«Разбор»** читаема без hover: contrast ≥ WCAG-ish на glass; `opacity: 1` в idle |
| Forbidden | `opacity-0 group-hover:opacity-100`, `sr-only` без видимой метки, clip за `overflow-hidden` карточки (**S48: особенно нижние cards в stack**), иконка без текста на desktop |
| Carousel stack | На 9:16 stack CTA не перекрывать L/R; не прятать под метрики; safe padding / overflow |
| Entry | Click → `RazborModal` welcome + «Начать разбор» (каскад не на mount) |

**Ветка по moduleId (UX wave 2 + S48 live):**

| moduleId | Каскад UI |
|----------|-----------|
| `carousel-engine` | **Разборщик → Scriptwriter → Designer → Publisher** — у каждого **чат** + handoff (шаг 1 = **Разборщик**) |
| любой другой | Разборщик → Scriptwriter (C-51); без Designer/Publisher; **S48 live Haiku** всё равно |

### Start UX + LIVE (**S48**) + **Draft edit path (S52)**

| Entry | Поведение |
|-------|-----------|
| **Новый разбор конкурента** (нет своего draft) | Welcome + **«Начать разбор»** → live Haiku (**no mock**). Cascade не на mount |
| **Открытие существующего Черновика** (Ours → draft) | **Удалить «Начать разбор»** (блокирует чат). Сразу чат с агентами **как в Create** (Сценарист · Дизайнер · Публикация) + **контекст существующей карусели** в LLM (slides/JSON/preview URLs). RIGHT preview = **эта** draft-карусель |
| Sources | **Конкуренты** \| **Доски**. Toggle **Конкуренты**: CTA **«Выбрать»** → module start pick competitor; **пустой square top-right** = comparison pick slot |
| CreateCarouselModal | idle / пустое превью до генерации; старт с Сценариста |
| **Draft persist (S52)** | **Overwrite** / upsert same draft id при итерациях — **запрет** spam новых «Черновики» на каждый redraw/edit |

- **Forbidden:** auto-run на mount; silent mock success; empty handoff; «Начать разбор» на existing draft; RIGHT preview чужой/пустой при open draft; duplicate draft cards per iteration.

### Agents in Razbor (`carousel-engine`) — **S48 models**

| Step | Agent | Model | Chat | CTA | Output |
|------|-------|-------|------|-----|--------|
| 1 | **Разборщик** | **Haiku 5.5 + thinking** | да | → Сценаристу | **LIVE:** hook/mid/CTA + virality brief + **trainer tasks** (Scriptwriter+Designer, module-wide) |
| 2 | **Scriptwriter** | **Sonnet** (+ thinking if API) — audit upgrade from Haiku | да | → Дизайнеру | Dramaturgy / carousel idea — **seeded by Razbor insights** |
| 3 | **Designer** | **describe = Sonnet**; **draw = `openai/gpt-5.4-image-2` bg + Puppeteer HTML** | да | → Публицисту | **S57 layered:** bg scene-only + HTML type/CTA/logo/cut-outs; preview 4:5; L/R; preload |
| 4 | **Publisher** | — | да (+ day/time) | HITL | draft Ours + calendar |

Handoff Разборщик→Scriptwriter **обязан** нести insights (`razbor-live-prompt.md`). Trainer tasks = actionable module-wide, не «скопируй пост».

**S50 prompt bar:** weak Razbor/Scriptwriter/Designer outputs → harden via `ai-bridge/s50-prompt-hardening.md` (concrete trainer tasks; captivating hook; brandbook tokens on draw). Create UI parity with Razbor but **start = Scriptwriter** (`carousel-studio-handoff` S50). Live competitors — never mock-as-success.

### CreateCarouselModal agents (нет Разборщика / нет Аналитика) — **C-carousel-* supersedes**

| Step | Label | LLM agent? | CTA |
|------|-------|------------|-----|
| 1 | **Сценарист** | да (Sonnet) | Dramaturgy JSON (`carousel-json-contract`); Top-right **«Передать задание»** → Дизайнеру. **Без** кнопки — только правки; **запрет** auto-handoff; N только из user |
| 2 | **Дизайнер** | да (describe Sonnet · draw image-2 bg + HTML composite) | **Layered Visual Engine S57** (scene bg + HTML invent + Puppeteer); Top: **«Нарисовать»** + **«Передать на публикацию»**. Flow: ack → описание → bg → HTML overlay → **visible** preview (P0: не чёрный; **S57:** type/CTA on HTML, not baked in image) |
| 3 | **Публикация** | **нет** | **«Опубликовать»** → draft Ours + `/schedule`. **Не** агент «Публицист»; caption/hashtags из JSON |

Chrome: segment switcher сверху (Button variants / 21st); **удалить** bottom-right «передать…» и bottom-left tools. Детали — `carousel-studio-handoff` + `carousel-json-contract`.

Превью: пусто до **«Нарисовать»**; после — **видимые** слайды справа (= N); L/R сбоку; C-131 crossfade. Markdown + fenced JSON в чате сценариста. Приёмка: **S41** + **S42**.

**Не carousel-engine:** шаги Designer/Публикация не монтировать в чужих Create. CapCut-export из Razbor — нет (C-30).

C-51 «Designer вне Razbor» **superseded C-59/C-62/wave2/wave3** только для `carousel-engine`. Wave2 «Publisher с чатом в Create» **superseded C-carousel-*** (Create only).

### Tab checkmark — только после handoff (UX wave 3)

| Состояние | UI таба агента |
|-----------|----------------|
| Агент открыт / пишет / генерирует | **без** галки |
| Пользователь нажал **«передать задание»** и handoff принят следующим | галка ✓ на **исходящем** агенте |
| Запрет | галка при mount, при первом bubble, при «Начать разбор» alone |

### Mesh / Settings sync (wave 2 + wave 3 per content-type + wave 8 MD)

Editable **prompt + rules** агента живут в `AgentPropertiesPanel` + Settings «Агенты»; packs в `agents/*.md` / workers — дефолты.

**Wave 3:** у **каждого** агента — **отдельные** prompt/rules **на каждый content-type** (moduleId / вид контента: `carousel-engine`, reels, graphics, …). Не один общий prompt на все модули. UI Settings/Mesh: переключатель вида контента → поля prompt/rules для этой пары `(agent, contentType)`. Brand Kit **удалён** — визуальный канон из `DESIGN.md`.

**Wave 8 (C-112 / C-113) → Team UX C-148/C-149:**

| Правило | Деталь |
|---------|--------|
| Copywriter per type | Модель данных / mesh знает: **каждый content-type = свой** copywriter/scriptwriter agent id (не shared singleton) |
| Prompt UI | **upload `.md`** instructions; показать **текущий filename** |
| Skills / Plugins | **File upload** (`.md` skill packs; `.md`/`.plugin` plugins) — **не** text-only list; filename visible |
| MCP | Binding с **website** (+ name, enabled; опц. transport, toolsSummary, authEnvKeys **имена**) — см. `xyflow-agent-mesh` C-149 |
| Trainer path | Пайплайн-Тренер: **поиск/добавление** plugins (WebSearch/GitHub/HF или catalog) → proposal → HITL |
| Запрет | Один `copywriter` на все moduleId; textarea как единственный способ добавить skill/plugin; MCP без website |

### `custom-reels` roles + montage IO — **C-151**

| UI label | Id (пример) | Делает |
|----------|-------------|--------|
| **Сценарист** | `scriptwriter` / reels script | Сценарий рилса (roles·plot·timing) — **не** «Copywriter» в UI |
| **Монтажёр рилсов** | `reel-editor` / montage | Cut / join / subs / effects по **сырым видео** (raw clips) — **не** «Дизайнер» слайдов |

| Вход монтажа | Выход |
|--------------|--------|
| Raw video clips (+ сценарий/субтитры brief) | Смонтированный рилс (preview/export path — Архитектор) |

**Запрет:** копировать carousel Designer/`design.md` chip и slide JSON на `custom-reels` без overrides (**C-152**).

### Per-module pipeline audit — **C-152**

| Правило | Деталь |
|---------|--------|
| Матрица | Каждый `moduleId` (carousel-engine, custom-reels, graphics, …) — **свои** агенты, handoff labels, IO contracts |
| Запрет | Один shared `DEFAULT_AGENTS` / copy-paste graph с чужими ролями (Дизайнер на рилсах, карусельный script на video) |
| Проверка | Архитектор + AI Bridge: таблица module → lane A/B в spec до кода Frontend |

### Competitor reel panel

- Показать reel конкурента: **play** + CapCut-like **timeline scrubber** (seek по прогрессу).
- No autoplay on open; scrubber sync с currentTime; Motion — `web-motion-engine` (дорого, коротко).

### Scriptwriter contract — по content-type (UX wave 3 → **JSON Dramaturgy wave**)

#### `carousel-engine` (Razbor + Create) — Dramaturgy & Hook Engine

**Не** использовать reels/video script (roles·plot·location spoken).  
**Канон:** skill **`carousel-json-contract`** + workers `script-writer` / `designer-carousel`.  
Wave3 minimal `{ text, colors }` **superseded** as sole handoff — colors optional; dramaturgy JSON + dynamic N **mandatory**.

Сценарист = **Dramaturgy & Hook Engine**. Дизайнер = **Diffusion Visual Engine** (Phase4).

```json
{
  "contentType": "carousel",
  "requested_slide_count": 7,
  "idea": "one-line concept",
  "hook": "cover/opening sense",
  "tone": "vernatun",
  "slides": [
    {
      "index": 1,
      "role": "cover",
      "headline": "≤6–8 words",
      "body": "",
      "swipe_trigger": "META engagement QA — why swipe next (NOT on-slide)",
      "visual_prompt": "RICH scene (≥3 elements) — light/materials/composition; cultural motifs OPTIONAL (no forced laundry list); NO letters; HTML types headline/body/secondary_copy",
      "secondary_copy": "MUCH wider HTML body detail (≥220 chars / ≥5 clauses) — value beat / example / micro-story — not 3 short sentences",
      "alt_text": "a11y",
      "colors": { "bg": "#…", "accent": "#…", "text": "#…" }
    }
  ],
  "cta_type": 4,
  "caption": "publish caption",
  "hashtags": ["#…"],
  "promptForDesigner": "human brief + slides[] pointer"
}
```

| HARD | |
|------|--|
| Dynamic N | `requested_slide_count` = **user request ONLY**; `slides.length` must match; **never** hardcode 5/8 |
| Captivating hook | Cover/`hook` = pattern interrupt (not flat label); see `carousel-json-contract` § Hook bar; Client **S45** |
| Vernatun | no infobusiness water; cultural hooks; cover ≤6–8 words |
| `swipe_trigger` | **Meta** engagement QA every slide («зачем дальше») — **NOT** on-slide copy; Designer ignores for paint |
| CTA catalog | User number **1–4** → `cta_type` + `cta_slide` (comments / subscribe / TG club / like+save); ask if missing — Client **S46** |
| Metadata | `caption` + `hashtags` + per-slide `alt_text` (upload-post-style) |
| Scriptwriter model | Default **Haiku 5.5 + thinking/reasoning** (`llm-model-catalog-notes`). **HIGVEN-3 wave:** keep **Haiku** (not Sonnet upgrade) |
| Prompts notes | `.claude/skills/carousel-json-contract/create-carousel-prompts-notes.md` → `create-carousel-prompts.ts` |
| Designer IO | Parse `slides[]` **any length**; layered HTML + Variant A `html_layout` **anchor variety**; safe Top≥120 Bottom≥160 Sides≥80; rich `visual_prompt`→bg; **FULL DESIGN** fonts/sizes/colors; Brand logo enlarged bottom-RIGHT + name-right-of-icon; slide-num own slot (body tokens); fontFit reduce-only; export `slide_01.png`…; draw `openai/gpt-5.4-image-2` |
| **HIGVEN-3 wave** | N=**3**; HITL **«Передать дизайнеру»**; Designer **parallel** `image_prompt`+`html_layout` ONE pack; `characterPaint=none`; full Vernatun PNG; AD no remake; card `pipeline-practice-higven-3.md` |
| Settings Design | **Tokens** (colors + typography scale + text-block + small-element) — LLM invents layout placement; start from DESIGN sizes; reduce-only if overflow |
| Art Director | After ready: **Gemini vision**; virality+design+completeness; no remake |
| Logo P0 | Logo set but name-only / name under icon / not bottom-RIGHT = FAIL |
| Preview P0 | «готово» + images generated + **black preview** / panorama-as-UI = FAIL |
| Logo P0 | Brand logo set but name-only / name under icon / not bottom-RIGHT / tiny mark = FAIL (dual-path + chrome) |

**Handoff → Designer:** machine-readable JSON artifact **plus** short human brief. One-liner only `карусель {N} · текст · цвета` — **insufficient** alone.  
**Create HITL (HIGVEN-3 / practice):** after Scriptwriter — user must click **«Передать дизайнеру»** (chat + button). **No** auto-handoff.  
Mock/fixtures must use **variable** N and full dramaturgy fields — not a fixed 4-slide stub as product truth. **HIGVEN-3 smoke** may lock N=3 deliberately.

#### Reels / video modules — Сценарист → Монтажёр (**C-151** + **C-reels-scriptwriter-upgrade**)

UI: **Сценарист** (не Copywriter) → **Монтажёр рилсов** (не Designer).  
**Канон skill:** `.claude/skills/reels-scriptwriter/SKILL.md` — AI Bridge обязан усилить `lib/mesh/agent-defaults.ts` `custom-reels` copywriterPrompt/rules под этот контракт.

```json
{
  "contentType": "reels",
  "durationSec": 22,
  "hook": { "t0": 0, "t1": 2, "onScreen": "…", "vo": "…" },
  "beats": [
    { "t0": 2, "t1": 8, "label": "value", "onScreen": "…", "vo": "…" }
  ],
  "cta": { "t0": 16, "t1": 22, "onScreen": "…", "vo": "…", "captionLine": "…" },
  "roles": ["host", "guest"],
  "plot": "short beat outline (optional alias)",
  "text": "full spoken / on-screen copy (optional alias)",
  "location": "set / place",
  "caption": "…",
  "promptForMontage": "cut/join/subs/effects brief for raw clips"
}
```

| HARD | |
|------|--|
| Hook | **0–2s** pattern interrupt; on-screen readable mute |
| Beats | 2–4 value beats with timing |
| CTA | Explicit on-screen **and** caption; last 3–5s |
| Duration | 15–30s vertical 9:16 |
| Handoff | `promptForMontage` + hook/beats/cta (legacy plot/text OK as wrappers) |
| FAIL | Flat VO / no hook / no CTA / carousel `slides[]` as deliverable |

| Handoff | Контракт |
|---------|----------|
| Сценарист → Монтажёр | `promptForMontage` + hook/beats/cta |
| Вход Монтажёра | **raw videos** (clips) + brief; операции: cut / join / subs / effects |
| Запрет | Slide/`design.md` carousel Designer IO на этом moduleId |

Client **S44** rejects weak reels scripts. Mock reels fixtures must include hook≤2s + CTA — not plot-only stubs.

### Publisher complete → drafts + calendar (UX wave 3)

После **Дизайнер готов** + пользователь выбрал **дату/время** у Публициста и подтвердил слот (HITL, не silent publish) — **и** Create step **«Опубликовать»** (**C-drafts-always**):

1. Создать/обновить **черновик** во вкладке **Ours → Черновики** того же moduleId — **обязательно**; пустой rail после успеха = FAIL.
2. Поставить слот на **`/schedule`** на **выбранную дату** (видимый event; sync с датой под карточкой черновика).
3. Не публиковать в соцсети без отдельного HITL approve.
4. Designer paint: tokens from Settings Embla **active DESIGN.md** (`C-settings-design-md-carousel`).

Архитектор: wire draft store + schedule persist; Frontend: UI; Backend при необходимости API.

### UX wave 4 — Publisher follows calendar + площадка

| Правило | Деталь |
|---------|--------|
| Sync | Дата/время публициста ↔ слот `/schedule`: DnD дата↔дата или смена в popup обновляет UI публициста; выбор у публициста пишет/обновляет слот |
| Площадка | Параметр `platformId` (Settings Platforms CRUD); picker в Create/Razbor Publisher и на слоте |
| HITL | Публикация в соцсеть только после апрува; календарь = очередь |

## Live Instagram discovery

**Goal:** Researcher + Analyst опираются на реальные карусели и реальные метрики, когда feed приходит с `sourceMode: "live"`.

### Allowed source (Backend only)

Два **server-side** контура (оба OK; не путать env):

| Path | Env (имена) | Типичное использование |
|------|-------------|------------------------|
| **A. Meta Graph** | `IG_USER_ID` + `INSTAGRAM_ACCESS_TOKEN` / aliases | Ours / legacy hashtag `top_media` (C-38→C-39) |
| **B. Apify Instagram Scraper** | `IG_SCRAPER_API_KEY` (+ optional `IG_SCRAPER_BASE_URL`) | **Scout-only (S52):** paid run via Team **«Разведать»** / auto-scout schedule → snapshot → Studio «Конкуренты». Feed GET **не** вызывает Apify. Map/sort — `backend` + `apify-scraper-cost-discipline.md` |

- Graph **Primary (legacy):** Hashtag Search + `top_media` by topic-derived hashtags; **Fallback only:** Business Discovery via optional `IG_COMPETITOR_USERNAMES`.
- Scraper **Primary (wave W-2026-10-09-ig-scraper-live):** hashtag niche scrape → map CAROUSEL vs REEL → sort by popularity → replace mock competitors when live OK.
- Soft-fail (нет ключа / rate limit / empty) → **mock** feed. Agents must accept mock without inventing URLs or “live” numbers.
- **Forbidden:** Instagram HTML scraping **in the browser**; embedding tokens in agent packs; logging `IG_SCRAPER_API_KEY` / Graph tokens. Client never calls Apify directly.

### Topic → hashtags (C-38)

Deterministic mapper (no LLM key). Shared JSON:

```json
{
  "topic": "гостевой вечер",
  "hashtags": ["guestnight", "armenianclub", "yerevan"],
  "source": "deterministic_mapper",
  "emptyTopic": false
}
```

| Field | Rule |
|-------|------|
| `topic` | Trimmed input; empty → `""` |
| `hashtags` | 1–5 lowercase, no `#`; Backend queries **first 3** |
| `source` | `"deterministic_mapper"` (this wave) |
| `emptyTopic` | `true` if topic trim empty |

**Empty topic:** env `IG_DEFAULT_HASHTAGS` else `armenianclub`, `yerevan`, `armenianfood`, `guestnight`.

Researcher output adds required `instagramHashtags` on carousel path. Exact alias table + Graph calls = Backend **C-39** (not this skill’s code).

### Env key names (values live in `.env` only)

| Key | Role |
|-----|------|
| `IG_OURS_USERNAME` | Our handle; default `mosarmclub` |
| `IG_DEFAULT_HASHTAGS` | Optional empty-topic hashtag override (comma-separated bare names) |
| `IG_COMPETITOR_USERNAMES` | Comma-separated; **optional BD fallback only** (not primary discovery) |
| `INSTAGRAM_ACCESS_TOKEN` \| `INSTAGRAM_GRAPH_TOKEN` \| `IG_ACCESS_TOKEN` | Graph live token (never in prompts/logs) |
| `IG_SCRAPER_API_KEY` | Apify (or compatible) scraper key for competitors path — **not** Graph |
| `IG_SCRAPER_BASE_URL` | Optional scraper base URL |

### Agent contract (C-35 + C-38)

| Mode | Researcher | Analyst / Razbor |
|------|------------|------------------|
| `live` | Facts from provided posts; `instagramHashtags` required; optional `liveHandles` / `observedPosts` | Must cite real likes / views / comments / slideCount; username/permalink only if given |
| `mock` | Trends/angles as before; still emit `instagramHashtags`; live fields optional/absent | Deterministic C-30 templates OK |

Packs: `agents/researcher.md`, `agents/analyst.md`, `workers/researcher/SKILL.md` (`researcher@v3`), `workers/analyst/prompt.md` (`analyst@v2`).

### Wave order

1. **C-35** — agent packs + skill live/mock (done)
2. **C-36 / C-37** — prior feed/UI waves
3. **C-38** — topic→hashtags packs + skill (this ticket; **no Graph client**)
4. **C-39** — hashtag feed route / Graph client / mapper util
5. **C-40** — Studio UI topic refetch

Do not implement Graph fetch or Studio UI in C-38 AI Bridge work.
