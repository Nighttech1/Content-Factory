# Chain — C-s8-01-schema

> Wave chain: `memory/waves/W-2026-10-15-sprint8-postgres/chain.md` step 2

| Step | Role | Paths | Status | Done when |
|------|------|-------|--------|-----------|
| 1 | Backend | `prisma/schema.prisma`, `prisma/migrations/*` | [x] | Additive models; no reset/DROP; migrate SQL ready (deploy blocked: DB unreachable) |
| 2 | Tester | smoke migrate + schema inspect (часть C-s8-07 / early check) | [ ] | Tables exist; old data intact |
| 3 | Fixer | only if migrate fails | [ ] | Green |

**Next:** C-s8-02 (не начинать API до зелёной schema).
