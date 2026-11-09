# Release Fixer — inherited build blockers

Исполнитель: реальный субагент Release Fixer (после Архитектора). Дата: 09.11.2026. Before SHA: `1ea460c`.

## Устранённые причины

- `logo-bake.ts`: исходный readFile Buffer и результат tint имеют разные generic buffer types в текущем Node typings. Разделены immutable original/tinted buffers; hash по-прежнему от исходного файла, изображение от tinted buffer.
- `orchestrator.ts`: удалён лишний `verdict` в вызове `writeAdVerdictLog`; сама функция уже выводит verdict из `canFinalize`, поэтому смысл логирования не изменён.
- `research-agent.ts`: map callback контекстно типизирован как ResearchClaim, допустимый source_type остаётся закрытым union.
- `scriptwriter.ts`: fallback массив проверяется `satisfies VernatunSlideScript[]` до slice, поэтому image_need.kind сохраняет допустимые literal значения. Не добавлены any/casts, slice и содержание не изменены.
- `web-research.ts`: enriched использует точный `ResearchSourcePack['hits']`, поддерживающий как snippet-only, так и opened/excerpt результаты.
- Старые smoke scripts переведены на текущие узкие типы: production normalizer для legacy body role; draw вместо недопустимого generate; Sprint8 API status lowercase; UserAssetRecord fixture содержит реальные обязательные metadata поля; script-only Razbor cascade не должен создавать draft до Designer.
- Исторические guard expectations из старых visual waves (7 pipelines, 88/176px, bottom-right, 120/3 richness) **не объявлены актуально прошедшими** и не переписаны на текущие значения ради зелёного результата. Number/String widening сохраняет прежний runtime assert, устраняя только TypeScript compile-time no-overlap. Они остаются историческими проверками со старыми ожиданиями; общий typecheck их не исключает.
- package-lock синхронизирован с уже объявленным `sharp:^0.34.4` (resolved 0.34.5 вместо ошибочного lock 0.35.4); package.json не ослаблен и диапазон не расширен.
- По согласованию Deployer добавлен `output:'standalone'` в next.config.ts; отсутствие standalone bundle пока не объявляется успехом до production build.

## Выполненные проверки

1. Исходный baseline: 25 TypeScript ошибок в work/baseline_tsc.log.errors.
2. `npx tsc --noEmit --pretty false` после фиксов: exit 0, work/release_tsc_after.log.
3. `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`: exit 0, синхронизирован только dependency lock соответствующего пакета.
4. `npm ci --ignore-scripts --no-audit --no-fund`: exit 0, 609 packages/36s, work/release_npm_ci.log.
5. `npx prisma generate`: exit 0, Prisma Client 6.19.3, work/release_prisma_generate.log; миграции БД не выполнялись.
6. Повтор `npx tsc --noEmit --pretty false` после clean install/generate: exit 0, work/release_tsc_clean.log. Это состояние до завершения интеграции Центра роста, после неё требуется финальный прогон.
7. `node --import tsx scripts/test-vernatun-carousel-unit.ts`: **63 passed, 0 failed**, work/release_carousel_unit.log. Проверяется затронутый карусельный код и fixture без платных API.

Обычный `npm run test:vernatun` остановился до выполнения теста: tsx CLI пытается создать AF_UNIX IPC в /tmp, среда запрещает socket/listen. `node --import tsx` исполняет тот же тест без CLI IPC; исключений/отключённых assertions нет.

## Открыто до integration gate

Финальный full typecheck и production build после готового Backend+FE; наличие `.next/standalone/server.js`; runtime/UI acceptance и release отдаются root/Deployer. No commits, no production mutation выполнены этим исполнителем.
