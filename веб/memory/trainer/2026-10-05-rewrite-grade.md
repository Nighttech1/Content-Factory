# Trainer grade — 2026-10-05-rewrite

## План хода

- Запрос: скопировать Тренера из Business Management и переписать под Content Factory.
- Режим: усиление команды.
- Роли: Тренер (этот ход), без Frontend.

## Грейд: A

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | тянули Sputnik cortana-mentor вместо BM trainer | trainer | skill+rule | P0 закрыт |
| 2 | не было грейда A–D / memory/trainer | trainer | template | P0 закрыт |
| 3 | не было gap-playbook под фабрику | trainer | ref | P0 закрыт |

## Что добавлено этим ходом

- `.cursor/agents/trainer.md` (порт BM committee/trainer)
- Переписаны `trainer.mdc`, `SKILL.md`, `SOURCE.md`, `plugins/trainer`
- `gap-playbook.md`, `memory/_templates/trainer-grade.md`
- Цикл: шаг 0 Тренера в orchestrator + CLIENT_ORCHESTRATOR_CYCLE

## Вердикт

Команда готова к UI-волне: **да** (после reload MCP при необходимости)
