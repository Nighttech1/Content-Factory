# knowledge/ — универсальная база знаний команды

Карта команды: [docs/TEAM_ARCHITECTURE.md](../docs/TEAM_ARCHITECTURE.md)

Эта библиотека **не** привязана к конкретному продукту. Проектные методички (домен, экраны, законы, бренд) кладите в новый проект в `area_*`, а не сюда.

## Skill-first

Агенты читают в таком порядке:

1. Своё `.cursor/rules/<role>.mdc`
2. Свой `.cursor/skills/…/SKILL.md` — **часто достаточно, на этом остановиться**
3. Тонкая оболочка `engineering/roles/<role>.md` или `area_*/roles/…`
4. `shared/` зоны
5. Толстые `sources/` — **только если скилла не хватило**

Не открывать все PDF и sources «на всякий случай».

## Правило слоёв

1. **sources/** — канон (PDF, MD, ссылки). К каждому PDF — соседний `.md` с кратким содержанием.
2. **shared/** — термины и must-have зоны.
3. **roles/** — раздельные оболочки:
   - `client.md` — только Клиент
   - `agent.md` — инженеры по продуктовой зоне
   - `engineering/roles/*.md` — линзы IT-ролей

Клиент **не** читает `agent.md`.  
Инженер **не** использует `client.md` как самоодобрение.

## Куда класть большие базы

| Для кого | Путь |
|----------|------|
| Архитектор | `engineering/sources/architect/` |
| Frontend | `engineering/sources/frontend/` |
| Backend | `engineering/sources/backend/` |
| AI Bridge | `engineering/sources/ai_bridge/` |
| Тестировщик | `engineering/sources/tester/{frontend,backend,ai_bridge,shared}/` |
| Фиксер | `engineering/sources/fixer/{frontend,backend,ai_bridge,shared}/` |
| Деплоер | `engineering/sources/deployer/` |
| Продуктовые зоны нового проекта | `area_*/sources/` |

## Как добавить продуктовую зону

Скопируйте шаблон [area_example](area_example/) в `area_<slug>/` целевого проекта. Не заполняйте шаблон чужим доменом.
