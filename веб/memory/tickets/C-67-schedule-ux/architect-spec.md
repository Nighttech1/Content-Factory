# Architect spec — C-67

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

`/schedule`: дерево модулей **свёрнуто** по умолчанию; текст **wrap** без truncate/line-clamp; **убрать** горизонтальный day-strip (`stripDays`); стрелки месяца **рядом** с `monthLabel`.

## Depends

- Wave `memory/waves/W-2026-10-07-ux-carousel-nav.md` — **wave 2**.
- C-54 RU calendar + C-59 animated-file-tree — **сохранить** паттерн дерева/календаря.
- Skills: `content-factory-ui` § Расписание UX wave, `client-scenarios` S17.
- Paths **не** пересекают C-63–66 Studio/mesh (кроме косвенно AppShell — не трогать).

## In scope

### 1. Folders default collapsed

Файл: `components/schedule/ScheduleModuleRail.tsx`.

- Сейчас: `defaultOpen` на папках модулей → **`defaultOpen={false}`** (или эквивалент collapsed).
- Раскрытие по клику пользователя; не open-all.

### 2. Wrap text

Тот же rail (+ leaf labels):

- Убрать `truncate` / `line-clamp-*` на названиях постов/модулей, которые ломают читаемость.
- `text-pretty` / `break-words` / wrap; высота строки растёт, не ellipsis-only.

### 3. Remove `stripDays`

Файл: `components/schedule/ScheduleCalendar.tsx`.

- Удалить UI, который рендерит `stripDays.map(...)` (горизонтальная полоса дней под шапкой).
- Мёртвый код переменной `stripDays` убрать вместе с разметкой.
- Месячная сетка/календарь слотов **остаётся**.

### 4. Month arrows beside `monthLabel`

Тот же `ScheduleCalendar.tsx`:

- Паттерн: **‹** `monthLabel` **›** в одной группе (flex/gap), не стрелки в далёком углу без связи с title.
- testids prev/next month сохранить или добавить (`schedule-month-prev` / `schedule-month-next` если ещё нет).

## Out of scope

- Persist schedule storage schema
- Mesh / Studio feed / nav loading
- Plan file / Backend / VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Rail + calendar chrome | **Frontend** | 21st optional polish |
| Motion | — | **не обязателен**; микро-анимации дерева уже есть — не ломать |
| Backend / AI Bridge | — | **не звать** |

## Path ownership (this ticket)

```
components/schedule/ScheduleModuleRail.tsx
components/schedule/ScheduleCalendar.tsx
components/schedule/ScheduleShell.tsx   # only if chrome wiring required
```

**Не трогать:** `SidebarNavigation`, mesh/*, studio workspace/feed, `AppShell`, analytics.

## Contracts

```
ScheduleModuleRail folders: defaultOpen false
No truncate/line-clamp on post/module labels (wrap)
stripDays UI removed
Month arrows adjacent to monthLabel
```

## Acceptance criteria (язык Клиента)

1. Открыл `/schedule` — папки справа свёрнуты; клик раскрывает (S17).
2. Длинные названия переносятся, не обрезаются многоточием.
3. Нет полосы дней под шапкой; стрелки месяца слева и справа от названия месяца.

## Risks

- Анимации `defaultOpen` в framer — проверить initial collapsed без flash open.
- C-54 a11y month nav — сохранить keyboard если уже был.

## Mid-flight escalation

- Нужен новый calendar 21st component wholesale — OK Frontend; не менять persist keys без нового тикета.
