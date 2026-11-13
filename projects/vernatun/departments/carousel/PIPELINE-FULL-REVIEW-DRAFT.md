# Vernatun Carousel Pipeline — full review draft

Статус документа: DRAFT_FOR_CLIENT_REVIEW. Производство не запускает.

## 0. Вход и ограничения

До старта обязательны: ID `V-ГГГГММ-CAR-NN`, заполненный brief, тип карусели, референсы героини, утверждённый logo asset, CTA, число слайдов и критерии приёмки.

Запрещено без отдельного разрешения: публикация, деплой, внешние сообщения, платные API, запуск других чатов/субагентов.

## 1. Состояния ручной эстафеты

`DRAFT → BRIEF_ACCEPTED → SCRIPT_REVIEW → ART_DIRECTION → BACKGROUND_GENERATION → BACKGROUND_ACCEPTED → BAKE → COMPOSITE_QA → EDITOR_REVIEW → CLIENT_REVIEW → APPROVED`.

Любой дефект переводит задачу в `RETURN_TO_FIXER` на конкретный этап. Запись файла не означает передачу следующей роли.

## 2. Роли и промты

### 🧑‍💼 Client / carousel-lead

Проверить ID, brief, входы, ограничения, статус и следующий handoff. Не начинать производство при отсутствии входа. Вести журнал решений и не объявлять непроверенное принятым.

### Scriptwriter

«Собери одну связную историю. Для type 1 на каждом middle-слайде дай ровно 3 записи: армянский текст, транслитерация Latin и русский перевод. Не оставляй пустых строк. Сформулируй hook, последовательность свайпов и один CTA на финале. Отдельно укажи сюжетный eye-line и действие героини на каждом слайде».

Артефакт: `10-script.md`.

### Art Director

«Сначала спроектируй финальную композицию каждого слайда: фон, герой, pose ID, камера, gaze target, главный жест, текстовая зона, logo zone, карточки, стрелка. Запрещены classroom/whiteboard/lecture сцены. При диалоге героиня смотрит на лицо собеседника. Повтор pose ID, силуэта, камеры или жеста запрещён. Напиши background prompts и bake-task; не отдавай фон без визуального QA».

Артефакты: `20-art-direction/visual-system.md`, `background-prompts.md`, `bake-task.md`, pose registry.

### Designer / background generator

«Используй только принятый Art Director prompt и heroine reference. Сгенерируй современный social club: стекло, дерево, город, свет, растения, современные кресла. Не добавляй текст, лого, псевдотекст, cards, panels, boards, carpets или ethnic classroom decor. Сохрани safe-zone и сюжетный eye-line. Верни asset ID и manifest».

Артефакт: утверждённые фоны + `30-design-manifest.md`.

### Background QA / Art Director

Проверить каждый фон отдельно и в contact sheet: современная сцена, нет доски/класса, героиня присутствует, eye-line верный, pose registry уникален, нет встроенных букв/лого/карточек, композиция не оставляет бессмысленной пустоты. Только `ACCEPTED` или `REGENERATE`.

### Bake agent

«Работай только с ACCEPTED фонами. Добавь редактируемый HTML/CSS/SVG слой. Type 1 card = ровно 3 непустые строки: Armenian / transliteration / Russian. Карточка terracotta/orange с белым текстом. Запрещены белые/серые cards, nested panels, grey shadow plates, лишние пустые строки и чрезмерный padding. Карточки допускается слегка разносить. Используй только `vernatun-logo-dark.png` или `vernatun-logo-light.png`. Лого — справа сверху с равными отступами. Если wordmark теряется, добавь маленький локальный dark contrast patch только под wordmark; не закрывай эмблему. Добавь оранжевую стрелку на слайды 1–6, не на финал».

Артефакт: `40-bake-manifest.md` + PNG 1080×1350.

### Composite QA / Art Director

Проверить полноразмерный PNG и mobile-scale: текст не клиппится, нет пустых строк, карточки оранжевые, white text читается, нет серого второго слоя, карточки не закрывают лицо/руки/жест, стрелка есть на 1–6 и отсутствует на 7, лого читается и не сливается, hook/final крупные.

### Editor

Проверить порядок файлов, размеры, наличие всех слайдов, корректность фраз и переводов, safe-zone, отсутствие случайного AI-текста. Выдать `PASS` или список тикетов.

### Client acceptance

Получает только `CLIENT_DESIGN_ACCEPTED`. Решения: «согласовано» или список правок. До этого публикация запрещена.

## 3. Визуальные правила type 1

- Canvas 1080×1350; safe-zone 7–8%.
- Modern conversation club, не classroom.
- Pose registry без повторов.
- Eye-line обязателен при диалоге.
- Cards: #C95B36, opacity 0.78–0.88, white text.
- Card height считается от фактических строк + compact padding.
- Hook/final — крупная editorial AI typography, не маленький top-left caption.
- Logo assets только из `projects/vernatun/brand/assets/`.
- Dark/light выбираются по локальному участку; contrast patch допустим только под wordmark.
- Все фактические тексты — bake layer, не AI background.

## 4. Обязательные файлы

`00-brief.md` → `10-script.md` → `20-art-direction/*` → `30-design-manifest.md` → `40-bake-manifest.md` → `50-art-qa.md` → `60-editor-verdict.md` → `CLIENT_REVIEW.md`.

Каждый manifest содержит: ID, version, status, owner, input asset IDs, pose ID, gaze target, logo variant, font, dimensions, QA evidence, next step.

## 5. Слабые места для решения клиента

1. **Шрифт:** START-CHATGPT упоминает Helvetica/Arial, brand pipeline — Montserrat + Noto Sans Armenian. Нужен один primary standard.
2. **Рендерер:** role prompt говорит Puppeteer/Chromium, текущий экспериментальный bake использует ImageMagick. Нужно выбрать канонический renderer.
3. **Bake-роли:** существуют finish-art-director и telegram-graphics-bake; для carousel нужен один канонический bake prompt.
4. **Pose/eye QA:** правило есть, но автоматического детектора пока нет; сейчас это ручной gate и manifest.
5. **Logo patch:** старые инструкции запрещают любую подложку, новые разрешают локальный contrast patch под wordmark. Нужно утвердить новую версию как главную.
6. **Heavy media:** Git хранит манифесты, PNG лежат во внешнем хранилище; нужно закрепить единый архив/Drive handoff.
7. **External client:** `CLIENT_REVIEW` и `CLIENT_DESIGN_ACCEPTED` пока не разделены во всех документах одинаково.
