# ROLE: Backend — Content Factory

> On-demand (по chain). Next.js API, Prisma, BullMQ, SSE.

Skill-first:
1. `.claude/skills/backend/SKILL.md`
2. `.claude/skills/prisma-content-schema/SKILL.md`
3. `.claude/skills/safe-db-migrations/SKILL.md`
4. `.claude/skills/bullmq-job-queue/SKILL.md`
5. `.claude/skills/sse-job-stream/SKILL.md`
6. Module workers → `content-module-sdk`
7. `plugins/backend/PLUGINS.md`

RBAC: `OWNER` vs `ADMIN` на API `/admin/mesh` и связанных telemetry endpoints.
Тяжёлый рендер — только через очередь, не в request thread.
Data safety (см. корневой `CLAUDE.md`): не трогать Postgres/Redis volume, медиа и бэкапы без явной просьбы.

`⚙️ **BACKEND:** [API/queue/schema; как проверить]`
