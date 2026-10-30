## C-109 Path scroll flash
- shell__main::before position fixed + height 100dvh
- path / path-sphere / path__stack / blog-card--path solid dark underpaint
- media img background #0a1622
- warmMany(STOCK) on Path mount

## C-109 Habits 2-row / gutters / trash (W-2026-09-13-1)
- `.bio` desktop `--bio-gutter: 240px`; mobile ≤767 keeps 14px + safe-area
- `.bio__track`: `grid-template-rows: 1fr 1fr` + `grid-auto-flow: column`
- `habit-card__del` in `.habit-card__right`, not in `.habit-card__name-row`

## C-110 Logo (superseded by C-111)
- Prefer SputnikMarkIcon SVG in shell; jpg mark deprecated for chrome

## C-110 Sphere scroll / week CRUD / scrollbar (W-2026-09-13-1)
- `GoalColumn` `onDelete` X + `copyWeek` + `removeWeek` confirm
- `.goal-col__body` `data-lenis-prevent` + overflow-y auto + wheel stopPropagation
- `.sphere-card__scroll` scrollbar hidden (`scrollbar-width: none` + webkit none)

## C-111 HUD satellite logo
- AppShell `.shell__logo` = SputnikMarkIcon SVG (cyan stroke)

## C-111 Cortana daily/weekly retrieval (W-2026-09-13-1) — pending Fixer
- Filter/vector must emit/index day lines; week title = `text` **or** `label` (Life OS)
- pytest retrieval/digest/brief green; live TG blocked by C-95/C-96

## C-112 Sphere native icon
- SphereBoard identity = SphereHudIcon(sphere.id), not app mark

## C-120…C-122 Internal calendar (W-2026-09-15-CAL-1)
- Temporal: no Google Calendar iframe / calendar.google.com links in UI
- Sync key `calendar_events` + localStorage `sputnik.calendarEvents`
- Week grid Mon–Sun, viewDate = real today; «Сегодня» restores current week
- Event hover portal: task shows day + week% + month%; habit shows read-only habit card
- Guard: `memory/tickets/C-120-internal-calendar-sot/guards.md`

## C-123…C-125 Create cascade + Cortana calendar_* (W-2026-09-15-CAL-2)
- CreateEventDialog: type → yearly → monthly → week → day OR search; habits search
- Ops `calendar_list` / `calendar_move` / `calendar_delete` via HITL (≠ gcal_*)
- Guards: C-123/guards.md, C-124/guards.md

## C-126 / C-127 Temporal crash + VPS data local (W-2026-09-15-CAL-3)
- `monthDayCount` / `calcStreak` tolerate missing `completedDays`
- Temporal refreshes spheres/habits on `sputnik-sync`
- Localhost API seeded from VPS read-only (8 spheres / 12 habits)
- Guard: `memory/tickets/C-126-temporal-black-crash/guards.md`

## C-128…C-132 Calendar UX (W-2026-09-15-CAL-4/5)
- Hover: Задача недели/месяца + Годовая цель + sphere image ⅓
- Grid: PX_PER_HOUR=104, title+description wrap, status 3 buttons
- Drag/resize 15m snap; copy/delete; day-create under week; sphere color legend
- SphereStatsChart hours/% + snapshots + Архив modal
- Guard: `memory/tickets/C-128-cal-card-hover-content-status/guards.md`


## C-139 Habit donut under trash (W-2026-09-15-VPS-CAL)
- Donut absolute under .habit-card__del; journal left of donut; name not clipped by % ring
- Guard: memory/tickets/C-139-habit-donut-under-trash/guards.md

## C-01 Next.js scaffold (W-2026-09-16-sprint1)
- Next 15 + Tailwind v4 + Sprint 1.1 deps in root `package.json`; `npm run dev` serves app
- Guard: `memory/tickets/C-01-nextjs-scaffold/guards.md` + `scripts/sprint1-guards.mjs`

## C-02 Shell tokens + RBAC (W-2026-09-16-sprint1)
- Dark Luxury tokens in `app/globals.css`; Canvas nav OWNER-only; ADMIN `/admin/mesh` → `/studio`
- Guard: `memory/tickets/C-02-shell-tokens-rbac/guards.md` + `scripts/sprint1-guards.mjs`

## C-03 UI primitives (W-2026-09-16-sprint1)
- GlassCard + NeonBadge + ReactiveButton demo on `/studio`; spring 25/300; no shell/RBAC regression
- Guard: `memory/tickets/C-03-ui-primitives/guards.md` + `scripts/sprint1-guards.mjs`

## C-04 ModuleSelectorGrid (W-2026-09-18-sprint2)
- 4 module ids + dashed `module-add`; `module-card` testid; selection via `selectedModuleId`; spring 25/300
- Guard: `memory/tickets/C-04-module-selector-grid/guards.md` + `scripts/sprint2-guards.mjs`

## C-05 FloatingCommandBar (W-2026-09-18-sprint2)
- `command-input` + `generate-draft` → `startGenerate`; Generate disabled / no-op without selected module
- Guard: `memory/tickets/C-05-floating-command-bar/guards.md` + `scripts/sprint2-guards.mjs`

## C-06 GenerationDrawer (W-2026-09-18-sprint2)
- S1: Generate opens drawer + mock phases researching→hooking→scripting→designing→done; testids drawer/agent-step/progress; `/studio` compose; no SSE
- Guard: `memory/tickets/C-06-generation-drawer/guards.md` + `scripts/sprint2-guards.mjs`

## C-07 Mesh canvas shell (W-2026-09-18-sprint3)
- ReactFlow Dots + Controls + MiniMap; OWNER mount; ADMIN `/admin/mesh` → `/studio`
- Guard: `memory/tickets/C-07-mesh-canvas-shell/guards.md` + `scripts/sprint3-guards.mjs`

## C-08 Custom mesh nodes (W-2026-09-18-sprint3)
- Agent/Router/Queue/HITL + seed Researcher→…→Analyst
- Guard: `memory/tickets/C-08-mesh-custom-nodes/guards.md` + `scripts/sprint3-guards.mjs`

## C-09 PulseEdge + TopBar (W-2026-09-18-sprint3)
- Pulse edges, TopBar KPI, Add Pipeline Module adds mock AgentNode
- Guard: `memory/tickets/C-09-pulse-edge-topbar/guards.md` + `scripts/sprint3-guards.mjs`

## C-10 Inspect Media Deck (W-2026-09-18-sprint4)
- Route `/studio/inspect/[id]`; MediaDeck Reels↔Carousel; KaraokeCaptions `--font-hy`; store actions for C-11/C-12
- Guard: `memory/tickets/C-10-inspect-media-deck/guards.md` + `scripts/sprint4-guards.mjs`

## C-11 Inspect Hook Panel (W-2026-09-18-sprint4)
- ViralityMeter + HookAlternatives `selectHook` (S2 swap) + ScriptEditor + HeyGenPersonaSwitcher
- Guard: `memory/tickets/C-11-inspect-hook-panel/guards.md` + `scripts/sprint4-guards.mjs`

