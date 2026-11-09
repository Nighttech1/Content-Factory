# Release spec — существующий systemd, до rollout-кода

10.11.2026. Разрешение владельца: выложить только `content.vernatunspeakclub.com`. Приложение не пересобирается: tested source `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`, QA `42704640983`, QA commit `c88dac026f699a82e99e0ad5b243b62210d74c18`, fresh artifact `13713870877`, revision `situation-v2-20261110-01`.

## Доказанный runtime

Phase2 CI `42709041462`: unit `content-factory.service`, User/Group `content-factory` UID980, WorkingDirectory `/opt/content-factory/current`, current → `/opt/content-factory/releases/20261108-main7f4cede`. MainPID123403 UID980 слушает3087, nginx content-only vhost проксирует3087. PM2 не используется. EnvironmentFile `/etc/content-factory/app.env`; DropInPaths пуст, ProtectSystem=no. Полные `data`, `generatedMedia`, `public` старого release указывают на одноимённые `/var/lib/content-factory/` directories; `.env.production` → app.env.

## Точный порядок

1. Read-only fail-closed preflight **до первой мутации**: root; existing unit active/running, User/Group точные, WorkingDirectory/current точные; privately parse `ExecStart` argv, разрешить только `/usr/bin/node server.js` либо `/usr/bin/node /opt/content-factory/current/server.js`. Сырые argv/env не печатать. MainPID UID980/cwd oldrelease и подтверждённый listener3087. Никакого PM2, provisioning, unit override/daemon-reload/nginx change.
2. Подтвердить точные external realpaths старых data/generatedMedia/public и env; new release отсутствует; writable base. Проверка места учитывает **старый release + внешний runtime + развёрнутый bundle + запас**, а не старый ошибочный duBASE без releases. Обе проверки (workflow capacity и remote adapter) консервативно резервируют 2×(oldrelease+externalruntime)+bundle+256MiB. Недостаток/неизвестная ёмкость → стоп до staging/mutations.
3. Создать root-private backup (0700) и новый release. Сохранить old release, external runtime и env в private backup; секреты/содержимое не выводить. Backup не используется для восстановления поверх изменившихся runtime данных при штатном rollback. Backup failure → старый app остаётся запущен.
4. Проверить tar paths и распаковать **тот же immutable artifact** в новый release. Chown только новый release на существующие UID/GID content-factory без следования external symlinks. Сохранить bundled public/data/media/env в backup и связать новый release с **теми же** `/var/lib/content-factory/{data,generatedMedia,public}` и `/etc/content-factory/app.env`. Не создавать новый shared и не копировать bundle public поверх live public. Новых public-assets у фичи нет; .next/static остаётся из tested bundle.
5. Перед cutover ещё раз current==oldrelease. Atomic symlink replacement current→newrelease, `systemctl restart content-factory.service` — только этот unit. Ни stop/delete другого manager, ни unit rewrite.
6. Проверить localhost3087 API revision и прежние /marketing /studio /schedule /settings, новый /growth и корень; затем те же HTTPS routes и публичный API revision. Подтвердить active unit, UID/cwd/newrelease/listener и неизменные shared target links. Только после этого DEPLOY_VERIFIED.
7. Trap при ошибке после cutover: atomically вернуть **старую current-ссылку**, restart тот же unit и проверить старый /marketing на3087. Runtime/env/shared не восстанавливать и не удалять; новые пользовательские записи сохраняются. При провале отката отдельный ROLLBACK_HEALTH_FAILED, успех не объявлять. Новые release/backup при ошибке остаются для диагностики.

## Workflow и доказательства

Deploy checkout → `github.sha` только для актуального операционного adapter. Existing verified-artifact identity gate не менять: source/run/QAcommit/hash/revision подтверждают старый tested bundle. QA job, app build и release marker вне lock Деплоера. Root публикует ops, затем отдельно release marker.

До реального релиза: bash syntax, mock adapter tests на preflight/capacity/backup/cutover/restart/health/rollback/no data restore; independent Architect и Tester review. Реальные SSH/VPS действия выполняет только существующий workflow после команды Оркестратора. После выполнения требуется evidence successful health/revision и живая приёмка Клиентом, не только зелёный workflow.
