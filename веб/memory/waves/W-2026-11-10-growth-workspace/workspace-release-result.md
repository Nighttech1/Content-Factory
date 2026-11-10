# Production release — growth workspace

10.11.2026. Текущее прямое разрешение владельца на production подтверждено Оркестратором. Прочитаны STATE, docs/DEPLOY, docs/GROWTH_WORKSPACE и штатный systemd adapter. Использован только существующий release workflow/проверенный immutable QA artifact; приложение не пересобиралось, env/nginx/unit не переписывались.

## Идентичность

| Поле | Факт |
|---|---|
| Release run | https://github.com/Nighttech1/Content-Factory/actions/runs/42820434703 — completed/success |
| Release marker commit | 19ad2916ecf062a454f2d60336b19aa339f970bf — изменён только growth-center-release.json |
| Tested app source | a1f83cfe792a074fdae0fbac27d2051ad45a6385 |
| Successful QA | 42798584220, marker dc01033e837309f2196b9abdc5be6fc974d6cf6f |
| App artifact | 13754898158, growth-center-qa-42798584220; fresh expired=false, expiry24.11.2026 |
| Artifact digest metadata | sha256:fdc6db12f6d63e678ca040de65adfdcefbc80be6d9bb6350ac2af5683c687283 |
| Service | content-factory.service, content-factory UID/GID980, port3087 |

Gate и tested-artifact identity verification PASS; deploy PASS; QA job SKIPPED. До запуска повторно прошли 12 полных isolated adapter cases, 25 rollback, 23 actual preflight, 4 snapshot и helper guards. Marker подготовлен штатным offline helper, затем единственным отдельным commit опубликован через подключённый GitHub с expected-head lease. Реальных секретов в чат/логи/Git не читали/не добавляли.

## Реальные release markers

- 12:59:50.457 UTC — DISK_PREFLIGHT_OK.
- 13:00:07.514 UTC — PRECHECK_OK: existing systemd identity и shared paths подтверждены.
- 13:02:18.133 UTC (16:02:18 Москва) — DEPLOY_VERIFIED source=a1f83cfe792a074fdae0fbac27d2051ad45a6385 revision=situation-v2-20261110-01 target=content.vernatunspeakclub.com manager=content-factory.service port=3087.

Штатный script проверил current/new PID cwd, UID980/listener3087, точные shared targets, existing owned drop-in и unchanged main unit. Managed config не перезаписывался; private backups старого release/runtime/env/config сохранены. Rollback **не потребовался**: DEPLOY_FAILED/ROLLBACK_* markers в фактическом выводе отсутствуют. Новые записи runtime не восстанавливались поверх backup.

## Независимые HTTPS reads после выкладки

- /growth200; /marketing200; /studio200; /schedule200; /settings200; корень200 после штатного redirect→/studio.
- /api/growth-center200: version2, canonical revision situation-v2-20261110-01.
- /api/growth-workspace200: version1, integer revision0, weekKey2026-11-09, cards24. Canonical seed revision и mutable workspace revision — разные поля.

**Ограничение фактического runtime:** authConfigured=false, authenticated=false, writeEnabled=false, gitConfigured=false, schedulerEnabled=false; csrfToken=null. Новый интерфейс реально доставлен, но серверные GROWTH_* настройки этой штатной выкладкой не добавлялись. Не выдавать editable/shared-save/Git delivery/weekly scheduler на VPS за настроенные. Безопасный следующий шаг — отдельная серверная настройка по docs/GROWTH_WORKSPACE с private backup существующего app.env, без передачи значений в чат; не замена SSH key или чатового connector на runtime token.

Тестировщик и независимый Клиент уведомлены о live URL и readonly ограничении. Этот отчёт — delivery/HTTP proof, не вымышленная live UI приёмка и не окончательное согласование владельца. Поиск/LLM/платные API/публикация контента не выполнялись; admin.* не трогался.
