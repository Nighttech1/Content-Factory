# C-OPS-ROLLBACK-VERIFY — не объявлять ложное восстановление

Дата10.11.2026. Обнаружила независимая Тестировщик при static review systemd adapter до production release.

**Приоритет P1; статус CLOSED — исправлено и независимо перепроверено до release.**

В `scripts/deploy-growth-center.sh` функция rollback включает `set +e`, выполняет `ln` и `mv` отдельными непроверенными командами, затем считает успехом `systemctl restart && curl /marketing`. Ошибка создания/переключения ссылки может оставить новый release активным, но напечатать `ROLLBACK_VERIFIED: original release restored`.

Ожидается: restoration-команды, проверка realpath current==OLD_CWD, restart и health должны быть единой проверяемой цепочкой; предпочтительно подтвердить PIDcwd старого release/UID980. При любом сбое восстановления — ROLLBACK_HEALTH_FAILED, без VERIFIED. Runtime/env не восстанавливать поверх записей пользователей.

Guard: изолированная mock-проверка актуальной функции rollback с failures ln/mv/current identity/restart/health и успешным случаем. Не запускать SSH, systemd, реальные ln/mv production paths или сеть. Закрыть только после исправления и фактического PASS; evidence добавить ниже.

## Фикс и повторная проверка

Деплоер объединила `ln → mv → current realpath==OLD_CWD → restart → bounded old health → old PID cwd/UID` в проверяемую `&&` цепочку. Ошибка любого шага теперь выдаёт ROLLBACK_HEALTH_FAILED, первичный ненулевой код deployment сохраняется, VERIFIED отсутствует.

Тестировщик фактически запустила `node scripts/test-systemd-release-review.mjs`:7 rollback ветвей PASS (успех,ln,mv,current identity,restart,health,process identity). Guard извлекает **актуальные** функции adapter и подменяет только системные команды; production пути/SSH/systemd/сеть не затрагиваются. Дополнительно9 независимых checks фактического Python preflight PASS: success,extra ExecStart arg,user,PID UID,cwd,listener,storage,env,dropin. Синтаксис Bash и git diff check PASS.

Независимо повторён `python scripts/test-systemd-release.py`:5 full-adapter mocked scenarios PASS, включая failed rollback mv→не VERIFIED/не restart неправильного current и сохранение post-cutover пользовательских записей.

## Повторный review Next CLI → собственный drop-in

После фактического safe-fail прежнего preflight Архитектор одобрила отдельное уточнение для old known Next CLI. Актуальный guard дополнен CONFIG_CHANGED rollback до switch: `remove only owned drop-in → daemon-reload → old current → main unit hash → restart original CLI → bounded health → PID UID/cwd/listener3087`. Фактически14 независимых rollback ветвей и12 actual Python preflight ветвей PASS;8full adapter mocks PASS,включая configwrite/reload failure до current и failed config removal без ложного VERIFIED. Первичный код ошибки сохраняется. Этот retest заменяет прежний7+9 для нового adapter.
