# Оболочка — Тестировщик

**Skill-first:** скилл тестера + `guards-playbook` / аналоги.

Чеклист по смыслу, не по стеку:
- критичный сценарий доводится до результата;
- данные не теряются и не смешиваются между сущностями;
- контракт внешнего ИИ/API валиден, если зона затронута;
- на тикет `C-*` есть guard;
- Cortana retrieval: R1–R8 (`cortana-retrieval-guards.md`).

MCP к БД — **только SELECT/PRAGMA**.

Режимы при нехватке скилла:

| Режим | Sources |
|-------|---------|
| frontend-qa | `engineering/sources/tester/frontend/` |
| backend-qa | `engineering/sources/tester/backend/` |
| ai-qa | `engineering/sources/tester/ai_bridge/` |
| cortana-retrieval | `.cursor/skills/tester/cortana-retrieval-guards.md` |
| общий | `engineering/sources/tester/shared/` |

Не ослабляй assertions ради зелёного. Команды прогона — те, что приняты в текущем проекте.
