# Gap playbook — Content Factory

Память Тренера. После реального кейса **добавь строку**.

| Симптом | Пробел | Куда писать |
|---------|--------|-------------|
| «DEV_PLAN устарел / чекбоксы врут» + «shell не трогать» | нет research-wave lock / shell freeze | `architect` § Research/DEV_PLAN sync + `ticket-engine` plan tickets + `content-pipeline-agents` research note |
| «Пока правили plan — сломали сайдбар/nav» | Frontend попал в chain без UI-тикета | `architect` `shell_freeze: true` + chain **без** Frontend |
| «UI как у всех / purple glow / Inter» | нет anti-slop перед Frontend | `taste-skill` + `content-factory-ui` + строка в chain |
| «Скрин есть, сценарий нет» | Клиент не гонял клики | `client-scenarios` + `client.mdc` Hard REJECT |
| «Клиент принял без Playwright / по API» | нет HARD GATE Playwright | `client.mdc` HARD GATE + `client-review` + `client-scenarios` live competitors |
| «Конкуренты tiny 2-up / метрики нечитаемы / как mock» | FE stack/metrics + Client без live UI | `content-factory-ui` stack sizes + C-118; re-accept C-119 Playwright only |
| «Хочу ~2× меньше / 2 карточки в ряд» (явный запрос) | плотность dual-feed = product intent 2-up; C-118 single-col **superseded** | `content-factory-ui` § dual-feed density **C-120**; Клиент всё равно **Playwright-mandatory** |
| «Playwright / DevTools молчат» | битый путь Node в mcp.json | `.mcp.json` + этот playbook |
| «Mesh виден ADMIN» | RBAC не в guards | `tester` + ticket guards `/admin/mesh` |
| «Армянские глифы битые» | нет font-check | `tester` Armenian check + DESIGN tokens |
| «Instagram снова demo» | нет `IG_USER_ID` / токена | `.env` only; skill studio feed notes — не в git |
| «Конкуренты = mock при живом scraper» | нет Apify path / merge mock+live | `backend` § Live Instagram scraper + `content-pipeline-agents` discovery B + `IG_SCRAPER_API_KEY` |
| «В каруселях рилсы / в рилсах карусели» | нет split CAROUSEL vs REEL | `backend` map by moduleId |
| «Метрики нули на live карточках» | map likes/comments/views забыт | `backend` FeedPost.metrics + `content-factory-ui` live competitors |
| «Оркестратор сам пишет UI» | нет шага 0 Тренера / chain | `orchestrator.mdc` + `CLIENT_ORCHESTRATOR_CYCLE` |
| «Модуль не изолирован» | SDK contract забыт | `content-module-sdk` |
| «Drawer не живёт» | SSE/job stream пробел | `sse-job-stream` |
| «HeyGen/Remotion в коде, а в deps нет» | ложный стек в ARCHITECTURE | `ARCHITECTURE.md` §5 + skill remotion/heygen |
| «Платный Firecrawl/MCP» | зависимость от ключа | `plugins/trainer` — запрет; бесплатный WebSearch |
| «Тренер = онбординг-болтовня» | забыли грейд A–D | `.claude/agents/trainer.md` + этот файл |
| «После „не то“ сразу снова код» | нет gap → skill → повтор | этот playbook + `memory/trainer/*-grade.md` |
| «Marketing только кнопка в Studio / нет в сайдбаре» | IA entry не зафиксирован | `content-factory-ui` § S48 Директор→`/marketing` + Client **S48.A** |
| «Swipe в Razbor висит / грузит каждый кадр» | нет preload all slides | `content-factory-ui` § S48 preload + `web-motion-engine` S48 |
| «Слайд меняется плоско / без L/R luxury» | только crossfade / hard cut | `web-motion-engine` § S48 expensive horizontal |
| «Метрики мелкие / нет followers / нет shares» | S47 sizes без S48 scale | `content-factory-ui` FeedPostCard S48 |
| «Разбор обрезан на нижних карточках» | overflow clip CTA | `content-factory-ui` + `content-pipeline-agents` Razbor CTA S48 |
| «Начать разбор = mock / нет анализа hook·CTA» | нет live Haiku Razbor | `ai-bridge` razbor-live + `content-pipeline-agents` S48 |
| «Нет Boards / нельзя залить свои картинки в разбор» | нет Competitors\|Boards MultiButton | `content-factory-ui` Razbor S48 + pipeline Boards |
| «Красиво только карусели — другие модули старые» | нет module parity | `content-factory-ui` § Module parity S48 + Client **S48.E** |
| «На Launchpad висят Tester/Client C21 / C22 Live» | smoke-плагины забыли вычистить + dual-source JSON/localStorage | `content-module-sdk` § Studio product tiles |
| «SPEED PROTOCOL / Engine Standby / Mock SSE на /studio» | флуд-статус в шапке Launchpad | `content-factory-ui` § Launchpad chrome |
| «Описание модуля обрезано / карточки мелкие» | min-h 168 + line-clamp без fit copy | `content-factory-ui` § ModuleSelectorGrid 252px |
| «Опубликованные посты / Актуальные карусели / ModuleIdeaBar снова» | устаревший C-28 chrome на workspace | `content-factory-ui` § Module Workspace C-49 |
| «Ours vs competitors разный chrome / search bar кривой» | нет parity + height lock | `content-factory-ui` § dual carousel |
| «Видео само играет в фиде» | нет round-play / no-autoplay | `content-factory-ui` § FeedPostCard |
| «Разбор сразу бежит / Designer / Готовая карусель» | C-30 cascade не обновлён | `content-pipeline-agents` § Razbor C-51 |
| «Нет кол-ва рилсов на странице» | settings без pageSize → feed | `content-factory-ui` § Settings Рилсы C-50 |
| «Колонка конкурентов моргает» | скелетоны на каждый `loading`/refetch | `content-factory-ui` § dual feed SWR C-52 |
| «Play на статичной картинке / нет репостов» | карточка = всегда video chrome | `content-factory-ui` § FeedPostCard media-aware C-52 |
| «Черновики / Разбор только у каруселей» | workspace gated carousel-engine | `content-factory-ui` + `content-pipeline-agents` C-53 |
| «Canvas один общий пайплайн» | mesh = Router 1..N | `xyflow-agent-mesh` § per content type C-53 |
| «Schedule — серый placeholder» | нет 21st calendar + очередь модулей | `21st-ui-catalog` + `content-factory-ui` § `/schedule` C-54 |
| «Canvas/Schedule/Launchpad по-английски» | C-46 оставил EN chrome | `content-factory-ui` § RU chrome C-54 |
| «Ничего не выбрано / 1 выбран» | счётчик Launchpad | `content-factory-ui` § C-57 |
| «Сайдбар text-4xl / motion/react» | paste 21st без adapt | `21st-ui-catalog` § paste + MenuVertical |
| «Кнопка своего модуля на холсте» | mesh как конструктор | `xyflow-agent-mesh` § view-only C-58 |
| «Число постов мигает …» | header `loading ? "…" : count` | `content-factory-ui` § dual feed header C-58 |
| «Нет голоса в чате ИИ» | второй composer без Web Speech | `content-factory-ui` § AgentChatComposer C-59 |
| «В разборе карусели нет дизайнера» | C-51 вырезал pane | `content-pipeline-agents` § C-59 carousel-only |
| «Публицист с чатом» | composer на schedule pane | `content-factory-ui` Razbor publisher |
| «Отправить публицисту» на рилсах | CTA без pane | `content-pipeline-agents` CTA только carousel |
| «Расписание — плоский список» | нет 21st file-tree | `21st-ui-catalog` animated-file-tree |
| «Студия раскрывает модули в сайдбаре» | C-57 children устарели | `content-factory-ui` § C-60 flat Studio |
| «Конкуренты / count моргают» | `showRefetchHint` opacity на chrome + search не useCallback | `content-factory-ui` C-61 + `web-motion-engine` |
| «Скролл уезжает в соседнюю колонку» | нет overscroll-contain | `content-factory-ui` nested scroll + `mobile-touch-scroll` |
| «Сценарист → публицист, минуя дизайнера» | C-59 CTA устарел | `content-pipeline-agents` C-62 |
| «Scrollbar как у браузера в чате разбора» | нет Claude-hide | `content-factory-ui` Razbor C-62 |
| «Смена экранов >1s / экран гаснет» | full-page opacity:0 на route enter + нет бюджета nav | `content-factory-ui` § Nav/route loading + `web-motion-engine` § route enter |
| «Карусели — мелкие плитки / сток / L/R на карточке» | забыли 9:16 stack канон | `content-factory-ui` § carousel 9:16 stack UX wave |
| «Разбор не видно» | hover-only / opacity-0 CTA | `content-pipeline-agents` § Razbor CTA visibility + `content-factory-ui` |
| «Нет Создать карусель / модалки чат\|превью» | нет CreateCarouselModal контракта | `content-factory-ui` § CreateCarouselModal + `client-scenarios` S15 |
| «Холст = Сетка агентов / // Только владелец» | устаревший chrome mesh | `xyflow-agent-mesh` § Команда выпуска |
| «Клик по агенту ничего не делает» | нет AgentPropertiesPanel | `xyflow-agent-mesh` + `client-scenarios` S16 |
| «Расписание: папки открыты / day-strip / стрелки далеко» | нет UX wave schedule chrome | `content-factory-ui` § schedule collapsed/wrap + S17 |
| «Scrollbar колонки уродливый / совсем скрыт» | смешали chat-hide и feed scrollbar | `content-factory-ui` — chat hide vs stack/modal **visible** styled bar |
| «Первые клики всё ещё долгие / не как сайт» | нет реальных замеров мс + бюджет 300–500ms | `content-factory-ui` § Nav wave2 + `web-motion-engine` + guards с цифрами |
| «Карточки карусели огромные» | забыли ×0.5 wave2 | `content-factory-ui` § carousel ×0.5 + S15 |
| «Резкая смена слайдов» | нет Motion/21st slide transition | `web-motion-engine` + `21st-ui-catalog` smooth carousel |
| «Слайд N/N / L/R не сбоку / превью до генерации» | устарел preview-контракт | `content-factory-ui` Create/Razbor preview + `content-pipeline-agents` |
| «Нет передать задание / публицист без чата» | C-59 publisher pane vs wave2 chats | `content-pipeline-agents` § wave2 handoff + CreateCarouselModal |
| «На холсте Router/Queue без чата» | mesh показывает не-chat ноды как команду | `xyflow-agent-mesh` § только агенты с чатом |
| «Prompt в свойствах read-only» | нет editable prompt/rules | `xyflow-agent-mesh` AgentPropertiesPanel + Settings агенты |
| «Schedule без DnD / даты в углу / hover» | wave1 chrome без drop/popup | `content-factory-ui` § schedule wave2 + S17 |
| «Brand Kit всё ещё в nav» | не вычистили ходы | `content-factory-ui` Brand Kit removal + S19 |
| «Settings без DESIGN.md / без промптов агентов» | бренд остался на /brand-kit | `content-factory-ui` § Settings wave2 |
| «Сайдбар: Пайплайны и ноды / Բարև · Vernatun» | мёртвый chrome shell | `content-factory-ui` § Sidebar wave3 |
| «Карусели Ours+Competitors не в одном ряду» | нет dual-row / mobile stack | `content-factory-ui` § dual carousel layout wave3 |
| «Dark fade / затемнение при смене слайда» | wave2 smooth opacity конфликтует | `web-motion-engine` + `content-factory-ui` § instant slide wave3 |
| «Начать разбор» далеко / «Аналитик готов…» / mic отдельно» | composer не MultiButton | `content-factory-ui` § Razbor MultiButton + `21st-ui-catalog` |
| «Сценарист пишет reels script для карусели» | устарел Scriptwriter contract | `content-pipeline-agents` § carousel idea/prompt + handoff «карусель N» |
| «Галка на табе агента сразу» | checkmark ≠ handoff | `content-pipeline-agents` + `content-factory-ui` § tab check wave3 |
| «После дизайна+времени нет черновика/календаря» | нет draft→Ours+schedule wire | `content-pipeline-agents` § Publisher complete + `content-factory-ui` drafts |
| «// Настройки / mono eyebrows везде» | debug eyebrow chrome | `content-factory-ui` § ban mono eyebrows wave3 |
| «Нет статей на сайт / в TG» | каналы рендера без site/TG tiles | `content-factory-ui` § Launchpad channels UX-4 |
| «Выберите модуль…» под сеткой | устаревший dual-copy Launchpad | `content-factory-ui` § одна описательная часть |
| «Сверху кнопки workflow вместо MultiButton» | Mission Control без CompactMultiButton | `content-factory-ui` § Mission Control + `multi-button.tsx` |
| «Аналитик = разбор чужого» | смешаны роли | `content-pipeline-agents` § разборщик vs аналитик |
| «Hover popup слота исчезает» | нет bridge pointer на popup | `content-factory-ui` + `web-motion-engine` § sticky hover UX-4 |
| «Нельзя перетащить слот на другую дату» | только rail→cell DnD | `content-factory-ui` § schedule date↔date DnD |
| «Публицист игнорит календарь» | datetime вручную без sync | `content-pipeline-agents` + schedule § publisher follows calendar |
| «Нет площадки / ключей соцсетей» | нет Platform CRUD + picker | `content-factory-ui` Settings + `backend` § platforms |
| «Низ календаря: хелп про время слота» | footer help chrome | `content-factory-ui` § schedule remove bottom help |
| «Аналитика = KPI-таблица» | нет premium Self-learning dashboard | `content-factory-analytics` + `types/analytics.ts` |
| «Design без загрузки файла» | только textarea DESIGN.md | `content-factory-ui` § Settings Design upload |
| «Только 4 стоковых LLM» | каталог жёстко gpt-4o/claude/gemini | `content-factory-ui` + `backend` § LLM aggregator |
| «Оркестратор остановился на 3, хотя сказали до конца» | лимит 3 воспринят как жёсткий | `orchestrator.mdc` + `CLIENT_ORCHESTRATOR_CYCLE` + `trainer` SKILL § full-queue |
| «UX-4b разрезали снова на пачки» | забыли explicit «до конца» / full-queue в grade | `memory/trainer/*-grade.md` поле `ticket_limit: full-queue` |
| «Серая рамка на hover плиток Студии» | stock outline / gray ring на ModuleSelectorGrid | `content-factory-ui` § Module tiles hover UX-5 |
| «На Холсте Compact collapse / title не как Студия» | mesh = CompactMultiButton + другой title style | `content-factory-ui` + `xyflow-agent-mesh` § MultiButton expanded UX-5 |
| «DnD плодит popups / badge 4:5·PNG / прозрачный popup / клик time закрывает» | wave4 leave-close + format chips | `content-factory-ui` § sticky modal C-84 + `web-motion-engine` |
| «Design = textarea + Save/Reset / нет TOC» | wave4 upload+editor не снят | `content-factory-ui` § Design filename+upload + Floating Motion TOC |
| «Площадки = checkbox enabled» | нет ping/status | `content-factory-ui` § Platforms «Проверить подключение» |
| «Агенты = tab pills» | нет dual MultiButton | `content-factory-ui` § Agents dual MultiButton UX-5 |
| «Mesh MultiButton по центру / pill / скачок hover» | UX-6 не в skill | `content-factory-ui` § C-88 + `web-motion-engine` chamfer |
| «Задачи/Задержка/GPU в шапке mesh» | KPI не сняли | `xyflow-agent-mesh` C-89 |
| «Клик дня сдвигает месяц» | `onSelectDay` → `setMonth` | `content-factory-ui` C-94 |
| «Удалить слот = пропал пост в rail» | delete ≠ removeSlot only | `content-factory-ui` C-93 |
| «Время публикации mono uppercase» | нет Century Gothic blue labels | `content-factory-ui` C-92 |
| «completedJobs в свойствах агента» | нет Scout feed | `xyflow-agent-mesh` C-90 + `content-factory-analytics` |
| «Наши / Конкуренты в description Студии» | helper copy не вычищен | `content-factory-ui` C-97 |
| «MultiButton mesh уезжает / горизонтальный overflow» | нет vertical stack flush-left | `content-factory-ui` + `xyflow-agent-mesh` + `web-motion-engine` C-98 |
| «Ноды = Lucide + tag разбор + JSON на edges» | нет human art / clutter | `xyflow-agent-mesh` C-99 |
| «Published вчера висит в правом rail» | нет past+published leave | `content-factory-ui` C-100 |
| «TOC Навигация серая / нет autofill Расписание» | Settings UX-7 | `content-factory-ui` C-101 |
| «ДИАГНОСТИКА · цикл / эвристик / Синх.» | analytics chrome UX-7 | `content-factory-analytics` C-102 |
| «Scout = цель LLM / нет темы / нет top-15» | scout scripts пробел | `content-factory-analytics` C-103 |
| «Нет блока Разведка в Settings» | auto-search params | `content-factory-ui` C-104 |
| «Везде Аналитик вместо Разборщика» | смешаны 3 роли | `content-pipeline-agents` + `xyflow-agent-mesh` C-105 |
| «Нет Scout→Analyst→Trainer на mesh» | нет канона chain + Тренер пайплайна | `content-pipeline-agents` C-106 + `xyflow-agent-mesh` |
| «На стрелках json / пусто» | нет concrete handoff labels | `xyflow-agent-mesh` C-107 |
| «Popup уезжает при раскрытии папок» | position tied to rail layout | `content-factory-ui` C-108 |
| «Popup нельзя перетащить» | нет drag | `content-factory-ui` + `web-motion-engine` C-109 |
| «Модули студии fixed width» | нет rail resize | `content-factory-ui` C-110 |
| «Scout MultiButton = все типы + generic icon» | нет platform icons / subset | `content-factory-ui` C-111 |
| «Один копирайтер на все типы» | shared agent | `content-pipeline-agents` C-112 |
| «Промпт агента = code textarea» | нет MD upload + skills list | `content-factory-ui` C-113 |
| «Vernatun под логотипом / без PNG» | нет horizontal brand mark | `content-factory-ui` § Brand C-122 + S32 |
| «Создание нового модуля на Студии» | RegisterModule / dashed Add жив | `content-factory-ui` C-123 + S32 |
| «Mesh = xyflow доска / overlap / Клиент принял по скрину» | нет static picture + weak S16 | `xyflow-agent-mesh` C-124 + `client-scenarios` **S33 HARD** |
| «Нет Пользователя / Scout предлагает правки / нет штанги Тренера» | dual-lane + roles пробел | `xyflow-agent-mesh` + `content-pipeline-agents` C-125 |
| «Popup слота прыгает при смене слота / refresh» | popupPos только state | `content-factory-ui` C-126 + S34 |
| «Аналитика без меню как Студия / RL без Согласовано» | shell + HITL Trainer | `content-factory-analytics` C-127 + S35 |
| «Retention без %@15s дроби» | нет at15 fraction | `content-factory-analytics` C-128 + S35 |
| «дочисти подписи / labels наезжают на ноды» после offset polish | Fixer сдвинул %along / px — **нет** HARD: label↔node bbox @1440; нет short RU / gutter / hide на dashed Trainer | `xyflow-agent-mesh` § Edge labels **C-129 HARD** + `client-scenarios` **S33** step labels + Playwright bbox |
| «Логотип с текстом внутри / не эмблема клуба» | C-122 PNG имел baked wordmark; нет emblem-only канона | `content-factory-ui` § Brand **C-130** + S36 |
| «Чёрная вспышка между слайдами карусели» | wave3 hard cut / unmount-gap; нет crossfade overlapping layers | `web-motion-engine` + `content-factory-ui` **C-131** + S38 |
| «Meta карточек серые / не 12px / titles не 16px» | нет токенов card meta vs Razbor titles | `content-factory-ui` § Typography **C-132/C-134** |
| «Hydration: server null vs client data-testid nav-brand» | conditional testid / mounted-only brand | `content-factory-ui` § Hydration **C-133** ban |
| «Razbor: короткий input / close не круглая красная X» | composer layout не зафиксирован | `content-factory-ui` § Razbor **C-135** + S38 |
| «Онлайн · Instagram / tags / caption на карточке» | устаревший C-37 card chrome | `content-factory-ui` § FeedPostCard **S47** + `client-scenarios` S47.A |
| «Скролл/скрин модалки = фон студии» | нет body lock / overscroll-contain на dialog | `content-factory-ui` Razbor/Create **S47** + `responsive-mobile-web` |
| «Карусель конкурента / Tools / нет 4 icons» | Razbor chrome не обновлён | `content-factory-ui` § Razbor **S47** + Create parity |
| «Нет Marketing Director / AIInput / Haiku tools» | нет секции + stub | `content-factory-ui` § Marketing + `ai-bridge/marketing-director-prompt.md` + S47.D |
| «Preview без 5/8 / crop сломан» | ban «Слайд N/N» vs новый index | `content-factory-ui` preview index **S47** supersedes wave2 ban |
| «В сайдбаре Mesh и Analytics» | IA устарела; нет module top-nav | `content-factory-ui` + `content-factory-analytics` **C-136** + S36 |
| «Команда выпуска = снова патч xyflow» | нет clean-slate rewrite + Agent type inspector | `xyflow-agent-mesh` **C-137** + S37 HARD; delete legacy canvas |
| «Команда выпуска = MultiButton / MeshPipelineSwitcher» | chrome switcher не снят после user TZ | `xyflow-agent-mesh` + `content-factory-ui` **C-138**; top bar = title+subtitle+copy TZ only |
| «Схема снова уезжает / xyflow infinite / FlowAgentNode» | оставили ReactFlow вместо static artifact | `xyflow-agent-mesh` **C-139** STATIC HTML/CSS/SVG; delete ReleaseTeamFlowchart xyflow |
| «User открывает drawer / нет accordion brief» | User трактовали как агента | `xyflow-agent-mesh` C-139: User ≠ agent; accordion in-place |
| «Drawer: rules отдельно / нет Skills·Plugins·MCP / есть timeout» | схема вкладок C-137 устарела | `xyflow-agent-mesh` C-139 3 tabs; **no timeout**; prompt-only Инструкция |
| «Designer без design.md chip» | chip только в settings | `xyflow-agent-mesh` + `content-factory-ui` C-139 attached chip |
| «Dashed Trainer с mid-text labels» | C-107 labels на веере пунктира | `xyflow-agent-mesh` C-139: dashed **без** mid-text; solid short only |
| «User brief = mock / не в AI» | нет combat prompt wire + topic | `xyflow-agent-mesh` + `content-pipeline-agents` **C-140** |
| «Нельзя подвинуть схему пальцем/ЛКМ» | static = мёртвая картинка без pan | `xyflow-agent-mesh` **C-141** |
| «Стрелки из верха карточек» | ports top, не mid-Y | `xyflow-agent-mesh` **C-142** |
| «Скопировать/загрузить ТЗ всё ещё в top bar» | C-138 copy CTA не снят | `xyflow-agent-mesh` + `content-factory-ui` **C-143** |
| «Модули студии грузятся вечность» | нет root-cause perf / barrel / sync scraper | `content-factory-ui` + `web-perf-motion` **C-144** |
| «В Settings Разведка / Агенты / LLM» после переноса на Team | C-104/C-81 Settings UI не superseded | `content-factory-ui` **C-145**; Scout settings на Team |
| «design.md без панели превью» | только filename/upload | `content-factory-ui` C-145 preview open/close/drag/resize |
| «Польза AI — есть в .env, генерация mock» | aggregator не в content gen path | `backend` + Architect audit C-145; `docs/ENV_AGGREGATOR.md` |
| «Reset к шаблону / hint под User brief» | chrome trim не зафиксирован | `xyflow-agent-mesh` + `content-factory-ui` **C-146** |
| «Title без имени модуля» | голый «Команда выпуска» | `xyflow-agent-mesh` **C-147** `Команда выпуска: {ModuleName}` |
| «Skills/Plugins только текстом» | нет file upload path | `xyflow-agent-mesh` + pipeline **C-148**; Trainer search/add |
| «MCP = строка без website» | слабая модель binding | `xyflow-agent-mesh` **C-149** AgentMcpBinding |
| «Scout inspector MultiButton типов» | per-pipeline Scout забыли | `xyflow-agent-mesh` **C-150** |
| «На рилсах Дизайнер/Copywriter» | carousel labels copy-paste | `content-pipeline-agents` **C-151** Монтажёр/Сценарист + raw video IO |
| «Все модули = один pipeline» | нет audit матрицы | `content-pipeline-agents` + mesh **C-152** |
| «Нет слота под ключ карусели» | ENV prep не описан | `backend` **C-153** `CAROUSEL_API_KEY` (+ `docs/ENV_CAROUSEL.md`) |
| «В user уходит brief+текст / system не из mesh» | C-140 chat payload устарел | `ai-bridge` + `content-pipeline-agents` + `backend` **C-155** |
| «Черновики карусели пропали после F5» | нет zustand persist | `content-factory-ui` **C-156** |
| «Composer = старый AgentChatComposer» | нет PromptBox 21st | `21st-ui-catalog` + `content-factory-ui` **C-157** |
| «Thinking = голый spinner / пусто» | нет 9-cube + shimmer | `web-motion-engine` + `content-factory-ui` **C-158** |
| «В Create снизу передать / tools / MultiButton handoff» | wave2 footer chrome устарел | `carousel-studio-handoff` + `content-factory-ui` **C-carousel-*** |
| «Сверху MultiButton агентов вместо Button segment» | нет shadcn/21st button variants канона | `carousel-studio-handoff` + `21st-ui-catalog` button variants |
| «Публицист всё ещё агент в Create» | Publisher pane не снят | `content-pipeline-agents` + `carousel-studio-handoff` шаг **Публикация** |
| «Сценарист сам ушёл к дизайнеру без кнопки» | auto-handoff | `carousel-studio-handoff` § 1.8 + S41 |
| «Дизайнер сразу mock-картинки / без описания» | нет describe→draw | `carousel-studio-handoff` + `ai-bridge` Designer flow |
| «Сценарист — сплошной текст без абзацев» | нет markdown render | `content-factory-ui` + pipeline chat markdown |
| «Опубликовать не даёт черновик/слот» | нет wire draft+schedule без Publisher agent | `carousel-studio-handoff` + `content-pipeline-agents` Publication |
| «Агенты в Create — mock ответы» | нет live agent-start bundle | `ai-bridge` Agent-start + no-mock Create |
| «Дизайнер „готово“, preview чёрный, хотя картинки сгенерены» | wire preview/state/src после draw; text-only success | `carousel-json-contract` § P0 + `carousel-studio-handoff` + Frontend **C-carousel-preview-black** + Tester **S42** |
| «Всегда 5/8 слайдов / N не из запроса» | hardcoded slide count в prompt/loop/fixtures | `carousel-json-contract` + `content-pipeline-agents` + workers script-writer/designer-carousel |
| «Сценарист = вода инфобиз / нет swipe_trigger» | нет Dramaturgy Vernatun канона | `carousel-json-contract` + `workers/script-writer` |
| «Дизайнер ломается на ≠5 слайдах / текст в image-only» | нет any-length parse + HTML text / safe-zone | `carousel-json-contract` + `workers/designer-carousel` **C-carousel-html-designer** |
| «Создал карусель — в Черновиках нет» | Create не пишет drafts rail / нет persist wire | `content-factory-ui` + `carousel-studio-handoff` + pipeline **C-drafts-always** + **S43** |
| «Settings Design = один файл / нет выбора MD» | нет Embla library ≤10 + activeId → Designer | `content-factory-ui` + `21st-ui-catalog` carousel.tsx + `workers/designer-carousel` **C-settings-design-md-carousel** |
| «Превью DESIGN.md не закрывается» | Close не снимает open state / overlay | `content-factory-ui` C-145 close HARD + **S43** |
| «Нет „Добавить новый дизайн“ из картинки» | нет Разборщик CTA image→MD+HTML | `content-pipeline-agents` Разборщик + Settings Design + create-design-md |
| «На Team висит baseline ТЗ / агенты его читают» | seed brief + glue в chat user | `xyflow-agent-mesh` «Задание» empty + **C-155** + **C-team-brief-n-indicator** |
| «Снизу слева кнопка N — всё тормозит» | Next.js Dev Indicator / mystery FAB | `content-factory-ui` § Dev chrome + `next.config` `devIndicators: false` + **S43** |
| «Settings Design = одна панорама / нет 3×4:5» | нет sliced slot preview + Deconstructor | `content-factory-ui` S44 + `workers/designer-carousel` + **C-design-slot-sliced-preview** + Client **S44** |
| «Create draw не как реф / flat mock» | нет top-tier preset primitives / prompts | `workers/designer-carousel` quality bar + create-carousel prompts canon + **S44** |
| «Панорама вместо нарезанных кадров» | product preview = wide JPG | `carousel-json-contract` + designer-carousel + client.mdc §9 |
| «Рилс без хука 0–2с / плоский VO» | слабый custom-reels Scriptwriter | `reels-scriptwriter` + `content-pipeline-agents` + agent-defaults + **S44** §C |
| «Сожгли >40 PNG без стопа» | нет budget gate | Trainer grade + Deployer/Client stop-report **S44** |
| «Мосты ломаются на разрезах / N открыток» | нет panorama-first → slice | `workers/designer-carousel` + create-carousel-prompts + **S45** |
| «Settings Design = layout editor» | human markup вместо colors-only | `content-factory-ui` S45 + client.mdc §11 |
| «Designer не gpt-5.4-image-2 / Scriptwriter без thinking» | устаревший catalog default | `llm-model-catalog-notes` + `llm-models.ts` / mesh options + **S45** |
| «Cover flat / не цепляет» | слабый Hook bar | `carousel-json-contract` + `workers/script-writer` + **S45** |
| «Followers справа от plaque / plaque на Наши» | S48 side-followers устарел | `content-factory-ui` **S49** plaque `name \| Nк` inside; Ours no plaque + Client **S49.A** |
| «Сверху MultiButton вместо Опубликовано/Черновики» | нет simple toggle + search row | `content-factory-ui` § dual-feed chrome S49 |
| «Большой пустой низ под feed» | bottom clip / padding не сжали | `content-factory-ui` S49 bottom clip |
| «Boards: Локально · несколько кадров / метрики на досках» | helper + metrics не сняты | `content-factory-ui` Boards S49 |
| «Published/Drafts/count серые» | muted labels | `content-factory-ui` labels white S49 |
| «User brief всё ещё на Team / уходит агентам» | C-140 empty ≠ delete | `xyflow-agent-mesh` + `content-pipeline-agents` **S49 DELETE** + `ai-bridge` |
| «Design = MD textarea / не brandbook cards» | нет visual brandbook form | `content-factory-ui` S49 brandbook + deconstruct → Designer |
| «Клиент принял thick bottom / MD crumbs / wrong aspect» | Client не picky / нет S50 HARD | `client.mdc` #16 + `client-scenarios` **S50** + `content-factory-ui` S50 |
| «Толстая чёрная полоса обрезает карусели» | bottom chrome не minimal | `content-factory-ui` S50 bottom bar |
| «Под Design cards хвост DESIGN.md / slots counter» | brandbook UI не чистый | `content-factory-ui` S50 Design 3:5 + no crumbs |
| «Design cards не 3:5 / context menu / helper colors» | S49 cards без S50 canon | `content-factory-ui` Settings Design S50 |
| «(4:5) в title / orange dots / нет sort+filter» | carousel chrome clutter | `content-factory-ui` S50 feed chrome |
| «Доски = не dropdown / висит „1“» | Boards UX пробел | `content-factory-ui` Boards dropdown S50 |
| «Create ≠ Razbor / preview снова мелкий» | parity регресс | `carousel-studio-handoff` + `content-factory-ui` Create S50 |
| «Конкуренты = mock / слабые промпты генерации» | live path + prompt bar | `ai-bridge` s50-prompt-hardening + Backend live feed + Client **S50.D** |
| «Design кнопки не top-right / preview MD жив» | S50 toolbar без S51 cluster | `content-factory-ui` S51 Design + Client **#17** |
| «Eye без „код дизайн мд“ / fat empty card / нет neon» | card chrome пробел | `content-factory-ui` S51 card chrome |
| «Context/edit popup на клик Design card» | S50 no-menu не дожали | `content-factory-ui` + Client **S51.A** |
| «Доски = extra buttons / UI прыгает» | dropdown не из segment; Upload mount/unmount | `content-factory-ui` S51 Boards + Client **S51.B** |
| «Apify сжёг $ при одном scrape» | нет cache / bootstrap spam / dual-module refetch | `backend` apify-scraper-cost-discipline + `ai-bridge` no-scraper |
| «Открыл Конкуренты — снова Apify / $» | feed GET всё ещё платит CU; нет Scout bind | `backend` Scout-only + `content-factory-ui` snapshot + `xyflow-agent-mesh` «Разведать» + Client **S52.D** |
| «Нет Разведать / filters / schedule у Scout» | Scout settings устарели (только ниши) | `xyflow-agent-mesh` S52 Scout panel + `content-factory-ui` C-145 Scout |
| «После F5 черновики/доски пропали» / «другой ПК пустой» | SoT = localStorage | `prisma-content-schema` Sprint 8 + `backend` § Sprint 8 + Frontend-minimal API wire |
| «Мигрировали Postgres — перерисовали shell» | Frontend полный вместо minimal | `content-factory-ui` § Frontend-minimal + `architect` `shell_freeze: true` |
| «Approve слота ушёл в Instagram» | Sprint 8 смешали с publish | `backend` 8.4 HITL→draft/scheduled only; Tester 8.7 ban social |
| «Импорт localStorage задвоил черновики» | нет idempotent one-shot | `backend` 8.6 + Tester 8.7 idempotent guard |
| «Design library >10 / active потерялся» | нет cap / server active | `prisma-content-schema` DesignSlot ≤10 + `backend` 8.5 |
| «Sprint 9: переписали пайплайн / вырезали Razbor» | нет upgrade-only lock | `content-pipeline-agents` § Sprint 9 + `prompt-engineering` / contracts `upgrade_only` |
| «Карусель OK, рилсы = carousel JSON» | нет split contracts | `reels-scriptwriter` + `carousel-json-contract` no-mix |
| «Parse fail = soft-mock success» | нет STRICT fail-job | `backend` Sprint 9 STRICT + Tester 9.9 |
| «Purple slop / flat hook — приняли» | нет golden + critic 9.8 | `prompt-engineering` § 9.8 + Client S44–S46 |
| «Затащили HeyGen/Cartoon в Sprint 9» | scope bleed | `architect` Sprint 9 modules lock → Sprint 23 |
| «Пока крутили промпты — сломали Create chrome» | Frontend в chain без нужды | `architect` shell_freeze + Frontend out |
| «Describe Дизайнера = mini / лажа vs Claude chat» | image-model id в chat → `gpt-4o-mini` | `llm-model-catalog-notes` + `ai-bridge` model routing + `agent-chat/route` |
| «Картинки не image-2 / нет типографики на PNG» | draw не image API / typography not baked | `ai-bridge` Phase4 + `carousel-json-contract` E2E diffusion + Client **S53** |
| «Pretty photo + HTML text layer» | Phase3 HTML-overlay-primary жив | `carousel-json-contract` Phase4 **KILL** overlay + `create-carousel-prompts-notes` E2E DIFFUSION + **S53** |
| «Scriptwriter всё ещё Haiku при аудите качества» | не сделали Haiku→Sonnet | `llm-model-catalog-notes` + agent-defaults + **audit 2026-10-16** |
| «Промпт-шум / одни HARD 4 раза» | нет dedupe agent-start | `prompt-engineering` Phase1 + `agent-start-bundle` |
| «COMBAT CTA бронь/сторис ≠ catalog 1–4» | audit P4 | `create-carousel-prompts-notes` + COMBAT sync |
| «Few-shot = только имена fixtures» | нет full JSON embed | `prompt-engineering` Phase1 + sprint9 pack |
| «Слайды слабые / Claude chat лучше» | нет E2E diffusion / weak image prompts | `carousel-json-contract` Phase4 + Designer image prompts w/ type |
| «Сожгли PNG сверх 2×3 smoke» | нет tight budget волны | Trainer grade budget **6 PNG** + Deployer stop |
| «Settings Design = sliced COVER/BODY/CTA / button kits» | S44 Embla sample устарел vs tokens-only | `content-factory-ui` **S52** + `workers/designer-carousel` + Client **S52.A** |
| «Duplicate Coffee Doctrine cards» | seed dedupe пробел | `content-factory-ui` S52 Dedup + design-library seeds |
| «Design toolbar collide Settings nav» | S51 top-right vs right nav | `content-factory-ui` S52 toolbar **LEFT** |
| «Caption colors-only, agent всё ещё layout» | UI≠payload | `ai-bridge` + `carousel-json-contract` agent tokens-only |
| «Промпты только про кофе/клуб» | hardcoded theme | `ai-bridge` S52 random Armenian themes |
| «Открыл черновик — пустой RIGHT / Начать разбор» | нет draft-edit path | `content-pipeline-agents` S52 draft path + Client **S52.B** |
| «Каждый redraw = новый Черновик» | нет upsert/overwrite | `content-pipeline-agents` + Backend drafts API |
| «Нет Выбрать / square для сравнения» | competitor pick UX | `content-factory-ui` Razbor S52 |
| «Качество слабое / не с чем сравнить» | нет etalon folder + pipeline audit | `generatedMedia/эталон карусели/` + budget **9 PNG** + Client **S52.C** |
| «Не ясно где умерло: сценарист / дизайнер / картинка» | нет prompt-trace MD dump | `carousel-prompt-trace` + `docs/карусель тест/` templates |
| «JSON валидный, но плоский / не вирусный» | нет VIRAL CRAFT в Scriptwriter overlay | `create-carousel-prompts-notes` § Viral craft → AI Bridge patch |
| «В логе нет exact image prompt по слайдам» | Designer trace без per-slide prompts | `carousel-prompt-trace` § Designer session + optional `CAROUSEL_PROMPT_TRACE` |
| «Trace-волна сломала UI / pipeline» | Frontend в chain без UI-тикета / rewrite handoff | `shell_freeze` + `no_pipeline_break` + chain без Frontend |
| «Dump говорит image_llm skipped / HTML primary» | Phase3 канон не снят | `carousel-prompt-trace` Phase4 + Designer template `html_overlay: none` |
| «LLM получил layout markup / не colors» | tokens-only нарушен | `ai-bridge` + Settings Design tokens + approx colors only |
| «Draw path out of scope при shell_freeze» | перепутали chrome freeze с render | Trainer grade: shell_freeze UI OK; **draw path in scope** |
| «Слайды 2–N другой мир / нет continuity» | нет cover-as-reference | `carousel-json-contract` Phase5 `anchor_ref_pipeline` + ANCHOR REF inject |
| «Bake-off без подписей пайплайнов» | нет compare naming | `plugins/trainer/carousel-anchor-ref-bakeoff.md` + `compare-carousel-bakeoff/{label}/` |
| «Клиент не сказал кто ближе к эталону» | нет S54 checklist | `client-scenarios` **S54** + `client.mdc` §20 |
| «Сожгли >9 PNG на bake-off» | нет budget 3×3 | Trainer grade + Deployer stop **9 PNG** |
| «Темы снова кофе, не язык» | theme pool drift | AI Bridge Armenian **LANGUAGE** topics this wave |
| «Correct пайплайн в docs, сразу правим код» | нет gate 10 Q + plan-then-act | `plugins/trainer/carousel-correct-pipeline.md` + `carousel-json-contract` Phase 6 |
| «01–06 correct пустые, а README зовёт промпты» | docs stubs 0 bytes | Orchestrator § Clarification 01–06; **запрет** копировать пустые; fill из Sheet+answers |
| «Юзер не понял какие тексты в 01–06» | нет human-readable списка из README | card `carousel-correct-pipeline` § Clarification; Оркестратор объясняет таблицу файлов |
| «Нет sheet / meetings|useful / status=new» | вход только Create-чат | Phase6: sheet **дополняет** Create; Backend sheet sync + schedule→drafts |
| «Смотрят meetings tab / dual poll» | забыли useful-only lock | `useful-smoke-51-1-17` + Backend **gid 902078005 only**; meetings ignore |
| «Smoke без MD timeline / без LLM id» | PNG-only dump | `carousel-prompt-trace` § Useful-smoke; `docs/карусель тест/` |
| «Пейзажи» всё ещё в UI | rename не в FE skills | `content-factory-ui` **Персонажи**; Client **S56** |
| «Brand/Персонажи на всю ширину» | нет half-width lock | `content-factory-ui` `max-w-[50%]` / ~50vw |
| «Fill-тесты до проверки Sheet» | нет preflight visibility | Backend/Architect **confirm useful tab visible** before localhost fill |
| «Нет code-critic retry / vision text-check» | только zod + one-shot draw | Phase 6: critic **+** zod; vision ≤2 → `needs_review` deliver |
| «Vision крутит вечно / блокирует ready» | нет max-2-then-deliver | Phase 6 vision lock; signal `needs_review` |
| «Дизайнер дописывает сцены сам» | нарушен correct «ничего не добавляет» | Phase 6 **full replace** STRICT; supersede invent overlays |
| «Нет Бренд / Персонажи в Settings» | placeholders без UI | `content-factory-ui` Brand after Design + **Персонажи**; sheet `hero` |
| «Нет вкладки Логи / красной рамки агента» | error invisible on mesh | `xyflow-agent-mesh` Logs tab + RED perimeter |
| «Publicist только manual / нет auto schedule» | нет dual publish path | `content-pipeline-agents` Publicist auto\|manual |
| «Агенты сами передали в публикацию» | в обход Publicist path | Publicist schedule/manual only; no silent side-publish |
| «S53/S54 bake-off всё ещё обязателен после correct» | забыли Q9 supersede | Phase 6: bake-off Client rules **superseded** |
| «Клиент FAIL за HTML overlay / требует type-on-PNG» после layered locks | S53/S55 paint bar не superseded | `client.mdc` **§22 S57** + `client-scenarios` S57 + `carousel-layered-html-pipeline` |
| «Параллельно correct_pipeline и layered» | нет single renderMode lock | Phase 7: **one** `layered_html`; deprecate correct paint |
| «На фоне буквы / лого от image model» | ban только в промпте или только в коде | FORCE ban **prompt AND code**; logo = HTML Brand |
| «Vision крутит / OCR после layered» | Phase6 vision≤2 жив | S57 vision **OFF** |
| «Персонаж врисован в bg / split на каждой карусели» | нет cut-out-over-bg lock | Персонажи = conductors **OVER** bg; split = optional rare |
| «Шрифты Inter / нет из DESIGN.md» | нет 3-font + download | DESIGN.md title/body/content + download if missing |
| «Эталон старый bake-off / игнор #3 cut-out» | нет layered-html-refs | `generatedMedia/эталон карусели/layered-html-refs-2026-10-17/` |
| «Smoke 51/1/17 всё ещё лежит» | не выполнили DELETE | DELETE folder + **ONE** 4-slide; Client S57.C |
| «Puppeteer не localhost / не 1080×1350» | raster spec потерян | Backend Puppeteer localhost **1080×1350** |
| «Designer снова free-form HTML / нет template enum» | нет Variant A `html_layout` | `art-director/html-layout-variant-a.md` + composite map + zod |
| «После карусели сразу remake / нет ревью» | нет Art Director / auto-loop | `art-director` skill: remarks\|approve; **NO auto-remake** |
| «AD есть в промпте, нет на mesh/Team» | FE не показал вердикт | `xyflow-agent-mesh` + Team panel; card `variant-a-art-director` |
| «AD = Клиент Playwright» | смешали роли | AD = pipeline text QA; Клиент = Studio Playwright |
| «LLM html_layout огромный шрифт / preset мелкий» | type scale не в промпте; composite hardcoded px | `html-layout-variant-a` § FULL DESIGN + `create-carousel-prompts-notes` FULL DESIGN inject + composite ← DESIGN tokens |
| «В промпте «не 64px» / негативы вместо шкалы» | negative phrasing вместо positive type table | `create-carousel-prompts-notes` § FULL DESIGN — positive family+size+color per role |
| «Фон чёрная грязь при цветном тексте» | в Designer нет colors → mood | FULL DESIGN colors inject + bg mood rule |
| «Каждый пост = хачкар/абрикос/гранат» | forced Armenian motif laundry list | motifs OPTIONAL; richness = ≥3 scene elements (`design-inject-logo-br.md`) |
| «Лого мелкое / снизу справа / имя под иконкой» | chrome layout устарел (Phase1 BR) | **v2:** body=`bottom-left`; cover+cta=`top-left`; size **2×** (`88→176`); **wordmark → logo-only**; strip black matte (`logo-placement-v2.md`) |
| «Vernatun / ARMENIAN CLUB текстом рядом с PNG, где слово уже в лого» | устарел lock «name beside» на wordmark | `plugins/trainer/phase1-logo-wordmark-html.md` — omit `.brand-name`; raw transparent PNG → HTML `<img>` |
| «Лого всё ещё bottom-right / 88px / чёрный фон у PNG» | Phase1 defaults leftover | `plugins/trainer/logo-placement-v2.md` — reinstall PNG+alpha; role slots; `BRAND_LOGO_SIZE_PX=176` |
| «Номер слайда врос в заголовок / чужой шрифт» | нет отдельного slot + body tokens | slideNumber own HTML block = body paragraph tokens |
| «secondary_copy тонкий / 1–2 предложения» | нет richness bar | Scriptwriter secondary_copy 2–3× richer |
| «Шрифт увеличен «на глаз»» | enlarge без DESIGN | fontFit **reduce-only**; document delta |
| «Все слайды top-left» | нет variety rule | `html-layout-variant-a` LAYOUT VARIETY HARD |
| «Upload liked → DESIGN не попал в Designer» | deconstruct path не проверен | Architect verify: upload→deconstruct→DESIGN.md→FULL inject |
| «AD смотрит только текст сценария» | нет Gemini vision / script-only critique | `art-director` Gemini lock + checklist § Content completeness |
| «Тонкие слайды из 2 предложений — approve» | нет thin-slide bar | `critique-checklist` thin content + AD prompt |
| «На карусели только имя клуба, лого из Settings нет» | sanitizeLogoRefForLlm ушёл в Puppeteer | `carousel-json-contract` § Brand logo dual-path; Backend raw `logoRef` → `<img>` |
| «Неясно откуда шрифт названия клуба» | нет карты Brand vs DESIGN | `carousel-json-contract` § Club name font |
| «visual_prompt = одно предложение» | VIRAL craft без scene density | `create-carousel-prompts-notes` richness ≥3 elements (motifs optional) |
| «Smoke 4 слайда / нумерация 01 без M» | устарел smoke bar волны | ONE **6-slide** + pretty HTML `N / M`; AD Gemini artifact |
| «secondary_copy = 3 коротких предложения» | мягкий 2–3× / ≥120 недостаточен | `create-carousel-prompts-notes` MUCH WIDER ≥220+≥5 clauses; card `layout-copy-dual-char` |
| «Deconstruct только цвета — layout другой» | нет layoutMap из 4-up grid | Grid deconstruct → `layoutMap` grammar copy |
| «На рефе нет номеров, в gen есть N/M» | always pretty numbering lock | numbering mirror: absent on ref → omit in gen |
| «Персонаж в сцене когда нужен conductor» / «cutout когда нужен in_image» | один path | dual `character_paint`: in_image \| overlay_cutout |
| «Conductor стоит в фото, не говорит текст» | cutout без speech pairing | conductor OVER bg; speaks copy; cover+last mandatory |
| «Один DESIGN из одной картинки / нет 3 сеток» | нет multi-grid slots | 3 DESIGN.md: RE orange · luma coffee · omkopa teal |
| «Smoke только row-1 useful» | узкий intake | dual 6-slide from **other** useful-sheet topics |
| «Нет эталона layout-copy» | нет refs folder | `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/` |
| «LLM применяет Manrope/Cormorant таблицу, не копирует эталон» | FULL DESIGN TOKEN CARD / stock typography.scale на style-copy path | `vision-style-copy.md` + `create-carousel-prompts-notes` § VISION STYLE-COPY — **BAN** FULL inject when `styleCopyMode=vision_ref` |
| «Хотят vision style-copy, чинят только layoutMap» | layoutMap = единственный путь | `vision_ref` primary; layoutMap optional legacy — card `vision-style-copy` |
| «Фон всегда full-bleed cover, на эталоне фото частичное» | нет partial-bg lock | vision_ref: copy photo geometry (inset/partial OK) |
| «Product default снова cutout conductor» | dual-char primary = overlay_cutout | product default `character_paint=in_image`; cutout legacy only |
| «Лого сливается с фоном / нечитаемо» | HTML mark без цвета под локальный bg | Phase 2: LLM emits `html_layout.logo.textColor` (`logoTextColor`); composite applies — `phase2-vision-prompt-logo.md` |
| «Wordmark мыльный / чёрная кайма» | 1024×682 → max 176px + matte strip ≤28 fringe | Phase 2: prefer emblem PNG + HTML wordmark **or** crisp larger mark + better alpha — card Phase 2 |
| «Image prompt конфликтует сам с собой / не копирует эталон» | hardcoded RE plate / kitchen BAN / stock leftovers vs «match etalon» | Phase 2: line-scrub `buildVisionRefBackgroundImagePrompt` + sanitize; etalon = SoT; user reviews clean prompt **before** implement |
| «В Designer path снова Manrope/scale» | token card / palette dump leak | KEEP `assertVisionRefPromptBanClean`; Phase 2 re-assert on full dump |
| «Phase 3 Pixar влез в Phase 2» | character product lock | Phase 3 OUT; only hygiene: soften forced «3D animated/Pixar» in image conductor line |
| «Designer сначала layout, потом image / второй вызов ради logo.textColor» | нет parallel pack lock | `pipeline-practice-higven-3.md` + notes § HIGVEN-3 — ONE reply image_prompt+html_layout; no second logo-color call |
| «Тренировка HIGVEN, активен другой эталон / девочка / 6 слайдов» | product defaults (in_image, N=4/6) перекрыли wave | Wave locks: etalon **01** active; N=**3**; `characterPaint=none`; full Vernatun PNG |
| «Сценарист сразу ушёл в Designer без кнопки» | auto-handoff | HITL **«Передать дизайнеру»** — `content-pipeline-agents` + card HIGVEN-3 |
| «После 3-й кривой карусели ещё генят» | нет attempt STOP | ≤**3** carousel attempts then STOP + Client C-* |

Источник паттерна таблицы: Business Management `gap-playbook.md` (комитет) → адаптировано под фабрику.
