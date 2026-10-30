# DEV_PLAN.md — Живой план Vernatun Content Factory

> **Обновлено:** 2026-10-15 — **Спринт 9** сужен: только **карусели Instagram** + **рилсы IG/YouTube** на планке «как Claude Code»; остальные модули → **Спринт 23**. Публикация в соцсети — **Спринт 22** (перед остальными модулями).  
> **Источники правды:** [`docs/AUDIT_FUNCTIONALITY.md`](./docs/AUDIT_FUNCTIONALITY.md) · [`docs/AUDIT_ARCHITECTURE_STACK.md`](./docs/AUDIT_ARCHITECTURE_STACK.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) (часть идей там — целевая/aspirational; факт смотри в AUDIT).  
> **Спринты 1–7** = закрытый UI-фундамент (архив ниже, все `[x]`).  
> **Спринты 8–23** = данные → качество каруселей/рилсов → завод → **публикация** → затем остальные типы контента.

> ⚠️ **Публикацию в соцсети не начинаем, пока Sprint 9 не green по карусели и рилсам (качество как у сильного Claude Code-прогона).**

---

## 🔒 UI shell freeze (жёстко с 2026-10-15)

**Оболочка интерфейса, которую Клиент уже принял, НЕ переделываем.**

Заморожено (не планируем «улучшить вид» / переразложить):

- боковое меню (Студия · Расписание · Настройки · Директор) и brand-emblem;
- chrome Студии: ленты Наши / Конкуренты / Доски, Create / Razbor, паттерны S47–S51;
- Settings Design brandbook, Boards segment, Marketing Director layout;
- glass-карточки и общий Dark Luxury вид.

**Новый UI в roadmap — только крошечная кнопка/экран, если без неё нельзя включить продуктовую фичу** (например «Одобрить улучшение Тренера»). Предпочтение: Backend / AI Bridge / очереди / интеграции. Не открывать заново войны S47–S50 по chrome, кроме регрессий.

---

## ✅ Что уже работает (UI-эра, спринт 1–7 + волны UX)

| Область | Статус | Что это даёт клубу |
|---------|--------|---------------------|
| Оболочка Studio + модули Launchpad | [x] | Выбор типа контента, рабочая зона |
| Razbor live (Haiku) | [x] | Разбор чужой карусели → insights + задания Тренеру |
| Create: Сценарист → Дизайнер (карусель) | [x] | Сценарий JSON → отрисовка → черновик |
| Marketing Director | [x] | Стратегия / план в чате |
| Settings Design brandbook | [x] | Активный визуальный стиль для Дизайнера |
| Schedule UI | [x] | Календарь слотов и очередь HITL (**черновик / слот**, без реальной отправки в соцсети) |
| Analytics UI | [x] | Экраны KPI / инсайтов (данные часто mock) |
| Mesh «Команда выпуска» (static flowchart) | [x] | Настройка агентов модуля (OWNER) |
| Apify конкуренты + cost guards | [x] | Live лента IG при ключе; кэш / лимиты (ops: ключ 403 — отдельно) |
| HITL Inspector chrome | [x] | Просмотр / правка / апрув черновика в UI → **очередь draft/schedule**, не пост в соцсеть |

---

## 📊 Сводный таймлайн

| Спринт | Фокус | Ориентир | Главная роль |
|--------|--------|----------|--------------|
| **1–7** | UI-фундамент (архив) | ~15 ч 30 мин | ✅ закрыто |
| **8** | Postgres — единый источник правды | 4–6 дн | Backend ✅ |
| **9** | **Карусели + рилсы IG/YT — качество как Claude Code** | 6–10 дн | AI Bridge + Tester |
| **10** | Стабильные конкуренты + Apify ops | 2–3 дн | Backend |
| **11** | Автономный цикл каруселей (после green Sprint 9) | 5–8 дн | Backend + AI Bridge |
| **12** | Тренер: очередь улучшений (мини-UI) | 2–3 дн | Backend + Frontend-minimal |
| **13** | Живая аналитика (cron → UI) | 3–4 дн | Backend + AI Bridge |
| **14–19** | ~~HeyGen / Cartoon / Aesthetic / articles / mesh~~ | — | **отложено → Спринт 23** |
| **20** | BullMQ + настоящий SSE | 3–5 дн | Backend |
| **21** | Настоящий Auth / RBAC | 3–5 дн | Backend (+ Frontend-minimal) |
| **22** | **Финал карусель/рилс:** реальная публикация после HITL | 3–5 дн | Backend |
| **23** | **Остальные модули** (HeyGen, Cartoon, Aesthetic, статьи, clips, info-video, mesh) | 12–20 дн | AI Bridge + Backend |

