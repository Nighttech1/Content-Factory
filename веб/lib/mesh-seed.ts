/**
 * C-139 — compatibility shim (no @xyflow graph).
 * Pipeline ids / labels live in `lib/mesh-roles.ts`.
 * Prefer importing mesh-roles / mesh/* directly in new code.
 */

export {
  MESH_PIPELINE_IDS,
  MESH_PIPELINE_LABELS,
  copywriterPackId,
  isMeshPipelineId,
  laneAModeFor,
  type AgentRoleKind,
  type LaneAMode,
  type MeshPipelineId,
} from "@/lib/mesh-roles";

export { seedAgentsForPipeline } from "@/lib/mesh/agent-defaults";

/** @deprecated C-139 static flowchart — no xyflow node type. */
export const MESH_NODE_TYPES_AGENT = "staticAgent" as const;

/** @deprecated Use MeshAgent — kept for smoke scripts. */
export type AgentNodeData = {
  label: string;
  name: string;
  status: string;
  tasks: number;
  avatar: string;
  description: string;
  skills: string[];
  completedJobs: number;
  packId?: string;
  roleKind?: import("@/lib/mesh-roles").AgentRoleKind;
  userRequest?: string;
};

/** @deprecated Legacy node type bag — Router/Queue/HITL removed from product path. */
export type RouterNodeData = { label: string; routes: string[] };
export type QueueNodeData = {
  label: string;
  active: number;
  waiting: number;
  delayed: number;
};
export type HITLNodeData = { label: string; awaiting: number };
export type PulseEdgeData = {
  handoff?: string | null;
  dashed?: boolean;
  ariaLabel?: string;
};

export const MESH_NODE_TYPES = {
  agent: "staticAgent",
  router: "router",
  queue: "queue",
  hitl: "hitl",
} as const;

/**
 * Legacy smoke helper — returns empty xyflow-shaped stub.
 * Product path uses `seedAgentsForPipeline` + static flowchart.
 */
export function createMeshSeed(
  _pipelineId: string = "carousel-engine",
): { nodes: { id: string; type?: string; data?: unknown }[]; edges: unknown[] } {
  return { nodes: [], edges: [] };
}
