# 🏛 ARCHITECTURE.md: Модульная AI Контент-Фабрика

## 0. Что это за приложение (кратко для человека)

| Вопрос | Ответ |
|--------|--------|
| **Что это?** | Веб-приложение **Vernatun Content Factory** — «контент-фабрика» для армянского клуба. |
| **Для чего?** | Чтобы админы клуба быстро запускали генерацию постов (карусели Instagram, инфографика, мульт-рилсы, аватар HeyGen), проверяли черновик глазами человека (**Human-in-the-Loop**), одобряли публикацию и смотрели аналитику. Владелец видит «конвейер» агентов на холсте Mesh. |
| **Кто пользуется?** | **OWNER** (владелец) — полный доступ, в т.ч. `/admin/mesh`. **ADMIN** — Studio, инспектор, аналитика. |
| **Где смотреть локально?** | После `npm run dev` → [http://localhost:3000](http://localhost:3000) · Studio: `/studio` · Mesh: `/admin/mesh` · Analytics: `/analytics`. |
| **Главная идея** | Не один «магический чат», а **модули + цепочка микро-агентов** (Researcher → Hook → Script → Designer → HITL → Publisher → Analyst), с остановкой на ручное одобрение. |

---

## 1. Концепция и обзор системы

Платформа — высокопроизводительное веб-приложение для автономного и полуавтономного (Human-in-the-Loop) производства медиаконтента.

Система разделена на два изолированных уровня доступа (RBAC):

1. **Superadmin Master Canvas («The Agent Mesh»):** Интерактивное рабочее поле (в стиле *n8n / ComfyUI / Linear*), доступное только владельцу (Owner/Architect) для визуализации связей агентов, очередей задач, телеметрии и добавления новых модулей.
2. **Admin Studio Launchpad:** Премиальный, минималистичный и реактивный интерфейс для администраторов клуба с быстрым запуском генераций в 1–3 клика, инспектором качества контента и аналитикой.

### Карта экранов (роуты App Router)

| URL | Кто | Назначение |
|-----|-----|------------|
| `/` | все | Редирект → `/studio` |
| `/studio` | OWNER, ADMIN | Launchpad: выбор модуля, команда, drawer генерации |
| `/studio/[moduleId]` | OWNER, ADMIN | Рабочая зона модуля (лента, идея, агенты) |
| `/studio/inspect/[id]` | OWNER, ADMIN | HITL-инспектор черновика |
| `/studio/[moduleId]/edit/[draftId]` | OWNER, ADMIN | CapCut-shell для cartoon / heygen |
| `/analytics` | OWNER, ADMIN | KPI, retention, инсайты Analyst |
| `/admin/mesh` | **OWNER only** | Граф агентов (`@xyflow/react`) |
| `/schedule`, `/brand-kit`, `/settings` | OWNER, ADMIN | Расписание, брендбук, настройки |

---

## 2. Дизайн-система и UI/UX токены (Ориентир на эскизы Stitch)

### 2.1. Визуальный код (Aesthetic Spec)

* **Тема:** Deep Matte Dark Luxury & Technical Editorial.
* **Цветовая палитра:**
  * `Canvas / Background Base`: `#08090A` / `#0D0F12`
  * `Surface Cards (Glassmorphism)`: `rgba(255, 255, 255, 0.03)` с микро-бордером `1px solid rgba(255, 255, 255, 0.08)`
  * `Surface Hover / Active`: `rgba(255, 255, 255, 0.06)` с окантовкой `rgba(255, 255, 255, 0.16)`
  * `Primary Accent (Electric Cobalt)`: `#2563EB` / `#3B82F6` (импульсы связей, активные стейты)
  * `Secondary Accent (Sand Gold / Amber)`: `#D4A359` / `#F59E0B` (статусы виральности, CTA-бейджи)
  * `Terracotta Brand Tone`: `#C86446` (акцентные теги клуба)
  * `Text Primary`: `#F3F4F6`, `Text Muted`: `#9CA3AF`, `Mono Labels`: `#6B7280`
* **Типографика:**
  * Заголовки & UI: `Inter` / `SF Pro Display` / `Plus Jakarta Sans`
  * Моноширинные системные плашки, тайминги, JSON: `JetBrains Mono`
  * Армянский Unicode-саппорт: `Noto Sans Armenian` (без искажений и глиф-артефактов)
* **Анимации и динамика:** `Framer Motion` (spring: `{ damping: 25, stiffness: 300 }`), плавные bezier-кривые потока данных между нодами, пульсирующие glow-эффекты работающих микро-агентов.

---

## 3. Архитектура экранов (Mapping на экраны Stitch)

### Экран 1: Superadmin Master Node Canvas (`/admin/mesh`)

* **Контекст эскиза:** Infinite dot-grid холст с узлами микро-агентов из референсов:
  * `Node 1: The Researcher` — сканирование трендов, ниш и конкурентов.
  * `Node 2: The Hook Writer` — воронка хуков (10 на входе → 3 кандидата → 1 победитель).
  * `Node 3: The Script Writer` — LLM генератор структуры по таймлайну.
  * `Node 4: Dynamic Router` — разветвитель на зарегистрированные модули (1: Carousel, 2: Infographics, 3: Cartoon, 4: HeyGen Avatar, N: Custom Plugin).
  * `Node 5: The Designer / Renderer` — рендерер медиа (Satori/Puppeteer/Remotion/HeyGen API).
  * `Node 6: Human-in-the-Loop Gate` — задержка очереди до апрува админом.
  * `Node 7: The Publisher` — кроссплатформенная отправка (IG, TikTok, YouTube, TG).
  * `Node 8: The Analyst` — сбор метрик, дообучение контекстных промптов.
* **Технология:** `@xyflow/react` (React Flow) с кастомными нодами `AgentNodeComponent` и анимированными `BezierEdge`.

### Экран 2: Admin Studio Launchpad (`/studio`)

* **Сетка модулей:** 4 интерактивные карточки со стеклянным градиентом + 5-й слот-заглушка `[+ Add Custom Module]`:
  1. `Instagram Carousel 4:5` (Слайды, словарь, дебаты, карточки)
  2. `Useful Visual Graphics` (Инфографика, эстетичные цитаты, шпаргалки)
  3. `Cartoon Story Reels` (2D-стилизованная анимация, векторный сторителлинг)
  4. `AI Avatar Host (HeyGen)` (Говорящая цифровая модель, живой спикер)
* **Floating Command Bar:** Поле ввода темы/ссылки + Pills-теги быстрого выбора (`[🔥 В тренде]`, `[🗣 Ереванский сленг]`, `[🎭 Культурный спор]`, `[📚 Для новичков]`).
* **Slide-over Drawer:** Реактивный лог генерации, показывающий шаги: *«Researching sources...»* → *«Selecting killer hook...»* → *«Rendering 2K frames...»*.

### Экран 3: Media Inspector & Human-in-the-Loop (`/studio/inspect/:id`)

* **Left Deck (55%):**
  * Для Reels (Модули 3, 4): Вертикальный 9:16 плеер с кастомным скруббером и наложением анимированных субтитров.
  * Для Каруселей (Модуль 1): Горизонтальная лента слайдов (01–08) с поддержкой Drag-and-Drop перестановки и масштабированием.
* **Right Control Panel (45%):**
  * `Hook Virality Score` (бейдж 94/100, 3 варианта хука для замены в 1 клик).
  * Интерактивный редактор сценария и текста описания с подсветкой стоп-слов и тайминга.
  * `Persona Switcher` (для HeyGen): выбор аватара, тембра голоса, диалекта.
  * Тулбар действий: `[🔄 Реролл текущего слайда]`, `[✏️ Правка промпта]`, `[🚀 Одобрить и в очередь публикации]`.

### Экран 4: Performance Analytics & Self-Learning (`/analytics`)

* **KPI Metrics:** Суммарные просмотры, коэффициент сохранений (Save-Rate), переходы в сообщество.
* **Retention Chart:** Сравнительный график досматриваемости (Карусель vs HeyGen vs Мульт).
* **AI Analyst Insights:** Карточки с практическими выводами от *The Analyst*:
  * *«Сценарии со сленгом в первые 2 секунды удерживают на 38% больше аудитории»*.
* **Published Feed:** Таблица вышедших постов с метриками и статусом реперпозинга.
* **Живой контур Аналитика (бэклог DEV_PLAN 5.4–5.6, не UI-only):**
  1. **Daily cron** — Instagram Graph API + YouTube Analytics API → свежие метрики опубликованных постов.
  2. **`PostAnalytics`** — история снимков метрик в Postgres (для KPI и retention-графиков).
  3. **Analyst LLM prompt** (`workers/analyst`) — сырые агрегаты из БД → текстовые инсайты в ленту админов.
  - Chain: Backend (cron + schema) → AI Bridge (prompt) → Frontend (`/analytics`). Секреты только в `.env`.

---

## 4. Архитектура расширяемых модулей (Plugin SDK)

Каждый модуль генерации изолирован и реализует единый интерфейс TypeScript:

```typescript
// types/module.ts
export interface ContentModuleManifest {
  id: string;                    // e.g. "module-heygen-reels"
  title: string;                 // "AI Avatar Host (HeyGen)"
  description: string;
  version: string;
  outputFormat: 'carousel_4_5' | 'video_9_16' | 'single_image';
  icon: string;                  // Lucide icon key
  defaultSettings: Record<string, any>;
  inputSchema: ZodSchema;        // Поля ввода для админа
}

export interface IContentModule {
  manifest: ContentModuleManifest;
  generateDraft(topic: string, options: any): Promise<DraftOutput>;
  renderAsset(draft: DraftOutput): Promise<AssetRenderResult>;
  regenerateElement(draftId: string, elementIndex: number): Promise<ElementOutput>;
}
```

### Карта маршрутов App Router

```text
┌────────────────────────────────────────┐
│            APP ROUTER ROOT             │
└──────────────────┬─────────────────────┘
                   │
     ┌─────────────┴─────────────┐
     ▼                           ▼
[Role: OWNER ONLY]     [Role: OWNER & ADMIN]
/admin/mesh (SCREEN 1)  /studio (SCREEN 2, 3, 4)
┌──────────────────────┐  ┌──────────────────────┐
│  Master Node Canvas  │  │  Studio Launchpad     │
│  - @xyflow/react     │  │  - Module Selector    │
│  - Agent Pulse       │  │  - Command Bar        │
│  - Pipeline Telemetry│  │  - Generation Drawer  │
│  - Plugin Hub        │  └──────────┬───────────┘
└──────────────────────┘             │
                 ├──── /studio/inspect/:id (SCREEN 3)
                 │      - 9:16 Video / 4:5 Carousel
                 │      - HITL Re-roller
                 │      - Script & Caption Editor
                 └──── /analytics (SCREEN 4)
                        - Retention Curves
                        - "What Worked" Analyst Feed
```

### Реализованные модули ядра

| Модуль | ID | Рендер |
|--------|-----|--------|
| Module 1 | `carousel-engine` | Satori / Puppeteer Headless 1080×1350 px, тёмная палитра клуба, армянские шрифты |
| Module 2 | `aesthetic-graphics` | Шаблонизатор инфографики и минималистичных карточек на Tailwind/SVG |
| Module 3 | `cartoon-reels` | 2D Motion Pipeline (Lottie / Remotion + AI Voiceover) |
| Module 4 | `heygen-reels` | HeyGen Interactive Avatar API + Whisper анимированные субтитры |

**Module Extensibility Slot:** Для добавления Модуля 5 достаточно положить манифест и воркер в `src/modules/{new-module}`, и система автоматически отобразит плитку в дашборде админа и добавит узел на Master Canvas.

---

## 5. Технологический стек

### 5.1. Слои (обзор)

| Слой | Стек | Версии (package.json) |
|------|------|------------------------|
| Frontend Framework | **Next.js** App Router + **React** + **TypeScript** | Next 15.5, React 19.1 |
| Стилизация | **Tailwind CSS v4**, утилиты `clsx` / `tailwind-merge` | Tailwind 4 |
| Иконки | **Lucide React** | — |
| Стейт UI | **Zustand** (studio store, черновики карусели) | 5.x |
| Data fetching | **TanStack Query v5** | в `package.json`, **пока без импортов** в app/components |
| Canvas Mesh | **`@xyflow/react`** (React Flow) | 12.x |
| Анимации UI | **framer-motion** | 13.x |
| Графики Analytics | **Recharts** | 3.x |
| DnD слайдов Inspector | **`@dnd-kit`** (core / sortable / utilities) | 6.x / 10.x |
| Валидация схем | **Zod** (манифесты модулей, parse insights) | 4.x |
| Backend API | Next.js Route Handlers (`app/api/...`) | modules, jobs SSE, studio feed, analytics, brand-kit |
| Очереди | **BullMQ** + **ioredis** (при `REDIS_URL`) | `lib/analytics/scheduler.ts`; иначе node-cron / noop |
| Cron (fallback) | **node-cron** | — |
| БД | **PostgreSQL** + **Prisma ORM** (без БД — JSON fallback `data/local/`) | Prisma 6.x |
| Cartoon / Remotion | план пайплайна (skill `remotion-pipeline`) | **не в package.json**; stub в `cartoon-reels` |
| Avatar | **HeyGen API** (`lib/ai/heygen-gateway`) | mock без `HEYGEN_API_KEY` |
| Live Instagram | Meta Graph API (`IG_ACCESS_TOKEN` + `IG_USER_ID`) | soft-fail → fixtures |

### 5.2. Где какая библиотека применена

| Библиотека / фреймворк | Где в продукте | Примеры путей |
|------------------------|----------------|---------------|
| **Next.js 15** | Роутинг страниц, API, Turbopack dev | `app/**/page.tsx`, `app/api/**` |
| **React 19** | Все UI-компоненты | `components/**` |
| **Tailwind v4** | Тема Dark Luxury, glass-карточки, сетки | `app/globals.css`, классы в компонентах |
| **framer-motion** | Появление карточек, drawer, sidebar, workspace | `GenerationDrawer`, `ModuleSelectorGrid`, `SidebarNavigation`, `StudioModuleWorkspace` |
| **`@xyflow/react`** | Agent Mesh: ноды, рёбра, canvas | `components/mesh/AgentMeshCanvas.tsx`, `nodes/*`, `edges/PulseEdge.tsx` |
| **Zustand** | Клиентский стейт | `lib/studio-store.ts`, `lib/inspect-store.ts`, `lib/session-store.ts`, `lib/analytics-store.ts`, `lib/studio/carousel-drafts-store.ts` |
| **Recharts** | График retention на Analytics | `components/analytics/RetentionChart.tsx` |
| **`@dnd-kit`** | Перестановка слайдов карусели в Inspector | `components/inspect/CarouselDeck.tsx` |
| **Lucide React** | Иконки навигации и плеера | `SidebarNavigation`, `ReelsPlayer`, Grip в DnD |
| **Zod** | Контракты модулей / парсинг инсайтов | `src/modules/*/manifest.ts`, `lib/analyst/parse-insights.ts` |
| **Prisma** | User, ContentJob, PostAnalytics | `lib/db/prisma.ts`, `prisma/schema.prisma` |
| **BullMQ / Redis** | Очередь analytics ingest (если Redis задан) | `lib/analytics/scheduler.ts` |
| **HeyGen** | Модуль 4 avatar reels | `src/modules/heygen-reels/`, `lib/ai/heygen-gateway.ts`, `workers/designer-heygen/` |
| **Remotion** | Cartoon reels (план) | stub `src/modules/cartoon-reels/` — npm-пакета нет |
| **TanStack Query** | — | в deps, **не используется** в коде UI |
| **Instagram Graph** | Live feed Studio, analytics adapters | `lib/studio/ig-live-feed*`, `lib/analytics/adapters/` |

### 5.3. Dev-команды

```bash
npm run dev      # localhost:3000 (Turbopack)
npm run build    # production build
npm run start    # next start после build
npm run db:migrate && npm run db:seed   # если поднят Postgres
```

Без Postgres и без IG-токена приложение **открывается**: Studio идёт на демо-фикстуры (`sourceMode: "mock"`).

---

## 5A. Роли агентов

В проекте два контура — **не путать**.

### A. Команда разработки (Cursor / Оркестратор)

Кто **собирает и чинит продукт** (код, UI, API). Реестр: [`.cursor/registry/agents.md`](.cursor/registry/agents.md).

| Роль | Зачем |
|------|--------|
| **Клиент** | Приёмка: сценарии кликов, скрины, тикеты `C-*`, вердикт пользователю |
| **Оркестратор** | Волны ≤3 тикета по умолчанию (full-queue по явному запросу), порядок ролей, не пишет финальный код сам |
| **Архитектор** | ТЗ (`architect-spec` + `chain.md`) до кода |
| **Фронтендер** | Экраны Studio / Mesh / Inspector / Analytics, UI-каталог 21st.dev |
| **Motion** | Анимации, Remotion-пайплайн, perf motion |
| **Бекендер** | API, Prisma, BullMQ, SSE, IG Graph |
| **AI Bridge** | Промпты, HeyGen, контракты пайплайн-агентов |
| **Кодер** | Узкая серверная логика по chain (не замена FE+BE) |
| **Тестировщик** | Smoke, guards, RBAC mesh, anti-slop |
| **Фиксер** | Хирургический фикс до зелёного |
| **Деплоер** | Localhost для приёмки; VPS только после Клиента + «да» пользователя |
| **Тренер** | Шаг 0 волны: грейд A–D, дописывает skills/rules (канон BM); без прод-кода |

### B. Агенты-работяги контента (Content Pipeline)

Кто **производит пост** внутри фабрики (операционные skills в `workers/`). На Mesh это ноды 1–8.

| Worker | Папка | Роль в конвейере |
|--------|-------|------------------|
| Researcher | `workers/researcher/` | Тренды, ниша, углы темы |
| Hook Writer | `workers/hook-writer/` | Воронка хуков 10→3→1 + score |
| Script Writer | `workers/script-writer/` | Сценарий / слайды JSON |
| Router | `workers/router/` | Выбор модуля (carousel / graphics / cartoon / heygen) |
| Designer Carousel | `workers/designer-carousel/` | PNG карусель 4:5 + brand lock |
| Designer Graphics | `workers/designer-graphics/` | Инфографика / карточки |
| Designer Cartoon | `workers/designer-cartoon/` | Рилс 9:16 (motion pipeline) |
| Designer HeyGen | `workers/designer-heygen/` | Аватар + субтитры |
| HITL Gate | `workers/hitl-gate/` | Стоп до апрува человека |
| Publisher | `workers/publisher/` | Публикация в соцсети после approve |
| Analyst | `workers/analyst/` | Метрики → текстовые инсайты |

Порядок: `Researcher → Hook → Script → Router → Designer-* → HITL → Publisher → Analyst`.

### C. Роли пользователей в приложении (RBAC)

| Роль в БД | Доступ |
|-----------|--------|
| `OWNER` | Всё + `/admin/mesh` + секреты интеграций |
| `ADMIN` | Studio / inspect / analytics; **без** Mesh |

---

## 6. Схема данных (Prisma Schema Reference)

```prisma
model User {
  id           String       @id @default(cuid())
  email        String       @unique
  name         String
  role         Role         @default(ADMIN) // OWNER | ADMIN
  contentJobs  ContentJob[]
  createdAt    DateTime     @default(now())
}

enum Role {
  OWNER
  ADMIN
}

model ContentJob {
  id             String       @id @default(cuid())
  moduleId       String       // e.g. "carousel", "heygen-reels"
  topic          String
  status         JobStatus    @default(QUEUED)
  hookScore      Int?
  rawScript      Json         // Сценарий, разбивка по слайдам/таймингам
  generatedMedia Json?        // Массив ссылок на PNG/MP4
  feedbackLogs   Json?        // Логи микро-агентов (Researcher, Hook, etc.)
  scheduledFor   DateTime?
  publishedAt    DateTime?
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  analytics      PostAnalytics[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

enum JobStatus {
  QUEUED
  RESEARCHING
  GENERATING_COPY
  RENDERING_MEDIA
  AWAITING_APPROVAL
  READY_TO_PUBLISH
  PUBLISHED
  FAILED
}

/// Снимки метрик для живого Аналитика (DEV_PLAN 5.5). Реализация — со Спринтом 5.
model PostAnalytics {
  id              String   @id @default(cuid())
  postId          String   // связь с ContentJob / внешним ID платформы
  platform        String   // "instagram" | "youtube" | ...
  views           Int      @default(0)
  saves           Int      @default(0)
  shares          Int      @default(0)
  retentionCurve  Json?    // точки досматриваемости для графиков
  capturedAt      DateTime @default(now())
  contentJobId    String?
  contentJob      ContentJob? @relation(fields: [contentJobId], references: [id])

  @@index([postId, platform, capturedAt])
}
```

> При добавлении `PostAnalytics` в `ContentJob` нужна обратная связь `analytics PostAnalytics[]`. Миграции — только `safe-db-migrations`.

---

## 7. Референсы Stitch (эскизы)

Локальные HTML-эскизы лежат в `stitch_armenian_club_brandbook/`:

| Экран | Папка |
|-------|--------|
| Agent Mesh Canvas | `vernatun_content_factory_agent_mesh_canvas/` |
| Studio Launchpad | `vernatun_content_factory_studio_launchpad/` |
| Media Inspector HITL | `vernatun_content_factory_media_inspector_hitl_studio/` |
| Analytics / Self-Learning | `vernatun_content_factory_performance_self_learning_engine/` |
| Brandbook / Design | `atelier_synth/DESIGN.md` |

---

## 8. Связанные документы

* План разработки: [`DEV_PLAN.md`](./DEV_PLAN.md)
* Цикл команды: [`docs/CLIENT_ORCHESTRATOR_CYCLE.md`](./docs/CLIENT_ORCHESTRATOR_CYCLE.md)
* Реестр агентов: [`.cursor/registry/agents.md`](./.cursor/registry/agents.md)
