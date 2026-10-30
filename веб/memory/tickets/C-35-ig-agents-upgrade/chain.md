# Chain — C-35

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** **C-35** → C-36 → C-37.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | `agents/researcher.md`, `agents/analyst.md`, `workers/researcher/SKILL.md`, `workers/researcher/PLUGINS.md` (if touch), `workers/analyst/prompt.md`, `workers/analyst/VERSION.md`, `workers/analyst/SKILL.md`, `.cursor/skills/content-pipeline-agents/SKILL.md`, optional copy-only branch notes in `lib/studio/razbor-pipeline.ts` (`buildAnalystMessages` live/mock strings — **no fetch**) | [x] | Skills: `ai-bridge`, `prompt-engineering`, `content-pipeline-agents`. No Graph client. No secrets in files. Packs `researcher@v2` / `analyst@v2`. Additive optional `FeedPost` live fields + `buildAnalystMessages` branch. |
| 2 | Tester | `memory/tickets/C-35-ig-agents-upgrade/guards.md` | [x] | GREEN: packs live/mock + analyst@v2 + researcher@v2 + skill Graph/BD + secret scan clean; smoke `scripts/smoke-c35-ig-agents.ts` + C-30 regression |
| 3 | Fixer | _(если красное)_ | [ ] | Surgical prompt/skill only |
| 4 | Deployer | localhost N/A for docs-only — skip restart unless `razbor-pipeline.ts` changed | [x] | Probed `:3000` healthy (200); feed `sourceMode:mock`; no restart; no VPS |
| 5 | Client | приёмка пакета агентов (док + контракт) | [ ] | Не блокирует C-36 код, но C-36 не стартует до Done AI Bridge + Tester green |

Skills: `ai-bridge`, `prompt-engineering`, `content-pipeline-agents`.  
Backend / Frontend / Motion — **не** в этом тикете.
