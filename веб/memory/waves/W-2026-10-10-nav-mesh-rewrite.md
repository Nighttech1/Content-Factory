# Wave W-2026-10-10 Nav / Mesh rewrite

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-10-nav-mesh-rewrite` |
| **Date** | 2026-10-10 |
| **Status** | open |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **full-queue** (не 3) |
| **Trainer grade** | A — `memory/trainer/2026-10-10-nav-mesh-rewrite-grade.md` |
| **Skills** | `content-factory-ui`, `xyflow-agent-mesh` (**C-137 clean-slate**), `web-motion-engine` (C-131), `content-factory-analytics` (C-136 entry), `client-scenarios` S36–S38 |

## Intent

Full-queue после product intent: emblem-only brand; hydration ban; sidebar IA (Studio / Schedule / Settings only); Mesh + Analytics = module top nav; Century Gothic meta 12px / titles 16px; carousel crossfade без чёрной вспышки; Razbor composer + circular red X; **FULL rewrite** «Команда выпуска» clean-slate (flowchart + Agent inspector), delete legacy xyflow canvas.

## Route decision (LOCKED)

**Канон — nested under module (не query):**

| Surface | Canonical URL | Entry |
|---------|---------------|-------|
| Команда выпуска | `/studio/[moduleId]/mesh` | Top bar «Команда выпуска» на `/studio/[moduleId]` |
| Аналитика модуля | `/studio/[moduleId]/analytics` | Top bar «Аналитика» на `/studio/[moduleId]` |

- **RBAC:** mesh — OWNER only (как `/admin/mesh`); ADMIN → deny / redirect studio.
- **Legacy:** `/admin/mesh` и global `/analytics` — thin **redirect/shim** на nested (или last/default module); **не** primary entry. Sidebar **не** содержит Mesh / Analytics.
- **Запрет query-primary** (`?module=` / `?view=mesh`) как канон волны — только nested path clarity.

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| C-133 | P0 | `memory/tickets/C-133-hydration-nav-brand/` | pending |
| C-130 | P0 | `memory/tickets/C-130-emblem-brand/` | pending |
| C-136 | P0 | `memory/tickets/C-136-nav-ia-module-top/` | pending |
| C-132 | P1 | `memory/tickets/C-132-card-meta-12px/` | pending |
| C-131 | P0 | `memory/tickets/C-131-carousel-crossfade/` | pending |
| C-134 | P1 | `memory/tickets/C-134-titles-16px/` | pending |
| C-135 | P1 | `memory/tickets/C-135-razbor-composer/` | pending |
| C-137 | P0 | `memory/tickets/C-137-mesh-clean-slate/` | pending |

## Path lock (последовательность — НЕ parallel overlap)

1. **Shell one path:** **C-133 → C-130 → C-136** (`SidebarNavigation` / AppShell / module top nav) — sequential only  
2. **Feed cards:** **C-132 → C-131** (+ Motion crossfade) — `FeedPostCard` / `VerticalPostCarousel`  
3. **Razbor modal:** **C-134 → C-135** — one Razbor path  
4. **Mesh rewrite last:** **C-137** **after** C-136 (entry depends on nested routes); Frontend + Motion; Backend Agent types optional same path; **delete** old canvas — no parallel FE on mesh files  

Затем: **Tester** (guards S36–S38) → **Fixer** → **Deployer** (localhost) → **Client** (Playwright HARD; S37 mesh rewrite).

## Wave chain (roles)

```text
Тренер (done, A) → Архитектор (этот артефакт + tickets)
  → Frontend SHELL:     C-133 → C-130 → C-136
  → Frontend FEED:      C-132 → C-131 (+ Motion)
  → Frontend RAZBOR:    C-134 → C-135
  → Frontend+Motion MESH: C-137 (AFTER C-136; delete legacy; new flowchart+inspector)
       Backend Agent type fields — same mesh path if persist needed
  → Tester → Fixer → Deployer → Client
```

**Запрет:** параллелить shell tickets; mesh C-137 параллельно с кем-то на тех же mesh files; «патч старого xyflow» рядом с delete.  
**Исключение лимита:** full-queue — не резать на пачки по 3.

## Supersedes

| Prior | By |
|-------|-----|
| C-122 brand PNG+text | **C-130** emblem-only |
| C-124 / C-125 / C-129 mesh static / dual-lane / labels | **C-137** clean-slate (intent dual-lane retained) |
| Sidebar Mesh/Analytics IA | **C-136** module top nav |
| Carousel hard cut (wave3) | **C-131** crossfade |

## Chain.md index

| Ticket | chain |
|--------|-------|
| C-133 | `memory/tickets/C-133-hydration-nav-brand/chain.md` |
| C-130 | `memory/tickets/C-130-emblem-brand/chain.md` |
| C-136 | `memory/tickets/C-136-nav-ia-module-top/chain.md` |
| C-132 | `memory/tickets/C-132-card-meta-12px/chain.md` |
| C-131 | `memory/tickets/C-131-carousel-crossfade/chain.md` |
| C-134 | `memory/tickets/C-134-titles-16px/chain.md` |
| C-135 | `memory/tickets/C-135-razbor-composer/chain.md` |
| C-137 | `memory/tickets/C-137-mesh-clean-slate/chain.md` |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** Architect done → Frontend shell → … → Client S36–S38

**Full-queue:** не останавливаться на пачке из 3 — закрыть всю очередь с guards.