Порядок = **ценность для клуба**: сначала «работа не пропадает», потом «карусели и рилсы красивые как у Claude Code», потом «завод готовит черновики», **публикация IG/YT** — и **только потом** остальные типы контента.

---

## 🚀 Спринты 8–23 (живой бэклог)

### Спринт 8. Postgres — единый источник правды (не localStorage)

*Сейчас черновики, доски, расписание и библиотека дизайна часто живут в браузере — при смене ПК или очистке всё пропадает.*

- [x] **8.1. Модели Prisma: Draft / Board / ScheduleSlot / DesignSlot** `~1–1.5 дн` · Backend (+ `safe-db-migrations`)  
  Без wipe прод-данных; миграции только additive / двухэтапный deprecate. _(C-s8-01, 2026-10-15)_
- [x] **8.2. API CRUD черновиков карусели** `~1 дн` · Backend  
  Create/Razbor пишут на сервер; клиент читает с API (zustand — кэш, не SoT). _(C-s8-02)_
- [x] **8.3. API Boards + загрузка медиа в storage** `~1 дн` · Backend  
  Доски и кадры переживают refresh и другой браузер. _(C-s8-03)_
- [x] **8.4. API Schedule slots ↔ ContentJob** `~0.5–1 дн` · Backend  
  Календарь из БД, не из localStorage. HITL approve → **draft / scheduled queue only** (не соцпост). _(C-s8-04)_
- [x] **8.5. Design library ≤10 слотов на сервере** `~1 дн` · Backend  
  Active brandbook для draw всегда с сервера (`design-active` уже частично есть — довести до полного CRUD). _(C-s8-05)_
- [x] **8.6. Миграция с localStorage (one-shot import)** `~0.5 дн` · Backend (+ Frontend-minimal)  
  Один раз перенести старые локальные данные; дальше — только API. _(C-s8-06)_
- [x] **8.7. Guards: данные после refresh / другого профиля** `~0.5 дн` · Tester  
  _(C-s8-07 PASS; Client ПРИНЯТО С ЗАМЕЧАНИЯМИ — localhost:3001)_

**Chain:** Backend → Frontend-minimal (переключить persist на API, **без** shell redesign) → Tester → …  
**UI shell freeze:** да.  
**Волна:** `memory/waves/W-2026-10-15-sprint8-postgres/` · вердикт Клиента: `client-verdict.md`

---

### Спринт 9. Карусели + рилсы IG/YT — качество как Claude Code

*Простыми словами: один сильный запрос → завод выдаёт **острые, красивые** карусели Instagram и **вирусные** вертикальные рилсы (Instagram + YouTube Shorts), на уровне сильного прогона в Claude Code — не «почти ок» и не purple slop.  
**В фокусе только два пути:** `carousel-engine` и `custom-reels` / reels (9:16 script + существующий render path).  
**Не в этом спринте:** HeyGen, cartoon, aesthetic-graphics, статьи, clips-to-reels, info-video — всё это **Спринт 23**.  
Планка приёмки: Client HARD **S44–S46** + golden fixtures. Без green Sprint 9 — не стартуем автономию (11) и соцпубликацию (22).*

- [x] **9.1. Инвентарь live vs chrome (только carousel + reels)** · AI Bridge (+ Architect) _(C-s9-01)_
- [x] **9.2. Золотые эталоны каруселей (golden fixtures)** · AI Bridge + Backend _(C-s9-02, 4 goldens)_
- [x] **9.3. Золотые эталоны рилсов (hook / beats / CTA)** · AI Bridge _(C-s9-03, 3 goldens)_
- [x] **9.4. Scriptwriter карусели: hook, CTA 1–4, swipe_trigger meta** · AI Bridge _(C-s9-04)_
- [x] **9.5. Designer: brandbook + панорама→slice + anti-slop** · AI Bridge _(C-s9-05)_
- [x] **9.6. Reels scriptwriter (IG + YouTube Shorts)** · AI Bridge _(C-s9-06)_
- [x] **9.7. Viral contracts: STRICT JSON карусель + reels schema** · AI Bridge + Backend _(C-s9-07)_
- [x] **9.8. Claude-Code-level: prompt packs + few-shots + critic loop** · AI Bridge _(C-s9-08)_
- [x] **9.9. Smoke: Create Scriptwriter + contracts + fixtures** · Tester _(C-s9-09 PASS WITH GAPS; live Draft LLM skipped)_
- [x] **9.10. Scorecard качества (eval)** · Tester _(C-s9-10 filled; Sprint 22 gate still NOT GREEN until live eye-pass)_
- [x] **9.11. Цикл фикса S44/S45** · Fixer _(F-s9-11-a/b green; F-s9-11-c live sample open)_  
  Клиент **2026-10-15:** ПРИНЯТО С ЗАМЕЧАНИЯМИ — `memory/waves/W-2026-10-15-sprint9-carousel-reels/client-verdict.md`

