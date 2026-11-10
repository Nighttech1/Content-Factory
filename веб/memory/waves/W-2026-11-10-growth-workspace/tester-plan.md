# Независимый QA-план growth workspace

10.11.2026. Спецификация и chain прочитаны; это план,не выполненный PASS. Тестировщик не меняет backend/UI/API и их авторские tests.

1. **Серверная граница:** disabled/default auth; arbitrary OWNER/header/cookie не авторизует; wrong secret/expiry/rotation/rate/bodylimit; exact allowed Origin+JSON+CSRF для mutation/logout; no secret/nonce private state в JSON/logs/browser storage. Offline Request/Response и real HTTPS localhost API.
2. **Общие данные:** temp runtime directory;два независимых store/clients;reload/reopen;CAS409;одинаковый requestId/payload idempotent,инойpayload409;any-direction/allformat move не меняетpublicationproof;filesystem errors не reset/save success. Server snapshot публичен только approved aggregate shape.
3. **Недели:** MoscowMonday/weekKey,Sunday23:59:00cutoff точные boundary;lateevents не переносятсяназад;catchup idempotent/missingweeksnull;новаянеделя неcarryforward;immutablecorrections supersedeversions;график latest version с source/gap.
4. **Git/Scout:** injected fetch only,noactualnetwork;partialAPI failure/429/conflict/retry;durable outbox survivesreload и не затирает новыеcommands;Git success толькоcommitSHA;token не в response/errors/exports/logs. Scoutqueue идёт в отдельнуюветку,ID/path server-generated,нет«workerstarted»/поисковых/платныхAPI.
5. **UI:**actual production bundle через ephemeralHTTPSlocalhost3443proxy→HTTP3000;explicit testownersecret+allowedorigin,никакогоprodbackdoor. 1440/412/390/360;6stages/4nav без Director; noextrasubtabs/stats/mechanics; stagefiltersboard+ONEweeklychart;modalunknown/script/shots/origin/department;nativeDnD+keyboard/mobilemove во всестороны;source/fact Save/Cancel;authinputcleanup;2clientsreload/sharedstate;columnrelease не публикация;Scoutqueuednotrunning;legacydirectmarketing/studio живы. Screenshots+consoleerrors+overflowguard.

## Разрешённые QA paths и окружение

- Root-level `scripts/growth-workspace-browser-qa.mjs`,TLSfixturehelper при необходимости.
- Independent guards в `веб/scripts/` или wave;report/tickets толькоTester.
- В browserCI сервер должен получитьrandommasked GROWTH_ADMIN_SECRET, GROWTH_ALLOWED_ORIGIN=https://localhost:3443,temporaryruntimepath отBackend. Git runtime config не включать;не отправлять реальный Git/Scout.
- Proxy создаёт одноразовый self-signed certificate только вtempfolder,Playwright ignoreHTTPSErrors только длялокальнойfixture;послепрогона ключиудаляются. Никогда не использоватьproductionorigin/upstream.
- Local Chromium launch уже фактически blocked socketEPERM;реальныйbrowser прогон выполнит существующийQA-onlyActions послеBackend/FE readiness. Авторствоe2eнеозначаетвыполнениедоCI.

До готовности реальных exports/handlers/factories не писать фиктивные «успешные» mocks приложения и не ослаблять legacyv2guards. Все C-* передавать владельцу пути,закрывать только после фактического retest.
