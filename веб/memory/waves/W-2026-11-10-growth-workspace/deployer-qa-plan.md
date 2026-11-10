# QA-only workflow adaptation

10.11.2026. Прочитаны role/skill/plugin/knowledge Деплоера, AGENTS/CLAUDE/STATE, docs/DEPLOY и wave spec+chain. Scope — только qa job существующего workflow; VPS/dispatch/markers не выполнялись.

Добавлены authored workspace test и independent boundaries после прежних v2 model guards. Исторические UI scripts сохранены, но их старые selectors не запускаются на новом workspace. Browser QA вызывает отдельные Tester и Client CLI с testing-only TLS fixture localhost3443 → Next standalone3000.

Runtime secret генерируется случайно и маскируется **после** упаковки immutable artifact; write/session config не ослабляется. DATA_DIR — новый private mktemp в RUNNER_TEMP, scheduler включён, runtime Git env явно отсутствует. Temp state/cert не входят в upload paths. Перед upload server log редактируется от ephemeral owner secret; сервер закрывается trap с сохранением исходного exit code.

Фактически PASS: YAML parse, bash-n QA blocks, structural comparison gate/deploy/triggers/permissions/concurrency с HEAD, порядок package→secret→server→два browser CLI, отсутствие private upload paths, git diff check. Новые тестовые файлы и приложение ещё разрабатываются: их выполнение/build/browser PASS этим отчётом не объявляются. Истинный CI-only браузер запускает Root после готовности source и QA marker; нового production release эта волна не разрешает.
