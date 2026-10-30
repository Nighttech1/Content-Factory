# Architect Spec — W-2026-10-15-sprint8-postgres

**Дата:** 2026-10-15  
**Роль:** Архитектор  
**Волна:** Sprint 8 — Postgres как единый источник правды (SoT)  
**DEV_PLAN:** 8.1 → 8.7 (порядок жёсткий)  
**ticket_limit:** `full-queue`  
**shell_freeze:** `true`  
**Trainer grade:** `memory/trainer/2026-10-15-sprint8-postgres-grade.md` (**B**)  
**Код продукта в этом ходе:** **нет** — только plan files.

---

## 1. Зачем это нужно (простым языком)

Сейчас важные вещи — черновики каруселей, доски с картинками, слоты в календаре и библиотека дизайна — часто лежат **в браузере** (localStorage). Если очистить данные браузера, сменить компьютер или открыть другой браузер — всё может пропасть.

В Sprint 8 мы переносим эти данные в **Postgres** (общая база на сервере). Браузер остаётся только как быстрый кэш и как источник для **одноразового** переноса старых данных.

**Не делаем в этой волне:** выкладку постов в Instagram/Telegram (это спринт 22). После «Одобрить / Опубликовать» в студии пост попадает только в очередь **черновик / запланировано** — без реальной отправки в соцсеть.

**Не трогаем внешний вид:** меню слева, шапка, сетка студии — как есть (`shell_freeze: true`).

---

## 2. As-is (что есть сейчас — research)

| Слой | Факт |
|------|------|
| Prisma | Только `User`, `ContentJob`, `PostAnalytics` (`prisma/schema.prisma`) |
| Черновики | `lib/studio/carousel-drafts-store.ts` → key `cf.carousel.drafts.v1` (zustand persist) |
| Доски | `lib/studio/boards-store.ts` → key `cf.studio.boards.v1` (slideUrls часто data:/blob:) |
| Расписание | `lib/schedule/storage.ts` → key `cf.schedule.v1` (`postId`, `moduleId`, `startsAt`, `platformId?`) |
| Дизайн-библиотека | `lib/settings/design-library.ts` → `cf.settings.design.library.v1` + `cf.settings.design.activeId` (≤10) |
| Active design (сервер) | `GET/POST/DELETE /api/settings/design-active` → файл `data/local/design-active.json` (не Postgres, не CRUD библиотеки) |
| Auth | Полноценного auth ещё нет (Sprint 21). Seed user: `user_seed_admin_c16` |

Аудит: `docs/AUDIT_ARCHITECTURE_STACK.md` §6.

---

## 3. Жёсткие запреты (data-safety)

| Запрет | Почему |
|--------|--------|
| `prisma migrate reset` / drop database на shared | Убьёт данные фабрики |
| `DROP TABLE` / `DROP COLUMN` существующих моделей | Только additive |
| Wipe Postgres / Redis volumes / `generatedMedia` | Data-safety rules |
| Social publish / Meta Graph push | HITL → draft/scheduled **only** |
| Правки AppShell / SidebarNavigation / left nav IA / module top chrome | `shell_freeze: true` |
| Логировать секреты / полный DESIGN.md в tickets | Secrets + noise |

Бэкап перед DDL на shared: рядом с данными (не в git), затем additive migration.

---

## 4. Порядок работ (8.1 → 8.7)

| Шаг | Тикет | Кто | Суть |
|-----|-------|-----|------|
| **8.1** | **C-s8-01** | Backend | Prisma модели + migration (additive) |
| **8.2** | **C-s8-02** | Backend | API CRUD Drafts |
| **8.3** | **C-s8-03** | Backend | API Boards + upload медиа в storage |
| **8.4** | **C-s8-04** | Backend | API ScheduleSlot ↔ Draft/ContentJob; HITL → draft/scheduled |
| **8.5** | **C-s8-05** | Backend | DesignSlot ≤10 + active; Postgres SoT; dual-read JSON file |
| **8.6** | **C-s8-06** | Backend import endpoint + **Frontend-minimal** | One-shot import из localStorage + wire stores → API |
| **8.7** | **C-s8-07** | Tester | Guards: F5, другой профиль, идемпотентный import, no publish, shell freeze |