**Вне скоупа Sprint 9 (явно):** глубокая прокачка Analyst / Marketing Director / Trainer как отдельные продукты; mesh parity других модулей; HeyGen / Cartoon / Aesthetic / articles. Trainer proposals из Razbor **можно** использовать, только если они правят промпты карусели/рилсов — иначе → Sprint 12 / 23.

**Chain:** Architect (пороги + scope lock) → **AI Bridge** (primary) → Backend (fixtures / contract validation) → Tester (guards / scorecard / S44–S46) → Fixer → Deployer (localhost) → Клиент (качество словами + smoke @1440).  
**UI:** **без** нового UI; debug/scorecard — только если без него нельзя снять метрики (Frontend-minimal).  
**Не делаем:** автономию «на полную» и соцпубликацию до green 9.9–9.10 по **обоим** путям (carousel + reels).

---

### Спринт 10. Надёжные live-конкуренты + Apify ops

*Интеграция есть; сбои ключа (403), лимиты и пустая лента ломают доверие к заводу. Нужно для Razbor каруселей/рилсов.*

- [ ] **10.1. Ops runbook: ключ Apify, 403, бюджет CU** `~0.5 дн` · Backend / Deployer  
  Документ + проверка env; без спама cold bootstrap.
- [ ] **10.2. Усилить TTL-кэш + in-flight dedup + hourly cap** `~0.5–1 дн` · Backend  
  Продолжение дисциплины S51; AI Bridge **никогда** не зовёт Apify.
- [ ] **10.3. Понятный empty-state при ошибке ключа** `~0.5 дн` · Frontend-minimal  
  Текст «ключ/лимит» на существующей колонке Конкуренты — без redesign карточек.
- [ ] **10.4. Ручной URL / fallback без полного scrape** `~0.5–1 дн` · Backend  
  Владелец может разобрать пост по ссылке, если Apify недоступен.
- [ ] **10.5. Оценка месячного spend (10 аккаунтов)** `~0.5 дн` · Backend  
  Цифра в docs/memory; алерт при приближении к лимиту (лог/метка).

**Chain:** Backend → AI Bridge (assert no-scraper) → Frontend-minimal → Tester.

---

### Спринт 11. Автономный цикл каруселей (завод без ручного Create)

*Цель модели: завод сам смотрит конкурентов → разбирает → пишет → рисует → кладёт в черновики/очередь. Вы в основном жмёте «согласовано».  
**Вход в спринт:** карусель + reels агенты green по спринту 9 (scorecard + smoke).*

- [ ] **11.1. Оркестратор цикла (cron / BullMQ repeatable)** `~1–1.5 дн` · Backend  
  Расписание: «N каруселей/день» по правилам клуба.
- [ ] **11.2. Scout → Razbor без клика админа** `~1 дн` · Backend + AI Bridge  
  Берёт топ конкурентов из ленты, гоняет analyze, сохраняет insights.
- [ ] **11.3. Auto Scriptwriter → Designer → Draft** `~1.5–2 дн` · AI Bridge + Backend  
  Тот же STRICT JSON и draw path, что Create; результат = ContentJob/Draft waiting HITL (**не** соцпост).
- [ ] **11.4. Политики автономии (лимиты, стоп при ошибках)** `~0.5–1 дн` · Backend  
  Бюджет LLM/Apify, max drafts/день, пауза при 3 fail подряд; стоп при падении scorecard спринта 9.
