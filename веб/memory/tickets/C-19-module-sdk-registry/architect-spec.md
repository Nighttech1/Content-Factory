# Architect spec — C-19

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Greenfield **Module SDK foundation** (DEV_PLAN **6.1** / ARCHITECTURE §4): типы `ContentModuleManifest` + `IContentModule`, реестр `src/modules/registry.ts`, stub-пакеты четырёх ядровых модулей. Studio может читать список модулей из реестра (тонкая проводка), без реализации адаптеров (→ C-20) и без Plugin Slot modal (→ C-21).

## In scope

- **Типы** в `types/module.ts` (корень репо, рядом с будущими shared types):
  - `ContentModuleManifest` — поля как в ARCHITECTURE §4 (`id`, `title`, `description`, `version`, `outputFormat`, `icon`, `defaultSettings`, `inputSchema`).
  - `IContentModule` — `manifest` + `generateDraft` / `renderAsset` / `regenerateElement`.
  - Вспомогательные типы результатов: `DraftOutput`, `AssetRenderResult`, `ElementOutput` (минимальные контракты — см. Contracts; тело уточняет Backend, имена полей зафиксировать в `decisions.md` при отклонении).
  - `outputFormat`: `'carousel_4_5' | 'video_9_16' | 'single_image'`.
  - Zod: `inputSchema` как `z.ZodTypeAny` (или `ZodSchema` alias); зависимость `zod` уже в проекте.
- **Реестр** `src/modules/registry.ts`:
  - API: `registerModule(mod)`, `getModule(id)`, `listModules()`, `listManifests()`.
  - Статическая регистрация 4 core stubs при импорте (динамический `import()` папок — допустим; на localhost достаточно eager register из `src/modules/*/index.ts`).
  - **Не** читать секреты; **не** вызывать HeyGen/Remotion.
- **Stub-модули** (только манифест + no-op / throw-`NotImplemented` методы — реальная логика в C-20):

  | Canonical `id` | Папка | `outputFormat` | Worker map |
  |----------------|-------|----------------|------------|
  | `carousel-engine` | `src/modules/carousel-engine/` | `carousel_4_5` | `workers/designer-carousel` |
  | `aesthetic-graphics` | `src/modules/aesthetic-graphics/` | `single_image` (и multi-card как массив assets) | `workers/designer-graphics` |
  | `cartoon-reels` | `src/modules/cartoon-reels/` | `video_9_16` | `workers/designer-cartoon` |
  | `heygen-reels` | `src/modules/heygen-reels/` | `video_9_16` | `workers/designer-heygen` |

  Каждая папка: `manifest.ts` + `index.ts` (`export const module: IContentModule`).
- **ID bridge (обязательное решение):** текущий Studio (`components/studio/modules.ts`) использует legacy ids:
  - `carousel-4-5` → `carousel-engine`
  - `infographics` → `aesthetic-graphics`
  - `cartoon-reels` → `cartoon-reels` (без смены)
  - `heygen-avatar` → `heygen-reels`

  Вынести `STUDIO_MODULE_ID_ALIASES` / `toCanonicalModuleId` / `toStudioModuleId` в `types/module.ts` **или** `src/modules/id-map.ts`. После C-19 канон в store/registry — **SDK ids**; legacy aliases принимаются на входе и нормализуются.
- **Тонкая Frontend-проводка (опционально, но желательно в том же тикете):**
  - `components/studio/modules.ts` → реэкспорт/`listManifests()` → плитки из registry (labels/descriptions из `manifest`).
  - `lib/studio-store.ts`: `selectedModuleId` хранит **canonical** id; миграция alias при set.
  - Кнопка `[+ Добавить модуль]` остаётся **disabled** до C-21 (не открывать modal).
- Unit/smoke: список из registry содержит ровно 4 core id; `getModule('heygen-reels')` возвращает stub без env.

## Out of scope

- Реальная реализация `generateDraft` / `renderAsset` / `regenerateElement` → **C-20**.
- HeyGen gateway, Remotion/Lottie render, Satori/Puppeteer → **C-20**.
- Plugin Slot modal / localStorage custom modules → **C-21**.
- Mesh node auto-add на `/admin/mesh` (можно заложить hook `listManifests` позже; **не** трогать xyflow в C-19).
- SSE / BullMQ job wiring → Sprint 7 / отдельные тикеты.
- Prisma schema changes, migrate reset, prod deploy.
- Секреты в memory/git; запись `HEYGEN_API_KEY` куда-либо кроме `.env.example` комментария (опц.).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| `types/module.ts`, `src/modules/**`, id-map, registry | **Backend** | skills: `content-module-sdk`, `backend` |
| Thin Studio list wire (`modules.ts`, store id normalize) | **Frontend** | skills: `content-factory-ui`; без новой модалки |
| QA | Tester → Fixer | registry shape + alias map + no secrets |
| Localhost | Deployer | `/studio` 200; плитки видны |
| Приёмка | Client | 4 модуля из registry; Add disabled |

