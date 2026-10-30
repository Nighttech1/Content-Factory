# C-137 Frontend decisions

- `21st=reuse` · element=inspector drawer · motion=yes — NeonBadge + glass elevated panel + framer-motion translateX (existing Dark Luxury chrome); MultiButton pipeline switcher kept, navigates `/studio/[id]/mesh`
- Engine: new `@xyflow/react` view-layer under `components/mesh/v2/` (not patch of AgentMeshCanvas)
- State: zustand `useMeshAgentStore` + localStorage `cf.mesh.agents.v1:<pipelineId>`; Save also writes `cf.settings.agentPacks.v1` overrides
- Settings-safe extract: `lib/mesh-roles.ts`
