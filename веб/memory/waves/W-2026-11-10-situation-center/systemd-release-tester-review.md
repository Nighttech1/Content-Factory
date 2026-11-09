# Тестировщик — независимый review systemd rollout

10.11.2026. **Вердикт OPS PASS; C-OPS-ROLLBACK-VERIFY закрыт с повторным guard.** Это готовность операционного adapter, не факт успешного production deployment.

Фактически независимо запущены:

- `bash -n scripts/deploy-growth-center.sh` — PASS.
- `node scripts/test-systemd-release-review.mjs` —7 rollback branches +9 actual identity preflight branches PASS. Это отдельный guard Тестировщика, actual source functions исполняются с mocked system ops.
- `python scripts/test-systemd-release.py` —5 full adapter scenarios PASS: identity/capacity fail без мутаций; success с private backups и теми же storage/public/env; health-revision fail с возвратом старой ссылки и сохранением новых shared writes; failed rollback mv не даёт ложный VERIFIED и не рестартует неправильный current.
- `git diff --check` — PASS.

Static review подтверждает: exact existing systemd unit/User/Group UID980/cwd/ExecStart allowlist/MainPID listener3087/storage/env до изменений release; capacity включает oldrelease+externalruntime; private backup до switch; chown только новый release без следования symlinks; external public/data/media/env не заменяются bundle; atomic current switch/restart только того же unit; local3087 и HTTPS exact revision+routes+post-process identity; rollback без восстановления поверх runtime. Ops checkout из github.sha меняется только в deploy-job; QAjob и source/run/QAcommit/hash/revision artifact gate сохранены. App bundle не пересобирается и не меняется.

Единственный найденный P1 C-OPS-ROLLBACK-VERIFY исправлен: restoration,realpath,restart,health,oldPIDcwd/UID теперь проверяются в одной цепочке. Ticket evidence: `веб/memory/tickets/C-OPS-ROLLBACK-VERIFY/guards.md`.

Тестировщик не выполняла реальный SSH,systemd,VPS mutations или платные API. После фактического release Оркестратор/Деплоер должны получить DEPLOY_VERIFIED с exact revision,а независимый Клиент — принять живой сайт и assets. OPS PASS не подменяет это доказательство.

## Актуальный финальный retest — initial Next CLI → owned drop-in

Предыдущий реальный rollout остановился preflight до app mutations: старый service использует exact Next CLI,а не standalone rootserver.js. Обновлённый Architect addendum прочитан; прежний OPS PASS относился к старому предположению и не подменяет этот retest.

**Финальный OPS PASS для retry.** Independently фактически:

- `python scripts/test-systemd-release.py` —8full adapter cases PASS: identity/capacityfail до мутаций,success preservation,revisionfail rollback retaining writes,failed current restoration,configwrite/reloadfail до switch и failed config removal noVERIFIED.
- `node scripts/test-systemd-release-review.mjs` —14extracted-actual rollback branches +12actual Python preflight branches PASS. Known relative Next CLI7tokens accepted;extra args,foreignDropIns,existing owned target,missingCLI/build и identity mismatches rejected. CONFIG_CHANGED-only/absent-target rollback работает. Remove/reload/ln/mv/current/mainunit/restart/health/process failures не объявляются восстановлением. Foreign contents/symlink не удаляются.
- `bash -n scripts/deploy-growth-center.sh` и `git diff --check` —PASS.

Review подтвердил exact owned drop-in ExecStart reset с `/usr/bin/env PORT=3087 HOSTNAME=127.0.0.1 /usr/bin/node /opt/content-factory/current/server.js`; исходный mainunit и envfile не меняются,mainhash проверяется. CONFIG_CHANGED установлен до создания/записи config,trap покрывает pre-switch failure. Rollback удаляет только подтверждённый собственный файл и возвращает исходный CLI через reload+oldcurrent+restart+health+PIDUIDcwdlistener. Test mocks принимают `systemctl daemon-reload` без unit argument. Guard C-OPS-ROLLBACK-VERIFY повторно зелёный; C-OPS-DROPIN-OWNERSHIP найден и закрыт до передачи.

Tested appartifact/source/QA остаются прежними,app rebuild не нужен; операционные изменения требуют отдельной доставки/retry marker Оркестратора. Ни realSSH,ни VPS mutations,ни paidAPI Тестировщик не выполняла. Следующая обязательная проверка — фактический deployed revision и живой Клиент; OPS PASS не означает,что сайт уже обновлён.
