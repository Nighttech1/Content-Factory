# C-OPS-CONFIG-SNAPSHOT — snapshot must not legitimize configuration drift

Приоритет: **P1**. Зона: Деплоер / config snapshot. Статус: **CLOSED — исправлено и независимо перепроверено**.

## Факт

Архитектор при финальной проверке обнаружила окно между первичным preflight и захватом состояния owned drop-in. Если файл изменился/подменён в этом окне, snapshot может принять новое состояние за исходное и тем самым узаконить drift.

## Ожидание

В момент capture/snapshot повторно подтвердить, что захватываемый файл соответствует принятому состоянию: canonical owned path, правильный тип (не symlink), root owner, отсутствие group/world write и точное ожидаемое содержимое. Отсутствие файла в legacy — также точное состояние, а не разрешение принять появившийся файл.

Snapshot фиксирует проверенное прежнее состояние, а не произвольное содержимое «на момент копирования». При drift — fail закрыто; не продолжать переключение current и не переписывать постороннюю конфигурацию.

## Guard закрытия

Независимый mock меняет/подменяет owned drop-in после успешного preflight, но до snapshot. Захват должен отклонить изменённые bytes/тип/owner/permissions до cutover/restart; prior state не должен перезаписываться захваченным drift. После исправления положительные managed/legacy сценарии и rollback prior-state остаются зелёными.

Исправление возвращается Деплоеру. Клиент не меняет adapter/helper. Закрытие — после фактического независимого retest и сверки доказательства.

## Закрытие

Деплоер повторно проверяет root owner и безопасные permissions перед сохранением prior bytes; сохранённая копия сравнивается с canonical template. `verify_prior_dropin` затем проверяет filesystem directory, regular/non-symlink тип, точные device/inode/owner/group/mode metadata и совпадение bytes как с template, так и с исходным файлом. Drift не получает разрешения на cutover.

Клиент прочитала actual snapshot block и независимый harness Тестировщика в `scripts/test-systemd-release-review.mjs`, затем сама повторно выполнила команду `node scripts/test-systemd-release-review.mjs`: **PASS 25 rollback branches + 23 identity-gate cases + 4 actual snapshot cases**. Snapshot cases: success допускается; changed-bytes, nonroot-owner и writable-mode отвергаются до `CUTOVER_ALLOWED`. Производственные команды/сеть не запускались.

Замечание закрыто. Это targeted mock/review, а не доказательство новой реальной выкладки; финальная приёмка всей волны отдельно.
