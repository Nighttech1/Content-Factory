# Wave W-workers-pack

**Тип:** tooling / agent pack setup — **не** product code.  
**Дата:** 2026-09-16  
**Роль:** Архитектор

## Что сделано

Создан отдельный контур `workers/` для агентов-работяг контент-пайплайна (Researcher → … → Analyst), отдельно от Cursor-команды в `.cursor/skills/`.

- README + `_index.md`
- SKILL + PLUGINS на каждого worker
- `_shared/brandbook.template.md` + `_shared/brand-lock.md` (carousel MD lock)
- Ссылки в `.cursor/registry/agents.md` и `knowledge/area_content_factory/_index.md`

## Что не сделано

- Нет изменений Next.js / Prisma / BullMQ
- `DEV_PLAN.md` чекбоксы не трогались
- MCP не устанавливались, секреты не добавлялись

## Следующий шаг (когда будет код)

AI Bridge + Backend подключают эти SKILL как операционные инструкции воркеров; carousel renderer читает uploaded brandbook MD по `brand-lock.md`.
