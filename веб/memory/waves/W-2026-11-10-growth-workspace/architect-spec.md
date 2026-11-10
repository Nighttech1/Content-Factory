# Growth workspace — спецификация до кода
10.11.2026, Москва. Before SHA `b68eec9`, branch `codex/director-chatgpt-transfer`. Тренер B UI/C write: блокер закрывается fail-closed auth/Git контрактом ниже, не выдуманными доступами.

## Scope и сохранность
- Доработать существующий `/growth`; компактная шапка как соседние секции, убрать отдельный чужеродный logo/hero, subtabs и общий stats block.
- Только шесть основных этапов: awareness/desire/registration/attendance/return/membership; advocacy/reactivation скрыть в UI, **не удалять из исторического v2 JSON**.
- Удалить «Директор» только из desktop/mobile navigation; `/marketing`, чат, проекты/store/API сохранить. Остальные разделы/brand shell не переделывать.
- Сохранить все 24 V-ID/brief links/legacy факты; 14 proposed mechanics скрыть из workspace. Непроверенные AI-идеи не объявлять трендами; карточки помечать «Нужна разведка», пока нет доказательства.
- Нет VPS/deploy/платных API/поиска/LLM/scout execution. Существующий read-only `/api/growth-center` и валидатор v2 сохраняются для совместимости и старых guards.

## UI
- Клик по одному из шести этапов выбирает его и фильтрует **доску и один недельный график под ней**; без второго графика/параллельной dashboard-системы.
- Канбан: «Задача» → «Съёмка» → «Монтаж/Разработка» → «Согласование» → «Выпуск». Все форматы используют одни колонки, любую карточку можно переносить в любом направлении/порядке.
- Desktop drag-and-drop + доступные mobile/keyboard controls «Переместить в…»; ошибка сохранения возвращает подтверждённое состояние, не фальшивый успех. Для стрелок/драг клавиш нужен понятный label.
- «Выпуск» — **колонка работы**, не факт публикации; status published не меняется без URL+даты, контент сам не публикуется.
- Модальное окно карточки: ID/тема/формат/каналы/brief, сценарий, shot list, происхождение идеи/ссылка на реальный материал, что именно подтверждено/дата/ограничение, решение профильного отдела. Пустое честно unknown, не фальшивые сценарии/отзывы/популярность.
- «Обновить сейчас» в карточке только создаёт ручной Scout request; реальный запуск отдельным сообщением владельца «обновляй инфу». UI различает server queue / Git pending / Git sent; не пишет «скаут работает».
- «Изменить факт» открывает шесть nullable nonnegative integer counts текущей недели, Save/Cancel. Нет данных !=0. Save включает source/note и server timestamp; не выводить конверсии из несопоставимых данных.

