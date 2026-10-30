# Content Factory UI — Dark Luxury Studio

## When

Любой экран Vernatun Content Factory: `/studio`, `/studio/[moduleId]`, `/studio/inspect/:id`, `/admin/mesh`, `/schedule`, `/analytics`, `/settings`, App Shell. **Не** `/brand-kit` (удалён UX wave 2 → Settings / DESIGN.md).
Референсы: `stitch_armenian_club_brandbook/` + `ARCHITECTURE.md` §2.

## Must follow

1. Тема **Deep Matte Dark Luxury** — не светлая, не purple-gradient AI-slop.
2. Токены из `ARCHITECTURE.md`:
   - Canvas `#08090A` / `#0D0F12`
   - Glass `rgba(255,255,255,0.03)` + border `rgba(255,255,255,0.08)`
   - Accent Cobalt `#2563EB`, Gold `#D4A359`, Terracotta `#C86446`
3. Шрифты: UI **Century Gothic** (`--font-ui` в `app/globals.css`); mono JetBrains Mono; **Noto Sans Armenian** для hy-текста. Body = Century Gothic; Inter/Plus Jakarta — **не** default UI после C-26.
4. **Источник компонентов:** skill **`21st-ui-catalog`** + MCP `21st` — красивые **анимированные** паттерны с 21st.dev, не стоковый div/shadcn.
5. Локальные `GlassCard` / `NeonBadge` / `ReactiveButton` — только reuse уже адаптированных или fallback, если 21st недоступен.
6. Framer Motion spring `{ damping: 25, stiffness: 300 }` (и motion из 21st — сохранять).
7. Stitch HTML — источник **композиции** экрана; визуальные кирпичи — с 21st + ретокены.

## Nav / route loading — UX wave 2 (как обычный сайт)

Симптом после C-63: первые клики по разделам **всё ещё долгие**; пользователь хочет ощущение **обычного сайта**, не «тяжёлого SPA».

| Правило | Деталь |
|---------|--------|
| Цель | Первый клик сайдбар → целевой экран: shell **сразу**, контент **сразу или skeleton**; без blank / full fade |
| Бюджет | Perceived **≤300–500ms** до видимого chrome маршрута (не «≤1s и ладно»). Холодный первый заход в тяжёлый chunk (mesh/analytics) — skeleton, не зависание клика |
| Запрет motion | **Не** `initial={{ opacity: 0 }}` / full-page `opacity: 0` на enter (`web-motion-engine`) |
| Prefetch | MenuVertical / `next/link`: **prefetch** на hover/viewport; не ждать тяжёлый client fetch перед paint |
| Loading UI | `loading.tsx` / skeleton колонки — OK; shell (sidebar) **никогда** не гаснет |
| Dynamic import | Тяжёлое (mesh canvas, charts, Razbor/Create modals) — `dynamic()` **после** первого paint маршрута |
| Удалить маршрут | `/brand-kit` и nav-пункт **убрать** (см. § Brand Kit removal) — меньше surface + меньше loading.tsx |

### Обязательные замеры (до «готово» по скорости)

Не принимать «кажется быстрее» без цифр:

1. **Playwright** (Клиент/Тестер): cold navigate Studio → Schedule → Analytics → Settings → Холст (OWNER) → Studio; лог `performance.now()` / Navigation Timing от click до `domcontentloaded` + до появления title маршрута.
2. **chrome-devtools** Performance / Network: TTFB, JS chunk size первого визита, long tasks >50ms на click.
3. Записать числа в `memory/tickets/<id>/guards.md` или smoke-скрипт (мс, не «OK»).
4. Регресс: повторный клик по уже посещённому разделу ≈ мгновенный (кэш RSC/chunk).

Файлы: `app/**/loading.tsx`, `AppShell`, `SidebarNavigation` / MenuVertical, dynamic imports mesh/analytics/modals.

### Module workspace slow load — **C-144** (root-cause + fix)

Симптом: `/studio/[moduleId]` (и сетка модулей) **очень долго** грузятся.

| Шаг | Обязанность |
|-----|-------------|
| 1. Measure | chrome-devtools Network + Performance: какой chunk / API / waterfall держит first paint (не гадать) |
| 2. Typical suspects | Barrel import всего `components/mesh`/`analytics` в studio path; sync Apify/IG на SSR; тяжёлый Remotion/HeyGen в initial graph; нет `dynamic()`; waterfall N+1 feed; blocking fonts |
| 3. Fix | Split chunks; `dynamic()` after first paint; defer live scraper; skeleton columns; prefetch module routes on Launchpad hover |
| 4. Guard | Числа до/после в `memory/tickets/C-144-*/guards.md` (мс cold click Launchpad → module title visible) |

Skill-пара: **`web-perf-motion`** § Studio modules. Frontend + Backend (если API) по `chain.md`.

## 21st.dev (обязательно при доступном MCP)

На каждый новый UI-кирпич: `search` → сам pick (с animation) → `get_component` → adapt под токены выше. Не `search_picker`, не спрашивать пользователя.

## Studio Launchpad chrome (`/studio`)

Чистый Launchpad = бренд/заголовок + **одна** описательная часть + сетка модулей («Каналы рендера»).

**Убрать (флуд-статус / mock-шум), если пользователь просит cleanup:**

- `// SPEED PROTOCOL ACTIVE`
- отдельная hy-строка «Բարև — Vernatun…» в шапке (если дублирует бренд Shell)
- бейдж `Engine: Standby` / `Mock pipeline · no SSE`

### UX wave 4 — каналы + copy

| Правило | Деталь |
|---------|--------|
| Новые каналы | В сетку **обязательно** плитки **«Статьи на сайт»** и **«Статьи в TG»** (moduleId по спеке Архитектора, напр. `site-articles` / `tg-articles`; RU title+description; CORE/product через SDK) |
| Одна описательная часть | **Один** человеческий RU абзац про студию/каналы. **Удалить** «Выберите модуль…» / «Выберите модуль — откроется…» из `StudioPageClient`, `ModuleSelectorGrid` и дублей |
| Запрет | Два supporting sentence подряд; EN «Target Render Channels» как title (RU: «Каналы рендера») |

Оставить: **русский** заголовок «Студия». Английский `Studio Launchpad` **запрещён** (C-46 **superseded** C-54). Файлы: `app/studio/page.tsx`, `ModuleSelectorGrid`, manifests / `content-module-sdk`.

### Module tiles hover — UX wave 5 (C-82)

На плитках каналов / модулей Launchpad:

| Нужно | Запрещено |
|-------|-----------|
| Hover = лёгкий glass lift / cobalt border токена / spring scale ≤1.02 | Серый **stock** outline / `outline` / `ring-gray-*` / default browser focus-ring как «рамка карточки» |
| Focus-visible = cobalt/accessibility ring по токену | `hover:border-gray-*`, `outline: 1px solid #999`, shadcn default muted ring |

Файлы: `ModuleSelectorGrid`, `GlassCard` (если outline живёт там).

## Mission Control / команда запуска — UX wave 4

Верхняя зона запуска (Command Bar / workflow strip) **не** ряд отдельных workflow-кнопок.

| Правило | Деталь |
|---------|--------|
| UI | Сверху — **`CompactMultiButton` / `MultiButton`** из **`components/ui/multi-button.tsx`** (полный paste; Dark Luxury; `framer-motion`) |
| Режим | `CompactMultiButton` + `selectedId` для режима/агента; не плодить второй компонент |
| Запрет | Стоковые pills «workflow» вместо MultiButton; purple highlight; EN «Input Neural Seed»; mono `//` eyebrow |
| Copy | Заголовок зоны — человеческий RU (напр. «Команда запуска») |

### Mesh «Команда выпуска» — **C-138…C-143** (supersedes MultiButton + xyflow + copy-TZ)

Канон: skill **`xyflow-agent-mesh`** + эталон `code_artifact.html`. UI-слой:

| ID | Правило |
|----|---------|
| **C-138** | **Удалить** `MultiButton` / `MeshPipelineSwitcher` / любой content-type switcher **со всех** страниц «Команда выпуска». Смена типа = другой module workspace, не switcher на схеме |
| **C-139** | Схема = **static HTML/CSS/SVG** (не ReactFlow infinite canvas). Dual-lane; gap-28/32; solid short labels; dashed Trainer→release **без** mid-text |
| **C-140** | User brief = **editable combat prompt** per module → AI + chat topic (не mock) |
| **C-141** | Pan схемы: LMB + finger drag |
| **C-142** | Arrow ports = vertical **CENTER** карточек |
| **C-143** | **DELETE** «Скопировать ТЗ для Cursor» / «Загрузить ТЗ» — top bar = title + subtitle **only** |
| **C-146** | **DELETE** reset-to-template + hint-copy у User brief |
| **C-147** | Title **всегда** `Команда выпуска: {ModuleName}` |
| **C-148** | Skills/Plugins = **file upload** (`.md` / `.plugin`); Trainer «Найти/добавить плагин» |
| **C-149** | MCP карточки: **website** + name/enabled (+ transport/tools/authEnvKeys имена) |
| **C-150** | Scout inspector **без** MultiButton типов контента |
| **C-151** | `custom-reels`: **Монтажёр рилсов** / **Сценарист** (не Designer/Copywriter) |

#### Top bar (C-138 → **C-143 / C-147**)

| Нужно | Запрещено |
|-------|-----------|
| Title **`Команда выпуска: {ModuleName}`** (стиль как «Студия») | Голый «Команда выпуска»; MultiButton / MeshPipelineSwitcher |
| Subtitle (одна RU строка) | KPI Задачи / Задержка / GPU |
| **Никакой** copy/upload TZ CTA | «Скопировать ТЗ…» / «Загрузить ТЗ…»; debug eyebrows; refresh «выровнять» |

#### User / Designer / Drawer

| Поверхность | Правило |
|-------------|---------|
| User | **Не агент** — accordion **editable** brief **in-place**; **NO drawer**; **NO** reset-to-template; **NO** hint blurbs (**C-146**); persist per moduleId; wire → LLM + topic |
| Designer card | Attached chip **`design.md`** на карточке (**carousel**); на **custom-reels** — роль **Монтажёр рилсов** (**C-151**) |
| Agent click | Drawer **3 tabs**: (1) **Инструкция** = prompt only + `.md` upload; (2) **Скиллы & Инструменты** = Skills → Plugins → MCP с **file upload** + MCP website props; (3) **Модель** = LLM + temp + maxTokens — **NO timeout** |
| Scout | Settings **текущего** module pipeline; **нет** content-type MultiButton в inspector (**C-150**) |
| Width | Resizable OK; persist `cf.mesh.inspector.width` (migrate old `cf.mesh.agent-panel.width`) |

