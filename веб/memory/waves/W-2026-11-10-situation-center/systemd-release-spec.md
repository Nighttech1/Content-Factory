# Release spec — существующий systemd, до rollout-кода

10.11.2026. Разрешение владельца: выложить только `content.vernatunspeakclub.com`. Приложение не пересобирается: tested source `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`, QA `42704640983`, QA commit `c88dac026f699a82e99e0ad5b243b62210d74c18`, fresh artifact `13713870877`, revision `situation-v2-20261110-01`.

## Доказанный runtime

Phase2 CI `42709041462`: unit `content-factory.service`, User/Group `content-factory` UID980, WorkingDirectory `/opt/content-factory/current`, current → `/opt/content-factory/releases/20261108-main7f4cede`. MainPID123403 UID980 слушает3087, nginx content-only vhost проксирует3087. PM2 не используется. EnvironmentFile `/etc/content-factory/app.env`; DropInPaths пуст, ProtectSystem=no. Полные `data`, `generatedMedia`, `public` старого release указывают на одноимённые `/var/lib/content-factory/` directories; `.env.production` → app.env.

## Точный порядок

### Уточнение phase4 — принято Архитектором до адаптации

CI42711580976 доказал прежний exact argv: `/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3087`. Старый release — Next CLI, не standalone; проверки old root/server.js неприменимы. Приватный preflight принимает именно этот original CLI, существующий Next entry и .next/BUILD_ID; User/Group/current/storage/3087 gates сохраняются.

Для tested standalone artifact необходим **initial-only** owned drop-in `/etc/systemd/system/content-factory.service.d/90-content-factory-release.conf`: `[Service]`, `ExecStart=` reset, затем `ExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js`. Это не wrapper-файл и не app rebuild. Main unit и EnvironmentFile не меняются; env prefix гарантирует известные PORT/HOSTNAME без чтения app.env values.

До записи — no DropInPaths/owned target absent, private backup original main unit и его hash плюс прежние backups. Trap активен, `CONFIG_CHANGED=1` ставится **до** первой записи конфигурации. Ошибка после этого, даже до current switch, требует удаления только нашего вновь созданного drop-in, daemon-reload, old current, restart original CLI; bounded health и PID/UID/cwd/listener должны подтвердить rollback. Main unit hash неизменен. Shared data не восстанавливаются поверх записей. При ошибке config rollback VERIFIED запрещён. Повторные релизы с уже установленным owned drop-in этим initial adapter не поддерживаются; нужен отдельный review следующего релиза.

1. Read-only fail-closed preflight **до первой мутации**: root; existing unit active/running, User/Group точные, WorkingDirectory/current точные; privately parse exact original Next CLI argv из phase4 и наличие old CLI entry/build. Сырые argv/env не печатать. MainPID UID980/cwd oldrelease и подтверждённый listener3087. No DropInPaths/owned target absent. Никакого PM2, provisioning, main-unit/nginx rewrite.
2. Подтвердить точные external realpaths старых data/generatedMedia/public и env; new release отсутствует; writable base. Проверка места учитывает **старый release + внешний runtime + развёрнутый bundle + запас**, а не старый ошибочный duBASE без releases. Обе проверки (workflow capacity и remote adapter) консервативно резервируют 2×(oldrelease+externalruntime)+bundle+256MiB. Недостаток/неизвестная ёмкость → стоп до staging/mutations.
3. Создать root-private backup (0700) и новый release. Сохранить old release, external runtime и env в private backup; секреты/содержимое не выводить. Backup не используется для восстановления поверх изменившихся runtime данных при штатном rollback. Backup failure → старый app остаётся запущен.
4. Проверить tar paths и распаковать **тот же immutable artifact** в новый release. Chown только новый release на существующие UID/GID content-factory без следования external symlinks. Сохранить bundled public/data/media/env в backup и связать новый release с **теми же** `/var/lib/content-factory/{data,generatedMedia,public}` и `/etc/content-factory/app.env`. Не создавать новый shared и не копировать bundle public поверх live public. Новых public-assets у фичи нет; .next/static остаётся из tested bundle.
5. Перед cutover ещё раз current==oldrelease. Записать только утверждённый initial owned drop-in с CONFIG_CHANGED до записи и daemon-reload; main unit hash неизменен. Atomic symlink replacement current→newrelease, `systemctl restart content-factory.service` — только этот unit. Ни stop/delete другого manager, ни main unit rewrite.
6. Проверить localhost3087 API revision и прежние /marketing /studio /schedule /settings, новый /growth и корень; затем те же HTTPS routes и публичный API revision. Подтвердить active unit, UID/cwd/newrelease/listener и неизменные shared target links. Только после этого DEPLOY_VERIFIED.
7. Trap при ошибке после любой config mutation либо cutover: удалить только initial owned drop-in, daemon-reload; atomically вернуть **старую current-ссылку**, проверить main unit hash, restart тот же original CLI unit и bounded retry /marketing + old PID/UID/cwd/listener3087. Runtime/env/shared не восстанавливать и не удалять; новые пользовательские записи сохраняются. При провале отката отдельный ROLLBACK_HEALTH_FAILED, успех не объявлять. Новые release/backup при ошибке остаются для диагностики.

## Workflow и доказательства

Deploy checkout → `github.sha` только для актуального операционного adapter. Existing verified-artifact identity gate не менять: source/run/QAcommit/hash/revision подтверждают старый tested bundle. QA job, app build и release marker вне lock Деплоера. Root публикует ops, затем отдельно release marker.

До реального релиза: bash syntax, mock adapter tests на preflight/capacity/backup/cutover/restart/health/rollback/no data restore; independent Architect и Tester review. Реальные SSH/VPS действия выполняет только существующий workflow после команды Оркестратора. После выполнения требуется evidence successful health/revision и живая приёмка Клиентом, не только зелёный workflow.