## Общий контракт Backend → Frontend (только Backend автор типов)
Файл `lib/growth-center/workspace-model.ts` — strict Zod схемы, exports и pure selectors. Названия фиксируются до FE integration:
```ts
type WorkspaceStageId='awareness'|'desire'|'registration'|'attendance'|'return'|'membership';
type BoardColumn='task'|'shooting'|'development'|'approval'|'release';
type Counts=Record<WorkspaceStageId,number|null>;
type WorkspaceCard={id:string;title:string;format:string;channels:string[];stageIds:WorkspaceStageId[];
 column:BoardColumn;order:number;briefPath:string;script:string|null;shots:Array<{order:number;visual:string;spoken:string;onScreen:string}>;
 origin:{url:string|null;evidence:'unverified'|'verified';observedAt:string|null;note:string};
 departmentDecision:{status:'pending'|'approved'|'remarks';note:string;at:string|null};
 publication:{url:string;publishedAt:string}|null};
type WeekSnapshot={weekKey:string;cutoffAt:string;version:number;counts:Counts;source:string;capturedAt:string;
 kind:'freeze'|'correction';supersedesVersion:number|null;reason:string|null};
type GitBackupStatus={state:'not_configured'|'pending'|'synced'|'error';commitSha:string|null;message:string|null};
type ScoutRequest={id:string;cardId:string;status:'queued'|'git_pending'|'git_saved';createdAt:string;gitPath:string;commitSha:string|null};
type WorkspaceView={version:1;revision:number;commandReceipt?:{requestId:string;appliedRevision:number;replayed:boolean;scoutRequestId?:string};weekKey:string;counts:Counts;countSource:string;
 cards:WorkspaceCard[];snapshots:WeekSnapshot[];scoutRequests:ScoutRequest[];git:GitBackupStatus;
 capabilities:{authConfigured:boolean;authenticated:boolean;writeEnabled:boolean;gitConfigured:boolean;schedulerEnabled:boolean;csrfToken:string|null}};
type WorkspaceCommand=({type:'save_counts';counts:Counts;source:string}|
 {type:'move_card';cardId:string;column:BoardColumn;beforeCardId:string|null}|
 {type:'update_card';cardId:string;patch:Partial<Pick<WorkspaceCard,'title'|'script'|'shots'|'origin'|'departmentDecision'|'publication'>>}|
 {type:'request_scout';cardId:string}|
 {type:'correct_snapshot';weekKey:string;counts:Counts;source:string;reason:string}|
 {type:'retry_git'}) & {expectedRevision:number;requestId:string};
// export types above, validateWorkspaceCommand, getStageCards(view,stage), getWeeklySeries(view,stage)
```
API shape: GET WorkspaceView; POST command success200 возвращает полный WorkspaceView; конфликт409 `{error:"revision_conflict",revision:number}`, остальные ошибки `{error:string,message:string}`. Session login body `{secret:string}`, success `{authenticated:true,csrfToken:string}`, logout `{authenticated:false}`. Cookie `growth_workspace_session`, CSRF header `X-Growth-CSRF`. `validateWorkspaceCommand(input)` → `{ok:true,data}` либо `{ok:false,errors:string[]}`. `getWeeklySeries` → `{weekKey,cutoffAt,value,version,kind,source,capturedAt}[]` для выбранного stage.
Backend может обогатить DTO безопасными полями после сообщения FE, но не менять имена без handoff. `origin.verified` требует public http(s)URL+реальной даты+непустого evidence note; это свидетельство указанного источника, не доказанная «популярность». Популярность допустима только при датированных проверяемых метриках, сейчас их не выдумывать.

## Хранение/атомарность
- Новый runtime sidecar `process.cwd()/data/local/growth-workspace/state.json` в существующем persistent data mount. Bundled `data/growth/vernatun.json` — неизменный seed/история, не путь записи. Существующий старый store не импортировать молча.
- Initial projection детерминированно сохраняет 24 IDs, links, formats, stageIds (только первые шесть в UI); stage counts null, initial card fields unknown. Legacy published proof сохранить; planned→task, review/approved→approval, published→release, остальные безопасно task с сохранением исходного статуса в seed.
- Одним state transaction хранить content revision, фактовые события, снимки, карточки, idempotency results и durable Git outbox. Валидировать перед write; temp-file в том же dir → fsync → atomic rename; ошибки FS не означают save. Process mutex + cross-process lock/serialization (не только Promise chain), bounded lock wait; при crash сохранить old/next valid version, не silent reset.
- `expectedRevision` CAS, stale→409 с актуальной revision; `requestId` idempotent, повтор того же payload возвращает current view + original action receipt (тот же appliedRevision/scoutRequestId, replayed=true), иной payload с тем же ID→409. Auth/session и Git delivery metadata не увеличивают business revision и не порождают backup recursion. Внешний Git запрос **после local commit и вне lock**; sync metadata обновить под lock без потери новых command changes.
- Public response только агрегаты/контент/статусы, не секреты/private paths/env/errors/providerpayload. Никаких participant PII. App reload/другой клиент видит тот же server state.

