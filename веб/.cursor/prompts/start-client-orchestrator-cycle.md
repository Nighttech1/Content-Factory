# Старт цикла Клиент ↔ Оркестратор — Content Factory

Вставь это в новый чат проекта.

```text
Прочитай docs/CLIENT_ORCHESTRATOR_CYCLE.md и запусти цикл Клиент↔Оркестратор до «согласовано».

Сначала физически прочитай:
- .cursor/rules/team-org.mdc
- .cursor/rules/orchestrator.mdc
- .cursor/registry/agents.md
- ARCHITECTURE.md
- DEV_PLAN.md
- .cursor/rules/client.mdc
- .cursor/rules/architect.mdc
- .cursor/rules/frontend.mdc
- .cursor/rules/motion.mdc
- .cursor/rules/backend.mdc
- .cursor/rules/ai-bridge.mdc
- .cursor/rules/tester.mdc
- .cursor/rules/fixer.mdc
- .cursor/rules/deployer.mdc
- .cursor/rules/trainer.mdc
- knowledge/area_content_factory/_index.md

Используй библиотеку команды:
- skills: .cursor/skills/ (обязательно доменные: content-factory-ui, xyflow-agent-mesh, content-module-sdk, remotion-pipeline, heygen-avatar, bullmq-job-queue, prisma-content-schema, sse-job-stream, content-pipeline-agents; при онбординге/UI-волне — **trainer**)
- MCP: playwright, playwright-iphone, playwright-android, chrome-devtools, image-compare, a11y, lighthouse
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

Если в .cursor/registry/agents.md или .cursor/skills/ появился новый агент — он в команде. Подключай по необходимости.
```
