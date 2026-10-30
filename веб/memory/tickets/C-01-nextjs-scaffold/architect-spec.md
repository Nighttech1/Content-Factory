# Architect spec — C-01

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Поднять Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 в корне репозитория так, чтобы `npm run dev` открывал приложение на `http://127.0.0.1:3000/`. Установить зависимости Спринта 1.1 из `DEV_PLAN.md`. Без продуктового shell/RBAC/примитивов — это C-02 / C-03.

## In scope

- Scaffold через `create-next-app` (или эквивалент) в корне workspace: App Router, TS strict, Tailwind v4, ESLint по умолчанию шаблона.
- Корневые конфиги: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` (+ то, что создаёт шаблон: `eslint.config.*`, `.gitignore` Next — если ещё нет).
- Минимальный bootstrap `app/`: `layout.tsx`, `page.tsx`, `globals.css` из шаблона (заглушка; токены Dark Luxury — C-02).
- Установка deps: `@xyflow/react`, `framer-motion`, `lucide-react`, `zustand`, `@tanstack/react-query`, `zod`, `clsx`, `tailwind-merge`.
- Проверка: `npm run dev` поднимает страницу без ошибок сборки.

## Out of scope

- App Shell, Sidebar, RBAC, маршруты `/studio`, `/analytics`, `/admin/mesh`, `/schedule`, `/brand-kit` → **C-02**.
- CSS-токены Dark Luxury, шрифты Inter / JetBrains Mono / Noto Sans Armenian → **C-02**.
- `GlassCard` / `NeonBadge` / `ReactiveButton` → **C-03**.
- Backend, Prisma, Redis/BullMQ, API routes, AI Bridge, HeyGen, Remotion workers.
- Prod/VPS deploy.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Scaffold / deps | Frontend | Единственный исполнитель кода |
| Motion | — | Не требуется (нет UI-анимаций) |
| API / data | — | Нет Backend в волне |
| AI bridge | — | Нет AI Bridge в волне |
| QA | Tester → Fixer | smoke `npm run dev` + guards |
| Localhost | Deployer | поднять для Клиента |
| Приёмка | Client | URL `/` отвечает |

## Contracts

- **Runtime:** Node + `npm`; скрипты `dev` / `build` / `start` из Next 15.
- **App entry:** App Router root `app/`; корневой redirect/landing допустим как дефолт create-next-app (уточнение home → `/studio` — C-02).
- **Deps versions:** Next 15.x, React 19.x, Tailwind v4; остальные — совместимые с ними latest stable на момент установки.
- **Path lock vs C-02/C-03:** после C-01 Frontend **не** трогает `components/shell/**`, `components/ui/**`, `lib/session-store.ts`. `app/globals.css` / `app/layout.tsx` после scaffold переходят к C-02 для токенов и шрифтов.

## Acceptance criteria (язык Клиента)

1. В корне есть `package.json`, конфиги Next/TS/Tailwind/PostCSS; команда `npm run dev` стартует без падения.
2. В браузере открывается `http://127.0.0.1:3000/` (страница-заглушка Next допустима).
3. В `package.json` присутствуют все зависимости из тикета (xyflow, framer-motion, lucide, zustand, tanstack query, zod, clsx, tailwind-merge).
4. Нет требований к тёмной теме, сайдбару или примитивам на этом тикете.

## Risks

- Scaffold в непустом корне (memory/, docs/) — использовать флаги create-next-app «в текущую директорию» осторожно; не затирать `ARCHITECTURE.md` / `DEV_PLAN.md` / `memory/`.
- Tailwind v4 vs v3 шаблоны — явно зафиксировать v4 (`@tailwindcss/postcss` / CSS-first), чтобы C-02 мог писать CSS-переменные в `globals.css`.
- Параллельная правка `app/` с C-02 запрещена: C-01 завершает scaffold до старта C-02 Frontend.

## Mid-flight escalation

Если в ходе фикса выяснилось, что контракт неверный: **стоп** → Оркестратор возвращает Архитектора → правка spec + chain → продолжение.
