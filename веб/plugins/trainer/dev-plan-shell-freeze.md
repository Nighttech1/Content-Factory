# DEV_PLAN research + UI shell freeze

Когда: пользователь просит сверить / поправить `DEV_PLAN.md` чекбоксами после изучения приложения **и** запрещает менять существующий client UI shell.

| Role | Делает |
|------|--------|
| Тренер | Грейд; убедиться что `architect` / `ticket-engine` / `content-pipeline-agents` знают freeze |
| Архитектор | Live/file audit → правки только `DEV_PLAN.md` (+ spec/chain); `shell_freeze: true` |
| Frontend / Motion | **Не** в chain этой волны |
| Клиент | Опционально: accuracy plan, не visual accept UI |

**Freeze (не трогать):** `AppShell`, `SidebarNavigation` / `MenuVertical`, left nav IA, module top-nav chrome, brand emblem slot.

Skills: `architect` § Research/DEV_PLAN sync · `ticket-engine` plan tickets · `content-pipeline-agents` research note.
