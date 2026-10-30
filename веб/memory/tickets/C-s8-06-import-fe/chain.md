# Chain — C-s8-06-import-fe

> Wave steps 7–8. After C-s8-05.

| Step | Role | Paths | Status | Done when |
|------|------|-------|--------|-----------|
| 1 | Backend | `app/api/studio/migrate-local/route.ts` | [x] | Idempotent import |
| 2 | Frontend-minimal | four store/libs (+ optional migrate helper); **не** shell | [x] | SoT=API + one-shot |
| 3 | Fixer | as needed | [ ] | Import + wire smoke |

**Запрет:** два писателя на одни store-файлы. Backend import **до** FE wire.  
**Next:** C-s8-07 Tester.
