# C-OPS-DROPIN-OWNERSHIP — удалять только собственный drop-in

10.11.2026. P1; **CLOSED: исправлено и независимо перепроверено до retry release.**

Независимый review новой config-ветки обнаружил unconditional rm при CONFIG_CHANGED. По принятой спецификации перед удалением нужно подтвердить принадлежность target этому rollout.

Деплоер добавила `remove_owned_dropin`: отсутствующий path безопасен; существующий разрешён к удалению только как regular non-symlink с побайтным совпадением подготовленного `BACKUP/standalone-dropin.conf`. Foreign contents/symlink → ошибка без rm/VERIFIED. Перед install повторно проверяются !-e и !-L. CONFIG_CHANGED устанавливается до config mutations; trap действует и до current switch.

Guard: `node scripts/test-systemd-release-review.mjs` фактически PASS14rollback branches,в том числе config-only/config-absent/remove/reload/foreign-content/foreign-symlink и все прежние restoration failures. Actual preflight ещё12cases PASS,включая initial preexistingowned/foreignDropIns/missingoldCLI/build отказ. Независимо повторён `python scripts/test-systemd-release.py`:8fullmockcases PASS. Реальные production paths/systemd/SSH/сеть не использовались.