Параллелить overlapping Backend schema/API paths **запрещено**. Motion / AI Bridge **вне** chain (если не всплывёт blocker — вернуть к Архитектору).

---

## 5. Идентификация пользователя (до Sprint 21 Auth)

Пока нет настоящего логина. Для изоляции данных в Sprint 8:

| Lock | Решение |
|------|---------|
| **D-s8-user** | Все SoT-сущности scoped по `userId` → `User.id` |
| **D-s8-dev-actor** | Dev/localhost: резолв актёра через (по приоритету) заголовок `x-cf-user-id` **или** cookie `cf_user_id` **или** env `CF_DEV_USER_ID` → fallback seed `user_seed_admin_c16` (создать через upsert если нет). Документировать в `.env.example` **имя** ключа, не значение секрета |
| **D-s8-isolation** | List/GET чужого `userId` → пусто / **403**. Тестер проверяет вторым actor id |
| **D-s8-no-auth-ui** | Не строить экран логина в этой волне |

---

## 6. Модели Prisma (additive) — field maps

Имена enum/полей — канон волны. Backend может уточнить Prisma naming (`@@map`) без смены смысла.

### 6.1 Enums (новые)

```prisma
enum DraftStatus {
  UNPUBLISHED
  SCHEDULED
  // ARCHIVE later — не в 8.1 без нужды
}

enum ScheduleSlotStatus {
  DRAFT
  SCHEDULED
  // не SOCIAL_PUBLISHED в Sprint 8
}
```

### 6.2 Draft

| Поле | Тип | Notes |
|------|-----|-------|
| `id` | String @id | Сохранять client cuid/uuid при import |
| `userId` | String | FK → User |
| `moduleId` | String | default `carousel-engine` |
| `status` | DraftStatus | default UNPUBLISHED |
| `title` | String | |
| `slides` | Json | `CarouselDraftSlide[]` |
| `scenario` | String? | |
| `payload` | Json? | brand, sourceCompetitorId, competitorId, extras |
| `contentJobId` | String? | optional FK → ContentJob |
| `createdAt` / `updatedAt` | DateTime | |
| indexes | | `@@index([userId, moduleId])`, `@@index([userId, updatedAt])` |

**User:** `drafts Draft[]`  
**ContentJob:** `drafts Draft[]` (optional reverse)

Маппинг из `CarouselDraft`:

| Client | Server |
|--------|--------|
| `id`, `title`, `slides`, `scenario`, `createdAt`, `updatedAt` | одноимённо |
| `status: "unpublished"` | `UNPUBLISHED` |
| `sourceCompetitorId`, `competitorId`, `brand` | внутри `payload` |
| (новое) scheduled | `SCHEDULED` + связь со слотом |

### 6.3 Board

| Поле | Тип | Notes |
|------|-----|-------|
| `id` | String @id | |
| `userId` | String | FK → User |
| `title` | String | |
| `slideUrls` | Json | string[] — **URL/paths**, не SoT base64 в Postgres |
| `createdAt` | DateTime | из `createdAt: number` ms → DateTime |
| `updatedAt` | DateTime | @updatedAt |
| indexes | | `@@index([userId])` |

Медиа: upload → `generatedMedia/boards/{userId}/…` или существующий storage helper; в БД только refs.

### 6.4 ScheduleSlot

| Поле | Тип | Notes |
|------|-----|-------|
| `id` | String @id @default(cuid()) | |
| `userId` | String | FK → User |
| `moduleId` | String | |
| `startsAt` | DateTime | |
| `postId` | String | legacy client key (= draft id или job id) |
| `draftId` | String? | FK → Draft |
| `contentJobId` | String? | FK → ContentJob |
| `platformId` | String? | из Settings platforms (C-79) |
| `status` | ScheduleSlotStatus | DRAFT \| SCHEDULED |
| `createdAt` / `updatedAt` | DateTime | |
| indexes | | `@@index([userId, startsAt])`, `@@unique([userId, postId])` (один слот на post) |

