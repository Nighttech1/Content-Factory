# Chain — C-41 Meta OAuth Connect

Порядок **строгий**. Без завершения шага N не стартовать N+1. Overlapping paths не параллелить.

| Step | Role | Skills / notes | Paths (ориентир) | Done when |
|------|------|----------------|------------------|-----------|
| 0 | **Архитектор** | этот spec | `memory/tickets/C-41-meta-oauth-connect/*` | [x] spec + chain |
| 1 | **Backend** | `backend`, OAuth server-only, data-safety | `app/api/meta/oauth/*`, `lib/meta/*`, `.env.example` | [ ] start/callback/verify; token не в JSON; long-lived page token + IG id |
| 2 | **Frontend** | `content-factory-ui`, `21st-ui-catalog`, `responsive-mobile-web` | `app/.../meta-connect/*`, компоненты мастера | [ ] OWNER UI шаги S-Meta-1…5; без поля пароля |
| 3 | **Тестировщик** | `tester`, playwright сценарии | `memory/tickets/C-41-.../guards.md`, smoke | [ ] guards G1–G8 green (mock Meta / fixture callback) |
| 4 | **Фиксер** | `fixer` | только fail paths | [ ] зелёный |
| 5 | **Деплоер** | `deployer` | localhost | [ ] URL мастера открывается |
| 6 | **Клиент** | `client-scenarios`, `client-review` | приёмка | [ ] вердикт |

## Не звать в этой волне

- Motion (достаточно простых переходов; не Remotion).
- AI Bridge.
- Монолитный Кодер вместо Backend+Frontend.

## Docs в рамках Backend или Frontend (коротко)

`docs/META_CONNECT.md` — чеклист для друга клуба (Meta App, Page, IG Business, Tester role).