- [ ] **11.5. Уведомление владельцу «есть черновики на апрув»** `~0.5 дн` · Backend (+ Frontend-minimal badge)  
  Минимум: счётчик/бейдж на уже существующем UI Schedule/Studio — не новый дашборд.
- [ ] **11.6. E2E autonomy smoke (один полный прогон до draft)** `~0.5–1 дн` · Tester  

**Chain:** Architect (spec) → Backend → AI Bridge → Frontend-minimal (badge only) → Tester → …  
**Не делаем:** новый «Mission Control» shell; реальный push в соцсети (это спринт 22); автономию HeyGen/Cartoon/статей (→ Sprint 23).

---

### Спринт 12. Тренер выпуска — очередь улучшений (мини-UI)

*Razbor уже генерирует задания Тренеру. Не хватает экрана: «одобрить / отклонить правку промпта агента». В приоритете правки Scriptwriter/Designer/reels — не расползание на все модули.*

- [ ] **12.1. Модель TrainerProposal (Postgres)** `~0.5 дн` · Backend  
  Источник (razborId), target agent, diff промпта/правила, status pending/approved/rejected.
- [ ] **12.2. API list / approve / reject** `~0.5–1 дн` · Backend  
  Approve применяет patch к mesh `systemPrompt` / rules **только после HITL**.
- [ ] **12.3. Мини-панель «Улучшения агентов»** `~1 дн` · Frontend-minimal  
  Список предложений + Да/Нет. Размещение: вкладка/блок внутри уже существующей Команды выпуска или Settings Agents — **не** новый пункт сайдбара, не redesign mesh.
- [ ] **12.4. Связка Razbor trainerTasks → Proposal** `~0.5 дн` · AI Bridge + Backend  
- [ ] **12.5. Guards: без approve промпт не меняется** `~0.5 дн` · Tester  

**Chain:** Backend → AI Bridge → Frontend-minimal → Tester → Клиент (S-сценарий approve).  
**shell_freeze:** true.

---

### Спринт 13. Живая аналитика (cron → PostAnalytics → UI)

*Таблица и UI есть; часто показываются mock. Нужен ежедневный сбор метрик и живые инсайты Analyst.  
До спринта 22 «опубликованные» = посты, уже размеченные / импортированные как published; полный цикл factory→соцсеть — после финального спринта публикации.*

- [ ] **13.1. Cron ingest Instagram (и опц. YouTube)** `~1–1.5 дн` · Backend (+ `bullmq-job-queue`)  
  По известным published ContentJob / импорту; секреты в `.env`.
- [ ] **13.2. Запись снимков в PostAnalytics** `~0.5 дн` · Backend  
- [ ] **13.3. workers/analyst на реальных агрегатах** `~1 дн` · AI Bridge  
  Инсайты в ленту `/analytics` без выдуманных цифр (без отдельной «прокачки Analyst» из старого 9.9 — только живые данные).
- [ ] **13.4. Подключить Analytics UI к API (убрать mock path)** `~0.5–1 дн` · Frontend-minimal  
  Те же экраны; источник данных = API.
- [ ] **13.5. Guards: KPI совпадают с БД** `~0.5 дн` · Tester  

**Chain:** Backend → AI Bridge → Frontend-minimal → Tester.

---

### Спринты 14–19 — отложены в Спринт 23

*Раньше здесь шли глубина HeyGen / Cartoon / Aesthetic / articles / clips / info-video / mesh parity.  
По решению 2026-10-15 ранний roadmap **не** размазывает внимание: сначала карусели + рилсы (Sprint 9+) до публикации (22). Полный чеклист бывших 14–19 — в **Спринте 23**.*

| Было | Модуль / тема | Куда |
|------|----------------|------|
| 14 | heygen-reels E2E | **23.1–23.5** |
| 15 | cartoon-reels Remotion | **23.6–23.10** |
| 16 | aesthetic-graphics | **23.11–23.15** |
| 17 | custom-reels сценарий | **влито в Sprint 9.6** (не откладывать) |
| 18 | site-articles / tg-articles | **23.16–23.20** |
| 19 | clips-to-reels, info-video, mesh parity, Module SDK depth | **23.21–23.25** |

**Нумерацию 20–22 не сдвигаем** (меньше путаницы с уже ссылающимися docs). Слоты 14–19 в таймлайне = placeholder «→ 23».

---

### Спринт 20. BullMQ ContentJob + настоящий SSE

