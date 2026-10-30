# Chain — C-38

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-35 live/mock agent rules.  
> **Порядок волны:** **C-38** → C-39 → C-40.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | `agents/researcher.md`, `workers/researcher/SKILL.md`, `workers/researcher/VERSION.md` (bump if applicable), `.cursor/skills/content-pipeline-agents/SKILL.md` | [x] | Topic→hashtags JSON; empty defaults; deprecate `IG_COMPETITOR_USERNAMES` as primary; no scrape; **no Graph fetch code** |
| 2 | Tester | `memory/tickets/C-38-topic-hashtag-agents/guards.md` | [x] | Contract present in packs; BD marked fallback; no scrape wording; fixtures/docs only; `scripts/smoke-c38-topic-hashtags.ts` GREEN |
| 3 | Fixer | _(если красное)_ | [ ] | Pack/skill only — no product architecture change |
| 4 | Deployer | localhost | [x] | 2026-09-21 — `npm run dev` up; feed 200 (competitors[]); topic=гостевой 200; `/studio/carousel-engine` 200; no VPS |
| 5 | Client | приёмка | [x] | 2026-09-21 — wave ПРИНЯТО С ЗАМЕЧАНИЯМИ (live token note) |

Skills: `ai-bridge`, `content-pipeline-agents`, `prompt-engineering`.  
**Не звать:** Frontend, Backend, Motion, Coder (монолит). Backend util — **C-39**.
