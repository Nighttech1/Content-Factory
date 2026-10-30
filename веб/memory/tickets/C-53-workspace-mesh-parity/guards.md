# Guards — C-53 Workspace + mesh parity

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

Smoke C-31 «Razbor only carousel» — **superseded**. Razbor на всех модулях = **PASS**. CapCut editor остаётся reels-only.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | `showDraftsButton={true}` + `showRazborButton={true}` all workspace | **PASS** | `StudioModuleWorkspace`; live graphics + cartoon tabs Опубликовано/Черновики |
| G2 | `RazborModal` always mounted; welcome `getRazborWelcome(post.id, post)` | **PASS** | Source; live graphics Разбор → Analyst welcome + «Начать разбор» |
| G3 | CapCut `showEditorButton={isReels}` not on graphics | **PASS** | graphics editor=0; cartoon editor=4; `smoke-c31` updated |
| G4 | `MESH_PIPELINE_IDS` length 7 canon; switcher + `createMeshSeed(pipelineId)` | **PASS** | Unit graphs: graphics no Hook; live 7 RU tabs; graphics tab = Graphics Designer, no Hook Writer |
| G5 | ADMIN `/admin/mesh` still redirect | **PASS** | `role === "ADMIN"` → `router.replace("/studio")` |
| G6 | anti-slop | **PASS** | wave UI scan OK |

## Executable checks

```powershell
$env:BASE_URL="http://127.0.0.1:3000"
npx tsx scripts/smoke-c53-workspace-mesh.ts
# expect SMOKE_C53_WORKSPACE_OK / MESH_OK / SMOKE_C53_OK

npx tsx scripts/smoke-c31-capcut-gate.ts
# expect showRazborButton={true}; carousel-only assert gone; SMOKE_C31_OK
```

Live: `/studio/aesthetic-graphics` and `/studio/cartoon-reels` — drafts toggle + competitor Разбор. OWNER `/admin/mesh` — `mesh-pipeline-switcher` 7 ids.

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-53**.

## Fixer?

**Да (2026-10-06, overlap C-54).** `lib/mesh-seed.ts` node labels RU; graphs per pipeline не universal.