## C-12 Inspect HITL Toolbar (W-2026-09-18-sprint4)
- HitlToolbar `rerollSelectedSlide` + `openApproveModal`; ApproveScheduleModal `confirmApproveSchedule` (S2 Approve UI change)
- Guard: `memory/tickets/C-12-inspect-hitl-toolbar/guards.md` + `scripts/sprint4-guards.mjs`

## C-13 Analytics KPI shell (W-2026-09-18-sprint5)
- `/analytics` mounts AnalyticsShell + 4 glass KPIs; mock seed; not placeholder
- Guard: `memory/tickets/C-13-analytics-kpi/guards.md` + `scripts/sprint5-guards.mjs`

## C-14 Analytics Retention chart (W-2026-09-18-sprint5)
- RetentionChart uses recharts `LineChart`; `recharts` in package.json; 3 series bay
- Guard: `memory/tickets/C-14-analytics-retention/guards.md` + `scripts/sprint5-guards.mjs`

## C-15 Analytics Insights feed (W-2026-09-18-sprint5)
- InsightsFeed maps ≥3 mock insights with tone-differentiated cards
- Guard: `memory/tickets/C-15-analytics-insights/guards.md` + `scripts/sprint5-guards.mjs`

## C-16 PostAnalytics schema (W-2026-09-19-sprint5-live)
- Prisma `PostAnalytics` + `User` + `ContentJob`; repository + JSON fallback; no `migrate reset` in package.json; `.env.example` placeholders only
- Guard: `memory/tickets/C-16-post-analytics-schema/guards.md` + `scripts/sprint5-live-guards.mjs`

## C-17 Analytics cron ingest (W-2026-09-19-sprint5-live)
- `ingest-post-metrics` + adapters with mandatory mock path; write via C-16 repository; ingest API and/or CLI; no real keys in `.env.example`
- Guard: `memory/tickets/C-17-analytics-cron-ingest/guards.md` + `scripts/sprint5-live-guards.mjs`

## C-18 Analyst worker + live feed (W-2026-09-19-sprint5-live)
- `lib/analyst/run-insights` + `workers/analyst/prompt.md` (HITL / no silent overwrite); insights API; InsightsFeed → `/api/analytics` with mock fallback
- Guard: `memory/tickets/C-18-analyst-worker-feed/guards.md` + `scripts/sprint5-live-guards.mjs`

## C-19 Module SDK registry (W-2026-09-19-sprint6-sdk)
- 4 core manifests (`carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`); aliases → canonical; stubs throw `NotImplemented:C-20` on render
- Studio tiles from `listManifests()`; store `toCanonicalModuleId`; no secrets in `src/modules`
- Guard: `memory/tickets/C-19-module-sdk-registry/guards.md` + `scripts/smoke-c19-registry.ts`
- Superseded for render stubs by **C-20** (adapters mock-first); keep alias/registry counts.
- Superseded for Add disabled by **C-21** (Plugin Slot opens register modal).

## C-20 Module adapters (W-2026-09-19-sprint6-sdk)
- 4× `generateDraft` + `renderAsset` mock without HeyGen/GPU; heygen gateway mock if no `HEYGEN_API_KEY`; `regenerateElement` isolates index; no secrets in git
- Studio Generate → `POST /api/modules/{id}/generate` `{ topic, render: true }`; **must not** pull `node:fs` brand-context into client via registry
- Guard: `memory/tickets/C-20-module-adapters/guards.md` + `scripts/smoke-c20-adapters.ts` + `scripts/smoke-c20-isolation.ts`

## C-21 Plugin Slot (W-2026-09-19-sprint6-sdk)
- Add tile enabled → `RegisterModuleModal` (`data-testid="register-module-modal"`); POST/GET `/api/modules/register`; custom `custom-*` tile; persist (JSON + localStorage); unreachable worker → mock generate (not 500); core 4 intact; no secrets
- Guard: `memory/tickets/C-21-plugin-slot/guards.md` + `scripts/smoke-c21-register.ts`

## C-22 Custom generate hydrate (W-2026-09-19-sprint6-sdk)
- After `POST /api/modules/register`, immediate `POST /api/modules/{customId}/generate` → 200 mock (not 404 `module_not_found`); registry singleton + force re-hydrate on custom miss
- Guard: `memory/tickets/C-22-custom-generate-hydrate/guards.md` + `scripts/smoke-c22-register-generate.ts`

## C-23 SSE job stream (W-2026-09-20-sprint7-sse)
- Mock SSE registry: ≥1 progress, agents → completed@100; Last-Event-ID replay; unknown job → 404 `job_not_found`
- Generate returns `jobId`; store uses `openJobStream` — **no** `runSimulatedPipeline`
- Guard: `memory/tickets/C-23-sse-job-stream/guards.md` + `scripts/smoke-c23-sse.ts`
- Live: `BASE_URL=http://127.0.0.1:3000 npx tsx scripts/smoke-c23-sse.ts`

## C-24 Motion polish (W-2026-09-20-sprint7-sse)
- Studio grid + GenerationDrawer: `staggerChildren` **0.08**; `useReducedMotion` → stagger **0**
- Inspector: `data-testid="skeleton-video"` (9:16) + `skeleton-carousel`; shimmer off when reduce
- C-23 intact: `openJobStream` in `studio-store`; no `runSimulatedPipeline`
- Guard: `memory/tickets/C-24-motion-polish/guards.md`

## C-25 E2E QA polish (W-2026-09-20-sprint7-sse)
- `--font-hy` / Noto Sans Armenian in layout; ScriptEditor / KaraokeCaptions / CarouselDeck apply hy font; Armenian in inspect-mock
- ADMIN mesh deny: client redirect `/admin/mesh` → `/studio` (zustand role; Sidebar QA `setRole`)
- S1 + C-23: generate → jobId → SSE; no `runSimulatedPipeline`; drawer testids
- Guard: `memory/tickets/C-25-e2e-qa-polish/guards.md` + `scripts/smoke-c25-e2e.ts`

## C-26 Century Gothic UI (W-2026-09-20-studio-workspace)
- No `Inter` in `app/layout.tsx`; JetBrains Mono + Noto Sans Armenian kept
- `--font-ui` = Century Gothic stack in `app/globals.css`; `@font-face` local(); body uses `var(--font-ui)`
- Guard: `memory/tickets/C-26-century-gothic/guards.md` + `scripts/smoke-c26-century-gothic.mjs`

## C-27 Studio module routes (W-2026-09-20-studio-workspace)
- Launch `/studio`: no FloatingCommandBar / GenerationDrawer / `command-input`
- ModuleSelectorGrid `Link` → `/studio/{id}`; `app/studio/[moduleId]/page.tsx`; `inspect` reserved
- Sidebar Studio children (`nav-studio-children`) for core 4 — **superseded C-60** (flat Студия)
- Guard: `memory/tickets/C-27-studio-module-routes/guards.md` + `scripts/smoke-c27-studio-routes.ts`

