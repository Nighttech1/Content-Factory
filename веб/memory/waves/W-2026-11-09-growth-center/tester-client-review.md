# Независимая QA — Центр роста

Дата: 09.11.2026. Исполнитель: реально вызванный `tester_client`, не автор Backend/Frontend/Deployer. Before SHA: `1ea460c`. Ветка: `codex/director-chatgpt-transfer`.

## До исполнения: критерии владельца и независимые проверки

Это новый scope `/growth`, а не продолжение принятого UI: прежняя волна не имела завершённой live-приёмки. Текущее разрешение владельца допускает deployment только `content.vernatunspeakclub.com` после QA; `admin.*` не цель. Проверки ниже выполняются после handoff готовых файлов.

### A. Семантика и источники

- На карте сначала **Узнать о клубе**, затем **Захотеть прийти**. Нельзя незаметно мигрировать legacy v1 `attraction` в awareness; dataset version 2 и старые /marketing snapshots раздельны.
- Стадия раскрывает сегмент/JTBD/барьер/продукт/ответственного, измеримое событие, следующую операцию и конкретные материалы по V-ID. Верх — желание и внешняя дистрибуция, FAQ является поддержкой заинтересовавшегося.
- Оценки владельца ≈400 TG / ≈800 IG / ≈200 чат / 20–30 активных / максимум 10–12 гостей имеют источник, дату, единицу и ограничения. Их не суммируют в уникальных покупателей и не назначают конкретным встречам как историю.
- Исторические 68 018 / 70 199 не называются текущими покупателями. SAM неизвестен; сценарии и плановые цели не становятся фактом.

### B. План/факт и canonical dataset

- Ровно 24 уникальных редакционных V-ID, существующие `briefPath`. Один материал на нескольких стадиях считается один раз глобально и один раз в каждой соответствующей стадии; сумма стадий не выдаётся за общий выпуск.
- «Сделан файл», review и approved не являются публикацией. Факт выпуска только `published` плюс валидные http(s) permalink, реальная дата и source ref. Published без доказательства должен отклоняться валидатором.
- Targets отдельно от actual: единица, горизонт, approvalStatus, источник основания/допущения и ответственный. Предложенный 14-дневный target не прогноз; 50–60 не переносится молча в 14 дней. 30-дневный return не оценивается как провал через 14 дней.
- Bundled JSON → server loader → page props и read-only API используют одинаковый dataset/revision. Нет тихого fallback в localStorage, mutation endpoint или фиктивного «live sync».
- Ошибки структуры/поля/ID/refs/дат проверяются до показа; PII массивы/контакты не входят в dataset. Неизвестное — `null`, измеренный ноль — `0`.

### C. Независимые boundary-проверки модели

1. Default dataset проходит валидацию, имеет 24 уникальных ID и ноль доказанно опубликованных, если реальные permalink не предоставлены.
2. Добавление одному ID второй stage не увеличивает глобальный total. Дублирующий content ID — validation error.
3. Approved без publication остаётся планом, не фактом. Published без URL/с датой 31 февраля/с будущей датой/с неизвестным sourceId — validation error.
4. Известный descendant не может превышать известного ancestor через `null` промежуточных стадий одной когорты.
5. Разные cohortId/периоды/единицы, неизвестный или нулевой denominator дают неизвестную конверсию с причиной; не NaN/Infinity/0% как fallback.
6. Boolean зрелости не заменяет календарное окно; точная граница returnWindowDays проверяется. Membership — от attendance, advocacy — от repeat, reactivation — от собственной dormant-базы.
7. Series `null` остаётся gap; одна точка не превращается в выдуманную историю. Estimated/measured/scenario точки имеют различимые подписи. Отменённая встреча не превращается в ноль пришедших.
8. Посещения по встречам не называются уникальными людьми за месяц. Переключение метрики/периода выбирает соответствующие записи, а не меняет только заголовок.

### D. Настоящий UI / GitHub Actions

Deployer уведомлён о coverage для `scripts/growth-center-browser-qa.mjs`; Frontend — о стабильных testid/ARIA. Local Chromium AF_UNIX заблокирован, CUA file URL запрещён; обход не используется. `jsdom`, SSR и проверки исходников не называются браузером.

