# Приёмка Клиента — повторяемая выкладка

Дата: 10.11.2026 (Москва). Исполнитель — отдельная проектная роль **Клиент**, не автор adapter/helper и не Тестировщик.

**Внутренний вердикт: ПРИНЯТО для сохранения code/docs в GitHub.** Открытых C-* нет. Эта волна не запускала production, SSH-диагностику или повторную реальную выкладку. GitHub save выполняет Оркестратор после этого отчёта; настоящий следующий release требует отдельного разрешения владельца.

## Документы и пользовательский маршрут

Клиент прочитала готовый `docs/DEPLOY.md`, CLI helper и его `--help`, README/AGENTS/deployer skill header, актуальные STATE/DEV_PLAN и независимый отчёт Тестировщика. Ссылки ведут к существующим каноническим файлам Content Factory; исторический Sputnik/PM2 не является инструкцией этого проекта.

| Критерий | Результат |
|---|---|
| Понятная следующая выкладка | Runbook разделяет source → QA marker → проверки/приёмка → новое production-разрешение → release marker → DEPLOY_VERIFIED → живая приёмка |
| Команды соответствуют CLI | Полные SHA, числовые run/artifact ID, QA marker commit SHA, attempt1..10; флаги и target совпадают с `--help` и реализацией |
| Подготовка безопасна по умолчанию | Helper выдаёт JSON в stdout; off-trigger output отделён от `--write-marker`; не делает SSH/API/commit/push. Offline-подготовка не объявляет удалённый QA/artifact проверенным |
| Production явно отделён | Release marker write требует `--write-marker --approve-production content.vernatunspeakclub.com`; флаг фиксирует уже полученное разрешение, не создаёт его. Commit/push — отдельные команды; runbook явно предупреждает, что release marker push сразу запускает production |
| Provenance и expiry | Source/QA run/QA commit/artifact выбираются заново; исторические IDs не defaults. Описаны authoritative existing CI gates, принадлежность/expiry artifact, source/hash/revision и 14-дневное хранение. Expired/mismatched artifact требует нового QA |
| Текущий runtime | Managed exact-owned standalone конфигурация, existing `content-factory.service`, порт3087, versioned current; нет PM2/подмены unit/nginx/env |
| Данные и откат | Private backups, те же external data/generatedMedia/public/env paths; managed config сохраняется. Rollback возвращает previous current/config, не затирает foreign drift и runtime writes. Backup честно не назван транзакционным DB snapshot |
| Вход следующего чата | README/AGENTS/skill направляют к одному runbook; STATE и DEV_PLAN указывают фактические проверки и отсутствие нового VPS trial |

## Независимые доказательства

- Тестировщик сообщила финальный **OPS/HELPER PASS**: 12 полных mocked adapter scenarios; 25 rollback + 23 actual Python preflight + 4 actual config-snapshot cases; 22 независимых CLI scenarios в disposable Git repo; 5 авторских helper guard groups; parse/diff checks.
- Клиент сама прочитала fixes и независимые guards обоих C-*, затем выполнила `node scripts/test-systemd-release-review.mjs`: **PASS25/23/4**. Это targeted mock/retest, никаких VPS команд.
- Клиент сама выполнила `node scripts/test-repeatable-helper-review.mjs`: **PASS22**, включая default preparation, invalid arguments, branch/repo/source validation, отсутствие approval, protected marker aliases и symlink aliases. Fixtures создавались только в temporary Git repo.
- `node scripts/prepare-growth-release.mjs --help` соответствует опубликованным командам; `git diff --check` — PASS.
- Diff по workflow/gate и настоящим QA/release markers пуст. Приложение этой волной не меняется, повторная UI-приёмка не требуется.
- Hash-проверка Клиента совпадает с независимым Tester report: adapter SHA256 `91ed2478d0b1fe7521da1a5ede00c34855f08905e253bc127e763d3d35a9fc64`; helper SHA256 `e66cace3f2a4a51ea98202603b9b1954cfa231e3f476544483460b438a3af4d2`.

## Замечания закрыты до передачи владельцу

1. **C-repeatable-foreign-dropin — CLOSED.** Проверяется фактический filesystem `.conf` allowlist, а не только cached `DropInPaths`; dormant foreign config отвергается до мутаций. Guard `fs-foreign-unloaded` независимо повторён.
2. **C-OPS-CONFIG-SNAPSHOT — CLOSED.** Snapshot повторно проверяет canonical bytes/root/nonwritable metadata; raced changed-bytes/nonroot-owner/writable-mode не доходят до cutover. Четыре actual snapshot cases независимо повторены.

Подробные evidence и ожидания сохранены в отдельных C-файлах этой волны. Автор adapter не принимала собственный результат. Дополнительных блокирующих замечаний по финальным командам/документам нет.

**Граница результата:** инструменты и инструкция приняты по code/docs и mock/offline доказательствам. Реальная следующая managed выкладка этим не объявляется выполненной или live-проверенной. Финальное согласование владельца отдельно; ранее работавший production не менялся этой волной.
