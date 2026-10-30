# Architect spec — C-126 (schedule popupPos persist)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**

## Goal

Позиция sticky slot popup на `/schedule` переживает смену слота и refresh страницы.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Key** | `localStorage` ключ **`cf.schedule.popup.pos`**. Значение JSON `{ x: number, y: number }` (viewport/fixed coords как сейчас в `ScheduleCalendar`). |
| **D2 Restore** | На mount: если ключ есть → `setPopupPos` из storage; **default** (якорь к ячейке / center) **только если ключа нет**. |
| **D3 Slot switch** | При смене `selectedSlot` / дня — **не** сбрасывать `popupPos` к якорю ячейки, если пользователь уже имеет сохранённую позицию (или любой non-default после первого drag). Persist позиция экрана независима от слота. |
| **D4 Drag** | C-109 drag handle: на `pointerup` / move end — писать в тот же `cf.schedule.popup.pos`. |
| **D5 Compat** | Сохранить C-84 (Save/Cancel close), C-108 (независим от rail expand), opaque sticky. Не секреты в key. |
| **D6 File** | Primary: `components/schedule/ScheduleCalendar.tsx`. Shell/rail только если pos state живёт выше — проверить; не трогать mesh. |

## In scope

- Read/write `cf.schedule.popup.pos` in `ScheduleCalendar`
- Init + drag commit + no reset on slot change
- Optional tiny helper `lib/schedule/popup-pos.ts` если FE хочет чистоты (не обязателен)

## Out of scope

- Rail width (`cf.schedule.rail.width`) — уже C-110
- Backend slot API
- Mesh / Analytics

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| UI | **Frontend** | `content-factory-ui` § C-126 |
| Motion | optional | drag уже есть; не блокирует |

## Acceptance (язык Клиента)

1. Перетащил popup → сменил слот → окно на том же месте.
2. F5 → позиция та же.
3. Чистый localStorage / первый визит → default позиция OK.
4. Save/Cancel / opaque / rail expand без регресса.

## Risks

- SSR: читать localStorage только в client effect (уже `"use client"`).
- Invalid JSON → fallback default, перезаписать ключ.

## Mid-flight escalation

Стоп → Архитектор → правка schema ключа.
