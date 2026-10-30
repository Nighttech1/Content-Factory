# Домен: Vernatun Content Factory

Модульная AI-фабрика контента для армянского клуба (Human-in-the-Loop).

## Источники правды

| Документ | Зачем |
|----------|--------|
| `ARCHITECTURE.md` | Экраны, токены, SDK, Prisma, стек |
| `DEV_PLAN.md` | Живой план: 1–7 ✅ · 8 Postgres ✅ · **9 = карусели+рилсы IG/YT (качество как Claude Code)** · 22 publish · **23 остальные модули**; UI shell freeze |
| `docs/PROMPT_AUDIT_CAROUSEL_FULL.md` | Полный текст промптов Create-карусели (аудит vs Claude chat) |
| `stitch_armenian_club_brandbook/` | HTML-эскизы Stitch + DESIGN.md |

## Экраны

1. `/admin/mesh` — Owner-only Agent Mesh (`@xyflow/react`), **отдельный пайплайн на каждый вид контента Студии** (7 вкладок)
2. `/studio` — Студия (заголовки RU: Студия / Каналы рендера)
3. `/studio/[moduleId]` — рабочая страница канала: Наши (Опубликовано/Черновики) + Конкуренты + Разбор
4. `/studio/inspect/:id` — HITL Inspector
5. `/analytics` — KPI + Analyst insights
6. `/schedule` — календарь слотов + справа модули и готовые посты с датой

Приёмка **W-2026-10-06-factory-parity** (Клиент, 2026-10-06): C-52 / C-53 / C-54 закрыты на localhost. Хвосты P3: C-55, C-56.

## Модули

carousel-engine · aesthetic-graphics · cartoon-reels · heygen-reels · + plugin slot

## Команда

См. `.cursor/registry/agents.md`. Цикл: `docs/CLIENT_ORCHESTRATOR_CYCLE.md`.

## Агенты-работяги пайплайна

Операционные skills контент-воркеров (не Cursor-команда разработки): [`workers/`](../../workers/README.md) · реестр [`workers/_index.md`](../../workers/_index.md) · brand lock карусели [`workers/_shared/brand-lock.md`](../../workers/_shared/brand-lock.md).

## Не путать

Skills/правила с пометкой Sputnik/Cortana/Flutter — legacy из шаблона команды. В chain фабрики не включать без явного ТЗ.  
`.cursor/skills/` = разработка продукта; `workers/` = производство контента по джобам.
