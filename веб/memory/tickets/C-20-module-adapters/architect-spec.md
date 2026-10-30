# Architect spec — C-20

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Реализовать **изолированные адаптеры** четырёх ядровых модулей (DEV_PLAN **6.2**), каждый как полноценный `IContentModule` в `src/modules/{id}/`, с mock-first поведением на localhost **без** обязательного `HEYGEN_API_KEY` / GPU / Redis. Связать с существующими worker-скиллами `workers/designer-*` (контракты/промпты), не ломая HITL и не публикуя в соцсети.

## Depends on

**C-19 Done** (types + registry + stubs). Если stubs — заменить тела методов; манифесты не ломать без `decisions.md`.

## In scope

### Shared contracts (Backend)

- Уточнить/расширить `DraftOutput` / `AssetRenderResult` при необходимости (additive fields only).
- Общий helper (опц.): `src/modules/_shared/mock-assets.ts` — placeholder PNG/MP4 paths или data-URL stubs под Inspector.
- Общий helper (опц.): `src/modules/_shared/brand-context.ts` — чтение brand-lock **текстом** из `workers/_shared/brand-lock.md` (path resolve); без записи секретов.
- Точка вызова из API (тонкий facade, без полного BullMQ Sprint 7):  
  - `app/api/modules/[moduleId]/generate/route.ts` **или** `lib/modules/run-module.ts` — `getModule(id).generateDraft` → optional `renderAsset`.  
  - Localhost: синхронный mock OK; не блокировать UI долгим Remotion.

### Module 1 — `carousel-engine`

| Method | Behavior |
|--------|----------|
| `generateDraft` | topic → mock slides[] (3–8) с `index`, тексты RU/HY-safe placeholders, layout id |
| `renderAsset` | map → HTML/CSS template **1080×1350**; mock: вернуть массив asset URLs (`mock: true`) без Puppeteer если нет headless; real path optional behind flag |
| `regenerateElement` | reroll **одного** slide index |

Paths: `src/modules/carousel-engine/**`, bridge notes → `workers/designer-carousel/SKILL.md` (не дублировать brand rules в git secrets).

### Module 2 — `aesthetic-graphics`

| Method | Behavior |
|--------|----------|
| `generateDraft` | topic → card/quote/cheat payload |
| `renderAsset` | SVG / Tailwind-card string or static mock PNG; `outputFormat: single_image` |
| `regenerateElement` | reroll one card |

Paths: `src/modules/aesthetic-graphics/**` ↔ `workers/designer-graphics/`.

### Module 3 — `cartoon-reels`

| Method | Behavior |
|--------|----------|
| `generateDraft` | topic → Remotion/Lottie scene JSON (beats, captions) |
| `renderAsset` | **mock-safe:** без GPU вернуть mock MP4 path / poster + `{ mock: true }`; real Remotion только если явно `ENABLE_REMOTION_RENDER=1` и worker готов |
| `regenerateElement` | reroll one beat/scene |

Paths: `src/modules/cartoon-reels/**` ↔ `workers/designer-cartoon/`. Skills: `remotion-pipeline`, `bullmq-job-queue` (enqueue **optional**; default sync mock).

### Module 4 — `heygen-reels`

| Method | Behavior |
|--------|----------|
| `generateDraft` | topic + persona options → script lines for avatar |
| `renderAsset` | **HeyGen gateway:** если нет `HEYGEN_API_KEY` → mock stream/MP4 URL + `{ mock: true }` + feedbackLog `heygen=mock`; если ключ есть → вызов API через AI Bridge gateway module |
| `regenerateElement` | reroll line / segment |

Paths:
- Backend adapter: `src/modules/heygen-reels/**`
- AI Bridge gateway: `lib/ai/heygen-gateway.ts` (или `src/modules/heygen-reels/gateway.ts` owned by AI Bridge) — **единственное** место чтения `process.env.HEYGEN_API_KEY`
- Prompts: `workers/designer-heygen/` prompt snippets / `lib/ai/prompts/heygen-*.ts`
- Skills: `heygen-avatar`, `prompt-engineering`, `content-pipeline-agents`

