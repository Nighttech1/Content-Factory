/**
 * Sprint 3 executable guards for C-07 / C-08 / C-09 (Agent Mesh).
 * Run: node scripts/sprint3-guards.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    fails.push(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

const canvas = read("components/mesh/AgentMeshCanvas.tsx");
const page = read("app/admin/mesh/page.tsx");
const seed = read("lib/mesh-seed.ts");
const pulse = read("components/mesh/edges/PulseEdge.tsx");
const topbar = read("components/mesh/CanvasTopBar.tsx");
const sidebar = read("components/shell/SidebarNavigation.tsx");
const agent = read("components/mesh/nodes/AgentNode.tsx");
const router = read("components/mesh/nodes/RouterNode.tsx");
const queue = read("components/mesh/nodes/QueueNode.tsx");
const hitl = read("components/mesh/nodes/HITLNode.tsx");
const globals = read("app/globals.css");

// --- C-07 canvas shell ---
assert(canvas.includes("@xyflow/react"), "C-07: AgentMeshCanvas must use @xyflow/react");
assert(
  canvas.includes("BackgroundVariant.Dots") || canvas.includes("BackgroundVariant"),
  "C-07: dark Dots background required",
);
assert(canvas.includes("Controls"), "C-07: Controls missing");
assert(canvas.includes("MiniMap"), "C-07: MiniMap missing");
assert(
  canvas.includes('@xyflow/react/dist/style.css') ||
    page.includes('@xyflow/react/dist/style.css'),
  "C-07: xyflow CSS import missing",
);
assert(
  canvas.includes('data-testid="agent-mesh-canvas"'),
  'C-07: missing data-testid="agent-mesh-canvas"',
);
assert(
  page.includes('role === "ADMIN"') && page.includes('"/studio"'),
  "C-07: ADMIN must redirect to /studio",
);
assert(
  page.includes("AgentMeshCanvas"),
  "C-07: page must mount AgentMeshCanvas for OWNER",
);
assert(
  sidebar.includes("ownerOnly") && sidebar.includes("/admin/mesh"),
  "C-07 regress: Sidebar Canvas ownerOnly",
);

// --- C-08 nodes + seed ---
assert(agent.includes("AgentNode") || agent.includes("mesh-agent-node"), "C-08: AgentNode");
assert(router.includes("mesh-router-node") || router.includes("Router"), "C-08: RouterNode");
assert(queue.includes("mesh-queue-node") || queue.includes("Queue"), "C-08: QueueNode");
assert(hitl.includes("mesh-hitl-node") || hitl.includes("HITL"), "C-08: HITLNode");
assert(canvas.includes("nodeTypes"), "C-08: nodeTypes wired");
const seedIds = [
  "researcher",
  "hook",
  "script",
  "router",
  "queue",
  "designer",
  "hitl",
  "publisher",
  "analyst",
];
for (const id of seedIds) {
  assert(seed.includes(`"${id}"`) || seed.includes(`'${id}'`), `C-08: seed missing node ${id}`);
}
assert(seed.includes("createMeshSeed"), "C-08: createMeshSeed export");

// --- C-09 PulseEdge + TopBar ---
assert(pulse.includes("PulseEdge") && pulse.includes("getBezierPath"), "C-09: PulseEdge bezier");
assert(canvas.includes("edgeTypes") && canvas.includes("pulse"), "C-09: edgeTypes pulse");
assert(seed.includes('type: "pulse"') || seed.includes("type: 'pulse'"), "C-09: seed edges type pulse");
assert(topbar.includes('data-testid="mesh-topbar"'), "C-09: TopBar testid");
assert(topbar.includes("Задачи") && topbar.includes("Задержка"), "C-09/C-54: KPI labels RU");
assert(
  !topbar.includes('data-testid="mesh-add-module"') &&
    !canvas.includes("mesh-add-module") &&
    !canvas.includes("onAddModule"),
  "C-58: no mesh-add-module / onAddModule (C-09 add superseded)",
);
assert(
  canvas.includes("nodesDraggable={false}") &&
    canvas.includes("nodesConnectable={false}"),
  "C-58: view-only nodes (no drag, no connect)",
);
assert(!canvas.includes("onConnect"), "C-58: no user onConnect");
assert(
  globals.includes("mesh-pulse-edge") || pulse.includes("mesh-pulse-edge"),
  "C-09: pulse edge class/animation",
);

if (fails.length) {
  console.error("sprint3-guards: RED");
  for (const f of fails) console.error(" -", f);
  process.exit(1);
}
console.log("sprint3-guards: GREEN (C-07, C-08, C-09)");
