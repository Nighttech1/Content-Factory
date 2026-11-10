# Выкладка Content Factory

Цель: https://content.vernatunspeakclub.com/growth. Репозиторий Nighttech1/Content-Factory, ветка codex/director-chatgpt-transfer. Admin.* не обновляем.

## Порядок

1. Сохранить изменения отдельным source commit.
2. Подготовить QA marker, отдельно commit/push marker, дождаться проверок.
3. Клиент независимо принимает результат; все C-* исправлены и повторно приняты.
4. Получить новое явное разрешение владельца на production.
5. Подготовить release marker с тем же проверенным source/artifact, отдельно commit/push.
6. Дождаться DEPLOY_VERIFIED, проверить сайт и передать результат Клиенту.

Обычный push кода/документов не выкладывает сайт. **Push release marker запускает production сразу.** Подготовка файла, QA и разрешение — разные состояния. Время зависит от сборки, браузерных проверок, backup и запуска сервиса; при restart возможна короткая недоступность.

## Где всё находится

| Что | Ссылка |
|---|---|
| Репозиторий | https://github.com/Nighttech1/Content-Factory |
| Workflow | https://github.com/Nighttech1/Content-Factory/blob/codex/director-chatgpt-transfer/.github/workflows/growth-center-release.yml |
| Запуски и artifacts | https://github.com/Nighttech1/Content-Factory/actions |
| Secrets | https://github.com/Nighttech1/Content-Factory/settings/secrets/actions |
| Rollout adapter | [deploy-growth-center.sh](../scripts/deploy-growth-center.sh) |
| Помощник подготовки | [prepare-growth-release.mjs](../scripts/prepare-growth-release.mjs) |

На VPS: content-factory.service, User/Group content-factory, UID/GID980, порт3087. /opt/content-factory/current указывает на versioned release. Общие data, generatedMedia и **полный public** находятся в /var/lib/content-factory/; .env.production → /etc/content-factory/app.env. Не заменять их файлами bundle.

## QA

Команды выполняются из корня локальной копии с Node.js и Git. Замени заполнители реальными значениями; SHA — все40 символов.

    git branch --show-current
    git rev-parse HEAD
    node scripts/prepare-growth-release.mjs qa --source SOURCE_SHA

Default — только JSON в stdout. Helper проверяет локальные repository/branch/source, **не обращается к GitHub, SSH или VPS**. Для off-trigger черновика добавь --output drafts/qa-marker.json.

Когда source commit сохранён и подготовку проверили:

    node scripts/prepare-growth-release.mjs qa --source SOURCE_SHA --write-marker
    git add .github/releases/growth-center-qa.json
    git commit -m "ci: request growth QA"
    git push origin codex/director-chatgpt-transfer

QA marker содержит version:1 и sourceSha. Workflow собирает именно source, выполняет guards/build и desktop/mobile browser checks; deploy job пропущен. Evidence нужно осмотреть и передать независимому Клиенту.

## Разрешённый release

В successful QA run найди run ID, полный SHA **QA marker commit**, artifact growth-center-qa-RUN_ID и его numeric artifact ID. Artifacts хранятся14 дней; после expiry нужен новый QA. Source должен совпадать с QA marker этого run. Исторические ID из STATE не являются defaults следующего релиза.

    node scripts/prepare-growth-release.mjs release --source SOURCE_SHA --qa-run QA_RUN_ID --qa-commit QA_MARKER_COMMIT_SHA --artifact ARTIFACT_ID --attempt 1

Helper **не подтверждает удалённый QA или актуальность artifact**. Сверь run/evidence/artifact в Actions. Existing CI gate проверяет successful run, branch/ref/QAcommit, принадлежность и expiry artifact; rollout проверяет bundle hash/source/revision. Не обходить проверки.