HITL «одобрить / поставить в календарь» → `status = SCHEDULED` (+ Draft `SCHEDULED` если связан). **Нет** вызова соцсетей.

### 6.5 DesignSlot

| Поле | Тип | Notes |
|------|-----|-------|
| `id` | String @id | |
| `userId` | String | FK → User |
| `label` | String | ← client `name` |
| `markdown` | String | DESIGN.md body (или Text) |
| `html` | String? | |
| `previewUrl` | String? | |
| `brandbook` | Json? | `presetFile` + colors/cssVarOverrides snapshot |
| `isActive` | Boolean | default false; **ровно один** active на user (API enforce) |
| `sortOrder` | Int | default 0 |
| `createdAt` / `updatedAt` | DateTime | |
| indexes | | `@@index([userId])`, `@@index([userId, isActive])` |

**Cap ≤10** на `userId` — enforce в API (409 при превышении).  
Active → draw path: читать из Postgres; dual-read с `design-active.json` на переходный период (после успешного sync можно писать JSON как cache, не SoT).

### 6.6 Relations summary

```
User 1—* Draft | Board | ScheduleSlot | DesignSlot | ContentJob
Draft ?*—? ContentJob (optional)
ScheduleSlot ?*—? Draft | ContentJob (optional FKs)
```

---

## 7. API routes (канон путей)

Все mutating: scoped actor; идемпотентность где указано (`Idempotency-Key` или stable client `id`).

### 7.1 Drafts — C-s8-02

| Method | Path | |
|--------|------|--|
| GET | `/api/studio/drafts` | `?moduleId=` list своих |
| GET | `/api/studio/drafts/[id]` | 404 если чужой |
| POST | `/api/studio/drafts` | create/upsert by id |
| PATCH | `/api/studio/drafts/[id]` | partial |
| DELETE | `/api/studio/drafts/[id]` | soft-optional; hard delete OK для unpublished |

### 7.2 Boards — C-s8-03

| Method | Path | |
|--------|------|--|
| GET | `/api/studio/boards` | list |
| POST | `/api/studio/boards` | create `{ title?, slideUrls? }` |
| PATCH | `/api/studio/boards/[id]` | rename / replace urls |
| DELETE | `/api/studio/boards/[id]` | |
| POST | `/api/studio/boards/upload` | multipart/base64 → storage URLs |

### 7.3 Schedule — C-s8-04

| Method | Path | |
|--------|------|--|
| GET | `/api/schedule/slots` | list (`from`/`to` optional) |
| POST | `/api/schedule/slots` | upsert by `postId` |
| PATCH | `/api/schedule/slots/[id]` | move day / platform / status |
| DELETE | `/api/schedule/slots/[id]` или `?postId=` | |
| POST | `/api/schedule/slots/approve` | HITL → `SCHEDULED` **only** (no social) |

### 7.4 Design library — C-s8-05

| Method | Path | |
|--------|------|--|
| GET | `/api/settings/design-slots` | list ≤10 + `activeId` |
| POST | `/api/settings/design-slots` | create (cap) |
| PATCH | `/api/settings/design-slots/[id]` | update body/preset |
| POST | `/api/settings/design-slots/[id]/activate` | set active; unset others |
| DELETE | `/api/settings/design-slots/[id]` | |
| GET/POST | `/api/settings/design-active` | **сохранить**; читать Postgres active first, fallback JSON file |

### 7.5 Import — C-s8-06

| Method | Path | |
|--------|------|--|
| POST | `/api/studio/migrate-local` | one-shot body (см. §8); idempotent |

Ответ: counts upserted / skipped / errors per bucket; `migratedAt`.

---

## 8. localStorage → server import map

