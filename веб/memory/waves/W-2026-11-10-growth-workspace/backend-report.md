# Backend handoff — growth workspace

10.11.2026. Реальная проектная роль Backend. Прочитаны AGENTS/STATE, профильные правила/skill/zero-data-loss/plugins/knowledge и architect-spec+chain **до кода**; scope и поправки согласованы Архитектором.

## Реализовано

- `workspace-model.ts`: единственный DTO/schema контракт, шесть этапов, пять произвольных Kanban колонок; strict commands, nullable counts, публичные evidence/publication URLs, сценарий/кадры/решение/название/публикационный proof; pure stage/weekly selectors. `commandReceipt` для текущего view и оригинального результата идемпотентного действия.
- `workspace-store.ts`: новый version1 JSON sidecar вне bundled seed; `GROWTH_WORKSPACE_DATA_DIR` absolute override, default `cwd/data/local/growth-workspace`. Initial projection сохраняет все24 ID/briefs/formats и legacy publication proof. Atomic temp/fsync/rename, process mutex+cross-process file lock, optimistic revision, payload-bound idempotency, immutable факт-events/weekly versions. Неисправный файл не сбрасывается в seed.
- `workspace-auth.ts`: fail-closed `GROWTH_ADMIN_SECRET` >=32 + exact allowed origin; HMAC signed HttpOnly/SameSiteStrict/Secure session, durable active nonce, CSRF, expiry8h, logout revocation, login rate limit, bounded strict JSON. Preauth actor/OWNER switch не используются.
- GET/POST `/api/growth-workspace`; POST/DELETE `/session`. Все mutation требуют защищённую сессию+Origin+CSRF. GET public aggregate/card view не выдаёт secret/session/outbox payload/privatepaths. Save первой операцией пишет серверный state; только потом запускает Git delivery **в фоне без ожидания сети**, возвращает честный pending/notconfigured либо уже подтверждённый статус. Очередь durable, retry/scheduler продолжают доставку; unhandled rejection исключён.
- Недельное отсечение Sunday23:59:00 Europe/Moscow, неизвестное null, отдельная текущая неделя без carry-forward. Catch-up берёт только события соответствующей недели до cutoff; correction добавляет новую версию с причиной. 23:59:00–00:00 Save counts возвращает `week_closed`, не принимает значение с последующим молчаливым выпадением из снимка.
- `workspace-weekly.ts`, Node-only instrumentation и CLI `freeze-growth-workspace.ts`: optional explicit scheduler, catch-up, no build-phase effects. Никакой cron/systemd на VPS не настраивался.
- `workspace-github.ts`: durable backup/Scout outbox, explicit runtime Git config и отдельные branches; exact-byte verify at immutable commit; FF-only ref CAS/rebase retry, immutable path collision fails closed, no raw provider errors returned. Нет config→серверное сохранение допустимо и Git `not_configured`. Retry/delivery metadata не увеличивают business revision и не создают рекурсивные backups. Общий Gitstatus учитывает ошибки Scout даже после успешных backups.
- Scout request server-generated `scout-UUID`, отдельный `00-request.json`, currentcard projection и жёсткий manual trigger. Сохранение в Git не считается стартом исследования. Ни поиска, ни LLM, ни платного сбора.

## Проверки автора

- `node --import tsx scripts/test-growth-workspace.ts`: **24 групп PASS** — persistence/secondstore/CAS/idempotency/arbitrary backwards moves, strict sources, live title/publication proof, Scout queue, sanitized backup, weekly/catchup/correction/closedminute, auth/CSRF/logout, exactcommit/mockedGit429/idempotentdelivery/conflictingimmutablepath, mixedScoutfailure, noreset, persistence начала tracking при первом scheduler tick без замера.
- `node --import tsx scripts/test-growth-workspace-api.ts`: **PASS** — настоящие Next Route handlers через изолированные Request/Response; authmissing/forgedOWNER/origin/CSRF/Save/replay/409/readers/release!=publication/bodylimits/logout. Сеть не использовалась.
- Полный `tsc --noEmit`: **PASS** после поправки типизации переменной Response в авторском APItest.
- Targeted ESLint Backend путей: **0 errors**; найденный unused type import удалён.
- `git diff --quiet -- lib/growth-center/model.ts data/growth/vernatun.json`: **PASS**, legacy schema/readAPI и canonical v2 не менялись.

## Handoff / ограничения

Frontend уведомлена о DTO и session DELETE без JSONbody; Tester — о clock/tempstore/env/fetcher injection; AI Bridge — о nested `card{title,format,channels,stageIds,briefPath,origin}` Scoutpayload; Deployer — о private tempdirectory и HTTPSlocalhost proxy env.

Это авторская проверка Backend, **не независимая приёмка**. Независимые Tester/Client и browser/build gates ещё выполняются отдельными ролями. Runtime production credentials/permissions/scheduler на VPS не проверялись; actual Git write, VPS, платные API, deployment и публикация контента в этой подзадаче не запускались.
