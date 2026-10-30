### [C-66] Команда выпуска + AgentPropertiesPanel
- **Зона / Экран:** сайдбар + `/admin/mesh` (OWNER)
- **Факт:** nav «Холст»; chrome `// Только владелец · Сетка агентов`; клик по агенту без панели свойств; layout может быть не одной горизонтальной линией
- **Ожидание:** nav **Команда выпуска**; убрать debug `//` subtitle; агенты в одну горизонтальную линию (mesh-seed); `onNodeClick` → `AgentPropertiesPanel` (name, description, skills[], completedJobs); расширить `AgentNodeData`
- **Приоритет:** P0
- **Скрин-улика:** S16
- **Зона:** Frontend | Motion
