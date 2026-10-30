# Chain — C-50

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` с незакрытым C-49 на тех же файлах.  
> **Порядок волны:** C-49 → **C-50** → C-51.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/settings/page.tsx`, `lib/settings/reels-display.ts` (new), `components/studio/StudioModuleWorkspace.tsx` (slice after hydrate + after C-49 filter) | [x] | Block «Рилсы»; `cf.reels.pageSize` default 12 clamp 4–48; client slice ours+competitors; **no Backend** |
| 2 | Tester | `memory/tickets/C-50-settings-reels-page-size/guards.md` | [x] | Persist + visible count ≤ pageSize; invalid → 12 |
| 3 | Fixer | _(если красное)_ | [ ] | Surgical |
| 4 | Deployer | localhost | [x] | Verified 200 on /settings + /studio/carousel-engine; no restart needed; no VPS |
| 5 | Client | приёмка | [ ] | Settings → Studio count |

Skills: `content-factory-ui` § Settings Рилсы, `baseline-ui`, `client-scenarios`.  
**Не звать:** Backend, Motion, AI Bridge, Coder monolith.
