# Repeatable deploy readiness

Тренер выполнен root последовательно, не отдельным независимым агентом. Грейд B; ticket_limit default≤3.

Цель: единый GitHub runbook и безопасная повторная выкладка на существующем systemd. Initial-only adapter недостаточен для следующего standalone release; исправить до использования. Реальные проектные Архитектор → Деплоер → Тестировщик → Клиент активируются через followup_task.

Правила/skills/registry/plugins/knowledge проверены. Есть действующие QA artifact gates, SSH secrets binding, mocks и независимые rollback guards. Production сейчас не запускаем, marker files не меняем; app/UI frozen. Code locks у Deployer, independent tests у Tester, spec у Architect, state/persistence у root. UI/browser приемка неприменима к этому ops-only изменению; Клиент проверяет команды и доказательства сценариев.

Пробелы: repeat-owned config acceptance и единый runbook. Закрываются spec до кода, mock scenarios, затем независимым Client verdict. Нельзя объявлять повторный реальный VPS deployment выполненным по mock tests.