### AI Bridge ownership

- Промпты generateDraft для M1–M4 (короткие template strings / versioned files) — **не** хардкодить секреты.
- HeyGen HTTP client + error → human message в `feedbackLogs`.
- Sufficiency: без ключа **не** падать 500 на `/studio`; всегда mock path.

### `.env.example`

```
HEYGEN_API_KEY=
ENABLE_REMOTION_RENDER=0
# REDIS_URL=   # optional; adapters mock without BullMQ
```

## Out of scope

- Plugin Slot UI / custom module persistence → **C-21**.
- Live SSE progress UI → Sprint 7.
- Auto-publish / Publisher worker / HITL bypass.
- Prisma schema changes; migrate reset; wipe volumes.
- Полный Puppeteer/Satori production farm; Mesh telemetry.
- Rewriting Inspector UI (может потреблять mock assets as-is).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Adapters M1–M3 + shared mock helpers + API facade | **Backend** | `content-module-sdk`, `remotion-pipeline`, `bullmq-job-queue` (optional enqueue) |
| HeyGen gateway + module prompts (M1–M4 draft copy) | **AI Bridge** | `heygen-avatar`, `prompt-engineering`, `content-pipeline-agents` |
| (Optional thin) Studio Generate вызывает facade | **Frontend** | только если Generate ещё не бьёт в API; иначе skip |
| QA | Tester → Fixer | mock без ключа; с ключом — не логировать secret |
| Localhost | Deployer | mock path green |
| Приёмка | Client | выбор M1–M4; draft/render mock без HeyGen |

## Contracts

### HeyGen gateway (conceptual)

```typescript
// lib/ai/heygen-gateway.ts
createAvatarVideo(input: {
  script: string;
  avatarId?: string;
  voiceId?: string;
}): Promise<{ url: string; mock: boolean; providerJobId?: string }>
// if !process.env.HEYGEN_API_KEY → { url: MOCK_MP4, mock: true }
```

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `src/modules/**` (bodies) | `components/studio/*Plugin*`, Add-module modal (C-21) |
| `lib/ai/heygen-gateway.ts`, `lib/ai/prompts/**` | commit `.env` |
| `lib/modules/run-module.ts` or `app/api/modules/**` | `prisma migrate reset` |
| `workers/designer-*/**` (prompts/PLUGINS only; no keys) | wipe `generatedMedia` |
| `.env.example` | Mesh RBAC / analytics cron |

## Acceptance criteria (язык Клиента)

1. Для каждого из четырёх модулей можно получить черновик (`generateDraft`) на localhost **без** ключа HeyGen и без GPU.
2. `renderAsset` возвращает понятный результат: картинки/видео-заглушки с флагом mock **или** реальный URL только если ключ/флаг включены.
3. Кнопка перегенерации элемента (API/метод `regenerateElement`) меняет **один** элемент, не весь набор (проверка Tester unit/smoke).
4. При отсутствии `HEYGEN_API_KEY` модуль HeyGen **не** роняет приложение и не пишет ключ в логи.
5. В git нет секретов; `.env.example` только пустые имена переменных.

## Safety

- Secrets only `.env` (gitignored).
- **Запрет:** migrate reset, DROP, truncate shared DB, delete Redis/Postgres volumes, force-publish social.
- Mock-first Client acceptance — **не** требовать live HeyGen.
- Brand lock: adapters не inventят палитру вне токенов; mock assets могут быть нейтральными placeholders с пометкой mock.

## Risks

- Remotion heavy — default mock; иначе блокирует Next request.
- Mixing gateway in Frontend — **отклонено**; только server/AI Bridge.
- C-19 stubs throw vs mock — Backend выравнивает на mock-success для Client.

## Mid-flight escalation

Нужен полный BullMQ worker process → зафиксировать в `decisions.md`, минимальный enqueue + sync mock fallback; не блокировать C-21.