*Jobs SSE и Launchpad Generate Draft drawer сейчас во многом mock; длинные задачи должны идти через очередь. В приоритете — job path карусели и рилсов; воркеры остальных модулей подключаются по мере Sprint 23.*

- [ ] **20.1. Единая очередь ContentJob (Redis/BullMQ)** `~1–1.5 дн` · Backend  
  Draw карусели, reels render stub, autonomy — через workers, не «висит» HTTP 5 мин. Publish-worker — в спринте 22. HeyGen/Remotion cartoon — hooks готовы, полная нагрузка в Sprint 23.
- [ ] **20.2. Настоящий SSE `/api/jobs/[id]/stream` от прогресса воркера** `~1 дн` · Backend  
- [ ] **20.3. Подключить drawer Launchpad к реальному jobId** `~0.5–1 дн` · Frontend-minimal  
  Существующий GenerationDrawer — шаги из реальных событий, не таймер-mock.
- [ ] **20.4. Discrete workers Researcher / Hook (опц. в Create path карусели)** `~1 дн` · AI Bridge  
  Если нужны в autonomy/Launchpad — как шаги очереди; качество — по стандартам спринта 9.
- [ ] **20.5. Guards: reconnect SSE, failed job** `~0.5 дн` · Tester  

**Chain:** Backend → AI Bridge → Frontend-minimal → Tester.

---

### Спринт 21. Настоящий Auth / RBAC

*Сейчас роль часто переключается в UI. Нужна реальная изоляция OWNER vs ADMIN.*

- [ ] **21.1. Сессии / провайдер auth (выбрать один, зафиксировать в spec)** `~1–1.5 дн` · Backend  
- [ ] **21.2. Server guards: `/admin/mesh` и опасные API только OWNER** `~1 дн` · Backend  
- [ ] **21.3. Убрать «роль из localStorage» как источник правды** `~0.5 дн` · Backend + Frontend-minimal  
- [ ] **21.4. E2E RBAC (ADMIN не открывает mesh)** `~0.5 дн` · Tester  

**Chain:** Architect → Backend → Frontend-minimal → Tester.  
**Не делаем:** новый login-landing redesign (достаточно рабочего входа).

---

### Спринт 22. Реальная публикация в соцсети после HITL (GATE для карусель/рилс)

*Сейчас слот в Расписании и HITL есть, но пост в Instagram / YouTube не уходит.  
**Старт только если:** Sprint 9 green по **carousel-engine** и **custom-reels**, качество подтверждено scorecard, завод стабильно кладёт draft/schedule.  
Фокус публикации: **карусели IG** + **рилсы IG / YouTube Shorts**. Остальные типы контента (статьи, HeyGen, …) публикуются после появления их draft-path в Sprint 23 (отдельные follow-up или расширение адаптеров).*

- [ ] **22.1. Контракт Publisher + статусы ContentJob** `~0.5 дн` · Backend  
  Чёткие статусы: черновик → approved → scheduled → publishing → published / failed. Без автопуша в обход HITL.
- [ ] **22.2. Instagram Graph (или Meta) — карусель 4:5** `~1–2 дн` · Backend  
  Публикация карусели по апруву. Секреты только в `.env`.
- [ ] **22.3. Instagram Reels + YouTube Shorts** `~1–2 дн` · Backend  
  Вертикальный 9:16 после HITL (путь custom-reels). TikTok — опционально по готовности ключей.
- [ ] **22.4. Связка Schedule → Publisher job** `~0.5–1 дн` · Backend  
  Время слота запускает очередь; при ошибке — статус + лог, без «тихого» фейла.
- [ ] **22.5. Guards: HITL обязателен** `~0.5 дн` · Tester  
  Нет публикации без approve; регресс data-safety.

**Chain:** Backend → Tester → Fixer → Deployer (localhost) → Клиент (сценарий: апрув → пост появился).  
**UI:** без redesign Schedule; максимум статус «Опубликовано / Ошибка» на уже существующих элементах.  
**Зависимости:** Sprint 9.9–9.10 green; draft/schedule path карусели и рилсов стабилен.

---

### Спринт 23. Остальные модули (после каруселей/рилсов и публикации)

*Простыми словами: когда карусели и рилсы уже умеют хорошо генерироваться и выкладываться — дотягиваем **остальные** плитки Launchpad до того же уровня «черновик → HITL», без отвлечения раннего roadmap.  
**Не** переоткрываем UI shell. Реальный соцпост для этих модулей — через те же Publisher-адаптеры Sprint 22 (расширение), только после draft/HITL.*

