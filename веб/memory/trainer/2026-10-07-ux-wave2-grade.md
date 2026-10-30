# Trainer grade — 2026-10-07-ux-wave2

## План хода

- Запрос: новая UX-волна после приёмки C-63…C-67; пользователь снова недоволен скоростью и хочет крупные продуктовые изменения (не косметика).
- Симптомы: (1) первые клики долгие → реальные замеры + «как обычный сайт»; (2) карусели ×0.5 + плавные слайды; (2.2) Create/Razbor чаты с «передать задание», превью без «Слайд N/N», L/R сбоку, пусто до генерации; (3.1) Mesh только chat-агенты + editable prompt/rules; (3.2) Schedule дата в углу, DnD, hover popup, дата/время справа после drop; (4) удалить Brand Kit; (5–6) Settings: DESIGN.md + блок агентов.
- Режим: UI + Motion + Mesh + Settings + приёмка сценариями; **не** app-код в этом ходе.
- Роли по chain: Тренер (шаг 0) → Архитектор (spec + chain, ≤3 C-* за проход) → Frontend → Motion → Backend (если persist settings/prompts) → Тестировщик → Фиксер → Деплоер → Клиент.
- Skills-фокус: `content-factory-ui`, `web-motion-engine`, `xyflow-agent-mesh`, `content-pipeline-agents`, `21st-ui-catalog`, `client-scenarios`, `gap-playbook`.
- MCP: Playwright / chrome-devtools — живы в `.cursor/mcp.json`; платный MCP не предлагать.
- Контекст «не то»: wave1 (C-63…C-67) закрыла perceived ≤1s / 9:16 / modal / mesh chrome / schedule chrome, но скорость и продуктовый канон не совпали с ожиданием пользователя.

## Грейд: A

До апгрейда skills: **C** — критичный пробел знания: wave2-контракты отсутствовали; конфликт C-59 «публицист без чата» vs запрос; Brand Kit ещё канон в UI skill/S6; нет протокола замеров мс; карточки «огромные» vs нужен ×0.5; Mesh/Settings editable config не описан.

После дописи этого хода: **A** — команда может идти к Архитектору.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет канона «как сайт» + обязательные замеры мс (не «≤1s OK») | Motion + Frontend + Tester | skill | P0 |
| 2 | Карусели ×0.5 + smooth slide; preview empty / no Слайд N/N / L/R сбоку | Frontend + Motion | skill | P0 |
| 3 | Create + Razbor handoff-чаты вкл. Публициста с чатом | Frontend + pipeline | skill | P0 |
| 4 | Mesh: только chat-агенты; editable prompt/rules | Frontend (mesh) | skill | P0 |
| 5 | Schedule DnD + дата в углу + hover popup | Frontend | skill | P0 |
| 6 | Удалить Brand Kit; Settings DESIGN.md + агенты | Frontend (+ Architect persist) | skill | P0 |
| 7 | Сценарии S15–S19 устарели под wave1 | Клиент | skill | P1 |

Роли/registry/MCP/rules: без дыр. Env IG к этой волне не обязателен. Data-safety: не трогать Postgres/Redis/медиа; секреты не в memory.

## Что добавлено этим ходом

- `.cursor/skills/content-factory-ui/SKILL.md` — Nav wave2 + замеры; carousel ×0.5; CreateCarouselModal handoff; Razbor wave2; Schedule DnD; Brand Kit removal; Settings DESIGN.md + агенты; Do not.
- `.cursor/skills/web-motion-engine/SKILL.md` — route budget 300–500ms; smooth carousel slide; schedule DnD/popup motion.
- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — только chat-агенты; editable prompt/rules; checklist.
- `.cursor/skills/content-pipeline-agents/SKILL.md` — Razbor/Create handoff tables; Publisher с чатом; Mesh/Settings sync; Brand Kit → DESIGN.md.
- `.cursor/skills/21st-ui-catalog/SKILL.md` — search tips wave2 (slide, compact reel, DnD calendar, settings editors).
- `.cursor/skills/client-scenarios/SKILL.md` — S6/S11/S15–S17 обновлены; S18–S19 добавлены.
- `.cursor/skills/trainer/gap-playbook.md` — 11 новых строк симптомов wave2.

## Вердикт

Команда готова к волне: **да**
