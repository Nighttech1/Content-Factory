# Frontend decisions — C-53

- 21st id=525 · element=MeshPipelineSwitcher (layoutId pill tabs) · motion=yes · Dark Luxury retoken
- 21st=reuse · element=RazborReelPlayer Play · motion=yes · hide via `shouldShowFeedPlay` (C-52)
- Workspace: `showDraftsButton` / `showRazborButton` / `RazborModal` always on; CapCut editor still `isCapCutModule`
- Mesh: `createMeshSeed(pipelineId)` per `MESH_PIPELINE_IDS` (7 graphs); Router inside selected pipeline; TopBar EN KPI left for C-54
- Motion: tab pill `layoutId` + graph enter `scale(0.97)`/`opacity` spring `{ damping: 26, stiffness: 300 }`; `defaultEdgeOptions` PulseEdge; `useReducedMotion` → duration 0 / no scale; graphs/RBAC untouched
