# Повторяемая выкладка Content Factory — спецификация до кода

Дата: 10.11.2026. Ветка: `codex/director-chatgpt-transfer`. Before HEAD: `2c4802a` (clean).
Автор: проектная роль Архитектор. Тренер: B; initial-only adapter и отсутствие единого runbook — подтверждённые пробелы. Пользователь поручил сохранить инструкции/скрипт в GitHub для следующих выкладок. **Production в этой волне не запускать.**

## Граница

Узко расширить существующий `scripts/deploy-growth-center.sh` для следующего релиза на уже работающем standalone current. Сохранить исходный legacy Next CLI initial flow и все проверки tested artifact. Добавить runbook и короткий helper подготовки QA/release marker, который по умолчанию ничего не выкладывает. Не менять приложение, данные, DB, текущий VPS, host, unit main file, EnvironmentFile, nginx, QA workflow/gate или Secrets. Сохранение в GitHub разрешено для итоговых code/docs, **не менять реальные marker-файлы** `.github/releases/growth-center-{qa,release}.json` в этой волне. Не запускать диагностику/SSH/rerun production без нового поручения.

Наблюдаемый текущий runtime уже после успешного release: `content-factory.service`, User/Group `content-factory`, UID/GID980, `WorkingDirectory=/opt/content-factory/current`, listener3087; current → tested standalone release; data/generatedMedia/public → прежние `/var/lib/content-factory/...`, `.env.production` → `/etc/content-factory/app.env`. Установлен только известный owned drop-in `90-content-factory-release.conf`. Исторический release source/QA/artifact из STATE — доказательство прежней выкладки, **не константы следующего релиза**.

## Два допустимых режима, никакого auto-repair

Общие fail-closed identity gates до первой мутации сохраняются: root, exact unit/User/Group/UID/GID/FragmentPath/WorkingDirectory/EnvironmentFiles, active/running, current→существующий release внутри `/opt/content-factory/releases/`, live MainPID UID/cwd/listener3087, exact external storage/env paths, private capacity и отсутствие нового release path. Не выводить raw env/argv. Parent directory конфигурации не должен быть symlink/чужим writable path. Ни отсутствие диагностического поля, ни parse error не разрешают fallback.

| Режим | Обязательные факты | Изменение конфигурации |
|---|---|---|
| `legacy` | DropInPaths пуст, owned file отсутствует даже как dangling symlink; exact `/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3087`; old CLI entry и `.next/BUILD_ID` существуют | Один initial owned drop-in согласно уже принятому exact template |
| `managed` | DropInPaths содержит **только** exact owned path; owned — обычный root-owned файл, не symlink, не group/world writable; содержимое побайтно совпадает с template; effective ExecStart exact env-prefix; old `server.js` и `.next/BUILD_ID` существуют | Не переписывать совпадающий файл, не делать ненужный daemon-reload; переключить current и restart existing unit |

Любой чужой/дополнительный drop-in, отличающийся байт/argv/permissions/owner, symlink, неизвестный manager или другой порт — стоп до мутаций с безопасным reason code. Не удалять чужие файлы/директории и не нормализовать их «на глаз». Повторный запуск для **того же SHA**, если release directory уже существует (успешный либо частичный), по-прежнему блокируется: ручная inspection, не delete/reuse. «Повторяемый» означает следующий новый проверенный release, не безусловный повтор любой команды.