## Contracts

### Types (document — Backend implements)

```typescript
// types/module.ts — shape per ARCHITECTURE §4
export type ModuleOutputFormat = 'carousel_4_5' | 'video_9_16' | 'single_image';

export interface ContentModuleManifest {
  id: string;
  title: string;
  description: string;
  version: string;
  outputFormat: ModuleOutputFormat;
  icon: string; // Lucide key, e.g. "Layers"
  defaultSettings: Record<string, unknown>;
  inputSchema: ZodTypeAny;
}

export interface DraftOutput {
  draftId: string;
  moduleId: string;
  topic: string;
  elements: Array<{ index: number; kind: string; payload: unknown }>;
  meta?: Record<string, unknown>;
}

export interface AssetRenderResult {
  draftId: string;
  assets: Array<{ url: string; mime: string; width?: number; height?: number }>;
  mock?: boolean;
}

export interface ElementOutput {
  draftId: string;
  elementIndex: number;
  payload: unknown;
  asset?: AssetRenderResult['assets'][number];
}

export interface IContentModule {
  manifest: ContentModuleManifest;
  generateDraft(topic: string, options?: Record<string, unknown>): Promise<DraftOutput>;
  renderAsset(draft: DraftOutput): Promise<AssetRenderResult>;
  regenerateElement(draftId: string, elementIndex: number): Promise<ElementOutput>;
}
```

### Registry API

```typescript
// src/modules/registry.ts
registerModule(mod: IContentModule): void
getModule(id: string): IContentModule | undefined  // accepts alias → canonical
listModules(): IContentModule[]
listManifests(): ContentModuleManifest[]
```

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `types/module.ts` (new) | `workers/designer-*/**` implementation (C-20) |
| `src/modules/**` (new) | `components/studio/*Modal*` (C-21) |
| `components/studio/modules.ts` | `components/mesh/**`, xyflow |
| `lib/studio-store.ts` (id normalize only) | `.env` secrets; Prisma migrations |
| `.env.example` (optional comment `HEYGEN_API_KEY=`) | live API calls |

## Acceptance criteria (язык Клиента)

1. В репозитории есть типы модуля и реестр; четыре ядровых модуля зарегистрированы с ids из ARCHITECTURE (`carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`).
2. На `/studio` видны **четыре** карточки модулей (данные из registry / совместимый список); выбор модуля по-прежнему включает Generate Draft.
3. Кнопка «[+ Добавить модуль]» **ещё не** открывает окно регистрации (это C-21) — можно оставить disabled с понятным title.
4. В коде/git **нет** ключей HeyGen и нет вызовов внешних API из registry stubs.
5. Старые id Studio (`carousel-4-5`, `infographics`, `heygen-avatar`) либо больше не торчат наружу, либо прозрачно мапятся на канон — Tester проверяет alias.

## Safety

- **Запрет:** secrets в memory/tickets/git; `migrate reset`; wipe Postgres/Redis/media.
- Stubs не читают `.env` для ключей.
- Mock-first: методы stub могут возвращать пустой draft / `{ mock: true }` **или** `throw new Error('NotImplemented:C-20')` — выбрать одно в `decisions.md` (рекомендация Архитектора: **throw NotImplemented** на `renderAsset`/`regenerateElement`, `generateDraft` возвращает минимальный mock draft для smoke).

## Risks

- **ID drift** между Studio legacy и SDK — закрывается id-map в этом тикете; не оставлять двум мирам жить без bridge.
- Frontend может «затянуть» Plugin Slot — **отклонено**; modal только C-21.
- Дублирование констант в `modules.ts` и manifest — после wire источник правды = registry manifests.

## Mid-flight escalation

Нужен Mesh auto-node → новый тикет / Sprint 3 follow-up, не раздувать C-19.  
Нужна Zod-форма на каждый модуль сверх `z.object({})` → можно в C-19 minimal empty schema, детали input в C-20/C-21.
