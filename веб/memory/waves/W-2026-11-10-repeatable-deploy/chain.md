# Chain — быстрые следующие выкладки

10.11.2026. Before HEAD `2c4802a`, clean. Ветка `codex/director-chatgpt-transfer`. Spec — `architect-spec.md` рядом. Production сейчас запрещён; сохранение code/docs в GitHub по заданию владельца разрешено. Только существующая команда реестра.

1. **Оркестратор/Клиент** — запрос: записать проверяемую инструкцию и скрипты следующего deploy, не запускать серверные изменения.
2. **Тренер** — root последовательно прочитала профиль/rules/skill/gap/plugins; B, узкие gaps initial-only/runbook. Независимость Tester/Client обеспечивается отдельными агентами.
3. **Архитектор** — эти spec+chain до кода; актуальный successful release и current owned drop-in учтены.
4. **Деплоер** — расширить existing adapter двумя strict modes legacy/managed, snapshot/rollback prior config; helper default prepare-only, runbook. Перед кодом перечитать role/rule/skill/plugins/knowledge; не трогать app/реальные markers/workflow gate/Secrets/VPS. Отдельного Кодера вместо профильного ops исполнителя не требуется.
5. **Тестировщик** — независимо code/mock/schema/default-sideeffects/rollback/configownership review, зафиксировать C-* и tests/evidence. Все настоящие network/SSH вызовы в tests замоканы; не запускать существующий connectivity/release workflow.
6. **Фиксер/Деплоер** — конкретные C-* исправить в переданных paths; повторить относящиеся guards.
7. **Клиент** — независимо проверить понятность инструкции для не-айтишника, соответствие команд helper и existing triggers, отсутствие production действий, результаты tests. Цикл Client→C-*→команда→retest до закрытия всех замечаний, затем возвращение владельцу.
8. **Оркестратор** — после internal accept сохранить только итоговые code/docs в ту же GitHub branch; marker files не менять. STATE/runbook links обновить. Чётко отделить «подготовлено и сохранено» от «следующий deploy реально выполнен».

## Path locks

| Роль | Пути | Ограничение |
|---|---|---|
| Архитектор | Только `веб/memory/waves/W-2026-11-10-repeatable-deploy/{architect-spec,chain}.md` | Не adapter/helper/other docs |
| Деплоер | `scripts/deploy-growth-center.sh`, `scripts/prepare-growth-release.mjs`, `scripts/test-systemd-release.py`, tests helper в новом `scripts/test-prepare-growth-release.mjs`, `docs/DEPLOY.md`, собственный implementation report wave | Не workflow/gate/app/data/Secrets/реальные markers; не commit/push/SSH/production |
| Тестировщик | Существующие independent tests `scripts/test-systemd-release-review.mjs`, новые independent test/report/guards wave | Adapter/helper read-only; C-* возвращать Деплоеру |
| Клиент | Только client review/tickets/guards wave | Не менять app/helper/adapter; internal acceptance по доказательствам |
| Фиксер | Только явно переданный набор файлов конкретного C-* | Последовательный lock, не параллельно владельцу |
| Оркестратор | `STATE.md`, root `README.md` ссылки на runbook, trainer report, GitHub сохранение итоговых code/docs после проверки | Не workflow/release/QA markers, не production |

При необходимости нового paths исполнитель сначала согласует с Оркестратором и Архитектором. Не менять общие файлы параллельно. Backend/Frontend/Motion/AI Bridge/Art Director пропущены: UI/DB/prompts/контент/ИИ-интеграции не меняются. Деплоер не поднимает localhost/VPS ради documentation-only приёмки; tests проверяют существующую ops логику в temp/mock.

## Handoff

Архитектор → Деплоер: strict modes/configsnapshot/ownedtemplate/helper CLI/runbook/acceptance из spec. Деплоер → Tester: изменённые файлы, точные команды mocks и доказательство unchanged marker/workflow/gate. Tester → Client: найденные и закрытые C-*, реальные результаты, что не выполнялось. Client → владелец: короткая инструкция входа, постоянная GitHub ссылка на runbook, что готово и что остаётся проверенным только mock; без заявления о новой production выкладке.
