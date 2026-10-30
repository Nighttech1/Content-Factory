# C-01 — Next.js 15 scaffold + deps

| Field | Value |
|-------|-------|
| **ID** | `C-01` |
| **Priority** | P0 |
| **Area** | shell_nav / init |
| **Status file** | [status.md](status.md) |

## Repro

1. В корне проекта нет `package.json` / `app/` / Next.js.
2. Нельзя открыть Studio на localhost.

**URL:** `http://127.0.0.1:3000/` (после scaffold)

## Expected

- Next.js 15 App Router, TypeScript, Tailwind CSS v4.
- Зависимости: `@xyflow/react`, `framer-motion`, `lucide-react`, `zustand`, `@tanstack/react-query`, `zod`, `clsx`, `tailwind-merge`.
- `npm run dev` поднимает приложение.

## Actual

Репозиторий без продуктового UI-приложения.

## Notes for Orchestrator

Зона: Frontend (scaffold). Backend / AI Bridge не нужны.
