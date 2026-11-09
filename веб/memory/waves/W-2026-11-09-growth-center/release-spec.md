# Release specification — до кода

Прочитаны architect-spec.md и chain.md. Исполнитель: Deployer. Разрешение root: две явно активируемые фазы, только director branch, только content.*; ни одного manifest сейчас не создавать.

1. `.github/releases/growth-center-qa.json` отдельным commit после local green: `{version:1, sourceSha:<40hex>}`. Push branch+path запускает clean install, typecheck, unit guards, standalone build, production browser desktop/mobile, strict UI checks, screenshots. Никаких VPS credentials или SSH в QA job.
2. QA artifact `growth-center-qa-<runid>` содержит ровно bundle, metadata и evidence. Metadata: sourceSha, runId, QA trigger SHA, dataset revision, bundle SHA256. Upload только после успешного QA; screenshots сохраняются даже при ошибке отдельно.
3. Root смотрит QA screenshots/результат, затем отдельный `.github/releases/growth-center-release.json`: `{version:1, sourceSha, qaRunId, qaCommitSha, artifactId}`. Release job проверяет GitHub API: success/completed, workflow path, director ref, push event, headSHA; artifact принадлежит этому run, name совпадает, не expired. Скачивает artifact по ID, проверяет metadata и bundle SHA256, не пересобирает другой код.
4. Native SSH: существующие HOST/USER/SSH_KEY/PORT bindings. Optional trusted KNOWN_HOSTS binding предпочтителен; если его нет — standard accept-new в dedicated file. Это TOFU: независимая подлинность первого соединения не доказана. Никакого StrictHostKeyChecking=no. Known-hosts сохраняется artifact для последующего pin. Обнаружение secret names API недоступно, исторические workflows не содержат fingerprint.
5. Server script: никаких install/provision/nginx/certbot/admin.*. Проверить существующие Node20+, PM2, curl, domain proxy8088, current cwd. Backup всего старого app tree (кроме собственных releases/shared/backups), preserve data/media, release SHA layout и current symlink. Symlinks shared runtime writable paths. Остановить PM2 кратко на capture runtime и restart; при ошибке восстановить предыдущий cwd/entry и current symlink. Не удалять старое содержимое и backup. После успешной проверки сохраняется process state.
6. Strict local8088+HTTPS/API revision health checks; при сбое rollback. Релиз только content.*. Никаких DB migrations/seeds, environment dumps и raw secrets/logs. Existing process environment сохраняется PM2 restart, secret INGEST_SECRET не требуется перезаписывать.

Файлы исполнителя: workflow; `scripts/growth-center-gate.mjs`, `growth-center-browser-qa.mjs`, `deploy-growth-center.sh`; текущий документ. CI browser script зависит от договорённых FE testids. До выпуска source commit обязан включать все эти файлы и output standalone.

Разделение факта: наличие workflow ≠ запуск QA; успешный QA ≠ осмотр скриншотов; release marker ≠ успешная выкладка. Root не создаёт release marker до QA/осмотра. SHA gate использует только ancestors trigger commit; marker должен идти после tested source. Наличие secrets/SSH permissions/production backend станет фактом только после исполнения.

## Реализация и проверки

- Сборка упаковывается **до** browser QA; запускается `release-bundle/app/server.js` из standalone cwd. Проверяется именно тот bundle, который скачает release job.
- Последний retained known_hosts artifact успешного запуска того же workflow/ветки автоматически повторно применяется с StrictHostKeyChecking=yes. Optional Repository Secret приоритетнее; accept-new только без прежней доверенной записи. Значения ключей в отчёты не выводятся.
- Initial mutable migration: stop process → staged copy + atomic shared move → old runtime path переносится в backup и заменяется shared symlink → new release shared symlink. Поэтому rollback старого приложения видит все записи в общем хранилище. Обнаруженный divergent shared/live path блокирует автоматическую миграцию, не перезаписывается.
- Runtime `.env`, `.env.local`, `.env.production`, `.env.production.local` копируются без вывода в shared/env (700, файлы600), новый релиз использует symlinks. PM2 env сохраняется в закрытой server-side rollback config. Секреты не входят в CI artifacts.
- Server health: local/HTTPS `/`, `/growth`, `/marketing`, `/studio`, `/schedule`; read-only growth API и точный revision local/HTTPS. Никаких analytics payload logs.
- Короткий downtime на capture/migration/PM2 restart остаётся. Изолированный VPS process до остановки не запускается: bundle уже проверяется production browser QA, а copy live stores должен выполняться после stop. Zero downtime не обещается.
- Повторная выкладка того же SHA при оставшемся release directory блокируется: нужна inspection, не автоматическое удаление старого/неуспешного релиза.
- Проверено локально: JS parse обоих scripts; bash -n; YAML jobs/branch/path filters и отсутствие VPS secrets в gate/qa; изолированный git gate test (valid ancestor accepted, wrong branch и source=marker HEAD rejected). Browser runtime/clean install/build/deploy пока не выполнялись этим исполнителем, FE ещё формируется.