Файлы: release-team / mesh page shell, static flowchart components, inspector drawer — см. `xyflow-agent-mesh`. **Не** возвращать `MeshPipelineSwitcher` / copy-TZ.

#### Архив (не применять на «Команда выпуска»)

C-83…C-98 MultiButton chamfer/vertical, C-89 KPI+MultiButton row, C-90 flat AgentPropertiesPanel как primary, C-138 copy-TZ button — **superseded** C-139…C-143. Mission Control / Razbor MultiButton **вне** этого экрана — без изменений.

### Agents MultiButton — UX wave 6 (C-96) → **Team only after C-145**

Те же правила chamfer-left-smooth, что mesh C-88: flush-left, `rounded-lg` chamfer (не pill), плавный hover width, полные RU labels.  
**C-145:** фильтры content-type / agent — на **«Команда выпуска»**, не в `SettingsShell`.

Агенты в UI (согласовать с `content-pipeline-agents`):

| RU label | Роль | Не путать с |
|----------|------|-------------|
| **Scout / Разведчик** | collect+filter | Аналитик / Разборщик |
| **Разборщик** | разбор **чужого** (Razbor competitor) | Аналитик / Тренер |
| **Аналитик** | анализ + выводы (`/analytics`, mesh) | Разборщик |
| **Тренер** (пайплайн) | skill/plugin patches по выводам | Cursor-Тренер команды |
| **Копирайтер** | **per content-type** (C-112) | один shared на все модули |

**C-105:** везде, где UI писал «Аналитик» для разбора чужого → **«Разборщик»**.

Файлы: `FloatingCommandBar` / Mission Control, `multi-button.tsx`, mesh, Settings.

## ModuleSelectorGrid — высота и описание

- Базовый `min-h` карточек: **252px** (было 168 → ×1.5), включая dashed Add-слот — тот же floor.
- Описание модуля: `text-pretty` + размер/`clamp` так, чтобы **весь** title+description+badge вмещались без обрезки; **не** прятать продуктовый текст агрессивным `line-clamp-1/2`, если пользователь явно просит «весь текст».
- Не раздувать карточки ради пустоты: рост высоты = под полный copy, не под декоративный air.

Файлы: `components/studio/ModuleSelectorGrid.tsx` (± токены в `GlassCard` только если уже правят этот путь).

### C-57 — без счётчика выбора

Убрать chrome «Ничего не выбрано» / «1 выбран» (и любой selection counter) с Launchpad. Выбор модуля = переход по ссылке, не витрина счётчика. Не возвращать без нового тикета.

## Module Workspace chrome (`/studio/[moduleId]`) — C-49+

Workspace ≠ Launchpad. Экран модуля = dual feed (ours / competitors) + действия на карточке. Не вешать лишние «витрины».

**Убрать (если тикет просит cleanup workspace):**

- Секции / заголовки «Опубликованные посты модуля» и «Актуальные карусели ниши» (и любые дублирующие label-баннеры над колонками).
- `ModuleIdeaBar` (topic top bar) — идея/топик не живут отдельной полосой над фидом в этой волне; C-28 «ModuleIdeaBar обязателен» **superseded** C-49.
- Автозапуск видео на карточках фида.

**Сохранить / выровнять:**

- Dual `VerticalPostCarousel` (ours + competitors) + Drafts / Razbor CTA на карточках.
- Competitors search bar: **та же высота**, что у Ours `published/drafts` toggle (одна визуальная «шапка» колонки).
- Visual parity ours vs competitors: одинаковый grid, aspect, glass card chrome, typography, gaps — без «бедной» vs «богатой» колонки.
- Файлы: `StudioModuleWorkspace`, `VerticalPostCarousel`, `FeedPostCard`, `ModuleIdeaBar` (удаление / unmount).

### Workspace polish — C-61 + C-62 drafts

- Убрать подпись **`// Рабочая страница модуля`** (и любой debug-chrome пути модуля в шапке).
- Кнопка **«Создать»** справа сверху **на каждом** `/studio/[moduleId]` (общий Create). На **`carousel-engine`** дополнительно / вместо общего — канон **«Создать карусель»** → `CreateCarouselModal` (см. § ниже). Паттерн **21st glow-button** (`21st-ui-catalog`); glow = Cobalt/Gold Dark Luxury, **не** purple neon slop (`taste-skill` Lila). Fallback: существующий `ReactiveButton` + тонкий cobalt glow, если MCP 21st недоступен.
- **Nested scroll:** колёсико/палец крутят **только колонку под курсором**. На колонки: `overscroll-behavior: contain` (`overscroll-contain`) + изолированный `overflow-y`. Не пробрасывать wheel на `body`/соседнюю колонку. Touch: `mobile-touch-scroll`.
- **Черновики (C-62):** карточки **того же размера**, что published. Под карточкой — **дата слота** (scheduled), если назначена.
- **Persist drafts (C-156 → Sprint 8 supersede):** до Sprint 8 SoT = zustand + `persist` (`cf.carousel.drafts.v1`). **После 8.2/8.6:** SoT = **Postgres via API**; zustand = **cache/optimistic UI only** (optional persist как offline buffer — Architect lock). После F5 drafts читаются с API. **Запрет:** только React state; silent wipe; секреты в blob; UI shell redesign ради persist.
- **Always save Create → Черновики (`C-drafts-always` P0):** после успешного Create (`«Опубликовать»` **и** после успешного Designer draw, если Architect lock: draft-on-draw) карточка **обязана** появиться во вкладке **Опубликовано/Черновики → Черновики**. Пользователь «создал карусель, в Черновиках пусто» = **FAIL**. Не полагаться только на schedule slot без drafts rail. Wire: `publishCreateCarousel` / draw success → upsert draft (**API** после Sprint 8) + cache; toggle **Черновики** показывает карточку без F5.

### Frontend-minimal — Sprint 8 Postgres SoT (shell freeze)

Когда chain = **Frontend-minimal** (`DEV_PLAN` 8.6 + wire 8.2–8.5):

| Делать | Не делать |
|--------|-----------|
| Заменить persist SoT: drafts / boards / schedule slots / design library → **fetch API** | Redesign AppShell, Sidebar, nav IA, feed chrome, Create/Razbor layout |
| One-shot import: read legacy keys → `POST` import → mark migrated / clear SoT keys | Touch `cf.sidebar.width` / popup pos / rail width (это **UI chrome**, не SoT) |
| Keep existing components; swap `lib/studio/carousel-drafts-store`, `boards-store`, `lib/schedule/storage`, `lib/settings/design-library` data layer | New 21st screens «пока мигрируем» |
| Optimistic zustand OK; revalidate from server after mutate | Dual-write forever without Architect deprecation plan |
| Soft-fail: no `DATABASE_URL` → Architect lock (JSON fallback **или** explicit error) — не silent empty wipe | Social publish buttons / Meta push |

**shell_freeze: true** — любой diff в `AppShell` / `SidebarNavigation` / MenuVertical / left nav labels = **FAIL** волны.


### Карусели workspace — 9:16 stack (UX wave 2) + layout wave 3

Канон фида **`carousel-engine`** (ours + competitors + drafts):

| Нужно | Запрещено |
|-------|-----------|
| Вертикальный **stack** превью **9:16** | Multi-column thumb mosaic / «плитка» |
| Карточка **≈ в 2 раза меньше** текущего UX-wave1 размера (scale ~0.5 по ширине колонки / max-width; высота пропорционально 9:16) | Огромные full-column cards wave1; крошечная сетка-мозаика |
| **Smooth crossfade** слайда (**C-131**, supersedes wave3 hard cut) — overlapping fade A↔B, **без** чёрной вспышки / empty frame | Hard cut wave3; fade-to-black; unmount-then-mount с `bg-black` gap; сток Unsplash |
| Видимый CTA **«Разбор»** без hover | `opacity-0` / hover-only |
| L/R слайдов — **только** в Razbor / CreateCarouselModal preview, **сбоку** превью | L/R на feed-карточке |
| Preview index **S47:** `current/total` (напр. **5/8**) Century Gothic — **в** Razbor/Create preview | Старый ban «Слайд N/N» wave2 **superseded S47** (формат без слова «Слайд» OK: `5/8`) |
| **S48 preload:** при **open** Razbor/Create modal — **preload всех** `slides[]` image URLs (decode/`<link rel=preload>` / hidden img stack) **до** первого swipe | Lazy-load only-current → **hang / blank** на L/R; refetch на каждый swipe |
| **S48 motion:** смена слайда = **expensive horizontal L/R** (см. `web-motion-engine` § S48) + без reload hang | Только C-131 crossfade без горизонтали; network wait mid-swipe |

### FeedPostCard chrome — **S47** → **S48** → **S49** (supersedes C-37 badge-on-card + caption row)

Канон карточки dual-feed (`carousel-engine` + **все** модули с `FeedPostCard` — см. § Module parity S48):

| Нужно | Запрещено |
|-------|-----------|
| **S49 Competitors plaque** | **Top-left** одна чёрная plaque: **`{channelName} | {followers}`** внутри plaque (followers **после** `|`, не отдельным текстом справа). White Century Gothic. Scale ≈ S48 1.5× | Followers **снаружи** / справа от plaque (S48 side-by-side); EN `1.5K` only; бейдж **«Онлайн · Instagram»** |
| **S49 Ours cards** | **НЕТ** name/followers plaque вообще (чистый media + engagement если есть; без username chrome) | Plaque с именем/фолловерами на **Наши** / Drafts / Published ours |
| **Bottom-center на фото** engagement: icons + counts — **views · likes · comments · shares · saves**; Century Gothic; читаемо @1440 | Метрики только под карточкой / серый muted / Inter; пропуск shares/saves |
| **S48 metrics scale** | Ряд engagement **≈2×** S47 (icon + count). Все 5 метрик **обязательны**, если API отдаёт; missing slot = показать `0` / `—` по спеке, **не** скрывать иконку без причины | Tiny S47 metrics; «три метрики хватит» |
| Чистый media + overlays выше | Tags **«Конкуренты»** / **«Наши»** на карточке; bottom **caption / post text** под фото |
| Live proof = **competitors plaque `name \| Nк` + читаемые metrics** на snapshot | Требовать бейдж «Онлайн»; требовать plaque на Ours |
| **S48 «Разбор» CTA** | Кнопка **всегда видна**, **не clipped** на нижних карточках stack. Contrast idle ≥ читаемый @1440 | `overflow-hidden` обрезает «Разбор»; hover-only |