- Навигация «Центр роста» действительно открывает `/growth`; существующий `/marketing` и старый чат доступны, история/проекты не стираются.
- Проверить выбор всех восьми стадий и соответствующие detail/список тем/plan-fact.
- На default данных no-history charts показывают конкретную пустоту и формат необходимых данных, не fake нули и не demo-линии.
- Проверить filters/toggles выбранного этапа и графика посещаемости, подсказки по точке, источники и единицы. Для непустой ветви допустима только изолированная тестовая fixture, явно не production actual.
- Desktop 1440 и mobile 390/360: screenshots, page horizontal overflow, доступность названий/кнопок, клавиатура, reduced-motion, отсутствие блокирующих console errors и платных внешних side effects.
- Статусы publication/API counts/revision согласованы с canonical JSON.

### E. Release gates

- Реальный `npm ci` (включая исправленный sharp lock), полный TypeScript и production build без `ignoreBuildErrors`, исключения старых файлов и ослабления проверок.
- Нужны URL GitHub Actions run, SHA/attempt, exit статусы, браузерный report/screenshots. Изменённый код должен совпадать с QA commit.
- Deployment только после успешного QA; proof — content.* `/growth`, read-only API и revision, навигация/старый чат, healthcheck. Сохранность общей data/медиа/БД и rollback не заменяются словами «сборка зелёная».

## Фактически выполнено после handoff

| Проверка | Результат | Доказательство |
|---|---|---|
| Независимые boundary tests | **20 PASS**, код 0 | `node --import tsx memory/waves/W-2026-11-09-growth-center/tester-boundaries.mjs` |
| Авторские guards, повторённые тестировщицей | 24 PASS на первой готовой версии; после расширения истории final suite исполняет root | `node --import tsx scripts/test-growth-center.ts` |
| Изолированная browser fixture: валидность и сборка реального компонента | **PASS**, код 0; браузер не запускался | `QA_FIXTURE_BUILD_ONLY=1 node --import tsx scripts/test-growth-center-browser-fixture.mjs` |
| Синтаксис fixture runner | **PASS**, код 0 | `node --check scripts/test-growth-center-browser-fixture.mjs` |
| Полный tsc / production build | Выполняет Архитектор под своим build lock | Не подменяются targeted проверкой |
| Production browser + nonempty browser fixture | **Открытый gate** до фактического GitHub Actions run | Подготовлены runners, результатов исполнения ещё нет |

Независимые 20 проверок включают: реальный `null` против измеренного нуля, cohorts/периоды, созревание return с точной границей 30 дней, ancestor bounds через неизвестные промежуточные этапы, membership от attendance, historical conversion при неизвестных текущих метриках, запрет склейки разных дат/когорт/окон, estimate и missing как разрывы конверсии, нулевой знаменатель, partial newcomer totals, cancelled meeting gaps, target horizon, PII allowlist, canonical 24 существующих брифа, reciprocal assignments, отсутствие двойного глобального счёта, approved против proven published и неправильные/будущие даты. Ни один fixture не записан в canonical JSON.

`test-growth-center-browser-fixture.mjs` монтирует **реальный GrowthCenter** с отдельным синтетическим dataset через React createRoot и esbuild JS/CSS. Это второй browser scenario в том же CI job, без второго Next build и без тестового production route. Данные помечены `productionActual:false`; production JSON не меняется. На 1440/390/360 проверяются plan24 → fact1 → plan24, непустые SVG-графики, отдельные столбцы для разных когорт, оценка с пунктиром и легендой, фильтр 14 дней, история конверсии при unknown current, tooltip с источником, графики встреч и overflow. Запуск разрешён на supported GitHub runner; локальный запрещённый Chromium не обходится.

При review default production runner обнаружен ложный отказ membership: эвристика первой длинной строки кнопки выбирала «Ветка от 04», а не название стадии. По разрешению root исправлено тестировщицей: expected label берётся из API по stage ID. Добавлены ожидания plan24/fact count без fixed sleep, hero screenshots и проверка сохранённого тестового чата в isolated browser localStorage. Свёрнутый mobile projects rail раскрывается штатной кнопкой. Role вкладок проверен: фактический `tab`, plan24 IDs и fact published-ID set присутствуют. Новый FE fix фильтрует global/stage content по режиму и не рендерит скрытые duplicate ContentRows; это требует подтверждения actual browser run.

C-GC-NAV-01: мобильный старый /marketing скрывает sidebar, а его mobileNav не содержал /growth. Frontend исправила с разрешения root; ссылка подтверждена в исходнике. Обратная навигация в runner проверяет штатную ссылку в реальном браузере.

## Независимый предварительный вердикт

Семантические guards и bundle изолированного сценария проходят. Mobile link исправлена; оба browser runner прошли node --check, git diff --check — код 0. Код и QA-сценарии готовы к source commit после общего tsc/build. **UI не принят, Actions run и screenshots ещё не получены; deployment gate не закрыт.** «Согласовано» остаётся решением владельца.
