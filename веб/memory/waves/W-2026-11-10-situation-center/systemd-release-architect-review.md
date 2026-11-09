# Архитектор — review systemd release spec до adapter-кода

10.11.2026. Проверен `systemd-release-spec.md` после read-only inventory phase2 CI `42709041462`. Это review операционного плана, не доказательство состоявшегося release.

## Вердикт: план принят к реализации

Наблюдаемый runtime подтверждает иной путь, чем прежний PM2 rollout: existing `content-factory.service`, User/Group `content-factory` UID980, WorkingDirectory `/opt/content-factory/current`, current указывает на старый versioned release; listener3087 принадлежит MainPID unit. Данные/media/public уже внешние `/var/lib/content-factory`, environment `/etc/content-factory/app.env`. Предложенная минимальная адаптация сохраняет manager, identity, unit, upstream, внешние данные и их права. Не требуется новый PM2, unit override, nginx reload, provisioning или app rebuild.

Обязательные условия реализации/проверки:

1. **Identity fail-closed до мутаций.** Проверить root, exact unit/User/Group/cwd/current/ExecStart allowlist, живой MainPID UID/cwd/listener3087, все storage/env targets. Если эти facts изменились с inventory, остановиться и сообщить расхождение. Не превращать отсутствие поля или ошибку диагностики в permissive fallback. Проверка `systemctl show` не должна печатать env/argv.
2. **Артефакт неизменен.** App только tested source `3ac253b6ad9ec307bc82dcde3fcc5465f01e7115`, QA42704640983/commitc88dac026f699a82e99e0ad5b243b62210d74c18/artifact13713870877, hash и revision `situation-v2-20261110-01` сверяются существующим gate. Checkout deploy-job `github.sha` получает только текущий ops adapter; QA checkout/source/сборку не менять.
3. **Capacity и backup.** Учитывать external runtime, которого нет в duBASE. До app switch завершить private backup oldrelease/externalruntime/env; ошибка backup не останавливает старый app. Снимок файлов живого runtime до stop — файловая копия, а не обещание транзакционно согласованного DB snapshot. Эта волна не меняет БД и не восстанавливает её. Backup secrets остаются только на VPS с закрытыми permissions.
4. **Preservation.** Новый release ссылается на ровно те же observed data/generatedMedia/public/env. Не переносить существующие stores в новый shared, не chown/chmod external targets, не накладывать bundledpublic на livepublic. Chown применяется только к новым release entries без следования симлинкам. Новые public-assets фича не вводит; отдельно проверить используемые brand/font assets при post-release UI.
5. **Switch и rollback.** Trap устанавливается до cutover; current повторно проверяется перед атомарным переключением. Restart только existing content-factory.service. При ошибке после switch вернуть old current и restart того же unit, проверить old marketing; runtime/env не восстанавливать из backup поверх новых writes. Failure rollback — отдельный аварийный статус, не DEPLOY_VERIFIED.
6. **Факт успеха.** После restart active unit/PID UID/cwd/listener и exact revision local3087+HTTPS; прежние routes, новый growth и неизменные links. Независимая живая приёмка Клиента после релиза. Зелёный CI без health/revision не означает успешную выкладку.

## Release chain после нового разрешения владельца

Прежний запрет production в app-spec относился к UI-волне до разрешения. Новое явное разрешение владельца ограничено `content.vernatunspeakclub.com`; `admin.*`, публикация контента и платные API остаются вне scope.

Read-only Deployer inventory (факт) → Deployer systemd release spec (готов) → **Architect review (этот документ)** → Deployer adapter/workflow capacity/opscheckout + mock guards → независимый Tester review/retest → Оркестратор фиксирует ops source и отдельно release marker → existing workflow verified artifact release → независимый Клиент live acceptance → отчёт владельцу.

Path locks: Deployer — `scripts/deploy-growth-center.sh`, минимальный deploy-only checkout/capacity в `.github/workflows/growth-center-release.yml`, выделенные mock tests и release report; никаких app/data/QA/release marker изменений. Tester читает эти пути и пишет собственный report/guards, app не меняет. Архитектор только этот review и необходимые spec-уточнения. Оркестратор единолично управляет release marker после ops QA. Все пересекающиеся paths передаются последовательно.

## Коррекция по phase3/phase4 — минимальный обратимый drop-in

Это уточнение **заменяет прежнее предположение о standalone ExecStart старого release**. Phase3 CI `42711257723` доказал safe-fail прежнего preflight: старый `server.js` отсутствует, при этом остальные identity gates выполняются. Phase4 CI `42711580976`: classification `known_next_cli`, entrypoint `relative_next_cli`, argvLength7, только `start`, `--hostname`, `--port`, unknownTokenCount0, hostname127/port3087/knownExact true. Старый запуск — `/usr/bin/node` с известным Next CLI, не standalone. При этом current/unit/User/Group/listener/storage остаются теми же. Ошибку предположения не скрываем; app mutations до этой диагностики не выполнялись.

**Принято к реализации после внесения в release-spec:** необходимый для verified standalone artifact один собственный drop-in `/etc/systemd/system/content-factory.service.d/90-content-factory-release.conf`. До первой config mutation подтверждаются empty DropInPaths, отсутствие этой target-ссылки/файла, exact known old Next CLI и существующие CLI entrypoint/Next package/build. Отсутствие root/server.js больше не считается ошибкой старого release. Старый CLI конфиг берётся из неизменённого main unit.

Единственное новое содержимое drop-in:

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js
```

`/usr/bin/env` exec запускает Node с тем же UID и остальным унаследованным окружением. Он гарантирует нужные PORT/HOSTNAME после systemd EnvironmentFile без чтения/перезаписи секретов `app.env`. Ни wrapper внутрь app artifact, ни дополнительный environment file не создаются. Unit main file/User/Group/WorkingDirectory/EnvironmentFiles/nginx не меняются.

Перед configwrite: private backup неизменённого main unit и зафиксированное отсутствие owned drop-in; проверка его hash/identity после релиза. Существующие externalruntime backups остаются файловыми live-копиями. Trap и флаг `CONFIG_CHANGED` активируются **до** write/rename drop-in; `daemon-reload` допустим только в рамках этого owned изменения. Затем atomic current switch и restart того же unit.

При **любой** ошибке после начала configwrite (в том числе до current switch или при failed daemon-reload) обязательный checked rollback: удалить только созданный нами owned drop-in → `daemon-reload` → восстановить старый current → restart исходного Next CLI unit → bounded marketing health и PID/UID/cwd/listener3087. Исходный main unit, env и runtime не восстанавливаются поверх действующих файлов/данных. Ошибка любого восстановления ведёт в `ROLLBACK_HEALTH_FAILED`, не в ложный VERIFIED. Перед удалением собственность созданного target подтверждается; чужие drop-ins не удаляются.

Текущий релиз намеренно поддерживает только первоначально empty drop-in directory/state. Повторный release при существующем owned drop-in блокируется preflight; поддержку exact-owned reuse/backup/restore можно добавить отдельно после фактической приёмки, идемпотентность сейчас не обещаем.

До release marker Тестировщик проверяет дополнительные mock ветки: known CLI accepted, unknown CLI/foreign or preexisting owned drop-in rejected до мутаций; failure configwrite/daemonreload до current; failure restart/health после current; rollback remove/reload/current/restart/health/process failures без ложного успеха; env prefix exact; mainunit/env неизменны; immutable app artifact identity сохранена. Это разрешение на реализацию операционной адаптации, не факт её успешного QA или deployment.