## C-28 Content workspace (W-2026-09-20-studio-workspace)
- Module page: dual `VerticalPostCarousel` (ours/competitors) + Drafts/Razbor CTAs
- CapCut shell route `/studio/[moduleId]/edit/[draftId]` (`CapCutEditorShell`)
- `GET /api/studio/[moduleId]/feed?topic=` mock `{ ours, competitors }`; no prisma migrate
- Launch `/studio` still without `command-input`
- Guard: `memory/tickets/C-28-content-workspace/guards.md` + `scripts/smoke-c28-feed.ts`
- **Superseded (C-49):** `ModuleIdeaBar` + label-баннеры «Опубликованные посты модуля» / «Актуальные карусели ниши» — **remove**; не требовать IdeaBar в новых guards

## C-29 Carousel feed grid (W-2026-09-20-carousel-razbor)
- carousel-engine: ≥21+21 fixtures with https picsum `thumbUrl`
- UI: `grid-cols-3`, aspect `3/5`, Ours Drafts CTA `ours-drafts-btn` (or `carousel-drafts-btn`)
- Guard: `memory/tickets/C-29-carousel-grid-mocks/guards.md` + `scripts/smoke-c29-feed-grid.ts`

## C-30 Competitor Разбор modal + Drafts (W-2026-09-20-carousel-razbor)
- UI: `razbor-btn` / `competitor-razbor-btn`, `razbor-modal`, `ours-drafts-panel`; no CapCut from razbor modal
- Guard: `memory/tickets/C-30-competitor-razbor/guards.md` + `scripts/smoke-c30-razbor.ts`
- **Superseded (C-51):** cascade **Analyst → Scriptwriter only** (no Designer); no auto-start — welcome + «Начать разбор»; no «Готовая карусель» UI; Scriptwriter = full script (roles/plot/text/location); competitor reel play + timeline scrubber

## C-35 IG agents upgrade Researcher + Analyst (W-2026-09-20-live-ig-carousels)
- Packs: live IG rules (handles env, cite metrics, no scrape/tokens); `analyst@v2` / `researcher@v2`
- Skill: Graph API + Business Discovery only; soft-fail → mock; wave C-35→C-36→C-37
- `buildAnalystMessages` live cites metrics/slideCount; mock keeps C-30
- Guard: `memory/tickets/C-35-ig-agents-upgrade/guards.md` + `scripts/smoke-c35-ig-agents.ts`

## C-38 Topic → hashtags Researcher upgrade (W-2026-09-21-ig-hashtag-competitors)
- Packs: `instagramHashtags` contract (`deterministic_mapper`); empty → `IG_DEFAULT_HASHTAGS` or niche defaults; `researcher@v3`
- Primary: Hashtag Search + `top_media`; `IG_COMPETITOR_USERNAMES` optional BD fallback only; no scrape
- Guard: `memory/tickets/C-38-topic-hashtag-agents/guards.md` + `scripts/smoke-c38-topic-hashtags.ts`

## C-36 Live IG feed backend carousel-engine (W-2026-09-20-live-ig-carousels)
- `GET /api/studio/carousel-engine/feed`: live Graph when token+`IG_USER_ID`; else fixtures `sourceMode:"mock"` (no 500)
- Live only for `carousel-engine`; other modules (e.g. heygen-reels) stay mock fixtures
- In-memory cache TTL 10 min; no Prisma/Redis; no tokens in JSON; `.env.example` placeholders
- Guard: `memory/tickets/C-36-ig-live-feed-backend/guards.md` + `scripts/smoke-c36-ig-feed.ts`

## C-37 Studio UI live IG feed badge + Razbor slides (W-2026-09-20-live-ig-carousels)
- Badge `feed-source-badge` (live «Онлайн · Instagram» / mock «Демо-данные») from `FeedResponse.sourceMode`
- `buildCompetitorSlides`: `slideUrls` win → live thumb single → picsum mock; no Graph in browser
- Guard: `memory/tickets/C-37-ig-live-feed-ui/guards.md` + `scripts/smoke-c37-ig-feed-ui.ts`

## C-38 Topic → hashtags Researcher packs (W-2026-09-21-ig-hashtag-competitors)
- `instagramHashtags` contract: topic, hashtags (≤5), `source: deterministic_mapper`, `emptyTopic`
- Empty topic → `IG_DEFAULT_HASHTAGS` else `armenianclub,yerevan,armenianfood,guestnight`
- Hashtag Search primary; `IG_COMPETITOR_USERNAMES` BD fallback only; no scrape; `researcher@v3`
- Guard: `memory/tickets/C-38-topic-hashtag-agents/guards.md` + `scripts/smoke-c38-topic-hashtags.ts`

## C-39 IG Hashtag top_media competitor feed (W-2026-09-21-ig-hashtag-competitors)
- Competitors primary: `ig_hashtag_search` + `top_media` via `topic-hashtags` mapper; empty topic → niche/`IG_DEFAULT_HASHTAGS`
- BD / `IG_COMPETITOR_USERNAMES` only when hashtag path empty; soft-fail mock without token; cache key topic+hashtags
- Guard: `memory/tickets/C-39-ig-hashtag-feed/guards.md` + `scripts/smoke-c39-ig-hashtag-feed.ts`

## C-40 Competitors column by topic UI (W-2026-09-21-ig-hashtag-competitors)
- Mount `fetchFeed(undefined,"full")`; empty clear → niche competitors; topic commit → competitors refresh
- No competitor URL/nick CTAs; auto-hint by topic; `competitorsLoading` on topic-only refresh
- **C-52:** `competitorsLoading` must not swap populated grid for pulse skeletons
- Guard: `memory/tickets/C-40-competitors-by-topic-ui/guards.md` + `scripts/smoke-c40-competitors-by-topic-ui.ts`
- **Superseded chrome (C-49):** topic UX via `competitors-search` (not ModuleIdeaBar); smoke-c40 IdeaBar/subtitle asserts stale until patched

## C-46 Studio header cleanup (W-2026-10-05-studio-tiles-cleanup)
- `/studio` header: no SPEED PROTOCOL / Բարև-in-page / Engine Standby / Mock pipeline
- **Superseded chrome (C-54):** English title `Studio Launchpad` → RU «Студия»; nav/settings leftovers also RU
- Path lock was `app/studio/page.tsx` only; C-54 expands to shell + all pages
- Guard: `memory/tickets/C-46-studio-header-cleanup/guards.md`