## Серверная защита, API
- Не использовать `session-store OWNER`, `lib/db/actor.ts` header/cookie/seed-admin для authorization. Прямой write без защищённой серверной сессии невозможен.
- Env `GROWTH_ADMIN_SECRET` (случайный длинный secret >=32 chars) + explicit `GROWTH_ALLOWED_ORIGIN` (ровно HTTPS origin; localhost только для explicit development). Если отсутствуют/невалидны, write/session disabled 503; UI read-only с инструкцией настройки, не форма с готовым ключом.
- POST `/api/growth-workspace/session` принимает secret через HTTPS JSON, timing-safe compare, server-issued random nonce/sessionId/expiry и HMAC signed cookie (HttpOnly, SameSite=Strict, Secure production, bounded TTL<=8h). Ключ подписи derivation от admin secret с domain separation; нет secret в client bundle/localStorage/URL/logs. Login rate limit, bounded body; entered secret очистить после ответа.
- GET `/api/growth-workspace` возвращает WorkspaceView no-store и CSRF nonce только authenticated session. POST тот же route — strict command+session+CSRF header, exact Origin и JSON Content-Type; missing/cross-origin/forged/expired→401/403, no CORS wildcard. Active session nonces/expiry/revocation хранить в закрытой durable auth section, не Git backup. Logout session через DELETE session endpoint с теми же Origin/CSRF checks. Server page может рендерить seed, FE после mount читает workspace API; страница force-dynamic.
- Операции all authenticated, counts/column/IDs/body/URLs/text limits validated; пользователь не задаёт filesystem/Git paths, owner IDs, timestamps, arbitrary endpoints. Ошибки безопасные codes/messages. Origin не выводить из недоверенного Host/X-Forwarded без конфигурации.

## Недельные снимки
- Время Europe/Moscow; weekKey — понедельник YYYY-MM-DD; cutoff **воскресенье 23:59:00 Москва**. Backend clock, не часы браузера. В текущей неделе Save факт относится к этой неделе; нет её measurement→все неизвестные null, не carry-forward из прошлой недели.
- Фактовые события append-only с server createdAt; freeze для каждой due week version1 берёт последнее событие этой недели **не позже cutoff**; если события нет — null. Не копировать поздний текущий факт назад. `capturedAt` может быть позже cutoff при catch-up и это видно.
- Correction — новая immutable version той же недели с supersedes/reason/source; первоначальный freeze не переписывается. График отображает latest version каждого weekKey, явные gaps и correction marker/source, один выбранный stage.
- Scheduler: existing long-lived Node standalone, optional explicit `GROWTH_WORKSPACE_SCHEDULER=1`; инструментировать Node-only startup через `instrumentation.ts`, tick/catchup idempotent, без build-time mutations/network. CLI `scripts/freeze-growth-workspace.ts` для того же due function, не отдельная логика. Service unavailable→catch-up по событиям, не обещание job выполнился в точную секунду. Disabled/unconfigured статус в capabilities и setup guide. Не устанавливать cron/systemd на VPS сейчас.

