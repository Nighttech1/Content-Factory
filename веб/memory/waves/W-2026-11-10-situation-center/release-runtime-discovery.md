# Release — read-only runtime discovery

10.11.2026. Владелец явно разрешил production deployment только `content.vernatunspeakclub.com`. `admin.*` вне scope. Проверенный app artifact не пересобирается: source `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`, QA `42704640983`, artifact `13713870877`, revision `situation-v2-20261110-01`; свежесть artifact подтверждена Оркестратором.

SSH root ранее прошёл, но `REMOTE_ROOT_PM2_PID_ALIVE=false`. Старый rollout требует доказанного PM2 SSH-user context и сейчас обязан safe-fail. Нельзя запускать новый root PM2 или отключать context gate.

## До изменения rollout

Расширен только read-only `REMOTE_COMMAND` существующего guarded probe. Python stdlib читает metadata `/proc` (PID, UID, PPID, cwd, executable basename, comm, cgroup unit names), находит owner listener8088, app paths, owner-home PM2 pid metadata, известные storage paths и local proxy ports nginx. Env, ключи, содержимое файлов данных, cmdline не читаются и не печатаются. PM2/systemd не вызываются.

Новый `REMOTE_INVENTORY_JSON` явно разбирается и передаётся в bounded log: максимум24000 символов, allowlist верхних полей, ограниченные коллекции. Старые boolean auth diagnostics сохранены. Отсутствие inventory не объявляется успешной идентификацией manager.

`node scripts/test-growth-vps-auth.mjs`: 6 групп PASS, включая controlled root/nonroot, invalid fingerprint, unknown target, inventory parsing/bounds/forwarding, bash/Python syntax и отсутствие manager mutations/env/cmdline reads. `git diff --check` PASS. Реальный remote inventory этой ролью не запускался; его выполнит Оркестратор существующим connectivity marker.

## Следующий этап

После фактического inventory составить точный release spec для существующего process manager/owner: сохранение runtime storage/env, полный backup прежнего приложения и конфигурации manager, запуск tested artifact и health/revision checks, автоматический rollback прежнего manager без восстановления поверх новых пользовательских данных. До evidence rollout-код не меняется.

Отдельно: deploy-job должен брать **операционный rollout script из текущего deployment commit**, а app — исключительно проверенный immutable artifact. Смена deploy checkout с tested app source на deployment commit допустима только вместе с сохранением artifact identity gate. Это не пересборка app и не основание изменить tested source SHA.
