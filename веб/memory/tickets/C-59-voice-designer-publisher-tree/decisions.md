# Decisions — C-59

| Date | Role | Decision | Why |
|------|------|----------|-----|
| 2026-10-06 | AI Bridge | `RAZBOR_AGENTS` = C-51 core; extra designer/publisher via `razborAgentsForModule("carousel-engine")`. `runRazborCascade` stays script-only (smoke C-30). Designer = `runRazborDesigner` + `applyDesignerChatRevision`. Publisher: no prompts. | C-51 non-carousel unchanged |
| 2026-10-06 | Frontend | `21st=unavailable` (MCP server errored). Datetime = `luxury-datetime.tsx` Dark Luxury fallback. File-tree = MagicUI/21st TreeView shape in `animated-file-tree.tsx`, `cn` from `@/lib/cn`, `framer-motion`. | Spec: fallback not wave-stop |
| 2026-10-06 | Frontend | GenerationDrawer: reuse `AgentChatComposer` notes → `drawerNotes` on active step. No Speech API copy. Publisher pane: no composer. | Voice canon |
| 2026-10-06 | Motion | Toggle pill `layoutId`, tree folder chevron rotate, datetime enter, slides fade/scale. Spring `{ damping: 25, stiffness: 300 }`. reduced-motion: instant. | web-motion-engine |
