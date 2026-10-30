# Trainer grade — 2026-10-08-ux-wave5

## План хода

- Запрос: волна **UX-5** — правки после приёмки UX-4 (Studio hover, Mesh MultiButton, Schedule sticky modal, Settings Design/TOC/Platforms/Agents).
- `ticket_limit:` **full-queue** (пользователь ранее снял лимит ≤3; всю очередь волны одним проходом).
- Режим: UI / Mesh / Settings — усиление команды до кода.
- Роли по chain: Тренер → Архитектор → Frontend (+21st / Motion) → Backend (platforms ping, optional) → Тестировщик (S28–S31) → Фиксер → Деплоер → Клиент.
- Контекст: UX-4 (C-76…C-81) принят с замечаниями; это gap-волна после «не то»/доработок.
- MCP: Playwright / chrome-devtools / 21st — без платных MCP.
- Secrets: platform tokens / LLM keys только `.env` / secure store.

## Грейд: A

До усиления этого хода: **C** — критичные пробелы знания в skills:
- нет канона «sticky modal закрывается только Save/Cancel»;
- Design всё ещё «textarea + upload» (wave4), не filename-only;
- Mesh всё ещё ориентирован на CompactMultiButton;
- Platforms без ping green/red; Agents без dual MultiButton.

После апгрейда skills/gap-playbook/scenarios/architect locks: **A** — команда готова к full-queue.

### По ролям

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Frontend (`content-factory-ui`) | A | C-82…C-87 канон в skill |
| Mesh (`xyflow-agent-mesh`) | A | Expanded MultiButton + title parity |
| Motion (`web-motion-engine`) | A | Sticky modal Save/Cancel + TOC |
| Architect | A | Path lock C-82…C-87 |
| Client scenarios | A | S28–S31 |
| Backend | A | Platforms ping optional; не блокер UI mock |
| MCP / registry | A | Без дыр |

## Пробелы (код — закрывает волна, не Тренер)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Серый stock outline на hover плиток Launchpad | FE | code | P1 |
| 2 | Mesh Compact collapse; title ≠ стиль «Студия» | FE + Mesh | code | P0 |
| 3 | Schedule: floating spam / transparent popup / leave-close / rail `4:5 · PNG` | FE + Motion | code | P0 |
| 4 | Design textarea+Save/Reset; нет Floating Motion TOC | FE | code | P0 |
| 5 | Platforms enabled checkbox вместо ping green/red | FE (+ BE ping) | code | P1 |
| 6 | Agents tab pills вместо dual MultiButton | FE | code | P1 |

Роли/registry/MCP: без дыр. Data-safety: не трогать Postgres/Redis/медиа.

## Что добавлено этим ходом

- `content-factory-ui` — § Module tiles hover; Mesh MultiButton UX-5; Design filename+upload + Floating TOC; Platforms ping; Agents dual MultiButton; Schedule sticky modal C-84; Do-not list wave5.
- `xyflow-agent-mesh` — MultiButton expanded + title parity + checklist.
- `web-motion-engine` — sticky modal Save/Cancel; Settings Floating Motion TOC.
- `client-scenarios` — S28–S31.
- `architect` SKILL — lock table C-82…C-87.
- `gap-playbook` — 6 строк симптомов UX-5.
- `plugins/trainer/PLUGINS.md` — описание content-factory-ui wave5.
- Этот артефакт.

## Вердикт

Команда готова к волне: **да**  
`ticket_limit: full-queue`

### Proposed tickets C-82…

| ID | P | Scope | Scenario |
|----|---|-------|----------|
| **C-82** | P1 | Studio: убрать серый stock-контур hover на плитках модулей | S28 |
| **C-83** | P0 | Mesh: MultiButton раскрытый, по центру; «Команда выпуска» = стиль «Студия» | S28 |
| **C-84** | P0 | Schedule: один opaque sticky Save/Cancel; DnD без floating spam; без rail badges `4:5 · PNG`; time/platform не закрывают | S29 |
| **C-85** | P0 | Settings Design: filename + upload only; Floating Motion TOC справа; без textarea/Save/Reset | S30 |
| **C-86** | P1 | Settings Platforms: «Проверить подключение» + green/red (не enabled checkbox) | S31 |
| **C-87** | P1 | Settings Agents: две MultiButton (content-type + agent), не tab pills | S31 |

### Proposed chain (full-queue, без нарезки на пачки)

`Архитектор (spec+chain C-82…C-87) → Frontend (+ 21st-ui-catalog, Motion) → Backend (platforms ping mock/API) → Тестировщик (S28–S31) → Фиксер → Деплоер localhost → Клиент`

Path lock:

1. **C-82** ∥ **C-83** — можно параллельно (Studio vs Mesh, разные paths)
2. **C-84** — Schedule (отдельный path)
3. **C-85 → C-86 → C-87** — последовательно в SettingsShell (не overlap)

Не резать на UX-5a/5b. После guards всей шестёрки — приёмка Клиента.