## C-52 Feed flicker + graphics cards (W-2026-10-06-factory-parity)
- Skeletons only when list empty AND first load; refetch keeps cards (no `loading` → replace pulse)
- `aesthetic-graphics`: no Play overlay; comments + `metrics.shares` on cards
- Parent still `loading={feedLoading || competitorsLoading}`; `data-testid="feed-refetching"` while populated
- Guard: `memory/tickets/C-52-feed-flicker-graphics/guards.md` + `scripts/smoke-c52-feed-swr-play.ts`

## C-53 Workspace + mesh parity (W-2026-10-06-factory-parity)
- Published/Drafts + competitor Razbor (C-51 agents) on **all** `/studio/[moduleId]`
- `/admin/mesh`: separate pipelines per Studio content type (CORE+product tiles)
- `MESH_PIPELINE_IDS` = 7; `showRazborButton={true}` (C-31 carousel-only superseded); ADMIN still denied mesh
- Guard: `memory/tickets/C-53-workspace-mesh-parity/guards.md` + `scripts/smoke-c53-workspace-mesh.ts`

## C-54 Schedule 21st + RU chrome (W-2026-10-06-factory-parity)
- `/schedule`: 21st calendar + right module list of ready-to-publish posts; datetime under post if set
- No English UI chrome (sidebar, launchpad, mesh header, settings leftovers)
- Persist `cf.schedule.v1`; no `Studio Launchpad` / `Target Render Channels`
- Guard: `memory/tickets/C-54-schedule-i18n/guards.md` + `scripts/smoke-c54-schedule-ru.ts`

## C-47 Module card height (W-2026-10-05-studio-tiles-cleanup)
- `ModuleSelectorGrid`: card + Add-slot `min-h-[252px]`; description `text-pretty` without line-clamp-1/2
- Guard: `memory/tickets/C-47-module-card-height/guards.md`

## C-45 Product module tiles (W-2026-10-05-studio-tiles-cleanup)
- `data/local/custom-modules.json`: exactly 3 — `custom-reels` / `custom-clips-to-reels` / `custom-info-video` (RU titles); no C21/C22 QA ids
- CORE `manifests.ts` stays 4; live `GET /api/modules/register` must mirror JSON (not stale in-memory customs)
- Guard: `memory/tickets/C-45-product-module-tiles/guards.md`

## C-49 Carousel workspace chrome (W-2026-10-05-carousel-razbor)
- No ModuleIdeaBar mount; no «Опубликованные посты модуля» / «Актуальные карусели ниши»
- `competitors-search` + local title filter + debounce topic `fetchFeed(..., "competitors")`
- `FeedPostCard` round Play (`feed-play-btn`) **on video/reel only**; **no autoplay** attributes; C-52 hides Play on static images
- Guard: `memory/tickets/C-49-carousel-workspace-chrome/guards.md`

## C-50 Settings Reels page size (W-2026-10-05-carousel-razbor)
- `/settings` блок «Рилсы»; `cf.reels.pageSize` via `lib/settings/reels-display.ts` (default 12, clamp 4–48)
- Client slice both dual-feed columns in `StudioModuleWorkspace`
- Guard: `memory/tickets/C-50-settings-reels-page-size/guards.md`

## C-51 Razbor script-only (W-2026-10-05-carousel-razbor)
- Welcome + `razbor-start-btn` (no analysis auto-start); script roles/plot/text/location
- **Superseded in part by C-59:** Designer **returns** on `carousel-engine` only; other modules stay Analyst+Scriptwriter
- `RazborReelPlayer` play + CapCut-lite scrubber (`autoPlay={false}`)
- Guard: `memory/tickets/C-51-razbor-script-only/guards.md` + `scripts/smoke-c30-razbor.ts` (update with C-59)

## C-57 MenuVertical + no selection counter (W-2026-10-06-nav-mesh-razbor)
- No «Ничего не выбрано» / «1 выбран» on Launchpad
- `components/ui/menu-vertical.tsx` + `SidebarNavigation`; `framer-motion`; `text-sm`
- **C-60 supersedes Studio children:** flat Студия, no module dropdown; resizable `cf.sidebar.width`
- Guard: `memory/tickets/C-57-menu-vertical-nav/guards.md`

## C-58 Mesh view-only + header count (W-2026-10-06-nav-mesh-razbor)
- `MeshPipelineSwitcher` top; no `mesh-add-module`; `nodesDraggable={false}`; no connect; horizontal
- `VerticalPostCarousel` header keeps last count while `loading`
- Guard: `memory/tickets/C-58-mesh-view-count-blink/guards.md`

## C-59 Voice + carousel Designer + publisher picker + schedule tree
- All AI chats reuse PromptBox (chatgpt-prompt-input) mic — not parallel AgentChatComposer (**C-157**)
- Live agent chat: user = raw; system = mesh systemPrompt only (**C-155** / S40)
- Carousel drafts survive refresh via zustand persist (**C-156**)
- Thinking shows 9-cube assemble + shimmer «Thinking...» (**C-158**)
- carousel-engine Razbor: Designer after scriptwriter; ours/competitor image carousel; publisher = 21st day+time, no chat
- **C-62 supersedes scriptwriter→publisher CTA:** scriptwriter → Designer; Designer bottom CTA → publisher
- `/schedule` rail: retokenized animated-file-tree
- Guard: `memory/tickets/C-59-voice-designer-publisher-tree/guards.md`

## C-60 Sidebar flat + resize (W-2026-10-06-workspace-polish)
- No Studio module children in MenuVertical; drag handle; `localStorage cf.sidebar.width`
- Guard: `memory/tickets/C-60-sidebar-resize-no-modules/guards.md` + `scripts/smoke-c27-studio-routes.ts` G4 inverted

## C-61 Workspace blink / Create / nested scroll
- No `// Рабочая страница модуля`; no header opacity pulse; `useCallback` competitors search; 21st glow «Создать»; `overscroll-contain` columns
- Competitors loading: populated → `competitorsLoading` only (not `feedLoading || …`)
- Guard: `memory/tickets/C-61-workspace-blink-create-scroll/guards.md`

## C-62 Razbor handoff + drafts carousel
- Hide chat scrollbar; scriptwriter → `razbor-send-designer`; designer → `razbor-send-publisher-designer`; drafts L/R + slot date
- Guard: `memory/tickets/C-62-razbor-drafts-carousel/guards.md`

## C-63 Nav perceived speed (W-2026-10-07-ux-carousel-nav)
- `loading.tsx` ×6 (studio/schedule/analytics/brand-kit/settings/admin/mesh)
- Dynamic: AgentMeshCanvas, RetentionChart, RazborModal, CreateCarouselModal
- InsightsFeed `Promise.all`; shells `initial={false}` (no full-page opacity:0)
- Guard: `memory/tickets/C-63-nav-perceived-speed/guards.md` + `scripts/smoke-c63-c67-ux-wave.ts`

