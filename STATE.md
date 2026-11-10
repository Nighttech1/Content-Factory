# STATE.md — эстафета между сессиями

## В РАЗРАБОТКЕ · W-2026-11-10-growth-workspace

10.11.2026, Москва. Пользователь поручил реализовать согласованные исправления `/growth`: компактный header, только6этапов, без Director navigation/subtabs/globalstats/AImechanics;5колоночный Kanban с произвольным движением, modal со сценарием/источником/решением/публикационнымproof; редактируемый факт и durable serverstore, Gitoutbox+ручнаяScoutqueue, один недельный selected-stage chart. `/marketing` и chat/store/data сохраняются. Spec/chain ДОкода: `веб/memory/waves/W-2026-11-10-growth-workspace/`.

Backend/Frontend/AI Bridge/Deployer передали реализацию в независимый QA. Auth fail-closed: новый owner secret и allowed HTTPS origin нужны в server env; QA OWNER selector не авторизация. Runtime Git credentials/permissions ещё не настроены/не проверены, UI честно показывает server-only/notconfigured. Setup: `docs/GROWTH_WORKSPACE.md` и пример с пустыми secret полями. Queue target отдельная Scoutbranch `codex/scout-handoff-20261109`, ручной запуск «обновляй инфу»; bootstrap START/README подготовлен вне checkout, root публикует узким commit послеQA. Никакого реального поиска/LLM/платногоAPI/автоимпорта результатов не запускали.

Факт хранится вне bundle в existing persistent data mount, old canonical v2 seed/schema unchanged. Неделя Sunday23:59MSK, immutable snapshots/corrections/nullgaps; scheduler explicit env, на VPS не включался. Авторские24группы+API/TS PASS; локальный Turbopack production build PASS (старые lint warnings не блокируют). Независимые проверки/browser QA и Client acceptance ещё ожидаются; localChromium запуск фактически blocked socketEPERM, используем QA-only Actions HTTPSfixture1440/412/390/360. Новый production release НЕ разрешён и не выполняется; release marker не менять. Обычный source/docs push сохраняет код, отдельный QA marker запускает QA-only.

## Повторяемый деплой · 10.11.2026

Каноническая инструкция: `docs/DEPLOY.md`; быстрый helper `scripts/prepare-growth-release.mjs`.
Волна `веб/memory/waves/W-2026-11-10-repeatable-deploy/`: расширение initial adapter для следующего нового standalone SHA с exact owned drop-in; текущий конфиг не переписывается. Подготовка и сохранение code/docs не запускают production. Реальные QA/release markers и workflow/gate в этой волне не меняются.
Реализация готова. Независимые проверки: 12 полных mock-сценариев; 25 rollback + 23 preflight + 4 snapshot; 22 CLI-сценария и 5 авторских групп helper — PASS. Оба C-* исправлены и повторно проверены; итоговая приёмка — `client-acceptance.md` этой волны. Проверка на VPS повторно не проводилась. Использовать этот runbook вместо исторического initial-only ограничения ниже.

## ВЫЛОЖЕНО И ПРИНЯТО КЛИЕНТОМ · 10.11.2026 · Ситуационный центр

Production https://content.vernatunspeakclub.com/growth реально работает. Release42713196016 SUCCESS, marker092d6c888684c33ad310a04f9a2da26f5cc8c612, ops0b6ba3d37316748260697b5941ea40f4fda4f224. Реальный DEPLOY_VERIFIED в22:38:55UTC (01:38:55Москва): testedsource3ac253b6ad9ec307bc82dcde3fcc5465f01e7115, artifact13713870877 изQA42704640983, revision situation-v2-20261110-01. Старый release и privatebackup сохранены, current указывает на новый release. Существующий content-factory.service/UID980/3087 сохранён; только собственный initial drop-in переводит старый Next CLI на standalone через env PORT/HOST. Main unit, app.env и nginx не переписаны; data/media/public используют прежние external paths. Миграции/сбросы/публикация контента/платныеAPI не выполнялись.

Независимый Клиент реально проверила production в cloudbrowser:5пунктов,все8этапов,humor/useful/series+четыреэпизода,resetфильтра,Plan24/Fact0,переходизSources,DirectorchatиStudio. Видимаяrevision01 совпадает. Desktop1363×936 безгоризонтальногопереполнения; размеры1440/412/390/360 подтверждены buildQA, не выдаватьихзаlive mobile. Console capture — толькоошибкиchrome-extension metadata,неприложения. Отчёт `production-client-acceptance.md`; вердиктПРИНЯТО,открытыхC-*нет,итоговаяприёмкавладельцаотдельно. Новый cloudchatemptyнепроверяетличнуюисториювладельца:сохранностьstoreдоказанаCIseed+сохранениемserverpaths,нечтениемчужихсообщений.

Историческое ограничение до волны repeatable-deploy выше: adapter был initial-only и специально блокирует уже существующий owned drop-in/standalone launch. Перед следующим release нужно узкое расширение preflight для известного exact owned drop-in с backup/restore его прежнего состояния; не обходить gates,не перезапускать PM2. Обычный docs/codepush не запускает release. Полный журнал `systemd-release-result.md`; C-OPS-ROLLBACK-VERIFY и C-OPS-DROPIN-OWNERSHIP закрыты независимыми guards.

## История подготовки · production разрешён владельцем

