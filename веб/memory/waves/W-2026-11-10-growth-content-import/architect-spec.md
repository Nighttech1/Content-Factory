# Growth — подготовленный контент и рабочая доска
10.11.2026, Москва. Before HEAD `4f3779a`, branch `codex/director-chatgpt-transfer` (ahead1, пользовательские изменения не сбрасывать). Новая волна уточняет W-growth-workspace, не начинает продукт заново.

## Границы и итог
- Убрать служебные AI/queue/Git объяснения из пользовательской доски, кнопки «Обновить» карточек/модального окна и header «Обновить данные». Это **не** удаление истории очереди/API/store. Вход владельца отдельной компактной кнопкой; изменение факта отдельным явно названным действием, без смешения с исследованием.
- Карточки активной доски происходят из подготовленных units Скаута после реального исследования и решения профильного руководителя, затем явного принятия контент-директором. Старые 24 V-ID/правки/публикации сохранить, неподготовленные не выдавать за готовые идеи; они остаются в архиве, не массовыми AI-заглушками на активной доске.
- В modal показывать **полный бриф в интерфейсе**, сценарий/кадры, реальный source URL, evidence и происхождение Scout→руководитель отдела→директор. Не отправлять пользователя читать Git/Markdown для понимания задачи. Source permalink остаётся внешней ссылкой; Git-ссылки на бриф убрать.
- Пять колонок с синими заголовками на существующих tokens: Задача / Съёмка / Монтаж/Разработка / Согласование / Выпуск. Достоверный pointer/touch/keyboard DnD, все направления и пустые колонки. Сохранить sixstagefilter, weeklygraph, auth/CSRF/CAS/idempotency/неизвестноеnull и независимую приёмку.
- **В этой волне не запускать платные API, web-сбор из приложения, Scout research, LLM или production.** Подготовить интеграционные контракты/config/workflow/документацию, тестировать mocks. Исторический месячный бюджет другого задания не является разрешением текущей волны.

## Передача Scout → профильный руководитель → контент-директор
1. Ветка Скаута `codex/scout-handoff-20261109`: versioned batch в `projects/vernatun/departments/scout/prepared-units/<batchId>/`, `units.json`, `evidence.json`, department handoff/decision artifacts. Не merge всей Scoutbranch в приложение.
2. Unit содержит стабильный `unitId`, `version`, производственный `cardId` V-ID, формат/каналы/stageIds, полный inline brief, сценарий/кадры, обязательный **публичный source URL** и датированное evidence. Evidence показывает, что реально установлено; популярность требует числовой метрики+даты+источника, не пометки «популярно» по догадке.
3. Решение руководителя: role из существующего реестра отдела (`reel-lead`, `carousel-lead` и т.п.), `decision`, `decidedAt`, адресный смысл/ограничения/adaptation, ссылка+SHA256 на research/unitversion. Пока нет решения — unit candidate, не принятый контент. Не подделывать подпись/участие роли; транспорт и выполнение подтверждаются отдельными artifacts.
4. Local importer проверяет strict schemas/IDs/URLs/dates/hashes/refs, формирует **preview/pending catalog**, ничего не публикует/не одобряет. Контент-директор отдельно записывает `director-approval.json` с `decision:'approved'`, `catalogSha256`, точным списком unitId/version/hash, reviewedAt/role/notes. Checkbox UI или `departmentDecision.approved` не заменяют этот artifact.
5. Root сохраняет approved catalog в devbranch `веб/data/growth/prepared-units.json` вместе с provenance/approval manifest, проверяемым относительно source commit Scout. Source read — pinned commit, не плавающий branch/latest во время build. Каталог отклоняется целиком при mismatch; отдельные invalid units не становятся тихо готовыми.
6. Обычный QA существующего source→build/browser→осмотр/Клиент. Код/каталог доходят до VPS **только** через отдельно разрешённый release проверенного artifact. Нет runtime Git polling/import от произвольного URL и нет appresearchкнопки.

