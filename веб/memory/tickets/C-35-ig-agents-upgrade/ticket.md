# C-35 — Upgrade Researcher + Analyst for live Instagram carousels

| Field | Value |
|-------|-------|
| **ID** | `C-35` |
| **Priority** | P0 |
| **Wave** | W-2026-09-20-live-ig-carousels |
| **Status** | client: ПРИНЯТО С ЗАМЕЧАНИЯМИ (2026-09-20) |

## Expected

1. Апгрейд инструкций **Researcher** и **Analyst** (`agents/`, `workers/`, skill `content-pipeline-agents`): умеют работать с **реальными** каруселями IG (наши + конкуренты), а не только с mock fixtures.
2. Конфиг хендлов: наш аккаунт `mosarmclub` + список competitor usernames (env / data config, без секретов в git).
3. Razbor Analyst опирается на **реальные** likes/views/comments/slide count когда feed `sourceMode=live`; mock-копирайт только при fallback.
4. Промпты версионированы; без логирования токенов.

## Spec

- `architect-spec.md` · `chain.md` · `status.md` · `decisions.md`
- Next: **AI Bridge** → Tester → Fixer → Deployer → Client
- Then unlock C-36.

## Notes

Зона: AI Bridge (+ `prompt-engineering`, `content-pipeline-agents`). Код fetch API — **не** здесь (C-36). UI — C-37.
