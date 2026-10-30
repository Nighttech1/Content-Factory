### [C-audit-06] Live Scriptwriter Sonnet aggregator 503 → fixture bypass

- **Зона / Экран:** Create / live Scriptwriter path (`anthropic/claude-3.7-sonnet`)
- **Факт:** Deployer live-gen: Scriptwriter call to Sonnet returned aggregator **HTTP 503**; wave used Vernatun fixture JSON for AUDIT-FIX A/B render. Routing config accepted, but **live** Sonnet→JSON→HTML draw path not proven end-to-end.
- **Ожидание:** Live Scriptwriter Sonnet returns valid Dramaturgy JSON (or controlled retry/fallback UX); Client can smoke Create without silent fixture substitution for acceptance of «live Sonnet».
- **Приоритет:** P1
- **Скрин-улика / logs:** `memory/waves/2026-10-16-carousel-audit-fix/deployer.md` (Live Scriptwriter A → 503 → fixture)
- **Зона:** AI Bridge / Backend (provider resilience, error surfacing to UI)
- **Wave:** 2026-10-16-carousel-audit-fix
- **Accept:** One live Create Scriptwriter run with Sonnet success (or explicit user-visible degrade); no silent fixture for Client «LIVE» claim
