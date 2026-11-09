# Центр роста — shared plan/fact dashboard

Дата: 09.11.2026. Before SHA: `1ea460c`. Ветка: `codex/director-chatgpt-transfer`.
Автор: реальный субагент Архитектор. Вход: явное поручение владельца сделать отдельный раздел Центр роста с планом/фактом и графиками; разрешение обновить **только** `content.vernatunspeakclub.com` после QA. `admin.vernatunspeakclub.com` не цель деплоя.

## Решение и границы

Добавить `/growth` и один пункт «Центр роста» в существующее меню. `/marketing`, чат, его проекты и прошлый dashboard сохраняются. Текущий shell и Dark Luxury токены переиспользуются; новый раздел прямо разрешён владельцем. Не делать автономный второй Site. Рабочая поверхность — одна большая кликабельная lifecycle-карта, а не статический отчёт и не ещё одна вкладка прежнего чата.

Шаги: **Узнать о клубе → Захотеть прийти → Записаться → Прийти впервые → Вернуться → Подписка**, отдельные ветки рекомендаций и реактивации. Новый контракт **version:2** с явными stageIds `awareness` и `desire`: прежний `attraction` означал желание, его нельзя незаметно переименовать в awareness. Старые `/marketing` version:1 snapshots и их localStorage остаются отдельными, без молчаливой миграции. Импорт legacy в новый dataset, если когда-либо понадобится, требует явного mapping и подтверждения; в этой волне его нет.

Клик на шаг открывает в той же странице подробность: профиль/сегмент человека, его задача и барьер, продукт, измеримый переход, факт/оценка/неизвестное с источником/годом/периодом, цель плана и связанные конкретные V-ID, темы/форматы/сроки/количества. Membership/referral/reactivation не вычислять как слепую цепь соседних карточек; membership от участвовавших, advocacy от repeat, reactivation от отдельной dormant-базы.

## Источник истины и обновление через чат

**Единственный операционный dataset:** `веб/data/growth/vernatun.json`, хранится в Git. В нём нет PII, секретов, списков контактов и необработанных participant events. Канонические редакционные `jobs/<V-ID>/00-brief.md` остаются исходниками темы/производственного задания; dataset содержит их явную индексированную проекцию со ссылкой `briefPath`, а не новые брифы.

Обновление владельцем через чат «обнови dashboard» означает: агент читает предоставленные агрегаты/публикационные ссылки, уточняет только неоднозначные данные, правит canonical JSON, валидирует его, показывает diff, сохраняет Git revision и выполняет разрешённый workflow обновления. Эти данные общие для пользователей после успешной выкладки новой версии. **Не обещать live sync до deploy.** На текущем этапе изменение bundled JSON требует пересборки/деплоя. LocalStorage не хранит фактическую истину, плана/факта редактор в UI не обязателен. Никакого insecure HTTP POST/PATCH или интерпретатора команд чата.

Минимальный путь: server loader статически импортирует canonical JSON, валидирует и отдаёт props. Результат попадает в Next standalone bundle без зависимости на cwd/внешний filesystem. Для read-only переиспользования — `GET /api/growth-center`, `Cache-Control: no-store`; тот же loader, тот же revision. Доступ/авторизация соответствует существующему продукту: dataset только обезличенный, не расширять write capabilities. Связка со старым Marketing Chat не даёт модели право писать facts сама.

Файлы контракта: `lib/growth-center/model.ts`, `server.ts`, `data/growth/vernatun.json`. FE: `components/growth-center/GrowthCenter.tsx` и scoped CSS, server page `app/growth/page.tsx`. API: `app/api/growth-center/route.ts`.

## Публичный контракт Backend → Frontend

Названия экспортов согласовать до FE-импорта, форма ниже обязательна по смыслу:

```ts
type StageId = 'awareness'|'desire'|'registration'|'attendance'|'return'|'membership'|'advocacy'|'reactivation';
type EvidenceKind = 'measured'|'owner_estimate'|'scenario'|'unknown';
type Provenance = { sourceId: string; observedAt: string; kind: EvidenceKind; note?: string };
type MetricValue = { value: number|null; unit: 'people'|'visits'|'publications'|'percent'; periodStart: string; periodEnd: string; cohortId?: string; provenance: Provenance };
type ContentEntry = {
  id: string; title: string; briefPath: string; plannedDate: string;
  product: string; format: string; channel: string[]; stageIds: StageId[];
  status: 'planned'|'in_progress'|'review'|'approved'|'published';
  publication: null|{url:string; publishedAt:string; sourceId:string};
};
type StageConfig = { id:StageId; label:string; audience:string; job:string; barrier:string; product:string; strategy:string; nextAction:string; owner:string; metricId:string; targetId:string|null; contentIds:string[] };
type GrowthCenterDataset = {
  version:2; projectId:'vernatun'; revision:string; updatedAt:string;
  sources: SourceEntry[]; stages: StageConfig[];
  metrics: MetricEntry[]; targets: TargetEntry[];
  content: ContentEntry[]; series: SeriesEntry[]; meetings: MeetingEntry[];
};
```

`SourceEntry`: уникальный ID, title, URL или repo path, дата/география/предел достоверности. `MetricEntry`/`TargetEntry` определяют свои id; target имеет `value:number|null`, `approvalStatus:'draft'|'approved'`, горизонт (первый — предложенные 14 дней), основания/допущения и owner. Показать конкретные предложенные targetCounts там, где их можно осмысленно назначить; они не предсказывают causal эффект числа постов. Goals не становятся measured facts даже при совпадении чисел. Долгосрочную владельческую цель 50–60 не переносить в 14-дневный target. 30-дневный возврат не оценивать как провал за первые 14 дней. `SeriesEntry` задаёт metricId/stageId и точки с датой, периодом, cohortId, value:number|null, evidenceKind/sourceId. Backend может заменить плоские массивы Record-индексами, если это упрощает loader; заранее передать FE фактические exports.

Обязательные exports: тип `GrowthCenterDataset`, `validateGrowthCenterDataset(input)` с `ok/data` или `ok/errors`; pure helpers `getStageContentStats(dataset,stageId)`, `getPlanFact(...)`, `getStageSeries(...)`, `getMeetingSeries(...)`, conversion helper; `getGrowthCenterData()` серверного loader. Нельзя дублировать вычисления publication counts в FE отдельным произвольным условием.

`getStageContentStats`: planned уникальные V-ID, published уникальные V-ID с валидными publication.url+publishedAt; при multi-stage placement один материал считается один раз на этапе и один раз глобально, сумма стадий не объявляется общим выпуском. Если несколько опубликованных площадок на один ID — total originals не умножать. В первой версии допускается одна главная permalink публикации.

## План/факт и честные числа

1. По текущим estimates показывать ≈400 TG, ≈800 IG, ≈200 чат/20–30 активных, максимум 10–12 на встрече с датой/ограничениями. Не суммировать в unique funnel и не выдавать максимум за среднее.
2. Воронка кампании хранит уникальных людей совместимого cohort/периода. Просмотры ролика — отдельный metric, не число людей; population census — рынок, не входной unique reach кампании.
3. Подписка пока гипотеза; `null` paid members не подменять `0`. Отсутствующая статистика — «нет замера» и задача заполнения.
4. Content fact учитывается только для `published` + валидный http(s) permalink + реальная дата публикации. approved/review/files generated не являются выпуском. Status published без proof — validation error, не тихая «публикация».
5. Факт people stage и контентный факт — разные KPI; нельзя писать «цель достигнута», потому что количество контента выполнено.
6. Метрики цели имеют единицу/период и видимый `provisional`. Если цель предложена без базы, так и показывать, не нулевая цель. Значение целевой доли и actual доли сопоставлять только при одинаковом denominator.
7. Дата публикации/наблюдения не может быть будущей относительно dataset.updatedAt; реальная календарная дата, не Date.parse с нормализацией 31 февраля. allowlist top-level/nested fields, уникальные ID и referential integrity sources/content/metric refs.

Центр полезен при нулевой истории: верхняя карта, условный план, 24 задачи и источники работают; отсутствующая history не заменяется случайным графиком. Первые stage counts могут быть null, но estimates видны рядом с единицей/источником.

## Графики

### График выбранного этапа

Пользователь выбирает stage, затем metric (люди / переход, если доступен), период. Отображать только соответствующий series; заголовок, оси, единицы, границы периода и источник. Hover/touch details показывают value и evidenceKind. Измерения и оценки различаются штрихом/маркером/легендой, не только цветом. Сценарная линия выключена по умолчанию или вынесена отдельно. `null` разрывает линию (`connectNulls=false`), а не означает ноль; один point отображается точкой с подписью.

