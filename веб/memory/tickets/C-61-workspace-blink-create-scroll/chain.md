# Chain — C-61

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны:** C-60 → **C-61** → C-62.  
> **Старт после C-60.** Не трогать `SidebarNavigation` / `AppShell` / `RazborModal` / `DraftsPanel` / `RazborCarouselToggle`.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/StudioModuleWorkspace.tsx` (убрать `// Рабочая страница`; `useCallback` search; loading split; glow «Создать» + `openDraftEditor`), `components/studio/workspace/VerticalPostCarousel.tsx` (нет opacity pulse на title/count; nested scroll contain+wheel), `components/ui/glow-button.tsx` (**новый**, 21st `@waleedkibhen/components/glow-button` → `framer-motion`) | [x] | MCP unavailable; glow adapted; `workspace-create-btn`; ours loading only first empty; no header animate-pulse |
| 2 | Motion | header chrome static; glow hover; column scroll без page jank | [x] | **запрет** `opacity: [0.55,1,0.55]` infinite; title/count `opacity-100`; spring glow only |
| 3 | Tester | `memory/tickets/C-61-workspace-blink-create-scroll/guards.md`; S13; smoke: нет pulse-keyframes на header; search callback стабилен | [x] | guards PASS; header opacity-100; loading split; no Fixer |
| 4 | Fixer | _(если красное)_ | [ ] | Surgical; не начинать C-62 |
| 5 | Deployer | localhost `/studio/carousel-engine` + `/studio/aesthetic-graphics` | [x] | :3000; `/studio` + `/studio/carousel-engine` 200 |
| 6 | Client | приёмка | [ ] | S13 |

Skills: `content-factory-ui`, `21st-ui-catalog`, `taste-skill`, `web-motion-engine`, `mobile-touch-scroll`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
