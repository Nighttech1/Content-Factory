# Production release — Ситуационный центр

10.11.2026. Владелец явно разрешил выкладку. Итог: **выложено, независимо принято Клиентом**.

- URL: https://content.vernatunspeakclub.com/growth
- Проверенный app source: `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`.
- QA42704640983 / QAcommit c88dac026f699a82e99e0ad5b243b62210d74c18 / immutable artifact13713870877.
- Revision: `situation-v2-20261110-01`.
- Успешный [release42713196016](https://github.com/Nighttech1/Content-Factory/actions/runs/42713196016), job129487930184, marker092d6c888684c33ad310a04f9a2da26f5cc8c612, ops0b6ba3d37316748260697b5941ea40f4fda4f224.
- Фактический stdout22:38:55UTC: `DEPLOY_VERIFIED source=3ac253b6ad9ec307bc82dcde3fcc5465f01e7115 revision=situation-v2-20261110-01 target=content.vernatunspeakclub.com manager=content-factory.service port=3087`.

## Что выполнено

Artifact identity/source/run/hash gate прошёл; приложение не пересобиралось. Успешны capacity и строгий existingruntime preflight, private backup старого release/runtime/env/mainunit, распаковка нового release, links на прежние `/var/lib/content-factory/{data,generatedMedia,public}` и `/etc/content-factory/app.env`, chown только нового release, atomic current switch и restart только content-factory.service. Проверены localhost3087 и HTTPS routes/API revision, PID/UID/cwd/listener и storage links, неизменный mainunit hash.

Старый unit запускал known Next CLI; новый tested bundle standalone. Создан только owned `90-content-factory-release.conf`, который сбрасывает ExecStart и запускает `/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js`. Исходный unit, nginx и app.env не переписаны. Private backup расположен под `/opt/content-factory/backups/`, oldrelease сохранён. Это file-level copy, не заявленный транзакционный snapshot внешней БД. Runtime не восстанавливался из backup и не заменялся bundled fixtures.

## Проверки и замечания

Первый release42710726458 безопасно остановился до APP mutations: ошибочно предполагался old root/server.js. Read-only42711257723/42711580976 доказали exact oldNextCLI; адаптация пересмотрена Архитектором до исправления. Independent Tester:8полных mockcases,14rollbackbranches,12actualPythonpreflightcases PASS. C-OPS-ROLLBACK-VERIFY и C-OPS-DROPIN-OWNERSHIP закрыты с guards. Проверенный rollback восстанавливает createddropin state, oldcurrent, originalCLI/manager, health/PID/UID/cwd/listener, не перезаписывая новые runtime writes. Реальный rollback при успешной второй попытке не требовался.

После выкладки отдельный Клиент реально открыла live URL и проверила пользовательские сценарии; см. [production-client-acceptance.md](production-client-acceptance.md). ProductionПРИНЯТО, открытых замечаний нет. Приёмка владельцем отдельно. Desktoplive не подменяется прежним мобильнымCI.

## Следующая доставка

Текущий adapter initial-only: для следующей версии потребуется разрешить только exact уже существующий owned drop-in/standalone identity и сохранить/восстановить его прежнее состояние. Не обходить текущий запрет foreign/existing drop-ins, не запускать новый PM2 и не переделывать runtime. Новый appbundle потребует своего QA; успешный source3ac253b6 не является проверкой будущих изменений.
