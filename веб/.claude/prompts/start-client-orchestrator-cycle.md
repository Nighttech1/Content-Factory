# Старт цикла Клиент ↔ Оркестратор — Content Factory

Вставь это в новый чат проекта (Claude Code сам читает `CLAUDE.md`, но явный запуск удобен).

```text
Прочитай docs/CLIENT_ORCHESTRATOR_CYCLE.md и запусти цикл Клиент↔Оркестратор до «согласовано».

Сначала физически прочитай:
- CLAUDE.md
- .claude/rules/team-org.md
- .claude/rules/orchestrator.md
- .claude/registry/agents.md
- ARCHITECTURE.md
- DEV_PLAN.md
- .claude/rules/client.md
- .claude/rules/architect.md
- .claude/rules/frontend.md
- .claude/rules/motion.md
- .claude/rules/backend.md
- .claude/rules/ai-bridge.md
- .claude/rules/tester.md
- .claude/rules/fixer.md
- .claude/rules/deployer.md
- .claude/rules/trainer.md
- knowledge/area_content_factory/_index.md

Используй библиотеку команды:
- skills: .claude/skills/ (обязательно доменные: content-factory-ui, xyflow-agent-mesh, content-module-sdk, remotion-pipeline, heygen-avatar, bullmq-job-queue, prisma-content-schema, sse-job-stream, content-pipeline-agents; при онбординге/UI-волне — **trainer**)
- live-браузер: встроенный браузер (desktop @1440 + mobile preset), console/network; MCP из .mcp.json если поднят
- субагенты: .claude/agents/ (art-director, trainer)
- plugins: plugins/ ролей команды (в т.ч. plugins/trainer)
- knowledge: knowledge/engineering/ и knowledge/area_content_factory/
- эскизы: stitch_armenian_club_brandbook/

Цикл:
1. Клиент: цель / приёмка / тикеты C-*
2. Оркестратор: волна ≤3 по умолчанию (full-queue если пользователь снял лимит) — **сначала Тренер (грейд)** → Архитектор → специалисты по DEV_PLAN
3. Архитектор: architect-spec + chain.md до кода
4. Специалисты по chain (Frontend / Motion / Backend / AI Bridge)
5. Тестировщик + guards (в т.ч. RBAC /admin/mesh, армянские шрифты)
6. Фиксер до зелёного
7. Деплоер localhost (VPS только после Клиента без P0/P1 и согласования)
8. Клиент снова; пока не «согласовано»

Если в .claude/registry/agents.md или .claude/skills/ появился новый агент — он в команде. Подключай по необходимости.
```
