# Trainer grade — 2026-10-10-vernatun-ui-wave

## План хода

- Запрос: **Vernatun UI full backlog** одним проходом — brand logo+name right; Studio без «нового модуля»; Mesh static pipeline picture + dual-lane + Trainer barbell + Scout≠Trainer; Schedule popupPos persist; Analytics Studio-like menu + RL Trainer HITL + Retention %@15s fraction.
- `ticket_limit:` **full-queue** (пользователь явно: полный бэклог одним проходом; без нарезки по 3).
- Режим: UI / Mesh / Schedule / Analytics — усиление skills/rules до кода.
- Роли по chain: **Тренер → Архитектор → Frontend (+ 21st) → Motion → Backend (RL HITL / retention types, опц.) → AI Bridge (опц. Trainer proposals) → Тестировщик → Фиксер → Деплоер → Клиент (S32–S35 HARD mesh)**.
- Контекст: UX-8 (C-105…C-113) залочен; эта волна = gap после product intent «не xyflow-доска» + Client халтурил mesh.
- MCP: Playwright / chrome-devtools — бесплатные; платный MCP не предлагать.
- Тренер **не** пишет app UI.

## Грейд: C → A

**До усиления:** **C** — критичные пробелы знания:
1. `xyflow-agent-mesh` всё ещё канонил free ReactFlow board (MiniMap/Controls/Dots) — против «картинки» пайплайна;
2. нет brand PNG+name-right; нет ban RegisterModule;
3. Scout panel = «improvements» (должен быть Trainer); нет User dual-lane + пунктир + barbell;
4. popupPos не persist across slots/refresh;
5. analytics без Studio-like per-module menu / RL HITL «Согласовано» / Retention 15s fraction;
6. `client-scenarios` без HARD S33 mesh (Клиент принимал по скрину).

**После апгрейда skills/rules (этот ход):** **A** — команда готова к full-queue Vernatun UI wave.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Mesh (`xyflow-agent-mesh`) | A | C-124 static picture; C-125 dual-lane/barbell/roles |
| Pipeline (`content-pipeline-agents`) | A | User lane; Scout collect-only; Trainer+HITL |
| Frontend (`content-factory-ui`) | A | C-122/123/126 |
| Analytics (`content-factory-analytics`) | A | C-127/128 |
| Client scenarios + `client.mdc` | A | S32–S35 + Hard REJECT #8 mesh |
| Architect | A | locks C-122…C-128 + path lock |
| Motion | B+ | edge dashed + density; в spec |
| Backend / AI Bridge | B | RL approve wire / retention at15 — mock OK в FE first |
| MCP / registry | A | без дыр; Cursor-Тренер ≠ pipeline Trainer |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Sidebar text-only / name under logo | FE | skill→code | P0 |
| 2 | Launchpad «создание нового модуля» живо | FE | skill→code | P0 |
| 3 | Mesh = interactive xyflow / overlap | FE + Motion | skill→code | P0 |
| 4 | Нет User / пунктир / barbell; Scout=patches | FE | skill→code | P0 |
| 5 | popupPos reset on slot/refresh | FE | skill→code | P0 |
| 6 | Analytics без per-module menu | FE | skill→code | P0 |
| 7 | RL без Trainer + «Согласовано» | FE (+ BE) | skill→code | P0 |
| 8 | Retention без %@15s дроби | FE | skill→code | P1 |

Data-safety: не трогать Postgres/Redis/медиа; секреты не в memory; HITL publish + RL apply не обходить. Продуктовый Тренер пайплайна ≠ Cursor-роль Тренер.

## Что добавлено этим ходом

- `xyflow-agent-mesh` — C-124 static picture supersedes free canvas; C-125 dual-lane / barbell / Scout≠Trainer panel; checklist.
- `content-factory-ui` — C-122 brand horizontal; C-123 remove RegisterModule; C-126 popupPos persist; Do-not.
- `content-factory-analytics` — C-127 menu+RL HITL; C-128 retention 15s fraction.
- `content-pipeline-agents` — dual-lane User; Scout collect-only; Trainer proposes+HITL.
- `client-scenarios` — S32–S35 + Mesh Hard REJECT.
- `client.mdc` — Hard REJECT #8 mesh S33.
- `architect` — locks C-122…C-128 + path lock full-queue.
- `gap-playbook` — 7 строк Vernatun UI.
- `plugins/trainer/PLUGINS.md` — pointers волны.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-122…C-128

| ID | P | Scope |
|----|---|-------|
| **C-122** | P0 | Brand: PNG logo + Vernatun **справа** в сайдбаре |
| **C-123** | P0 | Studio: убрать «создание нового модуля» |
| **C-124** | P0 | Mesh: static pipeline picture; dense; no overlap; keep properties panel |
| **C-125** | P0 | Dual-lane User+release; Scout→Analyst→Trainer + dashed; barbell; Scout=info / Trainer=proposals |
| **C-126** | P0 | Schedule: popupPos persist across slots + refresh |
| **C-127** | P0 | Analytics: Studio-like per-module menu; RL Trainer + HITL «Согласовано» |
| **C-128** | P1 | Retention: % at 15s via fraction |

### Recommended chain (full-queue, один проход)

```text
Тренер (done) → Архитектор (spec + chain.md C-122…C-128)
  → Frontend (C-122 → C-123 → C-124+C-125 → C-126 → C-127+C-128)
  → Motion (mesh density / dashed edges / barbell badge)
  → Backend (опц. RL approve + retention at15 types; mock OK)
  → AI Bridge (опц. Trainer proposals feed)
  → Тестировщик (guards S32–S35)
  → Фиксер → Деплоер localhost
  → Клиент (Playwright HARD S33 mesh; S32/S34/S35)
```

Не параллелить overlapping paths: mesh (C-124+125) один path; analytics (C-127+128) последовательно; schedule C-126 отдельно от mesh.
