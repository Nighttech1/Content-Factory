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

## Integrated preflight и build-time fonts

- После интеграции Backend+Frontend `npx tsc --noEmit --pretty false`: exit 0 (`work/growth_center_final_tsc.log`). Повтор после fonts/mobile-nav тоже exit 0.
- Штатный `npm run build` (Turbopack) сначала выявил внешний блокер `next/font/google`: Node build не получил Google Fonts. Повтор с `NODE_USE_ENV_PROXY=1` дал тот же результат; проверки не отключались.
- По явному согласованию root `app/layout.tsx` переведён на `next/font/local`, с сохранением обоих CSS variables и семейств. Existing Noto Sans Armenian WOFF2 проверен как variable 100–900 с Armenian cmap. JetBrains Mono variable TTF скачан из официального google/fonts repo, lossless-конвертирован в WOFF2 fontTools/Brotli без subsetting; проверены family, ось 100–800, Latin/Cyrillic cmap. OFL обоих семейств и `public/fonts/FONT_SOURCES.md` добавлены. Century Gothic UI не изменён.
- SHA256 JetBrains WOFF2: `11234bfa4599dc8c1bfd240e05c31cd488af84392c2206b1a2bf703eda276177`; existing Noto WOFF2: `b1383deb37e5093907936b5e09cb92a3072f2a358b7bc1b555ccd520ce3d0969`.
- Local-font Turbopack build не завершён: exec-server transport disconnected; при recovery изменился executor key, процесс исчез и лог обрывается на compiling. Exit code отсутствует; это не успешный build и не доказанный дефект кода. Для проверяемой production-сборки запущен обычный `npx next build` (Webpack) с теми же проверками. Итог фиксируется отдельно после завершения.

### Webpack build обнаружил дополнительные реальные release blockers

`npx next build` успешно скомпилировал production code за 67 секунд, затем завершился exit 1 на ESLint (не транспортная ошибка):

- `GrowthCenter.tsx:86` и `GrowthDashboard.tsx:92`: внутренние ссылки на `/studio` должны использовать Next Link. Передано Frontend, его lock сохранён.
- Три inherited `prefer-const`: `art-director-final.ts` findings, `layout-qa.ts` left, `renderer.ts` afterLogo. Исправлены на const без изменения поведения. Повтор целевого `npx eslint` exit 0; 0 errors, 4 старых warnings unused imports.

Standalone server.js пока не создан: полного успешного production build ещё нет. Нельзя считать source checkpoint `392cebd` QA-ready до включения этих lint fixes и повторного build. Проверка typecheck сама по себе не гарантировала production release — новый build выявил следующую причину, она исправляется без выключения ESLint.

### Перед финальным cached build

Frontend заменила внутренние mobile navigation anchors в GrowthCenter/GrowthDashboard на `next/link` без suppress. Совместный целевой ESLint по обоим FE файлам и трём inherited fixes прошёл exit 0 (0 errors, 6 warnings) — `work/growth_center_lint_release_fix.log`. По поручению root запущен один повторный cached Webpack build после установленных конкретных fixes; не является беспричинным повтором проверок.

### Финальный production build — PASS

После Next Link и трёх prefer-const исправлений `NEXT_TELEMETRY_DISABLED=1 npx next build` (Webpack) завершился **exit 0**. Сборка реально выполнила compile, ESLint/type checking, generating static pages 15/15, page optimization и tracing. `.next/standalone/server.js` существует и непустой; standalone bundle ~109 MB. В route table присутствуют `/growth` (static) и `/api/growth-center` (dynamic), старый `/marketing` сохранён. Лог: `work/growth_center_production_build_webpack_final.log`.

Штатный Turbopack не объявляется локально прошедшим: его self-host запуск потерял execution transport; production build проверен именно обычным Webpack без отключения lint/types. GitHub QA обязан отдельно выполнить исходный `npm run build` и real browser suite на сохранённом immutable SHA до deploy.