Actual conversion по дате рассчитывать только из пар одной когорты/одиницы/окна и совместимых denominator; нулевой/unknown denominator → gap с причиной. 30-дневный return только для mature cohorts; дата mature выводится из observedAt vs periodEnd+window, не только из boolean. Несовместимые cohort series не соединять как прогресс одной группы; можно показывать разные отчётные когорты в chart с явными labels, без ложной causal линии.

### Посещаемость по встречам

Данные `MeetingEntry`: ID, confirmedDate, status confirmed/completed/cancelled, registrations:number|null, attendees:number|null, newcomers:number|null, returning:number|null, capacity:number|null, revenue:number|null при необходимости, sourceId, observedAt, evidenceKind. X=конкретные встречи, Y=человек; переключатели «пришли / записались / новые / повторные», выбор периода. Цель/вместимость допускается отдельной явно подписанной линией; нет вместимости — её не рисовать. cancelled не превращать в встречу с нулём пришедших. Count attendees — посещение конкретной встречи, сумма по встречам — посещения, не unique people.

Если история не предоставлена — empty state с примером **формата ввода**, не фиктивными actual 10/12/15. Цифра «максимум 10–12 по владельцу» не назначается конкретным датам. У каждой точки источник и дата замера. Chart empty state ведёт к формулировке данных для чата.

## Маркетинговое содержание и карта 24 материалов

Использовать существующие 24 briefs и конкретные V-ID; никакой абстрактной «делать ролики регулярно» вместо плана. Стадия получает список тем/дат/форматов/количеств и цель. Первое знакомство: живые желанные ситуации и культурный/социальный мотив + распространение наружу. Желание: доказуемая ценность опыта, реальные люди/поддержка/понятность. FAQ «можно одному» — тёплая помощь, не единственная холодная идея.

Источники количественного рынка — `projects/vernatun/brand/growth-market-evidence-20261109.md`. 68 018 Москва и 70 199 МО — исторический переписной ориентир, primary не прочитан; не подписывать их «потенциальные клиенты», не присваивать 2026. Подтверждённый SAM неизвестен, сценарная арифметика отдельно. Конкурентная стратегия по JTBD/альтернативе/подтверждаемому отличию/контрсигналу/тесту, не превосходные степени.

## UX и responsive

Крупная верхняя кликабельная воронка (основная лестница + branches), selected-stage детализация с визуальным приоритетом факта/действия. На 1440 сохраняется existing sidebar, на 360/390 — существующий route-scoped mobile механизм распространить на `/growth` без редизайна других routes. Никаких мелких неподписанных узлов, clipped card text, горизонтальной прокрутки всей страницы, конверсий как декора. Native buttons/filters, keyboard focus, reduced motion, пустые states с конкретным следующим действием.

## QA и release gate

Модель: валидные JSON/refs/IDs, published proof, null/zero, invalid dates, будущие points, несовместимые denominator, незрелые когорты, multi-stage unique counts; off-line tests.

Приложение: исправить 25 inherited TS errors и sharp lock mismatch отдельным Release Fixer scope, не `exclude`/`ignoreBuildErrors` и не ослаблением проверок. `npm ci`, typecheck и production build должны реально пройти. Унаследованные ошибки отдельно от новых.

Live UI: `/growth` доступен из меню; выбор каждого этапа; plan/fact различимы; 24 material IDs/счётчики согласованы; filters/toggles/charts с gaps; empty states; `/marketing` чат/проекты сохраняются; desktop/mobile screenshots и проверка overflow. Если браузер среды недоступен — явный blocker; deployment без требуемого QA не выдавать как завершённый.

Release: Deployer сначала обнаруживает существующий безопасный путь из Git/workflow history, target только `content.vernatunspeakclub.com`, сохраняет данные/медиа/БД, фиксирует rollback к предыдущему release. Найденный старый workflow не принимать как безопасный без проверки: atomic release/symlink, сохранение mutable data вне заменяемого release tree, rollback и healthcheck обязательны по release-спецификации Deployer. Допустим отдельный workflow с push trigger **только на release-manifestpath и только в director-ветке**, если root подтвердит этот путь: code push сам по себе ничего не деплоит; release commit manifest создаётся после QA. Прямой запрос пользователя разрешает deployment после QA, но не destructive restore и не admin.*. Проверить deployed route/API/revision и живую навигацию. «Локально работает» не равно «VPS обновлён».