## C-64 Carousel 9:16 + Разбор + scroll (W-2026-10-07-ux-carousel-nav)
- carousel-engine: `stack` + aspect `9/16` (supersedes C-29 grid 3/5 for this module)
- fixtures `slideUrls.length ≥ 3`; FeedPostCard `feed-slide-prev/next`; large `razbor-btn`
- VerticalPostCarousel styled thin scrollbar (not hidden)
- Guard: `memory/tickets/C-64-carousel-916-razbor-scroll/guards.md` + `scripts/smoke-c63-c67-ux-wave.ts`

## C-65 Create carousel modal (W-2026-10-07-ux-carousel-nav)
- `CreateCarouselModal`; workspace `create-carousel-btn`; hide `mod.description` for carousel-engine
- Guard: `memory/tickets/C-65-create-carousel-modal/guards.md` + `scripts/smoke-c63-c67-ux-wave.ts`

## C-66 Команда выпуска + agent panel (W-2026-10-07-ux-carousel-nav)
- Nav + chrome «Команда выпуска»; no `// Только владелец · Сетка агентов`
- `AgentPropertiesPanel`; mesh-seed `description` / `skills` / `completedJobs`
- Guard: `memory/tickets/C-66-team-release-mesh/guards.md` + `scripts/smoke-c63-c67-ux-wave.ts`

## C-67 Schedule UX (W-2026-10-07-ux-carousel-nav)
- Rail `defaultOpen={false}`; no `stripDays`; month arrows beside title; wrap classes on labels
- Guard: `memory/tickets/C-67-schedule-ux/guards.md` + `scripts/smoke-c63-c67-ux-wave.ts`