#### Dual-feed chrome — **S49 HARD** (workspace header + clip) → **S50 CRITICAL**

| Правило | Деталь |
|---------|--------|
| **Ours top row** | **Простой toggle** **Опубликовано / Черновики** (как segment Published/Drafts — **не** MultiButton / CompactMultiButton). **Слева** toggle; **справа в том же ряду** — search. Один row, одна baseline |
| **Labels white** | Текст **Опубликовано**, **Черновики**, **счётчики count** — **белый** Century Gothic (не muted gray / not-selected dim to unreadable) |
| **Bottom clip (S50 HARD)** | Нижняя граница feed = **минимальный** bottom bar. **Запрещена** толстая чёрная полоса / dead field, **обрезающая** карусельные карточки. Cards fully visible @1440; chrome = thin strip only |
| **Boards (S50→S51 HARD)** | Dropdown **opens FROM** the **«Доски»** segment button **next to Конкуренты** — **запрещены** extra Boards buttons / second chrome. **Double-click** board name → rename. Selected board name **replaces** the word «Доски» on that segment. Upload = **icon only**, **always** visible **right of filter** (active on Доски; **gray disabled** on Конкуренты) so toolbar **does not jump** on mode switch. **Удалить** badge/count **«1»**; **удалить** helper «Локально · несколько кадров…». **Board cards = NO metrics** |
| **Sort + filter (S50)** | На **обеих** колонках (Наши + Конкуренты): controls **sort + filter слева от search** (один toolbar row) |
| **Column headers (S50)** | **Удалить** оранжевые dots / accent bullets **слева** от **Наши** / **Конкуренты** |
| **Module title (S50)** | **Удалить** «**(4:5)**» / aspect suffix из заголовка модуля каруселей |
| Запрет | Thick bottom clipping; MultiButton Published/Drafts; search без sort/filter слева; серые labels; Boards не из segment / extra buttons / UI jump on toggle; «1» на Доски; orange dots; «(4:5)» в title; metrics на board cards; Upload text-label / Upload disappears in Competitors |

`sourceMode` / live vs mock — по-прежнему в API; UI-карточка **не** показывает «Онлайн · Instagram». Колоночные заголовки Ours/Competitors — отдельно от tags **на карточке**.

Файлы: `FeedPostCard`, `VerticalPostCarousel`, `StudioModuleWorkspace`, Boards upload chrome, metrics map из `post.metrics` + followers.

#### Dual carousel layout — UX wave 3

| Viewport | Layout |
|----------|--------|
| Desktop (≥ md) | **Ours + Competitors в одном ряду** (две колонки side-by-side), каждая — свой vertical stack |
| Mobile (< md) | **По одной** колонке (stack вертикально: сначала Ours, ниже Competitors / или tabs — по спеке Архитектора; не две узкие колонки в ряд) |

**Dual-feed density (C-120, supersedes C-118 single-col):** when user asks — cards ~2× smaller, **2-up** (`grid-cols-2`) inside *each* Наши/Конкуренты `VerticalPostCarousel` for all Studio modules using it; keep readable metrics; Client Playwright-mandatory.

**Scrollbar:** колонки stack / modal preview — styled visible; чат агентов — Claude-hide.

#### Live competitors = **last Scout snapshot** (Apify **not** on feed) — `carousel-engine` + `custom-reels`

**S52 Scout bind:** колонка **Конкуренты** показывает **последний snapshot Scout**. Открытие / focus / remount / SWR feed **никогда** не триггерит Apify. Платный scrape — только Team Scout **«Разведать»** или auto-scout schedule (Backend).

Backend: `GET …/feed` → snapshot (`sourceMode: "live"` when snapshot exists). Frontend:

| Нужно | Запрещено |
|-------|-----------|
| Показать **реальные** metrics с snapshot (S47 plaque + engagement) | Вызов refresh/scrape API при mount Competitors; «подтянуть live» на каждый focus |
| Username plaque top-left (S47) | Badge **«Онлайн · Instagram»** на карточке |
| Тот же dual-feed chrome для `custom-reels` и `carousel-engine` | Вызов Apify / `IG_SCRAPER_*` из браузера; silent paid refetch |
| C-52/C-61: нет pulse chrome при refetch snapshot | Скелетоны поверх уже загруженных карточек; mock как «live» при непустом snapshot |

Секреты scraper — только server `.env`; UI не знает Apify — только `sourceMode`. Пустой snapshot → empty/mock soft-fail UI, **без** auto-scrape.

### CreateCarouselModal — «Создать карусель» (**C-carousel-*** supersedes wave 2/3 Create chrome)

CTA: **«Создать карусель»** на `carousel-engine`. Полный канон: **`carousel-studio-handoff`**.

Модалка = **чат | превью** (desktop side-by-side; mobile tabs).

**Top chrome:**

| Нужно | Запрещено |
|-------|-----------|
| Segment шагов: **Сценарист · Дизайнер · Публикация** — shadcn/`Button` variants (21st button variants); Dark Luxury tokens | MultiButton / CompactMultiButton как agent switcher **в Create** |
| Справа сверху: **«Передать задание»** (тот же Button-стиль); у Дизайнера дополнительно **«Нарисовать»** | Bottom-right «передать…»; bottom-left **tools** |
| Интегрировать `components/ui/button.tsx` + `@radix-ui/react-slot` + `class-variance-authority` при необходимости | Залить чужой `--hu-*` theme поверх Vernatun без map на Canvas/Glass/Cobalt |

**Шаги:**

| Порядок | Label | Чат | CTA |
|---------|-------|-----|-----|
| 1 | Сценарист | да (`PromptBox` + mic); **markdown** ответы; **«?» CTA hint** (ниже) | Top **«Передать задание»** → Дизайнер. Без кнопки — только «понравилось? / правки»; **no auto-handoff** |
| 2 | Дизайнер | да; ack «получил задание» → описание кадров | **«Нарисовать»** → preview; **«Передать на публикацию»** |
| 3 | **Публикация** | нет LLM-агента | дата/площадка + **«Опубликовать»** → Черновики + `/schedule` |

#### Scriptwriter CTA cheat sheet — «?» (**C-scriptwriter-swipe-cta** / S46)

На шаге **Сценарист** в Create chat chrome:

| Нужно | Запрещено |
|-------|-----------|
| Кнопка **«?»** **top-right** панели чата Сценариста (не путать с top «Передать задание») | Прятать cheat sheet в drawer Settings / Team |
| Click «?» → popover / glass panel с каталогом **CTA 1–4** (cheat sheet) | Длинный markdown dump в system chat без UI |
| Copy cheat sheet (коротко, RU): **1** вопрос→комментарии · **2** ещё подобного→подписка · **3** живые встречи клуба→TG в шапке профиля · **4** лайк+сохранить | Свой 5-й CTA; EN-only; purple tooltip slop |
| `data-testid`: `create-scriptwriter-cta-hint` (+ panel `…-panel`) | Hint на шаге Дизайнер/Публикация как primary |

User пишет номер в чат → Scriptwriter overlay/`cta_type` (см. `carousel-json-contract` + `create-carousel-prompts-notes`). Frontend **не** подменяет JSON — только показывает шпаргалку.

**Удалить** агента/pane **Публицист** из Create. Wave2 «Publisher с чатом» / MultiButton footer handoff в Create — **superseded**.

Каскад **не** на mount. No-mock LLM (`carousel-studio-handoff` + `ai-bridge`).

**Правый регион — превью:**

| Нужно | Запрещено |
|-------|-----------|
| 9:16; **пусто** до успешного **«Нарисовать»** | Фейковые/mock слайды до draw |
| L/R **сбоку**; instant cut (wave3) | «Слайд N/N»; dark fade |

Composer footer Create: **send + mic** (PromptBox) — **без** handoff/tools внизу. Закрытие: overlay / Esc / close.

### Все модули фабрики — C-53 (не только carousel-engine)

`StudioModuleWorkspace` один на **все** `/studio/[moduleId]` (CORE + product tiles: карусели, картинки, мульт, HeyGen, рилс, нарезки, инфо-видео).

- Слева (ours): тумблер **Опубликовано / Черновики** на каждом модуле, не gated `moduleId === 'carousel-engine'`.
- На карточках конкурентов: кнопка **Разбор** на каждом модуле; те же агенты C-51 (Analyst → Scriptwriter, welcome + «Начать разбор»). Не прятать CTA за «это не карусель».
- Не плодить отдельный workspace-shell на модуль, если достаточно тех же колонок + media-aware карточки.

### Dual feed loading — stale-while-revalidate (C-52)

Корень моргания: `VerticalPostCarousel` подменяет уже показанные посты pulse-скелетонами, когда `loading` / `competitorsLoading` true (часто `feedLoading || competitorsLoading` из workspace).

| Состояние | UI |
|-----------|-----|
| Первая загрузка, список **пустой** | pulse-скелетоны OK |
| Рефетч / поиск / topic refresh, карточки **уже есть** | **оставить карточки**; не unmount сетки; loading = **не** pulse chrome. Тихий спиннер **рядом** с шапкой OK; **запрещён** `motion.div` / CSS pulse **opacity** на title («Конкуренты» / «Опубликовано») и на count (`showRefetchHint` → fade = баг C-61) |
| Ошибка рефетча | старые карточки остаются |

**Запрещено:** `if (loading) return skeletons` без проверки `posts.length === 0`.

**Шапка колонки (C-58 + C-61):** число постов **не** заменять на `"…"` при `loading`, если уже был известен count. Хранить last-known (`headerCount` / ref); `loading ? "…" : headerCount` = регресс моргания. Многоточие только пока count ещё ни разу не известен (пустая первая загрузка).