Точный template (включая завершающий newline, без Environment= строк):

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js
```

Для managed effective ExecStart `path=/usr/bin/env`, argv строго `/usr/bin/env`, `PORT=3087`, `HOSTNAME=127.0.0.1`, `/usr/bin/node`, `/opt/content-factory/current/server.js`. EnvironmentFile наследуется, app.env не читать ради проверки значений и не переписывать. Точный template один в adapter; guard сравнивает bytes с backup template, не эвристическое includes.

## Snapshot, cutover и rollback

1. До остановки/переключения: root-private backup old release, файловая live-копия external runtime, app.env, main unit + hash, точный исходный target symlink current, metadata config-state. Backup — не транзакционный snapshot БД. Capacity включает old release, external runtime, новый bundle и запас по прежней формуле.
2. Snapshot config-state: `mode`, `ownedDropinPresent`, **точные bytes**, owner/group/mode прежнего owned файла (если present), hash main unit, прежний current target. Bytes и секретные backup-файлы остаются только в private VPS backup. Не выводить их в CI artifacts/logs. В managed preserve существующий owned file без записи; в legacy prior state explicitly absent.
3. Проверенный bundle распаковать в новый release; chown только новые entries без follow-links; public/data/media/env связать с теми же внешними paths. Нельзя накладывать bundled public на живой public. Проверки manifest/hash/revision app остаются в existing workflow.
4. Перед cutover повторить current и config-state match snapshot (чужие конкурентные правки → fail). Trap установить до любой config mutation. В legacy flag CONFIG_CHANGED до initial install; в managed флаг config не выставлять без записи. Atomic current switch, restart только existing unit. Current-flag до mv, чтобы failed mv также попадал под guard rollback.
5. Rollback восстанавливает **предыдущее состояние**, а не всегда удаляет drop-in. Prior absent: удалить только созданный нами exact owned regular file, daemon-reload. Prior present: сохранить прежний exact owned файл; если текущая конфигурация неожиданно изменилась после snapshot — не затирать чужие изменения, fail с ROLLBACK_HEALTH_FAILED. Если implementation действительно пишет config при prior-present (не требуется), обязательно atomic restore точных prior bytes+permissions/owner из snapshot, guarded от foreign replacement, затем daemon-reload.
6. Восстановить exact original current target, убедиться в main unit hash, restart тот же unit, bounded health старого /marketing и PID/UID/cwd/listener3087. В managed старый release тоже standalone и owned drop-in **обязан остаться**. При config failure до current switch rollback тоже обязателен. Ошибка любого шага — явный rollback failure, не ложный VERIFIED. Runtime/env backup не восстанавливать поверх новых writes.
7. Success: local3087+HTTPS routes, exact revision API, unit/PID/UID/cwd/listener, прежние shared paths, unchanged main unit/env target, exact owned drop-in. Только затем DEPLOY_VERIFIED. Новые backup/releases не чистить автоматически.

## Runbook и helper

Runbook: `docs/DEPLOY.md`, одна каноническая инструкция. Root `README.md` и `STATE.md` могут ссылаться на неё. Зафиксировать адрес, unit/UID/port/paths, Secret **имена** без значений, различие fingerprint/private key, реальные триггеры QA vs release, ошибки/preflight/rollback/recovery и запрет destructive cleanup. Расписать обе фазы без нового workflow/внешнего сервиса:

1. Source commit → отдельный QA marker → existing Actions build/browser → independent Client review/evidence.
2. **Новое явное production approval** → подготовка release marker с immutable source/QA/QAcommit/artifact → отдельный marker commit+push → existing verified-artifact release → live Client acceptance.

Helper: `scripts/prepare-growth-release.mjs` (Node stdlib, без новых npm dependencies). Поддержать команды `qa` и `release`; full SHA/positive safe integer IDs/attempt1..10/точная branch/repo проверяются. `qa --source <sha>` готовит `{version:1,sourceSha}`. `release --source <sha> --qa-run <id> --qa-commit <sha> --artifact <id> [--attempt <1..10>]` готовит текущий strict release schema. Не хранить старые IDs как defaults.

**Default — подготовка:** stdout JSON либо явно выбранный off-trigger output file; никакого SSH, workflow dispatch, marker-write, commit, push или чтения secret values. Helper работает offline и явно пишет «QA run/artifact remote status не проверен; authoritative проверка выполняется существующим CI gate после разрешённого marker push». Нельзя обойти существующий CI gate опцией helper.

Явный `--write-marker` записывает соответствующий marker **только по запросу оператора** и после полной валидации; для release дополнительно обязателен `--approve-production content.vernatunspeakclub.com`. Это флаг подтверждения уже полученного человеческого разрешения, а не способ для агента самому себе его выдать. При отсутствии/неверном approval flag release marker не меняется. Commit/push отдельным явно описанным шагом; автопубликация не требуется. `--dispatch`/прямой workflow_dispatch не реализовывать: нынешний workflow использует push marker и нет повода создавать второй путь. Документировать, что release-marker push **сразу запускает production**, обычный source/docs push — нет.

До --write-marker helper обязан локально подтвердить source существует и ancestor текущего HEAD, корректные branch/repo и marker schema. Подготовка не подтверждает successful QA/ref/path/QAcommit/artifact ownership/expiry или bundle hash/revision: эти authoritative проверки остаются existing workflow без изменений. Runbook требует осмотра QA и получения production approval до push. Write atomic, validated first; invalid input → никаких marker изменений. Default off-trigger output path не может совпадать с любым из двух trigger marker paths без --write-marker. Tests используют временный repo, не настоящий GitHub/VPS.

## Приёмка

- Legacy accepted и managed accepted; чужие/duplicate dropins, modified bytes, symlink, insecure permissions, unknown argv/port/PID/cwd отклоняются до мутаций.
- Managed success не удаляет/не переписывает owned drop-in; next new SHA cutover проходит mock, old shared paths/permissions сохраняются.
- Managed failure after switch возвращает old standalone **с прежним drop-in**; legacy failure before/after configwrite удаляет только newly owned. Точные prior current/config/mainunit сохраняются; runtime writes не теряются. Foreign replacement во время rollout не затирается и не получает ложный rollbackverified.
- Existing legacy/ownership/rollback/mock tests не ослаблены, дополнены managed + config-state cases; Bash/Python/Node parse и diff checks PASS.
- Helper default side effects отсутствуют; invalid args/SHA/IDs/target/no approval не меняют marker; prepare schemas соответствуют existing gate; root production/QA markers в рабочем diff отсутствуют.
- Existing workflow artifact identity block, gate source/run/hash/ref checks, triggers/permissions/QA job не ослаблены/не изменены.
- Независимые Tester и Client проверяют code/docs/commands, создают C-* и принимают только после исправлений. Браузер для UI не требуется: UI не меняется. В этой волне только offline/mocked проверки и GitHub code/docs save, **не реальная повторная выкладка**.