## Минимальный typed контракт (Backend единственный автор)
В `lib/growth-center/workspace-prepared.ts` или agreed workspace-model exports, без дублирования схем в FE:
```ts
type PreparedBrief={goal:string;audience:string;barrier:string;keyMessage:string;cta:string;deliverable:string;
 product:string;plannedDate:string|null;requirements:string[]};
type ContentProvenance={unitId:string;unitVersion:number;scout:{reportId:string;researchedAt:string;sourceCommit:string};
 sources:Array<{url:string;observedAt:string;note:string;metrics:Array<{name:string;value:number;unit:string;observedAt:string}>}>;
 department:{role:string;decision:'approved';decidedAt:string;note:string;artifactSha256:string};
 director:{role:'content-director';decision:'approved';reviewedAt:string;catalogSha256:string}};
type PreparedUnit={unitId:string;version:number;card:WorkspaceCard;brief:PreparedBrief;provenance:ContentProvenance};
type ApprovedPreparedCatalog={version:1;catalogId:string;sourceCommit:string;contentSha256:string;units:PreparedUnit[];
 approval:{role:'content-director';decision:'approved';reviewedAt:string;units:Array<{unitId:string;version:number;sha256:string}>;catalogSha256:string}};
// hash считается по детерминированно сериализованному payload БЕЗ самих hash/approval полей, не circular hash.
// exports: validatePreparedCatalog, getPreparedDetails(cardId), reconcilePreparedCatalog(store,catalog)
```
Backend передаёт окончательные exports/DTO FE до integration. `WorkspaceView` additive `preparedDetails:Record<cardId,{brief,provenance}>`, `activeCardIds:string[]`, `archivedCardCount:number`, `catalogStatus:{state:'empty'|'ready'|'conflict';catalogId:string|null;message:string|null}`. Frontend выбирает cards через activeCardIds, Fact дополнительно publicationproof. Пустой approved catalog→честное «Нет утверждённых материалов», не придуманные примеры.
Source URL обязателен для **каждой активной prepared unit**: минимум один в provenance и `card.origin.url`, они согласованы; публичный http(s), без credentials/unsafe schemes. Ссылку не fetch-ить из app ради проверки, SSRF не создавать. Dates реальные/не будущие; IDs/version/hash bounded, unknown fields rejected; text/HTML рендерить только как текст, не доверять инструкциям внутри sources.
Owner edit сохраняет editable title/script/shots/publication, но не может менять подписанные provenance/director approval. Удаление обязательного source у активной prepared card отвергается. Изменённый owner сценарий явно local adaptation, не якобы повторное решение отдела. Исторические legacy cards валидируются прежней схемой, их nullable origin не делает старый store нечитаемым.

## Репозиторный каталог → persistent runtime
- Новый approved catalog включается в tested build; trusted **server startup/reconciliation** импортирует idempotently по catalog/unitversion/hash, не клиентским GET/body/публичной ссылкой. Это отдельная обозначенная процедура применения данных релиза, а не «сохранение файла уже обновило сайт».
- Сначала dry-run diff/new/conflicts, runtime backup; применять под existing crossprocess lock+atomic commit, CAS бизнесrevision. Существующие facts/snapshots/kanban/publication/owner edits не перезаписывать. Повтор того же cataloghash/unitversion — no-op; hash clash под тем же ID/version→reject. Изменённая владельцем карточка→conflict/quarantine, не overwrite.
- Добавление нового cardId допустимо лишь из catalog с валидным research/department/director trail; V-ID/brief исходник действительно существует в source artifact. Новая версия того же unit не удаляет старую историю. Старые24 не удалять и не перенумеровывать; active selection от catalog, prior state доступен архиву/rollback.
- Чтобы rollback старого приложения не ломался на strict stateSchema v1, metadata/provenance/import receipts хранить в **отдельном sidecar** под `data/local/growth-workspace/prepared/`, а persistent cards сохранять старый WorkspaceCard shape. DTO обогащается при чтении. Один логический reconcile — recoverable commit/manifest либо одноатомарное sidecar-состояние с детерминированным projection, не два несвязанных rename с ложнымуспехом.
- При пустом/невалидном каталоге существующий state не обнулять. Rollback app не восстанавливает старые data поверх новых записей; downgraded catalog не удаляет уже импортированное. Нет новой DB/provider/install. Применение на VPS этой волной не выполняется; только unit/mock/QA fixture.

