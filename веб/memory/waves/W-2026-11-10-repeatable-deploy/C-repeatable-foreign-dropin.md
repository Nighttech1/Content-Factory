# C-repeatable-foreign-dropin — pending foreign configuration must block rollout

Приоритет: **P1**. Зона: Деплоер / identity preflight. Статус: **CLOSED — исправлено и независимо перепроверено**.

## Факт

Тестировщик обнаружила: неизвестный `*.conf` может уже находиться в unit drop-in directory на диске, но ещё отсутствовать в `systemctl show ... DropInPaths`, пока systemd не выполняла `daemon-reload`. Только проверка кэшированного списка systemd недостаточна для соблюдения согласованного fail-closed контракта.

## Ожидание

Любой неизвестный/дополнительный filesystem drop-in должен останавливать выкладку **до изменений**, даже если не отражён в текущем effective metadata. Не выполнять `daemon-reload` ради разведки и не удалять/переписывать посторонние файлы. Допустим только согласованный exact owned template с проверенными типом, owner, permissions и bytes, либо точное отсутствие конфигурации legacy-режима.

Особенно важно для legacy flow: добавление owned drop-in и последующий reload не должны неожиданно активировать ранее невидимую чужую конфигурацию.

## Guard закрытия

Независимый mock создаёт посторонний `*.conf` на диске при пустом/owned-only `DropInPaths`. Adapter обязан отклонить вход до backup/extract/current/config/restart mutations. Известные legacy/managed положительные сценарии должны остаться зелёными. Guard не вправе просто обновить fake `DropInPaths` для совпадения с файлом — именно рассогласование является проверяемым случаем.

Исправление возвращается Деплоеру. Клиент не меняет adapter/helper. Закрытие — после фактического retest Тестировщиком и сверки Клиентом.

## Закрытие

Деплоер добавила проверку фактического списка `*.conf` в parent directory: строго `[owned]` для managed либо `[]` для legacy; проверка идёт внутри исходного readonly preflight до возврата `OLD_CWD` и до backup/stage/config/cutover.

Тестировщик добавила независимый `fs-foreign-unloaded` в `scripts/test-systemd-release-review.mjs`: effective `DropInPaths` пуст, а filesystem содержит `foreign.conf`; выполняется настоящий Python gate adapter, который обязан отклонить ввод. Клиент прочитала код/guard и сама повторно выполнила `node scripts/test-systemd-release-review.mjs`: **PASS 25 rollback branches + 23 actual identity-gate cases**, включая `fs-foreign-unloaded`, legacy-success и managed-success. Никаких production/network действий.

Guard подтверждает исходное рассогласование, а не исправляет fake metadata под filesystem. Замечание закрыто; финальная приёмка всей волны остаётся отдельной.
