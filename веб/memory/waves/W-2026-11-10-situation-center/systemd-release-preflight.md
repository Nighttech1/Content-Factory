# Systemd adapter — подготовка к разрешённому релизу

10.11.2026. Реализация следует `systemd-release-spec.md`, принятой Архитектором до кода. Доказанный runtime — existing `content-factory.service`, content-factory UID/GID980, stable current, порт3087, внешний `/var/lib/content-factory/{data,generatedMedia,public}` и `/etc/content-factory/app.env`.

## Изменено

`scripts/deploy-growth-center.sh` заменяет неприменимый PM2-flow на этот существующий systemd unit: read-only identity/ExecStart/PID/UID/cwd/listener/storage gate до первой мутации; ёмкость с old release и external runtime; private file-level live backups старого release/runtime/env; extraction tested bundle, chown только нового release без следования ссылкам; привязка тех же external storage/env paths; atomic current и restart только existing unit; local3087/HTTPS revision, старые routes и post PID/UID/cwd/listener checks.

Бэкап — файловая live-копия, не транзакционный snapshot БД. Runtime ownership и содержимое не заменяются bundle. Полный public остаётся прежним shared directory; feature не требует новых public-assets.

Workflow deploy checkout берёт текущий `github.sha` для ops script. Immutable artifact identity gate, QA job, gate job, permissions и triggers не изменены. App source/run/QAcommit/hash/revision подтверждаются прежним gate. Capacity gate теперь учитывает old release и внешний runtime.

## Независимое замечание и фикс

Тестировщик выдала `C-OPS-ROLLBACK-VERIFY`: прежняя последовательность под set+e могла показать успех после failed ln/mv. Исправлено: единая checked chain восстановления old current → readlink verification → restart того же unit → bounded health retry → old PID cwd/UID verification. Любая ошибка даёт ROLLBACK_HEALTH_FAILED; ошибку исходного релиза не скрываем. Данные не восстанавливаются поверх новых записей.

## Фактические offline проверки

- `bash -n scripts/deploy-growth-center.sh`, embedded Python compile, YAML parse и bash-n всех workflow run blocks — PASS.
- `python3 scripts/test-systemd-release.py` — 5 изолированных случаев PASS: identity fail до мутаций; capacity fail до мутаций; успех с private backups и same external links; revision failure с rollback old current и сохранением shared writes; failed rollback mv без ложного VERIFIED/restart.
- Независимый `node scripts/test-systemd-release-review.mjs` — 7 branches PASS (success/ln/mv/current/restart/health/process).
- Parsed workflow comparison: QA/gate/triggers/permissions/verified-artifact identity block unchanged — PASS.
- `git diff --check` — PASS.

Это подготовка, не доказательство состоявшейся выкладки. Ни SSH, ни VPS mutations, ни marker/commit/push Деплоером не выполнялись. Root должна опубликовать ops и отдельно разрешённый release marker для того же tested artifact, затем проверить реальный workflow, HTTPS revision и пользовательский сценарий Клиентом. Production success до evidence не объявлять.
