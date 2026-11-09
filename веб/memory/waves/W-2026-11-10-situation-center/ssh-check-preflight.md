# SSH — исправление read-only проверки

10.11.2026. Пользователь сообщил об обновлённом приватном ключе в Actions Secrets; разрешена проверка SSH, не deployment.

В `growth-vps-root-auth.mjs` исправлено условие: root проверяется только когда `VPS_USER.trim() === 'root'`; иной/пустой пользователь получает `configured_user_not_root`, без root fallback. Добавлен безопасный boolean `KEY_LOOKS_LIKE_FINGERPRINT`; значения ключей не выводятся. DNS/hash pin, host key policy, одна попытка, read-only REMOTE_COMMAND, timeout и cleanup сохранены. Четыре optional зависимости обеспечивают offline mocks, production defaults прежние.

`node --check scripts/growth-vps-root-auth.mjs` — PASS. `node scripts/test-growth-vps-auth.mjs` — 4 группы PASS: configured root выполняет одну mocked auth; non-root/missing user не вызывает DNS/parse/auth; unconfirmed target не допускает auth; dummy SHA256 fingerprint отвергнут настоящим локальным ssh-keygen без SSH. В тесте также проверены private temp mode, cleanup, pinned host, publickey-only/одна попытка и точное совпадение read-only команды.

Реального SSH/DNS этой ролью не выполнялось; Secrets не читались. Workflow, marker, приложение, QA/release artifact не изменены. Для реальной проверки Оркестратор должен доставить исправленный source и изменить только connectivity marker; результат auth пока неизвестен. VPS deployment запрещён этим поручением.