**Корень моргания C-61 (не скелетоны):** `VerticalPostCarousel` вешает `animate={{ opacity: showRefetchHint ? 0.55 : 1 }}` (или цикл) на chrome шапки. При competitors refetch это **и есть** fade «Конкуренты» + count. **Fix:** title и count — статичный `opacity: 1`; hint не трогает chrome. `handleCompetitorsTopicSearch` **обязан** `useCallback` (стабильные deps debounce-effect); иначе effect loop → вечный refetch → вечный pulse.

**Competitors loading** не пульсирует chrome колонки (ни title, ни count, ни тумблер).

### FeedPostCard — play + метрики (C-49 + C-52)

- Круглая кнопка Play **только** если медиа — видео / рилс / превью с duration (ours + competitors).
- **Картинки / инфографика** (`aesthetic-graphics`, `outputFormat: single_image`, статичный image URL без video): **скрыть** Play overlay.
- Метрики на карточке: лайки (как есть) + **комментарии** + **репосты/shares**. Поле `metrics.shares` в `feed-types`; не прятать shares только на graphics.
- Play только по клику; **no autoplay**. CapCut — не из обычного play превью.

## Settings — UX wave 2 + wave 4 → **C-145 Team-owns-agents supersede**

`/settings` — операционный хаб для **площадок / расписания / рилсов / design preview**.  
**Не** дублировать удалённый Brand Kit.  
**C-145:** конфигурация **агентов / rules / LLM / Scout** — на **«Команда выпуска»** (Team), **не** отдельными блоками Settings.

### Блок «Дизайн» — **C-145** → … → **S50/S51** → **S52 STRICT tokens-only (supersede)**

| Правило | Деталь |
|---------|--------|
| Источник | Библиотека до **10** слотов **DesignPresetFile** (+ DESIGN.md) — не orphan file |
| **S52 STRICT — Designer prefs = tokens only** | Settings Design отдаёт Дизайнеру **только**: **colors** + **typography** + **text-block** + **small-element** tokens (реф Atelier Synth / Vernatun brandPack). **Запрещены** в UI и в agent payload: button layout kits, COVER/BODY/CTA **sliced layout** previews, role-kit chrome, markup grid builder |
| **S50 Brandbook cards (HARD)** | Карточки = **горизонтальные 3:5**. Сетка: **colors · type · text-block / small accents** — **не** buttons/CTA layout kits, **не** 3×4:5 cover·body·cta slice strip |
| **Dedup Coffee Doctrine (S52)** | Удалить **duplicate** seed cards Coffee Doctrine (same slot twice / HY twin) — один slot на preset |
| **No MD crumbs (S50)** | Под карточками **запрещены** leftover raw **DESIGN.md** chunks / markdown body / orphan paragraphs |
| **No slots counter (S50)** | Удалить текст счётчика слотов («N слотов» / «slots: N») |
| **Toolbar (S52 supersedes S51 top-right)** | Design actions **сдвинуть ВЛЕВО** — сейчас collide с **right Settings nav**. Один ряд: **«референс»** · **«новый дизайн»+icon** · eye **«код дизайн мд»**. **Не** прижимать к правому краю рядом с Settings side nav. Preview DESIGN.md button = **удалён** (S51) |
| **Card chrome (S51)** | Сжать **empty bottom**. **Active** = **blue neon glow** perimeter |
| **Side padding (S50)** | горизонтальный padding **≈75% меньше** → шире контент |
| **No card context / edit popup (S50→S51)** | Primary click = **select only** |
| **No colors-only helper (S50)** | Helper paragraph в chrome **запрещён**; канон «tokens only» — в skills + agent inject, не в UI caption spam |
| **S49 Brandbook visual** | Читается как **брендбук токенов**, не textarea MD и не Embla sliced layout strip |
| **Colors/tokens-only layout invent (S45→S52)** | **Нет** layout markup editor. **LLM invents layout** on draw. Caption «colors-only» = enforce UI **и** `agent-start` / describe payload |
| **Embla / sliced (S44 → S52 supersede for Settings)** | **Create/feed** = N×4:5 sliced publish preview OK. **Settings Design** = **запрет** COVER/BODY/CTA sliced sample strip (`SlicedSlotPreview` layout kits) |
| Selection | `activeDesignId` → Дизайнер читает **только** color/type/text-block/small-element tokens |
| Upload MD / reel→deconstruct | Parse → **заполнить token cards** (не orphan MD; не layout kits) |
| **Preview panel (C-145 → S51)** | Нет кнопки preview DESIGN.md; eye = MD/code |
| Create draw preview | **N×4:5 sliced** publish-ready (≠ Design Settings chrome) |
| Запрет | MD crumbs; wrong aspect; slots counter; toolbar collide right nav; layout kits / sliced role previews in Settings; duplicate Coffee Doctrine; buttons/CTA kit cards; colors helper spam; layout editor; секреты |

**shell_freeze note (wave 2026-10-16):** AppShell / left Studio nav **freeze**. **In scope:** Settings Design card chrome + toolbar + Razbor modal (user-explicit).

### Блок «Бренд» — **после «Дизайн»** (Phase6 Correct · 2026-10-17)

| Правило | Деталь |
|---------|--------|
| **Order** | Settings TOC/sections: … → **Дизайн** → **Бренд** → **Персонажи** → … |
| **Purpose** | Club logo + brand fields for placeholders `{{BRAND_NAME}}` · `{{LOGO_REF}}` (not a return of deleted Brand Kit route) |
| **Fields** | Display name, logo upload/path, any brand strings Architect maps to `06_brand_and_palette` |
| **Width (HARD · useful-smoke)** | Весь блок добавленных полей Brand: **половина экрана** — `max-w-[50%]` / ~`50vw` (не full-bleed form) |
| **Agent inject** | Scriptwriter/Designer read Brand block — **not** invent logo/name |
| **Запрет** | Дублировать `/brand-kit` route; класть бренд **до** Дизайна; MD crumbs под логотипом; full-width field stack |

### Блок «Персонажи» — **ниже Бренд** (Phase6 Correct · rename 2026-10-17)

| Правило | Деталь |
|---------|--------|
| **UI label** | Везде в UI / TOC / aria: **«Персонажи»** (не «Пейзажи»). Persist/API key `landscapes` **may stay** internally or alias → `characters` |
| **Cells** | Каталог персонажей: **имя** + **фото с разных сторон** (multi-angle) для visual consistency |
| **Sheet `hero`** | empty ⇒ no character in scenes; else ⇒ character **number** → this catalog |
| **Inject** | `{{CHARACTER_CATALOG}}` from Персонажи catalog; empty catalog + empty hero = no characters |
| **Width (HARD · useful-smoke)** | Весь блок полей Персонажи: **`max-w-[50%]`** / ~`50vw` — same half-screen cap as Brand |
| **Запрет** | Текст «Пейзажи» в product chrome; прятать каталог только в sheet без UI; один ракурс если юзер загрузил несколько; full-width field stack |

**shell_freeze note (Phase6 UI in scope):** Settings **Brand** + **Персонажи** (half-width); Team agent **Logs** tab + RED error perimeter (see `xyflow-agent-mesh`). AppShell/nav still freeze.

### Dev / mystery chrome — bottom-left «N» (`C-team-brief-n-indicator`)

| Симптом | Канон |
|---------|--------|
| Загадочная кнопка/бейдж **«N»** bottom-left, тяжёлый load / jank | Обычно **Next.js Dev Indicator** / dev overlay (не product CTA). **Identify** в DOM (`nextjs-portal` / `__next-build-watcher` / `data-nextjs-*`) + `chrome-devtools` perf |
| Fix | **Disable** в `next.config`: `devIndicators: false` (или актуальный Next 15 API) / не монтировать custom FAB «N». Prod build без indicator |
| Assert | Client **S43**: @1440 на `/studio` и `/settings` **нет** видимого «N» bottom-left; cold nav не деградирует из‑за indicator |
| Запрет | Оставлять «на потом»; путать с product slide-count chip **N=** внутри Create (тот — OK, не bottom-left shell) |

### Блоки **REMOVED from Settings (C-145)** — были C-81 / C-104 / Agents wave

| Удалить с `/settings` | Куда переехало |
|----------------------|----------------|
| Блок **«LLM»** (URL/key/catalog UI) | Team drawer tab **Модель & Параметры** + env aggregator (см. Backend Polza audit) |
| Блок **«Агенты»** / Rules / prompts MultiButton | Team inspector (3 tabs) |
| Блок **«Разведка»** (C-104) | **Каждый Scout** на Team — свои settings |

Архив C-81 UI на Settings: dynamic catalog / URL+key поля **больше не обязательны на `/settings`**. Env `AGGREGATOR_*` + Team model pick остаются источником правды; Архитектор аудитит wire генерации контента → Polza.

Файлы: `SettingsShell` (delete sections), Team inspector (`xyflow-agent-mesh`), `lib/settings/*` migrate без потери persist ключей агентов.

### Блок «Площадки» — UX wave 4 / C-79

CRUD площадок публикации (Instagram / Telegram / сайт / …):

| Операция | UI |
|----------|-----|
| Create | имя + тип площадки (`instagram`/`telegram`/`site`/…) + API key / token (masked) |
| Read/list | таблица/карточки без сырого ключа (маска `••••last4`) |
| Update | edit label / rotate key |
| Delete | confirm; слоты с `platformId` → null или block delete по спеке |

| Контракт | Деталь |
|----------|--------|
| Persist | `lib/settings/platforms.ts` localStorage **или** API `/api/platforms` (Архитектор выбирает; mock OK) |
| Shape | `{ id, label, kind, secretMasked, updatedAt, connectionStatus? }` — raw secret только write-path |
| Picker | Create / Publisher / schedule slot: `<PlatformPicker platformId onChange />`; пустой список → CTA «Добавить площадку» → `/settings` |
| Wire | `platformId` на schedule slot + publisher draft; HITL publish не обходить |

#### Platforms — проверка подключения UX wave 5 (C-86)

| Нужно | Запрещено |
|-------|-----------|
| CTA **«Проверить подключение»** на карточке/строке площадки | Checkbox **enabled** / «включено» как единственный статус |
| Статус после check: **green** = ok / **red** = fail (и нейтральный idle до первой проверки) | Зелёная галка без реального check-action; silent fail |