**Только после внутренней приёмки и нового явного разрешения владельца:**

    node scripts/prepare-growth-release.mjs release --source SOURCE_SHA --qa-run QA_RUN_ID --qa-commit QA_MARKER_COMMIT_SHA --artifact ARTIFACT_ID --attempt 1 --write-marker --approve-production content.vernatunspeakclub.com
    git add .github/releases/growth-center-release.json
    git commit -m "ops: release approved growth artifact"
    git push origin codex/director-chatgpt-transfer

Approval flag фиксирует уже полученное разрешение; агент не выдаёт его сам себе. Helper не делает commit/push и не запускает deployment. Attempt1..10 — номер повторной доставки, не выбор другого source. Менять только один marker за commit.

## Что сохраняется

Legacy Next CLI допускается только в известном exact состоянии без drop-ins. Managed mode принимает только наш root-owned regular exact 90-content-factory-release.conf без других .conf, symlink или writable drift. Повторная выкладка не переписывает этот файл и не делает лишний daemon-reload.

Перед переключением создаются private backup старого release, файловая live-копия runtime, env и конфигурации. Это не транзакционный snapshot БД. Новый release использует те же shared paths. Current переключается атомарно; restart только existing unit. Main unit, app.env, nginx и чужие данные не переписываются.

## Если проверка остановилась

| Сигнал | Действие |
|---|---|
| QA/build/browser failed | Исправить тикет, создать новый source/QA; failed artifact не выпускать |
| Artifact expired/mismatch | Новый QA и новые подтверждённые ID |
| Permission denied(publickey) / invalid key | Проверить USER/KEY Secrets; сначала отдельная read-only SSH диагностика |
| PRECHECK_CONTEXT_FAILED | Сверить unit/current/PID/port/drop-ins; не ослаблять gate и не запускать PM2 |
| Недостаток места / release SHA directory exists | Проверить backup и оставленный release; не удалять и не переиспользовать каталог вслепую |
| ROLLBACK_VERIFIED | Старые current/config восстановлены и проверены; исходный deployment всё равно failed |
| ROLLBACK_HEALTH_FAILED | Остановить повторы, выполнить ручное восстановление с Деплоером |

Rollback возвращает точный прежний current и прежнее состояние собственного drop-in. Managed файл остаётся; initial-created удаляется только при подтверждении принадлежности. Чужой drift не затирается. **Runtime/env backup не восстанавливать поверх новых записей.**

Ручной recovery: выбрать точный private backup /opt/content-factory/backups/TIMESTAMP-SHA; проверить old-current-link, prior-dropin-present, config metadata и main-unit hash. Вернуть только подтверждённые прежние current/config; daemon-reload лишь при изменении config, затем systemctl restart content-factory.service. Проверить local3087/HTTPS, revision и PID/cwd. Не запускать tar restore, rm-rf, database reset или замену app.env без отдельного расследования. Backup содержит секреты: не скачивать его в artifacts/чат.

## Secrets и завершение

Имена: INFINITYS_DOOR_VPS_USER, INFINITYS_DOOR_VPS_SSH_KEY, необязательный INFINITYS_DOOR_VPS_PORT (default22), INFINITYS_DOOR_VPS_KNOWN_HOSTS. Host release фиксирован content.*. SHA256:… — отпечаток; KEY содержит полный приватный ключ с BEGIN/END. Значения не отправлять в чат/логи/Git.

После release проверить https://content.vernatunspeakclub.com/api/growth-center, /growth, старые /marketing, /studio, /schedule, /settings; затем живая приёмка Клиентом. Зелёный workflow без revision и пользовательской проверки не заменяет приёмку.

## Конфигурация новой рабочей доски

Для source с защищённым редактором `/growth` дополнительно прочитай [GROWTH_WORKSPACE.md](GROWTH_WORKSPACE.md). Runtime owner secret/origin, постоянный state, Git token/branches и scheduler — отдельная настройка сервера; наличие Actions SSH Secrets не включает их автоматически. Без owner config сайт остаётся read-only, без Git config серверное сохранение показывает not_configured. Не включать запись через QA OWNER selector и не переносить ephemeral CI secret на VPS. Кодовый QA не доказывает настройку runtime; активация и production только по отдельному разрешению владельца.