## C-82 Studio hover outline (W-2026-10-08-ux-wave5)
- `ModuleSelectorGrid` + `GlassCard`: `disableHoverMotion`; no NeonBadge format tags; no `group-hover:-translate-y`
- Guard: `memory/tickets/C-82-studio-hover-outline/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-83 Mesh MultiButton + title (W-2026-10-08-ux-wave5)
- `MeshPipelineSwitcher` = expanded `MultiButton` (not Compact), centered; CanvasTopBar «Команда выпуска» Studio h1 style
- Guard: `memory/tickets/C-83-mesh-multibutton-title/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-84 Schedule opaque popup (W-2026-10-08-ux-wave5)
- Single opaque popup Save/Cancel; drag clears editor; no format tags in ScheduleModuleRail
- Guard: `memory/tickets/C-84-schedule-popup-save-cancel/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-85 Settings Design + TOC (W-2026-10-08-ux-wave5)
- Design = filename + upload only (no code editor / save-in-browser / reset); SettingsQuickNav TOC with section ids
- Guard: `memory/tickets/C-85-settings-design-toc/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-86 Platforms connection ping (W-2026-10-08-ux-wave5)
- PlatformsPanel «Проверить подключение» green/red via `data-conn` + `settings-platform-ping-*`
- Guard: `memory/tickets/C-86-platforms-ping/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-87 Settings agents dual MultiButton (W-2026-10-08-ux-wave5)
- Settings agents: `settings-content-type-filter` + `settings-agent-filter` (contentTypeItems + agentPackItems)
- Guard: `memory/tickets/C-87-settings-agents-filters/guards.md` + `scripts/smoke-c82-c87-ux-wave5.ts`

## C-88 MultiButton chamfer left (W-2026-10-08-ux-wave6)
- `multi-button.tsx`: `rounded-lg` + WIDTH_SPRING; mesh/settings `justify-start`; full «Информационное видео»
- Guard: `memory/tickets/C-88-multibutton-chamfer-left/guards.md` + `scripts/smoke-c88-c92-ux-wave6.ts`

## C-89 Mesh no metrics (W-2026-10-08-ux-wave6)
- CanvasTopBar without Задачи/Задержка/GPU
- Guard: `memory/tickets/C-89-mesh-no-metrics/guards.md` + `scripts/smoke-c88-c92-ux-wave6.ts`

## C-90 Agent props scout + resize (W-2026-10-08-ux-wave6)
- AgentPropertiesPanel resize (`cf.agent-props.width`) + scout list; no jobs count
- Guard: `memory/tickets/C-90-agent-props-scout-resize/guards.md` + `scripts/smoke-c88-c92-ux-wave6.ts`

## C-91 Sidebar Century blue (W-2026-10-08-ux-wave6)
- MenuVertical: `--font-ui`, `text-base font-bold`, `accent-blue-bright`
- Guard: `memory/tickets/C-91-sidebar-century-blue/guards.md` + `scripts/smoke-c88-c92-ux-wave6.ts`

## C-92 Schedule labels/delete/month (W-2026-10-08-ux-wave6)
- Field labels CG blue; `schedule-slot-delete` → removeSlot; day click no setMonth
- Guard: `memory/tickets/C-92-schedule-labels-delete-month/guards.md` + `scripts/smoke-c88-c92-ux-wave6.ts`

## C-114…C-117 Apify IG scraper live competitors (W-2026-10-09-ig-scraper-live)
- Soft-fail: invalid/missing Apify → carousel mock competitors; custom-reels competitors empty; no 500
- Module mix: carousel-engine no VIDEO competitors; custom-reels only VIDEO
- No `IG_SCRAPER_API_KEY` / Bearer / Apify token in feed JSON or smoke stdout
- Guard: `memory/tickets/C-114-apify-ig-scraper/guards.md` + `scripts/smoke-c114-apify-ig-scraper.ts`

## C-130…C-137 Nav / Mesh rewrite (W-2026-10-10-nav-mesh-rewrite)
- C-133: `nav-brand` always SSR+CSR; `initial={false}` on aside — `memory/tickets/C-133-hydration-nav-brand/guards.md`
- C-130: emblem-only `vernatun-emblem.png` + VERNATUN horizontal — `memory/tickets/C-130-emblem-brand/guards.md` (supersedes C-122 PNG path)
- C-136: sidebar Studio/Schedule/Settings only; nested `/studio/[moduleId]/mesh|analytics` + module top nav — `memory/tickets/C-136-nav-ia-module-top/guards.md`
- C-132: `.cf-card-meta` CG white 12px feed — `memory/tickets/C-132-card-meta-12px/guards.md`
- C-131: `data-carousel-crossfade` + `mode="sync"`; no slide `mode="wait"` — `memory/tickets/C-131-carousel-crossfade/guards.md`
- C-134: `.cf-system-title` CG white 16px Razbor — `memory/tickets/C-134-titles-16px/guards.md`
- C-135: long input + 3 actions + circular red X — `memory/tickets/C-135-razbor-composer/guards.md`
- C-137: `ReleaseTeamFlowchart` + `AgentInspectorDrawer`; no `AgentMeshCanvas` in app — `memory/tickets/C-137-mesh-clean-slate/guards.md` (S37 HARD)

## C-122…C-128 Vernatun UI (W-2026-10-10-vernatun-ui)
- C-122: `nav-brand` horizontal PNG `vernatun-logo.png` + VERNATUN / ARMENIAN CLUB — `memory/tickets/C-122-brand-logo/guards.md`
- C-123: Studio Launchpad no register-module / «[+ Добавить модуль]» — `memory/tickets/C-123-studio-no-register/guards.md`
- C-124: mesh static picture — no MiniMap/Controls/Dots; nodesDraggable false — `memory/tickets/C-124-mesh-static-picture/guards.md`
- C-125: mesh dual-lane User + Scout→Analyst→Trainer dashed + barbell; Scout≠Trainer panel — `memory/tickets/C-125-mesh-dual-lane/guards.md`
- C-126: schedule popup `cf.schedule.popup.pos` persist — `memory/tickets/C-126-schedule-popup-pos/guards.md` + `lib/schedule/popup-pos.ts`
- C-127: analytics module menu + RL Trainer HITL «Согласовано» — `memory/tickets/C-127-analytics-menu-rl-hitl/guards.md`
- C-128: retention `retention-at-15` % (n/m) + at3 — `memory/tickets/C-128-retention-15s/guards.md`

## C-carousel-* Create handoff (W-2026-10-12-carousel-studio-handoff) — S41
- C-carousel-chrome: segment Сценарист|Дизайнер|Публикация; no publisher agent; `hideTools`+`hideHandoff`; `button.tsx` + `CreateCarouselStepSegment` — `memory/tickets/C-carousel-chrome/guards.md`
- C-carousel-agents: top CTAs Передать задание / Нарисовать / Передать на публикацию; no picsum auto; Create `source:"error"`; `AgentMarkdownBubble` — `memory/tickets/C-carousel-agents/guards.md`
- C-carousel-publish: `CreateCarouselPublicationPane` + `publishCreateCarousel` → draft Ours + schedule slot; no Publisher chat — `memory/tickets/C-carousel-publish/guards.md`

## C-carousel-* JSON pipeline (W-2026-10-12-carousel-json-pipeline) — S42
- C-carousel-preview-black: Create preview `aspect-[4/5]`; img `onLoad`/`onError`/`naturalWidth`; `previewLoadOk` gate; media-proxy + `toPreviewUrl`; no silent black — `memory/tickets/C-carousel-preview-black/guards.md`
- C-carousel-json-scriptwriter: `lib/studio/carousel-json-contract.ts` `parseAndAssertCarouselJson`; N = `requested_slide_count === slides.length`; ask-N no invent — `memory/tickets/C-carousel-json-scriptwriter/guards.md`
- C-carousel-html-designer: no Create `slideCount: 4`; draw = `slides.length`; `carousel-html-renderer` safe-zone 120/160/80; FE binds `carouselJson` — `memory/tickets/C-carousel-html-designer/guards.md`

## W-2026-10-13 drafts / Design Embla / Team brief — S43
- C-drafts-always: upsert after draw + publish (same id); `openDraftsNonce` → Черновики; empty copy Create+Разбор; key `cf.carousel.drafts.v1` — `memory/tickets/C-drafts-always/guards.md` + `scripts/smoke-w-2026-10-13-drafts-design-team.ts`
- C-settings-design-md-carousel: library ≤10; activeId; Embla + DESIGN.md chip; Close outside pointer capture; no `@appica` — `memory/tickets/C-settings-design-md-carousel/guards.md` + same smoke
- C-team-brief-n-indicator: label «Задание»; empty `loadUserBrief`; `composeTopicWithBrief` raw-only; agent-chat sanitize; `devIndicators: false` — `memory/tickets/C-team-brief-n-indicator/guards.md` + same smoke

## W-2026-10-13 visual deconstructor — S44
- C-visual-style-deconstructor: DesignPresetFile + seeds `seed-dark-notes`/`seed-bento-glass`; `deconstructStyle` + POST design-deconstruct; persist keys unchanged; PNG_BUDGET_MAX 40 — `memory/tickets/C-visual-style-deconstructor/guards.md` + `scripts/smoke-w-2026-10-13-visual-deconstructor.ts`
- C-design-slot-sliced-preview: Embla `SlicedSlotPreview` 3×4:5; QuickThemeTuner `--cf-design-*`; no panorama-only; «Создать из референса» — `memory/tickets/C-design-slot-sliced-preview/guards.md` + same smoke
- C-carousel-css-vars-builder: `carouselHtmlBuilder` CSS vars + role kits; safe-zone 120/160/80; wave artifacts `generatedMedia/wave-visual-deconstructor/`; budget ≤40 — `memory/tickets/C-carousel-css-vars-builder/guards.md` + same smoke + `scripts/generate-wave-visual-artifacts-pngs.ts`
- C-reels-scriptwriter-upgrade: custom-reels Сценарист hook 0–2s + beats + CTA + `promptForMontage`; `reels-script-contract` rejects carousel slides — `memory/tickets/C-reels-scriptwriter-upgrade/guards.md` + same smoke

## W-2026-10-13 designer models / colors / hook — S45
- C-agent-model-defaults: Designer `openai/gpt-5.4-image-2`; Scriptwriter `anthropic/claude-haiku-4.5` + thinking; mesh + llm-models + aggregator-images sync — `memory/tickets/C-agent-model-defaults/guards.md` + `scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts`
- C-design-colors-only: Settings/Tuner caption «Только цвета…»; no layout markup editor; colors/CSS inject — `memory/tickets/C-design-colors-only/guards.md` + same smoke
- C-designer-panorama-slice: panorama→slice prompts + captivating hook; `assertSlicedCreatePreview` + `panorama_preview_rejected` — `memory/tickets/C-designer-panorama-slice/guards.md` + same smoke

## W-2026-10-13 scriptwriter swipe CTA — S46
- C-scriptwriter-swipe-cta: overlay swipe META + CTA catalog 1–4; zod `cta_type` 1\|2\|3\|4; schema hint META; agent-defaults sync — `memory/tickets/C-scriptwriter-swipe-cta/guards.md` + `scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts`
- C-scriptwriter-cta-hint-ui: `ScriptwriterCtaHint` «?» + panel CTA 1–4; mount only on Create Scriptwriter step — `memory/tickets/C-scriptwriter-cta-hint-ui/guards.md` + same smoke

## W-2026-10-14 carousel UI + Marketing Director — S47
- C-feed-card-chrome-s47: no Онлайн badge/tags/caption; `feed-username-plaque` + `feed-engagement-row` on photo CG — `memory/tickets/C-feed-card-chrome-s47/guards.md` + `scripts/smoke-w-2026-10-14-carousel-ui-marketing.ts`
- C-razbor-create-modal-s47: scroll lock; no «Карусель конкурента»; «Сообщение»+hideTools; HandoffRoundButton; people tabs / Create segment+avatars; N/M CG — `memory/tickets/C-razbor-create-modal-s47/guards.md` + same smoke
- C-marketing-director-chat: `/marketing` projects rail; welcome→sink AIInput; Haiku 4.5 + app_search/app_graphql — `memory/tickets/C-marketing-director-chat/guards.md` + same smoke + `verify-haiku.md`

## W-2026-10-14 razbor live boards — S48
- C-director-nav-marketing: sidebar «Директор»→`/marketing`; no Studio Marketing btn; prefetch — `memory/tickets/C-director-nav-marketing/guards.md` + `scripts/smoke-w-2026-10-14-razbor-live-boards.ts`
- C-feed-plaque-metrics-s48: plaque ≈1.5× + followers `Nk`; engagement ≈2× ×5 metrics — `memory/tickets/C-feed-plaque-metrics-s48/guards.md` + same smoke
- C-razbor-cta-clip: «Разбор» white + not clipped — `memory/tickets/C-razbor-cta-clip/guards.md` + same smoke
- C-carousel-preload-slides: `prefetchAll` feed/Razbor/Create — `memory/tickets/C-carousel-preload-slides/guards.md` + same smoke
- C-slide-motion-horizontal: `data-motion="s48-horizontal"` + x travel — `memory/tickets/C-slide-motion-horizontal/guards.md` + same smoke
- C-razbor-live-haiku-boards: preview 1.5×; handoff in PromptBox; Boards; `/api/studio/razbor/analyze`; Haiku/image-2 — `memory/tickets/C-razbor-live-haiku-boards/guards.md` + same smoke + `scripts/smoke-razbor-live-analyze.ts`
- C-module-parity-carousel-ui: shared FeedPostCard all modules — `memory/tickets/C-module-parity-carousel-ui/guards.md` + same smoke

## W-2026-10-14 s49-feed-brandbook — S49
- C-feed-s49-chrome: plaque `name | Nк` inside; Ours no plaque; Конкуренты|Доски toggle+search; white Published/Drafts — `memory/tickets/C-feed-s49-chrome/guards.md` + `scripts/smoke-w-2026-10-14-s49-feed-brandbook.ts`
- C-boards-s49-upload: «Загрузить» same row; no helper; boards no metrics/plaque — `memory/tickets/C-boards-s49-upload/guards.md` + same smoke
- C-team-brief-gone-design-brandbook: Team no brief textarea; `loadUserBrief` always `""`; Settings `BrandbookBoard` + «Создать из референса» — `memory/tickets/C-team-brief-gone-design-brandbook/guards.md` + same smoke + `scripts/smoke-w-2026-10-13-drafts-design-team.ts`

## W-2026-10-14 s50-client-ui-live — S50 CRITICAL
- C-s50-feed-chrome: minimal bottom; no «(4:5)»; no orange dots; Boards dropdown+create; sort+filter L of search; competitors empty≠mock — `memory/tickets/C-s50-feed-chrome/guards.md` + `scripts/smoke-s50-competitors-live-vs-mock.ts`
- C-s50-settings-design: brandbook **3:5**; no MD crumbs/slots/helper; toolbar one row; no card context menu — `memory/tickets/C-s50-settings-design/guards.md`
- C-s50-create-prompts: Create start Scriptwriter; preview ≈29rem; handoff+?; S50 prompt bar — `memory/tickets/C-s50-create-prompts/guards.md` + `memory/waves/W-2026-10-14-s50-live-competitors-prompt-hardening.md`

## W-2026-10-14 s51-design-boards-apify — S51
- C-s51-settings-design: top-right actions; no preview MD btn; eye «код дизайн мд»; shrink empty bottom; blue neon active; no edit popup — `memory/tickets/C-s51-settings-design/guards.md`
- C-s51-boards-chrome: dropdown from «Доски» segment; dblclick rename; label=board name; Upload icon always (disabled Competitors); no UI jump — `memory/tickets/C-s51-boards-chrome/guards.md`
- C-s51-apify-cost: call-volume audit; TTL cache + in-flight dedup; no bootstrap scrape; monthly estimate note — `memory/tickets/C-s51-apify-cost/guards.md` + `backend/apify-scraper-cost-discipline.md`

## W-2026-10-15 sprint8-postgres — SoT 8.7
- C-s8-07-guards: F5 persistence (draft/board), cross-user isolation (`x-cf-user-id`), idempotent `migrate-local`, approve → SCHEDULED only (no social), design ≤10, shell_freeze AppShell/Sidebar — `memory/tickets/C-s8-07-guards/guards.md` + `scripts/smoke-sprint8-postgres-sot.ts` (+ `scripts/smoke-sprint8-api.ts`)

## W-2026-10-15 sprint9-carousel-reels — 9.9/9.10
- C-s9-09-smoke: fixtures critic + weak reject; `assert-sprint9-contracts` (NO_MOCK, handoff Razbor/Create, route critics); Playwright Create @1440 starts Scriptwriter; no social publish — `memory/tickets/C-s9-09-smoke/guards.md` + `scripts/smoke-sprint9-fixtures.ts` + `scripts/assert-sprint9-contracts.ts`
- C-s9-10-scorecard: thresholds vs measured; Sprint 22 gate **NOT GREEN** until S44/S45 smokes green + live sample — `memory/waves/W-2026-10-15-sprint9-carousel-reels/scorecard-9.10.md`
- S44/S45 still gated by existing smokes (do not weaken): `smoke-w-2026-10-13-visual-deconstructor.ts`, `smoke-w-2026-10-13-designer-models-colors-hook.ts`, `smoke-w-2026-10-13-scriptwriter-swipe-cta.ts`

## W-2026-10-16 carousel-audit-fix
- C-audit-01-models: Scriptwriter=`anthropic/claude-3.7-sonnet`+thinking; Designer draw=`openai/gpt-5.4-image-2` + `textModel` Sonnet; describe/chat/handoff never image-class / never mini; Razbor stays Haiku — `memory/tickets/C-audit-01-models/guards.md` + `scripts/smoke-c-audit-01-routing.ts` + `scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts`
- C-audit-04/05/06: on-slide markdown strip (`sanitizeOnSlideMarkup`); dense dark_notes/clean_poster kits; Scriptwriter Sonnet→sonnet-4→haiku fallback (`fallbackModels: true`) — `memory/tickets/C-audit-0{4,5,6}-*/guards.md` + `scripts/smoke-c-audit-04-05-06.ts`
- C-audit-02-prompts: COMBAT CTA catalog 1–4 (no «бронь стола»/«запись в сторис»); full JSON few-shots with `slides[]`; paired invariants once — `memory/tickets/C-audit-02-prompts/guards.md` + same routing smoke + `scripts/smoke-w-2026-10-13-scriptwriter-swipe-cta.ts`
- C-audit-03-html-render: HTML/CSS-first draw; fixture 3 PNG `bgImageCalls=0`; optional bg = image-2 — `memory/tickets/C-audit-03-html-render/guards.md` + `scripts/smoke-c-audit-03-html-first.ts` (LIVE 6-PNG → Deployer)

## W-2026-10-16 design-razbor-quality — S52
- C-design-tokens-only: Settings Design no sliced COVER/BODY/CTA; toolbar LEFT; tokens payload only — `memory/tickets/C-design-tokens-only/guards.md` + `scripts/smoke-w-2026-10-16-design-razbor-quality.ts`
- C-razbor-draft-edit: draft-edit hides `razbor-start-btn`; competitor «Выбрать»+square — `memory/tickets/C-razbor-draft-edit/guards.md` + same smoke
- C-carousel-quality-etalon: COMBAT/prompts TOPIC=user HARD (no coffee/jazz lock); etalon folder seeded; LIVE 9 PNG → Deployer — `memory/tickets/C-carousel-quality-etalon/guards.md` + same smoke + `scripts/live-gen-s52-armenian.ts`

## W-2026-10-17 layered-html-pipeline — S57 HARD
- C-s57-layered-default: product default `renderMode=layered_html` (missing env / layered / s57); correct_pipeline archaeology only — `memory/tickets/C-s57-layered-default/guards.md` + wave `guards.md` + `tester-unit.json`
- C-s57-secondary-bg-vision: `secondary_copy` REQUIRED; bg helpers HARD ban NO TEXT/NO LOGO; vision OFF on layered — `memory/tickets/C-s57-secondary-bg-vision/guards.md`
- C-s57-smoke-4: `docs/карусель тест/layered-smoke-4/` = 4×1080×1350 + timeline/README; old `smoke-useful-51-1-17` empty/gone — `memory/tickets/C-s57-smoke-4/guards.md`
- Client S57 Playwright @1440 + taste vs etalon `#3` (`03-website-fast-cutout.png`) — not pixel clone; S53 type-on-PNG bar superseded for ship

