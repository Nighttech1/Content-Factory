# W-2026-11-09 — инфраструктурная разведка

Дата: 2026-11-09. Роль: Деплоер. Только чтение; сервер, workflows и секреты не изменялись. Значения секретов не читались и не выводились.

## Вывод

Исторический штатный путь найден: GitHub Actions → standalone bundle → SSH/SCP → `/opt/content-factory` → PM2 `content-factory` → порт `8088` → nginx → `https://content.vernatunspeakclub.com`.

**Старый deploy workflow нельзя запускать в текущем виде:** он удаляет всё содержимое app directory, включая runtime-данные, не делает backup/rollback и не считает неуспешный HTTP healthcheck ошибкой. Для новой волны нужен исправленный deploy после архитектурной спецификации и QA. Готового доступного из этой сессии production-триггера пока нет.

## Что проверено

- Локальный checkout: `codex/director-chatgpt-transfer`, исходный HEAD волны `1ea460cc151e5b3d545ecbebe655558e156db6dc`.
- Прочитаны корневой `AGENTS.md`, `веб/CLAUDE.md`, deployer rule/skill/plugin/knowledge и deployment-записи STATE.
- В director branch и main workflow `deploy-vps.yml` отсутствует. Локальная `git log --all -- .github/workflows/deploy-vps.yml` пуста: исторические ветки локально не загружены.
- GitHub branch discovery нашёл файлы `deploy-vps.yml`, `inspect-vps.yml`, `restore-admin.yml` в `codex/content-director-board` и `claude/lucid-bohr-j6mlrh`.
- Полностью прочитаны deploy/inspect из `codex/content-director-board`.
- `gh auth status`: CLI не авторизован. Никакие credentials/secret values не запрашивались.
- Подключённые GitHub capabilities дают чтение refs/files и rerun существующих failed run/jobs; отдельного workflow dispatch нет. Rerun старого запуска не является выкладкой нового проверенного SHA.
- GET `/actions/workflows` через connector fetch отклонён как неподдерживаемый endpoint; актуальные последние runs и состояние Repository Secrets этим способом не подтверждены.

Источники:

- https://github.com/Nighttech1/Content-Factory/blob/codex/content-director-board/.github/workflows/deploy-vps.yml
- https://github.com/Nighttech1/Content-Factory/blob/codex/content-director-board/.github/workflows/inspect-vps.yml
- https://github.com/Nighttech1/Content-Factory/tree/claude/lucid-bohr-j6mlrh/.github/workflows

## Существующие bindings и настройки

| Назначение | Имя / значение конфигурации |
|---|---|
| VPS host | `secrets.INFINITYS_DOOR_VPS_HOST` |
| SSH user | `secrets.INFINITYS_DOOR_VPS_USER` |
| SSH key | `secrets.INFINITYS_DOOR_VPS_SSH_KEY` |
| SSH port | `secrets.INFINITYS_DOOR_VPS_PORT`, fallback `22` |
| Ingest authentication | `secrets.INGEST_SECRET`, передача SSH action env |
| Node build | Node `20`, `npm ci`, `npm run build` в `веб` |
| App | `/opt/content-factory`, PM2 `content-factory`, `PORT=8088`, `HOSTNAME=0.0.0.0` |
| Domain | только `content.vernatunspeakclub.com` |
| nginx vhost | `/etc/nginx/sites-available/content-factory` и symlink sites-enabled |
| Transfer temp | `/tmp/cf-deploy`, bundle `deploy/app.tar.gz` |

Наличие и корректность secrets сейчас не проверены. Имена взяты из versioned workflow, не из секретного хранилища. Историческое STATE указывает non-root с passwordless sudo. `admin.vernatunspeakclub.com` — чужая для этой волны цель, не трогать.

## Риски старого workflow

1. Перед extract выполняется удаление `$APP_DIR/*` и `$APP_DIR/.next`. При cwd `/opt/content-factory` это уничтожит `data/local`, `generatedMedia`, runtime public assets и другие mutable files.
2. Ни backup текущего релиза и runtime store, ни rollback нет.
3. `pm2 delete` до старта, значит есть окно недоступности. При ошибке восстановления автоматически нет.
4. Healthcheck печатает HTTP code с `|| true`; даже HTTP 500 может закончиться `DEPLOY_DONE`.
5. Каждый deploy переписывает nginx, удаляет enabled default vhost, запускает certbot и потенциально ставит системные зависимости. Это избыточно для добавления страницы.
6. `concurrency.cancel-in-progress: true` может прервать деплой посередине.
7. Inspect workflow объявлен read-only, но имеет `push.paths` trigger на собственный файл. Его восстановление/commit/push само запустит чтение сервера — учитывать при спецификации, не добавлять скрытый trigger.
8. Inspect ориентирован на старый инцидент с admin, не проверяет сохранность runtime data и release rollback.

## Runtime data, которые нужно сохранять

В текущем исходном коде есть хранилища относительно `process.cwd()/data/local`:

- `sprint8-sot.json` — drafts/boards/schedule/design fallback при недоступной PostgreSQL;
- `post-analytics.json` — fallback analytics;
- `analyst-insights.json` — insights cache;
- `agent-run-logs.json`, `sheet-row-mirror.json`, `design-active.json`, `publicist-settings.json` — другие runtime stores.

Также код создаёт/читает `generatedMedia/vernatun-jobs` и `public/vernatun-jobs`. Фактическое наличие и объём данных VPS не подтверждены. При историческом cwd их ожидаемые пути `/opt/content-factory/data/local`, `/opt/content-factory/generatedMedia`, `/opt/content-factory/public/vernatun-jobs`; cwd следует подтвердить на сервере без печати environment values. PostgreSQL используется через `DATABASE_URL`; текущий production storage backend не подтверждён. Нельзя подменять live data bundled fixtures или запускать seed/reset/migration без отдельной необходимости.

## Read-only HTTP

Из текущей среды:

| URL path | Результат |
|---|---|
| `/` | HTTP 200, HTML |
| `/marketing` | HTTP 200, HTML |
| `/api/analytics/snapshot` | HTTP 200, JSON |
| `/api/content/ingest` | GET timeout; не доказательство отказа POST endpoint |

Тела с пользовательскими/аналитическими данными в отчёт не копировались. Этот HTTP smoke не подтверждает версию production, health server process или сохранность данных.

## Конкретный безопасный путь после QA

1. В спецификации восстановить manual-only deployment с текущими bindings; source — проверенный immutable SHA именно director branch. Без push trigger и без изменения admin/nginx/certbot при обычном update.
2. До изменения сервера выполнить read-only inventory: PM2 cwd/script и текущий релиз, наличие runtime paths, файл конфигурации nginx, доступность 8088, metadata backup. Не печатать PM2 environment, `.env`, ключи, токены и raw private user data.
3. Снять защищённый backup текущего релиза и mutable directories на сервере; зафиксировать место и проверку восстановления. Сохранить весь текущий `data/local`, media и конфигурацию окружения. Для БД — snapshot только если меняется схема; эта UI-волна сама по себе миграции не требует.
4. Собрать bundle в Actions, распаковать в новый release directory, mutable paths подключить из shared storage, запустить isolated smoke. Если архитектура пока сохраняет старый layout — как минимум backup и явные excludes mutable directories вместо удаления app root.
5. Переключить PM2 только после успешного smoke; проверить `/`, существующие страницы, новый раздел, API и file persistence. Health должен fail при non-2xx/timeout.
6. При ошибке вернуть прошлый release и прежнюю process config без отката/очистки runtime data. Не объявлять успех до HTTPS и data-preservation checks.
7. Запуск: GitHub Actions UI `Run workflow` на доступной manual workflow и выбранном проверенном ref, либо авторизованный GitHub API dispatch. Сначала нужно сделать workflow доступным для dispatch согласно фактической default-branch конфигурации. В этой сессии CLI auth отсутствует, connector dispatch отсутствует; ручной Actions запуск владельцем — рабочий fallback без передачи секретов. Восстановление workflow не означает, что production уже обновлён.

Никакой deploy/inspect/restore/rerun не запускался. Это разведка, не отчёт о состоявшейся выкладке.

## Дополнение: путь запуска без workflow_dispatch

Оркестратор предложил контролируемый release manifest push. Это допустимый альтернативный путь после QA и архитектурной спецификации, не существующий готовый deployment:

- Новый workflow фильтрует одновременно `push.branches: [codex/director-chatgpt-transfer]` и единственный путь `.github/releases/growth-center-release.json`.
- Обычный push кода/workflow без изменения manifest ничего не выкладывает. Manifest создаётся/меняется отдельным commit **только после QA**; это и есть явный release trigger.
- Manifest ссылается на immutable проверенный source SHA; workflow должен проверять ref и SHA, собирать именно его, а не неявно свежую голову.
- Подключённый GitHub registry реально содержит `create_blob`, `create_tree`, `create_commit`, `update_ref` с `expected_sha`; фактическое право записи и выпуск push event без мутации не подтверждены. Ошибку недостаточных прав нельзя считать разрешением использовать другой credential.
- GitHub официально описывает `push` branch/path filters; ограничение наличия workflow в default branch относится к `workflow_dispatch`, а не этому push-сценарию. Источник: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax и https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows .
- Возможная целевая структура: `/opt/content-factory/releases/<SHA>`, stable `current` symlink, отдельный `shared/data` и media. Первое внедрение сначала сохраняет весь прежний app directory, подтверждает cwd и конфигурацию, затем переносит mutable paths без удаления/подмены. Точное имя backup/shared paths — предмет спецификации, не подтверждённое состояние VPS.
- Рекомендуется native OpenSSH с ограниченным script и pinned checkout/setup actions, строгий healthcheck и автоматический возврат предыдущего release. Из одних нынешних bindings нет независимого trusted SSH host fingerprint: `ssh-keyscan` без сверки — только TOFU. Этот риск необходимо явно учесть в спецификации; нельзя притворяться, что проверка fingerprint уже настроена.

Этот вариант снимает отсутствие dispatch tool при наличии разрешённой записи в director branch. Deploy не выполнялся; release manifest не создан.
