# Architect spec — C-21

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

**Plugin Slot** на `/studio` (DEV_PLAN **6.3**): модалка `[+ Register New Module]` с полей title / output type / worker endpoint; после сохранения кастомный модуль появляется новой плиткой. Localhost persistence OK; без prod publish и без секретов. Реестр и API регистрации опираются на **C-19**; ядровые M1–M4 уже выбираемы (**C-20** желателен до Client-приёмки).

## Depends on

- **C-19** (registry + `registerModule` + types) — hard.
- **C-20** — soft for engineering start; **hard for Client acceptance** («adapters already selectable»).

## In scope

### UI (Frontend)

- Включить кнопку Add в `components/studio/ModuleSelectorGrid.tsx` (`disabled` → opens modal).
- Новый компонент: `components/studio/RegisterModuleModal.tsx` (имя близкое OK).
  - Dark Luxury glass (токены Studio / `GlassCard` / existing dialog primitives если есть).
  - Fields:
    1. **Title** (string, required)
    2. **Output type** UI: `Video` | `Carousel` | `Graphic` → map:
       - Video → `video_9_16`
       - Carousel → `carousel_4_5`
       - Graphic → `single_image`
    3. **Worker API endpoint** (URL string, required; validate `http(s)://` or relative `/api/...`)
  - Actions: Cancel / Register.
  - a11y: focus trap / Esc / `aria-modal`; `data-testid="register-module-modal"`.
- После Register: новая плитка в сетке; selectable; `data-module-id` = generated id (`custom-{slug}` или `cuid`).
- Copy: заголовок модалки `[+ Register New Module]` / RU вариант согласованный со Studio («Зарегистрировать модуль»).

### Registry wire (Frontend + thin Backend)

- Client persistence: `localStorage` key `cf.customModules.v1` **или** JSON file via API `data/local/custom-modules.json` (gitignored) — выбрать одно в `decisions.md` (рекомендация: **localStorage** для чистого FE + `registerModule` in-memory на клиенте **или** POST `/api/modules/register` writing gitignored JSON for SSR consistency).
- Рекомендованный контракт:

```typescript
// POST /app/api/modules/register/route.ts
body: { title: string; outputFormat: ModuleOutputFormat; workerEndpoint: string }
→ { manifest: ContentModuleManifest }
// registers a RemoteContentModule stub that proxies generateDraft to workerEndpoint (mock if unreachable)
```

- `RemoteContentModule` / `src/modules/custom-remote/factory.ts`: implements `IContentModule`; `generateDraft`/`renderAsset` fetch workerEndpoint with timeout; on failure → mock draft + `{ mock: true }` (localhost Client-safe).
- Boot: hydrate custom manifests from store → `registerModule` (не дублировать core ids).
- Mesh auto-node — **out of scope** (optional future).

### Styling

- Согласовано с `ModuleSelectorGrid` / GlassCard; без нового purple theme; Armenian glyphs в title OK.

## Out of scope

- SSE live progress → Sprint 7.
- Prod marketplace / signing plugins / npm install remote code.
- Executing arbitrary JS from endpoint (только HTTP JSON contract).
- Changing M1–M4 adapter internals (C-20).
- OWNER-only restriction на Add (Studio доступен ADMIN+OWNER; slot для админов OK).
- VPS/prod deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Modal + grid enable + local hydrate UI | **Frontend** | `content-factory-ui`, `content-module-sdk` |
| Optional `POST /api/modules/register` + remote stub factory | **Backend** | если не pure-localStorage; mock-safe fetch |
| Motion (optional open/close) | skip unless needed | spring already in Studio |
| QA | Tester → Fixer | modal fields; tile appears; core still 4; anti_slop |
| Localhost | Deployer | |
| Приёмка | Client | scenario: Add → fill → Register → new tile |

## Contracts

### UI → registry

| UI label | `outputFormat` |
|----------|----------------|
| Carousel | `carousel_4_5` |
| Graphic | `single_image` |
| Video | `video_9_16` |

### Manifest defaults for custom

```typescript
{
  id: `custom-${slug}`,
  title,
  description: `Custom worker · ${workerEndpoint}`,
  version: '0.1.0',
  outputFormat,
  icon: 'Puzzle',
  defaultSettings: { workerEndpoint },
  inputSchema: z.object({ topic: z.string() }),
}
```

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `components/studio/ModuleSelectorGrid.tsx` | `src/modules/carousel-engine/**` bodies (C-20) |
| `components/studio/RegisterModuleModal.tsx` (new) | HeyGen gateway secrets |
| `components/studio/modules.ts` / hooks for custom list | Prisma reset |
| `app/api/modules/register/route.ts` (opt) | force social publish |
| `src/modules/custom-remote/**` or `src/modules/registry.ts` (register API only) | mesh RBAC rewrite |
| `data/local/.gitignore` if file persist | commit custom endpoint secrets |

## Acceptance criteria (язык Клиента)

1. На `/studio` клик по «[+ Добавить модуль]» открывает модалку регистрации.
2. Можно ввести название, тип вывода (Video / Carousel / Graphic) и URL воркера; после «Register» модалка закрывается.
3. Появляется **новая** плитка модуля; её можно выбрать (Selected).
4. Четыре ядровых модуля по-прежнему на месте и выбираются (после C-20 — с mock-генерацией).
5. Стиль модалки совпадает с Dark Luxury Studio; нет горизонтального скролла на 1440.
6. Обновление страницы: кастомный модуль **сохраняется** (localStorage или local JSON) на localhost.
7. Нет ключей в git; недоступный worker endpoint не роняет страницу (mock/error toast OK).

## Safety

- Не выполнять remote code — только HTTP JSON.
- Не хранить API keys в localStorage (только endpoint URL).
- Data safety: не wipe DB/Redis/media.
- Mock-first если worker down.

## Risks

- SSR/client registry split — hydrate on client before paint or accept flash; document in decisions.
- Id collision with core — reject register if id reserved.
- Starting C-21 before C-20 Client — UI OK; full Client verdict waits M1–M4.

## Mid-flight escalation

Нужен Mesh «Add Pipeline Module» sync → отдельный тикет; не блокировать Studio slot.
