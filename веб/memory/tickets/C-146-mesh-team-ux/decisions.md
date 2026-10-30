# Frontend decisions — C-146…C-150

| Ticket | Decision |
|--------|----------|
| C-146 | Removed `user-brief-reset`, `user-brief-hints`, hints toggle, `hintsExpanded`. Kept textarea + store persist. `resetUserBrief` left in store. |
| C-147 | `CanvasTopBar` requires `pipelineId`; title = `Команда выпуска: ${MESH_PIPELINE_LABELS[id]}` (full label incl. `(4:5)`). Helper `meshTeamScreenTitle` shared with page `sr-only` h1. |
| C-148 | FileReader + filename metadata only (no `POST` upload route). Skills chip `skill:foo.md`; plugins = basename. Trainer suggest chips: `trainer-gap-playbook`, `21st-ui-catalog`, `content-factory-ui`. |
| C-149 | Kept `mcp: string[]` for hydrate compat. New entries encoded `website\|tools\|desc`. UI: website required + optional tools/desc; chips show website prominently. Legacy `mcp://…` still display. |
| C-150 | Removed MultiButton / `scout-inspector-content-types`. Scout binds `contentTypes: [pipelineId]` on save. |

## 21st.dev

| id | element | motion | note |
|----|---------|--------|------|
| 163 (search) | file input affordance | no | Reused existing ChipGroup + Upload lucide button (quota-safe); pattern aligned with Input/file-upload catalog |
| — | MCP cards / Scout | no | Retokenized existing glass panels; no new MultiButton |

`21st=search-ok · get_component skipped (reuse ChipGroup)`
