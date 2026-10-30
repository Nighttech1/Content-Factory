# Chain — C-10



> Оркестратор зовёт следующую роль только после checkbox.  

> **Запрет:** параллелить FE с C-11/C-12 на `components/inspect/**`, `lib/inspect-*`, `app/studio/inspect/**`.  

> Старт: **Frontend C-10 первым** в волне Sprint 4. Backend / AI Bridge / BullMQ / HeyGen API — **нет**.



| # | Role | Paths | Done | Notes |

|---|------|-------|------|-------|

| 1 | Frontend | `app/studio/inspect/[id]/page.tsx` (create), `components/inspect/InspectorShell.tsx`, `components/inspect/InspectBreadcrumb.tsx`, `components/inspect/MediaDeck.tsx`, `components/inspect/PreviewModeToggle.tsx`, `components/inspect/ReelsPlayer.tsx`, `components/inspect/KaraokeCaptions.tsx`, `components/inspect/CarouselDeck.tsx`, `components/inspect/InspectControlPanel.tsx` (stub), `components/inspect/HitlToolbar.tsx` (stub), `lib/inspect-mock.ts`, `lib/inspect-store.ts`, `package.json` (+ lock) — add `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` | [x] | Skills: `content-factory-ui`, `image-to-luxury-ui`, `luxury-web-craft`. Reuse GlassCard/NeonBadge/ReactiveButton. Full store API for C-11/C-12. |

| 2 | Motion | `components/inspect/InspectorShell.tsx`, `components/inspect/MediaDeck.tsx`, `components/inspect/PreviewModeToggle.tsx`, `components/inspect/ReelsPlayer.tsx`, `components/inspect/CarouselDeck.tsx` | [x] | skill `web-motion-engine`; entrance + mode crossfade; spring `{ damping: 25, stiffness: 300 }`; `useReducedMotion` |

| 3 | Tester | `memory/tickets/C-10-inspect-media-deck/guards.md` | [x] | route 200; mode toggle; DnD reorder; `--font-hy` captions; anti-slop |

| 4 | Fixer | paths Frontend+Motion выше (если красное) | [ ] | архитектуру не менять |

| 5 | Deployer | localhost `:3000` | [x] | `/studio/inspect/demo` HTTP 200; sync local API if any; не VPS |

| 6 | Client | приёмка C-10 | [x] | левая дека; полный S2 после C-11/C-12 — ПРИНЯТО 2026-09-18 |



Порядок: **Frontend → Motion → Tester → Fixer → Deployer → Client**.



**Волна:** после Done Frontend(+Motion) C-10 → Оркестратор стартует **C-11 Frontend**. Не параллелить.


