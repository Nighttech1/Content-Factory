# Status — C-140

| Field | Value |
|-------|-------|
| **Status** | Frontend done |
| **Wave** | `W-2026-10-10-team-settings-perf` |
| **Updated** | 2026-10-10 |

## Frontend [x]

- Persist key: `cf.mesh.userBrief.v1:<pipelineId>` (`USER_BRIEF_STORAGE_PREFIX` in `agent-store`)
- `COMBAT_USER_BRIEFS` per `MeshPipelineId` in `agent-defaults` (carousel jazz OK; others distinct combat templates)
- User card: always-editable `<textarea data-testid="user-brief-textarea">` + optional hints accordion; `stopPropagation` vs pan
- Composer wire: `AgentChatComposer` `moduleId` → `composeTopicWithBrief(topic, moduleId)` on send; RazborModal / CreateCarousel / GenerationDrawer wired
- Same FE pass as **C-141**

## Next

Tester → Fixer → Deployer → Client **S37+S39**