Уточнение перед повторной доставкой: release42710726458 остановился до APP mutations на preflight (old process/current не менялись). Phase4 read-only42711580976 доказала original Next CLI `/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3087`, а не standalone root/server.js. Архитектор одобрила минимальный owned drop-in `90-content-factory-release.conf`: ExecStart reset → `/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js`. Main unit и app.env не меняются. CONFIG_CHANGED выставляется до записи; rollback удаляет только созданный regular matching drop-in, reload, возвращает old current и original CLI. Восемь полных mock cases и независимые14 rollback/12 actual preflight branches PASS. Adapter initial-only: будущий повторный релиз с уже существующим owned drop-in требует отдельного расширения гейта, не обходить его вслепую.

Прямое разрешение 10.11.2026: «Да, конечно, выкладывай… хочу посмотреть… на сайте». Только content.vernatunspeakclub.com. Read-only inventory42708605500/42709041462 доказал existing content-factory.service (User/Groupcontent-factory UID/GID980), WorkingDirectory/current→oldrelease20261108-main7f4cede, listener3087. PM2/8088 не используются. Данные/media/fullpublic→/var/lib/content-factory; envproduction→/etc/content-factory/app.env. Ничего из этого не перемещать и не перезаписывать bundledданными.

Адаптер systemd принят Архитектором и независимо Тестировщиком:5полных mockcases,7rollbackbranches,9actualPythonidentitybranches PASS. C-OPS-ROLLBACK-VERIFY закрыт. Spec/reviews/guards в W-2026-11-10-situation-center. Deploy checkoutgithub.sha только для ops; app исключительно testedartifact13713870877/source3ac253b6/QA42704640983/QAcommitc88dac0/revision situation-v2-20261110-01. Подготовлены privatebackup,atomicswitchcurrent,onlysameunitrestart,3087+HTTPSrevision/routes и проверенныйrollback безdatarestore. Release marker будет обновлён отдельно. До фактическогоDEPLOY_VERIFIED и живой приёмки Клиентом сайт не объявлять обновлённым. Новое разрешение отменяет прежнее ограничение «только проверка SSH» ниже; публикация контента/платныеAPI/admin.* по-прежнему вне scope.

## SSH восстановлен · 10.11.2026, 00:58 Москва · без деплоя

Владелец подтвердил замену private key в Actions Secrets и разрешил проверить вход. Минимально исправлен read-only `scripts/growth-vps-root-auth.mjs`: старый skip для уже настроенного root инвертирован; выполняется только настроенный root, иной пользователь не вызывает root fallback. Host/DNS pin, host-key policy, одна попытка, timeout и неизменённая read-only команда сохранены. Четыре offline группы прошли, значения Secrets не читались/не печатались.

