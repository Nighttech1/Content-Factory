# Trainer grade — 2026-10-10-nav-mesh-rewrite

## План хода

- Запрос: full-queue волна после product intent — emblem-only brand; carousel crossfade; CG meta/titles; hydration ban; Razbor composer+X; **nav IA** (sidebar Studio/Schedule/Settings only; Mesh+Analytics под модулем); **FULL rewrite** «Команда выпуска» clean-slate (flowchart + Agent inspector), delete legacy xyflow.
- `ticket_limit:` **full-queue** (пользователь явно; без нарезки ≤3).
- Режим: UI / Mesh / Motion / Nav IA — усиление skills до кода.
- Роли по chain: **Тренер → Архитектор → Frontend → Motion → Backend (Agent type, опц.) → Тестировщик → Фиксер → Деплоер → Клиент (S36–S38; mesh S37 HARD)**.
- Emblem: user-attached circle → `public/brand/vernatun-emblem.png` (не PNG с baked wordmark).
- MCP: Playwright / chrome-devtools — бесплатные; платный MCP не предлагать.
- Тренер **не** пишет app UI / не закрывает C-*.

## Грейд: C → A

**До усиления:** **C** — критичные пробелы знания:

1. Brand C-122 канонил PNG с возможным baked text — нет **emblem-only** + VERNATUN text.
2. Carousel wave3 = **hard cut**; user хочет **crossfade без чёрной вспышки** — skill противоречил запросу.
3. Нет токенов **card meta 12px white** / **titles 16px white** Century Gothic.
4. Нет ban на **conditional `data-testid`** → hydration `nav-brand`.
5. Razbor composer layout (long input + 3 right + circular red X) не зафиксирован.
6. Nav IA: skills всё ещё держат Mesh/Analytics в sidebar / global routes — против module top-nav.
7. Mesh skill = **patch xyflow → static picture**; user требует **clean-slate rewrite + delete old canvas + Agent type inspector**.

**После апгрейда skills/gap-playbook/architect locks (этот ход):** **A** — команда готова к full-queue C-130…C-137.

### По ролям / skills

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| `content-factory-ui` | A | C-130…C-136 tokens + IA + hydration |
| `web-motion-engine` | A | C-131 crossfade supersedes hard cut |
| `xyflow-agent-mesh` | A | C-137 clean-slate + Agent inspector checklist |
| `content-factory-analytics` | A | C-136 module top-nav entry |
| `client-scenarios` | A | S36–S38; S37 HARD mesh rewrite |
| `architect` | A | locks C-130…C-137 + path lock |
| Frontend / Motion | A (knowledge) | код — волна |
| Backend | B | Agent `modelConfig` persist — mock OK first |
| MCP / registry | A | Playwright eyes; no paid MCP |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | PNG brand с текстом / не emblem | FE | skill→code | P0 |
| 2 | Black flash / hard cut carousel | FE+Motion | skill→code | P0 |
| 3 | Meta/titles не CG 12/16 white | FE | skill→code | P1 |
| 4 | Hydration nav-brand testid | FE | skill→code | P0 |
| 5 | Razbor composer + red X | FE | skill→code | P1 |
| 6 | Sidebar still Mesh/Analytics | FE | skill→code | P0 |
| 7 | Mesh = legacy xyflow patch | FE+Motion (+BE types) | skill→code | P0 |

Data-safety: не трогать Postgres/Redis/медиа; секреты не в memory; HITL publish/RL не обходить. Cursor-Тренер ≠ продуктовый Тренер пайплайна.

## Что добавлено этим ходом

- `content-factory-ui` — C-130 emblem; C-132/134 typography; C-133 hydration ban; C-135 composer; C-136 nav IA; Do-not.
- `web-motion-engine` — C-131 smooth crossfade (no black flash).
- `xyflow-agent-mesh` — C-137 CLEAN-SLATE rewrite + Agent type inspector; delete legacy checklist.
- `content-factory-analytics` — module top-nav entry C-136.
- `client-scenarios` — S36–S38; Hard REJECT mesh rewrite.
- `architect` — locks C-130…C-137 + path lock full-queue.
- `gap-playbook` — 7 строк волны.
- `plugins/trainer/PLUGINS.md` — pointers.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-130…C-137

| ID | P | Scope |
|----|---|-------|
| **C-130** | P0 | Sidebar brand: club **emblem-only** left of **VERNATUN** text |
| **C-131** | P0 | Carousel: smooth slide **crossfade**; no black flash |
| **C-132** | P1 | Card meta: Century Gothic white **12px** all modules |
| **C-133** | P0 | Hydration: ban conditional testids (`SidebarNavigation` nav-brand) |
| **C-134** | P1 | Razbor / system source titles: CG white **16px** |
| **C-135** | P1 | Razbor: longer input + 3 buttons right; circular red X close |
| **C-136** | P0 | Nav IA: sidebar Studio/Schedule/Settings only; Mesh+Analytics module top nav |
| **C-137** | P0 | Mesh FULL rewrite clean-slate: flowchart + inspector Agent type; delete legacy canvas |

### Recommended chain (path lock — no overlapping)

```
Тренер (done) → Архитектор (spec + chain.md all C-130…C-137)
  → Frontend SHELL:     C-133 → C-130 → C-136   (SidebarNavigation / AppShell / module top nav)
  → Frontend FEED:      C-132 → C-131 (+ Motion crossfade)
  → Frontend RAZBOR:    C-134 → C-135
  → Frontend+Motion MESH: C-137 (AFTER C-136; delete legacy xyflow; new flowchart+inspector)
       Backend Agent type fields — same mesh path if persist needed
  → Тестировщик (guards S36–S38) → Фиксер → Деплоер localhost → Клиент
```

**Запрет parallel:** shell tickets вместе; mesh C-137 параллельно с кем-то на тех же mesh files; «патч старого xyflow» рядом с delete.

Full-queue: Оркестратор **не** останавливается после 3 тикетов — до закрытия очереди с guards.