Mock OK, если нет live API: кнопка дергает `/api/platforms/:id/ping` или mock → статус. Секреты не в snapshot.

Секреты — только client secure store / server env; **не** в git/memory/snapshots.

### Блок «Агенты» — **REMOVED C-145** (архив C-87 / C-112 / C-113 Settings UI)

Конфиг агентов (prompt / skills / plugins / MCP / model / per-type copywriter) — **только** на «Команда выпуска: {ModuleName}».  
C-112/C-113 **intent** (per-type copywriter + MD upload) **retained** и **усилен C-148/C-149**: Skills/Plugins = файлы (не text-only); MCP = website + props; Trainer search/add plugin.

### Floating Motion TOC — UX wave 7 (C-101) + C-145 trim

| Элемент | Правило |
|---------|---------|
| Пункт **«Навигация»** (TOC label / section title в floating оглавлении) | Цвет **белый** (`text-white` / `--text-primary` white), не muted gray / mono |
| Остальные якоря | Dark Luxury; active = motion highlight (`web-motion-engine`) |
| **C-145** | **Нет** TOC-якорей: LLM / Агенты / Разведка |

### Блок Settings «Расписание» — autofill rules UX wave 7 (C-101)

Новый settings-блок **«Расписание»** (якорь TOC + секция):

| Поле правила | Назначение |
|--------------|------------|
| **Тип контента** | moduleId / content-type |
| **Площадка** | `platformId` |
| **Время** | HH:mm (локаль) |
| **Частота** | daily / weekly / N-раз и т.п. (Архитектор schema) |

| Поведение | Деталь |
|-----------|--------|
| Autofill calendar | Правила **автозаполняют** слоты `/schedule` (создание draft slots по правилам) |
| Manual override | Ручной DnD / edit слота **перебивает** autofill для этого слота; не затирать ручные правки следующим autofill-прогоном без явного «пересчитать» |
| Persist | `lib/settings/schedule-rules` / API; без секретов в git |
| Запрет | Только UI без wire в календарь; autofill, уничтожающий manual moves |

### Блок Settings «Разведка» — **REMOVED C-145** (supersedes C-104 requirement)

C-104 добавлял блок «Разведка» в Settings — **снять**.  
Параметры Scout (источники, ниши, **auto-scout filters**, **frequency schedule**, top-N, toggle) + per-type icons (**C-111 intent**) → **инспектор Scout** на Team (`xyflow-agent-mesh`).  
**S52:** внизу панели Scout — CTA **«Разведать»** (единственный manual paid scrape). Wire → Scout run Backend → snapshot для Competitors. Секреты API — только `.env`.

### Блок «Рилсы» (отображение) — C-50

**«Рилсы» → Отображение → кол-во на странице**. Persist `lib/settings/*`; wire в feed limit.

Файлы: `app/settings/page.tsx`, `lib/settings/*`, consumers feed / mesh / platforms.

## Razbor modal UI — C-51 + C-59 + UX wave 2/3 + **S47** → **S48**

- При открытии: каскад **не** на mount. Welcome **короткий**. Кнопка **«Начать разбор»** — **ровно над** chat input. **Удалить** «Аналитик готов…» / idle fluff; **удалить** заголовок/eyebrow **«Карусель конкурента»**; **S48: удалить post title** из chrome модалки (заголовок поста конкурента **не** показывать над preview/chat).
- **carousel-engine (…+S48):** чаты **Разборщик → Сценарист → Дизайнер → Публицист**. UI-label шага 1 = **Разборщик** (C-105).
- **S48 LIVE Razbor:** после **«Начать разбор»** — **живой Haiku** (Polza), **не mock**. Разборщик анализирует hook / mid / CTA → virality brief + trainer tasks для Scriptwriter+Designer (module-wide). Канон: `ai-bridge` § Razbor live + `content-pipeline-agents` § S48. Handoff Разборщик→Сценарист **передаёт insights** (не пустой «ок»).
- **Models (S48):** Разборщик + Сценарист = **Haiku 5.5 + thinking**; Дизайнер = **`openai/gpt-5.4-image-2`** (gpt image 2.0 catalog). См. `llm-model-catalog-notes`.
- **Scriptwriter (carousel):** idea/prompt карусели — не reels script. Handoff → дизайнер (с insights из Разборщика).
- **Designer:** превью 9:16; L/R **сбоку**; **index `N/M` Century Gothic**; **fix preview crop**. CTA → публицисту.
- **S48 preview scale:** область превью **≈1.5×** S47 размера (ширина/высота в layout modal — Architect lock). **Preload all slides** on open (см. § carousel stack S48).
- **Смена слайда:** **expensive horizontal L/R** (`web-motion-engine` § S48) — без hang.
- **Чат:** Claude-hide scrollbar. Placeholder **«Сообщение»**. **Убрать Tools**.
- **S48 button labels:** все primary/secondary CTA labels в модалке — **белый** текст (Century Gothic) на Dark Luxury controls.
- **Handoff control (S48):** **внутри** input chrome (PromptBox / composer row) — arrow + agent logo; **не** отдельный bottom-left / floating вне chrome.
- **Top agent switcher (S47):** **MultiButton** из **4 rounded people icons** команды выпуска.
- **S48 Competitors / Boards MultiButton:** в Razbor chrome — переключатель **«Конкуренты» | «Доски» (Boards)**. **Boards** = пользователь **загружает изображения** для разбора (upload → тот же LIVE Razbor pipeline). Не путать с Settings Design Embla library.
- **S49 Boards chrome:** upload label = **«Загрузить»**; **same row as search**; **удалить** «Локально · несколько кадров…»; **board cards без metrics**.
- **S51 Boards segment HARD:** dropdown **from «Доски» segment** only (no extra buttons); dblclick rename; selected name replaces «Доски»; Upload **icon-only** always right of filter (disabled gray in Competitors) — **no layout jump**.
- **Табы/иконки агентов:** галка только после успешного handoff.
- **Modal scroll / screenshot capture (S47 HARD):** scroll **внутри** modal; background feed **не** едет; screenshot = modal.
- **После** дизайн + дата/время → черновик Ours + `/schedule`.
- **Не carousel-engine:** Разборщик → Scriptwriter (C-51) + **S48 live Haiku** всё равно; Designer pane только carousel.
- Файлы: `RazborModal`, `CreateCarouselModal`, `FeedPostCard`, `multi-button`, `content-pipeline-agents`, `ai-bridge/razbor-live-prompt.md`.

### CreateCarouselModal — **S47/S48 parity** → **S50 = Razbor UI** (start Scriptwriter)

Те же правила, что Razbor S47–S50 chrome. Create cascade = **Сценарист · Дизайнер · Публикация** (без «Начать разбор» как entry).

| Правило | Деталь |
|---------|--------|
| **S50 parity** | Create modal UI **визуально = Razbor** (same chrome kit). Diff: **стартовый агент = Scriptwriter** |
| **Source toggle higher (S50)** | Competitors / Ours (или source MultiButton) — **выше** в layout (ближе к top), не утоплено вниз |
| Scroll/capture | Background feed **не** скроллится; body lock + contain |
| Preview | Crop OK; index **`N/M` CG**; **≈1.5×** size **снова** (если регресс — restore); **preload all slides** |
| Motion | Expensive horizontal L/R + no swipe hang |
| Post title | **Нет** |
| Welcome | Короткий |
| Placeholder | **«Сообщение»** |
| Tools | **Убрать** |
| Button labels | **Белый** |
| Handoff | **Inside** input chrome: arrow + agent logo |
| Top agents | **4 rounded people icons** |
| Font | **Century Gothic** Vernatun |
| Live feed | Competitors column / Create source = **real** live carousels when live expected — **не** mock fixtures |

### Module parity — carousel UI → **all Studio modules** (**S48 HARD**)

Паттерны `carousel-engine` dual-feed + Razbor chrome **обязаны** жить на **каждом** `/studio/[moduleId]` (C-53 + S48):

| Паттерн | Apply |
|---------|--------|
| Plaque 1.5× + followers | `FeedPostCard` shared |
| Engagement 2× + 5 metrics | shared metrics row |
| «Разбор» visible / not clipped | competitor cards all modules |
| Preload + horizontal slide motion | любой modal preview со слайдами |
| Create/Razbor composer S48 (white labels, handoff-in-chrome) | shared modal chrome где есть чат |
| Запрет | «только карусели красивые — остальные модули старый chrome» |

### Razbor / Create composer — MultiButton (UX wave 3) + layout **C-135**

Низ чата агента = **единый** footer:

| Правило | Деталь |
|---------|--------|
| Компонент | Интегрировать / адаптировать **`components/ui/multi-button.tsx`** (из paste пользователя или 21st → adapt Dark Luxury + `framer-motion`) |
| Действия | **send** · **mic** (Web Speech) · **handoff** («передать задание») — в одном MultiButton, не три разрозненные кнопки разной высоты |
| Высота | Input + кнопки MultiButton **выровнены** по одной baseline/высоте ряда |
| «Начать разбор» | Только над input; не в MultiButton; не дублировать в шапке модалки |
| Запрет | Отдельный mic вне MultiButton; «Аналитик готов…»; разный visual weight send vs mic |

#### Composer layout + close — **C-135** (supersedes «как получится»)

| Правило | Деталь |
|---------|--------|
| Input | **Удлинённый** composer input (flex-grow / большая доля ряда) — не узкая полоска |
| Buttons | **Ровно 3** action-кнопки **справа** от input (send · mic · handoff), выровнены в ряд |
| Close | Кнопка закрытия Razbor/Create = **круглая красная X** (круг + `×` / Lucide X, accent terracotta/red токена). Не текстовая «Закрыть», не серый corner без круга |
| Запрет | 2 или 4+ кнопок в footer; кнопки слева от input; square/text-only close |

## Composer = PromptBox (**C-157** supersedes AgentChatComposer as canon)

| Правило | Деталь |
|---------|--------|
| Source | MCP `21st` → search **`chatgpt-prompt-input`** → adapt → `components/ui/prompt-box.tsx` (или рядом) |
| Tokens | Dark Luxury CSS vars; **не** demo purple / Inter-only |
| Mic | Web Speech **внутри** PromptBox (C-59 intent preserved). Один SpeechRecognition. Не параллельный legacy `AgentChatComposer` |
| Surfaces | Razbor / Create carousel: Scriptwriter · Designer · Publisher footers |
| Запрет | Оставить `AgentChatComposer` каноном; сток textarea+button без 21st; второй mic runtime |

