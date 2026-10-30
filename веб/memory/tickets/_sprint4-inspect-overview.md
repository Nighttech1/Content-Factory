# Sprint 4 — Media Inspector overview

> Shared note for wave `W-2026-09-18-sprint4`. Specs live in C-10 / C-11 / C-12.

## Route

`/studio/inspect/[id]` → `app/studio/inspect/[id]/page.tsx`  
Demo URL: `http://127.0.0.1:3000/studio/inspect/demo`

## Component tree

```text
app/studio/inspect/[id]/page.tsx          ← C-10 (route shell only)
└── InspectorShell.tsx                    ← C-10
    ├── InspectBreadcrumb.tsx             ← C-10 (STAGE 04 / HITL)
    ├── MediaDeck.tsx                     ← C-10
    │   ├── PreviewModeToggle.tsx         ← C-10
    │   ├── ReelsPlayer.tsx               ← C-10 (9:16)
    │   │   └── KaraokeCaptions.tsx       ← C-10 (Noto --font-hy)
    │   └── CarouselDeck.tsx              ← C-10 (@dnd-kit sortable)
    └── right column (siblings, no shared edit)
        ├── InspectControlPanel.tsx       ← stub C-10 → fill C-11
        │   ├── ViralityMeter.tsx         ← C-11
        │   ├── HookAlternatives.tsx      ← C-11
        │   ├── ScriptEditor.tsx          ← C-11
        │   └── HeyGenPersonaSwitcher.tsx ← C-11
        └── HitlToolbar.tsx               ← stub C-10 → fill C-12
            └── ApproveScheduleModal.tsx  ← C-12
```

## Data

| File | Owner | Role |
|------|-------|------|
| `lib/inspect-mock.ts` | C-10 | Full seed shape for draft (media + hooks + persona + HITL fields) |
| `lib/inspect-store.ts` | C-10 | Zustand store with **all** actions; C-11/C-12 only consume |

## Path ownership (no FE parallel on same file)

| Ticket | Owns (write) | Must not edit |
|--------|--------------|---------------|
| **C-10** | page, shell, breadcrumb, MediaDeck tree, mock, store, **stubs** ControlPanel + HitlToolbar | — |
| **C-11** | InspectControlPanel + Virality/Hooks/Script/HeyGen | page, MediaDeck/*, HitlToolbar, mock/store (consume only) |
| **C-12** | HitlToolbar + ApproveScheduleModal | page, MediaDeck/*, InspectControlPanel children |

## Serial Frontend order

1. C-10 Frontend → Motion → …  
2. C-11 Frontend → Motion → …  
3. C-12 Frontend → Motion → …  

## Package deps (add in C-10)

`@dnd-kit/core` · `@dnd-kit/sortable` · `@dnd-kit/utilities`  
(not in `package.json` today; no HTML5-DnD fallback preferred)

## Skills

- Frontend: `content-factory-ui`, `image-to-luxury-ui`, `luxury-web-craft`, `heygen-avatar` (UI persona only)
- Motion: `web-motion-engine`
- Reuse: `GlassCard`, `NeonBadge`, `ReactiveButton`, `AppShell`

## Client Hard REJECT (S2)

Hook chip click **and** Approve & Schedule must visibly change UI on Playwright snapshot.