## W-2026-10-18-variant-a-art-director — Variant A + AD
- C-variant-a-html-layout: closed `html_layout` template enum (6); Designer pack requires layout; orphan highlight FAIL; composite `data-template` + accent — `memory/tickets/C-variant-a-html-layout/guards.md` + `scripts/verify-variant-a-ad-guards.ts`
- C-art-director-agent: AD API/job `remakeEnqueued: false` always; no enqueue/draw from AD — `memory/tickets/C-art-director-agent/guards.md` + same script
- C-art-director-ui-smoke: mesh `node-art-director` after Designer; smoke `docs/карусель тест/variant-a-ad-smoke/` = 4×1080×1350 + `art-director-review.md` — `memory/tickets/C-art-director-ui-smoke/guards.md` + wave `memory/waves/2026-10-18-variant-a-art-director/guards.md`
- S57 KEEP: layered HTML product path; AD critique ≠ OCR remake loop

## W-2026-10-18-gemini-ad-logo-visual — Gemini AD + logo dual-path + type scale + smoke 6
- C-type-scale-sot: `typography.scale` → composite CSS px; Designer TYPE SCALE inject numerics — `memory/tickets/C-type-scale-sot/guards.md` + `scripts/verify-gemini-ad-logo-visual-guards.ts`
- C-ad-gemini-vision: default `google/gemini-2.5-flash`; no silent gpt-4o; NO remake — `memory/tickets/C-ad-gemini-vision/guards.md` + same script
- C-logo-dual-path: `logoRef` sanitize for LLM + `logoRefRaw` for Puppeteer `<img>` — `memory/tickets/C-logo-dual-path/guards.md` + same script
- C-brand-name-font-doc: `.brand-name` → `--cf-font-content` — `memory/tickets/C-brand-name-font-doc/guards.md`
- C-visual-prompt-rich-hy: ≥3 scene elements + Armenian/Vernatun motifs — `memory/tickets/C-visual-prompt-rich-hy/guards.md`
- C-smoke-6-pretty-num: pretty `03/06` + smoke `docs/карусель тест/gemini-ad-logo-visual-smoke-6/` = 6 PNG + AD md/json — `memory/tickets/C-smoke-6-pretty-num/guards.md` + wave `memory/waves/2026-10-18-gemini-ad-logo-visual/guards.md`