`PromptBox` может включать send/mic/handoff (MultiButton pattern C-135) — Архитектор фиксирует layout в spec. Не плодить второй SpeechRecognition.

## Thinking status — 9-cube + shimmer (**C-158**)

Пока ждём live Polza ответ (после send, до первого assistant content):

| Элемент | Канон |
|---------|--------|
| Icon | **9-cube assemble** — сетка 3×3 мелких кубов, assemble motion (framer-motion / CSS; transform/opacity only) |
| Label | Shimmer text **«Thinking...»** (или RU «Думаю…» — один канон в spec; не оба сразу) |
| Reduced motion | Static 9-cube + plain label, без shimmer loop |
| Запрет | Spinner-only без 9-cube; пустой gap без статуса; fake «готово» до ответа |

Motion details → `web-motion-engine` § Thinking.

## Голос во всех AI-чатах — C-59 + wave 3 → **C-157**

Микрофон: Web Speech через PromptBox / MultiButton (`agent-chat-mic`, graceful degrade). Один runtime SpeechRecognition на composer. Панели без чата — без mic.

## Typography tokens — meta + titles (C-132 / C-134)

| Токен | Где | Спека |
|-------|-----|-------|
| **Card meta `C-132` + S47** | Username plaque + engagement counts на фото | **Century Gothic** (`--font-ui`), **white** на plaque/counts; engagement bottom-center |
| **System / Razbor titles `C-134`** | Заголовки Razbor/Create, pane titles, preview index `N/M` | **Century Gothic**, **`text-white`**, titles **16px**; index читаемый CG |
| **Marketing Director `S47`** | Chat UI / projects rail / welcome | **Century Gothic** everywhere; Inter-only = FAIL |
| Field labels | Schedule/Settings (C-92) | Century Gothic **синий** — **не** путать с meta/titles выше |

Запрет: Inter/mono на meta; серый `text-muted` вместо white на meta/titles волны; смесь 11/13/14px без канона.

## Marketing Director AI chat — **S47** + **S48 nav**

Маршрут канон: **`/marketing`**. Entry: left nav **«Директор»** (**S48**). Studio top-right Marketing button — **удалить**.

| Правило | Деталь |
|---------|--------|
| Layout | **ChatGPT-like**: слева **projects** rail; справа chat. Welcome по центру → после первого send **input sinks down** (composer вниз) |
| Composer | 21st **`AIInput`** → `components/ui/ai-input.tsx`; Dark Luxury + **Century Gothic** |
| LLM | **Haiku 5.5 + thinking** (`llm-model-catalog-notes` + AI Bridge stub) |
| Tools | App **GraphQL** + **search** — не silent mock |
| Запрет | Purple clone; Inter-only; Studio dual entry; секреты в chat |

Skills: `ai-bridge` § Marketing Director; `client-scenarios` **S47** + **S48.A**; `responsive-mobile-web` § Marketing chat.

## Hydration — ban conditional `data-testid` (**C-133**)

**Симптом:** React hydration mismatch — server `SidebarNavigation` brand slot `null` vs client `data-testid="nav-brand"` (или наоборот).

| HARD | Деталь |
|------|--------|
| Правило | **`data-testid` (и стабильные a11y ids) — одинаковы на SSR и первом client paint**. Не вешать testid только после `useEffect` / `mounted` / `typeof window` |
| Brand slot | Emblem + «VERNATUN» markup **всегда** в дереве SSR (asset path статичен); не `mounted ? <Brand/> : null` |
| Запрет | Conditional testid; suppressHydrationWarning как «фикс» вместо одинакового дерева; client-only brand без server twin |
| Файлы | `SidebarNavigation`, AppShell brand; guards — Tester console hydration = 0 |

## Сайдбар MenuVertical — C-57 + C-60 + UX wave 3 + wave 6 (C-91) + brand **C-130** + IA **C-136**

`SidebarNavigation` = адаптированный **MenuVertical** из paste пользователя → `components/ui/menu-vertical.tsx`.

| Правило | Деталь |
|---------|--------|
| Import | `framer-motion`, **не** `motion/react` |
| Токены | Dark Luxury CSS vars (`content-factory-ui`) |
| Nav titles **UX-6** | Century Gothic (`--font-ui`); **+1 кегль** от body (напр. `text-base` если body `text-sm`); **жирный синий** (`font-bold text-[var(--accent-blue-bright)]`) |
| Кегль | **не** `text-4xl` из демо 21st |
| Студия **C-60** | **без** выпадающих детей (модули). C-57 «Studio children мельче родителя» **superseded**. Студия = один пункт → `/studio`. Модули только сеткой Launchpad |
| Ширина **C-60** | aside **resizable** (drag handle на правом крае); persist `localStorage` ключ **`cf.sidebar.width`**; clamp ~220–420px; без секретов |
| **IA C-136 → S48** | Сайдбар: **Студия** · **Расписание** · **Настройки** · **«Директор»** → **`/marketing`** (Marketing Director). **Убрать** из sidebar: Холст/Mesh, Аналитика |
| **S48 Marketing entry** | Primary entry = left nav **«Директор»**. **Удалить** кнопку Marketing / «Маркетинг-директор» **top-right** на Studio Launchpad / module chrome | Два входа (sidebar + Studio top-right); EN «Marketing» как sole label |
| Module top nav | **Команда выпуска** + **Аналитика** = кнопки **верхней** nav **на странице модуля** `/studio/[moduleId]`. Не глобальные sidebar routes как primary entry для mesh/analytics |
| RBAC | Mesh по-прежнему OWNER-only; пункт «Команда выпуска» в module top nav скрыт/disabled для ADMIN (S3) |
| **Wave 3 — убрать** | Подпись / блок **«Пайплайны и ноды»**; приветствие **«Բարև · Vernatun»** (и любой дубль бренда в aside footer) |

### Brand mark Vernatun — **C-130** (supersedes C-122 baked-text PNG)

| Правило | Деталь |
|---------|--------|
| Asset | **Только клубная эмблема** (круглый герб **без** wordmark / без текста «Vernatun» внутри PNG). Источник волны: user-attached circle emblem → `public/brand/vernatun-emblem.png` (или `knowledge/logo/` копия). **Не** использовать PNG, где текст уже «запечён» в картинку |
| Layout | Emblem **слева** + текстовое **«VERNATUN»** (Century Gothic) **справа** — `flex-row items-center gap-*` |
| Запрет | Wordmark baked into logo file; название **под** эмблемой; text-only без эмблемы; старый `logo-transparent` с текстом внутри |
| Hydration | См. **C-133** — brand всегда в SSR |
| Файлы | `SidebarNavigation`, AppShell brand slot |

### Module-scoped Mesh + Analytics entry — **C-136**

| Поверхность | Entry |
|-------------|--------|
| Sidebar | Studio / Schedule / Settings / **Директор→/marketing** (**S48**); Mesh/Analytics **не** в sidebar |
| `/studio/[moduleId]` top bar | Кнопки **«Команда выпуска»** → mesh пайплайна **этого** moduleId; **«Аналитика»** → analytics **этого** moduleId |
| Routes | Архитектор фиксирует URL (напр. `/studio/[moduleId]/mesh`, `/studio/[moduleId]/analytics` **или** query/hash + shared shells). Global `/admin/mesh` / `/analytics` — deprecate как sidebar targets; redirect OK |
| Analytics skill | `content-factory-analytics` C-127 menu — жить **внутри** module scope, не как 4-й sidebar item |

## Studio Launchpad — убрать «создание нового модуля» (C-123)

| Убрать | Деталь |
|--------|--------|
| CTA / плитка | «Создание нового модуля» / Add Module / dashed **Register** слот на Launchpad |
| Modal | `RegisterModuleModal` — не открывать с Launchpad; unmount entry points |
| Grid | `ModuleSelectorGrid`: **нет** dashed Add-карточки для регистрации нового модуля |

Оставить: сетка существующих каналов/модулей (включая site/TG tiles). Новый модуль = только через SDK/admin процесс вне этой CTA, не с `/studio` Launchpad.

## Ban mono eyebrows — UX wave 3

**Убрать везде** debug/dev chrome в стиле mono eyebrow:

| Примеры запрета | Где часто |
|-----------------|-----------|
| `// Настройки` | `/settings` page header |
| `// Рабочая страница модуля` | workspace (уже C-61) |
| `// Только владелец · …` | mesh (уже wave2) |
| `// SPEED PROTOCOL…` | Launchpad |
| Любой `font-mono` + `// …` / `uppercase tracking` label **над** title страницы как декоративный eyebrow | Shell, Settings, Studio, Schedule, Analytics, Mesh |

Заголовок экрана = **человеческий RU title** без mono `//` префикса. `taste-skill` EYEBROW RESTRAINT усиливается: в app chrome factory — **0** таких debug-eyebrows.

## Расписание — дерево модулей C-59 + UX wave

Правый rail `/schedule`: **animated-file-tree** (21st) в `components/ui`, ретокены Dark Luxury + `framer-motion`. Данные = те же модули Студии + посты к слоту (C-54 persist). Не плоский список без дерева, пока 21st жив.

| Правило UX wave | Деталь |
|-----------------|--------|
| Папки **свёрнуты** | Default `collapsed` у узлов модулей; раскрытие по клику. Не `defaultExpanded` / open-all |
| Wrap текста | Длинные названия постов/модулей — `text-pretty` / `break-words` / wrap, **не** ellipsis-only если читаемость ломается |
| Scrollbar rail | Тот же styled visible vertical scrollbar, что у carousel stack |

## Расписание `/schedule` — C-54 + UX wave 2 + wave 4

Не EN placeholder. Календарь — **21st.dev** + Dark Luxury (`21st-ui-catalog`).

Макет (сохранить wave1):

- Календарь / таймлайн; **справа** animated-file-tree модулей (папки **свёрнуты**); wrap названий; **нет** day-strip; стрелки месяца у title.

### UX wave 2 — ячейки + DnD (сохранить)

