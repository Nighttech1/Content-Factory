# Trainer grade — 2026-10-07-ux-wave3

## План хода

- Запрос: новая UX-волна после UX-2; пользователь дал скрин Разбора + MultiButton + правки chrome shell.
- Симптомы: (1) убрать сайдбар «Пайплайны и ноды», «Բարև · Vernatun»; (2.1) Ours+Competitors в одном ряду / mobile по одной; (2.2) убрать dark fade — мгновенная смена слайда; (2.3) Razbor: «Начать разбор» над input, без «Аналитик готов…», MultiButton send/mic/handoff, выровнять высоты; (2.4) сценарист карусели = idea/prompt + handoff «карусель N + текст + цвета», per content-type prompts; (2.5) галка таба только после «передать задание»; (2.6) после дизайн+время → черновики Ours + календарь; (3) убрать mono eyebrows `// Настройки` везде.
- Режим: UI + Motion + pipeline agents + Mesh/Settings config + приёмка; **не** app-код в этом ходе Тренера.
- Роли по chain: Тренер (шаг 0) → Архитектор (spec + chain, ≤3 C-* за проход) → Frontend → Motion → Backend (draft/schedule persist + per-type prompts) → Тестировщик → Фиксер → Деплоер → Клиент.
- Skills-фокус: `content-factory-ui`, `web-motion-engine`, `content-pipeline-agents`, `21st-ui-catalog`, `xyflow-agent-mesh`, `client-scenarios`, `gap-playbook`.
- MCP: Playwright / chrome-devtools / 21st — без платных MCP.
- Контекст «не то»: wave2 канонизировал **плавный** slide и reels-like Scriptwriter contract — это **конфликтует** с wave3 (instant cut + carousel idea/prompt).

## Грейд: A

До апгрейда skills: **C** — критичные пробелы: (a) wave2 smooth slide vs нужен instant/no fade; (b) нет MultiButton канона (`components/ui/multi-button.tsx` ещё не в дереве); (c) Scriptwriter contract = reels script для карусели; (d) сайдбар/mono eyebrows не в Do-not; (e) нет tab-check / draft→calendar контракта; (f) per content-type prompts не в mesh skill.

После дописи этого хода: **A** — команда может идти к Архитектору.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Сайдбар: «Пайплайны и ноды» / «Բարև · Vernatun» | Frontend | skill | P0 |
| 2 | Dual carousel one-row desktop / mobile stack | Frontend | skill | P0 |
| 3 | Instant slide (supersede wave2 smooth fade) | Motion + Frontend | skill | P0 |
| 4 | Razbor MultiButton + layout «Начать разбор» | Frontend (+21st) | skill | P0 |
| 5 | Carousel Scriptwriter idea/prompt + handoff format | AI Bridge / pipeline + Frontend | skill | P0 |
| 6 | Per content-type prompt/rules | Frontend mesh + Backend persist | skill | P0 |
| 7 | Tab check только после handoff | Frontend | skill | P0 |
| 8 | Publisher → draft Ours + `/schedule` date | Frontend + Backend | skill | P0 |
| 9 | Ban mono `//` eyebrows везде | Frontend | skill | P0 |
| 10 | Сценарии S20–S22 под wave3 | Клиент | skill | P1 |

Роли/registry/MCP/rules: без дыр. `multi-button.tsx` — создать Frontend по paste/21st в волне (не Тренер). Env IG к этой волне не обязателен. Data-safety: не трогать Postgres/Redis/медиа; секреты не в memory.

## Что добавлено этим ходом

- `.cursor/skills/trainer/gap-playbook.md` — 9 строк симптомов UX wave3.
- `.cursor/skills/content-factory-ui/SKILL.md` — sidebar wave3; dual-row layout; instant slide; Razbor MultiButton; ban mono eyebrows; Do not.
- `.cursor/skills/web-motion-engine/SKILL.md` — carousel slide wave3 instant (supersedes wave2 smooth).
- `.cursor/skills/content-pipeline-agents/SKILL.md` — carousel idea/prompt contract; handoff format; tab check; Publisher→draft+calendar; per content-type prompts.
- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — prompt/rules per content-type.
- `.cursor/skills/21st-ui-catalog/SKILL.md` — MultiButton + dual feed tips; smooth slide tip устарел.
- `.cursor/skills/client-scenarios/SKILL.md` — S20–S22.
- `plugins/trainer/PLUGINS.md` — указатели wave3.
- Этот артефакт: `memory/trainer/2026-10-07-ux-wave3-grade.md`.

## Вердикт

Команда готова к волне: **да**

### Рекомендуемый chain (для Архитектора)

`Архитектор → Frontend (+ 21st MultiButton) → Motion (instant slide) → Backend (draft/schedule + per-type prompts persist) → Тестировщик (S20–S22) → Фиксер → Деплоер → Клиент`

Лимит Оркестратора: ≤3 тикета C-* за проход; P0 сначала (sidebar+eyebrows / Razbor MultiButton+slide / pipeline handoff+drafts).
