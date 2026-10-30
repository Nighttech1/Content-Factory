# Architect spec — C-44 Тренер (из Sputnik)

## Finding

В `D:\Applications\Sputnik` **нет** роли/файла с именем «Тренер».
Единственный агент-наставник: **`cortana-mentor`**
(`.cursor/skills/cortana-mentor/SKILL.md`, в реестре у AI Bridge).

## Adaptation for Content Factory

| Sputnik | Content Factory |
|---------|-----------------|
| Продуктовая Кортана (TG, psych portrait, goals) | **Не переносим** runtime Cortana |
| Роль наставника / коуча | Переносим как отдельную роль команды **Тренер** |
| Operating protocols / portrait files | Не копируем `cortana_service/*` |

## Deliverables

1. `.cursor/rules/trainer.mdc`
2. `.cursor/skills/trainer/SKILL.md` (+ копия-источник `SOURCE.md` со ссылкой на Sputnik mentor)
3. Запись в `.cursor/registry/agents.md`
4. Обновить `team-org.mdc`, `orchestrator.mdc` (читать trainer rule), `docs/CLIENT_ORCHESTRATOR_CYCLE.md` / `docs/TEAM_ARCHITECTURE.md`
5. `plugins/trainer/PLUGINS.md` (лёгкий)
6. Опционально `knowledge/engineering/roles/trainer.md`

## When Orchestrator calls Тренер

- Онбординг пользователя «как пользоваться фабрикой»
- Перед волной UI: разобрать вкус / anti-slop / сценарии простым языком
- После Клиента: объяснить замечания команде без кода
- **Не** заменяет Frontend/Клиент/Архитектора; **не** пишет прод-код

## Chain for this ticket

`Архитектор → Кодер(реестр) → Оркестратор (подтверждение в team-org)`
