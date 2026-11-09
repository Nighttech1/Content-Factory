# Проверка обновлённого SSH-ключа

10.11.2026, 00:58 Москва. Владелец подтвердил обновление ключа и разрешил проверку подключения без выкладки.

- Workflow: [42707507064](https://github.com/Nighttech1/Content-Factory/actions/runs/42707507064), job129468103414, source `fe607c8f07475139b849c646164886b9527b7ab0`.
- Только один configured-root auth probe. Другие имена, пароли и ключи не перебирались.
- Исправление старого root-skip проверено четырьмя offline группами, host/DNS pin и host-key policy сохранены.

| Проверка | Фактический результат |
|---|---|
| HOST/DNS | `HOST_matches_content_DNS=true`, `knownSelectelDNSmatch=true` |
| Сеть | `TCP_configured_SSH=ok`, HTTP/HTTPS порты доступны |
| Формат | `KEY_LOOKS_LIKE_FINGERPRINT=false`, `KEY_PARSE_VALID=true` |
| Вход | `AUTH_ROOT_attempted=true`, `AUTH_ROOT_OK=true`, `REMOTE_UID0=true` |
| Приложение | `REMOTE_APP_DIR=true` |
| Root PM2 daemon | `REMOTE_ROOT_PM2_PID_ALIVE=false` — не устанавливает состояние сайта/процесса другого пользователя |

**Итог: SSH-авторизация работает; прежний publickey-блокер снят.** Значения Secrets, адрес сервера и содержимое private key не выводились. Выполнены только сетевые проверки и read-only команды наличия каталога/UID/process metadata. Provisioning, backup, staging, PM2 invocation, restart, deployment и release marker не выполнялись.

Перед разрешённой выкладкой необходимо определить фактический runtime owner/manager read-only preflight и сохранить существующие данные. Не делать вывод «сайт остановлен» из отсутствия root PM2 daemon. Проверенный новый bundle: source3ac253b6, QA42704640983, artifact13713870877, revision situation-v2-20261110-01. Владелец ещё не давал отдельное поручение на production этой проверкой.
