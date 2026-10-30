# Trainer grade — 2026-10-09-ux-wave7

## План хода

- Запрос: **UX-7** — Studio copy; Mesh MultiButton vertical + AgentNode art; Schedule published-past leave rail; Settings TOC/Расписание autofill/Разведка; Analytics Scout scripts + chrome cleanup.
- `ticket_limit:` **full-queue** (весь бэклог UX-7 в одном сообщении пользователя; без нарезки по 3).
- Режим: UI polish / Mesh / Schedule / Settings / Analytics — усиление skills до кода.
- Роли по chain: **Тренер → Архитектор → Frontend (+ 21st) → Motion → Backend (autofill/scout params) → AI Bridge (опц. learning cycles) → Тестировщик → Фиксер → Деплоер → Клиент**.
- Контекст: UX-6 (C-88…C-96) skills залочены; UX-7 = gap-волна.
- MCP: Playwright / chrome-devtools — бесплатные; платный MCP не предлагать.
- Тренер **не** пишет app UI.

## Грейд: C → A

**До усиления:** **C** — в skills не было: vertical MultiButton (C-98), AgentNode human art / no JSON edges (C-99), schedule past+published leave rail (C-100), Settings Расписание autofill + TOC white + Разведка (C-101/C-104), analytics Scout scripts / N/M / dual-row / learning-cycles note (C-102/C-103), Studio description strip (C-97).

**После апгрейда skills (этот ход):** **A** — команда готова к full-queue UX-7.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Frontend (`content-factory-ui`) | A | C-97…C-101, C-104 канон |
| Analytics (`content-factory-analytics`) | A | C-102/C-103 + Architect learning-cycles note |
| Mesh (`xyflow-agent-mesh`) | A | C-98 vertical; C-99 art + edges |
| Motion (`web-motion-engine`) | A | vertical MultiButton + dual-row dropdown |
| Pipeline (`content-pipeline-agents`) | A | Razborщик summary → anomalies |
| Backend | B+ | schema autofill/Разведка — в spec Архитектора |
| Client scenarios | B | S36+ допишет Тестировщик (не блокер) |
| Architect | A | locks ниже; learning cycles в analytics skill |
| MCP / registry | A | без дыр |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | P |
|---|--------|------|---|
| 1 | Description Студии: «Наши» / «Конкуренты» в helper copy | FE | P1 |
| 2 | Mesh MultiButton horizontal overflow; не vertical flush-left | FE + Motion | P0 |
| 3 | AgentNode Lucide/tags «разбор» / task counts / edge «JSON» | FE + Motion | P0 |
| 4 | Published+past остаётся в правом schedule rail | FE (+ BE status) | P0 |
| 5 | TOC «Навигация» не white; нет Settings «Расписание» autofill | FE (+ BE) | P0 |
| 6 | Analytics eyebrow / эвристик / Синх. / Scout «цель» / blurb | FE | P0 |
| 7 | Scout без topic+yellow+«Выбрать тему»; нет top-15 + summary | FE (+ scripts) | P0 |
| 8 | Нет Settings «Разведка» auto-search params | FE (+ BE) | P1 |

Data-safety: не трогать Postgres/Redis/медиа; leave rail ≠ delete post/media; HITL publish не обходить.

## Что добавлено этим ходом

- `content-factory-ui` — C-97 Studio copy; C-98 MultiButton vertical; C-100 published-past rail; C-101 TOC + «Расписание» autofill; C-104 «Разведка»; Do-not UX-7.
- `content-factory-analytics` — C-102 chrome; C-103 Scout scripts; Architect learning-cycles note; types `syncedAt` / N/M.
- `xyflow-agent-mesh` — C-98 responsive; C-99 AgentNode art + no JSON edge labels; checklist.
- `web-motion-engine` — vertical MultiButton; analytics dual-row dropdown.
- `content-pipeline-agents` — Razborщик summary для anomalies carousel.
- `gap-playbook` — 8 строк симптомов UX-7.
- `plugins/trainer/PLUGINS.md` — UX-7 pointers.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-97…C-104

| ID | P | Scope |
|----|---|-------|
| **C-97** | P1 | Studio: убрать «Наши»/«Конкуренты» из description/helper copy |
| **C-98** | P0 | Mesh MultiButton → vertical на узком; flush-left к sidebar |
| **C-99** | P0 | AgentNode human logo + profession accessories; убрать tags/counts; edges без «JSON» |
| **C-100** | P0 | Schedule: day past + published → убрать из правого rail |
| **C-101** | P0 | Settings: TOC «Навигация» white; блок «Расписание» autofill rules (type/platform/time/freq) + calendar wire; manual override |
| **C-102** | P0 | Analytics chrome: no eyebrow/эвристик; «Синхронизация»+hh.dd.mm.yy; source CG white; Scout no «цель»; N/M; dual-row dropdown; «Разведка ниши» bold CG 20px no blurb; learning cycles → Architect only |
| **C-103** | P0 | Scout: topic + yellow search + «Выбрать тему»; anomalies/stable scripts by topic; carousel top-15 + Разборщик summary |
| **C-104** | P1 | Settings блок «Разведка» — auto search params |

### Recommended chain (full-queue, один проход)

`Архитектор (spec + chain.md, locks C-97…C-104, learning cycles) → Frontend (+ 21st-ui-catalog, content-factory-ui, content-factory-analytics, xyflow-agent-mesh) → Motion (MultiButton vertical + dual-row dropdown + node art polish) → Backend (schedule autofill rules + Разведка params + syncedAt) → Тестировщик (guards S36+) → Фиксер → Деплоер localhost → Клиент`

Path lock (без overlap):

1. **C-97** — Studio copy (isolated)
2. **C-98 + C-99** — mesh MultiButton + AgentNode/edges (после shared `multi-button.tsx` layout)
3. **C-100** — schedule rail filter
4. **C-101 + C-104** — Settings TOC + Расписание + Разведка (один Settings shell)
5. **C-102 + C-103** — Analytics header + Scout scripts (после types)

Не резать UX-7a/7b. После guards всей восьмёрки — приёмка Клиента.
