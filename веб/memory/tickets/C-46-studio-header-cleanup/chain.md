# Chain — C-46

> Оркестратор зовёт следующую роль только после checkbox.  
> **Motion / Backend / AI Bridge — нет.**  
> Порядок волны: **C-46 → C-47 → C-45**. Не параллелить FE с overlapping paths (здесь path изолирован).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/studio/page.tsx` | [x] | Убрать SPEED / Բարև / Engine Standby chip; оставить h1 + 1 supporting sentence |
| 2 | Tester | `memory/tickets/C-46-studio-header-cleanup/guards.md` | [x] | PASS: нет SPEED/Բարև/Standby/Mock в page.tsx; Launchpad+пояснение; anti-slop OK |
| 3 | Fixer | `app/studio/page.tsx` (если красное) | [ ] | Хирургия только header |
| 4 | Deployer | localhost `:3000` | [ ] | `/studio` HTTP 200; не VPS |
| 5 | Client | приёмка C-46 | [ ] | чистая шапка Launchpad |

Порядок: **Frontend → Tester → Fixer → Deployer → Client**.

**После Done Frontend C-46** → Оркестратор стартует C-47 Frontend (или тот же FE-агент sequential).
