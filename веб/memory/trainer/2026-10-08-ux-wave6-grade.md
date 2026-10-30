# Trainer grade — 2026-10-08-ux-wave6

## План хода

- Запрос: **UX-6** — Mesh (MultiButton chamfer-left + smooth hover, убрать KPI topbar, resizable agent panel + Scout feed, sidebar nav typography), Schedule (Century Gothic blue labels, delete slot-only, month nav bug), Settings Agents MultiButton parity.
- `ticket_limit:` **full-queue** (одно сообщение пользователя = весь бэклог UX-6, без нарезки по 3).
- Режим: UI polish / Mesh / Schedule / Settings — усиление skills до кода.
- Роли по chain (по запросу пользователя): **Frontend → Motion → Тестировщик → Деплоer → Клиент** (Архитектор — spec/chain по усмотрению Оркестратора, skills уже залочены).
- Контекст: UX-5 (C-82…C-87) закрыт guards; UX-6 = следующая gap-волна polish.
- MCP: Playwright / chrome-devtools — бесплатные, без платных MCP.

## Грейд: B → A

**До усиления:** **C** — skills wave 5 требовали mesh MultiButton **по центру** (C-83), KPI в topbar, нет chamfer/smooth hover, нет Scout feed / panel resize, нет C-92 labels, schedule month/delete контракт не описан.

**После апгрейда skills (этот ход):** **A** — команда готова к full-queue UX-6. **B** оставлен в заголовке как «было до дописывания C-90/C-96»; финальный вердикт **A**.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Frontend (`content-factory-ui`) | A | UX-6 C-88…C-96 канон |
| Motion (`web-motion-engine`) | A | MultiButton chamfer smooth width |
| Mesh (`xyflow-agent-mesh`) | A | Left chamfer, no KPI, Scout panel |
| Client scenarios | B+ | S32–S35 — дописать Тестировщику по chain (не блокер) |
| Architect | A | Locks ниже; spec опционален при готовых skills |
| MCP / registry | A | Без дыр |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | P |
|---|--------|------|---|
| 1 | MultiButton center/pill + abrupt hover + truncate «Информационное видео» | FE + Motion | P0 |
| 2 | KPI Задачи/Задержка/GPU в CanvasTopBar | FE | P1 |
| 3 | AgentPropertiesPanel fixed width + completedJobs вместо Scout list | FE | P1 |
| 4 | Sidebar nav не Century Gothic bold blue +1 size | FE | P1 |
| 5 | Field labels mono uppercase («Время публикации») | FE | P0 |
| 6 | Schedule delete удаляет post / нет кнопки slot-only | FE | P0 |
| 7 | `onSelectDay` → `setMonth` на каждый клик дня | FE | P0 |
| 8 | Settings Agents MultiButton без chamfer-left-smooth | FE | P1 |

Data-safety: не трогать Postgres/Redis/медиа; `removeSlot` ≠ delete post.

## Что добавлено этим ходом

- `content-factory-ui` — UX-6 уже был частично; дополнены § C-90 AgentPropertiesPanel, § C-96 Settings Agents, подтверждены C-88/C-89/C-91/C-92/C-93/C-94 + Do-not.
- `xyflow-agent-mesh` — C-88 left chamfer, C-89 no KPI, C-90 resize + Scout feed, checklist.
- `web-motion-engine` — § MultiButton chamfer smooth hover.
- `gap-playbook` — 7 строк симптомов UX-6.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-88…C-96

| ID | P | Scope |
|----|---|-------|
| **C-88** | P0 | Mesh + shared `multi-button`: left chamfer rect, smooth hover width, full RU labels |
| **C-89** | P1 | CanvasTopBar: убрать Задачи/Задержка/GPU |
| **C-90** | P1 | AgentPropertiesPanel: resizable + Scout improvements scroll list |
| **C-91** | P1 | Sidebar nav: Century Gothic, +1 size, bold blue |
| **C-92** | P0 | System: field labels Century Gothic + blue (Schedule first) |
| **C-93** | P0 | Schedule popup Delete → `removeSlot` only; post stays in rail |
| **C-94** | P0 | Schedule: day click ≠ month change; month only arrows/«Сегодня» |
| **C-96** | P1 | Settings Agents: MultiButton parity C-88 |

### Recommended chain (full-queue, один проход)

`Frontend (+ 21st-ui-catalog) → Motion (MultiButton width) → Тестировщик (S32–S35 guards) → Фиксer → Деплоer localhost → Клиент`

Path lock (без overlap):

1. **C-88 + C-96** — `multi-button.tsx` first, then Mesh + Settings
2. **C-89 + C-90** — mesh shell (после C-88)
3. **C-91** — sidebar (parallel OK с mesh если разные агенты; иначе sequential)
4. **C-92 + C-93 + C-94** — schedule batch

Не резать UX-6a/6b. После guards всей восьмёрки — приёмка Клиента.
