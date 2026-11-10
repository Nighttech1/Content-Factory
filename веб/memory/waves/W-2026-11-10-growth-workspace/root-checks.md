# Интеграционная проверка root до CI

10.11.2026, Москва. Проверки root не подменяют независимые Tester/Client.

- `npm run build` в веб: exit0, Turbopack production build PASS, compile/typecheck/static generation complete. В выводе сохраняются прежние warnings unused eslint-disable других разделов; относящиеся к волне targeted lint проверены авторами отдельно.
- `node --import tsx scripts/test-growth-center.ts`: 38 legacy v2 guards PASS.
- `node --import tsx memory/waves/W-2026-11-10-situation-center/tester-contract-boundaries.mjs`: 11 прежних независимых границ PASS.
- Legacy model.ts/canonical JSON/marketing page не изменены; /marketing chat history/store не удалялись. Visible Director nav/prefetch удалены по новому явному поручению.
- Local browser readiness реально проверена: installed Playwright default browser отсутствует; системный Chromium запуск завершился socket()EPERM/ptraceEPERM. Отсутствие live localhost browser не выдаётся за PASS; true browser выполняется QA-only Actions на том же source bundle через изолированный HTTPS loopback.
- Git конфигурация VPS, owner secret и scheduler не проверялись/не настраивались. Настоящие Git requests/scoutsearch/paidAPI/production не запускались. Code/docs push и QA marker не равны release marker.

Финальное browser/desktop/mobile решение принимается по actual CI evidence и независимому Клиенту, не по этой локальной сборке.
