# Architect spec — C-57

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Launchpad без счётчика выбора. Сайдбар = адаптированный **MenuVertical** (hover-стрелка, Dark Luxury, RU), кегль как сейчас; дети Студии чуть мельче.

## Depends

- Trainer A: `memory/trainer/2026-10-06-nav-mesh-razbor-grade.md`.
- Skills: `content-factory-ui` § C-57 / сайдбар, `21st-ui-catalog` (adapt `motion/react` → `framer-motion`), `frontend.mdc`.
- **Порядок волны:** **C-57 → C-58 → C-59**. Этот тикет **первый**.
- C-54 RU nav labels уже в `SidebarNavigation` — **не** откатывать на EN.

## In scope

### 1. Убрать счётчик Launchpad

Файл: `components/studio/ModuleSelectorGrid.tsx`.

Сейчас справа от «Каналы рендера»:

```tsx
{selectedModuleId ? "1 выбран" : "Ничего не выбрано"}
```

**Удалить** весь chrome-счётчик (и «1 выбран», и «Ничего не выбрано»). Заголовок + supporting sentence оставить.

`setSelectedModuleId` на клике карточки **можно** оставить (store для Generate / command bar) — это не витрина счётчика.

`data-testid` на карточках не ломать.

### 2. `components/ui/menu-vertical.tsx`

Источник: paste пользователя / 21st MenuVertical. MCP `21st` `search` (`vertical menu accordion hover arrow dark react`) → pick → adapt.

| Правило | Деталь |
|---------|--------|
| Import | **`framer-motion`**, запрет `motion/react` и пакета `motion` |
| `cn` | `@/lib/cn` |
| Токены | Dark Luxury: canvas/elevated, `--border-glass`, `--text-primary` / `--text-muted` |
| Hover цвет | `var(--accent-gold)` (не purple-демо, не оставлять только `--text-primary`) |
| Кегль пунктов | `text-sm` (~14px), **не** `text-4xl` демо |
| Дети (Студия → модули) | `text-[13px]` **или** `text-xs` — явно мельче родителя |
| Стрелка | появляется / едет на **hover** (21st pattern); `prefers-reduced-motion` → без полёта |
| Копи | **русский** (`Студия`, `Холст`, …) — данные снаружи, не хардкод EN из демо |

Компонент **презентационный**: items + accordion children + `renderLink`. RBAC **не** внутри UI-kit.

### 3. `SidebarNavigation` на MenuVertical

Файл: `components/shell/SidebarNavigation.tsx`.

Заменить плоский список + самодельный accordion на MenuVertical, **сохранив**:

| Инвариант | Как |
|-----------|-----|
| RBAC | `ownerOnly` Холст только `OWNER` (C-02 / S3) |
| Settings | `adminOrOwner` |
| Студия | parent `/studio` + expand модулей `mergeStudioModules` |
| testids | `nav-studio`, `nav-studio-expand`, `nav-studio-children`, `nav-studio-module`, `nav-settings` |
| QA role switcher | нижний блок не трогать функционально |
| hy-строка | можно оставить |

Активный пункт: текущий cobalt underline/bg **OK**; **hover** неактивных — gold.

Бренд-шапка VERN·ATUN / aside width `w-64` — сохранить.

## Out of scope

- Mesh view-only, `VerticalPostCarousel` count, Razbor, `/schedule` tree → **C-58 / C-59**
- Backend, Prisma, prod publish
- Английский nav (регресс C-54)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Счётчик + MenuVertical + wire сайдбара | **Frontend** | 21st-first |
| Hover-стрелка / accordion spring | **Motion** | после DOM; `{ damping: 25, stiffness: 300 }` |
| Backend / AI Bridge | — | **не звать** |

## Contracts

```
Launchpad header: NO selection counter string
Sidebar = MenuVertical(framer-motion) + existing NAV_ITEMS filter
Studio children typography < parent text-sm
Hover accent = var(--accent-gold)
```

`decisions.md`: `21st id=… · element=menu-vertical · motion=yes`.

## Acceptance criteria (язык Клиента)

1. На `/studio` нет «Ничего не выбрано» и «1 выбран» (S9).
2. Сайдбар выглядит как MenuVertical: на наведении стрелка; пункты ~sm; модули Студии чуть мельче.
3. Подписи по-русски. ADMIN по-прежнему **не** видит «Холст»; OWNER видит.
4. Клик модуля Студии ведёт на `/studio/[id]` как сейчас.

## Risks

- Демо 21st раздует кегль — жёсткий lock `text-sm` / children `text-[13px]`|`text-xs`.
- Сломать `ownerOnly` при переносе items.
- Overlap `SidebarNavigation` с C-59 **запрещён параллельно** — тикеты строго по очереди.

## Mid-flight escalation

- Нужен отдельный мобильный drawer-nav — новый тикет, не ломать desktop `w-64` в этом ходе.
- 21st 401 → fallback luxury MenuVertical **всё равно** `framer-motion` + gold hover; не сток-список без стрелки.
