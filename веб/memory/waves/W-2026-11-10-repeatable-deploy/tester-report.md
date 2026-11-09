# Независимая Тестировщик — repeatable deploy

10.11.2026. **Вердикт: OPS/HELPER PASS; real production в этой волне не выполнялся.** Проверка проведена отдельной проектной ролью по spec+chain; приложение,rollout/helper/workflow/gate/реальные marker-файлы Тестировщик не меняла.

## Фактически запущенные проверки

| Команда | Результат |
|---|---|
| `node scripts/test-systemd-release-review.mjs` | PASS:25actual-source rollback branches,23actual Python identity preflight branches,4actual managed config snapshot branches |
| `python scripts/test-systemd-release.py` | PASS:12полных adapter mock scenarios |
| `node scripts/test-repeatable-helper-review.mjs` | PASS:22independent CLI scenarios в disposable local Git repo |
| `node scripts/test-prepare-growth-release.mjs` | PASS:5авторских групп helper guards, независимо повторены |
| `bash -n scripts/deploy-growth-center.sh`, Node parse checks helper/guards, `git diff --check` | PASS |
| `git diff --name-only -- .github/workflows/growth-center-release.yml scripts/growth-center-gate.mjs .github/releases/growth-center-qa.json .github/releases/growth-center-release.json` | Пусто: критические workflow/gate/реальные markers не изменены |

## Что независимо подтверждено

- Legacy initial и managed exact-owned принимаются; unknown argv,extra args,foreign/config-drift/symlink/root-owner/writable-mode/parent mismatches и отсутствующий required old entry/build отклоняются.
- Проверяется не только cached DropInPaths,но и реальные filesystem `*.conf`; ранее неактивированный foreign drop-in не получает implicit activation при daemon-reload.
- Managed rollback сохраняет прежний config: не rm,не лишний daemon-reload; точный относительный old symlink target восстанавливается. Metadata/inode/bytes drift и foreign replacement не затираются и не дают ложный rollbackverified.
- Config snapshot после initial preflight повторно требует root/nonwritable/canonical bytes. Actual Bash snapshot block с raced foreignbytes/owner/mode прекращается до CUTOVER_ALLOWED.
- Full mocked adapter подтвердил next managed release без config rewrite/reload;health failure возвращает old current со старым owned config и не стирает shared writes. Legacy configwrite/reload failures и прежние rollback failure cases сохранены.
- Helper по умолчанию выдаёт только подготовленный JSON и честное remote-not-checked предупреждение. Invalid/duplicate/unknown flags,SHA/IDs/attempts,неподходящие branch/repo/nonancestor и output aliases не меняют markers. Symlink-parent и symlink-file aliases trigger-путей также заблокированы. Release-write требует exact production approval flag;эта проверка запускалась только в temp Git repo с фиктивными IDs,не в настоящем репозитории.

## Дефекты и фиксы до приёмки

1. `C-repeatable-foreign-dropin`: actual preflight учитывал cached DropInPaths,но не dormant foreign `*.conf` на диске. Деплоер добавила exact filesystem allowlist; `fs-foreign-unloaded` guard PASS.
2. `C-OPS-CONFIG-SNAPSHOT`: foreign bytes/metadata между preflight и snapshot могли стать новым prior state. Деплоер добавила повторный root/mode gate и canonical template comparison;4actual snapshot guards PASS.

Других открытых замечаний Тестировщика нет. Финальная приёмка code/docs/команд принадлежит независимому Клиенту,не подменяется этим отчётом.

## Предел доказательств

Все systemd/network/SSH операции из тестов замоканы; применяемые файлы/links/config для CLI и shell создавались только в временных папках. Никаких реальных VPS probes,workflow reruns,marker writes,commit/push,paid API или новой production выкладки Тестировщик не выполняла. Отсутствие production trial соответствует границе этой волны. Будущий новый release всё равно проходит прежний source→QA→Client→новое разрешение→release marker→CI identity gate→live acceptance.

## Проверенные файлы adapter/helper

- `scripts/deploy-growth-center.sh` — SHA256 `91ed2478d0b1fe7521da1a5ede00c34855f08905e253bc127e763d3d35a9fc64`
- `scripts/prepare-growth-release.mjs` — SHA256 `e66cace3f2a4a51ea98202603b9b1954cfa231e3f476544483460b438a3af4d2`
