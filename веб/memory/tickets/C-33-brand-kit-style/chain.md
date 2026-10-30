# Chain — C-33

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Depends:** C-32 preferred first (wave order).  
> **Порядок волны:** C-32 → **C-33** → C-34.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Backend | `docs/DESIGN.md` (from stitch), `public/brand/vernatun-logo.svg`, `lib/brand/loadBrandKit.ts`, `app/api/brand-kit/route.ts`, `lib/studio/razbor-pipeline.ts` (designer brand consume), optional smoke script | [x] | No secrets; **no DB**; read-only brand pack |
| 2 | Frontend | `app/brand-kit/page.tsx`, optional brand preview helpers in drafts/razbor preview | [x] | Logo + readable DESIGN |
| 3 | Motion | `/brand-kit` light enter (optional) | [x] | Skipped — Backend+FE enough |
| 4 | Tester | `memory/tickets/C-33-brand-kit-style/guards.md` | [ ] | Logo file, API 200, page content, designer uses brand |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost | [ ] | After green; no VPS |
| 7 | Client | приёмка | [ ] | After deploy |

Skills: `backend`, `create-design-md` (if structuring DESIGN), `content-factory-ui`, `brand`. AI Bridge — **не default**.