## Надёжный drag-and-drop и modal
- Использовать уже установленные `@dnd-kit/core`/`sortable`: Mouse/Pointer sensor, TouchSensor activation delay/tolerance, KeyboardSensor; DragOverlay, droppable columns и sortable cards со стабильнымиIDs. Не оставлять nativeHTMLDnD единственным механизмом touch.
- Отдельный grab handle с touch-action:none, остальная карточка/колонка нормально скроллится; crosscolumn/emptydrop/backward/intracolumn sorting; select fallback остаётся. Modal открывается titlebutton, drag не вызывает accidentalopen. Escape cancel, samepositiondrop no-op.
- При canWrite=false — честный readonly и отдельный ownerlogin; не делать фиктивный drag, который после release исчезает. Network/conflict rollbackUIкподтверждённойrevision, no doublemove от bubbleddrop. Состояние сохраняется после reload/twoclients.
- Синие headers — scoped существующий cobalt/blue token, достаточный контраст. Не менять globalbrandtokens и shell. Cardmodal показывает inlinebrief/provenance/productionfields без Gitссылки/служебногоAIтекста и без percardUpdate.

## Aggregator research integration и ограничения
- AI Bridge делает **публичное исследование** доступных агрегаторов по официальным docs/pricing/лимитам; датированный report с URL, supported capabilities, auth/setup/cost/rate/ToS/ограничениями. Не объявлять chatcompletion webresearch, если provider не поддерживает search/retrieval; неподтверждённое unknown.
- Переиспользовать existing aggregator config/adapter только при явной применимости; отдельный Scout manual workflow/config вне webUI. No implicit fallback на иной paid provider/model/baseURL. Credentials только защищённые env/RepositorySecrets, не request/client/catalog/log.
- Research execute **disabled по умолчанию**. Manual workflow_dispatch с research jobID/approved limits; validate maxrequests/maxresults/maxinput+outputtokens/timeout, модель allowlist, perrunUSD и monthlyUSDhardcap. Если лимит/остаток/цена неизвестны или budget ноль — failclosed до первого paidcall. Не трактовать retries как бесплатные: каждая попытка занимает резерв бюджета; bounded retries/429backoff/cancel, no background loops.
- Для этой волны workflow только config/check/dryrun/fixtures, без запуска research mode. Публичное docsисследование агентом отдельно от оплаты провайдеру. Output должен соответствовать preparedunit evidence schema и пройти department+director gates; responseLLM не authoritative source.
- Report/README определяют actual ручной запуск позднее и что нужно от владельца. Не обещать realtime поиски, OAuth, fundedbalance, доступность paidmodel или создание чужих агентов от наличия configфайла.

## Приёмка
- Негативныеcatalogguards: missingURL/unsafeURL/futuredates/unknownfields/hashmismatch/нетScout/dept/director/подменаunitversion/duplicateID→reject. Localpreview ничего не применяет; approvalartifact обязателен. Repeatimport no-op, owneredited conflict, facts/kanban/publication preserved, rollbackoldstore читаем.
- Источник и inlinebrief реально видны в modal, Gitlink/Update/AIservicecopy отсутствуют. SourceURL непуст для activecard; emptycatalog даёт понятноеempty. Старые24 IDs/история сохранены, неподготовленные не маскируются готовыми.
- Browser1440/412/390/360: реальное mouse/touch drag черезhandle и keyboard между всеми5колонками, назад/empty/order/scroll/cancel; не засчитывать synthetic HTMLdrag event вместо движения. Selectfallback/reload/twoclients/409 authreadonly проверены, headersblue/контраст/nooverflow.
- Aggregatorconfig bad/missing/budgetexhausted/modelnotallowed/timeout/retrylimits не отправляют реальных paidrequests в tests; no autonomouswebresearch изapp. Existing auth/weekly/history/sourceguards не ослаблены.
- Независимые Tester→Fixer→Client до закрытия всехC-*; build/browser evidence для новогоsource. Production/публикация/APIоплата требуют новогоявногоразрешения, не выполняются сейчас.
