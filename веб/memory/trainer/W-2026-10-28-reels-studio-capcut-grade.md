# Trainer grade — W-2026-10-28-reels-studio-capcut

## План хода

- Запрос пользователя: раздел **Reels** в контент-заводе — (1) **CapCut-аналог** редактор, который режет снятые рилсы клуба и добавляет моушн-дизайн/графику; (2) правки пользователя словами → **запоминаются как будущие правила** монтажа; (3) **чат со Сценаристом рилсов как интерфейс Клода**: левый рельс тредов по типам идей + чат; идея→сценарий→съёмка→загрузка исходников в то же окно. Текущий UI модуля можно переделывать.
- Режим: Studio edit-shell (CapCut) + reels-framework (backend есть) + agent-chat workspace. Снятое видео (не cartoon Remotion, не HeyGen).
- Шаг 0 (Тренер): грейд готовности команды по этому разделу, закрыть пробелы skills; продукт не трогаем до Архитектора.

## Что уже есть (команда владеет)

- **Backend/framework — сильно:** `lib/studio/reels-framework/` — agents (creative-director, footage-analyzer, insert-finder, research-mode, revision-manager, script-storyboard), pipeline (timeline-builder, motion/basic-titles, quality-checker, **ffmpeg-render → MP4 1080×1920**), **memory/style-memory** (loop правок→правил: `proposeRuleFromFeedback` / confirm / reject / findConflicts), montage-schema (Zod).
- **API:** `/api/reels` + `[reelId]/{script,sources,inserts,render,revise,analyze}` + `/rules`.
- **UI частично:** `CapCutEditorShell.tsx` (471 стр, но **MOCK_LAYERS/MOCK_CLIPS** — визуальная оболочка, не wired), `ReelsFrameworkPanel.tsx`, `AgentChatComposer.tsx`. `capcut-gate` открыт только для `cartoon-reels`/`heygen-reels`.
- **Скиллы:** `reels-scriptwriter` (драматургия hook/beats/CTA), `remotion-pipeline` (только cartoon), motion-пак, `content-module-sdk`, `bullmq-job-queue`, `sse-job-stream`, `21st-ui-catalog`, `content-factory-ui`.

## Грейд: B (после патчей skills этого хода)

До патчей: **C** — не было skill-владельца NLE-редактора (shell — mock), не было skill оболочки чата-сценариста (как у Клода), не было модуля снятого видео (`club-reels` отсутствует в registry; gate его не пускает). Backend-слой тянет на A, но UX/продуктовый слой раздела не покрыт.

После патчей: **B** — команда может идти к Архитектору. Три новых skill закрывают UX/модуль; backend переиспользуется как есть.

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| reels-timeline-editor (new) | A | CapCut-паритет, wired to MontageProject + ffmpeg; снять mock |
| reels-scriptwriter-workspace (new) | A | Чат как у Клода: треды по типам идей, idea→script→sources→монтаж |
| club-reels-module (new) | A | registry + gate + loop правила; живое видео |
| reels-scriptwriter (контент) | A | Драматургия уже канон (S44/S45/S46) |
| reels-framework backend | A | Есть пайплайн + style-memory + ffmpeg |
| capcut-gate | B | Нужно добавить `club-reels` в allowlist (lock в spec) |
| content-module-sdk | B | Регистрация нового core-модуля |
| 21st-ui-catalog / content-factory-ui | B | Визуал редактора и рельса тредов |
| MCP стек | A | ffmpeg локально; платные MCP не нужны. vidIQ (research идей) / Metricool (публикация) — **опционально**, не блокер |

## Пробелы

| # | Пробел | Роль | Слой | P | Статус |
|---|--------|------|------|---|--------|
| 1 | Нет skill-владельца CapCut NLE (shell = mock) | FE / Motion | skill | P0 | закрыт (`reels-timeline-editor`) |
| 2 | Нет skill оболочки чата-сценариста как у Клода | FE / AI Bridge | skill | P0 | закрыт (`reels-scriptwriter-workspace`) |
| 3 | Нет модуля снятого видео `club-reels` | Backend / SDK | skill | P0 | закрыт (`club-reels-module`) |
| 4 | capcut-gate не пускает снятый модуль | Backend | code | P0 | **lock в spec** (allowlist `club-reels`) |
| 5 | Loop правок→правил не поднят в UX (backend есть) | FE / AI Bridge | code | P1 | **lock в spec** |
| 6 | Точный рендер-wire (BullMQ worker ffmpeg vs inline) | Architect | spec | P1 | **lock в spec** |

## Что добавлено этим ходом

- `.claude/skills/reels-timeline-editor/SKILL.md` — **новый** (CapCut-аналог NLE)
- `.claude/skills/reels-scriptwriter-workspace/SKILL.md` — **новый** (чат как у Клода)
- `.claude/skills/club-reels-module/SKILL.md` — **новый** (модуль снятых рилсов + loop правил)
- `.claude/registry/agents.md` — три записи в таблицу доменных skills

## Рекомендация Оркестратору

Команда **готова** вести раздел Reels. Следующий шаг — Архитектор: `architect-spec.md` + `chain.md` (Архитектор → Backend `club-reels`+gate → AI Bridge сценарист-воркспейс → Frontend редактор+рельс → Motion моушн-слой → Тестировщик → Фиксер → Деплоер → Клиент). MCP-дополнения (vidIQ/Metricool) — по желанию пользователя, не нужны для старта.
