# Организация команды — Content Factory

> Always-apply (суть в корневом `CLAUDE.md`). Нативный слой Claude Code: `.claude/`.

Карта: `docs/TEAM_ARCHITECTURE.md`. Реестр: `.claude/registry/agents.md`.
Цикл: `docs/CLIENT_ORCHESTRATOR_CYCLE.md` + `.claude/prompts/start-client-orchestrator-cycle.md`.
Архитектура продукта: `ARCHITECTURE.md`. План спринтов: `DEV_PLAN.md`.
База знаний: `knowledge/` (универсальная) + `knowledge/area_content_factory/` (домен).

## Два контура

1. Инженерный: Оркестратор → Архитектор → специалисты → Тестировщик → Фиксер → Деплоер
2. Приёмка: Клиент (снаружи команды, финальный вердикт пользователю)

**Пользователь общается только с Клиентом.** Команда сдаёт работу Клиенту → тикеты → доработка → «согласовано» → финал пользователю словами Клиента. Отчёт хода — отдельный блок `📋 ОТЧЁТ КОМАНДЫ` (все агенты + Клиент построчно). Детали — корневой `CLAUDE.md` → «Единая точка общения» + «Прозрачность ролей».

## Базовая команда Оркестратора

Клиент, Оркестратор, Архитектор, Фронтендер, Motion, Бекендер, AI Bridge, Кодер, Тестировщик, Фиксер, Деплоер, **Тренер**.

Профиль по умолчанию: **Content Factory** (Next.js 15 App Router, React 19, Tailwind v4, @xyflow/react, Remotion, Prisma/Postgres, BullMQ/Redis, SSE, HeyGen).

**UI-каталог:** Frontend сам подбирает паттерны с **21st.dev** (MCP `21st` + skill `21st-ui-catalog`) без участия пользователя — после настройки `API_KEY_21ST`.

**Тренер** (канон Business Management `committee/trainer`): шаг 0 волны — грейд A–D готовности skills/rules; сам дописывает пробелы; не вместо Frontend/Клиента.

## Skill-first

Каждая роль читает:
1. своё `.claude/rules/<role>.md`
2. `SKILL.md` из `.claude/skills/` (нативно видны в меню skills)
3. плагины `plugins/<role>/` если есть
4. оболочку `knowledge/engineering/roles/<role>.md`
5. `knowledge/area_content_factory/` текущего проекта
6. толстые `knowledge/engineering/sources/` — только если скилла мало

Не открывать все PDF/sources «на всякий случай».

## Расширяемость

Чеклист нового агента:
1. `.claude/rules/<role>.md`
2. `.claude/skills/<name>/SKILL.md`
3. запись в `.claude/registry/agents.md`
4. оболочка `knowledge/engineering/roles/<role>.md` при необходимости
5. для Motion — `motion` rule + `web-motion-engine`

После регистрации агент — часть команды Оркестратора. Подключать только когда задача этого требует.

## Журнал memory/

Шаблоны: `memory/_templates/`. Инженеров звать только при `chain.md`. Закрытие `C-*` только с guard. Папки тикетов после done не удалять.
