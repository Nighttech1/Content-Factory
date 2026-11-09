# Guards и состояние приёмки · 09.11.2026

Before SHA f40eb963b4628ee5e8a5ac58f90d70e7630f8e76. Новая surface внутри /marketing, прежний чат/проекты сохранены. Отдельные реальные субагенты: Тренер, Архитектор, исследователь, Backend, AI Bridge, Frontend, независимый Тестировщик/Клиент. Root интегрировала и выполнила локальный запуск. Отдельный Motion и отдельная БД не требовались.

## Подтверждённые результаты

- `node --import tsx scripts/test-growth-model.ts` из веб/: 23 meaningful guards PASS. Независимый tester повторил исходный кейс превышения known ancestor через null: reject, rate null.
- Runtime payload guard через настоящий runMarketingDirectorChat с intercepted fetch: PASS, raw user unchanged, strengthened system reaches model boundary; zero external network/LLM. Полная воспроизводимая команда в ai-bridge-guards.md.
- `python3 shared/skills/marketing-methods/validate.py`: PASS. Anti-slop components/marketing: PASS. `git diff --check`: PASS.
- Full TypeScript: FAIL 25. В отдельном detached worktree before SHA с теми же dependencies получены ТОЧНО ТЕ ЖЕ 25 error headers. Изменённые growth/prompt/page/AppShell новых errors не добавили; этот факт не является зелёной общей сборкой.
- npm ci не прошёл из-за исходного sharp lock mismatch; зависимости установлены npm install --ignore-scripts --package-lock=false. package.json/package-lock не менялись. prisma generate успешно; миграций/БД нет.
- Next dev /marketing в одном sandbox со smoke-client: HTTP200, SSR включает growth-workspace и «Жизненный цикл» (69 459 символов). Процесс остановлен после проверки. Это реальный локальный маршрут, не production.
- Standalone export успешно bundled esbuild из того же GrowthDashboard.tsx + CSS module, 358 885 bytes. Чат в snapshot не имитируется; работает только в приложении.
- DOM simulation этого экспортного bundle в jsdom: PASS render/8 stages/stage switch/tabs/content-stage filter/market/honest snapshot-chat/invalid import no overwrite/valid import persistence. Ни внешних запросов, ни реального browser render. Это functional DOM guard, не visual QA.

## Открытые блокеры

- Live browser desktop/mobile visual acceptance не завершён. CUA Chrome не видит localhost отдельного sandbox (connection refused); локальный Chromium не запускается из-за AF_UNIX policy. file:// в CUA запрещён URL policy, обход не предпринимался. Не считать DOM simulation живым браузером.
- Исходные 25 TypeScript errors в carousel/scripts остаются release blocker; не ослабляли tsconfig/проверки и не правили unrelated pipeline ради зелёного результата.
- Реальные агрегаты бота/CRM/платежей не подключены, initial counts null. Manual import browser-local не автоматическая аналитика. Ценность/конверсия стратегии не измерены.
- Census original XLSX недоступен: широкая база 68 018 Москва/70 199 МО историческая, по вторичным публикациям. SAM покупателей не установлен; сценарии не фактический рынок.

## Вердикт

Код/данные/метод и проверяемый экспорт подготовлены. C-GROWTH-01/03 содержательно реализованы с указанными evidence limitations. C-GROWTH-02 реализован и functional guards прошли, live visual gate открыт. Волну не объявляем принятой, «согласовано» остаётся владельцу. Production deploy, публикация, платные API и внешние сообщения не выполнялись. Следующее — просмотр готового экспорта владельцем, закрытие release/UI blockers и отдельное решение о выкладке.