## Git backup/outbox и ручная эстафета
- Runtime Git config только env: `GROWTH_GITHUB_REPOSITORY` owner/repo, `GROWTH_GITHUB_BRANCH` для backup, `GROWTH_GITHUB_TOKEN`; отдельный `GROWTH_SCOUT_BRANCH` default `codex/scout-handoff-20261109` (подтверждённая ветка Scout START), никакой implicit main/default repo/localhostconnector. Все три нужны для Git write; origin API строго github.com/api.github.com, server-bound, не payload URL.
- Без config authenticated server Save разрешён; git.state=not_configured, durable outbox сохранён, UI «На сервере сохранено; GitHub не настроен/не отправлено». Configured != verified; synced только после API подтвердил конкретный commitSHA. Error safe+retry с idempotency, не терять data. Ключ никогда не возвращать UI.
- Backup commit содержит immutable versioned aggregate snapshot по server-generated path `projects/vernatun/content-plan/workspace-history/<revision>.json`; live state/секреты/сессии/идемпотентность в Git не писать. Worker Git CAS без force; при branch advancement refetch/rebase tree/retry bounded, чужие paths не перезаписывать. Один outbox item→тот же snapshot/request, не дубли при retry.
- request_scout создаёт server request + durable outbox для `projects/vernatun/departments/scout/requests/growth/<requestId>/00-request.json` в отдельной GROWTH_SCOUT_BRANCH, отдельная папка каждого запроса. Из dev branch queue не выдаётся за видимую Scout; root/AI Bridge отдельно готовят узкий START/README intake addendum в Scout branch без merge веток. Запрос: cardID/owner question/knownsource/expectedresearch/evidencecriteria/что неизвестно/прямое «Не запускать без сообщения владельца “обновляй инфу”». ID/path server-generated, no traversal. `git_saved` только после commitSHA; без Git честный queued/not sent. Ни поисковые сервисы, ни LLM, ни content production не вызываются.
- AI Bridge обновляет только ручной intake protocol/README/setupguide; сохранение запроса != получение/старт Scout. Автоматический импорт будущих отчётов из Git **вне scope**, обозначить в руководстве; следующее появление verified origin требует явного проверенного update_card, не redeploy и не скрытого парсинга.

## Приёмка
- Desktop1440 и mobile412/390/360: compact header, четыре navпункта без Director (legacy direct route alive), только6stages, выбранныйstage фильтрует board/ONEweeklychart, no overflow, modal+drag+mobile arbitrary/backward moves.
- Auth default disabled, forged OWNER/header rejected, cross-origin/CSRF/expired sessions denied; unlock не хранит secret в browser storage; no configured Git=>honest server-onlysave/outbox. Reload/two clients consistency; CASconflict/idempotency/diskfailure/noreset и Git429/conflict/retry/networkfailure tested mocks.
- Moscow Sunday cutoff boundary+catchup+missing null+lateevent+immutable correction versions; graph nofakegrowth. 24 IDs/legacyv2tests preserved; unsafe source/“popular” claims rejected/marked; Scoutcreatesonlymanualrequest, nopaid/search/LLM.
- Typecheck/model/API/targetedserver/board/browser tests, baseline guards не ослаблять. Независимые Tester/Client создают C-* до полного закрытия; production не требуется и не выполняется.

## Уточнение контракта до реализации Backend — ручное обновление карточки
- Авторизованный owner editor модального окна может менять только `title`, `script`, `shots`, `origin`, `departmentDecision`, `publication`. `id`, `briefPath`, исторический seed, requestIDs, timestamps и Gitpaths не принимаются как patch. Применяются те же session/CSRF/CAS/idempotency и audit/outbox, что к другим mutations.
- `publication` либо null (явно снять внесённый proof), либо strict `{url,publishedAt}`: публичный http(s)URL безcredentials/небезопасныхсхем и реальная календарная дата не позже server today Europe/Moscow. Одного перемещения в «Выпуск», approved-решения или готового файла недостаточно. В Fact видны только карточки с валидным publication proof; в Plan все карточки выбранного этапа независимо от proof.
- После ручной разведки владелец может заменить заголовок/сценарий/доказательства исходной карточки без пересборки; V-ID сохраняется, изменения идут в runtime sidecar/history. Это не автоматический импорт Scout, не удаление исходных 24 seed-заданий и не обещание проверенной популярности по одному URL. Публикация контента во внешние сервисы не происходит.
- Frontend показывает Edit/Save/Cancel только при server capability writeEnabled; при недоступном auth — честный readonly. Сценарии сохранения и Factproof проверяются двумя клиентами/reload и негативными futuredate/unsafeURL/unknownpatch guards.
- Production auth не ослаблять ради QA. Тестировщик проверяет HTTPSlocalhost:3443proxy→Next3000 с эфемернымиtestsecret/cert; Securecookies/Origin/CSRF остаются настоящими. Сертификат/ключи не коммитить, tests не меняют VPS.
