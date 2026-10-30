# Architect spec — C-78

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

`/schedule`: sticky hover-popup слота; DnD слота **дата→дата**; публицист **следует** календарю (слот = источник правды в mock/store); **убрать** нижний блок «Время слота / help». Площадки (**platforms**) — **не** в этой волне (**C-79**).

## Depends

- Wave UX-4a · после **C-76**, **C-77**.
- Skills: `content-factory-ui` § Schedule sticky+date↔date+help ban, `web-motion-engine` § sticky hover + date↔date DnD, `content-pipeline-agents` § Publisher follows calendar, `backend` (только mock/store contract — без Platforms API), `client-scenarios` **S26**.
- Wave2 rail→cell DnD и cell date — **сохранить**; довести date↔date.
- Wave3 leftover publisher E2E live — **вложить** в guards этого тикета (не новый C-76).

## In scope

### 1. Sticky hover popup

Файл: `components/schedule/ScheduleCalendar.tsx` (+ DayCell / popup).

- Popup (`data-testid="schedule-slot-popup"`) остаётся, пока курсор на **ячейке/chip ИЛИ на самом popup**.
- Реализация: `pointer-events: auto` на popup; `onMouseEnter`/`Leave` на trigger **и** popup; close только после leave обоих + grace **≤150ms** (или Esc).
- **Запрет:** `pointer-events: none` на popup; unmount на первый leave ячейки без bridge.
- Время слота редактируется **в popup** (input type=time), не в нижнем footer.

### 2. DnD слот дата→дата

- Drag существующего slot-chip с day-cell A на day-cell B → `upsertSlot` с новым `startsAt` (день B, **время сохранить** из старого ISO).
- Rail→cell DnD (wave2) **не ломать**.
- Persist: `lib/schedule/storage.ts` (`cf.schedule.v1`) — при необходимости helper `moveSlotDay(file, postId, nextDay)` (Frontend; Backend API не обязателен).
- Motion: lift/settle без full-calendar remount flash (`web-motion-engine`); reduced-motion → без fly.

### 3. Публицист ↔ календарь (слот = SoT)

| Правило | Деталь |
|---------|--------|
| Источник правды | `ScheduleSlotV1` в `cf.schedule.v1` |
| Календарь → публицист | DnD / смена времени в popup обновляет datetime UI публициста (Razbor/Create), если открыт тот же `postId`/draft |
| Публицист → календарь | Confirm даты/времени у публициста → `upsertSlot` (как C-75); видимый слот на `/schedule` |
| HITL | Календарь = очередь; **не** silent publish в соцсети |

Файлы wire:

```
components/studio/workspace/RazborPublisherPane.tsx
components/studio/workspace/RazborModal.tsx          # только sync datetime / read slot — не rename (C-77)
components/studio/workspace/CreateCarouselModal.tsx  # publisher datetime sync only if present
components/schedule/ScheduleShell.tsx
lib/schedule/storage.ts
lib/studio/carousel-drafts-store.ts                  # slot label under draft if already wired
```

Mock/store OK: без нового Postgres schema в UX-4a.

### 4. Убрать нижний help-блок

В `ScheduleCalendar.tsx` удалить footer:

```
Время слота / <input type=time> / «Нажмите день — слот сохранится…» / «Сначала выберите готовый пост…»
```

- Весь `mt-auto … border-t` блок с этим copy — **out**.
- Time UX живёт в popup / cell.

## Out of scope

- **Площадки / `platformId` / Settings Platforms CRUD** → **C-79**
- Launchpad tiles (C-76)
- CompactMultiButton / Разборщик rename (C-77) — не откатывать
- Analytics Self-learning (C-80)
- VPS / social publish

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Calendar popup + DnD + remove help + publisher wire | **Frontend** | |
| Sticky bridge + DnD motion | **Motion** | grace ≤150ms; date↔date settle |
| Persist helpers | Frontend (`lib/schedule/storage.ts`) | Backend **не** звать для Platforms; optional Backend skip |
| AI Bridge | — | не звать |

## Path ownership (this ticket)

```
components/schedule/ScheduleCalendar.tsx
components/schedule/ScheduleShell.tsx
components/schedule/ScheduleModuleRail.tsx   # only if chip drag handle / labels
lib/schedule/storage.ts
components/studio/workspace/RazborPublisherPane.tsx
components/studio/workspace/RazborModal.tsx            # publisher datetime sync only
components/studio/workspace/CreateCarouselModal.tsx    # publisher datetime sync only
lib/studio/carousel-drafts-store.ts                    # if draft↔slot label
```

**Не трогать:**

```
Settings platforms / SettingsShell platforms UI
multi-button.tsx VARIANT (C-77 done)
StudioPageClient / ModuleSelectorGrid / manifests C-76
components/analytics/**
```

## Contracts

```
Popup sticky: hover popup keeps open (pointer-events + grace ≤150ms)
DnD slot day A → day B updates startsAt day, keeps time
Publisher datetime ↔ ScheduleSlotV1 (cf.schedule.v1) bidirectional for same postId
No footer strings: «Нажмите день», «Сначала выберите готовый пост», mono «Время слота» footer block
No platformId UI in this ticket
```

## Acceptance criteria (язык Клиента)

Сценарий **S26** (+ residual wave3):

1. Hover слот → popup; курсор на popup — **не пропадает**; можно сменить время.
2. DnD слота на другую дату → день обновился; rail синхронен.
3. Нет нижнего хелпа / блока «Время слота».
4. Публицист показывает ту же дату/время, что слот; смена в календаре отражается у публициста (и наоборот после confirm).
5. Guard: live E2E publisher datetime → draft date + slot (wave3 leftover) — smoke или Playwright.

## Risks

- Hover flicker при overlapping cells — grace обязателен.
- Не сломать rail→cell assign (`onSelectDay` + dropped payload).
- Data-safety: только `localStorage` schedule; не truncate Postgres.

## Mid-flight escalation

- Нужен Platforms picker — **не** делать здесь; завести/оставить **C-79**.
- Нужен Postgres Schedule table — новый тикет Backend + `safe-db-migrations`.