| Правило | Деталь |
|---------|--------|
| Дата в ячейке | Число/дата **в углу** каждой day-cell |
| DnD rail→cell | Drag из **модулей студии** (rail / готовые посты) **в** ячейку |
| После drop | Дата/время **справа** (rail / под постом) — синхрон с календарём |
| Motion | Drop + popup — короткий spring (`web-motion-engine`); reduced-motion → без fly |

### UX wave 4 — sticky popup + date↔date + площадка + без хелпа

| Правило | Деталь |
|---------|--------|
| Sticky hover popup | Popup слота **не исчезает**, пока курсор на **триггере или на самом popup** (pointer bridge / `onMouseEnter` на popup; закрытие только leave обоих + небольшой grace ≤150ms). Wave2 «исчез при уходе с ячейки» **superseded** |
| DnD дата↔дата | Перетаскивание **существующего слота** с одной day-cell на **другую дату** (update `startsAt` day; время сохранять или по спеке). Не только rail→cell |
| Публицист ↔ календарь | Дата/время у публициста (Razbor/Create) **следуют** выбранному/DnD слоту календаря; смена в календаре обновляет UI публициста и наоборот (`content-pipeline-agents`) |
| Параметр «площадка» | У слота / назначения — поле **площадка** (FK на Settings Platforms); в модуле генерации — **picker** площадки |
| Убрать нижний хелп | Удалить footer-текст вроде «Нажмите день — слот сохранится…» / «Сначала выберите готовый пост…» под календарём (`ScheduleCalendar` bottom help). Time input можно оставить в popup/ячейке, не дублировать простынёй хелпа |
| Запрет | Popup `pointer-events: none` без hit-area; unmount popup на первый mouseleave ячейки |

### UX wave 5 — sticky modal pattern (C-84) supersedes leave-close

Паттерн **одного** sticky popup/modal слота (Save/Cancel):

| Правило | Деталь |
|---------|--------|
| Один popup | При DnD / hover / click — **не плодить** floating popups (не stack нескольких hover-балунов). Один активный modal/popup на слот |
| Opaque | Фон popup **непрозрачный** (solid glass Dark Luxury / `rgba` ≥ ~0.92 canvas), не `opacity` на всём popup и не «прозрачное стекло», сквозь которое читается календарь |
| Закрытие | **Только** кнопки **Save** / **Cancel** (и Esc по спеке). **Не** закрывать по клику внутри popup: time input, platform picker, любые controls |
| Leave | Leave ячейки / popup **не** закрывает sticky modal с Save/Cancel (wave4 leave-close **superseded** для edit-modal) |
| Rail badges | В module rail **убрать** badge tags вида **`4:5 · PNG`**, `9:16 · MP4` и подобные format/aspect chips с узлов модулей |
| DnD | Drag **не** спавнит лишние preview-popups / ghost modals; только drag ghost + drop target |

Согласовать motion с `web-motion-engine` § Schedule sticky modal. Persist — Архитектор + Backend platforms; HITL publish не обходить. Файлы: `ScheduleCalendar`, `ScheduleShell`, `ScheduleModuleRail`.

### UX wave 6 — month nav + delete slot (C-93, C-94)

| ID | Правило | Детail |
|----|---------|--------|
| **C-94** | Month nav | Смена месяца **только** стрелками `schedule-month-prev` / `schedule-month-next` (и «Сегодня»). Клик по **пустой** day-cell (или любой ячейке) **не** вызывает `onMonthChange` / `setMonth`. `onSelectDay` обновляет `selectedDay` без сдвига месяца, если день уже виден в текущей сетке |
| **C-93** | Delete slot | В popup слота кнопка **«Удалить»** (или аналог): **только** `removeSlot` — снимает назначение с календаря. **Контент/post остаётся** в правом module rail студии; **не** удалять post из `postsByModule` / studio queue |
| Запрет | `onSelectDay` → `setMonth(new Date(day…))` на каждый клик (баг wave5); delete, убирающий пост из rail |

Файлы: `ScheduleShell.tsx` (`onSelectDay`), `ScheduleCalendar.tsx` (popup Delete + `onClearSlot`).

### UX wave 7 — published past-day leave rail (C-100)

| Правило | Деталь |
|---------|--------|
| Условие | День слота **уже прошёл** **и** контент **опубликован** (`published` / HITL-approved publish done) |
| Действие | Убрать пост из **правого module rail** списка (очередь «к публикации» / rail items) |
| Не трогать | Историю / аналитику / архив; слоты будущего; unpublished / draft; data-safety (не `delete` media/DB без тикета) |
| Запрет | Оставлять published+past в rail как «висящие»; путать с C-93 `removeSlot` (там post **остаётся** в rail) |

Файлы: `ScheduleModuleRail`, `ScheduleShell`, publish status wire.

### UX wave 8 — schedule popup independence + drag + rail resize (C-108…C-110)

| ID | Правило | Деталь |
|----|---------|--------|
| **C-108** | Popup position | Context/slot popup **не сдвигается**, когда правый file-tree раскрывает папки. Позиция **независима** от layout reflow rail (fixed/portal к viewport или абсолют к calendar surface с якорем на cell — Архитектор выбирает; **не** layout-flow sibling, который едет вместе с expand) |
| **C-109** | Draggable | Popup **перетаскиваемый** (drag handle на шапке); позиция сессии persist optional `cf.schedule.popup.offset`; закрытие по-прежнему Save/Cancel (C-84) |
| **C-110** | Rail resize | Правый rail **«Модули студии»** — **resizable** ширина (drag handle на левом крае rail); persist `localStorage` **`cf.schedule.rail.width`**; clamp ~220–420px (паттерн как `cf.sidebar.width` / mesh panel) |

| Запрет | Деталь |
|--------|--------|
| Expand folder → popup jump | C-108 fail |
| Popup только static, без drag | C-109 fail |
| Fixed `w-*` rail без handle | C-110 fail |

Motion: `web-motion-engine` § schedule popup drag / rail resize. Файлы: `ScheduleCalendar`, `ScheduleShell`, `ScheduleModuleRail`.

### Schedule popup position persist — UX Vernatun (C-126)

Окно выпуска / sticky slot popup (`popupPos` в `ScheduleCalendar`):

| Правило | Деталь |
|---------|--------|
| Across slots | При **переключении слотов** (другой день/пост) popup **сохраняет** экранную позицию (не прыгает к новому якорю ячейки, если пользователь уже передвинул окно) |
| Across refresh | Позиция **persist** в `localStorage` ключ **`cf.schedule.popup.pos`** (x/y или offset); после F5 / remount — то же место |
| Drag | Совместимо с C-109: drag обновляет тот же persist-ключ |
| Запрет | `popupPos` только в React state без persist; reset позиции на каждый `selectedSlot` change |

## Studio dual-feed copy — UX wave 7 (C-97)

В описательном / supporting тексте колонок и chrome Студии (**не** в product titles вкладок, если они нужны для навигации):

| Убрать из description / blurbs | Оставить |
|--------------------------------|----------|
| Слова **«Наши»** и **«Конкуренты»** как labels в description-параграфах / helper copy | Функциональные заголовки колонок / табов, если это UI chrome выбора фида (по спеке Архитектора); без дублирования тех же слов в длинном description |

Запрет: description вроде «Здесь Наши посты… / Конкуренты по теме…» после UX-7.

## UI chrome на русском — C-54 + Brand Kit removal (wave 2)

Весь chrome — **русский**. Id маршрутов EN (`/admin/mesh`, `carousel-engine`).

| Было (EN) | Нужно (RU) |
|-----------|------------|
| Studio Launchpad | Студия |
| Canvas | Холст |
| Schedule | Расписание |
| Analytics | Аналитика |
| Target Render Channels | Каналы рендера |
| Settings | Настройки |
| Generate Draft / Approve / Add Pipeline… | русские CTA той же функции |

### Удалить Brand Kit (все ходы)

| Убрать | Куда переехало |
|--------|----------------|
| Пункт сайдбара «Бренд-кит» / `Brand Kit` | — |
| Маршрут `/brand-kit` (+ `loading.tsx`, page) | Settings → блок **Дизайн** (`DESIGN.md`) |
| API/UI-ходы только ради brand-kit page | токены из `DESIGN.md`; логотип/pack — по спеке Архитектора без отдельной nav-страницы |
| EN/RU label в таблицах nav | не возвращать пункт |

Не оставлять смесь «RU + EN nav». C-46 Launchpad EN **superseded**.

## Do not