## W-2026-10-18-design-inject-logo-br — FULL DESIGN inject + logo BR + rich SW + variety + smoke 6
- C-full-design-inject: `roles` family+sizePx+color + positive FULL DESIGN TOKENS; **no** «do NOT assume 64px» — `memory/tickets/C-full-design-inject/guards.md` + `scripts/verify-design-inject-logo-br-guards.ts`
- C-motifs-optional-sw: motifs OPTIONAL; laundry list FORBIDDEN — `memory/tickets/C-motifs-optional-sw/guards.md`
- C-logo-chrome-br: bottom-right · 88px · transparent · name right of icon — `memory/tickets/C-logo-chrome-br/guards.md`
- C-slide-num-body: own `.slide-num` · body tokens · pretty **`03 / 06`** (spaces) — `memory/tickets/C-slide-num-body/guards.md`
- C-secondary-copy-rich: ≥120 chars OR ≥3 clauses — `memory/tickets/C-secondary-copy-rich/guards.md`
- C-font-fit-reduce: reduce-only; never enlarge above DESIGN — `memory/tickets/C-font-fit-reduce/guards.md`
- C-deconstruct-verify: deconstruct → scale fill → FULL payload roles — `memory/tickets/C-deconstruct-verify/guards.md`
- C-layout-variety: adjacent anchors differ; soft-shuffle + fallback rotate — `memory/tickets/C-layout-variety/guards.md`
- C-smoke-design-inject-6: `docs/карусель тест/design-inject-logo-br-smoke-6/` = 6 PNG — `memory/tickets/C-smoke-design-inject-6/guards.md` + wave `memory/waves/2026-10-18-design-inject-logo-br/guards.md`
- Supersedes prior pretty `03/06` (no spaces) for **this** layered product path; KEEP S57 / dual-path / no remake

## W-2026-10-18-layout-copy-dual-char — MUCH wider SW + layoutMap + dual char smoke
- C-sw-secondary-wide: body secondary_copy ≥220 chars AND ≥5 clauses; critic+zod reject thin — `memory/tickets/C-sw-secondary-wide/guards.md` + `scripts/verify-layout-copy-dual-char-guards.ts`
- C-grid-layout-map: 4-ref deconstruct → layoutMap; gen mirrors grammar — `memory/tickets/C-grid-layout-map/guards.md`
- C-numbering-mirror: `numberingGlobal: absent` → omit `.slide-num` (supersedes always-pretty N/M) — `memory/tickets/C-numbering-mirror/guards.md`
- C-seed-designs-landscapes: presets 01/02/03 + active 01; Landscapes Ануш #1 — `memory/tickets/C-seed-designs-landscapes/guards.md`
- C-dual-char-smoke: A `in_image` topic 17 ×6 · B `overlay_cutout` topic 13 ×6 · conductor — `memory/tickets/C-dual-char-smoke/guards.md` + wave `memory/waves/2026-10-18-layout-copy-dual-char/guards.md`
- KEEP S57 layered HTML / Variant A / no remake / shell_freeze