#### HeyGen Reels

- [ ] **23.1. Контракт generateDraft / render для heygen-reels** `~1 дн` · Backend + AI Bridge  
- [ ] **23.2. Выбор аватара / голоса → job → video URL** `~1–1.5 дн` · Backend  
- [ ] **23.3. Inspector 9:16 на реальном ролике** `~0.5–1 дн` · Frontend-minimal  
- [ ] **23.4. HITL approve → draft / schedule queue** `~0.5 дн` · Backend  
- [ ] **23.5. Smoke E2E с тестовым ключом (до draft) + publish hook** `~0.5 дн` · Tester  

#### Cartoon Reels (Remotion)

- [ ] **23.6. Сценарий cartoon → Remotion composition** `~1.5–2 дн` · AI Bridge + Backend  
- [ ] **23.7. Worker render → mp4 в generatedMedia / storage** `~1.5–2 дн` · Backend  
- [ ] **23.8. Preview в существующем 9:16 shell** `~0.5–1 дн` · Frontend-minimal  
- [ ] **23.9. HITL + статус ContentJob (draft/schedule)** `~0.5 дн` · Backend  
- [ ] **23.10. Guards + лимит длины/стоимости рендера** `~0.5 дн` · Tester  

#### Aesthetic-graphics

- [ ] **23.11. STRICT JSON / brief для инфографики** `~1 дн` · AI Bridge  
- [ ] **23.12. Рендер PNG + brandbook colors** `~1–1.5 дн` · Backend + AI Bridge  
- [ ] **23.13. Draft → Наши / HITL (без обхода HITL)** `~0.5–1 дн` · Backend  
- [ ] **23.14. Паритет Create entry (reuse chrome)** `~0.5–1 дн` · Frontend-minimal  
- [ ] **23.15. Smoke** `~0.5 дн` · Tester  

#### Статьи сайт / Telegram

- [ ] **23.16. Контракт article draft (MD/HTML + SEO meta)** `~0.5–1 дн` · AI Bridge  
- [ ] **23.17. Генерация site-articles → черновик CMS/файл** `~1 дн` · Backend  
- [ ] **23.18. Генерация tg-articles → черновик / schedule queue** `~1 дн` · Backend  
- [ ] **23.19. Минимальный Create entry (reuse Studio)** `~0.5–1 дн` · Frontend-minimal  
- [ ] **23.20. Smoke (draft) + TG publish через адаптер Sprint 22** `~0.5 дн` · Tester  

#### Clips / info-video / mesh parity / SDK

- [ ] **23.21. custom-clips-to-reels: ingest длинного видео → нарезки** `~2–3 дн` · Backend + AI Bridge  
- [ ] **23.22. custom-info-video: сценарий + render stub→real** `~2 дн` · AI Bridge + Backend  
- [ ] **23.23. Module SDK register → generate/render без mock** `~1–2 дн` · Backend  
- [ ] **23.24. Чеклист паритета с carousel-engine (где применимо)** `~1 дн` · Architect + Tester  
  Разбор / Create / Draft / HITL / Trainer — без обязательного соцпоста до готовности адаптера.
- [ ] **23.25. Документировать зрелость каждого moduleId** `~0.5 дн` · Architect  
  Обновить AUDIT; матрица ready / partial / chrome.

**Chain (типовой блок модуля):** Architect → AI Bridge → Backend → Frontend-minimal (reuse only) → Tester.  
**shell_freeze:** true.  
**Не делаем:** новый вид модуля; возврат этих тем в Sprint 9–19.

---

## 🚫 НЕ делаем (вне roadmap, пока нет регрессии)

| Запрет | Почему |
|--------|--------|
| Redesign shell / сайдбара / IA навигации | UI shell freeze; уже принято Клиентом |
| Restyle glass cards / «улучшить Dark Luxury» | Не даёт качеству агентов и данным |
| Открывать S47–S50 chrome-войны заново | Только фикс регрессии по Client HARD REJECT |
| Новый Mission Control / второй Analytics shell | Сначала данные, агенты, потом publish |
| **Публикация в соцсети до закрытия спринта 9** | Качество карусели/рилсов не доказано |
| Размывание Sprint 9 на HeyGen/Cartoon/Aesthetic/статьи | Фокус только carousel + reels; остальное → 23 |
| Автопуш в соцсети без HITL | Data-safety + канон продукта |
| Wipe Postgres / Redis / generatedMedia «для чистоты» | Запрет data-safety |
| Параллельные FE-писатели на одни и те же shell-файлы | Path lock Архитектора |

