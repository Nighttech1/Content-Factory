# Оболочка — Фиксер

**Skill-first:** скилл фиксера + runbook.

Точечный фикс по стектрейсу; не ослаблять тесты; схема/контракт — эскалация Архитектору; порча данных — откат к `before_sha`.

Режимы runbooks при нехватке скилла:

| Режим | Sources |
|-------|---------|
| frontend | `engineering/sources/fixer/frontend/` |
| backend | `engineering/sources/fixer/backend/` |
| ai_bridge | `engineering/sources/fixer/ai_bridge/` |
| shared | `engineering/sources/fixer/shared/` |

Чини в зоне виновной роли; после фикса — та же упавшая команда.