| Legacy key | Shape (as-is) | → Model / fields |
|------------|---------------|------------------|
| `cf.carousel.drafts.v1` | zustand `{ state: { drafts[], selectedDraftId } }` или плоский persist | **Draft**; `selectedDraftId` → client-only preference (`cf.carousel.selectedDraftId` OK оставить локально) |
| `cf.studio.boards.v1` | `{ state: { boards: BoardCarousel[] } }` | **Board**; data:/blob: → upload first → `slideUrls` |
| `cf.schedule.v1` | `{ version:1, slots:[{postId,moduleId,startsAt,platformId?}] }` | **ScheduleSlot**; UI chrome keys **не** импортировать |
| `cf.settings.design.library.v1` | `DesignLibrarySlot[]` | **DesignSlot** (`label←name`, `brandbook←presetFile…`) |
| `cf.settings.design.activeId` | string | `DesignSlot.isActive` |

**Не импортировать (остаются client chrome):**  
`cf.sidebar.width`, `cf.schedule.popup.pos`, `cf.schedule.rail.width`, `cf.mesh.agents.*`, marketing projects, feed TTL cache, `cf.settings.designMd.v1` (кроме если ещё не смёржен в library — тогда один раз через существующий client migrate-in-library, потом import).

**Идемпотентность:** повторный POST с теми же `id` → update, не дубли. Флаг клиента после успеха: `cf.sprint8.migrated.v1 = { at, counts }`.

---

## 9. Frontend-minimal (8.6 + wire)

Skills: `content-factory-ui` § Frontend-minimal.

| Разрешено | Запрещено |
|-----------|-----------|
| Swap data layer в `carousel-drafts-store`, `boards-store`, `schedule/storage`, `design-library` → fetch API + memory cache | Redesign shell/nav/feed/Create/Razbor layout |
| One-shot import bootstrap (раз при старте студии/settings) | Новые 21st экраны «для миграции» |
| Сохранить те же testids / UX copy | Менять S47–S51 chrome |

После wire: zustand persist может остаться как **offline cache**, но SoT = API (при hydrate — fetch server, merge/replace по spec Backend).

---

## 10. Acceptance для Клиента (не UI-редизайн)

Простым языком — что должно работать на localhost:

1. **F5:** создал черновик / доску / слот / дизайн → обновил страницу → всё на месте.  
2. **Другой браузер / профиль с тем же userId:** видит те же данные.  
3. **Другой userId:** чужих черновиков/досок **не** видит.  
4. **Расписание** строится из БД, не только из localStorage.  
5. **Активный дизайн** для отрисовки берётся с сервера (Postgres / design-active sync).  
6. **Import:** старые локальные данные перенеслись один раз; повтор не плодит копии.  
7. **Нет** реальной публикации в соцсеть.  
8. **Внешний вид** меню/шапки не менялся (`shell_freeze`).

Playwright @1440 — persistence smoke (не visual redesign accept). Без live UI + refresh proof вердикт **НЕ ПРИНЯТО**.

---

## 11. Skills / plugins

- `prisma-content-schema` § Sprint 8  
- `safe-db-migrations`  
- `backend` § Sprint 8  
- `content-factory-ui` § Frontend-minimal  
- `tester` § 8.7  
- Trainer: `plugins/trainer/sprint8-postgres-sot.md`

---

## 12. Out of scope

- Social publish (Sprint 22)  
- Mesh agent prompts persist, Marketing projects  
- Real Auth/RBAC UI (Sprint 21) — только actor header/env  
- BullMQ/SSE rewrite, Apify changes  
- Motion, AI Bridge (unless mid-flight blocker)

---

## 13. Deliverables этой архитектурной фазы

| Файл | Статус |
|------|--------|
| `memory/waves/W-2026-10-15-sprint8-postgres/architect-spec.md` | этот файл |
| `memory/waves/W-2026-10-15-sprint8-postgres/chain.md` | порядок ролей |
| `memory/tickets/C-s8-01…07/` | spec + chain на тикет |

**Следующий шаг Оркестратора:** Backend по **C-s8-01** (не раньше).

---

`🏗️ **АРХИТЕКТОР:** Sprint 8 Postgres SoT — shell_freeze; 8.1→8.7; no social publish; chain → Backend.`