---

## 📎 Архив: Спринты 1–7 (UI-фундамент, закрыты)

> Исторический чеклист Frontend-эры. Все пункты выполнены. Не открывать как активный бэклог.

### Спринт 1. Дизайн-система и базовый лейаут — ✅

- [x] **1.1.** Next.js 15 + пакеты `[~25 мин]`
- [x] **1.2.** Тема Dark Luxury / CSS-токены `[~30 мин]`
- [x] **1.3.** App Shell + SidebarNavigation + RBAC mesh visibility `[~30 мин]`
- [x] **1.4.** GlassCard / NeonBadge / ReactiveButton `[~20 мин]`

### Спринт 2. Admin Studio Launchpad (`/studio`) — ✅

- [x] **2.1.** Сетка модулей `[~40 мин]`
- [x] **2.2.** FloatingCommandBar `[~35 мин]`
- [x] **2.3.** GenerationDrawer (позже — подключить к реальному SSE в **спринте 20**) `[~45 мин]`

### Спринт 3. Superadmin Mesh Canvas — ✅

- [x] **3.1–3.4.** Холст / ноды / edges / top bar (эволюция: static flowchart Команды выпуска — канон C-138…C-145)

### Спринт 4. Media Inspector & HITL — ✅

- [x] **4.1–4.4.** Плеер 9:16 / карусель 4:5 / hook swap / Approve & Schedule chrome (очередь draft/schedule; соцпост → **спринт 22**)

### Спринт 5. Analytics UI + задел Analyst — ✅ (UI); живые данные → спринт 13

- [x] **5.1–5.3.** KPI / retention / лента Analyst (UI)
- [x] **5.4–5.6.** Cron / PostAnalytics / worker Analyst (задел; проводка live → **спринт 13**)

### Спринт 6. Module SDK — ✅ (каркас); глубина остальных модулей → **спринт 23** (карусель/рилс — спринт 9)

- [x] **6.1–6.3.** IContentModule / адаптеры / plugin slot UI

### Спринт 7. SSE / motion / E2E — ✅ (каркас); настоящий SSE → спринт 20

- [x] **7.1–7.3.** useJobStream / micro-motion / Armenian + mesh RBAC smoke

---

## 📎 Связанные документы

| Документ | Зачем |
|----------|--------|
| [`docs/AUDIT_FUNCTIONALITY.md`](./docs/AUDIT_FUNCTIONALITY.md) | Что умеет продукт глазами пользователя |
| [`docs/AUDIT_ARCHITECTURE_STACK.md`](./docs/AUDIT_ARCHITECTURE_STACK.md) | Стек, данные, риски as-is |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Целевая архитектура (сверять с AUDIT: не всё реализовано) |
| [`docs/CLIENT_ORCHESTRATOR_CYCLE.md`](./docs/CLIENT_ORCHESTRATOR_CYCLE.md) | Цикл команды |
| [`.cursor/registry/agents.md`](./.cursor/registry/agents.md) | Роли |
| Волна плана | `memory/waves/W-2026-10-15-dev-plan-research/` |
| Перестановка 2026-10-15 | `memory/waves/W-2026-10-15-dev-plan-research/plan-reorder-2026-10-15.md` |
| Фокус Sprint 9 (карусель+рилс) | `memory/waves/W-2026-10-15-dev-plan-research/plan-sprint9-carousel-reels-focus.md` |

---

## Примечание Оркестратору

- По умолчанию ≤3 тикета `C-*` за проход; при явном «до конца» — вся очередь спринта.  
- Закрытие пункта спринта — только с localhost + `guards.md`.  
- Prod/VPS — только после Клиента без P0/P1 и явного «да» пользователя.  
- Волна `W-2026-10-15-dev-plan-research` — **только документы**, без правок UI-кода.  
- **Не открывать спринт 22**, пока спринт 9 не green по **карусели и рилсам**.  
- **Не тащить HeyGen/Cartoon/Aesthetic/статьи в Sprint 9** — только Sprint 23.
