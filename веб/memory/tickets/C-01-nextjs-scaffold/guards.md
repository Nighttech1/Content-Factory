# Guards — C-01

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| script | `package.json` содержит Next 15 + deps Sprint 1.1 (`@xyflow/react`, `framer-motion`, `lucide-react`, `zustand`, `@tanstack/react-query`, `zod`, `clsx`, `tailwind-merge`, Tailwind v4). Предотвращает «забытый scaffold / не те версии». | `scripts/sprint1-guards.mjs` (секция C-01) |
| file | Корневые конфиги `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `app/layout.tsx` существуют. Предотвращает битый App Router bootstrap. | `scripts/sprint1-guards.mjs` |
| smoke | `npm run dev` → `GET http://127.0.0.1:3000/` следует на `/studio` с HTTP 200. Предотвращает падение dev-сервера после scaffold. | ручной/Deployer smoke (2026-09-16: Tester подтвердил 200) |
| anti-slop | Нет indigo/violet AI-gradient slop в исходниках. | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Mirror in Client skill

Дублируй строку в `.cursor/skills/client-review/regression-guards.md`

Формат: `| C-xx | симптом | guard | путь |`