- Карточки-«дашборд» в hero Studio без нужды.
- Inter-only без армянского фолбэка.
- Плоский `#000` без глубины поверхностей.
- Собирать UI «из головы» стоковыми блоками, пока 21st доступен.
- Ставить компонент с 21st «как есть» без ретокенизации Dark Luxury.
- Оставлять C-21/C-22 smoke-плагины как постоянные плитки Launchpad (см. `content-module-sdk`).
- Возвращать `ModuleIdeaBar` / label-баннеры «Опубликованные…» / «Актуальные карусели…» без нового тикета.
- Autoplay видео в feed или Razbor preview.
- Pulse-скелетоны поверх уже загруженных карточек при `competitorsLoading` / refetch (C-52).
- Opacity-pulse / fade шапки dual-feed (`showRefetchHint` на title/count) (C-61).
- `loading ? "…" : count` в шапке dual-feed, если count уже был (C-58).
- Выпадающие модули Студии в сайдбаре (C-60 supersedes C-57 children).
- Chrome `// Рабочая страница модуля` на workspace (C-61).
- CTA сценариста Razbor сразу к публицисту, минуя дизайнера (C-62).
- Счётчик «Ничего не выбрано» на Launchpad (C-57).
- Второй SpeechRecognition вне PromptBox / MultiButton (C-59 / **C-157**).
- Legacy `AgentChatComposer` как канон после **C-157** (нужен PromptBox chatgpt-prompt-input).
- Live chat user = brief+message; system ≠ mesh `systemPrompt` only (**C-155**).
- Carousel drafts только в memory без zustand persist (**C-156**).
- Create карусель без карточки в **Черновиках** (**C-drafts-always**).
- Settings Design без Embla library ≤10 / без привязки `activeDesignId` к Designer (**C-settings-design-md-carousel**).
- Settings Design **panorama-only** / нет 3×4:5 cover·body·cta / Quick Theme Tuner без live CSS vars (**S44** / **C-design-slot-sliced-preview**).
- Settings Design = **layout markup editor** вместо colors-only (**S45**).
- Create draw ≪ golden refs / panorama product preview (вместо sliced) / isolated cards без panorama-master / burn >40 PNG без stop-report (**S44/S45**).
- Settings Designer model ≠ `openai/gpt-5.4-image-2` default / Scriptwriter без Haiku 5.5 thinking (**S45** / catalog notes).
- Design preview panel Close не закрывает (**C-145** / S43).
- Bottom-left mystery **«N»** Dev Indicator / тяжёлый FAB (**C-team-brief-n-indicator**).
- Team User brief с baseline lorem / label не «Задание» / chat клеит brief (**C-155** + Team empty).
- Thinking = spinner без 9-cube / без shimmer «Thinking...» (**C-158**).
- Designer в Razbor на non-carousel модулях (C-51 остаётся).
- Play overlay на статичных картинках aesthetic-graphics (C-52).
- Опубликовано/Черновики или Разбор только у `carousel-engine` (C-53).
- Английский nav/chrome после C-54.
- Full-page `opacity: 0` / blank / «долгий первый клик» без замеров в guards (UX wave 2).
- Огромные wave1 carousel cards — нужны **×0.5**; плитка-мозаика и сток-фото запрещены.
- L/R на feed-карточке; фейковые слайды до генерации; **отсутствие** preview index `N/M` Century Gothic в Razbor/Create после **S47**.
- Feed card: «Онлайн · Instagram» / tags Конкуренты·Наши / bottom caption (**S47**).
- Razbor/Create: scroll/screenshot хватает **background** вместо modal; «Карусель конкурента»; Tools rail; handoff без arrow+logo; top agents без 4 rounded people icons (**S47**).
- Marketing Director без projects rail / AIInput / Haiku+tools / Century Gothic (**S47**).
- Нет left nav **«Директор»→/marketing** / осталась Studio top-right Marketing (**S48**).
- Feed: plaque ≠≈1.5× / нет followers `Nк` / engagement ≠≈2× / missing metrics (**S48**).
- Modal: нет preload всех слайдов / hang на swipe; нет expensive horizontal L/R (**S48**).
- «Разбор» clipped на нижних карточках (**S48**).
- Razbor/Create: preview ≠≈1.5×; post title остался; labels не white; handoff вне input chrome; mock после «Начать разбор»; нет Competitors/Boards; Boards без upload (**S48**).
- Другие studio modules без carousel UI parity (**S48**).
- **S49:** followers вне plaque / plaque на Ours; MultiButton вместо Published/Drafts toggle; search не в одном ряду; серые Published/Drafts/count; большой gap под feed; Boards без «Загрузить» / helper «Локально…» жив; metrics на board cards; Settings Design без brandbook visual cards; deconstruct не в brandbook form.
- **S50 CRITICAL:** thick black bottom clipping cards; Design cards ≠ horizontal **3:5**; leftover DESIGN.md under cards; slots counter; Design toolbar not one row; side padding not ~75% smaller; context menu on design card; colors-only helper paragraph; «(4:5)» in module title; orange dots Наши/Конкуренты; Boards not dropdown / «1» on Доски; no sort+filter left of search both columns; Create ≠ Razbor / not start Scriptwriter / toggle not higher / preview ≠1.5×; mock competitors when live expected.
- **S51 HARD:** Design buttons not top-right; preview DESIGN.md button alive; eye ≠ «код дизайн мд»; fat empty card bottom; active without blue neon perimeter; edit/context popup on card click; Boards dropdown from extra buttons (not «Доски» segment); no dblclick rename; segment still says «Доски» when board selected; Upload text / Upload vanishes on Competitors; **toolbar jumps** on Конкуренты|Доски.
- Скрытый «Разбор» (hover-only / opacity-0) на конкурентах.
- Day-strip на `/schedule`; стрелки месяца вдали от title; дерево папок open-all.
- Пункт / маршрут **Brand Kit** / `/brand-kit` после wave 2.
- Публицист **без** чата в CreateCarouselModal / Razbor carousel (wave 2 supersedes C-59 на этих поверхностях).
- Сайдбар chrome **«Пайплайны и ноды»** / **«Բարև · Vernatun»** (wave 3).
- Dark fade / opacity dip при смене слайда карусели (wave 3 supersedes wave2 smooth slide).
- «Аналитик готов…» и «Начать разбор» не над input; mic/send/handoff вне `multi-button.tsx`.
- Галка на табе агента до «передать задание».
- Mono eyebrow `// Настройки` и аналоги на любом экране (wave 3).
- После Publisher без черновика Ours + слота календаря на выбранную дату.
- «Выберите модуль…» на Launchpad; отсутствие плиток «Статьи на сайт» / «Статьи в TG» (wave 4).
- Workflow-кнопки вместо `CompactMultiButton` в команде запуска (wave 4).
- Путать **Разборщик** (чужой контент) с **Аналитик** (`/analytics`) (wave 4).
- Hover popup слота, исчезающий при наведении на popup; нет DnD слота дата↔дата (wave 4).
- Нижний хелп «Нажмите день — слот…» под календарём (wave 4).
- Settings Design без кнопки загрузки DESIGN.md; LLM только 4 стоковые модели без URL/key агрегатора (wave 4).
- Аналитика без блоков Scout / Outliers / Retention / RL feed / Telemetry на русском (`content-factory-analytics`).
- Серый stock outline на hover плиток модулей Launchpad (wave 5 / C-82).
- Compact collapse MultiButton на mesh; title «Команда выпуска» не как «Студия» (wave 5 / C-83).
- Плодить floating popups при DnD; прозрачный schedule popup; закрытие по клику time/platform; badge `4:5 · PNG` на rail (wave 5 / C-84).
- Design textarea + Save/Reset; Settings без Floating Motion TOC (wave 5 / C-85).
- Platforms checkbox enabled вместо «Проверить подключение» + green/red (wave 5 / C-86).
- Settings Agents tab pills вместо двух MultiButton content-type + agent (wave 5 / C-87).
- Mesh MultiButton **center** + `rounded-full` pill после UX-6 (wave 6 / C-88 supersedes C-83 center).
- Abrupt width jump на MultiButton hover без transition (wave 6 / C-88).
- Truncate «Информац. видео» / длинных pipeline labels (wave 6 / C-88).
- KPI Задачи/Задержка/GPU в mesh topbar (wave 6 / C-89).
- `font-mono uppercase` на field labels «Время публикации» и аналогах (wave 6 / C-92).
- Клик пустого дня календаря меняет месяц (wave 6 / C-94).
- Delete слота удаляет post из studio rail (wave 6 / C-93).
- Sidebar nav не Century Gothic / не +1 size / не bold blue (wave 6 / C-91).
- Settings Agents MultiButton без chamfer-left-smooth parity с mesh (wave 6 / C-96).
- Description Студии со словами «Наши» / «Конкуренты» в helper copy (wave 7 / C-97).
- Mesh MultiButton остаётся горизонтальным с overflow при узком экране; vertical stack не flush-left к sidebar (wave 7 / C-98).
- Published+past день остаётся в правом schedule rail (wave 7 / C-100).
- TOC «Навигация» не белый; нет Settings блока «Расписание» autofill rules (wave 7 / C-101).
- Settings всё ещё показывает «Разведка» / «Агенты» / «LLM» после **C-145** (должны жить на Team).
- Design без правой preview-панели open/close/drag/resize (**C-145**).
- «Аналитик» вместо «Разборщик» в Razbor/mesh/Settings (wave 8 / C-105).
- Mesh без Scout→Аналитик→Тренер или без Тренера пайплайна (wave 8 / C-106).
- Edge labels «json» / пустые рёбра без concrete handoff (wave 8 / C-107).
- Schedule popup едет при expand папок rail (wave 8 / C-108).
- Popup слота не draggable (wave 8 / C-109).
- Rail «Модули студии» fixed width без resize (wave 8 / C-110).
- Scout MultiButton: все типы слепо + generic icons (wave 8 / C-111).
- Один shared copywriter на все content-types (wave 8 / C-112).
- Agent prompt = code textarea без MD upload / filename / skills·plugins·MCP list (wave 8 / C-113).
- Бренд Vernatun: название **под** логотипом или text-only без PNG (C-122).
- Launchpad CTA / dashed «создание нового модуля» / `RegisterModuleModal` entry (C-123).
- Mesh free xyflow board / overlap / без User dual-lane (см. `xyflow-agent-mesh` C-124/C-125).
- Schedule popupPos сбрасывается при смене слота или refresh (C-126).
- Analytics без меню как у Студии / RL без HITL Тренера (см. `content-factory-analytics` C-127/C-128).
- Brand PNG **с запечённым текстом** / не emblem-only слева от «VERNATUN» (**C-130**).
- Carousel slide: hard cut / **чёрная вспышка** / unmount-gap вместо smooth crossfade (**C-131**).
- Card meta не Century Gothic white **12px** на всех модулях (**C-132**).
- Conditional `data-testid` / mounted-only brand → hydration mismatch (**C-133**).
- Razbor/system titles не Century Gothic white **16px** (**C-134**).
- Razbor composer: короткий input / кнопки не справа тройкой / close ≠ circular red X (**C-135**).
- Sidebar содержит Mesh/Analytics; нет module top-nav entry (**C-136**).
- Mesh = legacy xyflow patch вместо clean-slate flowchart+inspector (**C-137**, см. `xyflow-agent-mesh`).
- «Команда выпуска» снова с MultiButton / MeshPipelineSwitcher (**C-138**).
- Схема на ReactFlow/xyflow infinite canvas / FlowAgentNode вместо static HTML/CSS/SVG (**C-139**).
- User открывает drawer; нет accordion brief in-place (**C-139**).
- Designer card без chip `design.md` (**C-139**).
- Drawer: отдельный rules block; нет групп Skills/Plugins/MCP; поле timeout (**C-139**).
- Top bar всё ещё с «Скопировать/загрузить ТЗ» (**C-143** supersedes C-138 copy CTA).
- User brief = mock на Team accordion (**C-140** UI); live chat всё ещё клеит brief в user role (**C-155** supersedes chat payload).
- Нет pan LMB/finger (**C-141**); стрелки от top, не center (**C-142**).
- Module workspace cold load без замера/фикса root cause (**C-144**).
