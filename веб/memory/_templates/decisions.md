# Decisions — C-{{xx}}

## Git anchors

| Anchor | SHA | When |
|--------|-----|------|
| **before_sha** | `{{git rev-parse HEAD}}` | Старт работ по тикету / волне |
| **after_sha** | | После закрытия (опционально) |

## Role log

| Time | Role | Action | Result |
|------|------|--------|--------|
| | Architect | spec+chain | |
| | Backend | … | |
| | … | | |

## Rollback plan

1. `git checkout {{before_sha} -- <paths>` или `git revert` диапазона коммитов волны.
2. `status.md` → `rolled_back`; строка в `_index.md`.
3. Папку `memory/tickets/C-xx-slug/` **не удалять**.
4. Localhost пересобрать / синхронизировать по `docs/AGENT_SYNC_TO_APP.md`.
