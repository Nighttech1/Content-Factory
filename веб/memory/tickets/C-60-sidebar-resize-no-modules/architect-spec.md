# Architect spec — C-60

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Сайдбар: пункт **Студия** без выпадающих модулей. Ширина дерева **drag**, persist `localStorage` **`cf.sidebar.width`**, основной контент сдвигается вместе с aside.

## Depends

- Wave `memory/waves/W-2026-10-06-workspace-polish.md`. **Первый** тикет волны: **C-60 → C-61 → C-62**.
- Skills: `content-factory-ui` § MenuVertical C-60, `21st-ui-catalog` (`resizable sidebar drag handle dark react`), `frontend.mdc`.
- C-57 MenuVertical / RU / RBAC Холст OWNER — **сохранить**. Children-модули C-57 **superseded**.
- C-27 smoke `nav-studio-children` **не** возвращать; Tester **сужает** G4.

## In scope

### 1. Студия без children

Файл: `components/shell/SidebarNavigation.tsx`.

Сейчас: `menuItems[0].children = <MenuVertical items={studioChildItems} />` + `childrenTestId: "nav-studio-children"` + accordion `studioOpen`.

**Убрать:**

- `studioChildItems`, `mergeStudioModules` / `STUDIO_MODULES` / `studioModuleHref` из сайдбара
- `children`, `childrenTestId`, `expandTestId`, `onOpenChange`, `studioOpen`
- гидрацию `customModules` **если** она нужна только детям Студии

Студия = **один** пункт `href="/studio"`, `testId="nav-studio"`. Активность: `pathname.startsWith("/studio")` как сейчас (`active: underStudio`). Модули — только сетка Launchpad.

`MenuVertical` API `children` можно оставить в UI-kit (другие экраны), но **Студия children не передаёт**.

Сохранить: RBAC Холст `ownerOnly`, Settings `adminOrOwner`, QA role switcher, hy-строка, `nav-settings`, hover gold, `text-sm`, `framer-motion`.

### 2. Resizable aside + pad main

Факт: `aside` = `w-64` (256px); main wrapper в `AppShell` = `pl-64`.

| Правило | Деталь |
|---------|--------|
| Ключ | `localStorage` **`cf.sidebar.width`** (число px, без секретов) |
| Clamp | **200–360** (волна; уже навыка ~220–420) |
| Default | `256` (= бывший `w-64`) если ключа нет / NaN / вне clamp |
| Handle | правый край aside, `data-testid="sidebar-resize-handle"`; pointer drag (не только CSS resize) |
| Main | `AppShell` padding-left = **та же** ширина, не хардкод `pl-64` |

**Один источник правды:** утилита/хук (например `lib/shell/sidebar-width.ts` + `useSidebarWidth`) — read/write + clamp. `SidebarNavigation` ставит `width` aside; `AppShell` ставит `paddingLeft` / CSS var `--cf-sidebar-width` на обёртке. Не два независимых `localStorage` reader с рассинхроном.

Гидрация: до mount — default 256 (без mismatch), после mount — ключ. Drag пишет ключ (debounce OK, last-pointer-up обязателен).

21st: MCP `search` → `get_component` (`resizable sidebar drag handle dark react`). Adapt `framer-motion` + Dark Luxury. MCP 21st на момент spec **недоступен** → luxury handle всё равно; `decisions.md` `21st=unavailable` или id если Frontend достал компонент.

## Out of scope

- Workspace blink / «Создать» / nested scroll → **C-61**
- Razbor / DraftsPanel → **C-62**
- Backend, Prisma, prod
- Мобильный drawer-nav (новый тикет)
- Возврат `nav-studio-module` в дерево

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Flat Студия + width hook + handle + AppShell pad | **Frontend** | 21st-first handle |
| Drag spring / reduced-motion (без полёта ширины на каждый px) | **Motion** | после DOM; width можно без spring на pointermove |
| Backend / AI Bridge | — | **не звать** |

## Contracts

```
Studio nav: NO children, NO nav-studio-children
cf.sidebar.width ∈ [200, 360]
AppShell padding-left === aside width
RBAC mesh: ADMIN still no Холст
```

## Acceptance criteria (язык Клиента)

1. В сайдбаре нет списка модулей под «Студия»; клик «Студия» → `/studio` (S9 + S12).
2. Правый край дерева тянется; после reload ширина та же (S12).
3. Контент справа не заезжает под дерево и не оставляет дыру от старого `pl-64`.
4. ADMIN по-прежнему не видит «Холст».

## Risks

- Smoke C-27 G4 требует `nav-studio-children` — Tester **меняет** assert: children **запрещены**.
- Overlap `SidebarNavigation` с C-61/C-62 **запрещён параллельно**.
- `w-64` / `pl-64` хвосты в других layout — grep и выровнять только shell, не трогать unrelated `w-64`.

## Mid-flight escalation

- Нужен server persist ширины — новый тикет, не Backend в этой волне.
- Clamp шире 360 — не расширять без нового C-*.
