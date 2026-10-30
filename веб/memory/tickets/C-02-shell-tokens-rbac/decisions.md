# Decisions — C-02

| When | Role | Decision |
|------|------|----------|
| 2026-09-16 | Orchestrator | В волне W-2026-09-16-sprint1; RBAC mock via zustand |
| 2026-09-16 | Architect | Locked path split: C-02 owns `app/globals.css` tokens (ARCHITECTURE §2, not atelier peach), fonts in `app/layout.tsx`, `components/shell/**`, `lib/cn.ts`, `lib/session-store.ts` (default OWNER), routes studio/analytics/admin/mesh/schedule/brand-kit; ADMIN mesh → `/studio`. Motion only `components/shell/**`. No `components/ui/**` (C-03). No Backend/AI Bridge. |
| 2026-09-16 | Frontend | Tokens Deep Matte Dark Luxury in `globals.css`; Inter + JetBrains Mono + Noto Sans Armenian via next/font; AppShell + Sidebar (Canvas OWNER-only); QA role switcher; client gate ADMIN→`/studio` on `/admin/mesh`; `/` redirects to `/studio`. Left Motion shell spring unchecked. |
| 2026-09-16 | Motion | Shell enter: sidebar `opacity+x` spring 25/300 + light nav stagger; main `opacity+y`. `useReducedMotion` → instant. RBAC/filter untouched. No ui/tokens/routes. |
| 2026-09-16 | Tester | GREEN. Tokens `--bg-canvas`/#08090a + accents verified; Sidebar `ownerOnly` OWNER-only; mesh ADMIN → `/studio`; Noto Armenian in layout; anti-slop OK; sprint1-guards GREEN. No Fixer. |
| 2026-09-16 | Fixer | N/A / skipped — Tester reported GREEN; no code fix. |
| 2026-09-16 | Deployer | Localhost only. Reused running `npm run dev` on `:3000`. Verified `http://127.0.0.1:3000/studio` → HTTP 200. No VPS/prod. Client URL: `http://127.0.0.1:3000/studio`. |