Фактическая диагностика [42707507064](https://github.com/Nighttech1/Content-Factory/actions/runs/42707507064), source fe607c8f07475139b849c646164886b9527b7ab0: HOST_matches_content_DNS=true, knownSelectelDNSmatch=true, TCP_configured_SSH=ok, KEY_LOOKS_LIKE_FINGERPRINT=false, KEY_PARSE_VALID=true, AUTH_ROOT_attempted=true, AUTH_ROOT_OK=true, REMOTE_UID0=true, REMOTE_APP_DIR=true. SSH-блокер снят. REMOTE_ROOT_PM2_PID_ALIVE=false означает лишь отсутствие подтверждённого root PM2 daemon, не остановку сайта: перед релизом выяснить фактического владельца/способ запуска read-only preflight; не запускать новый root PM2 вслепую. Подробности: `веб/memory/waves/W-2026-11-10-situation-center/ssh-check-result.md`.

Сайт/данные/VPS этой проверкой не менялись. Release marker не менялся. Текущее разрешение — только проверка входа; production release требует отдельного явного поручения. Для следующего разрешённого release использовать проверенный source3ac253b6 и QA42704640983/build13713870877 (если artifact не expired), а не прежний source7de8d1c. Новый SSH доступ не означает, что `/growth` уже опубликован.

## Внутренне принято: W-2026-11-10-situation-center · VPS не обновлён

По прямому поручению владельца начата доработка существующего `/growth` в той же ветке `codex/director-chatgpt-transfer`. Новый видимый пятый раздел — «Ситуационный центр». Тренер → Архитектор (spec/chain до кода) → Backend/Frontend → независимые Тестировщик и Клиент; все роли из проектного реестра. Прямое уточнение владельца: Клиент выдаёт C-* команде, повторяет приёмку до закрытия всех замечаний и только затем возвращает результат владельцу; окончательное «согласовано» владельца отдельно.

Реализованы stage-specific proposed contentMechanics в том же общем JSON (14 идей, включая юмористическую карусель, полезное и мини-сериал с четырьмя эпизодами), фильтры рубрик/план-факт, пять пунктов desktop/mobile, подписка как шестой основной этап с базой return. Существующие 24 V-ID, targets, series, meetings и значения/оценки metrics сохранены; меняется только определение membership. Это идеи стратегии, не новые производственные задания или опубликованный контент. Live write API не добавлялся.

Локальные38 model guards/20 прежних boundary/11 новых независимых boundary/полный TypeScript PASS. Local Chromium launch реально попробован и заблокирован `socket() EPERM`, поэтому browser выполнен в QA-only Actions42704640983: source3ac253b6ad9ec307bc82dcde3fcc5465f01e7115, marker c88dac026f699a82e99e0ad5b243b62210d74c18. Production build PASS; основной и synthetic browser reports passed, errors[], все1440/390/412/360. Отдельный script Клиента также passed4width, errors[], no paid requests; снимки осматриваются Клиентом перед вердиктом. Build artifact13713870877, evidence13712787361, revision situation-v2-20261110-01. Deploy job SKIPPED. Обычный source push не выкладывает приложение; release marker и VPS этой волной не менялись. SSH после обновления Secrets ещё не подтверждён: последний read-only retry подтвердил HOST/DNS/TCP, но старый root-probe пропустил авторизацию для уже настроенного root. Строка SHA256 — отпечаток, не приватный ключ; владелец получил инструкцию открыть файл и сохранить полный private key только в Actions Secrets.

Spec/chain и отчёты: `веб/memory/waves/W-2026-11-10-situation-center/`. Не объявлять новое имя или идеи доступными на VPS до отдельного разрешённого успешного релиза.

Независимый Клиент завершила внутреннюю приёмку: собственный CI-script прошёл4width, лично осмотрены client-report/DOM и7PNG (hero1440/360,useful1440/360,series1440/360,fact360). Новых C-* нет; документальный pathlock исправлен и принят. Вердикт — `client-acceptance.md`. Приёмка владельцем ещё открыта; production не выполнен и не подразумевается внутренней приёмкой. После QA меняются только отчётные Markdown-файлы; tested app source и artifact прежние. Git CLI push не был авторизован, исходники сохранены через подключённый GitHub: удалённый source tree8fa9b2b741ad1ff2d77b402218c3b388670aadfd побайтно совпал с локальным371af0d tree, sourceSHA для release использовать только фактический3ac253b6.

## Актуально: W-2026-11-09-growth-center · отдельный Центр роста

Ветка **codex/director-chatgpt-transfer**, не main. Последнее прямое поручение владельца: после плана выполнить полный инженерный цикл и обновить существующий веб **content.vernatunspeakclub.com**. Этот deployment разрешён после QA; прежний запрет ниже — история предыдущей волны. Публикация контента/внешние сообщения/платные API не выполняются. Приёмка владельцем ещё открыта.

Реальная команда создала `/growth` и пункт «Центр роста». Явные стадии schema v2: узнать о клубе → захотеть прийти → записаться → первый визит → возврат → подписка, отдельные рекомендации/реактивация. Старый `/marketing` и чат сохранены. Глобальный план/факт фильтрует списки материалов; факт требует published+URL+даты. Ноль подтверждённых ссылок не означает, что клуб никогда не публиковал контент.

Общий источник — `веб/data/growth/vernatun.json`, revision **growth-v2-20261109-02**; bundled loader и read-only GET `/api/growth-center`, no-store. Изменение через чат → проверка → Git → build/QA → разрешённая выкладка; до deploy данные у всех не обновляются. Руководство: `projects/vernatun/content-plan/GROWTH_CENTER_UPDATES.md`. Никакого публичного write API, PII или незаметной миграции localStorage v1. Оценки владельца показываются с ≈, конверсии только от совместимых измерений.

24 реальных брифа — draft backlog до 31.12, не объём за 14 дней. Тестовые цели 200/30/10/8 и 2/2 — предварительные управленческие ориентиры без измеренной базы, не прогноз эффекта контента. Возврат/подписка без произвольных targets. Реальные stage counts пока null, история встреч пустая. REL-01 v2 «Один вечер: свои люди и живой армянский» перенесён на предложенный слот11.11; FAQ CAR-01 v2 —18.11. Производство не запущено.

Проверки до release: 31 guard модели +20 независимых boundary checks PASS;24 title/date projections совпадают с jobs;63 carousel unit tests PASS;25 inherited TS ошибок исправлены, sharp lock синхронизирован. Integrated full typecheck PASS. Production Webpack build прошёл (ESLint/types,15/15 страниц, standalone/server.js). Штатный Turbopack и настоящий browser QA также PASS: run42677870881, source7de8d1c, artifact13702100156, evidence13701815874. Проверены1440/390/360, plan/fact, сохранённый чат, непустые графики/переходы/источники. Root осмотрела итоговые screenshots. Локальный Chromium недоступен в среде, поэтому browser выполняется штатно в GitHub Actions, включая isolated synthetic fixture, которая никогда не меняет production dataset.

Безопасный workflow `growth-center-release.yml`: обычный code push не выкладывает приложение. Отдельный QA marker фиксирует sourceSHA; после осмотра успешных screenshots отдельный release marker выбирает именно tested artifact. VPS script сохраняет data/media/.env, oldrelease+shared, backup и rollback; admin.* не трогается. QA прошёл после исправлений lint и tooltip360. Release попытки не изменили VPS: run42678794724 timeout к старому HOST; run42680308401 дошёл до content.* и получил Permission denied(publickey) до первого read-only preflight. Wave spec, chain, reports: `веб/memory/waves/W-2026-11-09-growth-center/`.

Текущий блокер — действующая SSH-связка USER/KEY для нынешнего VPS. Connectivity42681815298 подтвердил DNS известного Selectel, TCP22 доступен, старый USER не root, privatekey формально валиден; один разрешённый guarded root-auth тоже publickey_denied. Другие usernames/пароли не перебирались. Нужна рабочая пара INFINITYS_DOOR_VPS_USER + INFINITYS_DOOR_VPS_SSH_KEY в Repository Secrets (значения в чат не просить). Затем повторить только release marker attempt3 для того же QA artifact, если не expired. Workflow hostname уже content.vernatunspeakclub.com. Не объявлять /growth доступным на VPS: приложение там старое; root проверила живой /marketing после всех попыток. Не повторять старые вопросы, не объявлять release или приёмку без доказательств.


## История: growth dashboard и стратегия v2 · 09.11.2026

Владелец вернул v1 на доработку: сначала привлекательность для холодных и внешнее распространение, затем FAQ. Стратегия v2 — актуальный последний раздел content-plan/2026-11.md; прежние 24 брифа/старые объёмы не запущены. Исследование дополнено brand/growth-market-evidence-20261109.md (историческая демография не TAM; SAM unknown) и рабочим growth-marketing-playbook.md. Обновлены профили директора/скаута/аналитика и действующий runtime prompt.

По явному поручению вызвана инженерная команда; в существующий веб /marketing встроен GrowthMarketingWorkspace: lifecycle/content/market/chat. Старый MarketingDirectorClient/projects-store сохранён. Чистая модель cohort counts null, measured-only conversion, maturity, own branch denominators, allowlist manual import без PII. Введённые агрегаты browser-local, нет auto bot/CRM integration. Export HTML собран из actual GrowthDashboard, не новый отдельный продукт.

Проверки: 23 data guards, независимый retest, prompt transport offline, DOM-functional, HTTP /marketing 200 — PASS. Полный tsc: те же25 ошибок, что baseline f40eb96, новых growth ошибок нет; общей зелёной сборки нет. Реальный browser desktop/mobile visual gate открыт из-за среды. Не заявлять production readiness/owner approval. Wave и guards: веб/memory/waves/W-2026-11-09-growth-dashboard/. Production ранее запрещён и не запускался; нужен отдельный release после проверки и разрешения. Владелец должен посмотреть экспорт/дать правки; маркетинговый пилот и другие контент-чаты не запущены.




## Контент-директор · 09.11.2026 — разведка и стратегия до Нового года

Прочитан S-202611-GEN-02 и оба приложения в codex/scout-handoff-20261109; частичная приёмка для обратимых пилотов, полное ТЗ v6 не закрыто. Нет валидных IG/TikTok/YouTube-выгрузок, московского платёжного спроса и внутренней экономики. Вместимость неизвестна: «до 40» в отчёте не принято как подтверждённое. Решение директора — сначала ясный первый визит и возврат, затем проверка ограниченного пакета; онлайн — один условный пилот вместо другого теста. Канон: content-plan/2026-11.md, продолжение декабря в 2026-12.md. Проект на согласовании, 24 новых материала / 8 недель и до 8 производных напоминаний; до 180 мин/полную неделю, 150 в последнюю. Старые 70 не удалены, новый объём ждёт апрува. Созданы брифы v1 в jobs/, отделы не запущены. HTML/CSV — экспорт в content-plan/exports/, не параллельный продукт. Редактор и владелец новых материалов ещё не принимали; публикация/деплой/платные API не выполнялись. Проверки данных/JS прошли, браузерный рендер заблокирован средой. Следующий шаг: «согласовано» по стратегии + карточка события + уточнение, входят ли часы проведения в 3 часа. Ручная эстафета сохранена.

Более ранние записи ниже о непрочитанном отчёте — история, актуален этот раздел.


## Дополнение директора · 2026-11-09

- Новая вводная владельца: единая сайт-платформа с существующими комнатами и расписанием разных армянских мероприятий; флагман — разговорные встречи. Целевая модель — клубная подписка с включёнными посещениями и/или выгодными скидками; тарифы и запуск не утверждены.
- Запрошены недельная стратегия развития до 31.12.2026 и связанный план выпуска контента: действия директора/владельца/отделов, результат, метрика, гейт, бюджет времени до 3 ч/неделю. Итог после приёмки разведки; не обещать подписку или 50–60 гостей к Новому году.
- Актуальные версии: V-202611-STR-01 v2; V-202611-GEN-01 v6 (подписки/регулярный спрос/экономика). Базовые требования v5 и бюджет API сохранены. Ожидаемый отчёт S-202611-GEN-02. Ссылки на v4/v5 ниже — история.
- Вводная — brand/brief.md; канон стратегии — content-plan/2026-11.md. Передача v6 скауту вручную, получение/старт не подтверждены. Без публикации и деплоя.

## Актуальная передача директора в ChatGPT

- Проект vernatun; канон стратегии — стратегический раздел content-plan/2026-11.md,
  вводные — brand/brief.md. Директор возвращает компактный маршрут в каждом ответе.
- TG ~400, чат ~200/~20–30 активных, IG ~800/~2 поста в месяц; максимум 10–12 гостей
  со слов владельца, не замеры. Цель 50–60 на обычных встречах за желаемые 3–6 месяцев.
- Продвижение 0 ₽, владелец + ИИ до 3 ч/нед., билет 400 ₽. Расходы/вместимость не известны.
- API РАЗРЕШЕНЫ: месячный лимит $5, на разведку до $1 ($0.50 IG + $0.50 TikTok),
  YouTube до 1000 единиц бесплатной квоты. Проверить остаток и жёсткие лимиты.
  Прежние запреты API и «только бесплатное» в истории отменены владельцем.
- Задание V-202611-GEN-01 v5: departments/scout/jobs/V-202611-GEN-01/00-brief.md.
  Сохранённое не означает полученное. В прошлом скаут не нашёл локальный бриф.
  Маркетинговое исследование здесь не выполнено, подтверждения его старта нет.
- Обнаружена коллизия: S-202611-GEN-01 в main — отчёт о плагинах от 05.11,
  не исследование рынка. Его сохранить. Ожидаемый маркетинговый отчёт S-202611-GEN-02.
- Существующий .github/workflows/scout-data.yml и shared/skills/scout-actions/
  используют Repository Secrets; поддерживают check/youtube/instagram, не TikTok.
  Наличие секретов/валидность/остатки в этой работе не проверялись; API не вызывались.
- Ручной контур: отделы не запускают друг друга; публикация и деплой запрещены.
  Редактор и апрув владельца обязательны. V-202611-STR-01 — маршрут подготовлен,
  окончательная стратегия после разведки. Старый план 70 единиц сохранён,
  он не является подтверждённой нагрузкой при 3 часах в неделю.
- Стартовый файл: projects/vernatun/content-plan/CHATGPT_DIRECTOR_START.md.
- Ветка переноса codex/director-chatgpt-transfer объединяет актуальный origin/main
  и решения этого чата. Итоговую доступность подтверждать по удалённому SHA.
  Этот перенос не означает, что обычный чат умеет исполнять код или читать Secrets.

> Оркестратор читает этот файл при старте КАЖДОЙ новой сессии, чтобы продолжить без потери контекста.
> Обновляется в конце значимого куска работы (вместе с commit).
> Обновлено: 2026-10-29

## Локальные маркетинговые методы · 2026-11-05
- По поручению владельца импортированы выборочные документы Anthropic Marketing, Corey Haines marketingskills и marcosmodly marketing-skill с лицензиями и фиксированными Git SHA. Оригиналы: `shared/vendor/marketing-methods/`; перечень 31 файла с SHA256 — `SOURCES.json`.
- Активный локальный адаптер: `shared/skills/marketing-methods/SKILL.md`, 9 модулей по ролям. Подключены 17 профилей, 6 точек входа пайплайнов/отделов и 5 существующих навыков. Нативная установка в ChatGPT/Claude не требуется; внешний runtime/скрипты/публикация не импортированы.
- Проверка: `python3 shared/skills/marketing-methods/validate.py` — hashes, licenses, source links и маршруты. Инструкция/результаты: `shared/skills/marketing-methods/INSTALLATION.md`. Конкретные исследования, платные API, production-задачи и деплой не запускались; эффективность на контенте ещё не измерена.

## Scout / GitHub Actions · 2026-11-04
- Владелец выбрал Repository secrets в `Nighttech1/Content-Factory`: `YOUTUBE_API_KEY` и `APIFY_TOKEN` (совместимое имя `APIFY_API_KEY`); дублировать в окружение чата не требуется.
- Установлены в `main` через PR #1 `.github/workflows/scout-data.yml` (**Scout data (manual)**) и `shared/skills/scout-actions/`: режим `check` без запросов к сервисам, ручной сбор YouTube / Instagram по отдельному заданию, снимки в Actions artifacts на 30 дней.
- Каждый сбор требует явного задания владельца и ID `S-…`; без расписаний, деплоя, публикации, изменения контент-плана или записи в веб. Старые команды на Apify ниже не запускать автоматически.
- Локально: 7 offline-тестов и проверка YAML прошли. Проверочный запуск https://github.com/Nighttech1/Content-Factory/actions/runs/41809343795 успешен; артефакт `scout-41809343795-1` прочитан через GitHub-коннектор. На 2026-11-04 09:41 UTC YouTube/Apify Secrets отсутствовали; запросов к провайдерам 0. Реальные API/ключи, бюджет и сбор не проверены; наличие Secrets не означает валидность.

## Что строим
Контент-фабрика на Claude Code для «Вернатун» (армянский разговорный клуб, Москва). KPI №1 — люди на живых встречах. См. `ARCHITECTURE.md`, `PLAN.md`, `brief.md`.

## Активный проект
`vernatun` (файл `ACTIVE_PROJECT`).

## Подключено (на аккаунте / в окружении)
- **Коннектор Google Drive** — ассеты (исходники/готовое). Папки: `Content Factory/reels/incoming` → `.../reels/output`.
- **Плагины**: IT Reelsmaker, Remotion, ffmpeg-llm (отдел рилсов). Подхватываются в сессии.
- **Окружение**: `YOUTUBE_API_KEY` (в секретах; виден в новой сессии).
- Решено по данным: Apify (IG/TikTok, free-план) — подключим на Фазе 2; без Metricool; публикация своим Публикатором через API площадок.

## Готово

### 2026-11-05 — Telegram graphic cards
- Добавлен content department `telegram-graphics` с ID `TGP`: quote cards участников и визуальные анонсы встреч; профиль lead, quote reviewer, шаблоны заданий, start prompt, pipeline и специализированный skill.
- Каждый финальный asset обязан иметь логотип клуба и точный текст на отдельном HTML/CSS/SVG-слое через существующий `brand-kit`.
- Использовать существующий веб-модуль `aesthetic-graphics`, не создавать параллельный UI-модуль. Его текущая реализация — mock SVG; production render остаётся задачей реализации.
- Output manifest описывает scheduled handoff. Bot API sender/queue consumer в репозитории не подтверждён: нужна интеграция и тест в тестовом канале, прежде чем обещать автопост.
- Использовать локальные `brand-kit`, `marketing-methods/visual` и `publisher-telegram`; `canvas-design` — необязательные идеи для фона. Не добавлять n8n/grammY до проверки существующего бота.
- Фаза 0 (фундамент), агент `content-director`, бриф уточнён, аудит соцсетей (`brand/audit-soc.md`).
- **Оснащение Контент-директора (Фаза 1.5):** скилл `shared/skills/content-calendar`, правило `shared/rules/cta-ladder.md`, агенту добавлены WebSearch/WebFetch + разделы «Инструментарий»/«Границы роли» + публикация в Claude Docs; `env.manifest.md` обновлён (коннекторы/скиллы, отказ от агрегаторов).
- **Маркетинговый арсенал директора:** strategist-набор из плагинов «Marketing» (Anthropic) + «Social Media Skills» (106, community) вписан в агента с границами роли. Плагины надо включить на аккаунте (пока доступны только в сессии).
- **Фаза 1 закрыта:** план на ноябрь АПРУВНУТ (2026-10-30); комнаты подтверждены (`/campus`); расписание Вт 20:00 + Сб 15:00 (раз в 2 нед.); темы встреч — из Google-таблицы (ссылка в `brief.md`/памяти).
- Отдел рилсов: агент `reel-lead` + память + инструментарий + пути Drive.
- Система памяти агентов (`memory/<агент>.md`) и правило самоулучшения.

## В работе / следующее
- 🔍 **Разведчик (Фаза 2) — СТАРТ:** агент `scout` + скиллы `scout-youtube` (проверен: @mosarmclub 79/55381/13) и `scout-apify` готовы.
- 🟢 **ПРИОРИТЕТ в новой сессии:** `APIFY_TOKEN` добавлен владельцем, но подхватится только в НОВОЙ сессии. Там Клиент выполняет ГОТОВЫЙ закапанный прогон (`shared/skills/scout-apify`): топ-10 армянских IG-аккаунтов с виральным контентом, БЕЗ артистов; один прогон, `resultsLimit ≤50`, НЕ жечь лимиты. Итог → `brand/competitors.md`.
- Разведчику добавлена задача: **виральные рилс-идеи из агрегаторов** (sila.app и аналоги) → задания на съёмку через Директора → reel-lead.
- Дальше по Разведчику: список ~50 конкурентов (ждёт хэндлов владельца), формат отчёта.
- ✅ **Фаза 3 (Сценаристы + Редактор)** закрыта: под-сценаристы по форматам (`scriptwriter-carousel/article/youtube`) + `editor` + гейт `pipeline-gate.md` + образцы черновиков с вердиктами (`drafts/2026-11/`). Рилсы — у `reel-lead`.
- ✅ **Фаза 7 (Статьи)** закрыта в части производства: пайплайн `shared/pipelines/article` + образец статьи. Сайт — кастомный статик без CMS; способ заливки (A вручную / B блог на сайт / C в веб-апп) — **ждёт решения владельца**.
- 🔚 **Публикатор** перенесён в самый конец (Фаза P) — владелец публикует вручную.
- ✅ **Отделы спроектированы (Фазы 4/5/6):** пайплайны `shared/pipelines/{carousel,reel,youtube}` + агенты `art-director`, `designer`, `finish-art-director`, `video-producer` (+ память). Карусель — типы A–E (ген / гибрид / HTML-motion / фото из веба / реальные фото). Реальный запуск генерации картинок — блокер: нужен `OPENAI_API_KEY` (Фаза 4) + `design.md`/`brand-kit`.
- ✅ **Фаза 9 (Аналитик):** агент `analyst` + петля обратной связи (SIGNAL-метрики, воронка к встречам).
- ✅ **Статьи: распространение** — сайт (API пришлёт владелец) + Дзен/VK/Пикабу/VC/Teletype (`shared/pipelines/article`).
- ✅ **Дизайн-система (Фаза 4, без API):** `brand/design.md` (реальные токены) + скилл `brand-kit` (HTML/CSS→Puppeteer, без API). Генерация фонов ждёт `OPENAI_API_KEY`.
- ✅ **Автоматизация:** `shared/automation/README.md` — расписание/триггеры агентов + интеграция агенты↔веб (эндпоинты, `CONTENT_FACTORY_WEB_URL`/`INGEST_SECRET`).
- 🛠 **Веб-аналитика — отрабатываются тикеты в этом чате:** C-A1 (реальный путь данных подключён к экрану: InsightsFeed+PublishedPostsTable), C-A2 (KPI «люди на встречах» — слот), C-A6 (убран фейковый «Model Loss 94%»). C-A3/A4/A5 (реальное удержание / TikTok / Apify) — ждут ключей/рантайма. Полностью: `brand/web-analytics-spec.md`.
- 🔻 **Воронка в аналитике:** `FunnelChart` + `lib/analytics/funnel.ts` (Контент→Telegram→Встреча→Остались), смонтирована; Директор/Аналитик читают её (компас + петля). Данные — seed-демо.
- 🖼 **HTML-схема процесса** (2 режима: авто/ручной) — отдана владельцу (scratchpad).
- ♻️ **Клон на Финград подтверждён** + скрипт `scripts/clone-to-fingrad.sh` (готов, не запущен; Финград поднимаем позже).
- ✅ **Веб-билд ЗЕЛЁНЫЙ и ДЕПЛОЙ-ГОТОВ:** `npm run build` exit 0, 0 type-ошибок. Прод-сервер `next start` поднимается (Ready 560ms) и отдаёт: `/studio` 200, `/analytics` 200, `/api/analytics/snapshot` 200 (без БД — JSON-fallback). Починены все build-ошибки carousel-пайплайна (orchestrator/research-agent/scriptwriter/web-research/logo-bake/layout-qa/renderer/art-director-final; архитектура не тронута). `scripts/` (dev/smoke-утилиты, tsx) исключены из прод-типизации — у них дрейфнувшие тест-ассершены, на деплой не влияют.
- 🖥 **Веб-дашборд (Фаза W)** — платформа `веб/` влита в ветку; поднята команда разработки (`веб/.claude/agents/`); ТЗ досок `web-board-spec.md`; меню C-2 + макет готовы (код), ждут живой приёмки. Дальше — доски на `/marketing`. План: раздел «Фаза W» в `PLAN.md`.
- 🎬 **Рилс №1** — ГОТОВЫ монтировать: плагины + Drive + `reel-lead` на месте. Нужен бриф рилса + исходники в Drive.
- 🟡 **Карусель** — отдел ещё НЕ построен (Фаза 4): нет `design.md`, `brand-kit`, агентов `art-director`/`finish-art`, нет доступа к генерации картинок (нужен API-ключ, напр. OpenAI gpt-image). Сначала строим департамент, потом собираем карусель.

## Ждём от владельца
- Темы 6 встреч ноября → в Google-таблице; привязать к кластерам В1–В6 (даты/сетка уже известны).
- Границы по темам политика/религия.
- Включить плагины «Marketing» / «Social Media Skills» на аккаунте (для чата вызова агентов).
- Нужна ли Notion-доска под календарь/апрув — мокап показан, ждём «оно/не оно» (дефолт — git-markdown + витрина в Claude Docs).
- Способ заливки статей на сайт: A вручную (дефолт) / B раздел «Блог» на статик-сайт + деплой на VPS / C в веб-приложение (`site-articles`).
- **API сайта для заливки статей** (владелец пришлёт в окружение) → разблокирует авто-распространение.
- **Ключ генерации картинок** (`OPENAI_API_KEY`/Ideogram/Flux) → разблокирует Фазу 4 (карусели/обложки).
- **Команда разработки:** закрыть C-A1/C-A2 веб-аналитики (реальные данные + KPI встреч) → повторная приёмка.
- Смысл разделения платных/бесплатных встреч (владелец пояснит) → уточнить правило в `cta-ladder.md`.
- Веб-дашборд на своём VPS (доски контента/расписания + чат с агентами + аналитика): стек и куда класть код (см. обсуждение).

## Решение по архитектуре мозга (2026-10-30) — Вариант A
- **Агенты = подписка Claude Code** (интерактив + облачные scheduled tasks для автонома). LLM-ключ им НЕ нужен; они читают наши `projects/`-скиллы.
- **Веб = витрина/пульт.** Встроенный веб-чат `/marketing` — **зеркало облачных агентов** (переписка по API/триггеру через claude-code-remote), НЕ стоковые Polza-агенты. `AGGREGATOR_API_KEY` для «думания» НЕ нужен.
- **Стоковые Polza-агенты веба НЕ используем** (их встроенный chat/pipeline на aggregator). C-тикет на след. сессию: перепаять `веб/app/api/marketing/chat` (и, при желании, модульные пайплайны) на облачные сессии вместо Polza.
- **Платно всегда (любой путь):** генерация картинок (каруссели/обложки) + не-LLM сервисы под площадки (Apify, озвучка, публикация, API сайта).
- **Развязка агенты↔веб (VPS в РФ) — уточнено 2026-10-31, Вариант 4 (прямой push):** гео-блок бьёт только РФ→Claude; поток Claude-агент(облако)→РФ-VPS — обычный исходящий POST, под блок НЕ попадает. Решение: вся интеракция (чат/апрув/правки) — в облачном приложении Claude; VPS-дашборд = односторонняя витрина; агенты пишут ПРЯМО на VPS (`POST /api/ingest` + `INGEST_SECRET`), назад к Claude ничего не звонит → нейтральный R2-ящик НЕ нужен. Условия: домен VPS в Network access окружения (Allowed domains); секрет на эндпоинте; ретраи+идемпотентность; медиа хостит VPS (git — только текст). Триггеры (cron) будят агентов из планировщика Claude, VPS их не дёргает. Ящик/мини-проводник вернём только если понадобится обратная петля РФ→Claude (кнопка «Замечания» на VPS). Дизайн и все 4 варианта: `shared/pipelines/article/review-architecture.md`.

## Разработка контент-фабрики — ЗАВЕРШЕНА (2026-10-31)
- **Ростер агентов (единый источник правды):** `shared/rules/agent-roster.md` — по каждому лиду: кто ты / папка / субагенты / с кем взаимодействуешь / гейт / куда деплоишь. Указатели вшиты в лид-агентов (content-director, scriptwriter-carousel/article/youtube, reel-lead) → владелец НЕ объясняет заново при открытии чата.
- **Петля апрува в чате:** `shared/rules/approve-loop.md` — агент по расписанию приносит готовое в чат (✅ Approve / ✍️ Что поправить) → после Approve пушит на веб как «опубликовано»; соцсети пока вручную владельцем.
- **Расписание триггеров «кто кого будит»:** `shared/automation/README.md` (scout→director, scout→analyst, analyst→director, director→отделы→editor→approve-loop→ingest).
- **Веб-receiver (контур разработки, build ЗЕЛЁНЫЙ):** `веб/app/api/content/ingest/route.ts` + `веб/lib/content/published-store.ts` — приём одобренных единиц (auth `INGEST_SECRET`, идемпотентно по `id`, JSON-стор `data/local/`, без Prisma-миграций). Прогон: 401 без секрета / 422 кривой type / 200 валидная / идемпотентность / GET — все зелёные. `npm run build` exit 0, роут вкомпилирован.
- **Окружение:** в `env.manifest.md` добавлены `CONTENT_FACTORY_WEB_URL` + `INGEST_SECRET` (задать при деплое веба). Сеть: домен VPS в Network access → Allowed domains (разово, владелец).
- **Итог:** производственный контур фабрики (агенты + эстафета + гейты + деплой на веб) ГОТОВ. Осталось добить сам веб-интерфейс (красота/UI раздела «Опубликовано» и чат-зеркало) — следующая фаза.

## ВЕБ РАЗВЁРНУТ НА VPS (2026-11-01) — https://content.vernatunspeakclub.com
- **Контент-портал ЖИВОЙ:** `https://content.vernatunspeakclub.com` (HTTPS/Let's Encrypt, nginx → внутр. порт 8088). Проверено из облака: `/studio`·`/analytics` = 200, `/api/analytics/snapshot` = JSON (наш апп), `/api/content/ingest` = 401. DNS A content.* → 155.212.187.181 (VPS).
- ⚠️ **ВАЖНО: `admin.vernatunspeakclub.com` — ЛИЧНЫЙ кабинет владельца** (голосовые комнаты, статика `/home/.../vernatun-admin` + API `/api/lounge/`→8765, порты 443/86). НЕ деплоить туда! Первый деплой по ошибке ушёл на admin → откатили (`restore-admin.yml`), admin вернулся к владельцу. Деплой-workflow перенацелен на content.* и только ручной (workflow_dispatch).
- Workflows: `deploy-vps.yml` (деплой content, ручной), `inspect-vps.yml` (read-only осмотр nginx), `restore-admin.yml` (снять наш override с admin).
- **Как обновлять content:** правка в веб/ → пуш → вручную запустить workflow «Deploy content.vernatunspeakclub.com» (или дать команду — запущу). Порт приложения 8088, наружу https.

### (архив) первый деплой был на admin.vernatunspeakclub.com
- **Платформа ЖИВАЯ на российском VPS владельца**, HTTPS (Let's Encrypt/certbot), nginx → приложение (внутр. порт 8087). Проверено из облака: `/`, `/studio`, `/analytics` = 200.
- **Авто-деплой через GitHub Actions** (`.github/workflows/deploy-vps.yml`): пуш в ветку → раннер собирает standalone → SSH-доставка на VPS (appleboy) → nginx+certbot+pm2. Из облака Claude SSH закрыт (порт 22), поэтому деплоит робот GitHub.
- Секреты репо: `INFINITYS_DOOR_VPS_HOST` / `_USER` / `_SSH_KEY` (+ опц. `_PORT`). SSH-порт 22, пользователь не-root (passwordless sudo). Деплой идемпотентен.
- next.config: `output: "standalone"`; package.json: `prisma generate` на build/postinstall.
- **Как обновлять:** я пушу правку в ветку → Action сам выкатывает за ~3 мин → владелец обновляет страницу.
- Грабли, которые прошли (для памяти): имена секретов (INFINITYS_DOOR_*), формат ключа (OpenSSH BEGIN/END), чистый IP в HOST (+авто-trim), non-root → sudo, порт 87 привилегированный (<1024) → внутр. 8087 за nginx.
- ⚠️ Известные задачи фазы «красота»: мобильная адаптация (сайдбар не схлопывается — P0), БД пока JSON-fallback (Postgres подключим позже), серверный `/api/marketing/chat` перепаять на облако.

## Прогон циклов (2026-10-30, в этой сессии, подписочный путь)
- ✅ Веб живой: `next start` → `/studio`·`/schedule`·`/marketing`·`/analytics`·`/api/analytics/snapshot` = 200.
- ✅ YouTube API вживую: @mosarmclub 79 подп./55381 просм./13 видео.
- ✅ Контент-пайплайны (текст-стадия, агенты=подписка): карусель V-18, статья V-59, YouTube V-11, рилс V-37 — черновики в `drafts/2026-11/` + вердикты Редактора (EDITOR-verdicts.md). Все 4 формата прогнаны по разу.
- ⏭ SKIPPED до ключей (след. сессия): генерация картинок/видео/озвучки, Apify-ингест, aggregator-зависимые веб-функции, API сайта.

## Запуск/приёмка в новой сессии
- Готовый промпт запуска + список API-ключей — `NEXT-SESSION-LAUNCH.md` (вставить в новую сессию). Поднимает localhost, прогоняет пайплайны по разу, проверяет API/агентов/триггеры/веб-сценарии, отчёт Клиента.

## Как возобновить в новой сессии
1. Прочитать этот файл + `PLAN.md` + память нужного агента.
2. Продолжить с раздела «В работе / следующее».

## Доска директора · 2026-11-02 (Codex)
- Работа подготовлена в `codex/content-director-board` от `claude/lucid-bohr-j6mlrh` (`3f63e77`); исходная среда была на устаревшем main.
- HTML: `веб/public/content-board/index.html` — стратегия и снимок календаря 70 единиц, редактирование карточек, localStorage, экспорт/импорт JSON. Браузерные проверки пройдены. Общая синхронизация не подключена.
- Штатный деплой найден: `.github/workflows/deploy-vps.yml` → `content.vernatunspeakclub.com`; workflow не запускался (сетевой CONNECT 403 к api.github.com). Требования сети сохранены в черновик настроек среды.
- Подробности и границы проверки: `projects/vernatun/content-board/REPO-AUDIT.md`. Схема облачных триггеров остаётся из `shared/automation/README.md`; доступного scheduled-task инструмента в текущем чате нет.

## Telegram-графика — чат по поручениям владельца · 2026-11-05
- `telegram-graphics-lead` запускает производство только по прямому сообщению владельца; директорская запись и расписание не являются триггером.
- Без указанного ID lead сверяет месячный план и `jobs/`, присваивает следующий свободный `TGP`, создаёт папку из `_TEMPLATE/` и добавляет строку в план.
- Стартовый промпт: `projects/vernatun/departments/telegram-graphics/START-PROMPT.md`. Созданы/проверены `jobs/_TEMPLATE/`, `intelligence/`, `references/`; обязательны цитатное согласие, проверка реквизитов анонса и HTML-бейк логотипа на каждом изображении.
- Расписание и публикация только по отдельному поручению владельца после редакторского и owner gates. Реальный scheduled photo consumer в репозитории пока не подтверждён.
