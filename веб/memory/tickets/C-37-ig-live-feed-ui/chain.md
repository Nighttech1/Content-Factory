# Chain — C-37

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-36 Done (Backend + Tester green).  
> **Порядок волны:** C-35 → C-36 → **C-37**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/workspace/*` (Feed columns, `FeedPostCard`, badge), `RazborModal.tsx` (if present), `lib/studio/razbor-pipeline.ts` (`buildCompetitorSlides` + Analyst input already typed), `StudioModuleWorkspace.tsx` / feed fetch types, any `feed` client types under `lib/studio/` | [x] | Skill: `content-factory-ui`. Wire live contract; badge `feed-source-badge`; no browser Graph calls; no secrets. NeonBadge reuse (no 21st). |
| 2 | Motion | Razbor / carousel slides **only if** regressions | [x] | Skipped — existing C-30 enter/slide motion untouched; variable `slideUrls` length uses same carousel chrome |
| 3 | Tester | `memory/tickets/C-37-ig-live-feed-ui/guards.md` | [x] | GREEN (re-verified): smoke-c37 + C-30/C-36/C-35 mock; badge + slideUrls + no client secrets |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical UI/pipeline only |
| 5 | Deployer | localhost `:3000`; refresh local API/app after build | [x] | `/studio/carousel-engine` 200; feed mock OK; no restart; no VPS |
| 6 | Client | приёмка UX S-carousel live | [ ] | Hard reject if crash without token or picsum still used when live `slideUrls` present |

Skills: `content-factory-ui`; Tester guards live/mock + no secrets.  
Backend fetch — **not** here (C-36). AI Bridge — **not** here (C-35).
